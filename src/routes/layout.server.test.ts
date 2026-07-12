import { afterEach, describe, expect, it } from 'vitest';
import { clearSetting, setSetting } from '$lib/server/config';
import { load } from './+layout.server';

describe('root layout settings', () => {
	afterEach(() => {
		clearSetting('GA_MEASUREMENT_ID');
		clearSetting('GOOGLE_SITE_VERIFICATION');
	});

	it('exposes validated GA and Search Console settings to the app layout', () => {
		setSetting('GA_MEASUREMENT_ID', 'G-ABC123XYZ');
		setSetting('GOOGLE_SITE_VERIFICATION', 'verification-token');

		const result = load({
			locals: { user: null, locale: 'tr', unprefixedPath: '/', isTenantHost: false }
		} as never) as { gaMeasurementId: string | null; googleSiteVerification: string | null };

		expect(result.gaMeasurementId).toBe('G-ABC123XYZ');
		expect(result.googleSiteVerification).toBe('verification-token');
	});

	it('does not expose malformed GA ids', () => {
		setSetting('GA_MEASUREMENT_ID', 'not-a-ga-id');
		const result = load({
			locals: { user: null, locale: 'tr', unprefixedPath: '/', isTenantHost: false }
		} as never) as { gaMeasurementId: string | null };

		expect(result.gaMeasurementId).toBeNull();
	});
});
