import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '$lib/server/db';
import { siteConversionStats } from '$lib/server/db/schema';
import { conversionSummary, recordConversion } from './siteAnalytics';

describe('site analytics conversions', () => {
	beforeEach(() => db.delete(siteConversionStats).run());

	it('aggregates conversion events without storing visitor identity', () => {
		recordConversion({ siteId: 'analytics-site', event: 'contact_submitted' });
		recordConversion({ siteId: 'analytics-site', event: 'contact_submitted' });
		recordConversion({ siteId: 'analytics-site', event: 'cta_clicked' });

		expect(conversionSummary('analytics-site')).toEqual([
			{ event: 'contact_submitted', count: 2 },
			{ event: 'cta_clicked', count: 1 }
		]);
	});

	it('does not mix sites', () => {
		recordConversion({ siteId: 'one', event: 'contact_submitted' });
		recordConversion({ siteId: 'two', event: 'contact_submitted' });
		expect(conversionSummary('one').find((item) => item.event === 'contact_submitted')?.count).toBe(
			1
		);
	});
});
