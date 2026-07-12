import type { LayoutServerLoad } from './$types';
import { getSetting } from '$lib/server/config';

function gaMeasurementId(): string | null {
	const value = getSetting('GA_MEASUREMENT_ID')?.trim();
	return value && /^G-[A-Z0-9]+$/i.test(value) ? value : null;
}

/** Expose session and locale context to every page. */
export const load: LayoutServerLoad = ({ locals }) => ({
	user: locals.user,
	locale: locals.locale,
	unprefixedPath: locals.unprefixedPath,
	isTenantHost: locals.isTenantHost,
	gaMeasurementId: gaMeasurementId(),
	googleSiteVerification: getSetting('GOOGLE_SITE_VERIFICATION')?.trim() || null
});
