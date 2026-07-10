import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { aiUsage } from '$lib/server/db/schema';
import { clearSetting, setSetting } from '$lib/server/config';
import { activateSiteSubscription } from '$lib/server/billing';
import { saveDraft } from '$lib/server/db/repo';
import { seedSites } from '$lib/seed';
import {
	aiSpendTrend,
	mrrEur,
	proPriceEur,
	recentSignups,
	signupTrend,
	subscriberCounts
} from './revenue';

describe('proPriceEur', () => {
	it('defaults to 17 and is settings-overridable', () => {
		expect(proPriceEur()).toBe(17);
		setSetting('PRO_PRICE_EUR', '19');
		try {
			expect(proPriceEur()).toBe(19);
		} finally {
			clearSetting('PRO_PRICE_EUR');
		}
	});
});

describe('subscriberCounts / mrrEur', () => {
	it('buckets free/active/grace Pro sites and computes MRR from active site count only', () => {
		const before = subscriberCounts();
		const freeUser = getOrCreateUser('revenue-free@example.com');
		const freeSite = structuredClone(seedSites.law);
		freeSite.id = `site-revenue-free-${Date.now()}`;
		freeSite.tenantId = `tenant-${freeSite.id}`;
		saveDraft(freeSite, { ownerUserId: freeUser.id });

		const activeUser = getOrCreateUser('revenue-active@example.com');
		const activeSite = structuredClone(seedSites.psych);
		activeSite.id = `site-revenue-active-${Date.now()}`;
		activeSite.tenantId = `tenant-${activeSite.id}`;
		saveDraft(activeSite, { ownerUserId: activeUser.id });
		activateSiteSubscription({
			siteId: activeSite.id,
			userId: activeUser.id,
			provider: 'manual',
			status: 'active'
		});

		const graceUser = getOrCreateUser('revenue-grace@example.com');
		const graceSite = structuredClone(seedSites.dental);
		graceSite.id = `site-revenue-grace-${Date.now()}`;
		graceSite.tenantId = `tenant-${graceSite.id}`;
		saveDraft(graceSite, { ownerUserId: graceUser.id });
		activateSiteSubscription({
			siteId: graceSite.id,
			userId: graceUser.id,
			provider: 'manual',
			status: 'canceled',
			currentPeriodEnd: new Date(Date.now() - 5 * 86_400_000)
		}); // inside grace

		const after = subscriberCounts();
		expect(after.free).toBe(before.free + 1);
		expect(after.active).toBe(before.active + 1);
		expect(after.grace).toBe(before.grace + 1);

		const mrr = mrrEur();
		expect(mrr.activeCount).toBe(after.active);
		expect(mrr.priceEur).toBe(17);
		expect(mrr.mrrEur).toBe(after.active * 17);
	});
});

describe('signupTrend / aiSpendTrend', () => {
	it('zero-fills months with no data and includes the current month', () => {
		const trend = signupTrend(3);
		expect(trend).toHaveLength(3);
		const currentMonth = new Date().toISOString().slice(0, 7);
		expect(trend[trend.length - 1].month).toBe(currentMonth);
		expect(trend.every((p) => typeof p.value === 'number')).toBe(true);
	});

	it('counts a real signup in the current month bucket', () => {
		const before = signupTrend(1)[0].value;
		getOrCreateUser(`revenue-trend-${Date.now()}@example.com`);
		const after = signupTrend(1)[0].value;
		expect(after).toBe(before + 1);
	});

	it('sums estimated AI spend for the current month', () => {
		const currentMonth = new Date().toISOString().slice(0, 7);
		const before = aiSpendTrend(1)[0].value;
		db.insert(aiUsage)
			.values({
				tenantId: 'tenant-revenue-trend-test',
				month: currentMonth,
				inputTokens: 0,
				outputTokens: 0,
				estimatedCostMicrousd: 2_000_000 // $2
			})
			.onConflictDoUpdate({
				target: [aiUsage.tenantId, aiUsage.month],
				set: { estimatedCostMicrousd: 2_000_000 }
			})
			.run();
		const after = aiSpendTrend(1)[0].value;
		expect(after).toBeGreaterThanOrEqual(before + 2);
	});
});

describe('recentSignups', () => {
	it('respects the limit and orders newest-first (createdAt non-increasing)', () => {
		getOrCreateUser(`revenue-recent-a-${Date.now()}@example.com`);
		getOrCreateUser(`revenue-recent-b-${Date.now()}@example.com`);
		const recent = recentSignups(2);
		expect(recent).toHaveLength(2);
		expect(recent[0].createdAt.getTime()).toBeGreaterThanOrEqual(recent[1].createdAt.getTime());
		expect(recentSignups(1)).toHaveLength(1);
	});
});
