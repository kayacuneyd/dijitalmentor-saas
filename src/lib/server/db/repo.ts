import { and, desc, eq, ne, sql } from 'drizzle-orm';
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
	publicHandle: string | null;
	ownerUserId: string | null;
	publishedVersion: number | null;
	updatedAt: Date;
};

export const RESERVED_PUBLIC_HANDLES = new Set([
	'admin',
	'api',
	'app',
	'beta',
	'billing',
	'blog',
	'cdn',
	'contact',
	'dashboard',
	'help',
	'login',
	'logout',
	'mail',
	'preview',
	'pricing',
	'root',
	'saaskaya',
	'support',
	'www'
]);

export function normalizePublicHandle(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.replaceAll('ı', 'i')
		.replaceAll('ğ', 'g')
		.replaceAll('ü', 'u')
		.replaceAll('ş', 's')
		.replaceAll('ö', 'o')
		.replaceAll('ç', 'c')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}

export function publicHandleFromSite(site: Site): string {
	return normalizePublicHandle(site.id) || site.id;
}

export function validatePublicHandle(
	handle: string
): { ok: true; handle: string } | { ok: false; message: string } {
	const normalized = normalizePublicHandle(handle);
	if (normalized.length < 3) {
		return { ok: false, message: 'Subdomain en az 3 karakter olmalı.' };
	}
	if (normalized.length > 48) {
		return { ok: false, message: 'Subdomain en fazla 48 karakter olabilir.' };
	}
	if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(normalized)) {
		return { ok: false, message: 'Subdomain sadece küçük harf, rakam ve tire içerebilir.' };
	}
	if (RESERVED_PUBLIC_HANDLES.has(normalized)) {
		return { ok: false, message: 'Bu subdomain sistem tarafından ayrılmış.' };
	}
	return { ok: true, handle: normalized };
}

export function getDraft(siteId: string): Site | null {
	const row = db.select().from(sites).where(eq(sites.id, siteId)).get();
	if (!row) return null;
	return siteSchema.parse(row.draft);
}

export function getSiteMeta(siteId: string): SiteMeta | null {
	const row = db.select().from(sites).where(eq(sites.id, siteId)).get();
	if (!row) return null;
	const { id, tenantId, publicHandle, ownerUserId, publishedVersion, updatedAt } = row;
	return { id, tenantId, publicHandle, ownerUserId, publishedVersion, updatedAt };
}

export function saveDraft(site: Site, opts?: { ownerUserId?: string }): Site {
	const draft = siteSchema.parse(site);
	const now = new Date();
	db.insert(sites)
		.values({
			id: draft.id,
			tenantId: draft.tenantId,
			draft,
			publicHandle: publicHandleFromSite(draft),
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

export function listSitesByOwner(ownerUserId: string): (SiteMeta & {
	siteName: string;
	contactEmail: string | null;
	defaultLocale: string;
	locales: string[];
})[] {
	const rows = db
		.select()
		.from(sites)
		.where(eq(sites.ownerUserId, ownerUserId))
		.orderBy(desc(sites.updatedAt))
		.all();
	return rows.map((row) => ({
		id: row.id,
		tenantId: row.tenantId,
		publicHandle: row.publicHandle,
		ownerUserId: row.ownerUserId,
		publishedVersion: row.publishedVersion,
		updatedAt: row.updatedAt,
		siteName: siteSchema.parse(row.draft).settings.siteName,
		contactEmail: siteSchema.parse(row.draft).settings.contactEmail ?? null,
		defaultLocale: siteSchema.parse(row.draft).defaultLocale,
		locales: [...siteSchema.parse(row.draft).locales]
	}));
}

export function findSiteIdByPublicHandle(handle: string): string | null {
	const normalized = normalizePublicHandle(handle);
	const row = db
		.select({ id: sites.id })
		.from(sites)
		.where(eq(sites.publicHandle, normalized))
		.get();
	return row?.id ?? null;
}

export function isPublicHandleAvailable(handle: string, exceptSiteId?: string): boolean {
	const normalized = normalizePublicHandle(handle);
	const row = db
		.select({ id: sites.id })
		.from(sites)
		.where(
			exceptSiteId
				? and(eq(sites.publicHandle, normalized), ne(sites.id, exceptSiteId))
				: eq(sites.publicHandle, normalized)
		)
		.get();
	return !row;
}

export type SetSiteIdentityResult =
	| { ok: true; site: Site; publicHandle: string }
	| {
			ok: false;
			reason: 'not-found' | 'invalid-handle' | 'handle-taken' | 'published-handle-change';
			message: string;
	  };

export function setSiteIdentity(input: {
	siteId: string;
	siteName: string;
	publicHandle: string;
	contactEmail?: string | null;
}): SetSiteIdentityResult {
	const row = db.select().from(sites).where(eq(sites.id, input.siteId)).get();
	if (!row) return { ok: false, reason: 'not-found', message: 'Site bulunamadı.' };
	const handle = validatePublicHandle(input.publicHandle);
	if (!handle.ok) return { ok: false, reason: 'invalid-handle', message: handle.message };
	if (!isPublicHandleAvailable(handle.handle, input.siteId)) {
		return {
			ok: false,
			reason: 'handle-taken',
			message: 'Bu subdomain başka bir site tarafından kullanılıyor.'
		};
	}
	if (row.publishedVersion && row.publicHandle && row.publicHandle !== handle.handle) {
		return {
			ok: false,
			reason: 'published-handle-change',
			message:
				'Yayındaki sitenin subdomaini bu sürümde değiştirilemez. Önce yayından kaldırıp tekrar yayınla.'
		};
	}
	const draft = siteSchema.parse(row.draft);
	const next = siteSchema.parse({
		...draft,
		settings: {
			...draft.settings,
			siteName: input.siteName.trim() || draft.settings.siteName,
			contactEmail: input.contactEmail?.trim() || draft.settings.contactEmail
		}
	});
	db.update(sites)
		.set({ draft: next, publicHandle: handle.handle, updatedAt: new Date() })
		.where(eq(sites.id, input.siteId))
		.run();
	return { ok: true, site: next, publicHandle: handle.handle };
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

export function getPublishedByPublicHandle(handle: string): Site | null {
	const siteId = findSiteIdByPublicHandle(handle);
	return siteId ? getPublished(siteId) : null;
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
	const byHandle = getPublishedByPublicHandle(key);
	if (byHandle) return byHandle;
	const byDomain = findSiteIdByDomain(key);
	return byDomain ? getPublished(byDomain) : null;
}
