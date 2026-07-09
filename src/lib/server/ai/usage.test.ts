import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { clearSetting, setSetting } from '$lib/server/config';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { QuotaExceededError } from './llm';
import { assertWithinQuota, creditLimits, getMonthlyUsage, recordUsage } from './usage';

const tick = { inputTokens: 100, outputTokens: 50 };

describe('credit accounting (gatekeeper spec: plans limit credits, tokens are a backstop)', () => {
	it('records tokens without credits for gate calls, credits for L2 calls', () => {
		recordUsage('t-credits', tick); // gate: tokens only
		recordUsage('t-credits', tick, 'edit');
		recordUsage('t-credits', tick, 'generation');
		const usage = getMonthlyUsage('t-credits');
		expect(usage.inputTokens).toBe(300);
		expect(usage.editCount).toBe(1);
		expect(usage.generationCount).toBe(1);
	});

	it('gives Free limits to ownerless/unknown owners and Pro limits to subscribers', () => {
		expect(creditLimits(undefined)).toEqual({ edit: 10, generation: 1 });
		const pro = getOrCreateUser('pro-credits@example.com');
		db.update(users).set({ subscriptionStatus: 'active' }).where(eq(users.id, pro.id)).run();
		expect(creditLimits(pro.id)).toEqual({ edit: 50, generation: 5 });
	});

	it('throws once the plan credit limit is reached (settings-overridable)', () => {
		setSetting('AI_EDITS_FREE', '2');
		try {
			recordUsage('t-limit', tick, 'edit');
			expect(() => assertWithinQuota('t-limit', { kind: 'edit' })).not.toThrow();
			recordUsage('t-limit', tick, 'edit');
			expect(() => assertWithinQuota('t-limit', { kind: 'edit' })).toThrow(QuotaExceededError);
			// generations are a separate pool
			expect(() => assertWithinQuota('t-limit', { kind: 'generation' })).not.toThrow();
		} finally {
			clearSetting('AI_EDITS_FREE');
		}
	});

	it('lets admins bypass credit limits but never the token backstop', () => {
		setSetting('AI_EDITS_FREE', '1');
		setSetting('AI_MONTHLY_TOKEN_LIMIT', '200');
		try {
			recordUsage('t-admin', tick, 'edit');
			// credits spent → blocked for users, open for admins
			expect(() => assertWithinQuota('t-admin', { kind: 'edit' })).toThrow(QuotaExceededError);
			expect(() => assertWithinQuota('t-admin', { kind: 'edit', isAdmin: true })).not.toThrow();
			// backstop spent → blocked for everyone
			recordUsage('t-admin', tick);
			expect(() => assertWithinQuota('t-admin', { kind: 'edit', isAdmin: true })).toThrow(
				QuotaExceededError
			);
		} finally {
			clearSetting('AI_EDITS_FREE');
			clearSetting('AI_MONTHLY_TOKEN_LIMIT');
		}
	});

	it('enforces the global monthly estimated-cost backstop', () => {
		setSetting('AI_GLOBAL_MONTHLY_BUDGET_USD', '0.000001');
		try {
			recordUsage('t-global-cost', {
				inputTokens: 1,
				outputTokens: 1,
				estimatedCostMicrousd: 1
			});
			expect(() => assertWithinQuota('another-tenant')).toThrow(/beta AI budget/);
		} finally {
			clearSetting('AI_GLOBAL_MONTHLY_BUDGET_USD');
		}
	});
});
