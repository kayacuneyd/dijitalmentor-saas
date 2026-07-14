import { describe, expect, it } from 'vitest';
import { ONBOARDING_QUESTIONS, nextQuestion, questionById, visibleQuestions } from './questions';

describe('onboarding question script', () => {
	it('is a fixed, deterministic list — 16 top-level prompts plus 3 conditional steps', () => {
		expect(ONBOARDING_QUESTIONS).toHaveLength(19);
		const conditional = ONBOARDING_QUESTIONS.filter((q) => q.showWhen);
		expect(conditional.map((q) => q.id)).toEqual([
			'otherProfession',
			'contactEmail',
			'contactPhone'
		]);
	});

	it('every id is unique', () => {
		const ids = ONBOARDING_QUESTIONS.map((q) => q.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('guards exactly the free-text fields agreed with the user (~8 questions)', () => {
		const guarded = ONBOARDING_QUESTIONS.filter((q) => q.guarded).map((q) => q.id);
		expect(guarded).toEqual([
			'otherProfession',
			'businessName',
			'city',
			'audience',
			'differentiator',
			'services',
			'credentials',
			'domainPreference',
			'anythingElse'
		]);
	});

	it('never guards a choice/multi_choice question', () => {
		for (const q of ONBOARDING_QUESTIONS) {
			if (q.kind === 'choice' || q.kind === 'multi_choice') expect(q.guarded).toBe(false);
		}
	});

	it('contactEmail/contactPhone are format-validated, not guarded', () => {
		expect(questionById('contactEmail')?.guarded).toBe(false);
		expect(questionById('contactPhone')?.guarded).toBe(false);
	});

	describe('conditional visibility', () => {
		it('hides contactEmail/contactPhone until contactMethod is answered', () => {
			const ids = visibleQuestions({}).map((q) => q.id);
			expect(ids).not.toContain('contactEmail');
			expect(ids).not.toContain('contactPhone');
		});

		it('shows only contactEmail when contactMethod is "email"', () => {
			const ids = visibleQuestions({ contactMethod: 'email' }).map((q) => q.id);
			expect(ids).toContain('contactEmail');
			expect(ids).not.toContain('contactPhone');
		});

		it('shows both when contactMethod is "both"', () => {
			const ids = visibleQuestions({ contactMethod: 'both' }).map((q) => q.id);
			expect(ids).toContain('contactEmail');
			expect(ids).toContain('contactPhone');
		});
	});

	describe('nextQuestion', () => {
		it('starts at niche', () => {
			expect(nextQuestion({})?.id).toBe('niche');
		});

		it('skips answered questions in order', () => {
			expect(nextQuestion({ niche: 'psych', businessName: 'Ada Terapi' })?.id).toBe('city');
		});

		it('does not ask a conditional question before its trigger is answered', () => {
			const answered = Object.fromEntries(
				ONBOARDING_QUESTIONS.filter((q) => !q.showWhen && q.id !== 'contactMethod').map((q) => [
					q.id,
					'x'
				])
			);
			// contactMethod itself is still unanswered → must come before contactEmail/contactPhone
			expect(nextQuestion(answered)?.id).toBe('contactMethod');
		});

		it('is undefined once every visible question has an entry', () => {
			const answered = Object.fromEntries(
				visibleQuestions({ contactMethod: 'both' }).map((q) => [q.id, 'x'])
			);
			expect(nextQuestion(answered)).toBeUndefined();
		});

		it('asks for the profession when the unsupported niche is selected, then continues the full flow', () => {
			expect(nextQuestion({ niche: 'unsupported' })!.id).toBe('otherProfession');
			// otherProfession should be hidden for supported niches
			expect(
				visibleQuestions({ niche: 'psych' }).find((q) => q.id === 'otherProfession')
			).toBeUndefined();
			// Full flow completes
			const allAnswered = Object.fromEntries(
				visibleQuestions({
					niche: 'unsupported',
					otherProfession: 'Terzi',
					contactMethod: 'both'
				}).map((q) => [q.id, 'x'])
			);
			expect(nextQuestion(allAnswered)).toBeUndefined();
		});
	});

	describe('per-question schemas', () => {
		it('niche accepts controlled profession kits plus the manual-review gate', () => {
			const schema = questionById('niche')!.schema;
			expect(schema.safeParse('psych').success).toBe(true);
			expect(schema.safeParse('dietitian').success).toBe(true);
			expect(schema.safeParse('real_estate').success).toBe(true);
			expect(schema.safeParse('beauty').success).toBe(true);
			expect(schema.safeParse('unsupported').success).toBe(true);
			expect(schema.safeParse('other').success).toBe(false);
		});

		it('languages requires at least one value', () => {
			const schema = questionById('languages')!.schema;
			expect(schema.safeParse([]).success).toBe(false);
			expect(schema.safeParse(['tr']).success).toBe(true);
		});

		it('visualDirection accepts only the 3 curated direction ids', () => {
			const schema = questionById('visualDirection')!.schema;
			expect(schema.safeParse('warm_trust').success).toBe(true);
			expect(schema.safeParse('anything_goes').success).toBe(false);
		});

		it('siteStructure accepts only the controlled sitemap choices', () => {
			const schema = questionById('siteStructure')!.schema;
			expect(schema.safeParse('three_page').success).toBe(true);
			expect(schema.safeParse('custom_html_pages').success).toBe(false);
		});

		it('services caps at 8 items', () => {
			const schema = questionById('services')!.schema;
			expect(schema.safeParse(Array(8).fill('x')).success).toBe(true);
			expect(schema.safeParse(Array(9).fill('x')).success).toBe(false);
		});

		it('contactEmail requires a real email', () => {
			const schema = questionById('contactEmail')!.schema;
			expect(schema.safeParse('not-an-email').success).toBe(false);
			expect(schema.safeParse('a@b.com').success).toBe(true);
		});

		it('optional questions accept an empty skip value', () => {
			for (const id of ['credentials', 'domainPreference', 'anythingElse']) {
				const schema = questionById(id)!.schema;
				expect(schema.safeParse(undefined).success).toBe(true);
			}
		});
	});
});
