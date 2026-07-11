import { describe, expect, it } from 'vitest';
import { resolveAppReroute } from './reroute';

const url = (value: string) => new URL(value);

describe('resolveAppReroute', () => {
	it('routes tenant subdomains before considering app locale prefixes', () => {
		expect(resolveAppReroute(url('https://seed-law.saaskaya.com/'), 'saaskaya.com')).toBe(
			'/_site/seed-law'
		);
		expect(resolveAppReroute(url('https://seed-law.saaskaya.com/en'), 'saaskaya.com')).toBe(
			'/_site/seed-law/en'
		);
		expect(resolveAppReroute(url('https://site-ab12.saaskaya.com/de/about'), 'saaskaya.com')).toBe(
			'/_site/site-ab12/de/about'
		);
	});

	it('still strips locale prefixes on the app host public routes', () => {
		expect(resolveAppReroute(url('https://saaskaya.com/tr/new'), 'saaskaya.com')).toBe('/new');
		expect(resolveAppReroute(url('https://saaskaya.com/de/pricing'), 'saaskaya.com')).toBe(
			'/pricing'
		);
		expect(resolveAppReroute(url('https://saaskaya.com/en/legal/privacy'), 'saaskaya.com')).toBe(
			'/legal/privacy'
		);
	});

	it('leaves non-localized app routes alone', () => {
		expect(
			resolveAppReroute(url('https://saaskaya.com/dashboard'), 'saaskaya.com')
		).toBeUndefined();
		expect(
			resolveAppReroute(url('https://saaskaya.com/_site/seed-law'), 'saaskaya.com')
		).toBeUndefined();
	});
});
