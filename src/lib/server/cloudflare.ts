import { getSetting } from '$lib/server/config';
import { normalizeDomain, validateDomain } from '$lib/server/domains';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

export class CloudflareNotConfiguredError extends Error {}

type CloudflareEnvelope<T> = {
	success?: boolean;
	errors?: { message?: string }[];
	result?: T;
};

export type CloudflareZone = {
	id: string;
	name: string;
	status?: string;
	nameServers: string[];
};

export type CloudflareDnsRecord = {
	id: string;
	type: string;
	name: string;
	content: string;
};

export type CloudflareDestinationAddress = {
	id: string;
	email: string;
	verified?: Date | null;
};

export type CloudflareRoutingRule = {
	id: string;
	name?: string;
	enabled?: boolean;
	actions?: { type?: string; value?: string[] }[];
	matchers?: { type?: string; field?: string; value?: string }[];
};

export type CloudflareReadiness = {
	configured: boolean;
	accountOk: boolean;
	emailAddressesOk: boolean;
	errors: string[];
};

export function cloudflareConfigured(): boolean {
	return Boolean(getSetting('CLOUDFLARE_API_TOKEN') && getSetting('CLOUDFLARE_ACCOUNT_ID'));
}

export function defaultEmailLocalPart(): string {
	const configured = getSetting('CLOUDFLARE_EMAIL_DEFAULT_LOCAL_PART')?.trim().toLowerCase();
	return configured || 'info';
}

function cloudflareConfig(): { token: string; accountId: string } {
	const token = getSetting('CLOUDFLARE_API_TOKEN');
	const accountId = getSetting('CLOUDFLARE_ACCOUNT_ID');
	if (!token || !accountId) {
		throw new CloudflareNotConfiguredError('Cloudflare DNS/Email Routing is not configured.');
	}
	return { token, accountId };
}

function firstError<T>(body: CloudflareEnvelope<T>, fallback: number): string {
	return (
		body.errors
			?.map((error) => error.message)
			.filter(Boolean)
			.join(', ') || String(fallback)
	);
}

