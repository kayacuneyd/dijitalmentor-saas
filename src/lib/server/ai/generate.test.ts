import { describe, expect, it, vi } from 'vitest';
import { assembleSite, generateSite, syncMediaRefs } from './generate';
import { extractTranslatable, generatedSiteSchema, type GeneratedSite } from './schemas';
import { AIInvalidOutputError, type RunToolCall, type ToolCallResult } from './llm';

/** A minimal, valid generated site (Turkish default) used across the tests. */
const gen: GeneratedSite = generatedSiteSchema.parse({
	defaultLocale: 'tr',
	theme: {
		preset: 'law',
		colors: { primary: '#1e3a5f', secondary: '#b08d57', accent: '#27548a' },
		fonts: { heading: 'Playfair Display', body: 'Inter' },
		radius: 'sm'
	},
	nav: [{ pageSlug: 'home', label: 'Ana Sayfa' }],
	pages: [
		{
			slug: 'home',
			title: 'Ana Sayfa',
			sections: [
				{
					id: 'hero-1',
					type: 'hero',
					props: { variant: 'split', background: 'image', imageUrl: '/seed/law/hero.svg' },
					content: { headline: 'Hukukta güvenilir ortak' }
				},
				{
					id: 'footer-1',
					type: 'footer',
					props: { variant: 'simple' },
					content: { text: '© 2026 Demir Hukuk' }
				}
			]
		}
	],
	settings: { siteName: 'Demir Hukuk', seoDescription: 'İstanbul’da aile hukuku.' }
});

const translationFor = (marker: string) => {
	const pack = structuredClone(extractTranslatable(gen));
	const hero = pack.pages[0].sections[0].content as { headline: string };
	hero.headline = `${marker} headline`;
	const footer = pack.pages[0].sections[1].content as { text: string };
	footer.text = `${marker} footer`;
	pack.pages[0].title = `${marker} title`;
	pack.navLabels[0].label = `${marker} nav`;
	pack.seoDescription = `${marker} seo`;
	return pack;
};

const asResult = (input: unknown): ToolCallResult => ({
	input,
	toolUseId: 'toolu_test',
	assistantContent: [],
	usage: { inputTokens: 100, outputTokens: 200 }
});

describe('syncMediaRefs', () => {
	it('copies media/link refs from the base and keeps translated text', () => {
		const base = { title: 'TR', images: [{ url: '/a.svg', alt: 'tr-alt' }] };
		const translated = { title: 'EN', images: [{ url: '/DRIFTED.svg', alt: 'en-alt' }] };
		expect(syncMediaRefs(base, translated)).toEqual({
			title: 'EN',
			images: [{ url: '/a.svg', alt: 'en-alt' }]
		});
	});
});

describe('assembleSite', () => {
	it('merges default locale + translations into a valid Site', () => {
		const site = assembleSite(
			gen,
			{ en: translationFor('EN'), de: translationFor('DE') },
			{ id: 'site-x', tenantId: 'tenant-x' }
		);
		expect(site.defaultLocale).toBe('tr');
		expect(site.pages[0].title).toEqual({ tr: 'Ana Sayfa', en: 'EN title', de: 'DE title' });
		const hero = site.pages[0].sections[0];
		if (hero.type !== 'hero') throw new Error('expected hero');
		expect(hero.content.tr.headline).toBe('Hukukta güvenilir ortak');
		expect(hero.content.en.headline).toBe('EN headline');
		expect(hero.content.de.headline).toBe('DE headline');
		expect(site.settings.seo?.description?.de).toBe('DE seo');
		expect(site.settings.poweredByBadge).toBe(true);
	});

	it('rejects a translation that lost a section', () => {
		const broken = translationFor('EN');
		broken.pages[0].sections.pop();
		expect(() =>
			assembleSite(gen, { en: broken, de: translationFor('DE') }, { id: 'x', tenantId: 'y' })
		).toThrow(/lost section/);
	});
});

describe('generateSite (mocked LLM)', () => {
	it('runs generate → translate → assemble and accumulates usage', async () => {
		const run = vi
			.fn<RunToolCall>()
			.mockResolvedValueOnce(asResult(gen))
			.mockResolvedValueOnce(asResult({ en: translationFor('EN'), de: translationFor('DE') }));

		const { site, usage } = await generateSite(
			{ description: 'Ben avukatım…', id: 'site-t', tenantId: 'tenant-t' },
			{ run }
		);

		expect(run).toHaveBeenCalledTimes(2);
		expect(site.id).toBe('site-t');
		expect(site.locales).toEqual(['en', 'tr', 'de']);
		expect(usage).toEqual({ inputTokens: 200, outputTokens: 400 });
		// the translate call must not include the create_site tool
		expect(run.mock.calls[1][0].tool.name).toBe('translate_site');
	});

	it('repairs once when the first generation is schema-invalid', async () => {
		const invalid = { ...structuredClone(gen), theme: { ...gen.theme, preset: 'bakery' } };
		const run = vi
			.fn<RunToolCall>()
			.mockResolvedValueOnce(asResult(invalid)) // first attempt fails validation
			.mockResolvedValueOnce(asResult(gen)) // repair succeeds
			.mockResolvedValueOnce(asResult({ en: translationFor('EN'), de: translationFor('DE') }));

		const { site } = await generateSite(
			{ description: 'Ben avukatım…', id: 'site-r', tenantId: 'tenant-r' },
			{ run }
		);

		expect(run).toHaveBeenCalledTimes(3);
		// the repair round-trip carries the tool_result error back
		const repairMessages = run.mock.calls[1][0].messages;
		expect(repairMessages).toHaveLength(3);
		expect(site.theme.preset).toBe('law');
	});

	it('gives up with AIInvalidOutputError after the single repair attempt', async () => {
		const invalid = { nonsense: true };
		const run = vi
			.fn<RunToolCall>()
			.mockResolvedValueOnce(asResult(invalid))
			.mockResolvedValueOnce(asResult(invalid));

		await expect(
			generateSite({ description: 'x'.repeat(40), id: 's', tenantId: 't' }, { run })
		).rejects.toBeInstanceOf(AIInvalidOutputError);
		expect(run).toHaveBeenCalledTimes(2); // exactly one repair, never more
	});
});
