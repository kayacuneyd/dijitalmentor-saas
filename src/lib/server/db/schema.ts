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
	// Customer-facing saaskaya subdomain handle. Internal `id` remains immutable.
	publicHandle: text('public_handle'),
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
		fullName: text('full_name'),
		profession: text('profession'),
		city: text('city'),
		betaProfileCompletedAt: integer('beta_profile_completed_at', { mode: 'timestamp' }),
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

// Guided onboarding Q&A (Hostinger Horizons roadmap Phase 2): a short-lived, anonymous
// pending record of in-progress answers. `tokenHash` identifies it via either the
// `sk_pending` cookie or the magic-link URL fallback param — never the raw token.
// Claimed (`linkedUserId` set) at /login/verify, consumed once /api/onboarding/finish
// hands the composed description to the unchanged /api/sites contract.
export const pendingOnboarding = sqliteTable('pending_onboarding', {
	id: text('id').primaryKey(),
	tokenHash: text('token_hash').notNull().unique(),
	currentStep: integer('current_step').notNull().default(0),
	answers: text('answers', { mode: 'json' }).notNull().default('{}'),
	// in_progress | completed | consumed
	status: text('status').notNull().default('in_progress'),
	linkedUserId: text('linked_user_id'),
	generatedSiteId: text('generated_site_id'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// Privacy-safe guided-onboarding funnel telemetry. Stores event names and ids
// only — never raw answers, generated descriptions, credentials, or user copy.
export const onboardingEvents = sqliteTable(
	'onboarding_events',
	{
		id: text('id').primaryKey(),
		pendingId: text('pending_id'),
		userId: text('user_id'),
		siteId: text('site_id'),
		event: text('event').notNull(),
		route: text('route'),
		source: text('source'),
		durationMs: integer('duration_ms'),
		errorId: text('error_id'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		index('onboarding_events_created_idx').on(table.createdAt),
		index('onboarding_events_pending_idx').on(table.pendingId),
		index('onboarding_events_site_idx').on(table.siteId)
	]
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

// Audit trail shared by every /admin/customers action (subscription override, AI
// credit top-up, domain detach, publish, unpublish, site delete). A flat "who did
// what to whom, when" record, not a quota ledger — quota adjustments live in ai_usage.
export const adminActions = sqliteTable(
	'admin_actions',
	{
		id: text('id').primaryKey(),
		adminEmail: text('admin_email').notNull(),
		targetUserId: text('target_user_id').notNull(),
		// subscription_override | ai_topup | domain_detach | publish | unpublish | site_delete
		action: text('action').notNull(),
		detail: text('detail').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('admin_actions_target_idx').on(table.targetUserId, table.createdAt)]
);

export const billingEvents = sqliteTable(
	'billing_events',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		// subscription_activated | more kinds added as billing.ts grows
		kind: text('kind').notNull(),
		stripeCustomerId: text('stripe_customer_id'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('billing_events_created_idx').on(table.createdAt)]
);

// Site-scoped paid entitlement. User-level subscription columns stay temporarily
// for legacy/admin views; new checkout flows write here.
export const siteSubscriptions = sqliteTable(
	'site_subscriptions',
	{
		id: text('id').primaryKey(),
		siteId: text('site_id').notNull(),
		userId: text('user_id').notNull(),
		provider: text('provider').notNull(),
		providerCustomerId: text('provider_customer_id'),
		providerSubscriptionId: text('provider_subscription_id'),
		status: text('status').notNull().default('active'),
		priceEurMonthly: integer('price_eur_monthly').notNull().default(17),
		currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
		graceUntil: integer('grace_until', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		index('site_subscriptions_site_user_idx').on(table.siteId, table.userId),
		index('site_subscriptions_user_idx').on(table.userId),
		uniqueIndex('site_subscriptions_provider_sub_unique').on(
			table.provider,
			table.providerSubscriptionId
		)
	]
);

export const supportTickets = sqliteTable(
	'support_tickets',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').notNull(),
		siteId: text('site_id'),
		subject: text('subject').notNull(),
		// general | billing | technical | human_review
		category: text('category').notNull().default('general'),
		// open | pending | resolved | closed
		status: text('status').notNull().default('open'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		lastMessageAt: integer('last_message_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		// customer | admin — who sent the most recent message
		lastMessageBy: text('last_message_by').notNull().default('customer')
	},
	(table) => [
		index('support_tickets_user_idx').on(table.userId, table.createdAt),
		index('support_tickets_status_idx').on(table.status, table.lastMessageAt)
	]
);

export const supportTicketMessages = sqliteTable(
	'support_ticket_messages',
	{
		id: text('id').primaryKey(),
		ticketId: text('ticket_id').notNull(),
		// customer | admin
		authorKind: text('author_kind').notNull(),
		authorEmail: text('author_email').notNull(),
		body: text('body').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('support_ticket_messages_ticket_idx').on(table.ticketId, table.createdAt)]
);

export const inquiries = sqliteTable(
	'inquiries',
	{
		id: text('id').primaryKey(),
		// contact | chat
		source: text('source').notNull(),
		email: text('email').notNull(),
		name: text('name').notNull(),
		// beta_access | support | partnership | billing | other
		category: text('category').notNull().default('other'),
		// open | pending | resolved | closed
		status: text('status').notNull().default('open'),
		userId: text('user_id'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		lastMessageAt: integer('last_message_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		// visitor | admin
		lastMessageBy: text('last_message_by').notNull().default('visitor')
	},
	(table) => [
		index('inquiries_status_idx').on(table.status, table.lastMessageAt),
		index('inquiries_source_idx').on(table.source, table.lastMessageAt),
		index('inquiries_email_idx').on(table.email, table.createdAt)
	]
);

export const inquiryMessages = sqliteTable(
	'inquiry_messages',
	{
		id: text('id').primaryKey(),
		inquiryId: text('inquiry_id').notNull(),
		// visitor | admin
		authorKind: text('author_kind').notNull(),
		authorEmail: text('author_email').notNull(),
		body: text('body').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('inquiry_messages_inquiry_idx').on(table.inquiryId, table.createdAt)]
);

// Editor AI chat transcript, per site. Seeded from the /new onboarding Q&A
// (kind='onboarding_seed') so the conversation visibly continues once the site
// lands in the editor; later turns are the live gatekeeper chat (kind matches the
// /api/sites/[siteId]/chat response kind: reply | applied | redirect | help).
// This is the first place raw chat text is persisted — ai_gate_log deliberately
// stores none.
export const siteChatMessages = sqliteTable(
	'site_chat_messages',
	{
		id: text('id').primaryKey(),
		siteId: text('site_id').notNull(),
		// user | assistant
		role: text('role').notNull(),
		kind: text('kind'),
		body: text('body').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [index('site_chat_messages_site_idx').on(table.siteId, table.createdAt)]
);
