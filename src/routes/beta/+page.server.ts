import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getSetting } from '$lib/server/config';
import { createLoginToken, rateLimit, selfServeBetaInvite } from '$lib/server/auth';
import { sendMagicLink } from '$lib/server/email';
import { getPublicCopyOverrides } from '$lib/server/publicCopy';
import { withLocale } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

function configuredCode(): string {
	return (getSetting('BETA_ENTRY_CODE') ?? '').trim();
}

function codeAllowed(value: string | null): boolean {
	const required = configuredCode();
	return !required || value === required;
}

export const load: PageServerLoad = ({ locals, url }) => {
	const code = url.searchParams.get('code') ?? '';
	return {
		locale: locals.locale,
		code,
		codeRequired: Boolean(configuredCode()),
		codeAllowed: codeAllowed(code),
		copyOverrides: getPublicCopyOverrides('beta')
	};
};

export const actions: Actions = {
	default: async ({ request, url, locals, getClientAddress }) => {
		if (!rateLimit(`beta:${getClientAddress()}`, 8, 60_000)) {
			return fail(429, { message: 'Too many attempts — wait a minute and try again.' });
		}
		const form = await request.formData();
		const code = String(form.get('code') ?? '');
		if (!codeAllowed(code)) {
			return fail(403, { message: 'This beta link is not active.' });
		}
		const email = z.email().safeParse(
			String(form.get('email') ?? '')
				.trim()
				.toLowerCase()
		);
		if (!email.success) {
			return fail(400, { message: 'Please enter a valid email address.' });
		}
		selfServeBetaInvite(email.data);
		const token = createLoginToken(email.data);
		const verifyPath = withLocale(locals.locale, '/login/verify');
		const { devEchoLink } = await sendMagicLink(
			email.data,
			`${url.origin}${verifyPath}?token=${token}`
		);
		return { sent: true, email: email.data, devEchoLink };
	}
};
