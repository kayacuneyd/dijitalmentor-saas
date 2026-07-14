import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { seedSites } from '$lib/seed';
import { db } from '$lib/server/db';
import { sites } from '$lib/server/db/schema';
import { saveDraft } from '$lib/server/db/repo';
import {
	assertCanCreateFreePreviewSite,
	freeSiteSlotUsage,
	FREE_PREVIEW_SITE_LIMIT,
	SiteQuotaError
} from './siteQuota';

const user = {
	id: 'quota-free-user',
	email: 'quota-free@example.com',
	isAdmin: false,
	locale: null
};

function saveSite(id: string) {
	const site = structuredClone(seedSites.psych);
	site.id = id;
	site.tenantId = `tenant-${id}`;
	saveDraft(site, { ownerUserId: user.id });
}

describe('free site slot quota', () => {
	it('allows three preview sites and blocks the fourth until one is deleted', () => {
		for (let i = 1; i <= FREE_PREVIEW_SITE_LIMIT; i += 1) {
			expect(() => assertCanCreateFreePreviewSite(user)).not.toThrow();
			saveSite(`site-quota-preview-${i}`);
		}

		expect(freeSiteSlotUsage(user.id).previewUsed).toBe(FREE_PREVIEW_SITE_LIMIT);
		expect(() => assertCanCreateFreePreviewSite(user)).toThrow(SiteQuotaError);

		db.delete(sites).where(eq(sites.id, 'site-quota-preview-1')).run();
		expect(() => assertCanCreateFreePreviewSite(user)).not.toThrow();
	});
});
