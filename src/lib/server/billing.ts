import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { billingEvents, siteSubscriptions, users } from '$lib/server/db/schema';
import { getSetting } from '$lib/server/config';
import { confirmPayment, domainPriceEur } from '$lib/server/reservations';

/**
 * Stripe subscriptions (PLAN §8) over the plain REST API — no SDK, one less
 * dependency; the two calls we need are a form-POST and an HMAC check.
 * Everything degrades gracefully while the operator hasn't entered keys yet.
 */

export class BillingNotConfiguredError extends Error {}

export type BillingProvider = 'stripe' | 'creem';
export const PRO_SITE_PRICE_EUR_MONTHLY = 17;

function normalizedProvider(value: string | undefined): BillingProvider | undefined {
	const normalized = value?.trim().toLowerCase();
	if (normalized === 'stripe' || normalized === 'creem') return normalized;
	return undefined;
}

export function creemConfigured(): boolean {
	return Boolean(getSetting('CREEM_API_KEY') && getSetting('CREEM_PRO_PRODUCT_ID'));
}

export function stripeConfigured(): boolean {
	return Boolean(getSetting('STRIPE_SECRET_KEY') && getSetting('STRIPE_PRICE_ID'));
}

export function billingProvider(): BillingProvider {
	const configured = normalizedProvider(getSetting('PAYMENT_PROVIDER'));
	if (configured) return configured;
	// Backwards-compatible default: keep Stripe unless only Creem has been configured.
	return !stripeConfigured() && creemConfigured() ? 'creem' : 'stripe';
}

export function billingConfigured(): boolean {
	return billingProvider() === 'creem' ? creemConfigured() : stripeConfigured();
}

export async function createCheckoutSession(input: {
	userId: string;
	email: string;
	origin: string;
	siteId: string;
}): Promise<string> {
	if (billingProvider() === 'creem') return createCreemCheckoutSession(input);
	return createStripeCheckoutSession(input);
}

export async function createStripeCheckoutSession(input: {
	userId: string;
	email: string;
	origin: string;
	siteId: string;
}): Promise<string> {
	const secretKey = getSetting('STRIPE_SECRET_KEY');
	const priceId = getSetting('STRIPE_PRICE_ID');
	if (!secretKey || !priceId) {
		throw new BillingNotConfiguredError('Billing is not configured yet.');
	}
	const body = new URLSearchParams({
		mode: 'subscription',
		'line_items[0][price]': priceId,
		'line_items[0][quantity]': '1',
		client_reference_id: input.userId,
		customer_email: input.email,
		success_url: `${input.origin}/dashboard?billing=success&site=${encodeURIComponent(input.siteId)}`,
		cancel_url: `${input.origin}/dashboard?billing=cancelled&site=${encodeURIComponent(input.siteId)}`,
		'metadata[kind]': 'site_subscription',
		'metadata[siteId]': input.siteId,
		'metadata[userId]': input.userId,
		'metadata[plan]': 'pro',
		'metadata[price]': `${PRO_SITE_PRICE_EUR_MONTHLY} EUR/month`,
		'subscription_data[metadata][kind]': 'site_subscription',
		'subscription_data[metadata][siteId]': input.siteId,
		'subscription_data[metadata][userId]': input.userId,
		'subscription_data[metadata][plan]': 'pro',
		'subscription_data[metadata][price]': `${PRO_SITE_PRICE_EUR_MONTHLY} EUR/month`
	});
	const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
		method: 'POST',
		headers: {
			authorization: `Bearer ${secretKey}`,
			'content-type': 'application/x-www-form-urlencoded'
		},
		body
	});
	const session = (await res.json()) as { url?: string; error?: { message?: string } };
	if (!res.ok || !session.url) {
		throw new Error(`Stripe checkout failed: ${session.error?.message ?? res.status}`);
	}
	return session.url;
}

type CreemCheckoutResponse = {
	checkout_url?: string;
	checkoutUrl?: string;
	error?: string;
	message?: string | string[];
};

function creemApiBase(): string {
	return getSetting('CREEM_TEST_MODE') === '1'
		? 'https://test-api.creem.io/v1'
		: 'https://api.creem.io/v1';
}

