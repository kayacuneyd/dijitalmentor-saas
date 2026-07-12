import { createHmac } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	billingConfigured,
	billingProvider,
	createCheckoutSession,
	createDomainCheckoutSession,
	handleStripeEvent,
	handleCreemEvent,
	hasActiveSiteSubscription,
	hasActiveSubscription,
	overrideSubscription,
	recentBillingEvents,
	subscriptionState,
	verifyCreemSignature,
	verifyStripeSignature
} from './billing';
import { getOrCreateUser } from './auth';
import { clearSetting, setSetting } from './config';
import { createReservation, getReservation, unusedDomainCreditForSite } from './reservations';

const SECRET = 'whsec_test_secret';
const CREEM_SECRET = 'creem_webhook_secret';

function sign(body: string, tsMs: number): string {
	const ts = Math.floor(tsMs / 1000);
	const sig = createHmac('sha256', SECRET).update(`${ts}.${body}`).digest('hex');
	return `t=${ts},v1=${sig}`;
}

function signCreem(body: string): string {
	return createHmac('sha256', CREEM_SECRET).update(body).digest('hex');
}

afterEach(() => {
	vi.restoreAllMocks();
	for (const key of [
		'PAYMENT_PROVIDER',
		'CREEM_API_KEY',
		'CREEM_WEBHOOK_SECRET',
		'CREEM_PRO_PRODUCT_ID',
		'CREEM_PRO_MONTHLY_PRODUCT_ID',
		'CREEM_PRO_YEARLY_PRODUCT_ID',
		'CREEM_DOMAIN_PRODUCT_ID',
		'CREEM_TEST_MODE',
		'STRIPE_SECRET_KEY',
		'STRIPE_PRICE_ID'
	]) {
		clearSetting(key);
	}
});

describe('verifyStripeSignature', () => {
	const body = '{"type":"checkout.session.completed"}';

	it('accepts a valid, fresh signature', () => {
		const now = Date.now();
		expect(verifyStripeSignature(body, sign(body, now), SECRET, now)).toBe(true);
	});

	it('rejects tampered bodies, wrong secrets, stale timestamps, and garbage', () => {
		const now = Date.now();
		const header = sign(body, now);
		expect(verifyStripeSignature(body + ' ', header, SECRET, now)).toBe(false);
		expect(verifyStripeSignature(body, sign(body, now), 'whsec_other', now)).toBe(false);
		expect(verifyStripeSignature(body, sign(body, now - 10 * 60_000), SECRET, now)).toBe(false); // >5 min
		expect(verifyStripeSignature(body, null, SECRET, now)).toBe(false);
		expect(verifyStripeSignature(body, 't=abc,v1=', SECRET, now)).toBe(false);
	});
});

describe('verifyCreemSignature', () => {
	const body = '{"eventType":"subscription.paid"}';

	it('accepts the raw-body HMAC and rejects tampering', () => {
		expect(verifyCreemSignature(body, signCreem(body), CREEM_SECRET)).toBe(true);
		expect(verifyCreemSignature(body + ' ', signCreem(body), CREEM_SECRET)).toBe(false);
		expect(verifyCreemSignature(body, signCreem(body), 'other')).toBe(false);
		expect(verifyCreemSignature(body, null, CREEM_SECRET)).toBe(false);
	});
});

