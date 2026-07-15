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
	},
	{
		version: 10,
		name: 'onboarding-events',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS onboarding_events (
				id text PRIMARY KEY,
				pending_id text,
				user_id text,
				site_id text,
				event text NOT NULL,
				route text,
				source text,
				duration_ms integer,
				error_id text,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS onboarding_events_created_idx
				ON onboarding_events (created_at)`
			);
			client.exec(
				`CREATE INDEX IF NOT EXISTS onboarding_events_pending_idx
				ON onboarding_events (pending_id)`
			);
			client.exec(
				`CREATE INDEX IF NOT EXISTS onboarding_events_site_idx
				ON onboarding_events (site_id)`
			);
		}
	},
	{
		version: 11,
		name: 'admin-customer-panel',
		up(client) {
			// Audit trail shared by every /admin/customers action (subscription
			// override, AI credit top-up, domain detach, unpublish) — a flat
			// "who did what to whom, when" record, not a quota ledger.
			client.exec(`CREATE TABLE IF NOT EXISTS admin_actions (
				id text PRIMARY KEY,
				admin_email text NOT NULL,
				target_user_id text NOT NULL,
				action text NOT NULL,
				detail text NOT NULL,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS admin_actions_target_idx
				ON admin_actions (target_user_id, created_at)`
			);
		}
	},
	{
		version: 12,
		name: 'billing-events',
		up(client) {
			// Seed of a real MRR-over-time series, from this point forward only —
			// subscriptionStatus/subscriptionEndsAt are point-in-time, not a history.
			client.exec(`CREATE TABLE IF NOT EXISTS billing_events (
				id text PRIMARY KEY,
				user_id text NOT NULL,
				kind text NOT NULL,
				stripe_customer_id text,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS billing_events_created_idx
				ON billing_events (created_at)`
			);
		}
	},
	{
		version: 13,
		name: 'support-tickets',
		up(client) {
			// First real implementation of the /pricing "1/ay insan incelemesi"
			// promise — shipped as general support for everyone via the
			// human_review category value; no per-plan quota/gating yet.
			client.exec(`CREATE TABLE IF NOT EXISTS support_tickets (
				id text PRIMARY KEY,
				user_id text NOT NULL,
				site_id text,
				subject text NOT NULL,
				category text NOT NULL DEFAULT 'general',
				status text NOT NULL DEFAULT 'open',
				created_at integer NOT NULL,
				updated_at integer NOT NULL,
				last_message_at integer NOT NULL,
				last_message_by text NOT NULL DEFAULT 'customer'
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS support_tickets_user_idx
				ON support_tickets (user_id, created_at)`
			);
			client.exec(
				`CREATE INDEX IF NOT EXISTS support_tickets_status_idx
				ON support_tickets (status, last_message_at)`
			);
			client.exec(`CREATE TABLE IF NOT EXISTS support_ticket_messages (
				id text PRIMARY KEY,
				ticket_id text NOT NULL,
				author_kind text NOT NULL,
				author_email text NOT NULL,
				body text NOT NULL,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS support_ticket_messages_ticket_idx
				ON support_ticket_messages (ticket_id, created_at)`
			);
		}
	},
	{
		version: 14,
		name: 'beta-profile',
		up(client) {
			ensureColumn(client, 'users', 'full_name', 'text');
			ensureColumn(client, 'users', 'profession', 'text');
			ensureColumn(client, 'users', 'city', 'text');
			ensureColumn(client, 'users', 'beta_profile_completed_at', 'integer');
		}
	},
	{
		version: 15,
		name: 'public-inquiries',
		up(client) {
			// Anonymous/acquisition messaging stays separate from authenticated
			// customer support tickets so the admin UI can keep source semantics clear.
			client.exec(`CREATE TABLE IF NOT EXISTS inquiries (
				id text PRIMARY KEY,
				source text NOT NULL,
				email text NOT NULL,
				name text NOT NULL,
				category text NOT NULL DEFAULT 'other',
				status text NOT NULL DEFAULT 'open',
				user_id text,
				created_at integer NOT NULL,
				updated_at integer NOT NULL,
				last_message_at integer NOT NULL,
				last_message_by text NOT NULL DEFAULT 'visitor'
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS inquiries_status_idx
				ON inquiries (status, last_message_at)`
			);
			client.exec(
				`CREATE INDEX IF NOT EXISTS inquiries_source_idx
				ON inquiries (source, last_message_at)`
			);
			client.exec(
				`CREATE INDEX IF NOT EXISTS inquiries_email_idx
				ON inquiries (email, created_at)`
			);
			client.exec(`CREATE TABLE IF NOT EXISTS inquiry_messages (
				id text PRIMARY KEY,
				inquiry_id text NOT NULL,
				author_kind text NOT NULL,
				author_email text NOT NULL,
				body text NOT NULL,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS inquiry_messages_inquiry_idx
				ON inquiry_messages (inquiry_id, created_at)`
			);
		}
	},
	{
		version: 16,
		name: 'site-chat-messages',
		up(client) {
			// Editor AI chat transcript, per site — seeded from the /new onboarding
			// Q&A and appended to on every subsequent chat turn.
			client.exec(`CREATE TABLE IF NOT EXISTS site_chat_messages (
				id text PRIMARY KEY,
				site_id text NOT NULL,
				role text NOT NULL,
				kind text,
				body text NOT NULL,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS site_chat_messages_site_idx
				ON site_chat_messages (site_id, created_at)`
			);
		}
	},
	{
		version: 17,
		name: 'per-site-pro-public-handles',
		up(client) {
			ensureColumn(client, 'sites', 'public_handle', 'text');
			client.exec(`UPDATE sites
				SET public_handle = lower(replace(id, '_', '-'))
				WHERE public_handle IS NULL OR trim(public_handle) = ''`);
			client.exec(`CREATE UNIQUE INDEX IF NOT EXISTS sites_public_handle_unique
				ON sites (public_handle)
				WHERE public_handle IS NOT NULL`);
			client.exec(`CREATE TABLE IF NOT EXISTS site_subscriptions (
				id text PRIMARY KEY,
				site_id text NOT NULL,
				user_id text NOT NULL,
				provider text NOT NULL,
				provider_customer_id text,
				provider_subscription_id text,
				status text NOT NULL DEFAULT 'active',
				price_eur_monthly integer NOT NULL DEFAULT 17,
				current_period_end integer,
				grace_until integer,
				created_at integer NOT NULL,
				updated_at integer NOT NULL
			)`);
			client.exec(`CREATE INDEX IF NOT EXISTS site_subscriptions_site_user_idx
				ON site_subscriptions (site_id, user_id)`);
			client.exec(`CREATE INDEX IF NOT EXISTS site_subscriptions_user_idx
				ON site_subscriptions (user_id)`);
			client.exec(`CREATE UNIQUE INDEX IF NOT EXISTS site_subscriptions_provider_sub_unique
				ON site_subscriptions (provider, provider_subscription_id)
				WHERE provider_subscription_id IS NOT NULL`);
		}
	},
	{
		version: 18,
		name: 'request-probe-stats',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS request_probe_stats (
				pattern text PRIMARY KEY,
				sample_path text NOT NULL,
				status integer NOT NULL DEFAULT 404,
				count integer NOT NULL DEFAULT 0,
				first_seen_at integer NOT NULL,
				last_seen_at integer NOT NULL,
				last_user_agent_hash text,
				last_ip_prefix_hash text
			)`);
			client.exec(`CREATE INDEX IF NOT EXISTS request_probe_stats_last_seen_idx
				ON request_probe_stats (last_seen_at)`);
			client.exec(`INSERT OR IGNORE INTO request_probe_stats (
				pattern,
				sample_path,
				status,
				count,
				first_seen_at,
				last_seen_at
			)
			SELECT
				CASE
					WHEN lower(coalesce(route, '')) LIKE '%wp-admin%'
						OR lower(coalesce(route, '')) LIKE '%wp-login.php%'
						OR lower(coalesce(route, '')) LIKE '%xmlrpc.php%'
						OR lower(coalesce(route, '')) LIKE '%wlwmanifest.xml%'
						OR lower(coalesce(route, '')) LIKE '%wp-includes%'
						OR lower(coalesce(route, '')) LIKE '%/wordpress/%'
						OR lower(coalesce(route, '')) LIKE '%/wp/%'
					THEN 'wordpress'
					WHEN lower(coalesce(route, '')) LIKE '%/.env%'
						OR lower(coalesce(route, '')) LIKE '%/.git%'
						OR lower(coalesce(route, '')) LIKE '%phpinfo.php%'
						OR lower(coalesce(route, '')) LIKE '%config.php%'
						OR lower(coalesce(route, '')) LIKE '%/backup%'
					THEN 'secret-scan'
					WHEN lower(coalesce(route, '')) = '/favicon.ico'
						OR lower(coalesce(route, '')) = '/favicon.png'
						OR lower(coalesce(route, '')) LIKE '%apple-touch-icon%'
					THEN 'asset-miss'
					WHEN lower(coalesce(route, '')) = '/lander'
						OR lower(coalesce(route, '')) LIKE '/lander/%'
					THEN 'landing-probe'
					WHEN coalesce(route, '') GLOB '/[A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9]*'
						AND length(trim(coalesce(route, ''), '/')) BETWEEN 6 AND 12
					THEN 'random-short-path'
					ELSE 'unknown-404'
				END AS pattern,
				max(coalesce(route, '/')) AS sample_path,
				404 AS status,
				count(*) AS count,
				min(created_at) AS first_seen_at,
				max(created_at) AS last_seen_at
			FROM error_events
			WHERE status = 404
			GROUP BY pattern`);
		}
	},
	{
		version: 19,
		name: 'request-probe-secret-scan-priority',
		up(client) {
			// Rebuild the historical 404 aggregate with secret scans taking precedence
			// over WordPress buckets, so /wp/.env is treated as credential probing.
			client.exec(`DELETE FROM request_probe_stats`);
			client.exec(`INSERT OR IGNORE INTO request_probe_stats (
				pattern,
				sample_path,
				status,
				count,
				first_seen_at,
				last_seen_at
			)
			SELECT
				CASE
					WHEN lower(coalesce(route, '')) LIKE '%/.env%'
						OR lower(coalesce(route, '')) LIKE '%/.git%'
						OR lower(coalesce(route, '')) LIKE '%phpinfo.php%'
						OR lower(coalesce(route, '')) LIKE '%config.php%'
						OR lower(coalesce(route, '')) LIKE '%/backup%'
					THEN 'secret-scan'
					WHEN lower(coalesce(route, '')) LIKE '%wp-admin%'
						OR lower(coalesce(route, '')) LIKE '%wp-login.php%'
						OR lower(coalesce(route, '')) LIKE '%xmlrpc.php%'
						OR lower(coalesce(route, '')) LIKE '%wlwmanifest.xml%'
						OR lower(coalesce(route, '')) LIKE '%wp-includes%'
						OR lower(coalesce(route, '')) LIKE '%/wordpress/%'
						OR lower(coalesce(route, '')) LIKE '%/wp/%'
					THEN 'wordpress'
					WHEN lower(coalesce(route, '')) = '/favicon.ico'
						OR lower(coalesce(route, '')) = '/favicon.png'
						OR lower(coalesce(route, '')) LIKE '%apple-touch-icon%'
					THEN 'asset-miss'
					WHEN lower(coalesce(route, '')) = '/lander'
						OR lower(coalesce(route, '')) LIKE '/lander/%'
					THEN 'landing-probe'
					WHEN coalesce(route, '') GLOB '/[A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9][A-Za-z0-9]*'
						AND length(trim(coalesce(route, ''), '/')) BETWEEN 6 AND 12
					THEN 'random-short-path'
					ELSE 'unknown-404'
				END AS pattern,
				max(coalesce(route, '/')) AS sample_path,
				404 AS status,
				count(*) AS count,
				min(created_at) AS first_seen_at,
				max(created_at) AS last_seen_at
			FROM error_events
			WHERE status = 404
			GROUP BY pattern`);
		}
	},
	{
		version: 20,
		name: 'owner-login',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS owner_sessions (
				token_hash text PRIMARY KEY,
				email text NOT NULL,
				device_hash text NOT NULL,
				ip_prefix_hash text,
				user_agent_hash text,
				created_at integer NOT NULL,
				expires_at integer NOT NULL
			)`);
			client.exec(`CREATE TABLE IF NOT EXISTS owner_trusted_devices (
				device_hash text PRIMARY KEY,
				email text NOT NULL,
				ip_prefix_hash text,
				user_agent_hash text,
				created_at integer NOT NULL,
				last_seen_at integer NOT NULL
			)`);
			client.exec(`CREATE INDEX IF NOT EXISTS owner_trusted_devices_email_idx
				ON owner_trusted_devices (email)`);
			client.exec(`CREATE TABLE IF NOT EXISTS owner_email_codes (
				id text PRIMARY KEY,
				email text NOT NULL,
				device_hash text NOT NULL,
				code_hash text NOT NULL,
				ip_prefix_hash text,
				user_agent_hash text,
				attempts integer NOT NULL DEFAULT 0,
				created_at integer NOT NULL,
				expires_at integer NOT NULL
			)`);
			client.exec(`CREATE INDEX IF NOT EXISTS owner_email_codes_lookup_idx
				ON owner_email_codes (email, device_hash, created_at)`);
			client.exec(`CREATE TABLE IF NOT EXISTS owner_login_events (
				id text PRIMARY KEY,
				email text,
				event text NOT NULL,
				ip_prefix_hash text,
				user_agent_hash text,
				created_at integer NOT NULL
			)`);
			client.exec(`CREATE INDEX IF NOT EXISTS owner_login_events_created_idx
				ON owner_login_events (created_at)`);
		}
	},
	{
		version: 21,
		name: 'blog-cms',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS blog_posts (
				id text PRIMARY KEY,
				slug text NOT NULL,
				status text NOT NULL DEFAULT 'draft',
				cover_image_url text,
				cover_alt text,
				reading_minutes integer NOT NULL DEFAULT 3,
				author_name text NOT NULL DEFAULT 'Cüneyt Kaya',
				published_at integer,
				created_at integer NOT NULL,
				updated_at integer NOT NULL
			)`);
			client.exec(`CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique
				ON blog_posts (slug)`);
			client.exec(`CREATE INDEX IF NOT EXISTS blog_posts_status_published_idx
				ON blog_posts (status, published_at)`);
			client.exec(`CREATE TABLE IF NOT EXISTS blog_post_translations (
				post_id text NOT NULL,
				locale text NOT NULL,
				title text NOT NULL,
				description text NOT NULL,
				category text NOT NULL,
				seo_title text,
				seo_description text,
				body text NOT NULL,
				PRIMARY KEY (post_id, locale)
			)`);
		}
	},
	{
		version: 22,
		name: 'creem-yearly-domain-products',
		up(client) {
			ensureColumn(
				client,
				'site_subscriptions',
				'plan_interval',
				"text NOT NULL DEFAULT 'monthly'"
			);
			ensureColumn(client, 'site_subscriptions', 'price_eur', 'integer NOT NULL DEFAULT 17');
			client.exec(`CREATE TABLE IF NOT EXISTS domain_credits (
				id text PRIMARY KEY,
				user_id text NOT NULL,
				site_id text NOT NULL,
				source text NOT NULL,
				tld text NOT NULL DEFAULT 'com',
				status text NOT NULL DEFAULT 'unused',
				domain text,
				reservation_id text,
				expires_at integer,
				created_at integer NOT NULL,
				used_at integer
			)`);
			client.exec(`CREATE INDEX IF NOT EXISTS domain_credits_user_site_idx
				ON domain_credits (user_id, site_id)`);
			client.exec(`CREATE INDEX IF NOT EXISTS domain_credits_status_idx
				ON domain_credits (status)`);
		}
	},
	{
		version: 23,
		name: 'cloudflare-domain-email-routing',
		up(client) {
			ensureColumn(client, 'domain_reservations', 'cloudflare_zone_id', 'text');
			ensureColumn(client, 'domain_reservations', 'cloudflare_nameservers', 'text');
			ensureColumn(client, 'domain_reservations', 'cloudflare_zone_status', 'text');
			ensureColumn(client, 'domain_reservations', 'email_routing_status', 'text');
			ensureColumn(client, 'domain_reservations', 'email_local_part', 'text');
			ensureColumn(client, 'domain_reservations', 'email_destination', 'text');
			ensureColumn(client, 'domain_reservations', 'email_rule_id', 'text');
			ensureColumn(client, 'domain_reservations', 'email_destination_verified_at', 'integer');
		}
	},
	{
		// Operator-curated story-share library (images + MP4 videos) served on /share
		// and managed at /admin/share. Owner-global, not site-scoped like media_assets.
		version: 24,
		name: 'share-assets',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS share_assets (
				id text PRIMARY KEY,
				kind text NOT NULL,
				object_key text NOT NULL,
				url text NOT NULL,
				file_name text NOT NULL,
				mime_type text NOT NULL,
				size_bytes integer NOT NULL,
				width integer,
				height integer,
				sort_order integer NOT NULL DEFAULT 0,
				active integer NOT NULL DEFAULT 1,
				caption text,
				created_at integer NOT NULL
			)`);
			client.exec(
				`CREATE UNIQUE INDEX IF NOT EXISTS share_assets_object_key_unique ON share_assets (object_key)`
			);
			client.exec(
				`CREATE INDEX IF NOT EXISTS share_assets_active_order_idx ON share_assets (active, sort_order)`
			);
		}
	},
	{
		version: 25,
		name: 'marketing-page-copy',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS marketing_page_copy (
				page text NOT NULL,
				locale text NOT NULL,
				value text NOT NULL,
				updated_at integer NOT NULL,
				PRIMARY KEY (page, locale)
			)`);
		}
	},
	{
		version: 26,
		name: 'site-ai-memory',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS site_ai_memory (
				site_id text PRIMARY KEY,
				content text NOT NULL DEFAULT '',
				version integer NOT NULL DEFAULT 0,
				updated_at integer NOT NULL
			)`);
		}
	},
	{
		version: 27,
		name: 'message-overrides',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS message_overrides (
				key text NOT NULL,
				locale text NOT NULL,
				value text NOT NULL,
				updated_at integer NOT NULL,
				PRIMARY KEY (key, locale)
			)`);
		}
	},
	{
		version: 28,
		name: 'users-locale',
		up(client) {
			// Nullable, no backfill: NULL means "no stored preference yet" and falls
			// back to the sk_locale cookie/detectLocale chain — exactly today's behavior.
			ensureColumn(client, 'users', 'locale', 'text');
		}
	},
	{
		version: 29,
		name: 'flatten-marketing-copy-overrides',
		up(client) {
			const rows = client
				.prepare('SELECT page, locale, value, updated_at FROM marketing_page_copy')
				.all() as { page: string; locale: string; value: string; updated_at: number }[];
			const insert = client.prepare(
				`INSERT INTO message_overrides (key, locale, value, updated_at) VALUES (?, ?, ?, ?)
				 ON CONFLICT(key, locale) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
			);
			for (const row of rows) {
				const flatten = (value: unknown, path: string[]): void => {
					if (typeof value === 'string') {
						if (value.trim())
							insert.run(
								`marketing.${row.page}.${path.join('.')}`,
								row.locale,
								value,
								row.updated_at
							);
						return;
					}
					if (!value || typeof value !== 'object') return;
					for (const [key, child] of Object.entries(value)) flatten(child, [...path, key]);
				};
				try {
					flatten(JSON.parse(row.value), []);
				} catch {
					// Invalid legacy JSON was never renderable as an override; do not let it
					// block the database migration for otherwise valid rows.
				}
			}
		}
	},
	{
		version: 30,
		name: 'site-visit-stats',
		up(client) {
			client.exec(`CREATE TABLE IF NOT EXISTS site_visit_stats (
				site_id text NOT NULL,
				day text NOT NULL,
				locale text NOT NULL,
				page_slug text NOT NULL,
				visits integer NOT NULL DEFAULT 0,
				PRIMARY KEY (site_id, day, locale, page_slug)
			)`);
			client.exec(`CREATE INDEX IF NOT EXISTS site_visit_stats_day_idx ON site_visit_stats (day)`);
			client.exec(
				`CREATE INDEX IF NOT EXISTS site_visit_stats_site_day_idx ON site_visit_stats (site_id, day)`
			);
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
