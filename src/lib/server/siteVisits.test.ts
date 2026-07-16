import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/server/db';
import { siteVisitStats } from '$lib/server/db/schema';
import { recordSiteVisit, siteVisitSummaryForSite } from './siteVisits';

describe('siteVisitSummaryForSite', () => {
	beforeEach(() => {
		db.delete(siteVisitStats).run();
	});

	it('returns only anonymous aggregates for the requested site', () => {
		const now = new Date('2026-07-16T12:00:00.000Z');
		recordSiteVisit({ siteId: 'site-a', locale: 'tr', pageSlug: 'home', date: now });
		recordSiteVisit({ siteId: 'site-a', locale: 'en', pageSlug: 'home', date: now });
		recordSiteVisit({ siteId: 'site-b', locale: 'tr', pageSlug: 'home', date: now });

		expect(siteVisitSummaryForSite('site-a', 30, now)).toMatchObject({ total: 2, days: 30 });
	});
});
