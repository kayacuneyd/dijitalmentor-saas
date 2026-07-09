import { describe, expect, it } from 'vitest';
import { resolveHostReroute } from './hostRouting';

const url = (u: string) => new URL(u);

describe('resolveHostReroute', () => {
	it('leaves the app host and localhost alone', () => {
		expect(resolveHostReroute(url('http://localhost:5183/dashboard'), undefined)).toBeUndefined();
		expect(resolveHostReroute(url('http://127.0.0.1/'), undefined)).toBeUndefined();
		expect(
			resolveHostReroute(url('https://saaskaya.com/new'), 'saaskaya.com')
		).toBeUndefined();
	});

	it('maps subdomains of the app host to /_site/<id>', () => {
		expect(resolveHostReroute(url('http://seed-law.localhost:5183/'), undefined)).toBe(
			'/_site/seed-law'
		);
		expect(resolveHostReroute(url('http://seed-law.localhost:5183/en/services'), undefined)).toBe(
			'/_site/seed-law/en/services'
		);
		expect(
			resolveHostReroute(
				url('https://site-ab12.saaskaya.com/de'),
				'saaskaya.com'
			)
		).toBe('/_site/site-ab12/de');
	});

	it('treats unknown hosts as custom domains ONLY when the app host is configured', () => {
		expect(
			resolveHostReroute(url('https://www.kanzlei-demir.example/en'), 'saaskaya.com')
		).toBe('/_site/www.kanzlei-demir.example/en');
		// unconfigured → never swallow requests (prod safety)
		expect(
			resolveHostReroute(url('https://www.kanzlei-demir.example/en'), undefined)
		).toBeUndefined();
	});

	it('never double-rewrites internal paths', () => {
		expect(
			resolveHostReroute(url('http://seed-law.localhost/_site/seed-law/en'), undefined)
		).toBeUndefined();
	});

	it('ignores nested subdomains', () => {
		expect(resolveHostReroute(url('http://a.b.localhost/'), undefined)).toBeUndefined();
	});
});
