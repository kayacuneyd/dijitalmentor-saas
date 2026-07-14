import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { betaModeOn, createLoginToken, isBetaAllowed, rateLimit } from '$lib/server/auth';
import { sendMagicLink } from '$lib/server/email';
import { PENDING_COOKIE } from '$lib/server/onboarding/session';
import { withLocale } from '$lib/i18n';
import { serverTranslator } from '$lib/server/messageOverrides';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, '/dashboard');
	const email = z.email().safeParse(url.searchParams.get('email'));
	return { betaMode: betaModeOn(), email: email.success ? email.data : '', locale: locals.locale };
};

export const actions: Actions = {
	default: async ({ request, url, cookies, getClientAddress, locals }) => {
		const t = serverTranslator(locals.locale);
		if (!rateLimit(`login:${getClientAddress()}`, 5, 60_000)) {
			return fail(429, { message: t('auth.tooManyAttempts') });
		}
		const form = await request.formData();
		const email = z.email().safeParse(
			String(form.get('email') ?? '')
				.trim()
				.toLowerCase()
		);
		if (!email.success) {
			return fail(400, { message: t('auth.invalidEmail') });
		}
		// Closed beta: no link is created for a non-invited email. Same generic
		// "sent" response either way would leak the allowlist, so deny explicitly.
		if (!isBetaAllowed(email.data)) {
			return fail(403, { message: t('auth.betaDenied') });
		}
		const token = createLoginToken(email.data);
		// Carries the in-progress onboarding Q&A across the magic-link handoff so it
		// resumes even if the link is opened on a different device/browser than it
		// was sent from — same trust model as the login token itself (also emailed).
		const pendingToken = cookies.get(PENDING_COOKIE);
		const verifyPath = withLocale(locals.locale, '/login/verify');
		const link = pendingToken
			? `${url.origin}${verifyPath}?token=${token}&p=${encodeURIComponent(pendingToken)}`
			: `${url.origin}${verifyPath}?token=${token}`;
		const { devEchoLink } = await sendMagicLink(email.data, link, locals.locale);
		return { sent: true, email: email.data, devEchoLink };
	}
};
