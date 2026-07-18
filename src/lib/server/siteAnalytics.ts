import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { siteConversionStats } from '$lib/server/db/schema';

const EVENTS = ['contact_submitted', 'cta_clicked'] as const;
export type SiteConversionEvent = (typeof EVENTS)[number];

function day(date = new Date()): string {
	return date.toISOString().slice(0, 10);
}

export function recordConversion(input: {
	siteId: string;
	event: SiteConversionEvent;
	date?: Date;
}): void {
	db.insert(siteConversionStats)
		.values({ siteId: input.siteId, day: day(input.date), event: input.event, count: 1 })
		.onConflictDoUpdate({
			target: [siteConversionStats.siteId, siteConversionStats.day, siteConversionStats.event],
			set: { count: sql`${siteConversionStats.count} + 1` }
		})
		.run();
}

export function conversionSummary(siteId: string, days = 30, now = new Date()) {
	const since = day(new Date(now.getTime() - Math.max(1, days) * 86_400_000));
	const rows = db
		.select()
		.from(siteConversionStats)
		.where(and(eq(siteConversionStats.siteId, siteId), gte(siteConversionStats.day, since)))
		.all();
	return EVENTS.map((event) => ({
		event,
		count: rows.filter((row) => row.event === event).reduce((sum, row) => sum + row.count, 0)
	}));
}
