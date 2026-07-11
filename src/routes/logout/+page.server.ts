import { redirect } from '@sveltejs/kit';
import { clearSessionCookie, destroySession, SESSION_COOKIE } from '$lib/server/auth';
import {
	clearOwnerSessionCookie,
	destroyOwnerSession,
	OWNER_SESSION_COOKIE
} from '$lib/server/ownerAuth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: ({ cookies }) => {
		destroySession(cookies.get(SESSION_COOKIE));
		destroyOwnerSession(cookies.get(OWNER_SESSION_COOKIE));
		clearSessionCookie(cookies);
		clearOwnerSessionCookie(cookies);
		redirect(303, '/');
	}
};
