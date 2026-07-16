import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { appSettings } from '$lib/server/db/schema';

/**
 * Operator-managed credentials & config (M5). Resolution order: DB (set by the
 * super admin at /admin/settings) → environment variable → undefined. Everything
 * that needs a credential reads through here, so keys can be added/rotated live
 * without touching `.env` or redeploying.
 */

export type SettingDef = {
	key: string;
	label: string;
	group: 'AI' | 'AI Providers' | 'Email' | 'Billing' | 'Domains' | 'Media' | 'Marketing' | 'Ops';
	secret: boolean;
	help?: string;
};

/** The registry drives the /admin/settings UI — add a row here to expose a new key. */
export const SETTING_DEFS: SettingDef[] = [
	{ key: 'ANTHROPIC_API_KEY', label: 'Anthropic API key', group: 'AI', secret: true },
	{
		key: 'AI_MODEL',
		label: 'Model id (generation + medium/high-risk edits)',
		group: 'AI',
		secret: false,
		help: 'default claude-opus-4-8'
	},
	{
		key: 'AI_MODEL_LIGHT',
		label: 'Model id (low-risk edits)',
		group: 'AI',
		secret: false,
		help: 'default claude-sonnet-5 — risk-routed Layer 2'
	},
	{
		key: 'GATEKEEPER_MODEL',
		label: 'Gatekeeper model id (Layer 1 triage)',
		group: 'AI',
		secret: false,
		help: 'default deepseek-v4-flash — classify/distill before the patch agent'
	},
	{
		key: 'AI_MONTHLY_TOKEN_LIMIT',
		label: 'Monthly token backstop / account',
		group: 'AI',
		secret: false,
		help: 'default 500000 — abuse ceiling; plans are enforced in credits below'
	},
	{
		key: 'AI_EDITS_FREE',
		label: 'AI chat edits / month (Free)',
		group: 'AI',
		secret: false,
		help: 'default 10'
	},
	{
		key: 'AI_EDITS_PRO',
		label: 'AI chat edits / month (Pro)',
		group: 'AI',
		secret: false,
		help: 'default 50'
	},
	{
		key: 'AI_GENERATIONS_FREE',
		label: 'Site generations / month (Free)',
		group: 'AI',
		secret: false,
		help: 'default 1'
	},
	{
		key: 'AI_GENERATIONS_PRO',
		label: 'Site generations / month (Pro)',
		group: 'AI',
		secret: false,
		help: 'default 5'
	},
	{
		key: 'AI_EDITS_PREMIUM',
		label: 'AI chat edits / month (Premium)',
		group: 'AI',
		secret: false,
		help: 'default 200'
	},
	{
		key: 'AI_GENERATIONS_PREMIUM',
		label: 'Site generations / month (Premium)',
		group: 'AI',
		secret: false,
		help: 'default 20'
	},
	{
		key: 'AI_BUDGET_FREE_USD',
		label: 'Per-tenant monthly AI $ cap (Free)',
		group: 'AI',
		secret: false,
		help: 'default 1 — real dollar safety net alongside the credit limits above'
	},
	{
		key: 'AI_BUDGET_PRO_USD',
		label: 'Per-tenant monthly AI $ cap (Pro)',
		group: 'AI',
		secret: false,
		help: 'default 4 — real dollar safety net alongside the credit limits above'
	},
	{
		key: 'GATEKEEPER_PROVIDER',
		label: 'Gatekeeper provider',
		group: 'AI Providers',
		secret: false,
		help: 'deepseek / groq / anthropic; default deepseek'
	},
	{
		key: 'GATEKEEPER_FALLBACK_PROVIDER',
		label: 'Gatekeeper fallback provider',
		group: 'AI Providers',
		secret: false,
		help: 'default groq for DeepSeek; used after transient/rate-limit/tool-output failures'
	},
	{ key: 'GROQ_API_KEY', label: 'Groq API key', group: 'AI Providers', secret: true },
	{
		key: 'GROQ_MODEL',
		label: 'Groq gatekeeper model',
		group: 'AI Providers',
		secret: false,
		help: 'default llama-3.3-70b-versatile'
	},
	{
		key: 'AI_PROVIDER',
		label: 'Layer-2 provider',
		group: 'AI Providers',
		secret: false,
		help: 'deepseek / anthropic; beta default deepseek'
	},
	{
		key: 'AI_FALLBACK_PROVIDER',
		label: 'Layer-2 fallback provider',
		group: 'AI Providers',
		secret: false,
		help: 'optional: anthropic / deepseek; used after rate-limit or structured-request rejection'
	},
	{ key: 'DEEPSEEK_API_KEY', label: 'DeepSeek API key', group: 'AI Providers', secret: true },
	{
		key: 'DEEPSEEK_MODEL_LIGHT',
		label: 'DeepSeek light model',
		group: 'AI Providers',
		secret: false,
		help: 'default deepseek-v4-flash'
	},
	{
		key: 'DEEPSEEK_MODEL_HEAVY',
		label: 'DeepSeek heavy model',
		group: 'AI Providers',
		secret: false,
		help: 'default deepseek-v4-pro'
	},
	{
		key: 'AI_GLOBAL_MONTHLY_BUDGET_USD',
		label: 'Global monthly AI budget (USD)',
		group: 'AI Providers',
		secret: false,
		help: 'hard application backstop; default 5'
	},
	{
		key: 'MEDIA_LIMIT_FREE_MB',
		label: 'Free site media limit (MB)',
		group: 'Media',
		secret: false,
		help: 'default 20 MB'
	},
	{
		key: 'MEDIA_LIMIT_PRO_MB',
		label: 'Pro site media limit (MB)',
		group: 'Media',
		secret: false,
		help: 'default 500 MB'
	},
	{
		key: 'MEDIA_LIMIT_PREMIUM_MB',
		label: 'Premium site media limit (MB)',
		group: 'Media',
		secret: false,
		help: 'default 2048 MB'
	},
	{
		key: 'CREEM_AI_TOPUP_PRODUCT_ID',
		label: 'Creem AI top-up product id',
		group: 'Billing',
		secret: false,
		help: 'optional one-time product; grants 10 edits + 1 generation'
	},
	{
		key: 'STRIPE_AI_TOPUP_PRICE_ID',
		label: 'Stripe AI top-up price id',
		group: 'Billing',
		secret: false,
		help: 'optional one-time price; grants 10 edits + 1 generation'
	},
	{
		key: 'EMAIL_PROVIDER',
		label: 'Email provider',
		group: 'Email',
		secret: false,
		help: 'smtp / resend / unset = dev echo'
	},
	{ key: 'RESEND_API_KEY', label: 'Resend API key', group: 'Email', secret: true },
	{
		key: 'SMTP_HOST',
		label: 'SMTP host',
		group: 'Email',
		secret: false,
		help: 'e.g. smtp.hostinger.com'
	},
	{
		key: 'SMTP_PORT',
		label: 'SMTP port',
		group: 'Email',
		secret: false,
		help: '465 (SSL) or 587 (STARTTLS); default 465'
	},
	{
		key: 'SMTP_USER',
		label: 'SMTP user',
		group: 'Email',
		secret: true,
		help: 'e.g. noreply@saaskaya.com'
	},
	{ key: 'SMTP_PASS', label: 'SMTP password', group: 'Email', secret: true },
	{
		key: 'EMAIL_FROM',
		label: 'From address',
		group: 'Email',
		secret: false,
		help: 'e.g. saaskaya <noreply@yourdomain.com>; falls back to SMTP user / onboarding@resend.dev'
	},
	{
		key: 'BETA_ENTRY_CODE',
		label: 'Public beta entry code',
		group: 'Ops',
		secret: false,
		help: 'optional code required by /beta?code=...; leave empty for an open self-serve beta form'
	},
	{
		key: 'GA_MEASUREMENT_ID',
		label: 'Google Analytics measurement id',
		group: 'Marketing',
		secret: false,
		help: 'GA4 id, e.g. G-XXXXXXXXXX; applied only to the saaskaya app host, not customer sites'
	},
	{
		key: 'GOOGLE_SITE_VERIFICATION',
		label: 'Google Search Console verification',
		group: 'Marketing',
		secret: false,
		help: 'content value for the google-site-verification meta tag'
	},
	{ key: 'STRIPE_SECRET_KEY', label: 'Stripe secret key', group: 'Billing', secret: true },
	{ key: 'STRIPE_WEBHOOK_SECRET', label: 'Stripe webhook secret', group: 'Billing', secret: true },
	{
		key: 'STRIPE_PRICE_ID',
		label: 'Stripe price id (subscription)',
		group: 'Billing',
		secret: false
	},
	{
		key: 'PAYMENT_PROVIDER',
		label: 'Primary payment provider',
		group: 'Billing',
		secret: false,
		help: 'stripe / creem; unset keeps Stripe unless only Creem is configured'
	},
	{ key: 'CREEM_API_KEY', label: 'Creem API key', group: 'Billing', secret: true },
	{ key: 'CREEM_WEBHOOK_SECRET', label: 'Creem webhook secret', group: 'Billing', secret: true },
	{
		key: 'CREEM_PRO_PRODUCT_ID',
		label: 'Creem Pro product id (legacy monthly fallback)',
		group: 'Billing',
		secret: false
	},
	{
		key: 'CREEM_PRO_MONTHLY_PRODUCT_ID',
		label: 'Creem Pro Monthly product id',
		group: 'Billing',
		secret: false
	},
	{
		key: 'CREEM_PRO_YEARLY_PRODUCT_ID',
		label: 'Creem Pro Yearly product id',
		group: 'Billing',
		secret: false
	},
	{
		key: 'CREEM_DOMAIN_PRODUCT_ID',
		label: 'Creem .com Domain product id',
		group: 'Billing',
		secret: false
	},
	{
		key: 'CREEM_TEST_MODE',
		label: 'Creem test mode (1 = test API)',
		group: 'Billing',
		secret: false,
		help: 'uses https://test-api.creem.io/v1/checkouts when set to 1'
	},
	{
		key: 'PAYMENT_MODE',
		label: 'Domain payment mode',
		group: 'Billing',
		secret: false,
		help: 'disabled / bank_only / hybrid / card_only; legacy stripe_only also means card checkout through the active provider'
	},
	{
		key: 'DOMAIN_PRICE_EUR',
		label: 'Domain price (EUR)',
		group: 'Billing',
		secret: false,
		help: 'shown on the reservation card; default 15'
	},
	{
		key: 'DOMAIN_PRICE_TRY',
		label: 'Domain price (TRY)',
		group: 'Billing',
		secret: false,
		help: 'bank-transfer equivalent shown to the user; default 500'
	},
	{
		key: 'PRO_PRICE_EUR',
		label: 'Pro subscription price (EUR/month)',
		group: 'Billing',
		secret: false,
		help: 'default 17 — used only for the /admin MRR estimate; no per-tier breakdown (Premium is not an enforced tier yet)'
	},
	{
		key: 'BANK_IBAN',
		label: 'Bank IBAN (bank transfer)',
		group: 'Billing',
		secret: false,
		help: 'shown to users choosing bank transfer'
	},
	{
		key: 'BANK_ACCOUNT_HOLDER',
		label: 'Bank account holder',
		group: 'Billing',
		secret: false
	},
	{ key: 'PORKBUN_API_KEY', label: 'Porkbun API key', group: 'Domains', secret: true },
	{ key: 'PORKBUN_SECRET_KEY', label: 'Porkbun secret key', group: 'Domains', secret: true },
	{
		key: 'CLOUDFLARE_API_TOKEN',
		label: 'Cloudflare API token',
		group: 'Domains',
		secret: true,
		help: 'DNS + Email Routing automation token; keep scoped to DNS/Zone/Email Routing only'
	},
	{
		key: 'CLOUDFLARE_ACCOUNT_ID',
		label: 'Cloudflare account id',
		group: 'Domains',
		secret: false,
		help: 'used for Email Routing destination addresses'
	},
	{
		key: 'CLOUDFLARE_EMAIL_DEFAULT_LOCAL_PART',
		label: 'Default email forwarding local part',
		group: 'Domains',
		secret: false,
		help: 'default info; used for info@customer-domain.com style forwarding'
	},
	{
		key: 'SERVER_IP',
		label: 'Server IPv4',
		group: 'Domains',
		secret: false,
		help: 'used to verify DNS + create A records'
	},
	{
		key: 'DOMAIN_PROVISION',
		label: 'Auto-provision nginx+TLS (1 = on)',
		group: 'Domains',
		secret: false,
		help: 'runs scripts/provision-domain.sh on attach'
	},
	{
		key: 'R2_ENDPOINT',
		label: 'R2 S3 endpoint',
		group: 'Media',
		secret: false,
		help: 'https://<account-id>.r2.cloudflarestorage.com'
	},
	{ key: 'R2_ACCESS_KEY_ID', label: 'R2 access key id', group: 'Media', secret: true },
	{ key: 'R2_SECRET_ACCESS_KEY', label: 'R2 secret access key', group: 'Media', secret: true },
	{
		key: 'R2_BUCKET',
		label: 'R2 bucket',
		group: 'Media',
		secret: false,
		help: 'default saaskaya-media'
	},
	{
		key: 'R2_PUBLIC_BASE_URL',
		label: 'R2 public CDN URL',
		group: 'Media',
		secret: false,
		help: 'https://cdn.saaskaya.com'
	},
	{
		key: 'BETA_MODE',
		label: 'Closed beta (1 = invite-only)',
		group: 'Ops',
		secret: false,
		help: 'when on, only emails in /admin/invites can sign in'
	},
	{
		key: 'SHARE_PAGE_ENABLED',
		label: 'Public share page (1 = on)',
		group: 'Ops',
		secret: false,
		help: 'enables /share (story-share assets from /admin/share); empty = 404'
	},
	{
		key: 'GRACE_DAYS',
		label: 'Grace period after cancellation (days)',
		group: 'Ops',
		secret: false,
		help: 'default 30 — see docs/POLICY.md'
	},
	{
		key: 'CRON_TOKEN',
		label: 'Cron token (x-cron-token for /api/admin/tasks/daily)',
		group: 'Ops',
		secret: true
	},
	{
		key: 'ALERT_EMAIL',
		label: 'Alert email (monitoring + new support tickets)',
		group: 'Ops',
		secret: false,
		help: 'scripts/monitor.sh mails here on downtime, and a new support ticket mails here too (needs Resend key)'
	},
	{
		key: 'MONITOR_AUTORESTART',
		label: 'Auto-restart on failed health check (1 = on)',
		group: 'Ops',
		secret: false,
		help: 'scripts/monitor.sh runs "pm2 restart saaskaya"'
	},
	{
		key: 'BACKUP_REMOTE',
		label: 'Off-site backup target',
		group: 'Ops',
		secret: false,
		help: 'rclone remote (remote:path) or scp target (user@host:path); empty = local only'
	}
];

