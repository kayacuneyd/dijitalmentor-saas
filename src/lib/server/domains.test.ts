import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	attachSiteDomain,
	detachSiteDomain,
	getDomainForSite,
	normalizeDomain,
	setSiteDomain,
	updateNameservers,
	validateDomain
} from './domains';
import { getDraft, getOrSeedDraft, saveDraft } from './db/repo';
import { seedSites } from '$lib/seed';
import { clearSetting, setSetting } from './config';

afterEach(() => {
	vi.restoreAllMocks();
	clearSetting('PORKBUN_API_KEY');
	clearSetting('PORKBUN_SECRET_KEY');
});

describe('validateDomain', () => {
	it('accepts real hostnames and rejects junk', () => {
		expect(validateDomain('kanzlei-demir.de')).toBe(true);
		expect(validateDomain('www.praxis-yilmaz.example')).toBe(true);
		expect(validateDomain('xn--trkiye-3ya.com')).toBe(true);
		expect(validateDomain('no-tld')).toBe(false);
		expect(validateDomain('UPPER.com')).toBe(false); // callers lowercase first
		expect(validateDomain('bad_domain.com')).toBe(false);
		expect(validateDomain('a.com; rm -rf /')).toBe(false);
		expect(validateDomain('-leading.com')).toBe(false);
		expect(validateDomain(`${'a'.repeat(260)}.com`)).toBe(false);
	});

	it('normalizes hostnames before validation/attach', () => {
		expect(normalizeDomain('  WWW.Example.COM. ')).toBe('www.example.com');
	});
});

describe('setSiteDomain', () => {
	it('attaches and detaches a canonical domain while keeping the draft in sync', () => {
		getOrSeedDraft('seed-law');
		expect(setSiteDomain('seed-law', 'kanzlei-aksoy.example')).toBe(true);
		expect(getDomainForSite('seed-law')).toBe('kanzlei-aksoy.example');
		expect(getDraft('seed-law')?.domain).toBe('kanzlei-aksoy.example');
		expect(setSiteDomain('seed-law', null)).toBe(true);
		expect(getDomainForSite('seed-law')).toBeNull();
		expect(getDraft('seed-law')?.domain).toBeUndefined();
		expect(setSiteDomain('ghost', 'x.example')).toBe(false);
	});

	it('prevents the same hostname from being attached to two sites', () => {
		getOrSeedDraft('seed-law');
		const psych = structuredClone(seedSites.psych);
		psych.id = 'seed-psych-domain-conflict';
		saveDraft(psych);

		expect(attachSiteDomain('seed-law', 'shared.example', null)).toEqual({
			ok: true,
			hostname: 'shared.example'
		});
		expect(attachSiteDomain('seed-psych-domain-conflict', 'shared.example', null)).toMatchObject({
			ok: false,
			reason: 'domain-taken',
			ownerSiteId: 'seed-law'
		});
		expect(getDomainForSite('seed-psych-domain-conflict')).toBeNull();
	});

	it('replaces a site domain without leaving stale aliases behind', () => {
		getOrSeedDraft('seed-dental');
		expect(attachSiteDomain('seed-dental', 'old-domain.example', null).ok).toBe(true);
		expect(attachSiteDomain('seed-dental', 'new-domain.example', null).ok).toBe(true);
		expect(getDomainForSite('seed-dental')).toBe('new-domain.example');
		expect(detachSiteDomain('seed-dental')).toBe(true);
		expect(getDomainForSite('seed-dental')).toBeNull();
	});
});

describe('Porkbun nameserver delegation', () => {
	it('updates nameservers through the provider seam', async () => {
		setSetting('PORKBUN_API_KEY', 'pk_test');
		setSetting('PORKBUN_SECRET_KEY', 'sk_test');
		const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ status: 'SUCCESS' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		await updateNameservers('example.com', ['NS1.Cloudflare.com', 'ns2.cloudflare.com']);

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.porkbun.com/api/json/v3/domain/updateNs/example.com',
			expect.objectContaining({ method: 'POST' })
		);
		expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
			apikey: 'pk_test',
			secretapikey: 'sk_test',
			ns: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
		});
	});

	it('requires at least two nameservers before calling Porkbun', async () => {
		setSetting('PORKBUN_API_KEY', 'pk_test');
		setSetting('PORKBUN_SECRET_KEY', 'sk_test');
		const fetchMock = vi.spyOn(globalThis, 'fetch');

		await expect(updateNameservers('example.com', ['ns1.cloudflare.com'])).rejects.toThrow(
			/two nameservers/
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
