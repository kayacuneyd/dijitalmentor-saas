import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { siteVisitStats } from '$lib/server/db/schema';

function utcDay(date = new Date()): string {
	return date.toISOString().slice(0, 10);
}

/** Record one public page view without creating a visitor identity. */
export function recordSiteVisit(input: {
	siteId: string;
	locale: string;
	pageSlug: string;
	date?: Date;
}): void {
	const day = utcDay(input.date);
	db.insert(siteVisitStats)
		.values({
			siteId: input.siteId,
			day,
			locale: input.locale,
			pageSlug: input.pageSlug,
			visits: 1
		})
		.onConflictDoUpdate({
			target: [
				siteVisitStats.siteId,
				siteVisitStats.day,
				siteVisitStats.locale,
				siteVisitStats.pageSlug
			],
			set: { visits: sql`${siteVisitStats.visits} + 1` }
		})
		.run();
}

export type SiteVisitSummary = {
	total: number;
	byDay: { day: string; visits: number }[];
	bySite: { siteId: string; visits: number }[];
};

/** Admin-only aggregate for the last `days` UTC days, zero-identifying by design. */
export function siteVisitSummary(days = 30, now = new Date()): SiteVisitSummary {
	const since = new Date(now.getTime() - Math.max(1, days) * 24 * 60 * 60 * 1000);
	const rows = db
		.select()
		.from(siteVisitStats)
		.where(gte(siteVisitStats.day, utcDay(since)))
		.all();
	const byDay = new Map<string, number>();
	const bySite = new Map<string, number>();
	for (const row of rows) {
		byDay.set(row.day, (byDay.get(row.day) ?? 0) + row.visits);
		bySite.set(row.siteId, (bySite.get(row.siteId) ?? 0) + row.visits);
	}
	return {
		total: rows.reduce((sum, row) => sum + row.visits, 0),
		byDay: [...byDay.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([day, visits]) => ({ day, visits })),
		bySite: [...bySite.entries()]
			.sort(([, a], [, b]) => b - a)
			.map(([siteId, visits]) => ({ siteId, visits }))
	};
}
