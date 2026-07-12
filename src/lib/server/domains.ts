import { execFile } from 'node:child_process';
import { resolve4 } from 'node:dns/promises';
import { promisify } from 'node:util';
import { and, eq, ne } from 'drizzle-orm';
import { getSetting } from '$lib/server/config';
import { db } from '$lib/server/db';
import { customDomains } from '$lib/server/db/schema';
import { getDraft, getSiteMeta, saveDraft } from '$lib/server/db/repo';

const execFileAsync = promisify(execFile);

/**
 * Custom domains (PLAN §8 / M5). Two paths, both strictly post-payment gated by
 * the caller (constitution §5):
 * - attach a domain the customer already owns (DNS must point at SERVER_IP);
 * - register a new one via the Porkbun API (provider seam; needs keys in /admin/settings).
 * TLS: PLAN names Caddy on-demand TLS, but this VPS serves 27 nginx sites on 80/443 —
 * so provisioning is nginx-vhost + certbot via scripts/provision-domain.sh instead
 * (same intent, infra-compatible mechanism; see PROGRESS decision).
 */

export const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export function validateDomain(domain: string): boolean {
	return domain.length <= 253 && HOSTNAME_RE.test(domain);
}

export function normalizeDomain(domain: string): string {
	return domain.trim().toLowerCase().replace(/\.$/, '');
}

/** Does the domain's A record point at us? Skipped when SERVER_IP is unset. */
export async function dnsPointsHere(
	domain: string
): Promise<{ ok: boolean; skipped?: boolean; resolved?: string[] }> {
	const serverIp = getSetting('SERVER_IP');
	if (!serverIp) return { ok: true, skipped: true };
	try {
		const resolved = await resolve4(domain);
		return { ok: resolved.includes(serverIp), resolved };
	} catch {
		return { ok: false, resolved: [] };
	}
}

export type AttachDomainResult =
	| { ok: true; hostname: string }
	| { ok: false; reason: 'missing-site' | 'domain-taken'; ownerSiteId?: string };

export function getDomainForSite(siteId: string): string | null {
	const row = db
		.select({ hostname: customDomains.hostname })
		.from(customDomains)
		.where(eq(customDomains.siteId, siteId))
		.get();
	return row?.hostname ?? null;
}

export function listAttachedDomains(): {
	hostname: string;
	siteId: string;
	ownerUserId: string | null;
}[] {
	return db
		.select({
			hostname: customDomains.hostname,
			siteId: customDomains.siteId,
			ownerUserId: customDomains.ownerUserId
		})
		.from(customDomains)
		.all();
}

/**
 * Attach a hostname to exactly one site. The `hostname` primary key is the
 * authoritative uniqueness guarantee; the draft field is kept only for legacy
 * export/editor display compatibility.
 */
export function attachSiteDomain(
	siteId: string,
	domain: string,
	ownerUserId: string | null
): AttachDomainResult {
	const hostname = normalizeDomain(domain);
	const draft = getDraft(siteId);
	if (!draft) return { ok: false, reason: 'missing-site' };

	const existing = db
		.select({ siteId: customDomains.siteId })
		.from(customDomains)
		.where(eq(customDomains.hostname, hostname))
		.get();
	if (existing && existing.siteId !== siteId) {
		return { ok: false, reason: 'domain-taken', ownerSiteId: existing.siteId };
	}

	const now = new Date();
	try {
		if (existing) {
			db.update(customDomains)
				.set({ ownerUserId, status: 'active', verifiedAt: now, updatedAt: now })
				.where(eq(customDomains.hostname, hostname))
				.run();
		} else {
			db.insert(customDomains)
				.values({
					hostname,
					siteId,
					ownerUserId,
					kind: 'custom',
					status: 'active',
					verifiedAt: now,
					createdAt: now,
					updatedAt: now
				})
				.run();
		}
	} catch {
		return { ok: false, reason: 'domain-taken' };
	}
	db.delete(customDomains)
		.where(and(eq(customDomains.siteId, siteId), ne(customDomains.hostname, hostname)))
		.run();

	const next = structuredClone(draft);
	next.domain = hostname;
	saveDraft(next);
	return { ok: true, hostname };
}

