import type { Reroute } from '@sveltejs/kit';
import { localeFromPath, stripLocale } from '$lib/i18n';

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
	'/profile/start'
]);
const LOCALIZED_PREFIXES = ['/legal', '/blog'];

function isLocalizedPublicPath(pathname: string): boolean {
	if (LOCALIZED_PUBLIC_PATHS.has(pathname)) return true;
	return LOCALIZED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

export const reroute: Reroute = ({ url }) => {
	const locale = localeFromPath(url.pathname);
	if (!locale) return;
	const stripped = stripLocale(url.pathname);
	if (isLocalizedPublicPath(stripped)) return stripped;
};