function messageFromCreemError(body: CreemCheckoutResponse, fallback: number): string {
	if (Array.isArray(body.message)) return body.message.join(', ');
	return body.message ?? body.error ?? String(fallback);
}

export async function createCreemCheckoutSession(input: {
	userId: string;
	email: string;
	origin: string;
	siteId: string;
}): Promise<string> {
	const apiKey = getSetting('CREEM_API_KEY');
	const productId = getSetting('CREEM_PRO_PRODUCT_ID');
	if (!apiKey || !productId) {
		throw new BillingNotConfiguredError('Creem billing is not configured yet.');
	}
	const res = await fetch(`${creemApiBase()}/checkouts`, {
		method: 'POST',
		headers: {
			'x-api-key': apiKey,
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			product_id: productId,
			request_id: `pro-site-${input.siteId}-${Date.now()}`,
			success_url: `${input.origin}/dashboard?billing=success&site=${encodeURIComponent(input.siteId)}`,
			customer: { email: input.email },
			metadata: {
				kind: 'site_subscription',
				siteId: input.siteId,
				userId: input.userId,
				referenceId: input.userId,
				internal_customer_id: input.userId,
				plan: 'pro',
				price: `${PRO_SITE_PRICE_EUR_MONTHLY} EUR/month`
			}
		})
	});
	const session = (await res.json()) as CreemCheckoutResponse;
	const checkoutUrl = session.checkout_url ?? session.checkoutUrl;
	if (!res.ok || !checkoutUrl) {
		throw new Error(`Creem checkout failed: ${messageFromCreemError(session, res.status)}`);
	}
	return checkoutUrl;
}

/**
 * One-time Stripe checkout for a domain reservation (beta-launch Phase 3).
 * `mode=payment` (NOT subscription) and `metadata.reservationId` are what the
 * webhook uses to route the completed event to domain fulfillment rather than
 * subscription activation.
 */
export async function createDomainCheckoutSession(input: {
	userId: string;
	email: string;
	origin: string;
	domain: string;
	reservationId: string;
}): Promise<string> {
	const secretKey = getSetting('STRIPE_SECRET_KEY');
	if (!secretKey) throw new BillingNotConfiguredError('Billing is not configured yet.');
	const eur = Number(domainPriceEur());
	const unitAmount = Math.round((Number.isFinite(eur) && eur > 0 ? eur : 15) * 100); // cents
	const body = new URLSearchParams({
		mode: 'payment',
		'line_items[0][quantity]': '1',
		'line_items[0][price_data][currency]': 'eur',
		'line_items[0][price_data][unit_amount]': String(unitAmount),
		'line_items[0][price_data][product_data][name]': `Domain: ${input.domain}`,
		client_reference_id: input.userId,
		customer_email: input.email,
		'metadata[reservationId]': input.reservationId,
		'metadata[kind]': 'domain',
		success_url: `${input.origin}/dashboard?domain=paid`,
		cancel_url: `${input.origin}/dashboard?domain=cancelled`
	});
	const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
		method: 'POST',
		headers: {
			authorization: `Bearer ${secretKey}`,
			'content-type': 'application/x-www-form-urlencoded'
		},
		body
	});
	const session = (await res.json()) as { url?: string; error?: { message?: string } };
	if (!res.ok || !session.url) {
		throw new Error(`Stripe domain checkout failed: ${session.error?.message ?? res.status}`);
	}
	return session.url;
}

/**
 * Stripe webhook signature: `stripe-signature: t=<ts>,v1=<hmac>` where the HMAC
 * is SHA-256 of `<ts>.<rawBody>` with the webhook secret. 5-minute tolerance.
 */
export function verifyStripeSignature(
	rawBody: string,
	signatureHeader: string | null,
	secret: string,
	nowMs = Date.now()
): boolean {
	if (!signatureHeader) return false;
	const parts = new Map(signatureHeader.split(',').map((p) => p.split('=', 2) as [string, string]));
	const timestamp = Number(parts.get('t'));
	const signature = parts.get('v1');
	if (!Number.isFinite(timestamp) || !signature) return false;
	if (Math.abs(nowMs / 1000 - timestamp) > 300) return false;
	const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
	const a = Buffer.from(expected);
	const b = Buffer.from(signature);
	return a.length === b.length && timingSafeEqual(a, b);
}

