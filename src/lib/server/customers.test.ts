import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { recordUsage, tenantIdForUser } from '$lib/server/ai/usage';
import { getOrSeedDraft, saveDraft } from '$lib/server/db/repo';
import { getCustomerDetail, listAdminActions, listCustomers, logAdminAction } from './customers';

function makeOwnedSite(seedId: string, siteId: string, ownerUserId: string) {
	const draft = structuredClone(getOrSeedDraft(seedId)!);
	draft.id = siteId;
	draft.tenantId = `tenant-${siteId}`;
	saveDraft(draft, { ownerUserId });
}

describe('listCustomers (admin customer list)', () => {
	it('includes a real customer with their site count, plan, and this-month usage', () => {
		const user = getOrCreateUser('list-customers-1@example.com');
		makeOwnedSite('seed-psych', 'site-lc-1a', user.id);
		makeOwnedSite('seed-law', 'site-lc-1b', user.id);
		recordUsage(tenantIdForUser(user.id), { inputTokens: 10, outputTokens: 5 }, 'edit');

		const found = listCustomers().find((c) => c.id === user.id);
		expect(found).toBeTruthy();
		expect(found!.email).toBe('list-customers-1@example.com');
		expect(found!.siteCount).toBe(2);
		expect(found!.usage.editCount).toBe(1);
		expect(found!.subscription).toEqual({ state: 'free' });
		expect(found!.budgetUsd).toBe(1); // Free default
	});

	it('gives a Pro subscriber the Pro $ budget', () => {
		const user = getOrCreateUser('list-customers-2@example.com');
		db.update(users).set({ subscriptionStatus: 'active' }).where(eq(users.id, user.id)).run();
		const found = listCustomers().find((c) => c.id === user.id);
		expect(found!.subscription).toEqual({ state: 'active' });
		expect(found!.budgetUsd).toBe(4); // Pro default
	});

	it('gives a user with no sites a zero site count, not a crash', () => {
		const user = getOrCreateUser('list-customers-no-sites@example.com');
		const found = listCustomers().find((c) => c.id === user.id);
		expect(found!.siteCount).toBe(0);
	});
});

describe('getCustomerDetail (admin customer detail)', () => {
	it('returns null for an unknown user id', () => {
		expect(getCustomerDetail('not-a-real-user-id')).toBeNull();
	});

	it('includes sites, usage, submissions, admin actions, and the Stripe-customer flag', () => {
		const user = getOrCreateUser('customer-detail-1@example.com');
		makeOwnedSite('seed-dental', 'site-cd-1', user.id);
		recordUsage(tenantIdForUser(user.id), { inputTokens: 1, outputTokens: 1 }, 'generation');
		logAdminAction('admin@saaskaya.com', user.id, 'ai_topup', '+1 generation — support gesture');

		const detail = getCustomerDetail(user.id)!;
		expect(detail.email).toBe('customer-detail-1@example.com');
		expect(detail.hasStripeCustomer).toBe(false);
		expect(detail.sites).toHaveLength(1);
		expect(detail.sites[0].id).toBe('site-cd-1');
		expect(detail.usage.generationCount).toBe(1);
		expect(detail.submissions).toEqual([]);
		expect(detail.actions).toHaveLength(1);
		expect(detail.actions[0].action).toBe('ai_topup');
	});

	it('flags hasStripeCustomer when a Stripe customer id is on file', () => {
		const user = getOrCreateUser('customer-detail-stripe@example.com');
		db.update(users)
			.set({ stripeCustomerId: 'cus_detail_test' })
			.where(eq(users.id, user.id))
			.run();
		expect(getCustomerDetail(user.id)!.hasStripeCustomer).toBe(true);
	});
});

describe('logAdminAction / listAdminActions', () => {
	it('records actions newest-first, scoped to the target user', () => {
		const target = getOrCreateUser('admin-actions-target@example.com');
		const other = getOrCreateUser('admin-actions-other@example.com');
		logAdminAction('admin@saaskaya.com', target.id, 'domain_detach', 'first');
		logAdminAction('admin@saaskaya.com', target.id, 'unpublish', 'second');
		logAdminAction('admin@saaskaya.com', other.id, 'domain_detach', 'not this user');

		const actions = listAdminActions(target.id);
		expect(actions).toHaveLength(2);
		expect(actions[0].action).toBe('unpublish'); // newest first
		expect(actions[1].action).toBe('domain_detach');
		expect(actions.every((a) => a.detail !== 'not this user')).toBe(true);
	});
});
