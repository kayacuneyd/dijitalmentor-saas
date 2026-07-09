import { isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { load } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

describe('GET /admin/customers/[userId] (load)', () => {
	it('redirects signed-out visitors to /login', () => {
		try {
			load({ params: { userId: 'whoever' }, locals: { user: null } } as never);
			throw new Error('expected a redirect to be thrown');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
			if (isRedirect(e)) expect(e.status).toBe(303);
		}
	});

	it('403s a signed-in non-admin', () => {
		try {
			load({ params: { userId: 'whoever' }, locals: { user: nonAdmin } } as never);
			throw new Error('expected an error to be thrown');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(403);
		}
	});

	it('404s an unknown customer id for an admin', () => {
		try {
			load({ params: { userId: 'not-a-real-user' }, locals: { user: admin } } as never);
			throw new Error('expected an error to be thrown');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(404);
		}
	});

	it('returns the customer detail shape for a known customer', () => {
		const user = getOrCreateUser('page-server-customer-detail@example.com');
		const result = load({
			params: { userId: user.id },
			locals: { user: admin }
		} as never) as { customer: { id: string; email: string; sites: unknown[] } };
		expect(result.customer.id).toBe(user.id);
		expect(result.customer.email).toBe('page-server-customer-detail@example.com');
		expect(Array.isArray(result.customer.sites)).toBe(true);
	});
});
