import { redirect } from '@sveltejs/kit';
import {
	consumeLoginToken,
	createSession,
	betaProfileComplete,
	getOrCreateUser,
	isAdminEmail,
	isBetaAllowed,
	setSessionCookie
} from '$lib/server/auth';
import { withLocale } from '$lib/i18n';
import { linkPendingToUser } from '$lib/server/onboarding/session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url, cookies, locals }) => {
	const token = url.searchParams.get('token');
	const email = token ? consumeLoginToken(token) : null;
	if (!email) return { failed: true };
	// Re-check the beta gate at click time — an invite may have been revoked after
	// the link was sent (the token is already consumed above, so it can't be reused).
	if (!isBetaAllowed(email)) return { failed: true };

	const user = getOrCreateUser(email);
	setSessionCookie(cookies, createSession(user.id));

	// Guided onboarding handoff: resume the in-progress Q&A on /new instead of
	// dropping the visitor on /dashboard, when a pending record exists — via the
	// `p` URL param (cross-device) or the `sk_pending` cookie (same-browser).
	const pending = linkPendingToUser({
		cookies,
		urlToken: url.searchParams.get('p'),
		userId: user.id
	});
	if (pending) redirect(303, withLocale(locals.locale, '/new'));
	if (!isAdminEmail(email) && !betaProfileComplete(user.id)) {
		redirect(303, withLocale(locals.locale, '/profile/start'));
	}
	redirect(303, '/dashboard');
};
