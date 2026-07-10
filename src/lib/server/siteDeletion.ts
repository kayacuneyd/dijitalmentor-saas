import { and, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	contactSubmissions,
	customDomains,
	domainReservations,
	mediaAssets,
	siteChatMessages,
	sites,
	siteVersions
} from '$lib/server/db/schema';
import { deleteMediaObjects } from '$lib/server/media';

/**
 * Permanent site deletion. Guarded against money-in-flight: a site with a domain
 * reservation that's been paid for, is mid-registration, or is already live cannot
 * be deleted out from under it — the owner has to resolve the domain first. A merely
 * `pending` reservation (no money moved yet) is auto-cancelled instead of blocking.
 */

const BLOCKING_RESERVATION_STATUSES = ['paid', 'registering', 'active'] as const;

export type DeleteSiteResult =
	{ ok: true } | { ok: false; reason: 'not-found' | 'reservation-in-progress' };

export async function deleteSiteCascade(siteId: string): Promise<DeleteSiteResult> {
	const site = db.select({ id: sites.id }).from(sites).where(eq(sites.id, siteId)).get();
	if (!site) return { ok: false, reason: 'not-found' };

	const blocking = db
		.select({ id: domainReservations.id })
		.from(domainReservations)
		.where(
			and(
				eq(domainReservations.siteId, siteId),
				inArray(domainReservations.status, BLOCKING_RESERVATION_STATUSES)
			)
		)
		.all();
	if (blocking.length > 0) return { ok: false, reason: 'reservation-in-progress' };

	const objectKeys = db
		.select({ objectKey: mediaAssets.objectKey })
		.from(mediaAssets)
		.where(eq(mediaAssets.siteId, siteId))
		.all()
		.map((row) => row.objectKey);

	db.transaction((tx) => {
		tx.update(domainReservations)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(and(eq(domainReservations.siteId, siteId), eq(domainReservations.status, 'pending')))
			.run();
		tx.delete(siteVersions).where(eq(siteVersions.siteId, siteId)).run();
		tx.delete(contactSubmissions).where(eq(contactSubmissions.siteId, siteId)).run();
		tx.delete(mediaAssets).where(eq(mediaAssets.siteId, siteId)).run();
		tx.delete(siteChatMessages).where(eq(siteChatMessages.siteId, siteId)).run();
		tx.delete(customDomains).where(eq(customDomains.siteId, siteId)).run();
		tx.delete(sites).where(eq(sites.id, siteId)).run();
	});

	if (objectKeys.length > 0) {
		await deleteMediaObjects(objectKeys);
	}

	return { ok: true };
}
