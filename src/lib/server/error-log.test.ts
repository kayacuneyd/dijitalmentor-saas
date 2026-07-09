import { afterEach, describe, expect, it, vi } from 'vitest';
import { db } from '$lib/server/db';
import { errorEvents } from '$lib/server/db/schema';
import { listRecentErrors, recordError, resolveError, unresolvedErrorCount } from './error-log';

afterEach(() => {
	db.delete(errorEvents).run();
	vi.restoreAllMocks();
});

describe('operational error log', () => {
	it('stores searchable context, redacts credentials, and resolves records', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const id = recordError(new Error('request failed with Bearer secret-token-value'), {
			source: 'test',
			route: '/api/sites',
			method: 'POST',
			status: 503,
			userId: 'user-1',
			siteId: 'site-1'
		});

		expect(id).toMatch(/^err-[a-f0-9]{8}$/);
		expect(unresolvedErrorCount()).toBe(1);
		expect(listRecentErrors(1)[0]).toMatchObject({
			id,
			source: 'test',
			route: '/api/sites',
			userId: 'user-1',
			siteId: 'site-1',
			message: 'request failed with Bearer [redacted]'
		});
		expect(resolveError(id)).toBe(true);
		expect(unresolvedErrorCount()).toBe(0);
	});
});
