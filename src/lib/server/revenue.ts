import { desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { aiUsage, sites, users } from '$lib/server/db/schema';
import { getSetting } from '$lib/server/config';
import { siteSubscriptionState } from '$lib/server/billing';

/**
 * Business/revenue overview for the /admin command-center landing. MRR has NO
 * per-tier breakdown — Premium isn't an enforced tier in code yet. Pro is
 * site-scoped, so this is strictly `active Pro site count × one configured price`.
 */

export function proPriceEur(): number {
	const parsed = Number(getSetting('PRO_PRICE_EUR'));
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 17;
}

export type SubscriberCounts = { active: number; grace: number; free: number };

export function subscriberCounts(): SubscriberCounts {
	const rows = db.select({ id: sites.id, ownerUserId: sites.ownerUserId }).from(sites).all();
	const counts: SubscriberCounts = { active: 0, grace: 0, free: 0 };
	for (const row of rows) {
		if (!row.ownerUserId) {
			counts.free += 1;
			continue;
		}
		const state = siteSubscriptionState(row.id, row.ownerUserId).state;
		counts[state] += 1;
	}
	return counts;
}

export function mrrEur(): { mrrEur: number; activeCount: number; priceEur: number } {
	const priceEur = proPriceEur();
	const { active } = subscriberCounts();
	return { mrrEur: active * priceEur, activeCount: active, priceEur };
}

/** 'YYYY-MM' labels for the last `months`, oldest first, ending at the current month. */
function monthLabels(months: number): string[] {
	const labels: string[] = [];
	const now = new Date();
	for (let i = months - 1; i >= 0; i--) {
		const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
		labels.push(d.toISOString().slice(0, 7));
	}
	return labels;
}

export type TrendPoint = { month: string; value: number };

/** Signups per month, zero-filled — `users.createdAt` stores epoch seconds. */
export function signupTrend(months = 6): TrendPoint[] {
	const rows = db
		.select({
			month: sql<string>`strftime('%Y-%m', ${users.createdAt}, 'unixepoch')`,
			n: sql<number>`count(*)`
		})
		.from(users)
		.groupBy(sql`strftime('%Y-%m', ${users.createdAt}, 'unixepoch')`)
		.all();
	const byMonth = new Map(rows.map((r) => [r.month, r.n]));
	return monthLabels(months).map((month) => ({ month, value: byMonth.get(month) ?? 0 }));
}

/** Total estimated AI $ spend per month across all tenants, zero-filled. */
export function aiSpendTrend(months = 6): TrendPoint[] {
	const rows = db
		.select({
			month: aiUsage.month,
			total: sql<number>`coalesce(sum(${aiUsage.estimatedCostMicrousd}), 0)`
		})
		.from(aiUsage)
		.groupBy(aiUsage.month)
		.all();
	const byMonth = new Map(rows.map((r) => [r.month, r.total / 1_000_000]));
	return monthLabels(months).map((month) => ({ month, value: byMonth.get(month) ?? 0 }));
}

/** Most recent signups, for a "recent customers" glance — not the full list (see /admin/customers). */
export function recentSignups(limit = 5) {
	return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).all();
}
