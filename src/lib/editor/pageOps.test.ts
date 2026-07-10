import { describe, expect, it } from 'vitest';
import { seedSites } from '$lib/seed';
import { siteSchema } from '$lib/schema/site';
import { addPage, removePage } from './pageOps';

function freshSite() {
	return structuredClone(seedSites.law);
}

describe('addPage', () => {
	it('adds a page with a seeded hero section and a nav entry, staying schema-valid', () => {
		const site = freshSite();
		const before = site.pages.length;
		const result = addPage(site, {
			slug: 'about-us',
			titles: { tr: 'Hakkımızda', en: 'About us', de: 'Über uns' }
		});
		expect(result).toEqual({ ok: true, slug: 'about-us' });
		expect(site.pages).toHaveLength(before + 1);
		expect(site.nav.items.some((i) => i.pageSlug === 'about-us')).toBe(true);
		expect(() => siteSchema.parse(site)).not.toThrow();
	});

	it('rejects a non-kebab-case slug', () => {
		const site = freshSite();
		const result = addPage(site, {
			slug: 'About Us',
			titles: { tr: 'a', en: 'a', de: 'a' }
		});
		expect(result.ok).toBe(false);
	});

	it('rejects a duplicate slug', () => {
		const site = freshSite();
		const existing = site.pages[0].slug;
		const result = addPage(site, {
			slug: existing,
			titles: { tr: 'a', en: 'a', de: 'a' }
		});
		expect(result).toEqual({ ok: false, error: `A page with slug "${existing}" already exists.` });
	});

	it('rejects when the page limit (10) is already reached', () => {
		const site = freshSite();
		site.pages = Array.from({ length: 10 }, (_, i) => ({
			...structuredClone(site.pages[0]),
			slug: `page-${i}`
		}));
		const result = addPage(site, { slug: 'one-more', titles: { tr: 'a', en: 'a', de: 'a' } });
		expect(result).toEqual({ ok: false, error: 'Page limit reached (10).' });
	});

	it('requires a title for every locale', () => {
		const site = freshSite();
		const result = addPage(site, { slug: 'partial', titles: { tr: 'Var', en: '', de: 'Da' } });
		expect(result.ok).toBe(false);
	});

	it('does not push a nav entry once nav already has 8 items', () => {
		const site = freshSite();
		site.nav.items = Array.from({ length: 8 }, (_, i) => ({
			pageSlug: site.pages[0].slug,
			label: { tr: `T${i}`, en: `T${i}`, de: `T${i}` }
		}));
		const before = site.nav.items.length;
		addPage(site, { slug: 'no-nav-slot', titles: { tr: 'a', en: 'a', de: 'a' } });
		expect(site.nav.items).toHaveLength(before);
	});
});

describe('removePage', () => {
	it('removes the page and its nav entries, staying schema-valid', () => {
		const site = freshSite();
		addPage(site, { slug: 'extra', titles: { tr: 'Ekstra', en: 'Extra', de: 'Extra' } });
		const before = site.pages.length;

		const result = removePage(site, 'extra');
		expect(result.ok).toBe(true);
		expect(site.pages).toHaveLength(before - 1);
		expect(site.pages.some((p) => p.slug === 'extra')).toBe(false);
		expect(site.nav.items.some((i) => i.pageSlug === 'extra')).toBe(false);
		expect(() => siteSchema.parse(site)).not.toThrow();
	});

	it('refuses to remove the last remaining page', () => {
		const site = freshSite();
		site.pages = [site.pages[0]];
		site.nav.items = [{ pageSlug: site.pages[0].slug, label: site.pages[0].title }];

		const result = removePage(site, site.pages[0].slug);
		expect(result).toEqual({ ok: false, error: 'En az bir sayfa kalmalı.' });
		expect(site.pages).toHaveLength(1);
	});

	it('reports an error for an unknown slug', () => {
		const site = freshSite();
		const result = removePage(site, 'does-not-exist');
		expect(result).toEqual({ ok: false, error: 'Sayfa bulunamadı: "does-not-exist".' });
	});

	it('backfills nav with the new first page when removing the homepage empties nav', () => {
		const site = freshSite();
		const homeSlug = site.pages[0].slug;
		// Isolate to exactly two pages so the "new first page" after removal is unambiguous.
		site.pages = [site.pages[0], { ...structuredClone(site.pages[0]), slug: 'second' }];
		// Only the homepage is in nav — removing it must leave nav non-empty.
		site.nav.items = [{ pageSlug: homeSlug, label: site.pages[0].title }];

		const result = removePage(site, homeSlug);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('unreachable');
		expect(result.nextSlug).toBe('second');
		expect(site.nav.items).toHaveLength(1);
		expect(site.nav.items[0].pageSlug).toBe('second');
		expect(() => siteSchema.parse(site)).not.toThrow();
	});
});
