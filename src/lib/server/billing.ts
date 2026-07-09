import { createHmac, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { getSetting } from '$lib/server/config';
import { confirmPayment, domainPriceEur } from '$lib/server/reservations';

/**
 * Stripe subscriptions (PLAN §8) over the plain REST API — no SDK, one less
 * dependency; the two calls we need are a form-POST and an HMAC check.
 * Everything degrades gracefully while the operator hasn't entered keys yet.
 */

export class BillingNotConfiguredError extends Error {}

export function billingConfigured(): boolean {
	return Boolean(getSetting('STRIPE_SECRET_KEY') && getSetting('STRIPE_PRICE_ID'));
}

export async function createCheckoutSession(input: {
	userId: string;
	email: string;
	origin: string;
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
		success_url: `${input.origin}/dashboard?billing=success`,
		cancel_url: `${input.origin}/dashboard?billing=cancelled`
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

type StripeEvent = {
	type: string;
	data: {
		object: {
			client_reference_id?: string | null;
			customer?: string | null;
			status?: string;
			mode?: string;
			metadata?: { reservationId?: string; kind?: string } | null;
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
			const userId = object.client_reference_id;
			if (!userId) return 'ignored: no client_reference_id';
			db.update(users)
				.set({ stripeCustomerId: object.customer ?? null, subscriptionStatus: 'active' })
				.where(eq(users.id, userId))
				.run();
			return `activated ${userId}`;
		}
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted': {
			const customer = object.customer;
			if (!customer) return 'ignored: no customer';
			const status = event.type.endsWith('deleted') ? 'canceled' : (object.status ?? 'active');
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
