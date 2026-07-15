import { describe, expect, it, vi } from 'vitest';
import { applyPatch, chatEdit, PatchApplyError } from './patch';
import { AIInvalidOutputError, type RunToolCall, type ToolCallResult } from './llm';
import { seedSites } from '$lib/seed';

const site = () => structuredClone(seedSites.psych);

const asResult = (input: unknown): ToolCallResult => ({
	input,
	toolUseId: 'toolu_test',
	assistantContent: [],
	usage: { inputTokens: 50, outputTokens: 50 }
});

describe('applyPatch', () => {
	it('sets text at a nested content path for one locale', () => {
		const next = applyPatch(site(), [
			{
				op: 'set_text',
				pageSlug: 'home',
				sectionId: 'services-1',
				locale: 'en',
				path: ['items', 0, 'name'],
				value: 'Anxiety Therapy'
			}
		]);
		const services = next.pages[0].sections.find((s) => s.id === 'services-1');
		if (services?.type !== 'services') throw new Error('expected services');
		expect(services.content.en.items[0].name).toBe('Anxiety Therapy');
		// other locales untouched
		expect(services.content.tr.items[0].name).toBe('Kaygı ve Stres');
	});

	it('applies theme preset + overrides and settings toggles', () => {
		const next = applyPatch(site(), [
			{ op: 'set_theme', theme: { preset: 'dental', colors: { primary: '#123456' } } },
			{ op: 'set_settings', settings: { poweredByBadge: false } }
		]);
		expect(next.theme.preset).toBe('dental');
		expect(next.theme.colors.primary).toBe('#123456');
		expect(next.settings.poweredByBadge).toBe(false);
	});

	it('adds, moves and removes sections', () => {
		const base = site();
		const added = applyPatch(base, [
			{
				op: 'add_section',
				pageSlug: 'home',
				index: 1,
				section: {
					id: 'cta-new',
					type: 'cta',
					props: { variant: 'banner', href: '#contact' },
					content: {
						tr: { title: 'Randevu alın', buttonLabel: 'Yazın' },
						en: { title: 'Book now', buttonLabel: 'Write' },
						de: { title: 'Termin buchen', buttonLabel: 'Schreiben' }
					}
				}
			}
		]);
		expect(added.pages[0].sections[1].id).toBe('cta-new');

		const moved = applyPatch(added, [
			{ op: 'move_section', pageSlug: 'home', sectionId: 'cta-new', toIndex: 0 }
		]);
		expect(moved.pages[0].sections[0].id).toBe('cta-new');

		const removed = applyPatch(moved, [
			{ op: 'remove_section', pageSlug: 'home', sectionId: 'cta-new' }
		]);
		expect(removed.pages[0].sections.some((s) => s.id === 'cta-new')).toBe(false);
	});

	it('adds pages and nav entries through the constrained operation surface', () => {
		const next = applyPatch(site(), [
			{
				op: 'add_page',
				addToNav: true,
				page: {
					slug: 'ucretler',
					title: { tr: 'Ücretler', en: 'Fees', de: 'Honorare' },
					sections: [
						{
							id: 'hero-ucretler',
							type: 'hero',
							props: { variant: 'centered', background: 'plain' },
							content: {
								tr: { headline: 'Ücretler' },
								en: { headline: 'Fees' },
								de: { headline: 'Honorare' }
							}
						}
					]
				}
			},
			{
				op: 'add_page',
				addToNav: true,
				page: {
					slug: 'sss',
					title: { tr: 'Sık Sorulan Sorular', en: 'FAQ', de: 'FAQ' },
					sections: [
						{
							id: 'hero-sss',
							type: 'hero',
							props: { variant: 'centered', background: 'plain' },
							content: {
								tr: { headline: 'Sık Sorulan Sorular' },
								en: { headline: 'Frequently Asked Questions' },
								de: { headline: 'Häufige Fragen' }
							}
						}
					]
				}
			}
		]);

		expect(next.pages.map((p) => p.slug)).toContain('ucretler');
		expect(next.pages.map((p) => p.slug)).toContain('sss');
		expect(next.nav.items.map((item) => item.pageSlug)).toEqual(
			expect.arrayContaining(['ucretler', 'sss'])
		);
	});

	it('rejects duplicate page slugs', () => {
		expect(() =>
			applyPatch(site(), [
				{
					op: 'add_page',
					addToNav: true,
					page: {
						slug: 'home',
						title: { tr: 'Ana sayfa', en: 'Home', de: 'Startseite' },
						sections: [
							{
								id: 'hero-home-copy',
								type: 'hero',
								props: { variant: 'centered', background: 'plain' },
								content: {
									tr: { headline: 'Ana sayfa' },
									en: { headline: 'Home' },
									de: { headline: 'Startseite' }
								}
							}
						]
					}
				}
			])
		).toThrow(PatchApplyError);
	});

	it('never mutates the input site', () => {
		const original = site();
		applyPatch(original, [{ op: 'set_settings', settings: { siteName: 'Changed' } }]);
		expect(original.settings.siteName).toBe('Psk. Deniz Arslan');
	});

	it('rejects unknown targets and invalid paths', () => {
		expect(() =>
			applyPatch(site(), [{ op: 'remove_section', pageSlug: 'home', sectionId: 'nope' }])
		).toThrow(PatchApplyError);
		expect(() =>
			applyPatch(site(), [
				{
					op: 'set_text',
					pageSlug: 'home',
					sectionId: 'hero-1',
					locale: 'tr',
					path: ['no', 'such', 'path'],
					value: 'x'
				}
			])
		).toThrow(PatchApplyError);
	});

	it('rejects a patch whose result breaks the contract', () => {
		// emptying a required headline violates nonEmpty
		expect(() =>
			applyPatch(site(), [
				{
					op: 'set_text',
					pageSlug: 'home',
					sectionId: 'hero-1',
					locale: 'tr',
					path: ['headline'],
					value: '   '
				}
			])
		).toThrow(); // ZodError from the final siteSchema.parse
	});

	it('removes a page and its nav entries', () => {
		const base = site();
		const next = applyPatch(base, [
			{
				op: 'add_page',
				addToNav: true,
				page: {
					slug: 'test-page',
					title: { tr: 'Test', en: 'Test', de: 'Test' },
					sections: [
						{
							id: 'hero-test',
							type: 'hero',
							props: { variant: 'centered', background: 'plain' },
							content: {
								tr: { headline: 'Test' },
								en: { headline: 'Test' },
								de: { headline: 'Test' }
							}
						}
					]
				}
			}
		]);
		expect(next.pages.map((p) => p.slug)).toContain('test-page');
		expect(next.nav.items.some((item) => item.pageSlug === 'test-page')).toBe(true);

		const removed = applyPatch(next, [{ op: 'remove_page', pageSlug: 'test-page' }]);
		expect(removed.pages.map((p) => p.slug)).not.toContain('test-page');
		expect(removed.nav.items.some((item) => item.pageSlug === 'test-page')).toBe(false);
	});

	it('rejects removing the last page', () => {
		expect(() =>
			applyPatch(site(), [{ op: 'remove_page', pageSlug: 'home' }])
		).toThrow(PatchApplyError);
	});

	it('reorders pages to match given order', () => {
		const base = site();
		const reversed = [...base.pages.map((p) => p.slug)].reverse();
		const next = applyPatch(base, [{ op: 'reorder_pages', order: reversed }]);
		expect(next.pages.map((p) => p.slug)).toEqual(reversed);
	});

	it('rejects reorder with missing slug', () => {
		const slugs = site().pages.map((p) => p.slug).slice(0, -1);
		expect(() =>
			applyPatch(site(), [{ op: 'reorder_pages', order: slugs }])
		).toThrow(PatchApplyError);
	});

	it('sets section style properties', () => {
		const next = applyPatch(site(), [
			{
				op: 'set_section_style',
				pageSlug: 'home',
				sectionId: 'hero-1',
				style: { paddingY: 'compact', marginY: 'standard', contentWidth: 'narrow' }
			}
		]);
		const hero = next.pages[0].sections[0];
		expect(hero.style?.paddingY).toBe('compact');
		expect(hero.style?.marginY).toBe('standard');
		expect(hero.style?.contentWidth).toBe('narrow');
		expect(hero.style?.layout).toBe('full'); // default preserved
	});

	it('partially updates section style without losing existing properties', () => {
		const first = applyPatch(site(), [
			{
				op: 'set_section_style',
				pageSlug: 'home',
				sectionId: 'hero-1',
				style: { paddingY: 'spacious', backgroundColor: '#ff0000' }
			}
		]);
		const second = applyPatch(first, [
			{
				op: 'set_section_style',
				pageSlug: 'home',
				sectionId: 'hero-1',
				style: { marginY: 'compact' }
			}
		]);
		const hero = second.pages[0].sections[0];
		expect(hero.style?.paddingY).toBe('spacious'); // from first
		expect(hero.style?.backgroundColor).toBe('#ff0000'); // from first
		expect(hero.style?.marginY).toBe('compact'); // from second
	});
});

