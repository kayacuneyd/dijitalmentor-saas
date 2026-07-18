import type { Locale, Site } from '$lib/schema/site';
import type { IntegrationType } from '$lib/kits/integrations';

export type KitRiskProfile = 'general' | 'health' | 'legal' | 'property';
export type KitConversionEvent = 'contact_submitted' | 'cta_clicked';

export type KitStrategy = {
	primaryOutcome: string;
	primaryCta: Record<Locale, string>;
	trustEvidence: Array<'credentials' | 'process' | 'testimonials' | 'clients' | 'projects'>;
	riskProfile: KitRiskProfile;
	conversionEvent: KitConversionEvent;
};

export function riskProfileForKit(category: string, siteName = ''): KitRiskProfile {
	if (category === 'psychology' || category === 'health') return 'health';
	if (category === 'property') return 'property';
	if (category === 'local-service' && /law|hukuk|avukat|attorney|anwalt/i.test(siteName))
		return 'legal';
	return 'general';
}

export function strategyForKit(input: {
	outcome: string;
	category: string;
	featureKits: IntegrationType[];
	profession?: string;
	createSite: () => Site;
}): KitStrategy {
	const site = input.createSite();
	const hero = site.pages[0]?.sections.find((section) => section.type === 'hero');
	const primaryCta =
		hero?.type === 'hero'
			? {
					tr: hero.content.tr.ctaLabel ?? 'İletişime geç',
					en: hero.content.en.ctaLabel ?? 'Get in touch',
					de: hero.content.de.ctaLabel ?? 'Kontakt aufnehmen'
				}
			: { tr: 'İletişime geç', en: 'Get in touch', de: 'Kontakt aufnehmen' };
	const sectionTypes = new Set(
		site.pages.flatMap((page) => page.sections.map((section) => section.type))
	);
	const trustEvidence: KitStrategy['trustEvidence'] = [];
	if (sectionTypes.has('credentials')) trustEvidence.push('credentials');
	if (sectionTypes.has('process')) trustEvidence.push('process');
	if (sectionTypes.has('testimonials')) trustEvidence.push('testimonials');
	if (sectionTypes.has('clients')) trustEvidence.push('clients');
	if (sectionTypes.has('collection')) trustEvidence.push('projects');
	const riskProfile = riskProfileForKit(
		input.category,
		`${input.profession ?? ''} ${site.settings.siteName}`
	);
	return {
		primaryOutcome: input.outcome,
		primaryCta,
		trustEvidence,
		riskProfile,
		conversionEvent: input.featureKits.includes('booking-external')
			? 'cta_clicked'
			: 'contact_submitted'
	};
}
