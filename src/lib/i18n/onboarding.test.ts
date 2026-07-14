import { describe, expect, it } from 'vitest';
import { ONBOARDING_QUESTIONS } from '$lib/onboarding/questions';
import { VISUAL_DIRECTIONS } from '$lib/onboarding/directions';
import { questionCopy, directionCopy } from './onboarding';

const NON_BASE_LOCALES = ['en', 'de'] as const;

describe('onboarding question copy — locale coverage', () => {
	it('has an en and de entry for every onboarding question id', () => {
		const missing: string[] = [];
		for (const question of ONBOARDING_QUESTIONS) {
			for (const locale of NON_BASE_LOCALES) {
				if (!questionCopy[locale][question.id]) missing.push(`${locale}:${question.id}`);
			}
		}
		// A missing entry means `localizeQuestion` silently falls back to the raw
		// Turkish prompt mid-session for an EN/DE user — this must never ship silently.
		expect(missing).toEqual([]);
	});

	it('never leaves prompt or helper empty when the base question has one', () => {
		const empty: string[] = [];
		for (const question of ONBOARDING_QUESTIONS) {
			for (const locale of NON_BASE_LOCALES) {
				const copy = questionCopy[locale][question.id];
				if (!copy) continue; // already reported by the presence test above
				if (!copy.prompt?.trim()) empty.push(`${locale}:${question.id}:prompt`);
				if (question.helper && !copy.helper?.trim()) empty.push(`${locale}:${question.id}:helper`);
			}
		}
		expect(empty).toEqual([]);
	});

	it('translates every choice option, not just the prompt', () => {
		// Reproduces the exact regression class that shipped once: a question id present
		// in questionCopy but with a stale/missing `options` map, silently falling back
		// to the raw Turkish option labels for an EN/DE user mid-session.
		const mismatches: string[] = [];
		for (const question of ONBOARDING_QUESTIONS) {
			// Visual directions deliberately use `directionCopy`: they carry structured
			// label/promise/preview data rather than simple option labels.
			if (question.id === 'visualDirection') continue;
			if (!question.options || question.options.length === 0) continue;
			const baseValues = question.options.map((option) => option.value).sort();
			for (const locale of NON_BASE_LOCALES) {
				const copy = questionCopy[locale][question.id];
				if (!copy) continue; // already reported by the presence test above
				const translatedValues = Object.keys(copy.options ?? {}).sort();
				if (JSON.stringify(translatedValues) !== JSON.stringify(baseValues)) {
					mismatches.push(
						`${locale}:${question.id} — expected [${baseValues.join(', ')}], got [${translatedValues.join(', ')}]`
					);
					continue;
				}
				for (const option of question.options) {
					if (!copy.options?.[option.value]?.trim()) {
						mismatches.push(`${locale}:${question.id}:${option.value} is empty`);
					}
				}
			}
		}
		expect(mismatches).toEqual([]);
	});
});

describe('visual direction copy — locale coverage', () => {
	// No test previously existed for directionCopy/localizeDirection at all — this
	// closes that gap using the same pattern as the onboarding question checks above.
	it('has a complete, non-empty en and de entry for every visual direction id', () => {
		const problems: string[] = [];
		for (const direction of VISUAL_DIRECTIONS) {
			for (const locale of NON_BASE_LOCALES) {
				const copy = directionCopy[locale][direction.id];
				if (!copy) {
					problems.push(`${locale}:${direction.id} missing`);
					continue;
				}
				for (const field of ['label', 'promise', 'preview'] as const) {
					if (!copy[field]?.trim()) problems.push(`${locale}:${direction.id}:${field} is empty`);
				}
			}
		}
		expect(problems).toEqual([]);
	});
});
