import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from './auth';
import {
	TicketClosedError,
	addTicketMessage,
	createTicket,
	getTicketDetail,
	getTicketDetailForUser,
	listAllTickets,
	listTicketsForUser,
	setTicketStatus,
	unresolvedTicketCount
} from './support';

describe('createTicket', () => {
	it('creates a ticket with a first customer message, defaulting category/status', () => {
		const user = getOrCreateUser(`support-create-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Cannot publish my site',
			body: 'The publish button does nothing.',
			authorEmail: user.email
		});
		expect(ticket.status).toBe('open');
		expect(ticket.category).toBe('general');
		expect(ticket.lastMessageBy).toBe('customer');

		const detail = getTicketDetail(ticket.id);
		expect(detail?.messages).toHaveLength(1);
		expect(detail?.messages[0].authorKind).toBe('customer');
		expect(detail?.messages[0].body).toBe('The publish button does nothing.');
	});

	it('accepts an explicit category (human_review)', () => {
		const user = getOrCreateUser(`support-hr-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Please review my copy',
			body: 'Can a human check my homepage before I share it?',
			authorEmail: user.email,
			category: 'human_review'
		});
		expect(ticket.category).toBe('human_review');
	});
});

describe('addTicketMessage', () => {
	it('an admin reply moves the ticket to pending; a customer reply reopens it from resolved', () => {
		const user = getOrCreateUser(`support-reply-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Billing question',
			body: 'Why was I charged twice?',
			authorEmail: user.email,
			category: 'billing'
		});

		addTicketMessage({
			ticketId: ticket.id,
			authorKind: 'admin',
			authorEmail: 'admin@saaskaya.com',
			body: "Looking into it, I'll get back to you."
		});
		expect(getTicketDetail(ticket.id)?.status).toBe('pending');

		setTicketStatus(ticket.id, 'resolved');
		expect(getTicketDetail(ticket.id)?.status).toBe('resolved');

		addTicketMessage({
			ticketId: ticket.id,
			authorKind: 'customer',
			authorEmail: user.email,
			body: 'Actually I still see two charges.'
		});
		expect(getTicketDetail(ticket.id)?.status).toBe('open');
		expect(getTicketDetail(ticket.id)?.messages).toHaveLength(3);
	});

	it('rejects a reply on a closed ticket', () => {
		const user = getOrCreateUser(`support-closed-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Old issue',
			body: 'This was resolved a while ago.',
			authorEmail: user.email
		});
		setTicketStatus(ticket.id, 'closed');
		expect(() =>
			addTicketMessage({
				ticketId: ticket.id,
				authorKind: 'customer',
				authorEmail: user.email,
				body: 'Reopening?'
			})
		).toThrow(TicketClosedError);
	});
});

describe('listTicketsForUser / listAllTickets / ownership', () => {
	it('scopes listTicketsForUser to the owner and getTicketDetailForUser rejects mismatched ownership', () => {
		const owner = getOrCreateUser(`support-owner-${Date.now()}@example.com`);
		const stranger = getOrCreateUser(`support-stranger-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: owner.id,
			subject: 'Mine',
			body: 'Just checking in.',
			authorEmail: owner.email
		});

		expect(listTicketsForUser(owner.id).some((t) => t.id === ticket.id)).toBe(true);
		expect(listTicketsForUser(stranger.id).some((t) => t.id === ticket.id)).toBe(false);

		expect(getTicketDetailForUser(ticket.id, owner.id)?.id).toBe(ticket.id);
		expect(getTicketDetailForUser(ticket.id, stranger.id)).toBeNull();
	});

	it('listAllTickets filters by status and unresolvedTicketCount counts open+pending only', () => {
		const user = getOrCreateUser(`support-filter-${Date.now()}@example.com`);
		const before = unresolvedTicketCount();
		const openTicket = createTicket({
			userId: user.id,
			subject: 'Open one',
			body: 'Still open.',
			authorEmail: user.email
		});
		const closedTicket = createTicket({
			userId: user.id,
			subject: 'Closed one',
			body: 'Will be closed.',
			authorEmail: user.email
		});
		setTicketStatus(closedTicket.id, 'closed');

		expect(unresolvedTicketCount()).toBe(before + 1);
		expect(listAllTickets({ status: 'open' }).some((t) => t.id === openTicket.id)).toBe(true);
		expect(listAllTickets({ status: 'open' }).some((t) => t.id === closedTicket.id)).toBe(false);
		expect(listAllTickets({ status: 'closed' }).some((t) => t.id === closedTicket.id)).toBe(true);
	});
});