async function cloudflareFetch<T>(
	path: string,
	options: RequestInit = {}
): Promise<CloudflareEnvelope<T>> {
	const { token } = cloudflareConfig();
	const headers = new Headers(options.headers);
	headers.set('authorization', `Bearer ${token}`);
	if (options.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
	const res = await fetch(`${CLOUDFLARE_API_BASE}${path}`, { ...options, headers });
	const body = (await res.json()) as CloudflareEnvelope<T>;
	if (!res.ok || body.success === false) {
		throw new Error(`Cloudflare ${path} failed: ${firstError(body, res.status)}`);
	}
	return body;
}

function normalizeZone(result: {
	id: string;
	name: string;
	status?: string;
	name_servers?: string[];
	nameServers?: string[];
}): CloudflareZone {
	return {
		id: result.id,
		name: result.name,
		status: result.status,
		nameServers: result.name_servers ?? result.nameServers ?? []
	};
}

export async function createOrGetZone(domain: string): Promise<CloudflareZone> {
	const name = normalizeDomain(domain);
	if (!validateDomain(name)) throw new Error('invalid domain');
	const { accountId } = cloudflareConfig();
	const existing = await cloudflareFetch<
		{ id: string; name: string; status?: string; name_servers?: string[] }[]
	>(`/zones?name=${encodeURIComponent(name)}&account.id=${encodeURIComponent(accountId)}`);
	const zone = existing.result?.find((item) => item.name === name);
	if (zone) return normalizeZone(zone);
	const created = await cloudflareFetch<{
		id: string;
		name: string;
		status?: string;
		name_servers?: string[];
	}>(`/zones`, {
		method: 'POST',
		body: JSON.stringify({
			name,
			account: { id: accountId },
			type: 'full',
			jump_start: false
		})
	});
	if (!created.result) throw new Error('Cloudflare zone create returned no result.');
	return normalizeZone(created.result);
}

export async function getZoneNameservers(zoneId: string): Promise<string[]> {
	const zone = await cloudflareFetch<{ name_servers?: string[]; nameServers?: string[] }>(
		`/zones/${encodeURIComponent(zoneId)}`
	);
	return zone.result?.name_servers ?? zone.result?.nameServers ?? [];
}

export async function createOrUpdateDnsRecord(input: {
	zoneId: string;
	type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
	name: string;
	content: string;
	ttl?: number;
	priority?: number;
	proxied?: boolean;
}): Promise<CloudflareDnsRecord> {
	const name = input.name.trim().toLowerCase();
	const type = input.type.toUpperCase();
	const query = new URLSearchParams({ type, name });
	const existing = await cloudflareFetch<CloudflareDnsRecord[]>(
		`/zones/${encodeURIComponent(input.zoneId)}/dns_records?${query.toString()}`
	);
	const payload = {
		type,
		name,
		content: input.content,
		ttl: input.ttl ?? 300,
		...(input.priority ? { priority: input.priority } : {}),
		...(typeof input.proxied === 'boolean' ? { proxied: input.proxied } : {})
	};
	const record = existing.result?.[0];
	if (record) {
		const updated = await cloudflareFetch<CloudflareDnsRecord>(
			`/zones/${encodeURIComponent(input.zoneId)}/dns_records/${encodeURIComponent(record.id)}`,
			{ method: 'PUT', body: JSON.stringify(payload) }
		);
		if (!updated.result) throw new Error('Cloudflare DNS update returned no result.');
		return updated.result;
	}
	const created = await cloudflareFetch<CloudflareDnsRecord>(
		`/zones/${encodeURIComponent(input.zoneId)}/dns_records`,
		{ method: 'POST', body: JSON.stringify(payload) }
	);
	if (!created.result) throw new Error('Cloudflare DNS create returned no result.');
	return created.result;
}

export async function enableEmailRoutingDns(zoneId: string): Promise<void> {
	await cloudflareFetch(`/zones/${encodeURIComponent(zoneId)}/email/routing/dns`, {
		method: 'POST'
	});
}

export async function getEmailRoutingStatus(zoneId: string): Promise<string | undefined> {
	const status = await cloudflareFetch<{ status?: string }>(
		`/zones/${encodeURIComponent(zoneId)}/email/routing`
	);
	return status.result?.status;
}

export async function createDestinationAddress(
	email: string
): Promise<CloudflareDestinationAddress> {
	const { accountId } = cloudflareConfig();
	const normalizedEmail = email.trim().toLowerCase();
	const existing = await cloudflareFetch<
		{ id: string; email: string; verified?: string | null }[]
	>(`/accounts/${encodeURIComponent(accountId)}/email/routing/addresses`);
	const address = existing.result?.find((item) => item.email.toLowerCase() === normalizedEmail);
	if (address) {
		return {
			id: address.id,
			email: address.email,
			verified: address.verified ? new Date(address.verified) : null
		};
	}
	const created = await cloudflareFetch<{
		id: string;
		email: string;
		verified?: string | null;
	}>(`/accounts/${encodeURIComponent(accountId)}/email/routing/addresses`, {
		method: 'POST',
		body: JSON.stringify({ email: normalizedEmail })
	});
	if (!created.result) throw new Error('Cloudflare destination create returned no result.');
	return {
		id: created.result.id,
		email: created.result.email,
		verified: created.result.verified ? new Date(created.result.verified) : null
	};
}

export async function createEmailRoutingRule(input: {
	zoneId: string;
	domain: string;
	localPart?: string;
	destinationEmail: string;
}): Promise<CloudflareRoutingRule> {
	const domain = normalizeDomain(input.domain);
	const localPart = (input.localPart ?? defaultEmailLocalPart()).trim().toLowerCase();
	if (!validateDomain(domain)) throw new Error('invalid domain');
	if (!/^[a-z0-9._%+-]+$/.test(localPart)) throw new Error('invalid email local part');
	const address = `${localPart}@${domain}`;
	const existing = await cloudflareFetch<CloudflareRoutingRule[]>(
		`/zones/${encodeURIComponent(input.zoneId)}/email/routing/rules`
	);
	const rule = existing.result?.find((item) =>
		item.matchers?.some(
			(matcher) => matcher.type === 'literal' && matcher.field === 'to' && matcher.value === address
		)
	);
	if (rule) return rule;
	const created = await cloudflareFetch<CloudflareRoutingRule>(
		`/zones/${encodeURIComponent(input.zoneId)}/email/routing/rules`,
		{
			method: 'POST',
			body: JSON.stringify({
				name: `Forward ${address}`,
				enabled: true,
				actions: [{ type: 'forward', value: [input.destinationEmail] }],
				matchers: [{ type: 'literal', field: 'to', value: address }]
			})
		}
	);
	if (!created.result) throw new Error('Cloudflare routing rule create returned no result.');
	return created.result;
}

export async function checkCloudflareReadiness(): Promise<CloudflareReadiness> {
	if (!cloudflareConfigured()) {
		return {
			configured: false,
			accountOk: false,
			emailAddressesOk: false,
			errors: ['missing Cloudflare token or account id']
		};
	}
	const errors: string[] = [];
	let accountOk = false;
	let emailAddressesOk = false;
	try {
		await cloudflareFetch(`/accounts/${encodeURIComponent(cloudflareConfig().accountId)}`);
		accountOk = true;
	} catch (error) {
		errors.push(String(error));
	}
	try {
		await cloudflareFetch(
			`/accounts/${encodeURIComponent(cloudflareConfig().accountId)}/email/routing/addresses`
		);
		emailAddressesOk = true;
	} catch (error) {
		errors.push(String(error));
	}
	return { configured: true, accountOk, emailAddressesOk, errors };
}
