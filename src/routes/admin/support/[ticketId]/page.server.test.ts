import { isHttpError } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { createTicket, getTicketDetail, setTicketStatus } from '$lib/server/support';
import { load, actions } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

function formRequest(fields: Record<string, string>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(fields)) form.set(key, value);
	return { formData: async () => form } as unknown as Request;
}

describe('GET /admin/support/[ticketId] (load)', () => {
	it('403s a signed-in non-admin', () => {
		try {
			load({ params: { ticketId: 'whoever' }, locals: { user: nonAdmin } } as never);
			throw new Error('expected an error to be thrown');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(403);
		}
	});

	it('404s an unknown ticket', () => {
		try {
			load({ params: { ticketId: 'not-a-real-ticket' }, locals: { user: admin } } as never);
			throw new Error('expected an error to be thrown');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(404);
		}
	});

	it('returns the ticket detail with the resolved customer email', () => {
		const user = getOrCreateUser(`admin-ticket-load-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Help',
			body: 'Please help.',
			authorEmail: user.email
		});
		const result = load({
			params: { ticketId: ticket.id },
			locals: { user: admin }
		} as never) as { ticket: { id: string }; customerEmail: string };
		expect(result.ticket.id).toBe(ticket.id);
		expect(result.customerEmail).toBe(user.email);
	});
});

describe('?/reply', () => {
	it('every action requires admin (throws for signed-out and non-admin)', async () => {
		const user = getOrCreateUser(`admin-ticket-guard-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Guard test',
			body: 'x',
			authorEmail: user.email
		});
		await expect(
			actions.reply({
				request: formRequest({ body: 'hi' }),
				locals: { user: null },
				params: { ticketId: ticket.id }
			} as never)
		).rejects.toBeTruthy();
		await expect(
			actions.reply({
				request: formRequest({ body: 'hi' }),
				locals: { user: nonAdmin },
				params: { ticketId: ticket.id }
			} as never)
		).rejects.toBeTruthy();
	});

	it('adds an admin message and moves the ticket to pending', async () => {
		const user = getOrCreateUser(`admin-ticket-reply-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Reply test',
			body: 'x',
			authorEmail: user.email
		});
		const res = await actions.reply({
			request: formRequest({ body: "We're on it." }),
			locals: { user: admin },
			params: { ticketId: ticket.id }
		} as never);
		expect((res as { replied: boolean }).replied).toBe(true);
		const detail = getTicketDetail(ticket.id);
		expect(detail?.status).toBe('pending');
		expect(detail?.messages).toHaveLength(2);
		expect(detail?.messages[1].authorKind).toBe('admin');
	});

	it('rejects an empty reply', async () => {
		const user = getOrCreateUser(`admin-ticket-empty-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Empty test',
			body: 'x',
			authorEmail: user.email
		});
		const res = (await actions.reply({
			request: formRequest({ body: '' }),
			locals: { user: admin },
			params: { ticketId: ticket.id }
		} as never)) as { status: number };
		expect(res.status).toBe(400);
	});
});

describe('?/setStatus', () => {
	it('rejects an invalid status', async () => {
		const user = getOrCreateUser(`admin-ticket-status-invalid-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Status test',
			body: 'x',
			authorEmail: user.email
		});
		const res = (await actions.setStatus({
			request: formRequest({ status: 'archived' }),
			locals: { user: admin },
			params: { ticketId: ticket.id }
		} as never)) as { status: number };
		expect(res.status).toBe(400);
	});

	it('sets a valid status', async () => {
		const user = getOrCreateUser(`admin-ticket-status-ok-${Date.now()}@example.com`);
		const ticket = createTicket({
			userId: user.id,
			subject: 'Status test',
			body: 'x',
			authorEmail: user.email
		});
		const res = await actions.setStatus({
			request: formRequest({ status: 'resolved' }),
			locals: { user: admin },
			params: { ticketId: ticket.id }
		} as never);
		expect((res as { statusSet: string }).statusSet).toBe('resolved');
		expect(getTicketDetail(ticket.id)?.status).toBe('resolved');
	});
});
