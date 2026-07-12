import { describe, expect, it } from 'vitest';
import { seedSites } from '$lib/seed';
import { siteQualityCheck } from './siteQuality';

const clone = <T>(value: T): T => structuredClone(value);

const loc = <T>(value: T): { tr: T; en: T; de: T } => ({
	tr: clone(value),
	en: clone(value),
	de: clone(value)
});

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

	it('counts a booking section as a CTA path', () => {
		const site = clone(seedSites.dental);
		for (const page of site.pages) {
			page.sections = page.sections.filter((section) => section.type !== 'cta');
		}
		const hero = site.pages[0].sections.find((section) => section.type === 'hero');
		if (!hero || hero.type !== 'hero') throw new Error('dental seed hero missing');
		hero.props.ctaHref = undefined;

		const withoutBooking = siteQualityCheck(site);
		expect(withoutBooking.warnings.map((issue) => issue.code)).toContain('cta_path_missing');

		site.pages[0].sections.splice(site.pages[0].sections.length - 1, 0, {
			id: 'booking-test',
			type: 'booking',
			props: { variant: 'inline', href: '#contact' },
			content: loc({ title: 'Randevu planla', buttonLabel: 'Görüşme iste' })
		});
		const withBooking = siteQualityCheck(site);
		expect(withBooking.canPublish).toBe(true);
		expect(withBooking.warnings.map((issue) => issue.code)).not.toContain('cta_path_missing');
	});

	it('warns on thin or misconfigured new-block content', () => {
		const site = clone(seedSites.dental);
		site.pages[0].sections.splice(
			site.pages[0].sections.length - 1,
			0,
			{
				id: 'testimonials-test',
				type: 'testimonials',
				props: { variant: 'grid' },
				content: loc({
					title: 'Danışan yorumları',
					items: [{ quote: 'Çok memnun kaldım.', name: 'A.K.' }]
				})
			},
			{
				id: 'pricing-test',
				type: 'pricing',
				props: { variant: 'cards', currency: '₺' },
				content: loc({
					title: 'Paketler',
					items: [{ name: 'Başlangıç', price: '1500', highlighted: false }]
				})
			},
			{
				id: 'booking-test',
				type: 'booking',
				props: { variant: 'inline', href: '#' },
				content: loc({ title: 'Randevu planla', buttonLabel: 'Görüşme iste' })
			},
			{
				id: 'credentials-test',
				type: 'credentials',
				props: { variant: 'grid' },
				content: loc({ title: 'Belgeler', items: [{ name: 'Uygulayıcı Sertifikası' }] })
			}
		);

		const report = siteQualityCheck(site);
		expect(report.canPublish).toBe(true);
		expect(report.warnings.map((issue) => issue.code)).toEqual(
			expect.arrayContaining([
				'testimonials_too_few',
				'pricing_too_few_plans',
				'pricing_no_highlight',
				'booking_href_placeholder',
				'credentials_issuer_missing'
			])
		);
	});

	it('routes testimonial avatars and credential icons through the media checks', () => {
		const site = clone(seedSites.dental);
		for (const page of site.pages) {
			page.sections = page.sections.filter((section) => section.type !== 'gallery');
			for (const section of page.sections) {
				if ('imageUrl' in section.props) section.props.imageUrl = undefined;
			}
		}
		const clean = siteQualityCheck(site);
		expect(clean.warnings.map((issue) => issue.code)).not.toContain('seed_media_in_use');

		site.pages[0].sections.splice(
			site.pages[0].sections.length - 1,
			0,
			{
				id: 'testimonials-media',
				type: 'testimonials',
				props: { variant: 'grid' },
				content: loc({
					title: 'Danışan yorumları',
					items: [
						{ quote: 'Çok memnun kaldım.', name: 'A.K.', avatarUrl: '/seed/dental/avatar.svg' },
						{ quote: 'Süreç net ilerledi.', name: 'M.T.', avatarUrl: '/uploads/untracked.jpg' }
					]
				})
			},
			{
				id: 'credentials-media',
				type: 'credentials',
				props: { variant: 'grid' },
				content: loc({
					title: 'Belgeler',
					items: [{ name: 'Sertifika', issuer: 'Meslek Odası', iconUrl: '/uploads/icon.png' }]
				})
			}
		);
		const report = siteQualityCheck(site);
		const codes = report.warnings.map((issue) => issue.code);
		expect(codes).toContain('seed_media_in_use');
		expect(codes).toContain('unknown_local_media_ref');
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
