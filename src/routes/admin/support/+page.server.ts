import { inArray } from 'drizzle-orm';
import { requireAdmin } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { listAllTickets, type TicketStatus } from '$lib/server/support';
import type { PageServerLoad } from './$types';

const STATUSES: TicketStatus[] = ['open', 'pending', 'resolved', 'closed'];

export const load: PageServerLoad = ({ locals, url }) => {
	requireAdmin(locals);
	const statusParam = url.searchParams.get('status');
	const status = STATUSES.includes(statusParam as TicketStatus)
		? (statusParam as TicketStatus)
		: undefined;
	const tickets = listAllTickets(status ? { status } : undefined);

	const userIds = [...new Set(tickets.map((t) => t.userId))];
	const emailById = new Map(
		(userIds.length
			? db
					.select({ id: users.id, email: users.email })
					.from(users)
					.where(inArray(users.id, userIds))
					.all()
			: []
		).map((u) => [u.id, u.email])
	);

	return {
		tickets: tickets.map((t) => ({ ...t, customerEmail: emailById.get(t.userId) ?? t.userId })),
		status: status ?? 'all'
	};
};
