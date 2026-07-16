import { describe, expect, it } from 'vitest';
import { seedSites } from '$lib/seed';
import {
	findSiteIdByPublicHandle,
	getSiteMeta,
	publishDraft,
	saveDraft
} from '$lib/server/db/repo';
import { PUT } from './+server';

const owner = { id: 'identity-owner', email: 'identity-owner@example.com', isAdmin: false };
const stranger = { id: 'identity-stranger', email: 'identity-stranger@example.com', isAdmin: false };

function jsonRequest(body: unknown) {
	return { json: async () => body } as Request;
}

describe('site identity API', () => {
	it('lets the site owner save the public handle used by first publish', async () => {
		const site = structuredClone(seedSites.law);
		site.id = 'site-identity-api-owner';
		site.tenantId = 'tenant-identity-api-owner';
		saveDraft(site, { ownerUserId: owner.id });

		const response = await PUT({
			params: { siteId: site.id },
			request: jsonRequest({
				siteName: 'Ogo Football e.V.',
				publicHandle: 'Ogo Football',
				contactEmail: 'ogofootball@gmx.de'
			}),
			locals: { user: owner }
		} as never);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toMatchObject({
			ok: true,
			publicHandle: 'ogo-football'
		});
		expect(getSiteMeta(site.id)?.publicHandle).toBe('ogo-football');
	});

	it('rejects users who do not own the site', async () => {
		const site = structuredClone(seedSites.dental);
		site.id = 'site-identity-api-stranger';
		site.tenantId = 'tenant-identity-api-stranger';
		saveDraft(site, { ownerUserId: owner.id });

		const response = await PUT({
			params: { siteId: site.id },
			request: jsonRequest({ siteName: 'Nope', publicHandle: 'nope' }),
			locals: { user: stranger }
		} as never);

		expect(response.status).toBe(403);
	});

	it('allows one published subdomain rename and keeps the old handle as an alias', async () => {
		const site = structuredClone(seedSites.law);
		site.id = 'site-identity-one-rename';
		site.tenantId = 'tenant-identity-one-rename';
		saveDraft(site, { ownerUserId: owner.id });
		expect(
			(await PUT({
				params: { siteId: site.id },
				request: jsonRequest({ siteName: 'Rename Test', publicHandle: 'before-rename' }),
				locals: { user: owner }
			} as never)).status
		).toBe(200);
		publishDraft(site.id);

		const renamed = await PUT({
			params: { siteId: site.id },
			request: jsonRequest({ siteName: 'Rename Test', publicHandle: 'after-rename' }),
			locals: { user: owner }
		} as never);
		expect(renamed.status).toBe(200);
		expect(getSiteMeta(site.id)).toMatchObject({
		publicHandle: 'after-rename',
		previousPublicHandle: 'before-rename',
		publicHandleChangeCount: 1
		});
		expect(findSiteIdByPublicHandle('before-rename')).toBe(site.id);

		const secondRename = await PUT({
			params: { siteId: site.id },
			request: jsonRequest({ siteName: 'Rename Test', publicHandle: 'third-rename' }),
			locals: { user: owner }
		} as never);
		expect(secondRename.status).toBe(400);
		expect(await secondRename.json()).toMatchObject({ reason: 'published-handle-change' });
	});
});
