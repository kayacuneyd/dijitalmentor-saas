import { error, fail, redirect } from '@sveltejs/kit';
import { rateLimit } from '$lib/server/auth';
import { addTicketMessage, getTicketDetailForUser, TicketClosedError } from '$lib/server/support';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
	if (!locals.user) redirect(303, '/login');
	const ticket = getTicketDetailForUser(params.ticketId, locals.user.id);
	if (!ticket) error(404, 'Unknown ticket.');
	return { ticket };
};

export const actions: Actions = {
	reply: async ({ request, locals, params }) => {
		if (!locals.user) redirect(303, '/login');
		const ticket = getTicketDetailForUser(params.ticketId, locals.user.id);
		if (!ticket) error(404, 'Unknown ticket.');
		if (!rateLimit(`ticket-reply:${locals.user.id}`, 10, 3_600_000)) {
			return fail(429, { message: 'Too many replies — please wait before sending another.' });
		}
		const body = String((await request.formData()).get('body') ?? '').trim();
		if (!body) return fail(400, { message: 'Message cannot be empty.' });
		try {
			addTicketMessage({
				ticketId: ticket.id,
				authorKind: 'customer',
				authorEmail: locals.user.email,
				body
			});
		} catch (e) {
			if (e instanceof TicketClosedError) return fail(400, { message: e.message });
			throw e;
		}
		return { replied: true };
	}
};
