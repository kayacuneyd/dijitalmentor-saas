import { redirect } from '@sveltejs/kit';
import {
	consumeLoginToken,
	createSession,
	getOrCreateUser,
	isBetaAllowed,
	setSessionCookie
} from '$lib/server/auth';
import { linkPendingToUser } from '$lib/server/onboarding/session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url, cookies }) => {
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
	redirect(303, pending ? '/new' : '/dashboard');
};