describe('chatEdit (mocked LLM)', () => {
	it('applies returned operations and saves the reply', async () => {
		const run = vi.fn<RunToolCall>().mockResolvedValueOnce(
			asResult({
				reply: 'Başlığı güncelledim.',
				operations: [
					{
						op: 'set_text',
						pageSlug: 'home',
						sectionId: 'hero-1',
						locale: 'tr',
						path: ['headline'],
						value: 'Yeni başlık'
					}
				]
			})
		);
		const result = await chatEdit({ site: site(), message: 'Başlığı değiştir' }, { run });
		expect(result.reply).toBe('Başlığı güncelledim.');
		const hero = result.site.pages[0].sections[0];
		if (hero.type !== 'hero') throw new Error('expected hero');
		expect(hero.content.tr.headline).toBe('Yeni başlık');
	});

	it('repairs once when operations fail to apply, then gives up', async () => {
		const badOps = {
			reply: 'ok',
			operations: [{ op: 'remove_section', pageSlug: 'home', sectionId: 'ghost' }]
		};
		const run = vi
			.fn<RunToolCall>()
			.mockResolvedValueOnce(asResult(badOps))
			.mockResolvedValueOnce(asResult(badOps));
		await expect(chatEdit({ site: site(), message: 'x' }, { run })).rejects.toBeInstanceOf(
			AIInvalidOutputError
		);
		expect(run).toHaveBeenCalledTimes(2);
		// the repair prompt names the failure
		const secondUserContent = run.mock.calls[1][0].messages[0].content as string;
		expect(secondUserContent).toContain('could not be applied');
	});

	it('handles a pure Q&A turn with zero operations', async () => {
		const run = vi
			.fn<RunToolCall>()
			.mockResolvedValueOnce(asResult({ reply: 'Siteniz üç dillidir.', operations: [] }));
		const before = site();
		const result = await chatEdit({ site: before, message: 'Kaç dil var?' }, { run });
		expect(result.reply).toContain('üç');
		expect(result.site).toEqual(before);
	});

	it('applies remove_page from the LLM', async () => {
		const base = site();
		// First add a page so we can remove it later.
		const withExtra = applyPatch(base, [
			{
				op: 'add_page',
				addToNav: true,
				page: {
					slug: 'extra',
					title: { tr: 'Ekstra', en: 'Extra', de: 'Extra' },
					sections: [
						{
							id: 'hero-extra',
							type: 'hero',
							props: { variant: 'centered', background: 'plain' },
							content: {
								tr: { headline: 'Ekstra' },
								en: { headline: 'Extra' },
								de: { headline: 'Extra' }
							}
						}
					]
				}
			}
		]);
		const run = vi.fn<RunToolCall>().mockResolvedValueOnce(
			asResult({
				reply: 'Ekstra sayfasını kaldırdım.',
				operations: [{ op: 'remove_page', pageSlug: 'extra' }]
			})
		);
		const result = await chatEdit({ site: withExtra, message: 'Ekstra sayfayı sil' }, { run });
		expect(result.reply).toBe('Ekstra sayfasını kaldırdım.');
		expect(result.site.pages.map((p) => p.slug)).not.toContain('extra');
	});

	it('applies set_section_style from the LLM', async () => {
		const run = vi.fn<RunToolCall>().mockResolvedValueOnce(
			asResult({
				reply: 'Section padding güncellendi.',
				operations: [
					{
						op: 'set_section_style',
						pageSlug: 'home',
						sectionId: 'hero-1',
						style: { paddingY: 'spacious', minHeight: 'tall' }
					}
				]
			})
		);
		const result = await chatEdit(
			{ site: site(), message: 'Hero bölümünü daha geniş yap' },
			{ run }
		);
		const hero = result.site.pages[0].sections[0];
		expect(hero.style?.paddingY).toBe('spacious');
		expect(hero.style?.minHeight).toBe('tall');
	});
});
