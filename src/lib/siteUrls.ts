import type { Locale, Site } from '$lib/schema/site';

export function publicSitePath(site: Site, locale: Locale, pageSlug: string): string {
	const homeSlug = site.pages[0]?.slug ?? pageSlug;
	const prefix = locale === site.defaultLocale ? '' : `/${locale}`;
	const pagePath = pageSlug === homeSlug ? '' : `/${pageSlug}`;
	return prefix + pagePath || '/';
}

export function previewSitePath(
	siteId: string,
	pageSlug: string,
	locale: Locale,
	source: 'live' | 'persisted' = 'persisted'
): string {
	return `/preview/${siteId}/${pageSlug}?locale=${locale}&source=${source}`;
}
