import { z } from 'zod';

/**
 * Guided onboarding Q&A (Hostinger Horizons roadmap Phase 2): a fixed, deterministic
 * question script — zero AI cost to render/sequence. Free-text answers on `guarded`
 * questions pass through the onboarding topic-guard (`$lib/server/ai/onboardingGuard`)
 * before being accepted; choice questions never need it. Shared, isomorphic module:
 * the client renders from this list, the server validates against it.
 */

export type QuestionKind = 'choice' | 'multi_choice' | 'short_text' | 'list_text' | 'open_text';

export type ChoiceOption = { value: string; label: string };

export type OnboardingAnswers = Record<string, unknown>;

export type Question = {
	id: string;
	kind: QuestionKind;
	prompt: string;
	helper?: string;
	required: boolean;
	/** Free-text answers on this question pass through the Groq on-topic guard. */
	guarded: boolean;
	options?: ChoiceOption[];
	schema: z.ZodType;
	/** Only asked when true given answers collected so far (default: always shown). */
	showWhen?: (answers: OnboardingAnswers) => boolean;
};

const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const NICHE_OPTIONS: ChoiceOption[] = [
	{ value: 'psych', label: 'Psikolog / Terapist' },
	{ value: 'law', label: 'Avukat / Hukuk Bürosu' },
	{ value: 'dental', label: 'Diş Hekimi / Klinik' }
];

export const TONE_OPTIONS: ChoiceOption[] = [
	{ value: 'warm', label: 'Sıcak ve samimi' },
	{ value: 'professional', label: 'Kurumsal ve güven veren' },
	{ value: 'modern', label: 'Modern ve dinamik' },
	{ value: 'minimal', label: 'Sade ve minimal' }
];

export const LANGUAGE_OPTIONS: ChoiceOption[] = [
	{ value: 'tr', label: 'Türkçe' },
	{ value: 'en', label: 'İngilizce' },
	{ value: 'de', label: 'Almanca' }
];

export const CONTACT_METHOD_OPTIONS: ChoiceOption[] = [
	{ value: 'email', label: 'Sadece e-posta' },
	{ value: 'phone', label: 'Sadece telefon' },
	{ value: 'both', label: 'İkisi de' }
];

export const BOOKING_OPTIONS: ChoiceOption[] = [
	{ value: 'online_booking', label: 'Online randevu sistemi kullanıyorum' },
	{ value: 'phone_call', label: 'Telefonla randevu alıyorum' },
	{ value: 'contact_form', label: 'İletişim formu yeterli' },
	{ value: 'walk_in', label: 'Randevusuz kabul ediyorum' }
];

export const MEDIA_OPTIONS: ChoiceOption[] = [
	{ value: 'has_media', label: 'Kendi fotoğraflarımı kullanmak istiyorum' },
	{ value: 'use_placeholders', label: 'Şimdilik hazır görseller yeterli' }
];

