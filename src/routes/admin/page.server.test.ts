import { isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

describe('GET /admin (load)', () => {
	it('redirects signed-out visitors to /login', () => {
		try {
			load({ locals: { user: null } } as never);
			throw new Error('expected a redirect to be thrown');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
			if (isRedirect(e)) expect(e.status).toBe(303);
		}
	});

	it('403s a signed-in non-admin', () => {
		try {
			load({ locals: { user: nonAdmin } } as never);
			throw new Error('expected an error to be thrown');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(403);
		}
	});

	it('returns the command-center shape for an admin', () => {
		const result = load({ locals: { user: admin } } as never) as {
			mrr: { mrrEur: number; activeCount: number; priceEur: number };
			subscribers: { active: number; grace: number; free: number };
			aiSpend: { usedUsd: number; budgetUsd: number };
			signupTrend: unknown[];
			aiSpendTrend: unknown[];
			recentSignups: unknown[];
		};
		expect(typeof result.mrr.mrrEur).toBe('number');
		expect(typeof result.subscribers.active).toBe('number');
		expect(typeof result.aiSpend.budgetUsd).toBe('number');
		expect(result.signupTrend.length).toBeGreaterThan(0);
		expect(result.aiSpendTrend.length).toBeGreaterThan(0);
		expect(Array.isArray(result.recentSignups)).toBe(true);
	});
});
