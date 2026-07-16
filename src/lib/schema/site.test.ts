import { describe, expect, it } from 'vitest';
import { DEFAULT_LAYOUT, siteSchema, sectionSchema, sectionStyleSchema } from './site';
import { seedSites } from '$lib/seed';

/** Deep-clone a seed so each test can mutate it freely. */
const clone = <T>(value: T): T => structuredClone(value);

describe('siteSchema — good fixtures', () => {
	it.each(Object.entries(seedSites))('accepts the hand-authored %s seed', (_niche, site) => {
		const result = siteSchema.safeParse(site);
		expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true);
	});

	it('fills defaulted props (variant, background, radius, badge)', () => {
		const section = sectionSchema.parse({
			id: 'hero-x',
			type: 'hero',
			props: {},
			content: {
				tr: { headline: 'Merhaba' },
				en: { headline: 'Hello' },
				de: { headline: 'Hallo' }
			}
		});
		expect(section.props).toMatchObject({ variant: 'centered', background: 'plain' });
	});

	it('keeps section style schema-safe while defaulting new layouts to full width', () => {
		expect(DEFAULT_LAYOUT.container.width).toBe('full');
		expect(sectionStyleSchema.parse({ backgroundColor: '#f8edc9' })).toMatchObject({
			layout: 'full',
			backgroundColor: '#f8edc9',
			paddingY: 'standard',
			contentWidth: 'wide'
		});
		expect(sectionStyleSchema.safeParse({ backgroundColor: 'papayawhip' }).success).toBe(false);
	});

	it('accepts a profession collection with safe link and media fields', () => {
		const result = sectionSchema.safeParse({
			id: 'projects-1',
			type: 'collection',
			props: { kind: 'projects', variant: 'cards' },
			content: {
				tr: { title: 'Projeler', items: [{ title: 'Klinik web sitesi', href: '#contact' }] },
				en: { title: 'Projects', items: [{ title: 'Clinic website', href: '#contact' }] },
				de: { title: 'Projekte', items: [{ title: 'Website', href: '#contact' }] }
			}
		});
		expect(result.success).toBe(true);
	});

	it.each(['downloads', 'media-appearances', 'case-studies', 'positions', 'academic-service'] as const)(
		'accepts the P2 collection kind %s',
		(kind) => {
			const result = sectionSchema.safeParse({
				id: `${kind}-1`,
				type: 'collection',
				props: { kind },
				content: {
					tr: { title: 'İçerikler', items: [{ title: 'Bir kayıt' }] },
					en: { title: 'Content', items: [{ title: 'One item' }] },
					de: { title: 'Inhalte', items: [{ title: 'Eintrag' }] }
				}
			});
			expect(result.success).toBe(true);
		}
	);
});

describe('siteSchema — malformed AI output is rejected', () => {
	it('rejects an unknown section type', () => {
		const site = clone(seedSites.law);
		// simulate the AI inventing a block outside the fixed set
		(site.pages[0].sections[0] as { type: string }).type = 'mega-slider';
		expect(siteSchema.safeParse(site).success).toBe(false);
	});

	it('rejects content with a missing locale', () => {
		const site = clone(seedSites.psych);
		delete (site.pages[0].sections[0].content as Record<string, unknown>).de;
		expect(siteSchema.safeParse(site).success).toBe(false);
	});

	it('rejects unknown keys (strict objects)', () => {
		const site = clone(seedSites.law);
		(site.pages[0].sections[0].props as Record<string, unknown>).customCss = '.x{color:red}';
		expect(siteSchema.safeParse(site).success).toBe(false);
	});

	it('rejects an invalid theme color', () => {
		const site = clone(seedSites.dental);
		site.theme.colors.primary = 'cornflowerblue';
		expect(siteSchema.safeParse(site).success).toBe(false);
	});

	it('rejects a defaultLocale that is not in locales', () => {
		const site = clone(seedSites.psych);
		site.locales = ['en', 'de'];
		site.defaultLocale = 'tr';
		expect(siteSchema.safeParse(site).success).toBe(false);
	});

	it('rejects duplicate page slugs', () => {
		const site = clone(seedSites.law);
		site.pages.push(clone(site.pages[0]));
		expect(siteSchema.safeParse(site).success).toBe(false);
	});

	it('rejects nav items pointing to unknown pages', () => {
		const site = clone(seedSites.dental);
		site.nav.items[0].pageSlug = 'does-not-exist';
		expect(siteSchema.safeParse(site).success).toBe(false);
	});

	it('rejects a page with no sections', () => {
		const site = clone(seedSites.psych);
		site.pages[0].sections = [];
		expect(siteSchema.safeParse(site).success).toBe(false);
	});

	it('rejects non-object garbage', () => {
		expect(siteSchema.safeParse('<html>hi</html>').success).toBe(false);
		expect(siteSchema.safeParse(null).success).toBe(false);
		expect(siteSchema.safeParse([]).success).toBe(false);
	});
});
