import { describe, expect, it } from 'vitest';
import {
	generatedSiteSchema,
	chatPatchSchema,
	toInputSchema,
	translationSchemaFor
} from '$lib/server/ai/schemas';

describe('tool input schemas', () => {
	it('derive to JSON Schema objects Claude can consume', () => {
		for (const s of [generatedSiteSchema, chatPatchSchema, translationSchemaFor(['en', 'de'])]) {
			const json = toInputSchema(s);
			expect(json.type).toBe('object');
			// Seventeen supported block types expand the generated schema beyond the
			// original 60 KB budget. Keep a guardrail while leaving room for the
			// current controlled component set.
			expect(JSON.stringify(json).length).toBeLessThan(70000);
		}
	});

	it('allows the guided five-page onboarding structure', () => {
		const page = (slug: string) => ({
			slug,
			title: slug,
			sections: [
				{
					id: `${slug}-footer`,
					type: 'footer',
					props: { variant: 'simple' },
					content: { text: 'Footer' }
				}
			]
		});

		const parsed = generatedSiteSchema.safeParse({
			defaultLocale: 'tr',
			theme: {
				preset: 'law',
				colors: { primary: '#1e3a5f', secondary: '#b08d57', accent: '#27548a' },
				fonts: { heading: 'Playfair Display', body: 'Inter' },
				radius: 'sm'
			},
			nav: ['home', 'about', 'services', 'faq', 'contact'].map((slug) => ({
				pageSlug: slug,
				label: slug
			})),
			pages: ['home', 'about', 'services', 'faq', 'contact'].map(page),
			settings: { siteName: 'Five Page Site' }
		});

		expect(parsed.success).toBe(true);
	});
});
