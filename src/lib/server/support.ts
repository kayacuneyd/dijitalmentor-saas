import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { supportTickets, supportTicketMessages } from '$lib/server/db/schema';

export type TicketCategory = 'general' | 'billing' | 'technical' | 'human_review';
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type AuthorKind = 'customer' | 'admin';

export type SupportTicket = typeof supportTickets.$inferSelect;
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;

export class TicketClosedError extends Error {}

export function createTicket(input: {
	userId: string;
	subject: string;
	body: string;
	authorEmail: string;
	category?: TicketCategory;
	siteId?: string | null;
}): SupportTicket {
	const now = new Date();
	const ticket: SupportTicket = {
		id: `tkt-${randomUUID().slice(0, 10)}`,
		userId: input.userId,
		siteId: input.siteId ?? null,
		subject: input.subject,
		category: input.category ?? 'general',
		status: 'open',
		createdAt: now,
		updatedAt: now,
		lastMessageAt: now,
		lastMessageBy: 'customer'
	};
	db.insert(supportTickets).values(ticket).run();
	db.insert(supportTicketMessages)
		.values({
			id: `tktm-${randomUUID().slice(0, 10)}`,
			ticketId: ticket.id,
			authorKind: 'customer',
			authorEmail: input.authorEmail,
			body: input.body,
			createdAt: now
		})
		.run();
	return ticket;
}

/**
 * A customer reply reopens `resolved` back to `open`; an admin reply moves it
 * to `pending` (awaiting the customer). `closed` is terminal — reopen via
 * `setTicketStatus` first.
 */
export function addTicketMessage(input: {
	ticketId: string;
	authorKind: AuthorKind;
	authorEmail: string;
	body: string;
}): SupportTicketMessage {
	const ticket = db
		.select()
		.from(supportTickets)
		.where(eq(supportTickets.id, input.ticketId))
		.get();
	if (!ticket) throw new Error('Unknown ticket.');
	if (ticket.status === 'closed') {
		throw new TicketClosedError('This ticket is closed. Reopen it before replying.');
	}
	const now = new Date();
	const message: SupportTicketMessage = {
		id: `tktm-${randomUUID().slice(0, 10)}`,
		ticketId: input.ticketId,
		authorKind: input.authorKind,
		authorEmail: input.authorEmail,
		body: input.body,
		createdAt: now
	};
	db.insert(supportTicketMessages).values(message).run();
	db.update(supportTickets)
		.set({
			status: input.authorKind === 'admin' ? 'pending' : 'open',
			updatedAt: now,
			lastMessageAt: now,
			lastMessageBy: input.authorKind
		})
		.where(eq(supportTickets.id, input.ticketId))
		.run();
	return message;
}

export function setTicketStatus(ticketId: string, status: TicketStatus): void {
	db.update(supportTickets)
		.set({ status, updatedAt: new Date() })
		.where(eq(supportTickets.id, ticketId))
		.run();
}

export function listTicketsForUser(userId: string): SupportTicket[] {
	return db
		.select()
		.from(supportTickets)
		.where(eq(supportTickets.userId, userId))
		.orderBy(desc(supportTickets.lastMessageAt))
		.all();
}

export function listAllTickets(filter?: { status?: TicketStatus }): SupportTicket[] {
	const query = db.select().from(supportTickets);
	const rows = (
		filter?.status ? query.where(eq(supportTickets.status, filter.status)) : query
	).all();
	return rows.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

export type TicketDetail = SupportTicket & { messages: SupportTicketMessage[] };

function ticketMessages(ticketId: string): SupportTicketMessage[] {
	return db
		.select()
		.from(supportTicketMessages)
		.where(eq(supportTicketMessages.ticketId, ticketId))
		.orderBy(supportTicketMessages.createdAt)
		.all();
}

export function getTicketDetail(ticketId: string): TicketDetail | null {
	const ticket = db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).get();
	if (!ticket) return null;
	return { ...ticket, messages: ticketMessages(ticketId) };
}

/** Same as `getTicketDetail`, but null on an ownership mismatch (customer-facing routes). */
export function getTicketDetailForUser(ticketId: string, userId: string): TicketDetail | null {
	const ticket = db
		.select()
		.from(supportTickets)
		.where(and(eq(supportTickets.id, ticketId), eq(supportTickets.userId, userId)))
		.get();
	if (!ticket) return null;
	return { ...ticket, messages: ticketMessages(ticketId) };
}

export function unresolvedTicketCount(): number {
	return db
		.select()
		.from(supportTickets)
		.where(inArray(supportTickets.status, ['open', 'pending']))
		.all().length;
}
