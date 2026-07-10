import type { OnboardingAnswers } from './questions';

export const SUPPORTED_NICHES = ['psych', 'law', 'dental'] as const;
export const UNSUPPORTED_NICHE = 'unsupported';

export const manualReviewMessage =
	'Bu meslek alanı şu an otomatik üretimde desteklenmiyor. Law preset’e düşürmek yerine manuel beta incelemesine alıyoruz.';

const unsupportedProfessionPatterns = [
	/\bayakkab[ıi]\b/i,
	/\bayakkab[ıi]\s+tamir/i,
	/\bkundura\b/i,
	/\bshoe\s+repair\b/i,
	/\bcobbler\b/i,
	/\bshoemaker\b/i,
	/\bterzi\b/i,
	/\btailor\b/i,
	/\bkuaf[oö]r\b/i,
	/\bhairdresser\b/i,
	/\bberber\b/i,
	/\bbarber\b/i,
	/\boto\s+tamir\b/i,
	/\bauto\s+repair\b/i
];

const supportedProfessionPatterns = [
	/\bpsikolog\b/i,
	/\bterapist\b/i,
	/\btherapy\b/i,
	/\btherapist\b/i,
	/\bpsycholog/i,
	/\bavukat\b/i,
	/\bhukuk\b/i,
	/\blawyer\b/i,
	/\blaw\s+office\b/i,
	/\banwalt\b/i,
	/\bkanzlei\b/i,
	/\bdi[sş]\b/i,
	/\bdi[sş]\s+hekimi\b/i,
	/\bdent/i,
	/\bzahnarzt\b/i
];

export function isUnsupportedNicheAnswer(answers: OnboardingAnswers): boolean {
	return answers.niche === UNSUPPORTED_NICHE;
}

export function needsManualReview(description: string): boolean {
	const text = description.trim();
	if (!text) return false;
	return (
		unsupportedProfessionPatterns.some((pattern) => pattern.test(text)) &&
		!supportedProfessionPatterns.some((pattern) => pattern.test(text))
	);
}
