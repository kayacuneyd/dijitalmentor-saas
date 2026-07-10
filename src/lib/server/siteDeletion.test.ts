import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { domainReservations, mediaAssets, sites } from '$lib/server/db/schema';
import { seedSites } from '$lib/seed';
import { attachSiteDomain } from '$lib/server/domains';
import { getPublished, publishDraft, saveDraft } from '$lib/server/db/repo';
import { deleteSiteCascade } from './siteDeletion';

function insertReservation(siteId: string, status: string) {
	const now = new Date();
	db.insert(domainReservations)
		.values({
			id: `res-${randomUUID().slice(0, 8)}`,
			userId: 'user-deletion-test',
			siteId,
			domain: `${randomUUID().slice(0, 8)}.example`,
			status,
			paymentMethod: 'bank_transfer',
			createdAt: now,
			updatedAt: now
		})
		.run();
}

describe('deleteSiteCascade', () => {
	it('removes the site and all its dependent rows', async () => {
		const site = structuredClone(seedSites.law);
		site.id = `site-del-${randomUUID().slice(0, 8)}`;
		site.tenantId = site.id;
		saveDraft(site, { ownerUserId: 'user-deletion-test' });
		attachSiteDomain(site.id, 'delete-me.example', 'user-deletion-test');
		publishDraft(site.id);
		db.insert(mediaAssets)
			.values({
				id: randomUUID(),
				siteId: site.id,
				ownerUserId: 'user-deletion-test',
				objectKey: `sites/${site.id}/test.jpg`,
				url: 'https://cdn.example/test.jpg',
				fileName: 'test.jpg',
				mimeType: 'image/jpeg',
				sizeBytes: 10,
				createdAt: new Date()
			})
			.run();

		const result = await deleteSiteCascade(site.id);
		expect(result).toEqual({ ok: true });

		expect(db.select().from(sites).where(eq(sites.id, site.id)).get()).toBeUndefined();
		expect(getPublished(site.id)).toBeNull();
		expect(db.select().from(mediaAssets).where(eq(mediaAssets.siteId, site.id)).all()).toHaveLength(
			0
		);
	});

	it('refuses to delete while a paid/registering/active domain reservation exists', async () => {
		const site = structuredClone(seedSites.psych);
		site.id = `site-del-blocked-${randomUUID().slice(0, 8)}`;
		site.tenantId = site.id;
		saveDraft(site, { ownerUserId: 'user-deletion-test' });
		insertReservation(site.id, 'paid');

		const result = await deleteSiteCascade(site.id);
		expect(result).toEqual({ ok: false, reason: 'reservation-in-progress' });
		expect(db.select().from(sites).where(eq(sites.id, site.id)).get()).toBeDefined();
	});

	it('auto-cancels a merely pending reservation and proceeds with deletion', async () => {
		const site = structuredClone(seedSites.dental);
		site.id = `site-del-pending-${randomUUID().slice(0, 8)}`;
		site.tenantId = site.id;
		saveDraft(site, { ownerUserId: 'user-deletion-test' });
		insertReservation(site.id, 'pending');

		const result = await deleteSiteCascade(site.id);
		expect(result).toEqual({ ok: true });
		expect(db.select().from(sites).where(eq(sites.id, site.id)).get()).toBeUndefined();
	});

	it('reports not-found for an unknown site', async () => {
		const result = await deleteSiteCascade('ghost-site-does-not-exist');
		expect(result).toEqual({ ok: false, reason: 'not-found' });
	});
});
