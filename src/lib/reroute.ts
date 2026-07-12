import { localeFromPath, stripLocale } from '$lib/i18n';
import { resolveHostReroute } from '$lib/hostRouting';

const LOCALIZED_PUBLIC_PATHS = new Set([
	'/',
	'/pricing',
	'/templates',
	'/about',
	'/contact',
	'/blog',
	'/new',
	'/login',
	'/login/verify',
	'/beta',
	'/share',
	'/profile/start'
]);
const LOCALIZED_PREFIXES = ['/legal', '/blog'];

function isLocalizedPublicPath(pathname: string): boolean {
	if (LOCALIZED_PUBLIC_PATHS.has(pathname)) return true;
	return LOCALIZED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

export function resolveAppReroute(url: URL, appHost: string | undefined): string | undefined {
	const hostRoute = resolveHostReroute(url, appHost);
	if (hostRoute) return hostRoute;

	const locale = localeFromPath(url.pathname);
	if (!locale) return undefined;
	const stripped = stripLocale(url.pathname);
	return isLocalizedPublicPath(stripped) ? stripped : undefined;
}
