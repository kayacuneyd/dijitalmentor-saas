import { desc, eq, sql } from 'drizzle-orm';
import { db } from './index';
import { customDomains, sites, siteVersions } from './schema';
import { seedSites } from '$lib/seed';
import { siteSchema, type Site } from '$lib/schema/site';

/**
 * Repository layer over the first-slice storage (one local SQLite, see PLAN §6).
 * Every read and write passes through `siteSchema` — the DB never holds or serves
 * a draft that violates the contract.
 */

export type SiteMeta = {
	id: string;
	tenantId: string;
	ownerUserId: string | null;
	publishedVersion: number | null;
	updatedAt: Date;
};

export function getDraft(siteId: string): Site | null {
	const row = db.select().from(sites).where(eq(sites.id, siteId)).get();
	if (!row) return null;
	return siteSchema.parse(row.draft);
}

export function getSiteMeta(siteId: string): SiteMeta | null {
	const row = db.select().from(sites).where(eq(sites.id, siteId)).get();
	if (!row) return null;
	const { id, tenantId, ownerUserId, publishedVersion, updatedAt } = row;
	return { id, tenantId, ownerUserId, publishedVersion, updatedAt };
}

export function saveDraft(site: Site, opts?: { ownerUserId?: string }): Site {
	const draft = siteSchema.parse(site);
	const now = new Date();
	db.insert(sites)
		.values({
			id: draft.id,
			tenantId: draft.tenantId,
			draft,
			ownerUserId: opts?.ownerUserId ?? null,
			updatedAt: now
		})
		// ownership and publish state survive draft updates on purpose
		.onConflictDoUpdate({ target: sites.id, set: { draft, updatedAt: now } })
		.run();
	return draft;
}

/** Drafts are lazily seeded from the hand-authored sites until real tenants exist (M4+). */
export function getOrSeedDraft(siteId: string): Site | null {
	const existing = getDraft(siteId);
	if (existing) return existing;
	const seed = Object.values(seedSites).find((s) => s.id === siteId);
	if (!seed) return null;
	return saveDraft(seed);
}

export function listSitesByOwner(ownerUserId: string): (SiteMeta & { siteName: string })[] {
	const rows = db
		.select()
		.from(sites)
		.where(eq(sites.ownerUserId, ownerUserId))
		.orderBy(desc(sites.updatedAt))
		.all();
	return rows.map((row) => ({
		id: row.id,
		tenantId: row.tenantId,
		ownerUserId: row.ownerUserId,
		publishedVersion: row.publishedVersion,
		updatedAt: row.updatedAt,
		siteName: siteSchema.parse(row.draft).settings.siteName
	}));
}

// ---------------------------------------------------------------------------
// Publish (M4): immutable snapshots in site_versions; sites.published_version
// points at the one being served. Draft edits never touch a published snapshot.
// ---------------------------------------------------------------------------

export function publishDraft(siteId: string): number | null {
	const draft = getDraft(siteId);
	if (!draft) return null;
	const latest = db
		.select({ max: sql<number | null>`max(${siteVersions.version})` })
		.from(siteVersions)
		.where(eq(siteVersions.siteId, siteId))
		.get();
	const version = (latest?.max ?? 0) + 1;
	db.insert(siteVersions).values({ siteId, version, data: draft, createdAt: new Date() }).run();
	db.update(sites).set({ publishedVersion: version }).where(eq(sites.id, siteId)).run();
	return version;
}

export function unpublishSite(siteId: string): void {
	db.update(sites).set({ publishedVersion: null }).where(eq(sites.id, siteId)).run();
}

/** The published snapshot currently being served, or null if never/un-published. */
export function getPublished(siteId: string): Site | null {
	const meta = getSiteMeta(siteId);
	if (!meta?.publishedVersion) return null;
	const row = db
		.select()
		.from(siteVersions)
		.where(
			sql`${siteVersions.siteId} = ${siteId} and ${siteVersions.version} = ${meta.publishedVersion}`
		)
		.get();
	if (!row) return null;
	return siteSchema.parse(row.data);
}

/** Which site (if any) already claims this custom domain — uniqueness gate (audit fix). */
export function findSiteIdByDomain(domain: string): string | null {
	const row = db
		.select({ id: customDomains.siteId })
		.from(customDomains)
		.where(eq(customDomains.hostname, domain))
		.get();
	return row?.id ?? null;
}

/**
 * Resolve a public-site key from Host routing: a site id (subdomain form) or a
 * custom domain stored in the canonical custom_domains table.
 */
export function resolvePublishedByKey(key: string): Site | null {
	const direct = getPublished(key);
	if (direct) return direct;
	const byDomain = findSiteIdByDomain(key);
	return byDomain ? getPublished(byDomain) : null;
}