/** Creem webhook signature: HMAC-SHA256(rawBody, CREEM_WEBHOOK_SECRET) in `creem-signature`. */
export function verifyCreemSignature(
	rawBody: string,
	signatureHeader: string | null,
	secret: string
): boolean {
	if (!signatureHeader) return false;
	const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
	const a = Buffer.from(expected);
	const b = Buffer.from(signatureHeader.trim());
	return a.length === b.length && timingSafeEqual(a, b);
}

export type SiteSubscriptionStatus =
	'active' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'comped' | 'paused';

export type SiteSubscriptionState =
	{ state: 'free' } | { state: 'active' } | { state: 'grace'; until: Date };

export function activateSiteSubscription(input: {
	siteId: string;
	userId: string;
	provider: BillingProvider | 'manual';
	providerCustomerId?: string | null;
	providerSubscriptionId?: string | null;
	status?: SiteSubscriptionStatus | string;
	currentPeriodEnd?: Date;
}): void {
	const now = new Date();
	const existing = input.providerSubscriptionId
		? db
				.select()
				.from(siteSubscriptions)
				.where(
					and(
						eq(siteSubscriptions.provider, input.provider),
						eq(siteSubscriptions.providerSubscriptionId, input.providerSubscriptionId)
					)
				)
				.get()
		: db
				.select()
				.from(siteSubscriptions)
				.where(
					and(
						eq(siteSubscriptions.siteId, input.siteId),
						eq(siteSubscriptions.userId, input.userId)
					)
				)
				.get();
	const row = {
		siteId: input.siteId,
		userId: input.userId,
		provider: input.provider,
		providerCustomerId: input.providerCustomerId ?? null,
		providerSubscriptionId: input.providerSubscriptionId ?? null,
		status: input.status ?? 'active',
		priceEurMonthly: PRO_SITE_PRICE_EUR_MONTHLY,
		currentPeriodEnd: input.currentPeriodEnd,
		graceUntil: input.currentPeriodEnd
			? new Date(input.currentPeriodEnd.getTime() + graceDays() * 86_400_000)
			: undefined,
		updatedAt: now
	};
	if (existing) {
		db.update(siteSubscriptions).set(row).where(eq(siteSubscriptions.id, existing.id)).run();
		return;
	}
	db.insert(siteSubscriptions)
		.values({
			id: `ss-${randomUUID().slice(0, 8)}`,
			...row,
			createdAt: now
		})
		.run();
}

export function siteSubscriptionState(siteId: string, userId: string): SiteSubscriptionState {
	const row = db
		.select()
		.from(siteSubscriptions)
		.where(and(eq(siteSubscriptions.siteId, siteId), eq(siteSubscriptions.userId, userId)))
		.orderBy(desc(siteSubscriptions.updatedAt))
		.get();
	if (!row) return { state: 'free' };
	if (row.status === 'active' || row.status === 'trialing' || row.status === 'comped') {
		return { state: 'active' };
	}
	const until = row.graceUntil ?? row.currentPeriodEnd;
	if (!until) return { state: 'free' };
	return until.getTime() > Date.now() ? { state: 'grace', until } : { state: 'free' };
}

export function hasActiveSiteSubscription(siteId: string, userId: string): boolean {
	return siteSubscriptionState(siteId, userId).state !== 'free';
}

type StripeEvent = {
	type: string;
	data: {
		object: {
			id?: string | null;
			client_reference_id?: string | null;
			customer?: string | null;
			subscription?: string | null;
			status?: string;
			mode?: string;
			metadata?: {
				reservationId?: string;
				kind?: string;
				siteId?: string;
				userId?: string;
				plan?: string;
				price?: string;
			} | null;
			/** epoch seconds — end of the paid period */
			current_period_end?: number;
		};
	};
};

