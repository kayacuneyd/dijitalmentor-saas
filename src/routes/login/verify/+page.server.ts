import { redirect } from '@sveltejs/kit';
import {
	consumeLoginToken,
	createSession,
	getOrCreateUser,
	isBetaAllowed,
	setSessionCookie
} from '$lib/server/auth';
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
	redirect(303, '/dashboard');
};
