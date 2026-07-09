import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { clearSetting, setSetting } from '$lib/server/config';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { QuotaExceededError } from './llm';
import {
	assertWithinQuota,
	creditLimits,
	getMonthlyUsage,
	grantAiTopUp,
	recordUsage,
	tenantIdForUser,
	tenantMonthlyBudgetMicrousd
} from './usage';

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

describe('tenantIdForUser', () => {
	it('is the single place the tenant-<userId> format is constructed', () => {
		expect(tenantIdForUser('abc123')).toBe('tenant-abc123');
	});
});

describe('per-tenant monthly $ budget cap (real-dollar safety net alongside credit limits)', () => {
	it('defaults to $1 for Free and $4 for Pro', () => {
		expect(tenantMonthlyBudgetMicrousd(undefined)).toBe(1_000_000);
		const pro = getOrCreateUser('pro-dollarcap@example.com');
		db.update(users).set({ subscriptionStatus: 'active' }).where(eq(users.id, pro.id)).run();
		expect(tenantMonthlyBudgetMicrousd(pro.id)).toBe(4_000_000);
	});

	it('is settings-overridable per tier', () => {
		setSetting('AI_BUDGET_FREE_USD', '0.5');
		try {
			expect(tenantMonthlyBudgetMicrousd(undefined)).toBe(500_000);
		} finally {
			clearSetting('AI_BUDGET_FREE_USD');
		}
	});

	it('throws once real spend reaches the tenant $ cap, independent of tokens/credits', () => {
		setSetting('AI_BUDGET_FREE_USD', '0.000001'); // $0.000001 = 1 microusd
		setSetting('AI_GLOBAL_MONTHLY_BUDGET_USD', '1000'); // keep the global backstop out of the way
		setSetting('AI_MONTHLY_TOKEN_LIMIT', '10000000'); // keep the token backstop out of the way
		try {
			recordUsage('t-dollarcap-free', {
				inputTokens: 0,
				outputTokens: 0,
				estimatedCostMicrousd: 1
			});
			expect(() => assertWithinQuota('t-dollarcap-free', { kind: 'edit' })).toThrow(
				/monthly AI \$ cap/
			);
		} finally {
			clearSetting('AI_BUDGET_FREE_USD');
			clearSetting('AI_GLOBAL_MONTHLY_BUDGET_USD');
			clearSetting('AI_MONTHLY_TOKEN_LIMIT');
		}
	});

	it('gives a subscriber the higher Pro $ cap, not the Free one', () => {
		setSetting('AI_BUDGET_FREE_USD', '0.000001');
		setSetting('AI_BUDGET_PRO_USD', '1000');
		setSetting('AI_GLOBAL_MONTHLY_BUDGET_USD', '1000');
		setSetting('AI_MONTHLY_TOKEN_LIMIT', '10000000');
		try {
			const pro = getOrCreateUser('pro-dollarcap-2@example.com');
			db.update(users).set({ subscriptionStatus: 'active' }).where(eq(users.id, pro.id)).run();
			const tenantId = tenantIdForUser(pro.id);
			recordUsage(tenantId, { inputTokens: 0, outputTokens: 0, estimatedCostMicrousd: 1 });
			expect(() =>
				assertWithinQuota(tenantId, { kind: 'edit', ownerUserId: pro.id })
			).not.toThrow();
		} finally {
			clearSetting('AI_BUDGET_FREE_USD');
			clearSetting('AI_BUDGET_PRO_USD');
			clearSetting('AI_GLOBAL_MONTHLY_BUDGET_USD');
			clearSetting('AI_MONTHLY_TOKEN_LIMIT');
		}
	});

	it('is NOT bypassed by isAdmin — real provider $ is still spent for operator smoke tests', () => {
		setSetting('AI_BUDGET_FREE_USD', '0.000001');
		setSetting('AI_GLOBAL_MONTHLY_BUDGET_USD', '1000');
		setSetting('AI_MONTHLY_TOKEN_LIMIT', '10000000');
		try {
			recordUsage('t-dollarcap-admin', {
				inputTokens: 0,
				outputTokens: 0,
				estimatedCostMicrousd: 1
			});
			expect(() => assertWithinQuota('t-dollarcap-admin', { kind: 'edit', isAdmin: true })).toThrow(
				QuotaExceededError
			);
		} finally {
			clearSetting('AI_BUDGET_FREE_USD');
			clearSetting('AI_GLOBAL_MONTHLY_BUDGET_USD');
			clearSetting('AI_MONTHLY_TOKEN_LIMIT');
		}
	});
});

describe('grantAiTopUp (admin support gesture: /admin/customers)', () => {
	it('decrements counted usage, unblocking a previously-thrown assertWithinQuota call', () => {
		setSetting('AI_EDITS_FREE', '1');
		try {
			recordUsage('t-topup', tick, 'edit');
			expect(() => assertWithinQuota('t-topup', { kind: 'edit' })).toThrow(QuotaExceededError);
			grantAiTopUp('t-topup', { edits: 1 });
			expect(() => assertWithinQuota('t-topup', { kind: 'edit' })).not.toThrow();
		} finally {
			clearSetting('AI_EDITS_FREE');
		}
	});

	it('waives $ spend, unblocking the tenant $ cap too', () => {
		setSetting('AI_BUDGET_FREE_USD', '0.000001');
		setSetting('AI_GLOBAL_MONTHLY_BUDGET_USD', '1000');
		setSetting('AI_MONTHLY_TOKEN_LIMIT', '10000000');
		try {
			recordUsage('t-topup-usd', { inputTokens: 0, outputTokens: 0, estimatedCostMicrousd: 1 });
			expect(() => assertWithinQuota('t-topup-usd')).toThrow(/monthly AI \$ cap/);
			grantAiTopUp('t-topup-usd', { usdWaived: 0.000001 });
			expect(() => assertWithinQuota('t-topup-usd')).not.toThrow();
		} finally {
			clearSetting('AI_BUDGET_FREE_USD');
			clearSetting('AI_GLOBAL_MONTHLY_BUDGET_USD');
			clearSetting('AI_MONTHLY_TOKEN_LIMIT');
		}
	});

	it('works on a tenant with no existing ai_usage row this month', () => {
		grantAiTopUp('t-topup-fresh', { edits: 5 });
		expect(getMonthlyUsage('t-topup-fresh').editCount).toBe(-5); // enforcement reads this as headroom
	});
});
