import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { handleStripeEvent, hasActiveSubscription, verifyStripeSignature } from './billing';
import { getOrCreateUser } from './auth';
import { createReservation, getReservation } from './reservations';

const SECRET = 'whsec_test_secret';

function sign(body: string, tsMs: number): string {
	const ts = Math.floor(tsMs / 1000);
	const sig = createHmac('sha256', SECRET).update(`${ts}.${body}`).digest('hex');
	return `t=${ts},v1=${sig}`;
}

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
});
