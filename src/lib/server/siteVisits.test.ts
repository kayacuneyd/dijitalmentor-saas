import Database from 'better-sqlite3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fakeDb } = vi.hoisted(() => ({ fakeDb: {} as Record<string, unknown> }));

vi.mock('$lib/server/db', () => ({ db: fakeDb }));
vi.mock('$lib/server/db/schema', () => ({
	siteVisitStats: {
		siteId: 'site_id',
		day: 'day',
		locale: 'locale',
		pageSlug: 'page_slug',
		visits: 'visits'
	}
}));

describe('site visits', () => {
	beforeEach(() => {
		for (const key of Object.keys(fakeDb)) delete fakeDb[key];
	});

	it('migration creates the privacy-safe aggregate table', async () => {
		const { migrations, runMigrations } = await import('./db/migrations');
		const client = new Database(':memory:');
		runMigrations(client);
		const visitMigration = migrations.find((migration) => migration.name === 'site-visit-stats');
		expect(visitMigration?.version).toBe(30);
		expect(client.prepare('PRAGMA table_info(site_visit_stats)').all()).toHaveLength(5);
	});
});
