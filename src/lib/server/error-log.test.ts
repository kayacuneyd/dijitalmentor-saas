import { afterEach, describe, expect, it, vi } from 'vitest';
import { db } from '$lib/server/db';
import { errorEvents } from '$lib/server/db/schema';
import {
	listRecentErrors,
	recordError,
	resolveError,
	shouldRecordError,
	unresolvedErrorCount
} from './error-log';

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

	it('does not treat 404 misses as actionable application errors', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(shouldRecordError({ status: 404 })).toBe(false);
		expect(shouldRecordError({ status: 500 })).toBe(true);

		const scannerId = recordError(new Error('Not found: /wp-admin/install.php'), {
			source: 'sveltekit',
			route: '/wp-admin/install.php',
			method: 'GET',
			status: 404
		});
		const appErrorId = recordError(new Error('Database unavailable'), {
			source: 'sveltekit',
			route: '/dashboard',
			method: 'GET',
			status: 500
		});

		expect(listRecentErrors(10).map((event) => event.id)).toEqual([appErrorId]);
		expect(unresolvedErrorCount()).toBe(1);
		expect(resolveError(scannerId)).toBe(true);
		expect(unresolvedErrorCount()).toBe(1);
	});

	it('stores provider degradation as a warning without inflating unresolved errors', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const id = recordError(new Error('provider rate limit'), {
			source: 'onboarding-guard',
			status: 429,
			level: 'warning'
		});
		expect(listRecentErrors(1)[0]).toMatchObject({ id, level: 'warning', status: 429 });
		expect(unresolvedErrorCount()).toBe(0);
	});
});
