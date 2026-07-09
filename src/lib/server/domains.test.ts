import { describe, expect, it } from 'vitest';
import {
	attachSiteDomain,
	detachSiteDomain,
	getDomainForSite,
	normalizeDomain,
	setSiteDomain,
	validateDomain
} from './domains';
import { getDraft, getOrSeedDraft, saveDraft } from './db/repo';
import { seedSites } from '$lib/seed';

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