/** Idempotent status updates driven by webhook events. Returns what changed (for tests/logs). */
export function handleStripeEvent(event: StripeEvent): string {
	const object = event.data.object;
	switch (event.type) {
		case 'checkout.session.completed': {
			// A one-time DOMAIN payment shares this event type with subscription
			// checkout — route by mode/metadata so it never flips the user to Pro.
			const reservationId = object.metadata?.reservationId;
			if (object.mode === 'payment' || reservationId) {
				if (!reservationId) return 'ignored: domain payment without reservationId';
				confirmPayment(reservationId); // → paid; cron/admin fulfills (register+attach)
				return `domain reservation paid ${reservationId}`;
			}
			if (object.metadata?.kind === 'site_subscription') {
				const siteId = object.metadata.siteId;
				const userId = object.metadata.userId ?? object.client_reference_id ?? undefined;
				if (!siteId || !userId) return 'ignored: site subscription without siteId/userId';
				activateSiteSubscription({
					siteId,
					userId,
					provider: 'stripe',
					providerCustomerId: object.customer ?? null,
					providerSubscriptionId: object.subscription ?? null,
					status: 'active',
					currentPeriodEnd: object.current_period_end
						? new Date(object.current_period_end * 1000)
						: undefined
				});
				db.insert(billingEvents)
					.values({
						id: `be-${randomUUID().slice(0, 8)}`,
						userId,
						kind: 'site_subscription_activated',
						stripeCustomerId: object.customer ?? null
					})
					.run();
				return `activated site ${siteId} for ${userId}`;
			}
			const userId = object.client_reference_id;
			if (!userId) return 'ignored: no client_reference_id';
			db.update(users)
				.set({ stripeCustomerId: object.customer ?? null, subscriptionStatus: 'active' })
				.where(eq(users.id, userId))
				.run();
			db.insert(billingEvents)
				.values({
					id: `be-${randomUUID().slice(0, 8)}`,
					userId,
					kind: 'subscription_activated',
					stripeCustomerId: object.customer ?? null
				})
				.run();
			return `activated ${userId}`;
		}
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted': {
			const customer = object.customer;
			if (!customer) return 'ignored: no customer';
			const status = event.type.endsWith('deleted') ? 'canceled' : (object.status ?? 'active');
			const periodEnd = object.current_period_end
				? new Date(object.current_period_end * 1000)
				: undefined;
			const subscriptionId = object.subscription ?? object.id ?? undefined;
			if (subscriptionId) {
				const row = db
					.select()
					.from(siteSubscriptions)
					.where(eq(siteSubscriptions.providerSubscriptionId, subscriptionId))
					.get();
				if (row) {
					activateSiteSubscription({
						siteId: row.siteId,
						userId: row.userId,
						provider: 'stripe',
						providerCustomerId: customer,
						providerSubscriptionId: subscriptionId,
						status,
						currentPeriodEnd: periodEnd ?? row.currentPeriodEnd ?? undefined
					});
					return `site status ${status} for ${row.siteId}`;
				}
			}
			db.update(users)
				.set({
					subscriptionStatus: status,
					// the grace window (docs/POLICY.md) counts from the end of the paid period
					...(object.current_period_end
						? { subscriptionEndsAt: new Date(object.current_period_end * 1000) }
						: {})
				})
				.where(eq(users.stripeCustomerId, customer))
				.run();
			return `status ${status} for customer ${customer}`;
		}
		default:
			return `ignored: ${event.type}`;
	}
}

type CreemEvent = {
	eventType?: string;
	type?: string;
	object?: {
		customer?: string | { id?: string | null; email?: string | null } | null;
		status?: string | null;
		id?: string | null;
		metadata?: {
			userId?: string;
			internal_customer_id?: string;
			referenceId?: string;
			siteId?: string;
			kind?: string;
		} | null;
		current_period_end_date?: string | null;
		next_transaction_date?: string | null;
		checkout?: {
			id?: string | null;
			metadata?: {
				userId?: string;
				internal_customer_id?: string;
				referenceId?: string;
				siteId?: string;
				kind?: string;
			} | null;
		} | null;
		subscription?: {
			id?: string | null;
			customer?: string | { id?: string | null } | null;
			status?: string | null;
			metadata?: {
				userId?: string;
				internal_customer_id?: string;
				referenceId?: string;
				siteId?: string;
				kind?: string;
			} | null;
			current_period_end_date?: string | null;
			next_transaction_date?: string | null;
		} | null;
	} | null;
	data?: {
		customer?: string | { id?: string | null; email?: string | null } | null;
		status?: string | null;
		id?: string | null;
		metadata?: {
			userId?: string;
			internal_customer_id?: string;
			referenceId?: string;
			siteId?: string;
			kind?: string;
		} | null;
		current_period_end_date?: string | null;
		next_transaction_date?: string | null;
		checkout?: {
			id?: string | null;
			metadata?: {
				userId?: string;
				internal_customer_id?: string;
				referenceId?: string;
				siteId?: string;
				kind?: string;
			} | null;
		} | null;
		subscription?: {
			id?: string | null;
			customer?: string | { id?: string | null } | null;
			status?: string | null;
			metadata?: {
				userId?: string;
				internal_customer_id?: string;
				referenceId?: string;
				siteId?: string;
				kind?: string;
			} | null;
			current_period_end_date?: string | null;
			next_transaction_date?: string | null;
		} | null;
	} | null;
};

