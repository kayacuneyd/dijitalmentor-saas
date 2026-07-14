import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import {
	detectLocale,
	LOCALE_COOKIE,
	localeFromPath,
	rememberLocale,
	stripLocale,
	withLocale
} from '$lib/i18n';
import { resolveHostReroute } from '$lib/hostRouting';
import { getSessionUser, isAdminEmail, SESSION_COOKIE } from '$lib/server/auth';
import { recordError, shouldRecordError } from '$lib/server/error-log';
import { getOwnerSessionUser, OWNER_SESSION_COOKIE } from '$lib/server/ownerAuth';
import { recordRequestProbe } from '$lib/server/requestProbes';

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

export const handle: Handle = async ({ event, resolve }) => {
	const owner = getOwnerSessionUser(event.cookies.get(OWNER_SESSION_COOKIE));
	const user = owner ?? getSessionUser(event.cookies.get(SESSION_COOKIE));
	event.locals.user = user ? { ...user, isAdmin: owner ? true : isAdminEmail(user.email) } : null;
	const pathLocale = localeFromPath(event.url.pathname);
	// Precedence: an explicit locale-prefixed URL always wins, then a saved account
	// preference (only ever written by the authenticated-chrome switcher — visiting
	// a stray locale-prefixed marketing link while logged in must not silently
	// change it), then the existing cookie/header/default chain.
	const locale =
		pathLocale ??
		event.locals.user?.locale ??
		detectLocale(
			event.request.headers.get('accept-language'),
			event.cookies.get(LOCALE_COOKIE),
			event.request.headers.get('cf-ipcountry') ?? event.request.headers.get('x-vercel-ip-country')
		);
	event.locals.locale = locale;
	event.locals.unprefixedPath = stripLocale(event.url.pathname);
	event.locals.isTenantHost = Boolean(resolveHostReroute(event.url, env.PUBLIC_APP_HOST));
	if (pathLocale) rememberLocale(event.cookies, pathLocale);

	if (!pathLocale && event.request.method === 'GET' && isLocalizedPublicPath(event.url.pathname)) {
		redirect(307, withLocale(locale, `${event.url.pathname}${event.url.search}`));
	}

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale)
	});
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	if (event.url.protocol === 'https:') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}
	return response;
};

export const handleError: HandleServerError = ({ error, event, status }) => {
	if (!shouldRecordError({ status })) {
		recordRequestProbe({
			pathname: event.url.pathname,
			status,
			userAgent: event.request.headers.get('user-agent'),
			clientAddress:
				event.request.headers.get('cf-connecting-ip') ??
				event.request.headers.get('x-forwarded-for') ??
				null
		});
		return {
			message: status === 404 ? 'Not found' : 'Something went wrong.'
		};
	}
	const errorId = recordError(error, {
		source: 'sveltekit',
		route: event.route.id ?? event.url.pathname,
		method: event.request.method,
		status,
		userId: event.locals.user?.id
	});
	return {
		message: `Something went wrong. Error reference: ${errorId}`,
		errorId
	};
};
