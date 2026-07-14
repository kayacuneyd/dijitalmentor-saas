import { isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { createTicket, getTicketDetail, setTicketStatus } from '$lib/server/support';
import { load, actions } from './+page.server';

function formRequest(fields: Record<string, string>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(fields)) form.set(key, value);
	return { formData: async () => form } as unknown as Request;
}

describe('GET /account/support/[ticketId] (load)', () => {
	it('redirects signed-out visitors to /login', () => {
		try {
			load({ params: { ticketId: 'whoever' }, locals: { user: null, locale: 'en' } } as never);
			throw new Error('expected a redirect to be thrown');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
		}
	});

	it('404s a ticket owned by someone else', () => {
		const owner = getOrCreateUser(`ticket-load-owner-${Date.now()}@example.com`);
		const stranger = getOrCreateUser(`ticket-load-stranger-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: owner.id,
			subject: 'Mine',
			body: 'Just checking in.',
			authorEmail: owner.email
		});
		try {
			load({ params: { ticketId: ticket.id }, locals: { user: stranger, locale: 'en' } } as never);
			throw new Error('expected an error to be thrown');
		} catch (e) {
			expect((e as { status: number }).status).toBe(404);
		}
	});

	it('returns the ticket detail for its owner', () => {
		const owner = getOrCreateUser(`ticket-load-ok-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: owner.id,
			subject: 'Mine',
			body: 'Hello.',
			authorEmail: owner.email
		});
		const result = load({
			params: { ticketId: ticket.id },
			locals: { user: owner, locale: 'en' }
		} as never) as { ticket: { id: string; messages: unknown[] } };
		expect(result.ticket.id).toBe(ticket.id);
		expect(result.ticket.messages).toHaveLength(1);
	});
});

describe('?/reply', () => {
	it('rejects an empty reply', async () => {
		const owner = getOrCreateUser(`ticket-reply-empty-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: owner.id,
			subject: 'Mine',
			body: 'Hello.',
			authorEmail: owner.email
		});
		const res = (await actions.reply({
			request: formRequest({ body: '' }),
			locals: { user: owner, locale: 'en' },
			params: { ticketId: ticket.id }
		} as never)) as { status: number };
		expect(res.status).toBe(400);
	});

	it('adds a customer message and reopens a resolved ticket', async () => {
		const owner = getOrCreateUser(`ticket-reply-reopen-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: owner.id,
			subject: 'Mine',
			body: 'Hello.',
			authorEmail: owner.email
		});
		setTicketStatus(ticket.id, 'resolved');

		const res = await actions.reply({
			request: formRequest({ body: 'Still broken.' }),
			locals: { user: owner, locale: 'en' },
			params: { ticketId: ticket.id }
		} as never);
		expect((res as { replied: boolean }).replied).toBe(true);
		expect(getTicketDetail(ticket.id)?.status).toBe('open');
		expect(getTicketDetail(ticket.id)?.messages).toHaveLength(2);
	});

	it('rejects a reply on a closed ticket with a 400, not a throw', async () => {
		const owner = getOrCreateUser(`ticket-reply-closed-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: owner.id,
			subject: 'Mine',
			body: 'Hello.',
			authorEmail: owner.email
		});
		setTicketStatus(ticket.id, 'closed');
		const res = (await actions.reply({
			request: formRequest({ body: 'Reopening?' }),
			locals: { user: owner, locale: 'en' },
			params: { ticketId: ticket.id }
		} as never)) as { status: number };
		expect(res.status).toBe(400);
	});

	it('404s a reply attempt on a ticket owned by someone else', async () => {
		const owner = getOrCreateUser(`ticket-reply-owner-${Date.now()}@example.com`);
		const stranger = getOrCreateUser(`ticket-reply-stranger-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: owner.id,
			subject: 'Mine',
			body: 'Hello.',
			authorEmail: owner.email
		});
		await expect(
			actions.reply({
				request: formRequest({ body: 'Sneaky' }),
				locals: { user: stranger, locale: 'en' },
				params: { ticketId: ticket.id }
			} as never)
		).rejects.toBeTruthy();
	});
});
