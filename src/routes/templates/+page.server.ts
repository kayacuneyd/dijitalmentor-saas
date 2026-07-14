import { controlledKits } from '$lib/kits';
import { siteQualityCheck } from '$lib/quality/siteQuality';
import type { SectionType } from '$lib/schema/site';
import { getPublicCopyOverrides } from '$lib/server/publicCopy';
import type { PageServerLoad } from './$types';

const sectionLabels: Record<SectionType, string> = {
	hero: 'Hero',
	about: 'Yaklaşım',
	services: 'Hizmetler',
	gallery: 'Galeri',
	contact: 'İletişim',
	cta: 'CTA',
	faq: 'SSS',
	testimonials: 'Referanslar',
	pricing: 'Fiyatlar',
	process: 'Süreç',
	booking: 'Randevu',
	credentials: 'Sertifikalar',
	team: 'Ekip',
	footer: 'Footer',
	stats: 'İstatistikler',
	clients: 'Referans Logolar',
	video: 'Video'
};
const templateImages = new Set([
	'calm-intake',
	'modern-clinic',
	'online-therapy',
	'child-family',
	'couples-therapy',
	'trauma-informed'
]);

export const load: PageServerLoad = () => {
	const kits = controlledKits.map((kit) => {
		const site = kit.createSite();
		const sections = site.pages[0].sections.map((section) => section.type);
		const quality = siteQualityCheck(site);
		const hero = site.pages[0].sections.find((section) => section.type === 'hero');
		const headline = hero?.type === 'hero' ? hero.content.tr.headline : site.settings.siteName;

		return {
			slug: kit.slug,
			label: kit.label,
			profession: kit.profession,
			category: kit.category,
			hasImage: templateImages.has(kit.slug),
			audience: kit.audience,
			outcome: kit.outcome,
			featureKits: kit.featureKits,
			promptRecipes: kit.promptRecipes,
			siteName: site.settings.siteName,
			headline,
			sections: sections.map((type) => ({ type, label: sectionLabels[type] })),
			sectionCount: sections.length,
			locales: site.locales,
			quality: {
				canPublish: quality.canPublish,
				blockerCount: quality.blockers.length,
				warningCount: quality.warnings.length
			}
		};
	});

	return { kits, copyOverrides: getPublicCopyOverrides('templates') };
};
