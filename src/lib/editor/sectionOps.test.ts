import { describe, expect, it } from 'vitest';
import { themePresets } from '$lib/presets';
import { seedSites } from '$lib/seed';
import { siteSchema } from '$lib/schema/site';
import {
	createVisualSection,
	duplicateSection,
	moveSection,
	removeSection,
	VISUAL_SECTION_TYPES
} from './sectionOps';

describe('visual section operations', () => {
	it('creates every direct-add block as schema-valid multilingual data', () => {
		for (const type of VISUAL_SECTION_TYPES) {
			const site = structuredClone(seedSites.law);
			site.theme = structuredClone(themePresets.law);
			site.pages[0].sections = [createVisualSection(site.pages[0], type, 'owner@example.com')];
			expect(siteSchema.safeParse(site).success, type).toBe(true);
		}
	});

	it('moves, duplicates and safely removes sections', () => {
		const page = structuredClone(seedSites.law.pages[0]);
		const firstId = page.sections[0].id;
		expect(moveSection(page, firstId, 1)).toBe(true);
		expect(page.sections[1].id).toBe(firstId);

		const duplicateId = duplicateSection(page, firstId);
		expect(duplicateId).toMatch(/-copy-1$/);
		expect(page.sections.some((section) => section.id === duplicateId)).toBe(true);
		expect(removeSection(page, duplicateId!)).toBe(true);
	});
});
