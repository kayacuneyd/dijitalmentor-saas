import {
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';

// First-slice storage: one local SQLite holding draft Site JSON per site.
// The JSON blob is always validated against the Zod Site schema before write/read use.
export const sites = sqliteTable('sites', {
	id: text('id').primaryKey(),
	tenantId: text('tenant_id').notNull(),
	draft: text('draft', { mode: 'json' }).notNull(),
	// NULL = ownerless demo site (the seeds); set on generation once auth exists (M4).
	ownerUserId: text('owner_user_id'),
	// Points at the site_versions row currently served publicly; NULL = not published.
	publishedVersion: integer('published_version'),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Custom domains are modeled outside the draft JSON so routing and uniqueness
// are enforced by the database, not by whichever draft happens to be read first.
export const customDomains = sqliteTable('custom_domains', {
	hostname: text('hostname').primaryKey(),
	siteId: text('site_id').notNull(),
	// Nullable only for legacy/demo rows migrated from ownerless seed drafts.
	ownerUserId: text('owner_user_id'),
	kind: text('kind').notNull().default('custom'),
	status: text('status').notNull().default('active'),
	verifiedAt: integer('verified_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Immutable publish snapshots (M4: draft → published, versioned).
export const siteVersions = sqliteTable(
	'site_versions',
	{
		siteId: text('site_id').notNull(),
		version: integer('version').notNull(),
		data: text('data', { mode: 'json' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [primaryKey({ columns: [table.siteId, table.version] })]
);

// Auth (M4): magic-link login, DB-backed sessions.
export const users = sqliteTable(
	'users',
	{
		id: text('id').primaryKey(),
		email: text('email').notNull(),
		// Billing (M5/M6): filled by the Stripe webhook.
		stripeCustomerId: text('stripe_customer_id'),
		subscriptionStatus: text('subscription_status'),
		// End of the paid period (from Stripe) — grace window counts from here (M6 policy).
		subscriptionEndsAt: integer('subscription_ends_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [uniqueIndex('users_email_unique').on(table.email)]
);

// Operator-managed credentials/config (M5): DB value wins, env is the fallback.
// The super admin edits these at /admin/settings — no .env edits, no redeploys.
export const appSettings = sqliteTable('app_settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Contact-form submissions from published tenant sites (PLAN §7).
export const contactSubmissions = sqliteTable('contact_submissions', {
	id: text('id').primaryKey(),
	siteId: text('site_id').notNull(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	message: text('message').notNull(),
	locale: text('locale').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Single-use magic-link tokens; only the sha256 hash is stored.
export const loginTokens = sqliteTable('login_tokens', {
	tokenHash: text('token_hash').primaryKey(),
	email: text('email').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Server-side sessions; only the sha256 hash of the cookie value is stored.
export const sessions = sqliteTable('sessions', {
	tokenHash: text('token_hash').primaryKey(),
	userId: text('user_id').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Per-tenant, per-month AI accounting. Credits (edits/generations) are what the
// plan limits enforce; raw tokens remain only as an abuse backstop (gatekeeper spec).
export const aiUsage = sqliteTable(
	'ai_usage',
	{
		tenantId: text('tenant_id').notNull(),
		month: text('month').notNull(), // 'YYYY-MM'
		inputTokens: integer('input_tokens').notNull().default(0),
		outputTokens: integer('output_tokens').notNull().default(0),
		editCount: integer('edit_count').notNull().default(0),
		generationCount: integer('generation_count').notNull().default(0),
		// Integer micro-USD avoids floating-point accumulation in SQLite.
		estimatedCostMicrousd: integer('estimated_cost_microusd').notNull().default(0)
	},
	(table) => [primaryKey({ columns: [table.tenantId, table.month] })]
);

// Closed-beta invite allowlist (beta-launch spec). When BETA_MODE is on, only
// emails here (status != 'revoked') can obtain a magic link. Managed at /admin/invites.
export const betaInvites = sqliteTable('beta_invites', {
	email: text('email').primaryKey(), // normalized (lowercased) email
	profession: text('profession'), // 'law' | 'psych' | 'dental' | free text
	status: text('status').notNull().default('invited'), // invited | joined | revoked
	notes: text('notes'),
	invitedAt: integer('invited_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	joinedAt: integer('joined_at', { mode: 'timestamp' })
});

// Domain reservations (beta-launch spec): a pending-payment record that, once the
// operator (bank transfer) or Stripe (one-time) confirms payment, drives the existing
// domains.ts pipeline. Registration only ever runs after status='paid' (constitution §5).
export const domainReservations = sqliteTable('domain_reservations', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	siteId: text('site_id').notNull(),
	domain: text('domain').notNull(),
	// pending | paid | registering | active | failed | cancelled
	status: text('status').notNull().default('pending'),
	// bank_transfer | stripe
	paymentMethod: text('payment_method').notNull().default('bank_transfer'),
	priceEur: text('price_eur'),
	priceTry: text('price_try'),
	operatorNotes: text('operator_notes'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	paidAt: integer('paid_at', { mode: 'timestamp' }),
	registeredAt: integer('registered_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Gatekeeper telemetry (Layer 1): one row per gate/agent decision. Feeds the
// admin Ops card and validates the cost model's off-topic/approval assumptions.
export const aiGateLog = sqliteTable('ai_gate_log', {
	id: text('id').primaryKey(),
	siteId: text('site_id').notNull(),
	tenantId: text('tenant_id').notNull(),
	intent: text('intent').notNull(),
	riskLevel: text('risk_level'),
	// redirected | answered | help | auto_applied | proposed | approved | forced | fallback
	decision: text('decision').notNull(),
	gateTokens: integer('gate_tokens').notNull().default(0),
	agentTokens: integer('agent_tokens').notNull().default(0),
	model: text('model'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Privacy-safe operational errors. User content and credentials are never stored here.
export const errorEvents = sqliteTable(
	'error_events',
	{
		id: text('id').primaryKey(),
		level: text('level').notNull().default('error'),
		source: text('source').notNull(),
		route: text('route'),
		method: text('method'),
		status: integer('status'),
		userId: text('user_id'),
		siteId: text('site_id'),
		errorName: text('error_name').notNull(),
		message: text('message').notNull(),
		stack: text('stack'),
		resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('error_events_created_idx').on(table.createdAt)]
);

// R2 object index. The object bytes live in Cloudflare; this table provides
// tenant ownership, quota accounting, and a future media-library listing.
export const mediaAssets = sqliteTable(
	'media_assets',
	{
		id: text('id').primaryKey(),
		siteId: text('site_id').notNull(),
		ownerUserId: text('owner_user_id').notNull(),
		objectKey: text('object_key').notNull(),
		url: text('url').notNull(),
		fileName: text('file_name').notNull(),
		mimeType: text('mime_type').notNull(),
		sizeBytes: integer('size_bytes').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		uniqueIndex('media_assets_object_key_unique').on(table.objectKey),
		index('media_assets_site_created_idx').on(table.siteId, table.createdAt)
	]
);
