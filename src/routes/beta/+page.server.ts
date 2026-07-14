import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getSetting } from '$lib/server/config';
import { createLoginToken, rateLimit, selfServeBetaInvite } from '$lib/server/auth';
import { sendMagicLink } from '$lib/server/email';
import { PENDING_COOKIE } from '$lib/server/onboarding/session';
import { getPublicCopyOverrides } from '$lib/server/publicCopy';
import { withLocale } from '$lib/i18n';
import { serverTranslator } from '$lib/server/messageOverrides';
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
	default: async ({ request, url, locals, cookies, getClientAddress }) => {
		const t = serverTranslator(locals.locale);
		if (!rateLimit(`beta:${getClientAddress()}`, 8, 60_000)) {
			return fail(429, { message: t('auth.tooManyAttempts') });
		}
		const form = await request.formData();
		const code = String(form.get('code') ?? '');
		if (!codeAllowed(code)) {
			return fail(403, { message: t('auth.betaLinkNotActive') });
		}
		const email = z.email().safeParse(
			String(form.get('email') ?? '')
				.trim()
				.toLowerCase()
		);
		if (!email.success) {
			return fail(400, { message: t('auth.invalidEmail') });
		}
		selfServeBetaInvite(email.data);
		const token = createLoginToken(email.data);
		const verifyPath = withLocale(locals.locale, '/login/verify');
		const pendingToken = cookies.get(PENDING_COOKIE);
		const link = pendingToken
			? `${url.origin}${verifyPath}?token=${token}&p=${encodeURIComponent(pendingToken)}`
			: `${url.origin}${verifyPath}?token=${token}`;
		const { devEchoLink } = await sendMagicLink(email.data, link, locals.locale);
		return { sent: true, email: email.data, devEchoLink };
	}
};
