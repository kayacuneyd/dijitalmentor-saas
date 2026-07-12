import type { LayoutServerLoad } from './$types';

/** Expose session and locale context to every page. */
export const load: LayoutServerLoad = ({ locals }) => ({
	user: locals.user,
	locale: locals.locale,
	unprefixedPath: locals.unprefixedPath,
	isTenantHost: locals.isTenantHost
});