const KNOWN_KEYS = new Set(SETTING_DEFS.map((d) => d.key));

/** DB value wins; env var is the fallback; empty strings count as unset. */
export function getSetting(key: string): string | undefined {
	const row = db.select().from(appSettings).where(eq(appSettings.key, key)).get();
	const value = row?.value ?? env[key];
	return value ? value : undefined;
}

export function setSetting(key: string, value: string): void {
	if (!KNOWN_KEYS.has(key)) throw new Error(`unknown setting "${key}"`);
	db.insert(appSettings)
		.values({ key, value, updatedAt: new Date() })
		.onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } })
		.run();
}

export function clearSetting(key: string): void {
	if (!KNOWN_KEYS.has(key)) throw new Error(`unknown setting "${key}"`);
	db.delete(appSettings).where(eq(appSettings.key, key)).run();
}

/** For the admin UI: never returns the full secret value. */
export function maskValue(value: string | undefined, secret: boolean): string {
	if (!value) return '';
	if (!secret) return value;
	return value.length <= 6 ? '••••' : `••••${value.slice(-4)}`;
}

/** Where the current value comes from, for display: 'db' | 'env' | ''. */
export function settingSource(key: string): 'db' | 'env' | '' {
	const row = db.select().from(appSettings).where(eq(appSettings.key, key)).get();
	if (row?.value) return 'db';
	return env[key] ? 'env' : '';
}
