import { siteSubscriptionState } from '$lib/server/billing';
import { listSitesByOwner, type SiteMeta } from '$lib/server/db/repo';

export class SiteQuotaError extends Error {
	status: number;

	constructor(
		message: string,
		public code: 'preview-slot-limit' | 'published-site-limit',
		status = 403
	) {
		super(message);
		this.name = 'SiteQuotaError';
		this.status = status;
	}
}

export const FREE_PREVIEW_SITE_LIMIT = 3;
export const FREE_PUBLISHED_SITE_LIMIT = 1;

function isProSite(siteId: string, userId: string): boolean {
	return siteSubscriptionState(siteId, userId).state !== 'free';
}

export function freeSiteSlotUsage(userId: string) {
	const owned = listSitesByOwner(userId);
	const freeSites = owned.filter((site) => !isProSite(site.id, userId));
	return {
		previewUsed: freeSites.length,
		previewLimit: FREE_PREVIEW_SITE_LIMIT,
		publishedUsed: freeSites.filter((site) => site.publishedVersion).length,
		publishedLimit: FREE_PUBLISHED_SITE_LIMIT
	};
}

export function assertCanCreateFreePreviewSite(user: NonNullable<App.Locals['user']>): void {
	if (user.isAdmin) return;
	const usage = freeSiteSlotUsage(user.id);
	if (usage.previewUsed >= usage.previewLimit) {
		throw new SiteQuotaError(
			`Free plan includes ${usage.previewLimit} preview sites. Delete an unused site or upgrade one site to continue.`,
			'preview-slot-limit'
		);
	}
}

export function assertCanPublishFreeSite(
	user: NonNullable<App.Locals['user']>,
	meta: Pick<SiteMeta, 'id' | 'ownerUserId' | 'publishedVersion'>
): void {
	if (user.isAdmin || meta.ownerUserId !== user.id || isProSite(meta.id, user.id)) return;
	if (meta.publishedVersion) return;
	const usage = freeSiteSlotUsage(user.id);
	if (usage.publishedUsed >= usage.publishedLimit) {
		throw new SiteQuotaError(
			`Free plan includes ${usage.publishedLimit} published website. Unpublish another free site or upgrade this site to Pro.`,
			'published-site-limit'
		);
	}
}
