import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	getEurTryRate,
	resetExchangeRateCacheForTests,
	shouldShowTry,
	tryAmounts
} from './exchangeRates';

const ecbXml = `<?xml version="1.0"?>
<Envelope><Cube><Cube time="2026-07-17"><Cube currency="USD" rate="1.16"/><Cube currency="TRY" rate="53.9577"/></Cube></Cube></Envelope>`;

afterEach(() => {
	resetExchangeRateCacheForTests();
	vi.restoreAllMocks();
});

describe('exchange rates', () => {
	it('reads the daily EUR/TRY rate from ECB XML', async () => {
		const fetcher = vi.fn().mockResolvedValue(new Response(ecbXml, { status: 200 }));

		expect(await getEurTryRate(fetcher)).toEqual({
			rate: 53.9577,
			asOf: '2026-07-17',
			source: 'ecb'
		});
		expect(fetcher).toHaveBeenCalledOnce();
	});

	it('uses the cached rate while it is fresh', async () => {
		const fetcher = vi.fn().mockResolvedValue(new Response(ecbXml, { status: 200 }));

		await getEurTryRate(fetcher);
		await getEurTryRate(fetcher);

		expect(fetcher).toHaveBeenCalledOnce();
	});

	it('fails safely when the provider is unavailable without a cache', async () => {
		const fetcher = vi.fn().mockRejectedValue(new Error('network error'));

		expect(await getEurTryRate(fetcher)).toBeNull();
	});

	it('shows TRY for Turkish locale or country headers', () => {
		expect(shouldShowTry('tr', new Headers())).toBe(true);
		expect(shouldShowTry('en', new Headers({ 'cf-ipcountry': 'TR' }))).toBe(true);
		expect(shouldShowTry('en', new Headers({ 'accept-language': 'en-US,en;q=0.9' }))).toBe(false);
	});

	it('converts EUR price points without changing the EUR source price', () => {
		const estimate = tryAmounts({ rate: 50, asOf: '2026-07-17', source: 'ecb' });

		expect(estimate).toMatchObject({
			monthly: 850,
			yearly: 10000,
			domain: 750,
			monthlyDomainTotal: 10950
		});
	});
});