function creemObject(event: CreemEvent): NonNullable<CreemEvent['object']> {
	return (event.object ?? event.data ?? {}) as NonNullable<CreemEvent['object']>;
}

function creemCustomerId(object: NonNullable<CreemEvent['object']>): string | null {
	const value = object.customer ?? object.subscription?.customer;
	if (typeof value === 'string') return value;
	return value?.id ?? null;
}

function creemUserId(object: NonNullable<CreemEvent['object']>): string | undefined {
	const metadata = object.metadata ?? object.subscription?.metadata ?? object.checkout?.metadata;
	return metadata?.userId ?? metadata?.internal_customer_id ?? metadata?.referenceId;
}

function creemSiteId(object: NonNullable<CreemEvent['object']>): string | undefined {
	const metadata = object.metadata ?? object.subscription?.metadata ?? object.checkout?.metadata;
	return metadata?.siteId;
}

function creemSubscriptionId(object: NonNullable<CreemEvent['object']>): string | null {
	return object.subscription?.id ?? object.id ?? null;
}

function creemPeriodEnd(object: NonNullable<CreemEvent['object']>): Date | undefined {
	const value =
		object.current_period_end_date ??
		object.subscription?.current_period_end_date ??
		object.next_transaction_date ??
		object.subscription?.next_transaction_date;
	if (!value) return undefined;
	const date = new Date(value);
	return Number.isFinite(date.getTime()) ? date : undefined;
}

function activateCreemSubscription(
	userId: string,
	customerId: string | null,
	periodEnd?: Date
): string {
	db.update(users)
		.set({
			stripeCustomerId: customerId,
			subscriptionStatus: 'active',
			...(periodEnd ? { subscriptionEndsAt: periodEnd } : {})
		})
		.where(eq(users.id, userId))
		.run();
	db.insert(billingEvents)
		.values({
			id: `be-${randomUUID().slice(0, 8)}`,
			userId,
			kind: 'subscription_activated',
			stripeCustomerId: customerId
		})
		.run();
	return `creem activated ${userId}`;
}

function activateCreemSiteSubscription(
	siteId: string,
	userId: string,
	customerId: string | null,
	subscriptionId: string | null,
	periodEnd?: Date
): string {
	activateSiteSubscription({
		siteId,
		userId,
		provider: 'creem',
		providerCustomerId: customerId,
		providerSubscriptionId: subscriptionId,
		status: 'active',
		currentPeriodEnd: periodEnd
	});
	db.insert(billingEvents)
		.values({
			id: `be-${randomUUID().slice(0, 8)}`,
			userId,
			kind: 'site_subscription_activated',
			stripeCustomerId: customerId
		})
		.run();
	return `creem activated site ${siteId} for ${userId}`;
}

function updateCreemSubscriptionStatus(
	object: NonNullable<CreemEvent['object']>,
	status: string
): string {
	const customerId = creemCustomerId(object);
	const userId = creemUserId(object);
	const siteId = creemSiteId(object);
	const periodEnd = creemPeriodEnd(object);
	if (siteId && userId) {
		activateSiteSubscription({
			siteId,
			userId,
			provider: 'creem',
			providerCustomerId: customerId,
			providerSubscriptionId: creemSubscriptionId(object),
			status,
			currentPeriodEnd: periodEnd
		});
		return `creem site status ${status} for ${siteId}`;
	}
	const update = {
		subscriptionStatus: status,
		...(periodEnd ? { subscriptionEndsAt: periodEnd } : {})
	};
	if (userId) {
		db.update(users).set(update).where(eq(users.id, userId)).run();
		return `creem status ${status} for user ${userId}`;
	}
	if (!customerId) return 'ignored: no customer';
	db.update(users).set(update).where(eq(users.stripeCustomerId, customerId)).run();
	return `creem status ${status} for customer ${customerId}`;
}