export function detachSiteDomain(siteId: string): boolean {
	const draft = getDraft(siteId);
	if (!draft) return false;
	db.delete(customDomains).where(eq(customDomains.siteId, siteId)).run();
	const next = structuredClone(draft);
	delete next.domain;
	saveDraft(next);
	return true;
}

/** Legacy wrapper kept for older call sites/tests while the app moves to attach/detach. */
export function setSiteDomain(siteId: string, domain: string | null): boolean {
	if (!domain) return detachSiteDomain(siteId);
	const meta = getSiteMeta(siteId);
	return attachSiteDomain(siteId, domain, meta?.ownerUserId ?? null).ok;
}

/** nginx vhost + certbot, only when the operator has switched it on. */
export async function provisionDomain(
	domain: string
): Promise<{ ran: boolean; ok?: boolean; output?: string }> {
	if (getSetting('DOMAIN_PROVISION') !== '1') return { ran: false };
	if (!validateDomain(domain)) throw new Error('invalid domain'); // belt & braces before exec
	try {
		const { stdout, stderr } = await execFileAsync(
			'/var/www/saaskaya/scripts/provision-domain.sh',
			[domain],
			{ timeout: 120_000 }
		);
		return { ran: true, ok: true, output: `${stdout}\n${stderr}`.trim() };
	} catch (error) {
		return { ran: true, ok: false, output: String(error) };
	}
}

// ---------------------------------------------------------------------------
// Porkbun provider seam. Endpoints per https://porkbun.com/api/json/v3/documentation —
// re-verify the registration endpoint against the live docs when keys are first added.
// ---------------------------------------------------------------------------

const PORKBUN_BASE = 'https://api.porkbun.com/api/json/v3';

function porkbunAuth(): { apikey: string; secretapikey: string } | null {
	const apikey = getSetting('PORKBUN_API_KEY');
	const secretapikey = getSetting('PORKBUN_SECRET_KEY');
	return apikey && secretapikey ? { apikey, secretapikey } : null;
}

export const porkbunConfigured = () => porkbunAuth() !== null;

async function porkbunPost(path: string, body: Record<string, unknown>) {
	const auth = porkbunAuth();
	if (!auth) throw new Error('Domain provider is not configured (Porkbun keys missing).');
	const res = await fetch(`${PORKBUN_BASE}${path}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ ...auth, ...body })
	});
	const data = (await res.json()) as { status?: string; message?: string } & Record<
		string,
		unknown
	>;
	if (!res.ok || data.status !== 'SUCCESS') {
		throw new Error(`Porkbun ${path} failed: ${data.message ?? res.status}`);
	}
	return data;
}

export async function checkDomainAvailability(
	domain: string
): Promise<{ available: boolean; price?: string }> {
	const data = (await porkbunPost(`/domain/checkDomain/${domain}`, {})) as {
		response?: { avail?: string; price?: string };
	};
	return { available: data.response?.avail === 'yes', price: data.response?.price };
}

/** Registration — only ever called after payment (constitution §5). */
export async function registerDomain(domain: string): Promise<void> {
	await porkbunPost(`/domain/create/${domain}`, { years: 1 });
}

/** Delegate DNS to Cloudflare after registration; not used until the Cloudflare fulfillment path is on. */
export async function updateNameservers(domain: string, nameservers: string[]): Promise<void> {
	const ns = nameservers.map((item) => item.trim().toLowerCase()).filter(Boolean);
	if (ns.length < 2) throw new Error('at least two nameservers are required');
	await porkbunPost(`/domain/updateNs/${domain}`, { ns });
}

/** Point the fresh domain at this server. */
export async function createARecord(domain: string): Promise<void> {
	const serverIp = getSetting('SERVER_IP');
	if (!serverIp) throw new Error('SERVER_IP is not configured.');
	await porkbunPost(`/dns/create/${domain}`, {
		type: 'A',
		name: '',
		content: serverIp,
		ttl: '600'
	});
}
