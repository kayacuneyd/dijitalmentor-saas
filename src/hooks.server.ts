import type { Handle, HandleServerError } from '@sveltejs/kit';
import { getSessionUser, isAdminEmail, SESSION_COOKIE } from '$lib/server/auth';
import { recordError } from '$lib/server/error-log';

export const handle: Handle = async ({ event, resolve }) => {
	const user = getSessionUser(event.cookies.get(SESSION_COOKIE));
	event.locals.user = user ? { ...user, isAdmin: isAdminEmail(user.email) } : null;
	return resolve(event);
};

export const handleError: HandleServerError = ({ error, event, status }) => {
	const errorId = recordError(error, {
		source: 'sveltekit',
		route: event.route.id ?? event.url.pathname,
		method: event.request.method,
		status,
		userId: event.locals.user?.id
	});
	return {
		message: `Something went wrong. Error reference: ${errorId}`,
		errorId
	};
};