describe('billing provider selection and checkout', () => {
	it('keeps Stripe as the explicit/default provider when configured', () => {
		setSetting('STRIPE_SECRET_KEY', 'sk_test');
		setSetting('STRIPE_PRICE_ID', 'price_test');
		expect(billingProvider()).toBe('stripe');
		expect(billingConfigured()).toBe(true);
	});

	it('uses Creem when explicitly selected and creates a checkout session', async () => {
		setSetting('PAYMENT_PROVIDER', 'creem');
		setSetting('CREEM_API_KEY', 'creem_test_key');
		setSetting('CREEM_PRO_MONTHLY_PRODUCT_ID', 'prod_monthly_test');
		setSetting('CREEM_TEST_MODE', '1');
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ checkout_url: 'https://checkout.creem.io/test' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const url = await createCheckoutSession({
			userId: 'user-creem-checkout',
			email: 'creem-checkout@example.com',
			origin: 'https://saaskaya.com',
			siteId: 'site-creem-checkout'
		});

		expect(url).toBe('https://checkout.creem.io/test');
		expect(fetchMock).toHaveBeenCalledWith(
			'https://test-api.creem.io/v1/checkouts',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					'x-api-key': 'creem_test_key',
					'content-type': 'application/json'
				})
			})
		);
		const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
		expect(body).toMatchObject({
			product_id: 'prod_monthly_test',
			success_url: 'https://saaskaya.com/dashboard?billing=success&site=site-creem-checkout',
			customer: { email: 'creem-checkout@example.com' },
			metadata: {
				kind: 'site_subscription',
				siteId: 'site-creem-checkout',
				userId: 'user-creem-checkout',
				referenceId: 'user-creem-checkout',
				internal_customer_id: 'user-creem-checkout',
				plan: 'pro_monthly',
				planInterval: 'monthly',
				price: '17 EUR/month'
			}
		});
		expect(String(body.request_id)).toContain('pro-site-site-creem-checkout-');
	});

	it('uses the yearly Creem product when yearly Pro is selected', async () => {
		setSetting('PAYMENT_PROVIDER', 'creem');
		setSetting('CREEM_API_KEY', 'creem_test_key');
		setSetting('CREEM_PRO_MONTHLY_PRODUCT_ID', 'prod_monthly_test');
		setSetting('CREEM_PRO_YEARLY_PRODUCT_ID', 'prod_yearly_test');
		setSetting('CREEM_TEST_MODE', '1');
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ checkout_url: 'https://checkout.creem.io/yearly' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const url = await createCheckoutSession({
			userId: 'user-creem-yearly',
			email: 'creem-yearly@example.com',
			origin: 'https://saaskaya.com',
			siteId: 'site-creem-yearly',
			planInterval: 'yearly'
		});

		expect(url).toBe('https://checkout.creem.io/yearly');
		const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
		expect(body).toMatchObject({
			product_id: 'prod_yearly_test',
			metadata: {
				kind: 'site_subscription',
				siteId: 'site-creem-yearly',
				userId: 'user-creem-yearly',
				plan: 'pro_yearly',
				planInterval: 'yearly',
				price: '200 EUR/year'
			}
		});
	});

	it('creates a Creem checkout for the yearly .com domain service', async () => {
		setSetting('PAYMENT_PROVIDER', 'creem');
		setSetting('CREEM_API_KEY', 'creem_test_key');
		setSetting('CREEM_PRO_MONTHLY_PRODUCT_ID', 'prod_monthly_test');
		setSetting('CREEM_DOMAIN_PRODUCT_ID', 'prod_domain_test');
		setSetting('CREEM_TEST_MODE', '1');
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ checkout_url: 'https://checkout.creem.io/domain' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const url = await createDomainCheckoutSession({
			userId: 'user-creem-domain',
			email: 'creem-domain@example.com',
			origin: 'https://saaskaya.com',
			domain: 'example-domain.com',
			reservationId: 'res-creem-domain'
		});

		expect(url).toBe('https://checkout.creem.io/domain');
		const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
		expect(body).toMatchObject({
			product_id: 'prod_domain_test',
			success_url: 'https://saaskaya.com/dashboard?domain=paid',
			customer: { email: 'creem-domain@example.com' },
			metadata: {
				kind: 'domain',
				reservationId: 'res-creem-domain',
				domain: 'example-domain.com',
				userId: 'user-creem-domain'
			}
		});
		expect(String(body.request_id)).toContain('domain-res-creem-domain-');
	});
});

