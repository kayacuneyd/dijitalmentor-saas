import { isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { createTicket, setTicketStatus } from '$lib/server/support';
import { load } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

function url(query = '') {
	return new URL(`http://localhost/admin/support${query}`);
}

describe('GET /admin/support (load)', () => {
	it('redirects signed-out visitors to /login', () => {
		try {
			load({ locals: { user: null }, url: url() } as never);
			throw new Error('expected a redirect to be thrown');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
			if (isRedirect(e)) expect(e.status).toBe(303);
		}
	});

	it('403s a signed-in non-admin', () => {
		try {
			load({ locals: { user: nonAdmin }, url: url() } as never);
			throw new Error('expected an error to be thrown');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(403);
		}
	});

	it('returns every ticket with a resolved customer email, and filters by ?status', () => {
		const user = getOrCreateUser(`admin-support-inbox-${Date.now()}@example.com`);
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

		const all = load({ locals: { user: admin }, url: url() } as never) as {
			tickets: { id: string; customerEmail: string }[];
			status: string;
		};
		expect(all.status).toBe('all');
		const mine = all.tickets.find((t) => t.id === openTicket.id);
		expect(mine?.customerEmail).toBe(user.email);

		const openOnly = load({
			locals: { user: admin },
			url: url('?status=open')
		} as never) as { tickets: { id: string }[]; status: string };
		expect(openOnly.status).toBe('open');
		expect(openOnly.tickets.some((t) => t.id === openTicket.id)).toBe(true);
		expect(openOnly.tickets.some((t) => t.id === closedTicket.id)).toBe(false);
	});

	it('ignores an invalid ?status value', () => {
		const result = load({
			locals: { user: admin },
			url: url('?status=not-a-real-status')
		} as never) as { status: string };
		expect(result.status).toBe('all');
	});
});
