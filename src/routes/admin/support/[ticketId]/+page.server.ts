import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { sendEmail } from '$lib/server/email';
import {
	addTicketMessage,
	getTicketDetail,
	setTicketStatus,
	TicketClosedError,
	type TicketStatus
} from '$lib/server/support';
import type { Actions, PageServerLoad } from './$types';

const STATUSES: TicketStatus[] = ['open', 'pending', 'resolved', 'closed'];

export const load: PageServerLoad = ({ locals, params }) => {
	requireAdmin(locals);
	const ticket = getTicketDetail(params.ticketId);
	if (!ticket) error(404, 'Unknown ticket.');
	const customer = db.select().from(users).where(eq(users.id, ticket.userId)).get();
	return { ticket, customerEmail: customer?.email ?? ticket.userId };
};

export const actions: Actions = {
	reply: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const ticket = getTicketDetail(params.ticketId);
		if (!ticket) error(404, 'Unknown ticket.');
		const body = String((await request.formData()).get('body') ?? '').trim();
		if (!body) return fail(400, { message: 'Message cannot be empty.' });
		try {
			addTicketMessage({
				ticketId: ticket.id,
				authorKind: 'admin',
				authorEmail: locals.user!.email,
				body
			});
		} catch (e) {
			if (e instanceof TicketClosedError) return fail(400, { message: e.message });
			throw e;
		}
		const customer = db.select().from(users).where(eq(users.id, ticket.userId)).get();
		if (customer) {
			await sendEmail({
				to: customer.email,
				subject: `Re: ${ticket.subject}`,
				text: `${body}\n\n— saaskaya support\n\nReply at: /account/support/${ticket.id}`
			});
		}
		return { replied: true };
	},

	setStatus: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const ticket = getTicketDetail(params.ticketId);
		if (!ticket) error(404, 'Unknown ticket.');
		const status = String((await request.formData()).get('status') ?? '');
		if (!STATUSES.includes(status as TicketStatus)) {
			return fail(400, { message: 'Invalid status.' });
		}
		setTicketStatus(ticket.id, status as TicketStatus);
		return { statusSet: status };
	}
};