describe('handleStripeEvent → subscription status', () => {
	it('activates on checkout completion and deactivates on subscription deletion', () => {
		const user = getOrCreateUser('billing-test@example.com');
		expect(hasActiveSubscription(user.id)).toBe(false);

		handleStripeEvent({
			type: 'checkout.session.completed',
			data: { object: { client_reference_id: user.id, customer: 'cus_test1' } }
		});
		expect(hasActiveSubscription(user.id)).toBe(true);

		handleStripeEvent({
			type: 'customer.subscription.updated',
			data: { object: { customer: 'cus_test1', status: 'past_due' } }
		});
		expect(hasActiveSubscription(user.id)).toBe(false);

		handleStripeEvent({
			type: 'customer.subscription.updated',
			data: { object: { customer: 'cus_test1', status: 'active' } }
		});
		expect(hasActiveSubscription(user.id)).toBe(true);

		handleStripeEvent({
			type: 'customer.subscription.deleted',
			data: { object: { customer: 'cus_test1' } }
		});
		expect(hasActiveSubscription(user.id)).toBe(false);
	});

	it('ignores unknown events and incomplete payloads', () => {
		expect(handleStripeEvent({ type: 'invoice.paid', data: { object: {} } })).toMatch(/ignored/);
		expect(handleStripeEvent({ type: 'checkout.session.completed', data: { object: {} } })).toMatch(
			/ignored/
		);
	});

	it('routes a domain payment to the reservation, NOT to subscription activation', () => {
		const user = getOrCreateUser('domain-pay@example.com');
		const created = createReservation({
			userId: user.id,
			siteId: 's-webhook',
			domain: 'webhook-domain.example',
			paymentMethod: 'stripe'
		});
		if (!created.ok) throw new Error('expected ok');

		const outcome = handleStripeEvent({
			type: 'checkout.session.completed',
			data: {
				object: {
					mode: 'payment',
					client_reference_id: user.id,
					metadata: { reservationId: created.reservation.id, kind: 'domain' }
				}
			}
		});
		expect(outcome).toMatch(/domain reservation paid/);
		expect(getReservation(created.reservation.id)?.status).toBe('paid');
		// crucially, the one-time domain payment did not flip the user to Pro
		expect(hasActiveSubscription(user.id)).toBe(false);
	});

	it('activates only the site referenced by site_subscription metadata', () => {
		const user = getOrCreateUser('site-sub-stripe@example.com');
		expect(hasActiveSiteSubscription('site-paid', user.id)).toBe(false);
		expect(hasActiveSiteSubscription('site-free', user.id)).toBe(false);

		const outcome = handleStripeEvent({
			type: 'checkout.session.completed',
			data: {
				object: {
					mode: 'subscription',
					client_reference_id: user.id,
					customer: 'cus_site_sub',
					subscription: 'sub_site_paid',
					metadata: {
						kind: 'site_subscription',
						siteId: 'site-paid',
						userId: user.id,
						plan: 'pro',
						price: '17 EUR/month'
					}
				}
			}
		});

		expect(outcome).toBe(`activated site site-paid for ${user.id}`);
		expect(hasActiveSiteSubscription('site-paid', user.id)).toBe(true);
		expect(hasActiveSiteSubscription('site-free', user.id)).toBe(false);
		expect(hasActiveSubscription(user.id)).toBe(false);
	});

	it('records a billing_events row on subscription activation, not on a domain payment', () => {
		const user = getOrCreateUser('billing-events-test@example.com');
		handleStripeEvent({
			type: 'checkout.session.completed',
			data: { object: { client_reference_id: user.id, customer: 'cus_test_events' } }
		});
		const events = recentBillingEvents(50);
		const mine = events.find((e) => e.userId === user.id);
		expect(mine?.kind).toBe('subscription_activated');
		expect(mine?.stripeCustomerId).toBe('cus_test_events');

		const domainUser = getOrCreateUser('domain-pay-events@example.com');
		const created = createReservation({
			userId: domainUser.id,
			siteId: 's-webhook-events',
			domain: 'webhook-domain-events.example',
			paymentMethod: 'stripe'
		});
		if (!created.ok) throw new Error('expected ok');
		handleStripeEvent({
			type: 'checkout.session.completed',
			data: {
				object: {
					mode: 'payment',
					client_reference_id: domainUser.id,
					metadata: { reservationId: created.reservation.id, kind: 'domain' }
				}
			}
		});
		expect(recentBillingEvents(50).some((e) => e.userId === domainUser.id)).toBe(false);
	});
});

