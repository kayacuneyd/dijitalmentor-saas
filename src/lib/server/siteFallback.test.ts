import { describe, expect, it } from 'vitest';
import { siteSchema } from '$lib/schema/site';
import { createFallbackSite } from './siteFallback';

describe('createFallbackSite', () => {
	it('creates a Zod-valid controlled draft from onboarding answers', () => {
		const site = createFallbackSite({
			id: 'site-fallback',
			tenantId: 'tenant-fallback',
			answers: {
				niche: 'law',
				businessName: 'Kaya Hukuk',
				languages: ['de', 'tr'],
				contactEmail: 'info@example.com',
				contactPhone: '+49 30 123456'
			}
		});

		expect(siteSchema.safeParse(site).success).toBe(true);
		expect(site.id).toBe('site-fallback');
		expect(site.tenantId).toBe('tenant-fallback');
		expect(site.defaultLocale).toBe('de');
		expect(site.locales).toEqual(['de', 'tr']);
		expect(site.settings.siteName).toBe('Kaya Hukuk');
		expect(site.settings.contactEmail).toBe('info@example.com');
		const hero = site.pages[0].sections.find((section) => section.type === 'hero');
		expect(hero?.props.background).toBe('gradient');
	});
});
