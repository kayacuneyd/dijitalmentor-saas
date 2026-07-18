import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	checkCloudflareReadiness,
	cloudflareConfigured,
	createDestinationAddress,
	createEmailRoutingRule,
	createOrGetZone,
	createOrUpdateDnsRecord,
	defaultEmailLocalPart,
	enableEmailRoutingDns,
	getEmailRoutingStatus
} from './cloudflare';
import { clearSetting, setSetting } from './config';

function json(result: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify({ success: true, result }), {
		status: init.status ?? 200,
		headers: { 'content-type': 'application/json' }
	});
}

afterEach(() => {
	vi.restoreAllMocks();
	for (const key of [
		'CLOUDFLARE_API_TOKEN',
		'CLOUDFLARE_ACCOUNT_ID',
		'CLOUDFLARE_EMAIL_DEFAULT_LOCAL_PART'
	]) {
		clearSetting(key);
	}
});

describe('Cloudflare DNS + Email Routing provider', () => {
	it('detects configuration and defaults the forwarding local part', () => {
		expect(cloudflareConfigured()).toBe(false);
		expect(defaultEmailLocalPart()).toBe('info');
		setSetting('CLOUDFLARE_API_TOKEN', 'cf_token');
		setSetting('CLOUDFLARE_ACCOUNT_ID', 'account_123');
		setSetting('CLOUDFLARE_EMAIL_DEFAULT_LOCAL_PART', 'Contact');
		expect(cloudflareConfigured()).toBe(true);
		expect(defaultEmailLocalPart()).toBe('contact');
	});

	it('returns an existing zone before creating a new one', async () => {
		setSetting('CLOUDFLARE_API_TOKEN', 'cf_token');
		setSetting('CLOUDFLARE_ACCOUNT_ID', 'account_123');
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValue(
				json([{ id: 'zone_existing', name: 'example.com', name_servers: ['a', 'b'] }])
			);

		await expect(createOrGetZone('Example.COM')).resolves.toEqual({
			id: 'zone_existing',
			name: 'example.com',
			status: undefined,
			nameServers: ['a', 'b']
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/zones?name=example.com');
	});

	it('creates a full zone when none exists', async () => {
		setSetting('CLOUDFLARE_API_TOKEN', 'cf_token');
		setSetting('CLOUDFLARE_ACCOUNT_ID', 'account_123');
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(json([]))
			.mockResolvedValueOnce(
				json({
					id: 'zone_new',
					name: 'newsite.com',
					status: 'pending',
					name_servers: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
				})
			);

		const zone = await createOrGetZone('newsite.com');

		expect(zone.id).toBe('zone_new');
		const createBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
		expect(createBody).toMatchObject({
			name: 'newsite.com',
			account: { id: 'account_123' },
			type: 'full',
			jump_start: false
		});
	});

	it('upserts DNS records', async () => {
		setSetting('CLOUDFLARE_API_TOKEN', 'cf_token');
		setSetting('CLOUDFLARE_ACCOUNT_ID', 'account_123');
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(json([]))
			.mockResolvedValueOnce(
				json({ id: 'record_new', type: 'A', name: 'example.com', content: '203.0.113.10' })
			)
			.mockResolvedValueOnce(
				json([{ id: 'record_new', type: 'A', name: 'example.com', content: '203.0.113.10' }])
			)
			.mockResolvedValueOnce(
				json({ id: 'record_new', type: 'A', name: 'example.com', content: '203.0.113.11' })
			);

		await createOrUpdateDnsRecord({
			zoneId: 'zone_1',
			type: 'A',
			name: 'example.com',
			content: '203.0.113.10'
		});
		await createOrUpdateDnsRecord({
			zoneId: 'zone_1',
			type: 'A',
			name: 'example.com',
			content: '203.0.113.11'
		});

		expect(fetchMock.mock.calls[1]?.[1]?.method).toBe('POST');
		expect(fetchMock.mock.calls[3]?.[1]?.method).toBe('PUT');
	});

	it('creates destination addresses and routing rules', async () => {
		setSetting('CLOUDFLARE_API_TOKEN', 'cf_token');
		setSetting('CLOUDFLARE_ACCOUNT_ID', 'account_123');
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(json([]))
			.mockResolvedValueOnce(json({ id: 'addr_1', email: 'owner@example.net', verified: null }))
			.mockResolvedValueOnce(json([]))
			.mockResolvedValueOnce(
				json({ id: 'rule_1', name: 'Forward info@example.com', enabled: true })
			);

		await expect(createDestinationAddress('owner@example.net')).resolves.toMatchObject({
			id: 'addr_1',
			email: 'owner@example.net',
			verified: null
		});
		await expect(
			createEmailRoutingRule({
				zoneId: 'zone_1',
				domain: 'example.com',
				destinationEmail: 'owner@example.net'
			})
		).resolves.toMatchObject({ id: 'rule_1' });

		const body = JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body));
		expect(body).toMatchObject({
			name: 'Forward info@example.com',
			enabled: true,
			actions: [{ type: 'forward', value: ['owner@example.net'] }],
			matchers: [{ type: 'literal', field: 'to', value: 'info@example.com' }]
		});
	});

	it('reuses existing destination addresses and routing rules', async () => {
		setSetting('CLOUDFLARE_API_TOKEN', 'cf_token');
		setSetting('CLOUDFLARE_ACCOUNT_ID', 'account_123');
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(
				json([
					{ id: 'addr_existing', email: 'owner@example.net', verified: '2026-01-01T00:00:00Z' }
				])
			)
			.mockResolvedValueOnce(
				json([
					{
						id: 'rule_existing',
						name: 'Forward info@example.com',
						enabled: true,
						matchers: [{ type: 'literal', field: 'to', value: 'info@example.com' }]
					}
				])
			);

		await expect(createDestinationAddress('OWNER@example.net')).resolves.toMatchObject({
			id: 'addr_existing',
			email: 'owner@example.net',
			verified: new Date('2026-01-01T00:00:00Z')
		});
		await expect(
			createEmailRoutingRule({
				zoneId: 'zone_1',
				domain: 'example.com',
				destinationEmail: 'owner@example.net'
			})
		).resolves.toMatchObject({ id: 'rule_existing' });

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls.some((call) => call[1]?.method === 'POST')).toBe(false);
	});

	it('enables and reads Email Routing status', async () => {
		setSetting('CLOUDFLARE_API_TOKEN', 'cf_token');
		setSetting('CLOUDFLARE_ACCOUNT_ID', 'account_123');
		const fetchMock = vi
			.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(json({ status: 'pending' }))
			.mockResolvedValueOnce(json({ status: 'enabled' }));

		await expect(enableEmailRoutingDns('zone_1')).resolves.toBeUndefined();
		expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('POST');
		await expect(getEmailRoutingStatus('zone_1')).resolves.toBe('enabled');
	});

	it('checks account and email-address readiness without mutating Cloudflare', async () => {
		setSetting('CLOUDFLARE_API_TOKEN', 'cf_token');
		setSetting('CLOUDFLARE_ACCOUNT_ID', 'account_123');
		vi.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(json({ id: 'account_123' }))
			.mockResolvedValueOnce(json([]));

		await expect(checkCloudflareReadiness()).resolves.toEqual({
			configured: true,
			accountOk: true,
			emailAddressesOk: true,
			errors: []
		});
	});
});
