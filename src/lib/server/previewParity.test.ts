import { describe, expect, it } from 'vitest';
import { seedSites } from '$lib/seed';
import { siteSchema } from '$lib/schema/site';
import { publishDraft, saveDraft } from './db/repo';
import { comparePreviewParity } from './previewParity';

describe('comparePreviewParity', () => {
	it('matches a freshly published draft snapshot', () => {
		const site = siteSchema.parse({ ...seedSites.psych, id: 'parity-ok' });
		saveDraft(site, { ownerUserId: 'owner-parity' });
		publishDraft(site.id);

		const result = comparePreviewParity(site.id, site.defaultLocale, site.pages[0].slug);

		expect(result?.ok).toBe(true);
		expect(result?.mismatches).toEqual([]);
	});

	it('reports structural marker drift between saved draft and published snapshot', () => {
		const site = siteSchema.parse({ ...seedSites.psych, id: 'parity-drift' });
		saveDraft(site, { ownerUserId: 'owner-parity' });
		publishDraft(site.id);
		const hero = site.pages[0].sections[0];
		saveDraft(
			siteSchema.parse({
				...site,
				pages: [
					{
						...site.pages[0],
						sections: [
							{
								...hero,
								content: {
									...hero.content,
									[site.defaultLocale]: {
										...hero.content[site.defaultLocale],
										headline: 'Changed draft headline'
									}
								}
							},
							...site.pages[0].sections.slice(1)
						]
					},
					...site.pages.slice(1)
				]
			})
		);

		const result = comparePreviewParity(site.id, site.defaultLocale, site.pages[0].slug);

		expect(result?.ok).toBe(false);
		expect(result?.mismatches).toContain('heroHeadline');
	});
});
