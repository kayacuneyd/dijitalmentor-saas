import { describe, expect, it } from 'vitest';
import { seedSites } from '$lib/seed';
import * as repo from './repo';

// The db client resolves DATABASE_URL when Vite starts, so the test scripts pin it to
// ':memory:' in package.json — setting process.env inside a test is too late to matter.

describe('site draft repository', () => {
	it('returns null for an unknown site and never invents one', () => {
		expect(repo.getDraft('nope')).toBeNull();
		expect(repo.getOrSeedDraft('nope')).toBeNull();
	});

	it('lazily seeds a draft from the hand-authored sites', () => {
		expect(repo.getDraft('seed-law')).toBeNull();
		const seeded = repo.getOrSeedDraft('seed-law');
		expect(seeded?.settings.siteName).toBe(seedSites.law.settings.siteName);
		// now persisted: plain getDraft finds it
		expect(repo.getDraft('seed-law')?.id).toBe('seed-law');
	});

	it('round-trips an edited draft', () => {
		const draft = structuredClone(repo.getOrSeedDraft('seed-psych'));
		if (!draft || draft.pages[0].sections[0].type !== 'hero') throw new Error('bad fixture');
		draft.pages[0].sections[0].content.tr.headline = 'Yeni başlık';
		repo.saveDraft(draft);
		const reloaded = repo.getDraft('seed-psych');
		if (reloaded?.pages[0].sections[0].type !== 'hero') throw new Error('bad reload');
		expect(reloaded.pages[0].sections[0].content.tr.headline).toBe('Yeni başlık');
	});

	it('refuses to store a contract-violating draft', () => {
		const draft = structuredClone(repo.getOrSeedDraft('seed-dental'));
		if (!draft) throw new Error('bad fixture');
		draft.theme.colors.primary = 'not-a-color';
		expect(() => repo.saveDraft(draft)).toThrow();
		// stored copy untouched
		expect(repo.getDraft('seed-dental')?.theme.colors.primary).toBe('#0e7490');
	});
});
