const ECB_DAILY_RATES_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type EurTryRate = {
	rate: number;
	asOf: string;
	source: 'ecb';
};

type CachedRate = EurTryRate & { fetchedAt: number };

let cachedRate: CachedRate | null = null;

function parseEurTry(xml: string): number | null {
	const match = xml.match(/<Cube\s+currency=['"]TRY['"]\s+rate=['"]([0-9.]+)['"]\s*\/?\s*>/i);
	if (!match) return null;
	const rate = Number(match[1]);
	return Number.isFinite(rate) && rate > 0 ? rate : null;
}

function parseAsOf(xml: string): string | null {
	const match = xml.match(/<Cube\s+time=['"](\d{4}-\d{2}-\d{2})['"]\s*>/i);
	return match?.[1] ?? null;
}

export async function getEurTryRate(fetcher: typeof fetch = fetch): Promise<EurTryRate | null> {
	if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL_MS) {
		return { rate: cachedRate.rate, asOf: cachedRate.asOf, source: cachedRate.source };
	}

	try {
		const response = await fetcher(ECB_DAILY_RATES_URL, {
			headers: { accept: 'application/xml' },
			signal: AbortSignal.timeout(3500)
		});
		if (!response.ok) throw new Error(`ECB returned ${response.status}`);
		const xml = await response.text();
		const rate = parseEurTry(xml);
		const asOf = parseAsOf(xml);
		if (!rate || !asOf) throw new Error('ECB EUR/TRY rate was not present');
		cachedRate = { rate, asOf, source: 'ecb', fetchedAt: Date.now() };
		return { rate, asOf, source: 'ecb' };
	} catch {
		if (cachedRate) {
			return { rate: cachedRate.rate, asOf: cachedRate.asOf, source: cachedRate.source };
		}
		return null;
	}
}

export function shouldShowTry(locale: string | undefined, headers: Headers): boolean {
	const country = headers.get('cf-ipcountry') ?? headers.get('x-country-code');
	if (country?.toUpperCase() === 'TR') return true;
	if (locale === 'tr') return true;
	return (
		headers
			.get('accept-language')
			?.split(',')
			.some((part) => part.trim().toLowerCase().startsWith('tr')) ?? false
	);
}

export function tryAmounts(rate: EurTryRate | null) {
	if (!rate) return null;
	const convert = (eur: number) => Math.round(eur * rate.rate);
	return {
		currency: 'TRY' as const,
		rate: rate.rate,
		asOf: rate.asOf,
		monthly: convert(17),
		yearly: convert(200),
		domain: convert(15),
		monthlyDomainTotal: convert(219)
	};
}

export function resetExchangeRateCacheForTests() {
	cachedRate = null;
}
