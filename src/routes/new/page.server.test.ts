import { afterEach, describe, expect, it } from 'vitest';
import { clearSetting, setSetting } from '$lib/server/config';
import { load } from './+page.server';

const cookies = { get: () => undefined };

afterEach(() => {
	clearSetting('BETA_MODE');
});

describe('GET /new (load)', () => {
	it('returns the normal auth target when beta mode is off', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new')
		} as never) as { authHref: string };

		expect(result.authHref).toBe('/login');
	});

	it('returns the beta auth target for anonymous visitors when beta mode is on', () => {
		setSetting('BETA_MODE', '1');
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new')
		} as never) as { authHref: string };

		expect(result.authHref).toBe('/beta');
	});

	it('returns selected kit metadata for a valid kit query parameter', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new?kit=couples-therapy')
		} as never) as { selectedKit: { slug: string; label: string; outcome: string } | null };
		expect(result.selectedKit?.slug).toBe('couples-therapy');
		expect(result.selectedKit?.label).toBe('Çift Terapisi');
		expect(result.selectedKit?.outcome).toContain('Tarafsızlık');
	});

	it('returns selected kit metadata for a new profession kit query parameter', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new?kit=dietitian-modern')
		} as never) as { selectedKit: { slug: string; profession: string; outcome: string } | null };
		expect(result.selectedKit?.slug).toBe('dietitian-modern');
		expect(result.selectedKit?.profession).toBe('Diyetisyen');
		expect(result.selectedKit?.outcome).toContain('sağlık sitesi');
	});

	it('ignores an unknown kit query parameter', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new?kit=unknown')
		} as never) as { selectedKit: unknown };
		expect(result.selectedKit).toBeNull();
	});

	it('preselects supported profession campaigns and records a compact campaign source', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new?profession=psych&utm_source=linkedin&utm_campaign=gtm-30')
		} as never) as { preselectedNiche: string | null; campaignSource: string | null };

		expect(result.preselectedNiche).toBe('psych');
		expect(result.campaignSource).toBe('linkedin:gtm-30:psych');
	});

	it('ignores unsupported profession campaign values', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new?profession=random-job&utm_source=email')
		} as never) as { preselectedNiche: string | null; campaignSource: string | null };

		expect(result.preselectedNiche).toBeNull();
		expect(result.campaignSource).toBe('email:random-job');
	});
});
