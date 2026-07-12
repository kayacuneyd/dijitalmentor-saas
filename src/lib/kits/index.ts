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

import { psychProfessionalKits } from './psych';
import { professionKits, type ControlledKit } from './professions';

const psychAsControlledKits: ControlledKit[] = psychProfessionalKits.map((kit) => ({
	...kit,
	profession: 'Psikolog / Terapist',
	category: 'psychology' as const,
	featureKits: ['booking-external', 'whatsapp-order'],
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
