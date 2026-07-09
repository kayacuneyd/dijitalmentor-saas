import { redirect } from '@sveltejs/kit';
import { clearSessionCookie, destroySession, SESSION_COOKIE } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: ({ cookies }) => {
		destroySession(cookies.get(SESSION_COOKIE));
		clearSessionCookie(cookies);
		redirect(303, '/');
	}
};
