import type { OnboardingAnswers } from './questions';

export const SUPPORTED_NICHES = [
	'psych',
	'law',
	'dental',
	'dietitian',
	'real_estate',
	'beauty'
] as const;
export const UNSUPPORTED_NICHE = 'unsupported';

export function isUnsupportedNicheAnswer(answers: OnboardingAnswers): boolean {
	return answers.niche === UNSUPPORTED_NICHE;
}
