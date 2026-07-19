import type { LayoutServerLoad } from './$types';
import { getSetting } from '$lib/server/config';
import { getMessageOverrides } from '$lib/server/messageOverrides';
import { getPlatformBranding } from '$lib/server/branding';
import { getPublicCopyOverridesForLocale } from '$lib/server/publicCopy';
import { listPublicLocales } from '$lib/server/publicLocales';

function gaMeasurementId(): string | null {
	const value = getSetting('GA_MEASUREMENT_ID')?.trim();
	return value && /^G-[A-Z0-9]+$/i.test(value) ? value : null;
}

/** Expose session and locale context to every page. */
export const load: LayoutServerLoad = ({ locals, url }) => ({
	user: locals.user,
	locale: locals.locale,
	publicLocale: locals.publicLocale,
	unprefixedPath: locals.unprefixedPath,
	isTenantHost: locals.isTenantHost,
	// Tenant-hosted requests render the customer's own published site, never
	// saaskaya's own chrome — skip the lookup entirely there.
	messageOverrides: locals.isTenantHost ? {} : getMessageOverrides(locals.locale),
	publicCopy: locals.isTenantHost
		? {}
		: getPublicCopyOverridesForLocale(locals.publicLocale, {
				includeDrafts:
					Boolean(locals.user?.isAdmin) && url.searchParams.get('contentPreview') === '1'
			}),
	publicLocales: locals.isTenantHost ? [] : listPublicLocales(),
	gaMeasurementId: gaMeasurementId(),
	googleSiteVerification: getSetting('GOOGLE_SITE_VERIFICATION')?.trim() || null,
	platformBranding: locals.isTenantHost ? null : getPlatformBranding()
});
