import { describe, expect, it } from 'vitest';
import { ONBOARDING_QUESTIONS } from '$lib/onboarding/questions';
import { questionCopy } from './onboarding';

describe('onboarding question copy — locale coverage', () => {
	it('has an en and de entry for every onboarding question id', () => {
		const missing: string[] = [];
		for (const question of ONBOARDING_QUESTIONS) {
			for (const locale of ['en', 'de'] as const) {
				if (!questionCopy[locale][question.id]) missing.push(`${locale}:${question.id}`);
			}
		}
		// A missing entry means `localizeQuestion` silently falls back to the raw
		// Turkish prompt mid-session for an EN/DE user — this must never ship silently.
		expect(missing).toEqual([]);
	});
});
