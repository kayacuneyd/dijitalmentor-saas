export {
	psychProfessionalKits,
	psychKitBySlug,
	createCalmIntakePsychSite,
	createChildFamilyPsychSite,
	createCouplesTherapyPsychSite,
	createModernClinicPsychSite,
	createOnlineTherapyPsychSite,
	createTraumaInformedPsychSite,
	type PsychKit,
	type PsychKitSlug
} from './psych';
export { professionKits, type ControlledKit, type PromptRecipe } from './professions';
export {
	riskProfileForKit,
	strategyForKit,
	type KitConversionEvent,
	type KitRiskProfile,
	type KitStrategy
} from './strategy';

import { psychProfessionalKits } from './psych';
import { professionKits, type ControlledKit } from './professions';
import { riskProfileForKit, strategyForKit } from './strategy';

const psychAsControlledKits: ControlledKit[] = psychProfessionalKits.map((kit) => ({
	...kit,
	profession: 'Psikolog / Terapist',
	category: 'psychology' as const,
	featureKits: ['booking-external', 'whatsapp-order'],
	createSite: () => {
		const site = kit.createSite();
		const hero = site.pages[0]?.sections.find((section) => section.type === 'hero');
		site.settings = {
			...site.settings,
			profession: 'Psikolog / Terapist',
			riskProfile: riskProfileForKit('psychology'),
			primaryOutcome: kit.outcome,
			primaryCta:
				hero?.type === 'hero'
					? {
							tr: hero.content.tr.ctaLabel ?? 'İletişime geç',
							en: hero.content.en.ctaLabel ?? 'Get in touch',
							de: hero.content.de.ctaLabel ?? 'Kontakt aufnehmen'
						}
					: undefined
		};
		return site;
	},
	strategy: strategyForKit({
		outcome: kit.outcome,
		category: 'psychology',
		profession: 'Psikolog / Terapist',
		featureKits: ['booking-external', 'whatsapp-order'],
		createSite: kit.createSite
	}),
	promptRecipes: [
		{
			title: `${kit.label} taslağını kişiselleştir`,
			useCase: 'İlk psikoloji sitesi taslağı',
			prompt: `${kit.label} kitini temel alarak psikolog sitemde hedef danışan grubumu, çalışma alanlarımı, gizlilik/etik çerçeveyi ve randevu akışını daha net anlat. Tedavi garantisi veya abartılı sonuç vaadi kullanma.`
		}
	]
}));

export const controlledKits: ControlledKit[] = [...psychAsControlledKits, ...professionKits];

export function kitBySlug(slug: unknown): ControlledKit | undefined {
	return controlledKits.find((kit) => kit.slug === slug);
}
