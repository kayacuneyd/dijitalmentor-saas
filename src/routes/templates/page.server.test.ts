import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

describe('GET /templates (load)', () => {
	it('returns controlled profession kits with quality and prompt metadata', () => {
		const result = load({} as never) as {
			kits: {
				slug: string;
				profession: string;
				featureKits: string[];
				promptRecipes: unknown[];
				sections: unknown[];
				locales: string[];
				quality: { canPublish: boolean; blockerCount: number; warningCount: number };
			}[];
		};
		expect(result.kits.map((kit) => kit.slug)).toEqual([
			'calm-intake',
			'modern-clinic',
			'online-therapy',
			'child-family',
			'couples-therapy',
			'trauma-informed',
			'dietitian-modern',
			'real-estate-agent',
			'beauty-salon',
			'physiotherapist-modern',
			'dentist-clinic',
			'lawyer-trust'
		]);
		expect(result.kits.find((kit) => kit.slug === 'dietitian-modern')?.profession).toBe(
			'Diyetisyen'
		);
		for (const kit of result.kits) {
			expect(kit.featureKits.length).toBeGreaterThan(0);
			expect(kit.promptRecipes.length).toBeGreaterThan(0);
			expect(kit.sections.length).toBeGreaterThanOrEqual(5);
			expect(kit.locales).toEqual(['tr', 'en', 'de']);
			expect(kit.quality.canPublish).toBe(true);
			expect(kit.quality.blockerCount).toBe(0);
		}
	});
});
