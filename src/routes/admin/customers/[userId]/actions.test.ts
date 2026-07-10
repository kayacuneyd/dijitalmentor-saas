import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { adminActions, customDomains, sites } from '$lib/server/db/schema';
import { getMonthlyUsage, tenantIdForUser } from '$lib/server/ai/usage';
import { subscriptionState } from '$lib/server/billing';
import { getOrSeedDraft, publishDraft, saveDraft } from '$lib/server/db/repo';
import { attachSiteDomain } from '$lib/server/domains';
import { actions } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

function formRequest(fields: Record<string, string>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(fields)) form.set(key, value);
	return { formData: async () => form } as unknown as Request;
}

function call(
	action: keyof typeof actions,
	fields: Record<string, string>,
	targetUserId: string,
	locals: { user: typeof admin | typeof nonAdmin | null } = { user: admin }
) {
	return actions[action]({
		request: formRequest(fields),
		locals,
		params: { userId: targetUserId }
	} as never);
}

describe('/admin/customers/[userId] actions — auth guard', () => {
	it('every action requires admin (redirect signed-out, 403 non-admin)', async () => {
		const user = getOrCreateUser('actions-guard@example.com');
		for (const action of [
			'overrideSubscription',
			'topUp',
			'detachDomain',
			'publish',
			'unpublish',
			'deleteSite'
		] as const) {
			await expect(call(action, {}, user.id, { user: null })).rejects.toBeTruthy();
			await expect(call(action, {}, user.id, { user: nonAdmin })).rejects.toBeTruthy();
		}
	});
});

describe('?/overrideSubscription', () => {
	it('comps Pro, reverts to Free, and logs an admin_actions row', async () => {
		const user = getOrCreateUser('override-action@example.com');
		expect(subscriptionState(user.id)).toEqual({ state: 'free' });

		const res = await call('overrideSubscription', { next: 'active' }, user.id);
		expect((res as { overridden: string }).overridden).toBe('active');
		expect(subscriptionState(user.id)).toEqual({ state: 'active' });

		await call('overrideSubscription', { next: 'free' }, user.id);
		expect(subscriptionState(user.id)).toEqual({ state: 'free' });

		const logged = db
			.select()
			.from(adminActions)
			.where(eq(adminActions.targetUserId, user.id))
			.all();
		expect(logged.map((l) => l.action)).toEqual(['subscription_override', 'subscription_override']);
	});

	it('rejects an invalid target state', async () => {
		const user = getOrCreateUser('override-invalid@example.com');
		const res = (await call('overrideSubscription', { next: 'lifetime' }, user.id)) as {
			status: number;
		};
		expect(res.status).toBe(400);
	});
});

describe('?/topUp', () => {
	it('grants a top-up, requires a reason, and logs the grant', async () => {
		const user = getOrCreateUser('topup-action@example.com');
		const noReason = (await call('topUp', { edits: '5' }, user.id)) as { status: number };
		expect(noReason.status).toBe(400);

		const res = await call(
			'topUp',
			{ edits: '5', generations: '1', usdWaived: '0.50', reason: 'goodwill credit' },
			user.id
		);
		expect((res as { toppedUp: boolean }).toppedUp).toBe(true);
		const usage = getMonthlyUsage(tenantIdForUser(user.id));
		expect(usage.editCount).toBe(-5);
		expect(usage.generationCount).toBe(-1);

		const logged = db
			.select()
			.from(adminActions)
			.where(eq(adminActions.targetUserId, user.id))
			.all();
		expect(logged[0].detail).toContain('goodwill credit');
	});

	it('rejects a top-up with no positive amount', async () => {
		const user = getOrCreateUser('topup-empty@example.com');
		const res = (await call('topUp', { reason: 'nothing to grant' }, user.id)) as {
			status: number;
		};
		expect(res.status).toBe(400);
	});
});

describe('?/detachDomain', () => {
	it('detaches the domain, logs the action, and does not throw when email delivery is unconfigured', async () => {
		const user = getOrCreateUser('detach-action@example.com');
		const draft = structuredClone(getOrSeedDraft('seed-psych')!);
		draft.id = 'site-detach-action';
		draft.tenantId = 'tenant-site-detach-action';
		saveDraft(draft, { ownerUserId: user.id });
		attachSiteDomain('site-detach-action', 'detach-action.example', user.id);

		const res = await call('detachDomain', { siteId: 'site-detach-action' }, user.id);
		expect((res as { domainDetached: string }).domainDetached).toBe('site-detach-action');

		const remaining = db
			.select()
			.from(customDomains)
			.where(eq(customDomains.siteId, 'site-detach-action'))
			.all();
		expect(remaining).toHaveLength(0);

		const logged = db
			.select()
			.from(adminActions)
			.where(eq(adminActions.targetUserId, user.id))
			.all();
		expect(logged[0].action).toBe('domain_detach');
		expect(logged[0].detail).toContain('detach-action.example');
	});

	it('404s when the site has no domain to detach', async () => {
		const user = getOrCreateUser('detach-nodomain@example.com');
		const draft = structuredClone(getOrSeedDraft('seed-law')!);
		draft.id = 'site-detach-nodomain';
		draft.tenantId = 'tenant-site-detach-nodomain';
		saveDraft(draft, { ownerUserId: user.id });
		const res = (await call('detachDomain', { siteId: 'site-detach-nodomain' }, user.id)) as {
			status: number;
		};
		expect(res.status).toBe(404);
	});
});

