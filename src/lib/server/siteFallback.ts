import { z } from 'zod';
import { visualDirectionById } from '$lib/onboarding/directions';
import type { OnboardingAnswers } from '$lib/onboarding/questions';
import { kitBySlug } from '$lib/kits';
import type { Locale, Site } from '$lib/schema/site';

const localeSchema = z
	.array(z.enum(['tr', 'en', 'de']))
	.min(1)
	.max(3);
const emailSchema = z.email();

const FALLBACK_KIT_BY_NICHE: Record<string, string> = {
	psych: 'calm-intake',
	law: 'lawyer-trust',
	dental: 'dentist-clinic',
	dietitian: 'dietitian-modern',
	real_estate: 'real-estate-agent',
	beauty: 'beauty-salon',
	unsupported: 'beauty-salon'
};

const fallbackText: Record<
	Locale,
	{ hero: string; sub: string; cta: string; seo: string; contact: string; footer: string }
> = {
	tr: {
		hero: 'Güven veren profesyonel destek',
		sub: 'Hizmetlerinizi, iletişim yolunuzu ve çalışma yaklaşımınızı net anlatan sade bir ilk taslak.',
		cta: 'İletişime geç',
		seo: 'Profesyonel hizmetler, çalışma alanları ve iletişim bilgileri.',
		contact: 'İletişim bilgilerinizi kontrol ederek ilk yayına hazır hale getirin.',
		footer: 'Bu site saaskaya ile hazırlanmıştır.'
	},
	en: {
		hero: 'A clear professional presence',
		sub: 'A simple first draft that explains your services, contact path, and working style.',
		cta: 'Get in touch',
		seo: 'Professional services, areas of work, and contact information.',
		contact: 'Review your contact details before the first publish.',
		footer: 'This site was prepared with saaskaya.'
	},
	de: {
		hero: 'Ein klarer professioneller Auftritt',
		sub: 'Ein einfacher erster Entwurf mit Leistungen, Kontaktweg und Arbeitsweise.',
		cta: 'Kontakt aufnehmen',
		seo: 'Professionelle Leistungen, Arbeitsbereiche und Kontaktinformationen.',
		contact: 'Prüfe deine Kontaktdaten vor der ersten Veröffentlichung.',
		footer: 'Diese Website wurde mit saaskaya vorbereitet.'
	}
};

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function pickKitSlug(answers?: OnboardingAnswers): string {
	const visualKit = visualDirectionById(answers?.visualDirection)?.kit?.slug;
	if (visualKit) return visualKit;
	const niche = asString(answers?.niche);
	return FALLBACK_KIT_BY_NICHE[niche] ?? FALLBACK_KIT_BY_NICHE.unsupported;
}

function pickLocales(answers?: OnboardingAnswers): Locale[] {
	const parsed = localeSchema.safeParse(answers?.languages);
	return parsed.success ? parsed.data : ['tr', 'en', 'de'];
}

function localized(
	base: Partial<Record<Locale, string>>,
	fallbackKey: keyof (typeof fallbackText)['tr']
) {
	return {
		tr: base.tr?.trim() || fallbackText.tr[fallbackKey],
		en: base.en?.trim() || fallbackText.en[fallbackKey],
		de: base.de?.trim() || fallbackText.de[fallbackKey]
	};
}

function updateContact(site: Site, answers?: OnboardingAnswers) {
	const email = asString(answers?.contactEmail);
	const phone = asString(answers?.contactPhone);
	if (emailSchema.safeParse(email).success) site.settings.contactEmail = email;

	for (const page of site.pages) {
		for (const section of page.sections) {
			if (section.type !== 'contact') continue;
			if (emailSchema.safeParse(email).success) section.props.email = email;
			if (phone) section.props.phone = phone;
			section.content = {
				tr: { ...section.content.tr, description: fallbackText.tr.contact },
				en: { ...section.content.en, description: fallbackText.en.contact },
				de: { ...section.content.de, description: fallbackText.de.contact }
			};
		}
	}
}

export function createFallbackSite(input: {
	id: string;
	tenantId: string;
	answers?: OnboardingAnswers;
}): Site {
	const kit = kitBySlug(pickKitSlug(input.answers)) ?? kitBySlug(FALLBACK_KIT_BY_NICHE.unsupported);
	if (!kit) throw new Error('No fallback kit is available.');

	const site = kit.createSite();
	site.id = input.id;
	site.tenantId = input.tenantId;
	site.domain = undefined;
	site.locales = pickLocales(input.answers);
	site.defaultLocale = site.locales[0];

	const businessName = asString(input.answers?.businessName);
	if (businessName) site.settings.siteName = businessName;
	site.settings.seo = { description: localized({}, 'seo') };

	for (const page of site.pages) {
		for (const section of page.sections) {
			if (section.type === 'hero') {
				section.props.background = 'gradient';
				delete section.props.imageUrl;
				section.content = {
					tr: {
						...section.content.tr,
						headline: businessName || fallbackText.tr.hero,
						subheadline: fallbackText.tr.sub,
						ctaLabel: fallbackText.tr.cta
					},
					en: {
						...section.content.en,
						headline: businessName || fallbackText.en.hero,
						subheadline: fallbackText.en.sub,
						ctaLabel: fallbackText.en.cta
					},
					de: {
						...section.content.de,
						headline: businessName || fallbackText.de.hero,
						subheadline: fallbackText.de.sub,
						ctaLabel: fallbackText.de.cta
					}
				};
			}
			if (section.type === 'footer') {
				section.content = {
					tr: { ...section.content.tr, text: fallbackText.tr.footer },
					en: { ...section.content.en, text: fallbackText.en.footer },
					de: { ...section.content.de, text: fallbackText.de.footer }
				};
			}
		}
	}

	updateContact(site, input.answers);
	return site;
}
