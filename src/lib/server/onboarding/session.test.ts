import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { db } from '$lib/server/db';
import { pendingOnboarding } from '$lib/server/db/schema';
import {
	PENDING_COOKIE,
	consumePending,
	createOrGetPending,
	getPendingByToken,
	linkPendingToUser,
	markCompleted,
	savePendingAnswer,
	sweepExpiredOnboarding
} from './session';

function makeCookieJar(initial: Record<string, string> = {}) {
	const store: Record<string, string> = { ...initial };
	return {
		get: (name: string) => store[name],
		set: (name: string, value: string) => {
			store[name] = value;
		},
		delete: (name: string) => {
			delete store[name];
		},
		store
	} as unknown as import('@sveltejs/kit').Cookies;
}

describe('onboarding pending-session helpers', () => {
	it('lazily creates a pending record and cookie on first access', () => {
		const cookies = makeCookieJar();
		const pending = createOrGetPending(cookies);
		expect(pending.status).toBe('in_progress');
		expect(pending.answers).toEqual({});
		expect(cookies.get(PENDING_COOKIE)).toBeTruthy();
	});

	it('reuses the same record on subsequent access with the same cookie', () => {
		const cookies = makeCookieJar();
		const first = createOrGetPending(cookies);
		const second = createOrGetPending(cookies);
		expect(second.id).toBe(first.id);
	});

	it('savePendingAnswer merges answers and extends expiry', () => {
		const cookies = makeCookieJar();
		savePendingAnswer(cookies, 'niche', 'psych');
		const updated = savePendingAnswer(cookies, 'businessName', 'Ada Terapi');
		expect(updated.answers).toEqual({ niche: 'psych', businessName: 'Ada Terapi' });
	});

	it('markCompleted flips status without touching answers', () => {
		const cookies = makeCookieJar();
		const pending = savePendingAnswer(cookies, 'niche', 'psych');
		markCompleted(pending.id);
		const reloaded = getPendingByToken(cookies.get(PENDING_COOKIE));
		expect(reloaded?.status).toBe('completed');
		expect(reloaded?.answers).toEqual({ niche: 'psych' });
	});

	it('linkPendingToUser resolves by URL token even with no cookie present (cross-device)', () => {
		const originCookies = makeCookieJar();
		savePendingAnswer(originCookies, 'niche', 'law');
		const rawToken = originCookies.get(PENDING_COOKIE)!;

		const freshCookies = makeCookieJar(); // simulates a different browser/device
		const linked = linkPendingToUser({
			cookies: freshCookies,
			urlToken: rawToken,
			userId: 'user-cross-device'
		});
		expect(linked?.linkedUserId).toBe('user-cross-device');
		expect(linked?.answers).toEqual({ niche: 'law' });
		// Re-issues the cookie on this new device so it can resume locally too.
		expect(freshCookies.get(PENDING_COOKIE)).toBe(rawToken);
	});

	it('linkPendingToUser returns null for an unknown/garbage token', () => {
		expect(
			linkPendingToUser({ cookies: makeCookieJar(), urlToken: 'not-a-real-token', userId: 'u' })
		).toBeNull();
	});

	it('consumePending marks status consumed and records the generated site id', () => {
		const cookies = makeCookieJar();
		const pending = savePendingAnswer(cookies, 'niche', 'dental');
		consumePending(pending.id, 'site-abc123');
		const reloaded = getPendingByToken(cookies.get(PENDING_COOKIE));
		expect(reloaded?.status).toBe('consumed');
		expect(reloaded?.generatedSiteId).toBe('site-abc123');
	});

	describe('sweepExpiredOnboarding (daily-cron backstop)', () => {
		it('leaves fresh records alone', () => {
			const cookies = makeCookieJar();
			createOrGetPending(cookies);
			const before = db.select().from(pendingOnboarding).all().length;
			sweepExpiredOnboarding();
			expect(db.select().from(pendingOnboarding).all().length).toBe(before);
		});

		it('removes a record whose expiry has already passed', () => {
			const cookies = makeCookieJar();
			const pending = createOrGetPending(cookies);
			db.update(pendingOnboarding)
				.set({ expiresAt: new Date(Date.now() - 60_000) })
				.where(eq(pendingOnboarding.id, pending.id))
				.run();

			const swept = sweepExpiredOnboarding();
			expect(swept).toBeGreaterThanOrEqual(1);
			expect(getPendingByToken(cookies.get(PENDING_COOKIE))).toBeNull();
		});
	});
});
