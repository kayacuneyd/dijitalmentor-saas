import { describe, expect, it } from 'vitest';
import { seedSites } from '$lib/seed';
import type { Site } from '$lib/schema/site';
import { getPublished, saveDraft, setSiteIdentity } from '$lib/server/db/repo';
import { POST } from './+server';

const user = { id: 'publish-quality-user', email: 'publish-quality@example.com', isAdmin: false };

function jsonRequest(body: unknown) {
	return { json: async () => body } as Request;
}

function savePublishableDraft(site: Site) {
	saveDraft(site, { ownerUserId: user.id });
	const identity = setSiteIdentity({
		siteId: site.id,
		siteName: site.settings.siteName,
		publicHandle: `pub-${site.id.slice(-16)}`,
		contactEmail: site.settings.contactEmail ?? ''
	});
	if (!identity.ok) throw new Error(identity.message);
}

describe('site publish API quality gate', () => {
	it('publishes a quality-passing draft and returns the quality report', async () => {
		const site = structuredClone(seedSites.law);
		site.id = 'site-publish-quality-ok';
		site.tenantId = 'tenant-publish-quality-ok';
		savePublishableDraft(site);

		const response = await POST({
			params: { siteId: site.id },
			locals: { user }
		} as never);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toMatchObject({
			ok: true,
			version: 1,
			quality: { canPublish: true, blockers: [] }
		});
	});

	it('blocks publishing when the draft has quality blockers', async () => {
		const site = structuredClone(seedSites.psych);
		site.id = 'site-publish-quality-blocked';
		site.tenantId = 'tenant-publish-quality-blocked';
		const hero = site.pages[0].sections.find((section) => section.type === 'hero');
		if (!hero || hero.type !== 'hero') throw new Error('psych seed hero missing');
		hero.content.tr.headline = 'Kesin sonuç garantisiyle terapi';
		savePublishableDraft(site);

		const response = await POST({
			params: { siteId: site.id },
			locals: { user }
		} as never);

		expect(response.status).toBe(422);
		const body = await response.json();
		expect(body).toMatchObject({
			ok: false,
			quality: { canPublish: false }
		});
		expect(body.quality.blockers.map((issue: { code: string }) => issue.code)).toContain(
			'unsafe_professional_claim'
		);
	});
});

describe('site publish API — body-based publish (staleness fix)', () => {
	it('publishes the draft in the request body, overriding what was last saved', async () => {
		const site = structuredClone(seedSites.law);
		site.id = 'site-publish-body-fresh';
		site.tenantId = 'tenant-publish-body-fresh';
		savePublishableDraft(site);

		// simulate the exact race this endpoint closes: the server's stored draft is
		// stale, but the client flushed a newer edit into the publish request body.
		const fresher = structuredClone(site);
		fresher.settings.siteName = 'En Son Yazılan İsim';

		const response = await POST({
			params: { siteId: site.id },
			request: jsonRequest({ draft: fresher }),
			locals: { user }
		} as never);

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.ok).toBe(true);
		expect(getPublished(site.id)?.settings.siteName).toBe('En Son Yazılan İsim');
	});

	it('rejects a body draft whose id does not match the route param', async () => {
		const site = structuredClone(seedSites.law);
		site.id = 'site-publish-body-mismatch';
		site.tenantId = 'tenant-publish-body-mismatch';
		savePublishableDraft(site);

		const wrongId = structuredClone(site);
		wrongId.id = 'site-publish-body-someone-else';

		const response = await POST({
			params: { siteId: site.id },
			request: jsonRequest({ draft: wrongId }),
			locals: { user }
		} as never);

		expect(response.status).toBe(400);
		expect(getPublished(site.id)).toBeNull();
	});

	it('rejects an invalid body draft and publishes nothing', async () => {
		const site = structuredClone(seedSites.law);
		site.id = 'site-publish-body-invalid';
		site.tenantId = 'tenant-publish-body-invalid';
		saveDraft(site, { ownerUserId: user.id });

		const response = await POST({
			params: { siteId: site.id },
			request: jsonRequest({ draft: { not: 'a site' } }),
			locals: { user }
		} as never);

		expect(response.status).toBe(400);
		expect(getPublished(site.id)).toBeNull();
	});

	it('bodyless publish still works exactly as before', async () => {
		const site = structuredClone(seedSites.law);
		site.id = 'site-publish-bodyless';
		site.tenantId = 'tenant-publish-bodyless';
		savePublishableDraft(site);

		const response = await POST({
			params: { siteId: site.id },
			locals: { user }
		} as never);

		expect(response.status).toBe(200);
		expect(getPublished(site.id)?.settings.siteName).toBe(site.settings.siteName);
	});
});
