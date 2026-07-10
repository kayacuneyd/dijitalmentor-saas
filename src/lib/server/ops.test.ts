import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { getOrCreateUser } from '$lib/server/auth';
import {
	activateSiteSubscription,
	hasActiveSubscription,
	subscriptionState
} from '$lib/server/billing';
import { healthCheck, sweepExpiredCustomDomains } from '$lib/server/ops';
import { getDraft, getOrSeedDraft, saveDraft } from '$lib/server/db/repo';
import { attachSiteDomain, getDomainForSite } from '$lib/server/domains';
import { setSetting, clearSetting } from '$lib/server/config';
import { seedSites } from '$lib/seed';

const DAY = 86_400_000;

function setBilling(userId: string, status: string | null, endsAt: Date | null) {
	db.update(users)
		.set({ subscriptionStatus: status, subscriptionEndsAt: endsAt })
		.where(eq(users.id, userId))
		.run();
}

describe('cancellation policy: grace window (docs/POLICY.md)', () => {
	it('walks free → active → grace → free across the subscription lifecycle', () => {
		const user = getOrCreateUser('grace-test@example.com');
		expect(subscriptionState(user.id)).toEqual({ state: 'free' });

		setBilling(user.id, 'active', null);
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });

		// canceled 5 days ago → inside the default 30-day grace
		setBilling(user.id, 'canceled', new Date(Date.now() - 5 * DAY));
		const grace = subscriptionState(user.id);
		expect(grace.state).toBe('grace');
		expect(hasActiveSubscription(user.id)).toBe(true);

		// canceled 40 days ago → grace over
		setBilling(user.id, 'canceled', new Date(Date.now() - 40 * DAY));
		expect(subscriptionState(user.id)).toEqual({ state: 'free' });

		// canceled with no known period end → no grace to grant
		setBilling(user.id, 'canceled', null);
		expect(subscriptionState(user.id)).toEqual({ state: 'free' });
	});

	it('honours the GRACE_DAYS setting', () => {
		const user = getOrCreateUser('grace-days-test@example.com');
		setBilling(user.id, 'canceled', new Date(Date.now() - 1 * DAY));
		setSetting('GRACE_DAYS', '0');
		expect(hasActiveSubscription(user.id)).toBe(false);
		setSetting('GRACE_DAYS', '10');
		expect(hasActiveSubscription(user.id)).toBe(true);
		clearSetting('GRACE_DAYS');
	});
});

describe('daily sweep: expired custom domains', () => {
	it('detaches domains of lapsed owners, leaves active/grace/seed domains alone', async () => {
		// lapsed owner
		const lapsed = getOrCreateUser('lapsed@example.com');
		const lapsedSite = structuredClone(seedSites.law);
		lapsedSite.id = 'site-lapsed';
		lapsedSite.tenantId = 'tenant-lapsed';
		saveDraft(lapsedSite, { ownerUserId: lapsed.id });
		attachSiteDomain('site-lapsed', 'lapsed-kanzlei.example', lapsed.id);
		setBilling(lapsed.id, 'canceled', new Date(Date.now() - 60 * DAY));

		// owner still in grace
		const inGrace = getOrCreateUser('ingrace@example.com');
		const graceSite = structuredClone(seedSites.psych);
		graceSite.id = 'site-grace';
		graceSite.tenantId = 'tenant-grace';
		saveDraft(graceSite, { ownerUserId: inGrace.id });
		attachSiteDomain('site-grace', 'grace-praxis.example', inGrace.id);
		activateSiteSubscription({
			siteId: 'site-grace',
			userId: inGrace.id,
			provider: 'manual',
			status: 'canceled',
			currentPeriodEnd: new Date(Date.now() - 5 * DAY)
		});

		// ownerless seed with a domain (should never be swept)
		getOrSeedDraft('seed-dental');
		attachSiteDomain('seed-dental', 'seed-demo.example', null);

		const swept = await sweepExpiredCustomDomains();
		expect(swept.map((s) => s.siteId)).toEqual(['site-lapsed']);
		expect(getDraft('site-lapsed')?.domain).toBeUndefined();
		expect(getDomainForSite('site-lapsed')).toBeNull();
		expect(getDraft('site-grace')?.domain).toBe('grace-praxis.example');
		expect(getDomainForSite('site-grace')).toBe('grace-praxis.example');
		expect(getDraft('seed-dental')?.domain).toBe('seed-demo.example');
		expect(getDomainForSite('seed-dental')).toBe('seed-demo.example');
	});
});

describe('healthCheck', () => {
	it('reports db + disk checks', () => {
		const health = healthCheck();
		expect(health.ok).toBe(true);
		expect(health.checks.db).toBe('ok');
		expect(health.checks.disk).toMatch(/ok|low|unknown/);
	});
});