describe('?/publish', () => {
	it('publishes a quality-passing draft and logs the action', async () => {
		const user = getOrCreateUser('admin-publish-action@example.com');
		const draft = structuredClone(getOrSeedDraft('seed-law')!);
		draft.id = 'site-admin-publish-action';
		draft.tenantId = 'tenant-site-admin-publish-action';
		saveDraft(draft, { ownerUserId: user.id });

		const res = await call('publish', { siteId: 'site-admin-publish-action' }, user.id);
		expect((res as { published: string }).published).toBe('site-admin-publish-action');
		expect(
			db.select().from(sites).where(eq(sites.id, 'site-admin-publish-action')).get()
				?.publishedVersion
		).toBe(1);

		const logged = db
			.select()
			.from(adminActions)
			.where(eq(adminActions.targetUserId, user.id))
			.all();
		expect(logged[0].action).toBe('publish');
	});

	it('is blocked by the same quality gate the owner publish goes through', async () => {
		const user = getOrCreateUser('admin-publish-blocked@example.com');
		const draft = structuredClone(getOrSeedDraft('seed-psych')!);
		draft.id = 'site-admin-publish-blocked';
		draft.tenantId = 'tenant-site-admin-publish-blocked';
		const hero = draft.pages[0].sections.find((section) => section.type === 'hero');
		if (!hero || hero.type !== 'hero') throw new Error('psych seed hero missing');
		hero.content.tr.headline = 'Kesin sonuç garantisiyle terapi';
		saveDraft(draft, { ownerUserId: user.id });

		const res = (await call('publish', { siteId: 'site-admin-publish-blocked' }, user.id)) as {
			status: number;
		};
		expect(res.status).toBe(422);
		expect(
			db.select().from(sites).where(eq(sites.id, 'site-admin-publish-blocked')).get()
				?.publishedVersion
		).toBeNull();
	});
});

describe('?/deleteSite', () => {
	it('permanently deletes the site and logs the action', async () => {
		const user = getOrCreateUser('admin-delete-action@example.com');
		const draft = structuredClone(getOrSeedDraft('seed-dental')!);
		draft.id = 'site-admin-delete-action';
		draft.tenantId = 'tenant-site-admin-delete-action';
		saveDraft(draft, { ownerUserId: user.id });

		const res = await call('deleteSite', { siteId: 'site-admin-delete-action' }, user.id);
		expect((res as { siteDeleted: string }).siteDeleted).toBeTruthy();
		expect(
			db.select().from(sites).where(eq(sites.id, 'site-admin-delete-action')).get()
		).toBeUndefined();

		const logged = db
			.select()
			.from(adminActions)
			.where(eq(adminActions.targetUserId, user.id))
			.all();
		expect(logged[0].action).toBe('site_delete');
	});
});

describe('?/unpublish', () => {
	it('unpublishes the site and logs the action', async () => {
		const user = getOrCreateUser('unpublish-action@example.com');
		const draft = structuredClone(getOrSeedDraft('seed-dental')!);
		draft.id = 'site-unpublish-action';
		draft.tenantId = 'tenant-site-unpublish-action';
		saveDraft(draft, { ownerUserId: user.id });
		publishDraft('site-unpublish-action');
		expect(
			db.select().from(sites).where(eq(sites.id, 'site-unpublish-action')).get()?.publishedVersion
		).toBe(1);

		const res = await call('unpublish', { siteId: 'site-unpublish-action' }, user.id);
		expect((res as { unpublished: string }).unpublished).toBe('site-unpublish-action');
		expect(
			db.select().from(sites).where(eq(sites.id, 'site-unpublish-action')).get()?.publishedVersion
		).toBeNull();

		const logged = db
			.select()
			.from(adminActions)
			.where(eq(adminActions.targetUserId, user.id))
			.all();
		expect(logged[0].action).toBe('unpublish');
	});
});
