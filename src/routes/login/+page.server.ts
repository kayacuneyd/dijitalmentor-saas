import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { betaModeOn, createLoginToken, isBetaAllowed, rateLimit } from '$lib/server/auth';
import { sendMagicLink } from '$lib/server/email';
import type { Actions, PageServerLoad } from './$types';

const BETA_DENIED = 'saaskaya şu anda kapalı betadadır. Davetiye için operatörle iletişime geçin.';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, '/dashboard');
	const email = z.email().safeParse(url.searchParams.get('email'));
	return { betaMode: betaModeOn(), email: email.success ? email.data : '' };
};

export const actions: Actions = {
	default: async ({ request, url, getClientAddress }) => {
		if (!rateLimit(`login:${getClientAddress()}`, 5, 60_000)) {
			return fail(429, { message: 'Too many attempts — wait a minute and try again.' });
		}
		const form = await request.formData();
		const email = z.email().safeParse(
			String(form.get('email') ?? '')
				.trim()
				.toLowerCase()
		);
		if (!email.success) {
			return fail(400, { message: 'Please enter a valid email address.' });
		}
		// Closed beta: no link is created for a non-invited email. Same generic
		// "sent" response either way would leak the allowlist, so deny explicitly.
		if (!isBetaAllowed(email.data)) {
			return fail(403, { message: BETA_DENIED });
		}
		const token = createLoginToken(email.data);
		const link = `${url.origin}/login/verify?token=${token}`;
		const { devEchoLink } = await sendMagicLink(email.data, link);
		return { sent: true, email: email.data, devEchoLink };
	}
};
