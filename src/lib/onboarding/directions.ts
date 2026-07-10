import { z } from 'zod';
import { psychKitBySlug, psychProfessionalKits, type PsychKitSlug } from '$lib/kits';

/**
 * Phase 2 closure: curated visual directions for the launch niche.
 *
 * These are not free-form layout instructions and do not add tenant HTML/CSS.
 * They are deterministic steering hints that the existing schema-constrained
 * generator can use while still producing a Zod-validated Site.
 */

const kitSummaries = psychProfessionalKits.map((kit) => ({
	slug: kit.slug,
	label: kit.label,
	outcome: kit.outcome
})) satisfies { slug: PsychKitSlug; label: string; outcome: string }[];

const kitSummaryBySlug = (slug: PsychKitSlug) => {
	const kit = psychKitBySlug(slug);
	if (!kit) return null;
	return kitSummaries.find((summary) => summary.slug === kit.slug) ?? null;
};

export const VISUAL_DIRECTIONS = [
	{
		id: 'warm_trust',
		label: 'Sıcak ve güven veren',
		promise: 'Danışanın kendini rahat hissedeceği, yumuşak ve insan odaklı bir ilk izlenim.',
		toneHint: 'sıcak, sakin, empatik',
		sectionEmphasis: 'güven veren hero, kısa uzmanlık anlatımı, kolay randevu çağrısı',
		preview: 'Yumuşak renkler, sade metinler, güven ve erişilebilirlik vurgusu.',
		kit: kitSummaryBySlug('calm-intake')
	},
	{
		id: 'modern_clinic',
		label: 'Modern klinik',
		promise: 'Daha kurumsal, net hizmet listesi ve profesyonel uzmanlık algısı.',
		toneHint: 'modern, düzenli, profesyonel',
		sectionEmphasis: 'hizmetler, uzmanlık alanları, lokasyon ve iletişim netliği',
		preview: 'Temiz kartlar, belirgin CTA, modern bir muayenehane/klinik hissi.',
		kit: kitSummaryBySlug('modern-clinic')
	},
	{
		id: 'calm_minimal',
		label: 'Sade ve sakin',
		promise: 'Az metin, ferah alan ve dikkat dağıtmayan sakin bir danışan deneyimi.',
		toneHint: 'minimal, dingin, ölçülü',
		sectionEmphasis: 'kısa hero, temel hizmetler, FAQ ve düşük yoğunluklu iletişim akışı',
		preview: 'Ferah boşluklar, kısa cümleler, sakin ve güvenli bir ritim.',
		kit: kitSummaryBySlug('online-therapy')
	}
] as const;

export type VisualDirectionId = (typeof VISUAL_DIRECTIONS)[number]['id'];

export const visualDirectionSchema = z.enum(
	VISUAL_DIRECTIONS.map((direction) => direction.id) as [VisualDirectionId, ...VisualDirectionId[]]
);

export const VISUAL_DIRECTION_OPTIONS = VISUAL_DIRECTIONS.map((direction) => ({
	value: direction.id,
	label: direction.label
}));

export function visualDirectionById(id: unknown): (typeof VISUAL_DIRECTIONS)[number] | undefined {
	return VISUAL_DIRECTIONS.find((direction) => direction.id === id);
}
