import { isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { listTicketsForUser } from '$lib/server/support';
import { load, actions } from './+page.server';

function formRequest(fields: Record<string, string>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(fields)) form.set(key, value);
	return { formData: async () => form } as unknown as Request;
}

describe('GET /account/support (load)', () => {
	it('redirects signed-out visitors to /login', () => {
		try {
			load({ locals: { user: null } } as never);
			throw new Error('expected a redirect to be thrown');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
			if (isRedirect(e)) expect(e.status).toBe(303);
		}
	});

	it("returns the signed-in user's tickets", () => {
		const user = getOrCreateUser(`account-support-load-${Date.now()}@example.com`);
		const result = load({ locals: { user } } as never) as { tickets: unknown[] };
		expect(Array.isArray(result.tickets)).toBe(true);
	});
});

describe('?/create', () => {
	it('rejects an unauthenticated request', async () => {
		await expect(
			actions.create({
				request: formRequest({ subject: 'x', body: 'y' }),
				locals: { user: null }
			} as never)
		).rejects.toBeTruthy();
	});

	it('rejects a missing subject/body', async () => {
		const user = getOrCreateUser(`account-support-invalid-${Date.now()}@example.com`);
		const res = (await actions.create({
			request: formRequest({ subject: '', body: '' }),
			locals: { user, locale: 'en' }
		} as never)) as { status: number };
		expect(res.status).toBe(400);
	});

	it('creates a ticket, redirects to it, and defaults an unknown category to general', async () => {
		const user = getOrCreateUser(`account-support-create-${Date.now()}@example.com`);
		await expect(
			actions.create({
				request: formRequest({
					subject: 'Cannot log in',
					body: 'The magic link expired.',
					category: 'not-a-real-category'
				}),
				locals: { user, locale: 'en' }
			} as never)
		).rejects.toBeTruthy(); // SvelteKit redirect() throws

		const tickets = listTicketsForUser(user.id);
		expect(tickets).toHaveLength(1);
		expect(tickets[0].category).toBe('general');
	});
});
