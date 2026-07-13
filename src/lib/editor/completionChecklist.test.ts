import { describe, expect, it } from 'vitest';
import { lawSite } from '$lib/seed/law';
import type { Site } from '$lib/schema/site';
import { buildCompletionChecklist, nextChecklistItem } from './completionChecklist';

describe('editor completion checklist', () => {
	it('builds the fixed Phase 2 first-run checklist', () => {
		const items = buildCompletionChecklist(lawSite);
		expect(items.map((item) => item.id)).toEqual([
			'headline',
			'contact',
			'services',
			'languages',
			'media',
			'identity',
			'publish'
		]);
	});

	it('points each item to an existing editor tab', () => {
		const items = buildCompletionChecklist(lawSite);
		expect(items.map((item) => item.tab)).toEqual([
			'Content',
			'Settings',
			'Content',
			'Languages',
			'Content',
			'Settings',
			'Settings'
		]);
	});

	it('marks identity complete only after a custom public handle is selected', () => {
		expect(
			buildCompletionChecklist(lawSite, { publicHandle: lawSite.id }).find(
				(item) => item.id === 'identity'
			)?.complete
		).toBe(false);
		expect(
			buildCompletionChecklist(lawSite, { publicHandle: 'aksoy-hukuk' }).find(
				(item) => item.id === 'identity'
			)?.complete
		).toBe(true);
	});

	it('marks publish complete only when a published version exists', () => {
		expect(buildCompletionChecklist(lawSite).find((item) => item.id === 'publish')?.complete).toBe(
			false
		);
		expect(
			buildCompletionChecklist(lawSite, { publishedVersion: 3 }).find(
				(item) => item.id === 'publish'
			)?.complete
		).toBe(true);
	});

	it('selects the first incomplete item as the next action', () => {
		const site: Site = {
			...lawSite,
			pages: [
				{
					...lawSite.pages[0],
					sections: lawSite.pages[0].sections.map((section) =>
						section.type === 'hero'
							? {
									...section,
									content: {
										...section.content,
										tr: { ...section.content.tr, headline: 'Kısa' }
									}
								}
							: section
					)
				},
				...lawSite.pages.slice(1)
			]
		};
		const items = buildCompletionChecklist(site);
		expect(nextChecklistItem(items).id).toBe('headline');
	});
});
