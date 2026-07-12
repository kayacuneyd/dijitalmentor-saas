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
				'owner_sessions',
				'owner_trusted_devices',
				'owner_email_codes',
				'owner_login_events',
				'app_settings',
				'contact_submissions',
				'custom_domains',
				'ai_usage',
				'error_events',
				'request_probe_stats',
				'onboarding_events',
				'media_assets',
				'domain_credits',
				'share_assets',
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
		// v18: aggregate scanner/404 telemetry, separate from operational errors
		expect(tables(client)).toContain('request_probe_stats');
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('request_probe_stats') WHERE name='pattern'`)
				.get()
		).toBeTruthy();
		// v20: private owner login sessions + trusted devices + email code checks
		expect(
			client.prepare(`SELECT 1 FROM pragma_table_info('owner_sessions') WHERE name='email'`).get()
		).toBeTruthy();
		expect(
			client
				.prepare(
					`SELECT 1 FROM pragma_table_info('owner_trusted_devices') WHERE name='device_hash'`
				)
				.get()
		).toBeTruthy();
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('owner_email_codes') WHERE name='code_hash'`)
				.get()
		).toBeTruthy();
		const ownerEventsIdx = client
			.prepare(
				`SELECT 1 FROM sqlite_master WHERE type='index' AND name='owner_login_events_created_idx'`
			)
			.get();
		expect(ownerEventsIdx).toBeTruthy();
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
		// v12: billing events (MRR-over-time seed)
		expect(tables(client)).toContain('billing_events');
		expect(
			client.prepare(`SELECT 1 FROM pragma_table_info('billing_events') WHERE name='kind'`).get()
		).toBeTruthy();
		const billingEventsIdx = client
			.prepare(
				`SELECT 1 FROM sqlite_master WHERE type='index' AND name='billing_events_created_idx'`
			)
			.get();
		expect(billingEventsIdx).toBeTruthy();
		// v13: support ticket tables
		expect(tables(client)).toEqual(
			expect.arrayContaining(['support_tickets', 'support_ticket_messages'])
		);
		expect(
			client.prepare(`SELECT 1 FROM pragma_table_info('support_tickets') WHERE name='status'`).get()
		).toBeTruthy();
		expect(
			client
				.prepare(
					`SELECT 1 FROM pragma_table_info('support_ticket_messages') WHERE name='author_kind'`
				)
				.get()
		).toBeTruthy();
		const supportStatusIdx = client
			.prepare(
				`SELECT 1 FROM sqlite_master WHERE type='index' AND name='support_tickets_status_idx'`
			)
			.get();
		expect(supportStatusIdx).toBeTruthy();
		// v15: public inquiry inbox
		expect(tables(client)).toEqual(expect.arrayContaining(['inquiries', 'inquiry_messages']));
		expect(
			client.prepare(`SELECT 1 FROM pragma_table_info('inquiries') WHERE name='source'`).get()
		).toBeTruthy();
		expect(
			client.prepare(`SELECT 1 FROM pragma_table_info('inquiry_messages') WHERE name='body'`).get()
		).toBeTruthy();
		const inquiriesStatusIdx = client
			.prepare(`SELECT 1 FROM sqlite_master WHERE type='index' AND name='inquiries_status_idx'`)
			.get();
		expect(inquiriesStatusIdx).toBeTruthy();
		// v16: persistent editor chat transcript
		expect(tables(client)).toContain('site_chat_messages');
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('site_chat_messages') WHERE name='kind'`)
				.get()
		).toBeTruthy();
		const chatSiteIdx = client
			.prepare(
				`SELECT 1 FROM sqlite_master WHERE type='index' AND name='site_chat_messages_site_idx'`
			)
			.get();
		expect(chatSiteIdx).toBeTruthy();
		// v22: Creem monthly/yearly/domain product split + included domain credits
		expect(tables(client)).toContain('domain_credits');
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('site_subscriptions') WHERE name='plan_interval'`)
				.get()
		).toBeTruthy();
		expect(
			client
				.prepare(`SELECT 1 FROM pragma_table_info('site_subscriptions') WHERE name='price_eur'`)
				.get()
		).toBeTruthy();
		expect(
			client.prepare(`SELECT 1 FROM pragma_table_info('domain_credits') WHERE name='tld'`).get()
		).toBeTruthy();
		// v23: Cloudflare DNS + Email Routing automation state on domain reservations
		for (const column of [
			'cloudflare_zone_id',
			'cloudflare_nameservers',
			'cloudflare_zone_status',
			'email_routing_status',
			'email_local_part',
			'email_destination',
			'email_rule_id',
			'email_destination_verified_at'
		]) {
			expect(
				client
					.prepare(`SELECT 1 FROM pragma_table_info('domain_reservations') WHERE name=?`)
					.get(column)
			).toBeTruthy();
		}

		// v24: operator-curated story-share asset library
		expect(tables(client)).toContain('share_assets');
		for (const column of ['kind', 'sort_order', 'active', 'caption']) {
			expect(
				client.prepare(`SELECT 1 FROM pragma_table_info('share_assets') WHERE name=?`).get(column)
			).toBeTruthy();
		}
		expect(
			client
				.prepare(
					`SELECT 1 FROM sqlite_master WHERE type='index' AND name='share_assets_active_order_idx'`
				)
				.get()
		).toBeTruthy();
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

	it('backfills historical 404 scanner errors into aggregate request probes', () => {
		const client = new Database(':memory:');
		runMigrations(client, migrations.slice(0, 17));
		client
			.prepare(
				`INSERT INTO error_events (
					id, level, source, route, method, status, error_name, message, created_at
				) VALUES (?, 'error', 'sveltekit', ?, 'GET', 404, 'Error', ?, ?)`
			)
			.run('err-wp', '/wp-admin/install.php', 'Not found: /wp-admin/install.php', 1000);
		client
			.prepare(
				`INSERT INTO error_events (
					id, level, source, route, method, status, error_name, message, created_at
				) VALUES (?, 'error', 'sveltekit', ?, 'GET', 404, 'Error', ?, ?)`
			)
			.run('err-lander', '/lander/fake', 'Not found: /lander/fake', 2000);
		client
			.prepare(
				`INSERT INTO error_events (
					id, level, source, route, method, status, error_name, message, created_at
				) VALUES (?, 'error', 'sveltekit', ?, 'GET', 404, 'Error', ?, ?)`
			)
			.run('err-wp-env', '/wp/.env', 'Not found: /wp/.env', 2500);
		client
			.prepare(
				`INSERT INTO error_events (
					id, level, source, route, method, status, error_name, message, created_at
				) VALUES (?, 'error', 'sveltekit', ?, 'GET', 500, 'Error', ?, ?)`
			)
			.run('err-real', '/dashboard', 'Database unavailable', 3000);

		runMigrations(client);

		expect(
			client.prepare(`SELECT pattern, count FROM request_probe_stats ORDER BY pattern`).all()
		).toEqual([
			{ pattern: 'landing-probe', count: 1 },
			{ pattern: 'secret-scan', count: 1 },
			{ pattern: 'wordpress', count: 1 }
		]);
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
