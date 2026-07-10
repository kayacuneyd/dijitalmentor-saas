import { describe, expect, it } from 'vitest';
import { seedSites } from '$lib/seed';
import { siteQualityCheck } from './siteQuality';

const clone = <T>(value: T): T => structuredClone(value);

function scrubPsychBookingTerms(value: unknown): unknown {
	if (typeof value === 'string') {
		return value
			.replace(/gizli/gi, 'özenli')
			.replace(/gizlilik/gi, 'özen')
			.replace(/etik/gi, 'mesleki')
			.replace(/randevu/gi, 'görüşme')
			.replace(/seans/gi, 'buluşma')
			.replace(/appointment/gi, 'meeting')
			.replace(/session/gi, 'meeting')
			.replace(/termin/gi, 'kontakt')
			.replace(/sitzung/gi, 'gespräch');
	}
	if (Array.isArray(value)) return value.map(scrubPsychBookingTerms);
	if (value && typeof value === 'object') {
		for (const [key, nested] of Object.entries(value)) {
			(value as Record<string, unknown>)[key] = scrubPsychBookingTerms(nested);
		}
	}
	return value;
}

describe('siteQualityCheck', () => {
	it.each(Object.entries(seedSites))(
		'accepts the schema-valid %s seed as publishable',
		(_niche, site) => {
			const report = siteQualityCheck(site);
			expect(report.validSchema).toBe(true);
			expect(report.canPublish).toBe(true);
			expect(report.blockers).toEqual([]);
		}
	);

	it('turns schema failures into publish blockers', () => {
		const report = siteQualityCheck('<html>not a site</html>');
		expect(report.validSchema).toBe(false);
		expect(report.canPublish).toBe(false);
		expect(report.blockers[0]?.code).toBe('schema_invalid');
	});

	it('blocks duplicate section ids that the base schema intentionally does not enforce', () => {
		const site = clone(seedSites.psych);
		site.pages[0].sections[1].id = site.pages[0].sections[0].id;
		const report = siteQualityCheck(site);
		expect(report.canPublish).toBe(false);
		expect(report.blockers.map((issue) => issue.code)).toContain('duplicate_section_id');
	});

	it('blocks missing contact paths', () => {
		const site = clone(seedSites.law);
		site.settings.contactEmail = undefined;
		for (const page of site.pages) {
			page.sections = page.sections.filter((section) => section.type !== 'contact');
		}
		const report = siteQualityCheck(site);
		expect(report.canPublish).toBe(false);
		expect(report.blockers.map((issue) => issue.code)).toContain('contact_path_missing');
	});

	it('blocks absolute professional outcome claims', () => {
		const site = clone(seedSites.psych);
		const hero = site.pages[0].sections.find((section) => section.type === 'hero');
		if (!hero || hero.type !== 'hero') throw new Error('psych seed hero missing');
		hero.content.tr.headline = 'Kesin sonuç garantisiyle terapi';
		const report = siteQualityCheck(site);
		expect(report.canPublish).toBe(false);
		expect(report.blockers.map((issue) => issue.code)).toContain('unsafe_professional_claim');
	});

	it('warns on placeholder copy, missing SEO, seed media, CTA, and unknown local media', () => {
		const site = clone(seedSites.dental);
		site.settings.seo = undefined;
		for (const page of site.pages) {
			page.sections = page.sections.filter((section) => section.type !== 'cta');
		}
		const hero = site.pages[0].sections.find((section) => section.type === 'hero');
		if (!hero || hero.type !== 'hero') throw new Error('dental seed hero missing');
		hero.props.ctaHref = undefined;
		hero.props.imageUrl = '/uploads/untracked.jpg';
		hero.content.tr.subheadline = 'TODO placeholder';

		const report = siteQualityCheck(site);
		expect(report.canPublish).toBe(true);
		expect(report.warnings.map((issue) => issue.code)).toEqual(
			expect.arrayContaining([
				'seo_missing_description',
				'placeholder_text',
				'cta_path_missing',
				'unknown_local_media_ref'
			])
		);
	});

	it('warns on low primary/base contrast', () => {
		const site = clone(seedSites.law);
		site.theme.colors.primary = '#ffffff';
		site.theme.colors.base = '#ffffff';
		const report = siteQualityCheck(site);
		expect(report.canPublish).toBe(true);
		expect(report.warnings.map((issue) => issue.code)).toContain('contrast_low_primary');
	});

	it('adds psych-specific warnings for missing FAQ, confidentiality, booking, and thin services', () => {
		const site = clone(seedSites.psych);
		for (const page of site.pages) {
			page.sections = page.sections.filter((section) => section.type !== 'faq');
		}
		const services = site.pages[0].sections.find((section) => section.type === 'services');
		if (!services || services.type !== 'services') throw new Error('psych seed services missing');
		for (const locale of site.locales) {
			services.content[locale].items = services.content[locale].items.slice(0, 1);
		}
		for (const page of site.pages) {
			for (const section of page.sections) {
				for (const locale of site.locales) {
					scrubPsychBookingTerms(section.content[locale]);
				}
			}
		}

		const report = siteQualityCheck(site);
		expect(report.canPublish).toBe(true);
		expect(report.warnings.map((issue) => issue.code)).toEqual(
			expect.arrayContaining([
				'psych_faq_missing',
				'psych_services_too_few',
				'psych_confidentiality_missing',
				'psych_booking_copy_missing'
			])
		);
	});

	it('blocks prescription/diagnosis authority claims on psych sites', () => {
		const site = clone(seedSites.psych);
		const about = site.pages[0].sections.find((section) => section.type === 'about');
		if (!about || about.type !== 'about') throw new Error('psych seed about missing');
		about.content.tr.body = 'Gerekirse antidepresan yazar ve tanı koyar.';
		const report = siteQualityCheck(site);
		expect(report.canPublish).toBe(false);
		expect(report.blockers.map((issue) => issue.code)).toContain('psych_scope_claim');
	});
});
