import { describe, expect, it } from 'vitest';
import { listActivityFeed } from './activity';
import { getOrCreateUser } from './auth';
import { logAdminAction } from './customers';
import { recordError } from './error-log';
import { recordOnboardingEvent } from './onboarding/telemetry';
import { createReservation, confirmPayment } from './reservations';
import { handleStripeEvent } from './billing';

describe('listActivityFeed', () => {
	it('merges all six sources, newest first, respecting the limit', () => {
		const user = getOrCreateUser(`activity-test-${Date.now()}@example.com`);

		logAdminAction('admin@saaskaya.com', user.id, 'ai_topup', 'granted 100000 microusd');
		recordError(new Error('boom'), { source: 'activity-test', userId: user.id });
		recordOnboardingEvent({ event: 'generation_succeeded', userId: user.id, siteId: 'site-x' });
		recordOnboardingEvent({ event: 'started', userId: user.id }); // should be filtered out

		const created = createReservation({
			userId: user.id,
			siteId: 'site-activity',
			domain: `activity-test-${Date.now()}.example`,
			paymentMethod: 'stripe'
		});
		if (!created.ok) throw new Error('expected ok');
		confirmPayment(created.reservation.id);

		handleStripeEvent({
			type: 'checkout.session.completed',
			data: { object: { client_reference_id: user.id, customer: 'cus_activity_test' } }
		});

		const feed = listActivityFeed(200);
		const kinds = new Set(feed.filter((i) => i.userId === user.id).map((i) => i.kind));
		expect(kinds).toEqual(
			new Set([
				'admin_action',
				'error',
				'site_generated',
				'signup',
				'domain_paid',
				'subscription_activated'
			])
		);

		// newest-first ordering
		for (let i = 1; i < feed.length; i++) {
			expect(feed[i - 1].at.getTime()).toBeGreaterThanOrEqual(feed[i].at.getTime());
		}

		expect(listActivityFeed(3)).toHaveLength(3);
	});

	it('does not surface non-generation onboarding events', () => {
		const user = getOrCreateUser(`activity-filter-${Date.now()}@example.com`);
		recordOnboardingEvent({ event: 'answer_saved', userId: user.id });
		const feed = listActivityFeed(200);
		expect(feed.some((i) => i.userId === user.id && i.kind === 'site_generated')).toBe(false);
	});
});
