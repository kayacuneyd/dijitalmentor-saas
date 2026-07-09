import { isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { getOrSeedDraft, saveDraft } from '$lib/server/db/repo';
import { load } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

describe('GET /admin/customers (load)', () => {
	it('redirects signed-out visitors to /login', () => {
		try {
			load({ locals: { user: null } } as never);
			throw new Error('expected a redirect to be thrown');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
			if (isRedirect(e)) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/login');
			}
		}
	});

	it('403s a signed-in non-admin', () => {
		try {
			load({ locals: { user: nonAdmin } } as never);
			throw new Error('expected an error to be thrown');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(403);
		}
	});

	it('lists real customers for an admin, including their site count', () => {
		const user = getOrCreateUser('page-server-customers@example.com');
		const draft = structuredClone(getOrSeedDraft('seed-psych')!);
		draft.id = 'site-page-server-1';
		draft.tenantId = 'tenant-site-page-server-1';
		saveDraft(draft, { ownerUserId: user.id });

		const result = load({ locals: { user: admin } } as never) as { customers: unknown[] };
		expect(Array.isArray(result.customers)).toBe(true);
		const found = (result.customers as { id: string; siteCount: number }[]).find(
			(c) => c.id === user.id
		);
		expect(found?.siteCount).toBe(1);
	});
});
