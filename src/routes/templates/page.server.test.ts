import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

describe('GET /templates (load)', () => {
	it('returns the six launch psych kits with quality metadata', () => {
		const result = load({} as never) as {
			kits: {
				slug: string;
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
			'trauma-informed'
		]);
		for (const kit of result.kits) {
			expect(kit.sections.length).toBeGreaterThanOrEqual(5);
			expect(kit.locales).toEqual(['tr', 'en', 'de']);
			expect(kit.quality).toEqual({ canPublish: true, blockerCount: 0, warningCount: 0 });
		}
	});
});
