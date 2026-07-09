import type BetterSqlite3 from 'better-sqlite3';

/**
 * The migration runner (M6, PLAN §6): versioned, idempotent, resumable.
 * It operates on a raw better-sqlite3 client — deliberately not on the drizzle
 * singleton — so the exact same runner can migrate every per-tenant SQLite file
 * once tenants get their own databases (the "DB-per-tenant tax").
 *
 * Rules for writing migrations:
 * - Append-only: never edit or reorder a shipped migration; add a new version.
 * - Each migration runs in its own transaction and is recorded in
 *   `schema_migrations`; a crashed run resumes at the first unapplied version.
 * - The baseline (v1) uses IF NOT EXISTS / ensureColumn so it adopts databases
 *   created by the pre-M6 ad-hoc bootstrap without change.
 */

export type Migration = {
	version: number;
	name: string;
	up: (client: BetterSqlite3.Database) => void;
};

export function ensureColumn(
	client: BetterSqlite3.Database,
	table: string,
	column: string,
	definition: string
): void {
	const exists = client
		.prepare(`SELECT 1 FROM pragma_table_info(?) WHERE name = ?`)
		.get(table, column);
	if (!exists) client.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export const migrations: Migration[] = [
	{
		version: 1,
		name: 'baseline-m0-m5',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS sites (
				id text PRIMARY KEY,
				tenant_id text NOT NULL,
				draft text NOT NULL,
				updated_at integer NOT NULL
			)`);
			ensureColumn(client, 'sites', 'owner_user_id', 'text');
			ensureColumn(client, 'sites', 'published_version', 'integer');
			client.exec(`CREATE TABLE IF NOT EXISTS site_versions (
				site_id text NOT NULL,
				version integer NOT NULL,
				data text NOT NULL,
				created_at integer NOT NULL,
				PRIMARY KEY (site_id, version)
			)`);
			client.exec(`CREATE TABLE IF NOT EXISTS users (
				id text PRIMARY KEY,
				email text NOT NULL,
				created_at integer NOT NULL
			)`);
			client.exec(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email)`);
			ensureColumn(client, 'users', 'stripe_customer_id', 'text');
			ensureColumn(client, 'users', 'subscription_status', 'text');
			client.exec(`CREATE TABLE IF NOT EXISTS login_tokens (
				token_hash text PRIMARY KEY,
				email text NOT NULL,
				expires_at integer NOT NULL
			)`);
			client.exec(`CREATE TABLE IF NOT EXISTS sessions (
				token_hash text PRIMARY KEY,
				user_id text NOT NULL,
				expires_at integer NOT NULL
			)`);
			client.exec(`CREATE TABLE IF NOT EXISTS app_settings (
				key text PRIMARY KEY,
				value text NOT NULL,
				updated_at integer NOT NULL
			)`);
			client.exec(`CREATE TABLE IF NOT EXISTS contact_submissions (
				id text PRIMARY KEY,
				site_id text NOT NULL,
				name text NOT NULL,
				email text NOT NULL,
				message text NOT NULL,
				locale text NOT NULL,
				created_at integer NOT NULL
			)`);
			client.exec(`CREATE TABLE IF NOT EXISTS ai_usage (
				tenant_id text NOT NULL,
				month text NOT NULL,
				input_tokens integer NOT NULL DEFAULT 0,
				output_tokens integer NOT NULL DEFAULT 0,
				PRIMARY KEY (tenant_id, month)
			)`);
		}
	},
	{
		version: 2,
		name: 'subscription-ends-at',
		up(client) {
			// cancellation policy (M6): when the paid period ends, for the grace window
			ensureColumn(client, 'users', 'subscription_ends_at', 'integer');
		}
	},
	{
		version: 3,
		name: 'custom-domains',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS custom_domains (
				hostname text PRIMARY KEY,
				site_id text NOT NULL,
				owner_user_id text,
				kind text NOT NULL DEFAULT 'custom',
				status text NOT NULL DEFAULT 'active',
				verified_at integer,
				created_at integer NOT NULL,
				updated_at integer NOT NULL
			)`);
			client.exec(`INSERT OR IGNORE INTO custom_domains (
				hostname, site_id, owner_user_id, kind, status, verified_at, created_at, updated_at
			)
			SELECT
				json_extract(draft, '$.domain'),
				id,
				owner_user_id,
				'custom',
				'active',
				updated_at,
				updated_at,
				updated_at
			FROM sites
			WHERE json_extract(draft, '$.domain') IS NOT NULL`);
		}
	},
	{
		version: 4,
		name: 'ai-gatekeeper-credits',
		up(client) {
			// Credit accounting (gatekeeper spec, revised): plans limit edits/generations
			// per month; raw tokens stay only as an abuse backstop.
			ensureColumn(client, 'ai_usage', 'edit_count', 'integer NOT NULL DEFAULT 0');
			ensureColumn(client, 'ai_usage', 'generation_count', 'integer NOT NULL DEFAULT 0');
			// Gate telemetry: validates the off-topic/approval-rate assumptions the
			// cost model rests on. Cancels = proposed − approved.
			client.exec(`CREATE TABLE IF NOT EXISTS ai_gate_log (
				id text PRIMARY KEY,
				site_id text NOT NULL,
				tenant_id text NOT NULL,
				intent text NOT NULL,
				risk_level text,
				decision text NOT NULL,
				gate_tokens integer NOT NULL DEFAULT 0,
				agent_tokens integer NOT NULL DEFAULT 0,
				model text,
				created_at integer NOT NULL
			)`);
		}
	},
	{
		version: 5,
		name: 'beta-launch',
		up(client) {
			// Closed-beta invite allowlist.
			client.exec(`CREATE TABLE IF NOT EXISTS beta_invites (
				email text PRIMARY KEY,
				profession text,
				status text NOT NULL DEFAULT 'invited',
				notes text,
				invited_at integer NOT NULL,
				joined_at integer
			)`);
			// Domain reservations + hybrid payment.
			client.exec(`CREATE TABLE IF NOT EXISTS domain_reservations (
				id text PRIMARY KEY,
				user_id text NOT NULL,
				site_id text NOT NULL,
				domain text NOT NULL,
				status text NOT NULL DEFAULT 'pending',
				payment_method text NOT NULL DEFAULT 'bank_transfer',
				price_eur text,
				price_try text,
				operator_notes text,
				created_at integer NOT NULL,
				paid_at integer,
				registered_at integer,
				updated_at integer NOT NULL
			)`);
			// One live reservation per domain — cancelled/failed rows don't wedge a retry.
			client.exec(`CREATE UNIQUE INDEX IF NOT EXISTS domain_reservations_live_domain
				ON domain_reservations (domain)
				WHERE status IN ('pending', 'paid', 'registering', 'active')`);
		}
	},
	{
		version: 6,
		name: 'r2-media-assets',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS media_assets (
				id text PRIMARY KEY,
				site_id text NOT NULL,
				owner_user_id text NOT NULL,
				object_key text NOT NULL,
				url text NOT NULL,
				file_name text NOT NULL,
				mime_type text NOT NULL,
				size_bytes integer NOT NULL,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE UNIQUE INDEX IF NOT EXISTS media_assets_object_key_unique
				ON media_assets (object_key)`
			);
			client.exec(
				`CREATE INDEX IF NOT EXISTS media_assets_site_created_idx
				ON media_assets (site_id, created_at)`
			);
		}
	},
	{
		version: 7,
		name: 'ai-provider-cost',
		up(client) {
			ensureColumn(client, 'ai_usage', 'estimated_cost_microusd', 'integer NOT NULL DEFAULT 0');
		}
	},
	{
		version: 8,
		name: 'operational-error-events',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS error_events (
				id text PRIMARY KEY,
				level text NOT NULL DEFAULT 'error',
				source text NOT NULL,
				route text,
				method text,
				status integer,
				user_id text,
				site_id text,
				error_name text NOT NULL,
				message text NOT NULL,
				stack text,
				resolved_at integer,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS error_events_created_idx ON error_events (created_at)`
			);
		}
	},
	{
		version: 9,
		name: 'pending-onboarding',
		up(client) {
			// Guided onboarding Q&A (Hostinger Horizons roadmap Phase 2): a short-lived,
			// anonymous-reachable record of in-progress answers, claimed by a user account
			// at magic-link verify time. No IP column — rateLimit() keys stay in-memory only.
			client.exec(`CREATE TABLE IF NOT EXISTS pending_onboarding (
				id text PRIMARY KEY,
				token_hash text UNIQUE NOT NULL,
				current_step integer NOT NULL DEFAULT 0,
				answers text NOT NULL DEFAULT '{}',
				status text NOT NULL DEFAULT 'in_progress',
				linked_user_id text,
				generated_site_id text,
				created_at integer NOT NULL,
				updated_at integer NOT NULL,
				expires_at integer NOT NULL
			)`);
		}
	}
];

export function runMigrations(
	client: BetterSqlite3.Database,
	list: Migration[] = migrations
): { applied: string[] } {
	client.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		version integer PRIMARY KEY,
		name text NOT NULL,
		applied_at integer NOT NULL
	)`);
	const done = new Set(
		(client.prepare('SELECT version FROM schema_migrations').all() as { version: number }[]).map(
			(row) => row.version
		)
	);
	const applied: string[] = [];
	for (const migration of [...list].sort((a, b) => a.version - b.version)) {
		if (done.has(migration.version)) continue;
		client.transaction(() => {
			migration.up(client);
			client
				.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)')
				.run(migration.version, migration.name, Date.now());
		})();
		applied.push(`${migration.version}-${migration.name}`);
	}
	return { applied };
}
