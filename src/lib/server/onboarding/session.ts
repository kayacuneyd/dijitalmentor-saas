import { createHash, randomBytes } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pendingOnboarding } from '$lib/server/db/schema';
import type { OnboardingAnswers } from '$lib/onboarding/questions';

/**
 * Anonymous session for the guided onboarding Q&A (Hostinger Horizons roadmap
 * Phase 2). Structurally separate from `sk_session`/auth.ts: this cookie never
 * grants `locals.user`, site-management, or AI-editing capability — it only ever
 * unlocks read/write on the one pending record it identifies. Raw tokens never
 * touch the DB, only their sha256 hash, matching the login-token/session convention
 * in `$lib/server/auth`.
 */

export const PENDING_COOKIE = 'sk_pending';
const PENDING_TTL_MS = 48 * 60 * 60 * 1000; // 48h, sliding on every write

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');

export type PendingStatus = 'in_progress' | 'completed' | 'consumed';

export type PendingRecord = {
	id: string;
	currentStep: number;
	answers: OnboardingAnswers;
	status: PendingStatus;
	linkedUserId: string | null;
	generatedSiteId: string | null;
};

function setCookie(cookies: Cookies, token: string): void {
	cookies.set(PENDING_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: PENDING_TTL_MS / 1000
	});
}

function rowToRecord(row: typeof pendingOnboarding.$inferSelect): PendingRecord {
	return {
		id: row.id,
		currentStep: row.currentStep,
		answers: (row.answers ?? {}) as OnboardingAnswers,
		status: row.status as PendingStatus,
		linkedUserId: row.linkedUserId,
		generatedSiteId: row.generatedSiteId
	};
}

/** Resolves a pending record from a raw token (cookie value or magic-link URL param). */
export function getPendingByToken(token: string | undefined | null): PendingRecord | null {
	if (!token) return null;
	const row = db
		.select()
		.from(pendingOnboarding)
		.where(eq(pendingOnboarding.tokenHash, hash(token)))
		.get();
	if (!row) return null;
	if (row.expiresAt.getTime() < Date.now()) return null;
	return rowToRecord(row);
}

/** Lazily creates a pending row + `sk_pending` cookie if none exists yet. */
export function createOrGetPending(cookies: Cookies): PendingRecord {
	const existing = getPendingByToken(cookies.get(PENDING_COOKIE));
	if (existing) return existing;

	const token = newToken();
	const id = `pending-${randomBytes(4).toString('hex')}`;
	const now = new Date();
	db.insert(pendingOnboarding)
		.values({
			id,
			tokenHash: hash(token),
			currentStep: 0,
			answers: {},
			status: 'in_progress',
			createdAt: now,
			updatedAt: now,
			expiresAt: new Date(now.getTime() + PENDING_TTL_MS)
		})
		.run();
	// Opportunistic cleanup, same idiom as createLoginToken/createSession.
	db.delete(pendingOnboarding).where(lt(pendingOnboarding.expiresAt, now)).run();
	setCookie(cookies, token);
	return {
		id,
		currentStep: 0,
		answers: {},
		status: 'in_progress',
		linkedUserId: null,
		generatedSiteId: null
	};
}

/** Saves one answer, extends the sliding expiry, and returns the updated record. */
export function savePendingAnswer(
	cookies: Cookies,
	questionId: string,
	value: unknown
): PendingRecord {
	const pending = createOrGetPending(cookies);
	const answers = { ...pending.answers, [questionId]: value };
	const now = new Date();
	db.update(pendingOnboarding)
		.set({ answers, updatedAt: now, expiresAt: new Date(now.getTime() + PENDING_TTL_MS) })
		.where(eq(pendingOnboarding.id, pending.id))
		.run();
	return { ...pending, answers };
}

export function markCompleted(id: string): void {
	db.update(pendingOnboarding)
		.set({ status: 'completed', updatedAt: new Date() })
		.where(eq(pendingOnboarding.id, id))
		.run();
}

/**
 * Resolves the pending record from either the magic-link URL token (preferred —
 * works cross-device, since it travels in the emailed link itself) or the
 * `sk_pending` cookie (same-browser fast path), and claims it for a just-verified
 * user. Re-issues the cookie so a cross-device open still leaves this browser able
 * to resume the flow.
 */
export function linkPendingToUser(params: {
	cookies: Cookies;
	urlToken?: string | null;
	userId: string;
}): PendingRecord | null {
	const token = params.urlToken || params.cookies.get(PENDING_COOKIE);
	const pending = getPendingByToken(token);
	if (!pending) return null;
	db.update(pendingOnboarding)
		.set({ linkedUserId: params.userId, updatedAt: new Date() })
		.where(eq(pendingOnboarding.id, pending.id))
		.run();
	if (token) setCookie(params.cookies, token);
	return { ...pending, linkedUserId: params.userId };
}

/** Marks a pending record consumed once /api/onboarding/finish hands off the description. */
export function consumePending(id: string, generatedSiteId?: string): void {
	db.update(pendingOnboarding)
		.set({ status: 'consumed', generatedSiteId: generatedSiteId ?? null, updatedAt: new Date() })
		.where(eq(pendingOnboarding.id, id))
		.run();
}

/** Daily-cron backstop for abandoned/expired pending records. */
export function sweepExpiredOnboarding(): number {
	return db.delete(pendingOnboarding).where(lt(pendingOnboarding.expiresAt, new Date())).run()
		.changes;
}
