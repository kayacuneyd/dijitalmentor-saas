import { getDraft, getPublished } from '$lib/server/db/repo';
import type { Locale, Page, Site } from '$lib/schema/site';

export type PreviewParityMarkers = {
	title: string;
	siteName: string;
	themePreset: string;
	primaryColor: string;
	sectionOrder: string[];
	heroHeadline: string;
	navLabels: string[];
};

export type PreviewParityResult = {
	ok: boolean;
	mismatches: string[];
	preview: PreviewParityMarkers;
	published: PreviewParityMarkers;
};

function pageFor(site: Site, pageSlug: string): Page {
	return site.pages.find((page) => page.slug === pageSlug) ?? site.pages[0];
}

export function previewParityMarkers(
	site: Site,
	locale: Locale,
	pageSlug: string
): PreviewParityMarkers {
	const page = pageFor(site, pageSlug);
	const hero = page.sections.find((section) => section.type === 'hero');
	return {
		title: page.title[locale],
		siteName: site.settings.siteName,
		themePreset: site.theme.preset,
		primaryColor: site.theme.colors.primary,
		sectionOrder: page.sections.map((section) => `${section.id}:${section.type}`),
		heroHeadline: hero?.type === 'hero' ? hero.content[locale].headline : '',
		navLabels: site.nav.items.map((item) => item.label[locale])
	};
}

export function comparePreviewParity(
	siteId: string,
	locale: Locale,
	pageSlug: string
): PreviewParityResult | null {
	const preview = getDraft(siteId);
	const published = getPublished(siteId);
	if (!preview || !published) return null;

	const previewMarkers = previewParityMarkers(preview, locale, pageSlug);
	const publishedMarkers = previewParityMarkers(published, locale, pageSlug);
	const mismatches = Object.entries(previewMarkers).flatMap(([key, value]) => {
		const publishedValue = publishedMarkers[key as keyof PreviewParityMarkers];
		return JSON.stringify(value) === JSON.stringify(publishedValue) ? [] : [key];
	});

	return {
		ok: mismatches.length === 0,
		mismatches,
		preview: previewMarkers,
		published: publishedMarkers
	};
}
