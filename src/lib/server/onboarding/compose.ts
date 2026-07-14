import {
	BOOKING_OPTIONS,
	CONTACT_METHOD_OPTIONS,
	NICHE_OPTIONS,
	SITE_STRUCTURE_OPTIONS,
	TONE_OPTIONS,
	type OnboardingAnswers
} from '$lib/onboarding/questions';
import { visualDirectionById } from '$lib/onboarding/directions';
import { kitBySlug } from '$lib/kits';
import { UNSUPPORTED_NICHE } from '$lib/onboarding/support';

/**
 * Composes the collected onboarding answers into a single flowing description
 * string, then feeds the UNCHANGED `POST /api/sites` → `generateSite()` contract —
 * this function is the only place that knows the shape of the Q&A answers, so the
 * one-shot generation pipeline (`generate.ts`) never needs to change.
 */

const labelOf = (options: { value: string; label: string }[], value: unknown): string =>
	options.find((o) => o.value === value)?.label ?? String(value ?? '');

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const asStringArray = (value: unknown): string[] =>
	Array.isArray(value) ? value.map((v) => asString(v)).filter(Boolean) : [];

const LANGUAGE_NAMES: Record<string, string> = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca' };

export function composeDescription(
	answers: OnboardingAnswers,
	options: { kitSlug?: string } = {}
): string {
	// The free-text escape hatch bypasses the composer entirely.
	const raw = asString(answers.rawDescription);
	if (raw) return raw;

	const niche = labelOf(NICHE_OPTIONS, answers.niche);
	const isOther = answers.niche === UNSUPPORTED_NICHE;
	const otherProfession = asString(answers.otherProfession);
	const businessName = asString(answers.businessName);
	const city = asString(answers.city);
	const audience = asString(answers.audience);
	const differentiator = asString(answers.differentiator);
	const tone = labelOf(TONE_OPTIONS, answers.tone);
	const visualDirection = visualDirectionById(answers.visualDirection);
	const siteStructure = labelOf(SITE_STRUCTURE_OPTIONS, answers.siteStructure);
	const selectedKit = kitBySlug(options.kitSlug);
	const contactMethod = labelOf(CONTACT_METHOD_OPTIONS, answers.contactMethod);
	const contactEmail = asString(answers.contactEmail);
	const contactPhone = asString(answers.contactPhone);
	const booking = labelOf(BOOKING_OPTIONS, answers.booking);
	const services = asStringArray(answers.services);
	const credentials = asString(answers.credentials);
	const hasMedia = answers.media === 'has_media';
	const anythingElse = asString(answers.anythingElse);
	const languages = asStringArray(answers.languages);

	const sentences: string[] = [];

	sentences.push(
		isOther && otherProfession
			? `${businessName}, ${city} bölgesinde hizmet veren bir ${otherProfession}.`
			: `${businessName}, ${city} bölgesinde hizmet veren bir ${niche.toLowerCase()} pratiği.`
	);
	if (audience) sentences.push(`Hedef kitlesi: ${audience}.`);
	if (differentiator) sentences.push(`Fark yaratan yönü: ${differentiator}.`);
	if (services.length) sentences.push(`Sunduğu başlıca hizmetler: ${services.join(', ')}.`);
	if (credentials) sentences.push(`Unvan/sertifika/üyelikler: ${credentials}.`);
	if (tone) sentences.push(`Sitenin tonu ${tone.toLowerCase()} olmalı.`);
	if (visualDirection) {
		sentences.push(
			`Görsel yön: ${visualDirection.label} — ${visualDirection.toneHint}; bölüm vurgusu: ${visualDirection.sectionEmphasis}.`
		);
		if (!isOther) {
			const kit = selectedKit ?? visualDirection.kit;
			if (kit) {
				sentences.push(
					`Kit referansı: ${kit.label} (${kit.slug}) — ${kit.outcome} Meslek: ${'profession' in kit ? kit.profession : 'Psikolog / Terapist'}. Sabit blok setinin dışına çıkma.`
				);
				if ('featureKits' in kit && kit.featureKits.length) {
					sentences.push(`Önerilen feature kitleri: ${kit.featureKits.join(', ')}.`);
				}
			}
		}
	}
	if (siteStructure) {
		sentences.push(
			`Site yapısı tercihi: ${siteStructure}. Bu tercihe uygun sayfa sayısı ve menü yapısı öner; gereksiz sayfa üretme.`
		);
	}
	if (booking) sentences.push(`Randevu süreci: ${booking.toLowerCase()}.`);

	if (contactMethod) {
		const contactBits: string[] = [];
		const usesEmail = answers.contactMethod === 'email' || answers.contactMethod === 'both';
		const usesPhone = answers.contactMethod === 'phone' || answers.contactMethod === 'both';
		if (usesEmail && contactEmail) contactBits.push(`e-posta (${contactEmail})`);
		if (usesPhone && contactPhone) contactBits.push(`telefon (${contactPhone})`);
		if (contactBits.length) {
			sentences.push(`İletişim tercihi ${contactMethod.toLowerCase()}: ${contactBits.join(', ')}.`);
		}
	}

	sentences.push(
		hasMedia
			? 'Kendi görsellerini kullanacak.'
			: 'Şimdilik hazır/placeholder görseller kullanılabilir.'
	);

	if (anythingElse) sentences.push(anythingElse);

	// Steering sentence, not a locale enforcement — generate.ts's contract is unchanged.
	if (languages.length && !languages.includes('tr')) {
		const primary = LANGUAGE_NAMES[languages[0]] ?? languages[0];
		sentences.push(`Bu açıklamayı öncelikli olarak ${primary} olarak değerlendir.`);
	} else if (languages.length > 1) {
		sentences.push(
			`Site şu dillerde yayınlanmalı: ${languages.map((l) => LANGUAGE_NAMES[l] ?? l).join(', ')}.`
		);
	}

	return sentences.filter(Boolean).join(' ');
}
