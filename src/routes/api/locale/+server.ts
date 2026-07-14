import { json } from '@sveltejs/kit';
import { isLocale, rememberLocale } from '$lib/i18n';
import { setUserLocale } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/** Cookie-based locale switch for authenticated chrome (dashboard/editor/admin/
 *  account) — deliberately no URL-prefix variant there, see LanguageSwitcher's
 *  `variant="cookie"`. Also persists to `users.locale` when signed in. */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const body = await request.json().catch(() => null);
	const locale =
		body && typeof body === 'object' ? (body as { locale?: unknown }).locale : undefined;
	if (!isLocale(locale)) return json({ ok: false, message: 'Unknown locale.' }, { status: 400 });
	rememberLocale(cookies, locale);
	if (locals.user) setUserLocale(locals.user.id, locale);
	return json({ ok: true, locale });
};
