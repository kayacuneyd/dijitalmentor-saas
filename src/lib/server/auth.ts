import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { desc, eq, lt } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { betaInvites, loginTokens, sessions, users } from '$lib/server/db/schema';
import { getSetting } from '$lib/server/config';

/**
 * Magic-link auth (PLAN §8, pulled into M4 per the milestone list).
 * Raw tokens never touch the DB — only sha256 hashes are stored, so a DB leak
 * cannot be replayed as a login link or session cookie.
 * Sessions are DB-backed (revocable, dependency-free) instead of JWTs — see PROGRESS.
 */

const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_COOKIE = 'sk_session';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');

export type SessionUser = { id: string; email: string };

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/**
 * Super admins (comma-separated ADMIN_EMAILS env). Env-based, not DB, so the admin
 * gate can't be edited through the surface it protects. Shared by hooks.server.ts
 * and the beta gate (an admin is never locked out by closed beta).
 */
export function isAdminEmail(email: string): boolean {
	return (env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean)
		.includes(normalizeEmail(email));
}

// --- magic-link tokens ------------------------------------------------------

export function createLoginToken(email: string): string {
	const token = newToken();
	db.insert(loginTokens)
		.values({
			tokenHash: hash(token),
			email: normalizeEmail(email),
			expiresAt: new Date(Date.now() + LOGIN_TOKEN_TTL_MS)
		})
		.run();
	// opportunistic cleanup of expired tokens
	db.delete(loginTokens).where(lt(loginTokens.expiresAt, new Date())).run();
	return token;
}

/** Single-use: the token row is deleted on first successful consumption. */
export function consumeLoginToken(token: string): string | null {
	const row = db
		.select()
		.from(loginTokens)
		.where(eq(loginTokens.tokenHash, hash(token)))
		.get();
	if (!row) return null;
	db.delete(loginTokens)
		.where(eq(loginTokens.tokenHash, hash(token)))
		.run();
	if (row.expiresAt.getTime() < Date.now()) return null;
	return row.email;
}

// --- closed beta (beta-launch spec) -----------------------------------------

/** Whether closed-beta gating is active. When off, sign-in is open to everyone. */
export function betaModeOn(): boolean {
	return getSetting('BETA_MODE') === '1';
}

/**
 * Beta gate: with BETA_MODE off the door is open; with it on, the (normalized)
 * email must have a non-revoked invite. Checked both when sending the magic link
 * and when consuming it, so a revoke between the two closes the door.
 */
export function isBetaAllowed(email: string): boolean {
	if (!betaModeOn()) return true;
	if (isAdminEmail(email)) return true; // operators are never locked out by closed beta
	const row = db
		.select({ status: betaInvites.status })
		.from(betaInvites)
		.where(eq(betaInvites.email, normalizeEmail(email)))
		.get();
	return Boolean(row && row.status !== 'revoked');
}

export type BetaInvite = {
	email: string;
	profession: string | null;
	status: string;
	notes: string | null;
	invitedAt: Date;
	joinedAt: Date | null;
};

export function listInvites(): BetaInvite[] {
	return db.select().from(betaInvites).orderBy(desc(betaInvites.invitedAt)).all();
}

/** Idempotent upsert; re-inviting a revoked email reactivates it as 'invited'. */
export function addInvite(email: string, profession?: string, notes?: string): void {
	const normalized = normalizeEmail(email);
	db.insert(betaInvites)
		.values({
			email: normalized,
			profession: profession || null,
			notes: notes || null,
			status: 'invited',
			invitedAt: new Date()
		})
		.onConflictDoUpdate({
			target: betaInvites.email,
			set: { status: 'invited', profession: profession || null, notes: notes || null }
		})
		.run();
}

export function setInviteStatus(email: string, status: 'invited' | 'revoked'): void {
	db.update(betaInvites)
		.set({ status })
		.where(eq(betaInvites.email, normalizeEmail(email)))
		.run();
}

/** Flip an invite to 'joined' on first successful sign-in (best-effort telemetry). */
function recordInviteJoin(email: string): void {
	const normalized = normalizeEmail(email);
	const row = db
		.select({ status: betaInvites.status })
		.from(betaInvites)
		.where(eq(betaInvites.email, normalized))
		.get();
	if (row && row.status === 'invited') {
		db.update(betaInvites)
			.set({ status: 'joined', joinedAt: new Date() })
			.where(eq(betaInvites.email, normalized))
			.run();
	}
}

// --- users -------------------------------------------------------------------

/** First login doubles as sign-up. Flags the beta invite as joined when present. */
export function getOrCreateUser(email: string): SessionUser {
	recordInviteJoin(email);
	const normalized = normalizeEmail(email);
	const existing = db.select().from(users).where(eq(users.email, normalized)).get();
	if (existing) return { id: existing.id, email: existing.email };
	const user = { id: `user-${randomUUID().slice(0, 8)}`, email: normalized };
	db.insert(users)
		.values({ ...user, createdAt: new Date() })
		.run();
	return user;
}

// --- sessions ----------------------------------------------------------------

export function createSession(userId: string): string {
	const token = newToken();
	db.insert(sessions)
		.values({ tokenHash: hash(token), userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) })
		.run();
	db.delete(sessions).where(lt(sessions.expiresAt, new Date())).run();
	return token;
}

export function getSessionUser(token: string | undefined): SessionUser | null {
	if (!token) return null;
	const session = db
		.select()
		.from(sessions)
		.where(eq(sessions.tokenHash, hash(token)))
		.get();
	if (!session || session.expiresAt.getTime() < Date.now()) return null;
	const user = db.select().from(users).where(eq(users.id, session.userId)).get();
	return user ? { id: user.id, email: user.email } : null;
}

export function destroySession(token: string | undefined): void {
	if (token)
		db.delete(sessions)
			.where(eq(sessions.tokenHash, hash(token)))
			.run();
}

export function setSessionCookie(cookies: Cookies, token: string): void {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_TTL_MS / 1000
	});
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

// --- authorization -------------------------------------------------------------

/**
 * Ownerless sites (the hand-authored seeds) stay open as public demos;
 * owned sites are manageable by their owner only.
 */
export function canManageSite(
	user: SessionUser | null,
	ownerUserId: string | null | undefined
): boolean {
	if (!ownerUserId) return true;
	return user?.id === ownerUserId;
}

// --- rate limiting (single-process; fine behind PM2 fork mode) ---------------

const attempts = new Map<string, { count: number; resetAt: number }>();

/** Sliding-window-ish limiter: `max` hits per `windowMs` per key. */
export function rateLimit(key: string, max = 5, windowMs = 60_000): boolean {
	const now = Date.now();
	const entry = attempts.get(key);
	if (!entry || entry.resetAt < now) {
		attempts.set(key, { count: 1, resetAt: now + windowMs });
		return true;
	}
	entry.count += 1;
	return entry.count <= max;
}
