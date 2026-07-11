import { describe, expect, it } from 'vitest';
import { siteSchema } from '$lib/schema/site';
import { siteQualityCheck } from '$lib/quality/siteQuality';
import { controlledKits, kitBySlug, professionKits } from './index';

describe('controlled profession kits', () => {
	it('adds new profession kits without expanding the raw theme/schema contract', () => {
		expect(professionKits.map((kit) => kit.slug)).toEqual([
			'dietitian-modern',
			'real-estate-agent',
			'beauty-salon'
		]);
		expect(controlledKits.length).toBeGreaterThanOrEqual(9);
		expect(kitBySlug('dietitian-modern')?.profession).toBe('Diyetisyen');
		expect(kitBySlug('unknown-kit')).toBeUndefined();
	});

	it.each(professionKits)('$slug creates a schema-valid fixed-block Site', (kit) => {
		const site = kit.createSite();
		const parsed = siteSchema.safeParse(site);
		expect(parsed.success, JSON.stringify(parsed.error?.issues, null, 2)).toBe(true);
		expect(['law', 'psych', 'dental']).toContain(site.theme.preset);
		expect(site.id).toBe(`kit-${kit.slug}`);
		expect(site.pages[0].sections.map((section) => section.type)).toEqual(
			expect.arrayContaining(['hero', 'contact', 'footer'])
		);
		expect(site.pages[0].sections.length).toBeGreaterThanOrEqual(5);
	});

	it.each(professionKits)('$slug passes quality gates and carries prompt recipes', (kit) => {
		const report = siteQualityCheck(kit.createSite());
		expect(report.canPublish).toBe(true);
		expect(report.blockers).toEqual([]);
		expect(kit.promptRecipes.length).toBeGreaterThan(0);
		expect(kit.featureKits.length).toBeGreaterThan(0);
	});
});
