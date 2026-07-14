import { LOCALES, type Locale, type Page, type Site } from '$lib/schema/site';
import { t } from '$lib/i18n/catalog';
import type { Locale as AppLocale } from '$lib/i18n';

/**
 * Pure page add/remove mutations, extracted from `PagesTab.svelte` so they're
 * unit-testable (vitest excludes `*.svelte.test.ts` — see draft store/saveTracker
 * for the same reasoning) and shared between the Pages tab UI and any future
 * chat-driven page edit. Callers apply the mutation via `DraftStore.update()`.
 * `locale` here is the app-UI locale (the person using the editor), not
 * `store.editLocale` (which content language is being edited) — the two are
 * unrelated concepts that happen to share the same 3-value type.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_PAGES = 10;

export type AddPageInput = { slug: string; titles: Record<Locale, string> };
export type AddPageResult = { ok: true; slug: string } | { ok: false; error: string };

export function addPage(site: Site, input: AddPageInput, locale: AppLocale): AddPageResult {
	const slug = input.slug.trim();
	if (!SLUG_RE.test(slug)) {
		return { ok: false, error: t('editor.pageOps.slugInvalid', locale) };
	}
	if (site.pages.some((p) => p.slug === slug)) {
		return { ok: false, error: t('editor.pageOps.slugTaken', locale, { slug }) };
	}
	if (site.pages.length >= MAX_PAGES) {
		return { ok: false, error: t('editor.pageOps.pageLimitReached', locale, { max: MAX_PAGES }) };
	}
	if (LOCALES.some((l) => !input.titles[l]?.trim())) {
		return { ok: false, error: t('editor.pageOps.titleRequiredAllLocales', locale) };
	}

	const title = Object.fromEntries(LOCALES.map((l) => [l, input.titles[l].trim()])) as Record<
		Locale,
		string
	>;
	const newPage: Page = {
		slug,
		title,
		sections: [
			{
				id: `hero-${slug}`,
				type: 'hero',
				props: { variant: 'centered', background: 'plain' },
				content: Object.fromEntries(LOCALES.map((l) => [l, { headline: title[l] }])) as Record<
					Locale,
					{ headline: string }
				>
			}
		]
	};
	site.pages.push(newPage);
	if (site.nav.items.length < 8) {
		site.nav.items.push({ pageSlug: slug, label: { ...title } });
	}
	return { ok: true, slug };
}

export type RemovePageResult = { ok: true; nextSlug: string } | { ok: false; error: string };

/** Refuses at 1 page (schema minimum). Backfills nav with the new first page if
 *  removing the slug emptied it — `nav.items` requires at least 1 entry and every
 *  entry must point at an existing page, or the next autosave PUT 400s. */
export function removePage(site: Site, slug: string, locale: AppLocale): RemovePageResult {
	if (site.pages.length <= 1) {
		return { ok: false, error: t('editor.pageOps.atLeastOnePage', locale) };
	}
	if (!site.pages.some((p) => p.slug === slug)) {
		return { ok: false, error: t('editor.pageOps.pageNotFound', locale, { slug }) };
	}

	site.pages = site.pages.filter((p) => p.slug !== slug);
	site.nav.items = site.nav.items.filter((item) => item.pageSlug !== slug);
	const nextPage = site.pages[0];
	if (site.nav.items.length === 0) {
		site.nav.items.push({ pageSlug: nextPage.slug, label: { ...nextPage.title } });
	}
	return { ok: true, nextSlug: nextPage.slug };
}
