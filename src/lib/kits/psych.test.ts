import { describe, expect, it } from 'vitest';
import { siteSchema } from '$lib/schema/site';
import { siteQualityCheck } from '$lib/quality/siteQuality';
import {
	createCalmIntakePsychSite,
	createChildFamilyPsychSite,
	createCouplesTherapyPsychSite,
	createModernClinicPsychSite,
	createOnlineTherapyPsychSite,
	createTraumaInformedPsychSite,
	psychKitBySlug,
	psychProfessionalKits
} from './psych';

const kitSites = [
	{ slug: 'calm-intake', createSite: createCalmIntakePsychSite },
	{ slug: 'modern-clinic', createSite: createModernClinicPsychSite },
	{ slug: 'online-therapy', createSite: createOnlineTherapyPsychSite },
	{ slug: 'child-family', createSite: createChildFamilyPsychSite },
	{ slug: 'couples-therapy', createSite: createCouplesTherapyPsychSite },
	{ slug: 'trauma-informed', createSite: createTraumaInformedPsychSite }
] as const;

describe('psych professional kits', () => {
	it('registers the six controlled psych kit recipes', () => {
		expect(psychProfessionalKits.map((kit) => kit.slug)).toEqual([
			'calm-intake',
			'modern-clinic',
			'online-therapy',
			'child-family',
			'couples-therapy',
			'trauma-informed'
		]);
		expect(psychKitBySlug('calm-intake')?.label).toBe('Sakin İlk Görüşme');
		expect(psychKitBySlug('modern-clinic')?.label).toBe('Modern Klinik');
		expect(psychKitBySlug('online-therapy')?.label).toBe('Online Terapi');
		expect(psychKitBySlug('child-family')?.label).toBe('Çocuk ve Aile');
		expect(psychKitBySlug('couples-therapy')?.label).toBe('Çift Terapisi');
		expect(psychKitBySlug('trauma-informed')?.label).toBe('Travma Duyarlı');
		expect(psychKitBySlug('unknown')).toBeUndefined();
	});

	it.each(kitSites)('$slug creates a schema-valid Site using only the fixed block set', (kit) => {
		const site = kit.createSite();
		const parsed = siteSchema.safeParse(site);
		expect(parsed.success, JSON.stringify(parsed.error?.issues, null, 2)).toBe(true);
		expect(site.theme.preset).toBe('psych');
		expect(site.pages).toHaveLength(1);
		expect(site.pages[0].sections.map((section) => section.type)).toEqual(
			expect.arrayContaining(['hero', 'services', 'faq', 'contact', 'footer'])
		);
		expect(site.pages[0].sections.every((section) => section.id.includes(kit.slug))).toBe(true);
	});

	it.each(kitSites)(
		'$slug passes the Phase 3 quality gate without blockers or non-integration warnings',
		(kit) => {
			const report = siteQualityCheck(kit.createSite());
			expect(report.canPublish).toBe(true);
			expect(report.blockers).toEqual([]);
			// Integration warnings are expected — kits ship with integrations disabled by design
			const nonIntegrationWarnings = report.warnings.filter(
				(w) => !w.code.startsWith('integration_')
			);
			expect(nonIntegrationWarnings).toEqual([]);
		}
	);

	it.each(kitSites)('$slug contains no seed media references', (kit) => {
		const siteText = JSON.stringify(kit.createSite());
		expect(siteText).not.toContain('/seed/');
	});
});