/** Idempotent-ish Creem sync. Access is granted on paid/active subscription events. */
export function handleCreemEvent(event: CreemEvent): string {
	const eventType = event.eventType ?? event.type ?? '';
	const object = creemObject(event);
	switch (eventType) {
		case 'checkout.completed':
		case 'subscription.paid':
		case 'subscription.active': {
			const userId = creemUserId(object);
			if (!userId) return 'ignored: no userId';
			const siteId = creemSiteId(object);
			if (siteId) {
				return activateCreemSiteSubscription(
					siteId,
					userId,
					creemCustomerId(object),
					creemSubscriptionId(object),
					creemPeriodEnd(object)
				);
			}
			return activateCreemSubscription(userId, creemCustomerId(object), creemPeriodEnd(object));
		}
		case 'subscription.scheduled_cancel':
		case 'subscription.canceled':
			return updateCreemSubscriptionStatus(object, 'canceled');
		case 'subscription.update':
			return updateCreemSubscriptionStatus(
				object,
				object.status ?? object.subscription?.status ?? 'active'
			);
		case 'subscription.past_due':
			return updateCreemSubscriptionStatus(object, 'past_due');
		case 'subscription.expired':
			return updateCreemSubscriptionStatus(object, 'expired');
		case 'subscription.paused':
			return updateCreemSubscriptionStatus(object, 'paused');
		case 'subscription.trialing':
			return updateCreemSubscriptionStatus(object, 'trialing');
		default:
			return `ignored: ${eventType || 'unknown'}`;
	}
}

// ---------------------------------------------------------------------------
// Cancellation policy (M6, docs/POLICY.md): paid features stay on through the
// paid period plus a grace window; then the daily sweep detaches custom domains.
// ---------------------------------------------------------------------------

export function graceDays(): number {
	const parsed = Number(getSetting('GRACE_DAYS'));
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : 30;
}

export type SubscriptionState =
	{ state: 'free' } | { state: 'active' } | { state: 'grace'; until: Date };

export function subscriptionState(userId: string): SubscriptionState {
	const row = db.select().from(users).where(eq(users.id, userId)).get();
	if (!row?.subscriptionStatus) return { state: 'free' };
	if (row.subscriptionStatus === 'active' || row.subscriptionStatus === 'trialing') {
		return { state: 'active' };
	}
	// canceled / past_due / unpaid …: grace window after the paid period end
	if (!row.subscriptionEndsAt) return { state: 'free' };
	const until = new Date(row.subscriptionEndsAt.getTime() + graceDays() * 86_400_000);
	return until.getTime() > Date.now() ? { state: 'grace', until } : { state: 'free' };
}

/** Paid features (custom domains) are on while active OR within the grace window. */
export function hasActiveSubscription(userId: string): boolean {
	return subscriptionState(userId).state !== 'free';
}

/**
 * Admin support gesture (/admin/customers): manually comp Pro or revert to
 * Free, bypassing Stripe. NOTE: if the user has a live `stripeCustomerId`,
 * this does not cancel their real subscription — the next webhook event
 * (renewal/cancellation) can silently overwrite this override. The caller is
 * responsible for surfacing that risk to the admin before calling this for a
 * user with a Stripe customer on file.
 */
export function overrideSubscription(userId: string, next: 'active' | 'free'): void {
	db.update(users)
		.set({
			subscriptionStatus: next === 'active' ? 'active' : null,
			...(next === 'free' ? { subscriptionEndsAt: null } : {})
		})
		.where(eq(users.id, userId))
		.run();
}

/** Feeds the admin activity feed — one row per real Stripe subscription activation. */
export function recentBillingEvents(limit = 50) {
	return db.select().from(billingEvents).orderBy(desc(billingEvents.createdAt)).limit(limit).all();
}