describe('handleCreemEvent → subscription status', () => {
	it('activates on subscription.paid and tracks Creem customer id in the legacy customer slot', () => {
		const user = getOrCreateUser('creem-paid@example.com');
		expect(hasActiveSubscription(user.id)).toBe(false);

		const outcome = handleCreemEvent({
			eventType: 'subscription.paid',
			object: {
				customer: { id: 'cust_creem_1' },
				metadata: { userId: user.id },
				current_period_end_date: '2026-08-09T00:00:00.000Z'
			}
		});

		expect(outcome).toMatch(/creem activated/);
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });
		const mine = recentBillingEvents(50).find((e) => e.userId === user.id);
		expect(mine?.kind).toBe('subscription_activated');
		expect(mine?.stripeCustomerId).toBe('cust_creem_1');
	});

	it('maps cancellation-like events to inactive/grace states by user metadata', () => {
		const user = getOrCreateUser('creem-canceled@example.com');
		handleCreemEvent({
			eventType: 'subscription.paid',
			object: { customer: 'cust_creem_cancel', metadata: { userId: user.id } }
		});
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });

		const future = new Date(Date.now() + 3 * 86_400_000).toISOString();
		handleCreemEvent({
			eventType: 'subscription.canceled',
			object: {
				customer: 'cust_creem_cancel',
				metadata: { userId: user.id },
				current_period_end_date: future
			}
		});

		expect(subscriptionState(user.id).state).toBe('grace');
	});

	it('activates from checkout.completed metadata when Creem sends checkout-shaped payloads', () => {
		const user = getOrCreateUser('creem-checkout-completed@example.com');
		expect(hasActiveSubscription(user.id)).toBe(false);

		const outcome = handleCreemEvent({
			eventType: 'checkout.completed',
			object: {
				customer: { id: 'cust_creem_checkout' },
				checkout: { metadata: { internal_customer_id: user.id } }
			}
		});

		expect(outcome).toMatch(/creem activated/);
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });
	});

	it('grants one included .com domain credit for yearly Pro site subscriptions', () => {
		const user = getOrCreateUser('creem-yearly-credit@example.com');

		const outcome = handleCreemEvent({
			eventType: 'subscription.paid',
			object: {
				customer: { id: 'cust_creem_yearly' },
				id: 'sub_creem_yearly',
				metadata: {
					userId: user.id,
					siteId: 'site-yearly-credit',
					kind: 'site_subscription',
					planInterval: 'yearly'
				},
				current_period_end_date: '2027-07-12T00:00:00.000Z'
			}
		});

		expect(outcome).toBe(`creem activated yearly site site-yearly-credit for ${user.id}`);
		expect(hasActiveSiteSubscription('site-yearly-credit', user.id)).toBe(true);
		expect(unusedDomainCreditForSite(user.id, 'site-yearly-credit')).toMatchObject({
			userId: user.id,
			siteId: 'site-yearly-credit',
			source: 'yearly_pro',
			tld: 'com',
			status: 'unused'
		});
	});

	it('routes Creem domain product payments to reservations, not Pro activation', () => {
		const user = getOrCreateUser('creem-domain-pay@example.com');
		const created = createReservation({
			userId: user.id,
			siteId: 's-creem-domain-webhook',
			domain: 'creem-domain-webhook.com',
			paymentMethod: 'creem'
		});
		if (!created.ok) throw new Error('expected ok');

		const outcome = handleCreemEvent({
			eventType: 'checkout.completed',
			object: {
				customer: 'cust_creem_domain',
				checkout: {
					metadata: {
						kind: 'domain',
						reservationId: created.reservation.id,
						userId: user.id
					}
				}
			}
		});

		expect(outcome).toBe(`creem domain reservation paid ${created.reservation.id}`);
		expect(getReservation(created.reservation.id)?.status).toBe('paid');
		expect(hasActiveSubscription(user.id)).toBe(false);
	});

	it('maps scheduled cancel and subscription.update status events', () => {
		const user = getOrCreateUser('creem-update-events@example.com');
		handleCreemEvent({
			eventType: 'subscription.paid',
			object: { customer: 'cust_creem_update', metadata: { referenceId: user.id } }
		});
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });

		const future = new Date(Date.now() + 4 * 86_400_000).toISOString();
		handleCreemEvent({
			eventType: 'subscription.scheduled_cancel',
			object: {
				customer: 'cust_creem_update',
				metadata: { referenceId: user.id },
				current_period_end_date: future
			}
		});
		expect(subscriptionState(user.id).state).toBe('grace');

		handleCreemEvent({
			eventType: 'subscription.update',
			object: {
				customer: 'cust_creem_update',
				metadata: { referenceId: user.id },
				status: 'active'
			}
		});
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });
	});

	it('ignores events without enough identity data', () => {
		expect(handleCreemEvent({ eventType: 'subscription.paid', object: {} })).toMatch(/ignored/);
		expect(handleCreemEvent({ eventType: 'checkout.completed', object: {} })).toMatch(/ignored/);
	});
});

describe('overrideSubscription (admin support gesture, bypasses Stripe)', () => {
	it('comps a free user to Pro', () => {
		const user = getOrCreateUser('override-comp@example.com');
		expect(subscriptionState(user.id)).toEqual({ state: 'free' });
		overrideSubscription(user.id, 'active');
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });
	});

	it('reverts a subscriber to Free, clearing subscriptionEndsAt so no stale grace applies', () => {
		const user = getOrCreateUser('override-revert@example.com');
		handleStripeEvent({
			type: 'checkout.session.completed',
			data: { object: { client_reference_id: user.id, customer: 'cus_override_revert' } }
		});
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });
		overrideSubscription(user.id, 'free');
		expect(subscriptionState(user.id)).toEqual({ state: 'free' });
	});
});
