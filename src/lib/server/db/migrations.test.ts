import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { migrations, runMigrations, type Migration } from './migrations';

const tables = (client: Database.Database): string[] =>
	(client.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as { name: string }[])
		.map((r) => r.name)
		.sort();

describe('migration runner (versioned, idempotent, resumable)', () => {
	it('brings a fresh database to the full schema and records every version', () => {
		const client = new Database(':memory:');
		const { applied } = runMigrations(client);
		expect(applied).toEqual(migrations.map((m) => `${m.version}-${m.name}`));
		expect(tables(client)).toEqual(
			expect.arrayContaining([
				'sites',
				'site_versions',
				'users',
				'sessions',
				'login_tokens',
				'app_settings',
				'contact_submissions',
				'custom_domains',
				'ai_usage',
				'error_events',
				'onboarding_events',
				'media_assets',
				'schema_migrations'
			])
		);
		// v2 column exists
		const col = client
			.prepare(`SELECT 1 FROM pragma_table_info('users') WHERE name='subscription_ends_at'`)
			.get();
		expect(col).toBeTruthy();
		// v4: credit columns + gate telemetry table
		expect(tables(client)).toContain('ai_gate_log');
		expect(
			client.prepare(`SELECT 1 FROM pragma_table_info('ai_usage') WHERE name='edit_count'`).get()
		).toBeTruthy();
		// v8: privacy-safe operational error records
		expect(tables(client)).toContain('error_events');
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('ai_usage') WHERE name='generation_count'`)
				.get()
		).toBeTruthy();
		// v5: beta launch tables + partial unique index on live reservations
		expect(tables(client)).toEqual(expect.arrayContaining(['beta_invites', 'domain_reservations']));
		const idx = client
			.prepare(
				`SELECT 1 FROM sqlite_master WHERE type='index' AND name='domain_reservations_live_domain'`
			)
			.get();
		expect(idx).toBeTruthy();
		// v6: R2 media index
		const mediaIdx = client
			.prepare(
				`SELECT 1 FROM sqlite_master WHERE type='index' AND name='media_assets_site_created_idx'`
			)
			.get();
		expect(mediaIdx).toBeTruthy();
		// v7: provider-independent estimated spend accounting
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('ai_usage') WHERE name='estimated_cost_microusd'`)
				.get()
		).toBeTruthy();
		// v9: guided onboarding Q&A pending records
		expect(tables(client)).toContain('pending_onboarding');
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('pending_onboarding') WHERE name='token_hash'`)
				.get()
		).toBeTruthy();
		// v10: privacy-safe onboarding funnel telemetry
		expect(tables(client)).toContain('onboarding_events');
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('onboarding_events') WHERE name='duration_ms'`)
				.get()
		).toBeTruthy();
		// v11: admin customer-panel action audit trail
		expect(tables(client)).toContain('admin_actions');
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('admin_actions') WHERE name='target_user_id'`)
				.get()
		).toBeTruthy();
		const adminActionsIdx = client
			.prepare(`SELECT 1 FROM sqlite_master WHERE type='index' AND name='admin_actions_target_idx'`)
			.get();
		expect(adminActionsIdx).toBeTruthy();
	});

	it('is idempotent: a second run applies nothing', () => {
		const client = new Database(':memory:');
		runMigrations(client);
		expect(runMigrations(client).applied).toEqual([]);
	});

	it('is resumable: only pending versions run', () => {
		const client = new Database(':memory:');
		runMigrations(client, migrations.slice(0, 1)); // stop after v1 (simulated crash)
		const { applied } = runMigrations(client); // full list
		expect(applied).toEqual(migrations.slice(1).map((m) => `${m.version}-${m.name}`));
	});

	it('adopts a pre-M6 database created by the old ad-hoc bootstrap', () => {
		const client = new Database(':memory:');
		// old-style DB: tables exist, no schema_migrations
		client.exec(
			`CREATE TABLE sites (id text PRIMARY KEY, tenant_id text NOT NULL, draft text NOT NULL, updated_at integer NOT NULL)`
		);
		client.exec(
			`CREATE TABLE users (id text PRIMARY KEY, email text NOT NULL, created_at integer NOT NULL)`
		);
		client.prepare(`INSERT INTO sites VALUES ('s1','t1','{}',0)`).run();

		const { applied } = runMigrations(client);
		expect(applied.length).toBe(migrations.length); // baseline applies cleanly over it
		// existing data survives, new columns exist
		expect(client.prepare(`SELECT id FROM sites`).get()).toEqual({ id: 's1' });
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('sites') WHERE name='published_version'`)
				.get()
		).toBeTruthy();
	});

	it('migrates legacy draft domains into the canonical custom_domains table', () => {
		const client = new Database(':memory:');
		const draft = JSON.stringify({ domain: 'legacy.example' });
		client.exec(
			`CREATE TABLE sites (id text PRIMARY KEY, tenant_id text NOT NULL, draft text NOT NULL, owner_user_id text, updated_at integer NOT NULL)`
		);
		client
			.prepare(`INSERT INTO sites VALUES ('legacy-site','tenant-1', ?, 'user-1', 1234)`)
			.run(draft);

		runMigrations(client);

		expect(client.prepare(`SELECT * FROM custom_domains`).get()).toMatchObject({
			hostname: 'legacy.example',
			site_id: 'legacy-site',
			owner_user_id: 'user-1',
			status: 'active'
		});
	});

	it('a failing migration rolls back atomically and can be retried', () => {
		const client = new Database(':memory:');
		const bad: Migration[] = [
			{
				version: 1,
				name: 'boom',
				up(c) {
					c.exec(`CREATE TABLE half_done (id text)`);
					throw new Error('boom');
				}
			}
		];
		expect(() => runMigrations(client, bad)).toThrow('boom');
		expect(tables(client)).not.toContain('half_done'); // transaction rolled back
		expect(client.prepare(`SELECT count(*) AS n FROM schema_migrations`).get()).toEqual({ n: 0 }); // nothing recorded → retryable
	});
});