export const ONBOARDING_QUESTIONS: Question[] = [
	{
		id: 'niche',
		kind: 'choice',
		prompt: 'Hangi alanda hizmet veriyorsun?',
		required: true,
		guarded: false,
		options: NICHE_OPTIONS,
		schema: z.enum(['psych', 'law', 'dental'])
	},
	{
		id: 'businessName',
		kind: 'short_text',
		prompt: 'İşletmenin / pratiğinin adı ne?',
		required: true,
		guarded: true,
		schema: shortText(120)
	},
	{
		id: 'city',
		kind: 'short_text',
		prompt: 'Hangi şehir veya ilçede hizmet veriyorsun?',
		required: true,
		guarded: true,
		schema: shortText(80)
	},
	{
		id: 'audience',
		kind: 'open_text',
		prompt: 'Kimlere hizmet veriyorsun? Hedef kitleni kısaca anlat.',
		required: true,
		guarded: true,
		schema: shortText(400)
	},
	{
		id: 'differentiator',
		kind: 'open_text',
		prompt: 'Seni farklı kılan nedir? Neden seni tercih etmeliler?',
		required: true,
		guarded: true,
		schema: shortText(400)
	},
	{
		id: 'tone',
		kind: 'choice',
		prompt: 'Sitenin tonu nasıl olsun?',
		required: true,
		guarded: false,
		options: TONE_OPTIONS,
		schema: z.enum(['warm', 'professional', 'modern', 'minimal'])
	},
	{
		id: 'languages',
		kind: 'multi_choice',
		prompt: 'Hangi dillerde yayınlansın?',
		helper: 'En az bir dil seç.',
		required: true,
		guarded: false,
		options: LANGUAGE_OPTIONS,
		schema: z.array(z.enum(['tr', 'en', 'de'])).min(1)
	},
	{
		id: 'contactMethod',
		kind: 'choice',
		prompt: 'Müşteriler seninle nasıl iletişime geçsin?',
		required: true,
		guarded: false,
		options: CONTACT_METHOD_OPTIONS,
		schema: z.enum(['email', 'phone', 'both'])
	},
	{
		id: 'contactEmail',
		kind: 'short_text',
		prompt: 'İletişim e-postan ne?',
		required: true,
		guarded: false,
		schema: z.email(),
		showWhen: (answers) => answers.contactMethod === 'email' || answers.contactMethod === 'both'
	},
	{
		id: 'contactPhone',
		kind: 'short_text',
		prompt: 'İletişim telefon numaran ne?',
		required: true,
		guarded: false,
		schema: z
			.string()
			.trim()
			.regex(/^[0-9+()\s-]{7,20}$/, 'Geçerli bir telefon numarası gir.'),
		showWhen: (answers) => answers.contactMethod === 'phone' || answers.contactMethod === 'both'
	},
	{
		id: 'booking',
		kind: 'choice',
		prompt: 'Randevu süreci nasıl işliyor?',
		required: true,
		guarded: false,
		options: BOOKING_OPTIONS,
		schema: z.enum(['online_booking', 'phone_call', 'contact_form', 'walk_in'])
	},
	{
		id: 'services',
		kind: 'list_text',
		prompt: 'Sunduğun başlıca hizmetler neler?',
		helper: 'Birer birer ekle, en az 1 en fazla 8 tane.',
		required: true,
		guarded: true,
		schema: z.array(shortText(80)).min(1).max(8)
	},
	{
		id: 'credentials',
		kind: 'open_text',
		prompt: 'Unvan, sertifika ya da üyelik gibi belirtmek istediğin bir şey var mı?',
		helper: 'İstersen boş geç.',
		required: false,
		guarded: true,
		schema: optionalText(400)
	},
	{
		id: 'media',
		kind: 'choice',
		prompt: 'Kullanılabilir görsellerin var mı?',
		required: true,
		guarded: false,
		options: MEDIA_OPTIONS,
		schema: z.enum(['has_media', 'use_placeholders'])
	},
	{
		id: 'domainPreference',
		kind: 'short_text',
		prompt: 'Nasıl bir web adresi (domain) istersin?',
		helper: 'İstersen boş geç, sonra da belirleyebilirsin.',
		required: false,
		guarded: true,
		schema: optionalText(120)
	},
	{
		id: 'anythingElse',
		kind: 'open_text',
		prompt: 'Eklemek istediğin başka bir şey var mı?',
		helper: 'İstersen boş geç.',
		required: false,
		guarded: true,
		schema: optionalText(600)
	}
];

export function questionById(id: string): Question | undefined {
	return ONBOARDING_QUESTIONS.find((q) => q.id === id);
}

/** Questions visible given the answers collected so far, in order. */
export function visibleQuestions(answers: OnboardingAnswers): Question[] {
	return ONBOARDING_QUESTIONS.filter((q) => !q.showWhen || q.showWhen(answers));
}

/**
 * First unanswered visible question, or undefined when the flow is complete.
 * "Answered" means the id has an entry in `answers` at all — optional questions are
 * recorded as skipped (empty value) rather than left absent, so they don't re-ask.
 */
export function nextQuestion(answers: OnboardingAnswers): Question | undefined {
	return visibleQuestions(answers).find((q) => !(q.id in answers));
}
