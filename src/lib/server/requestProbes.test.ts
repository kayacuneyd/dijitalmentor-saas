import { afterEach, describe, expect, it } from 'vitest';
import { db } from '$lib/server/db';
import { requestProbeStats } from '$lib/server/db/schema';
import { classifyRequestProbe, listRequestProbes, recordRequestProbe } from './requestProbes';

afterEach(() => {
	db.delete(requestProbeStats).run();
});

describe('request probe telemetry', () => {
	it('classifies common scanner and benign 404 patterns', () => {
		expect(classifyRequestProbe('/wp-admin/install.php')).toBe('wordpress');
		expect(classifyRequestProbe('//wordpress/wp-includes/wlwmanifest.xml')).toBe('wordpress');
		expect(classifyRequestProbe('/.env')).toBe('secret-scan');
		expect(classifyRequestProbe('/wp/.env')).toBe('secret-scan');
		expect(classifyRequestProbe('/lander/gazprom-prelander/')).toBe('landing-probe');
		expect(classifyRequestProbe('/BSDLw5Mp')).toBe('random-short-path');
		expect(classifyRequestProbe('/favicon.ico')).toBe('asset-miss');
		expect(classifyRequestProbe('/normal-missing-page')).toBe('unknown-404');
	});

	it('aggregates probes without storing raw user-agent or address values', () => {
		recordRequestProbe({
			pathname: '/wp-admin/install.php',
			userAgent: 'scanner-agent',
			clientAddress: '203.0.113.42'
		});
		recordRequestProbe({
			pathname: '/wordpress/wp-admin/install.php',
			userAgent: 'scanner-agent',
			clientAddress: '203.0.113.99'
		});

		const [probe] = listRequestProbes();
		expect(probe).toMatchObject({
			pattern: 'wordpress',
			samplePath: '/wordpress/wp-admin/install.php',
			status: 404,
			count: 2
		});
		expect(probe.lastUserAgentHash).toMatch(/^[a-f0-9]{16}$/);
		expect(probe.lastIpPrefixHash).toMatch(/^[a-f0-9]{16}$/);
		expect(probe.lastUserAgentHash).not.toContain('scanner-agent');
		expect(probe.lastIpPrefixHash).not.toContain('203.0.113');
	});
});
