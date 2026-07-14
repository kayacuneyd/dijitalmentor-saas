<script lang="ts">
	import { siteSchema, type Locale, type Site } from '$lib/schema/site';
	import SiteRenderer from '$lib/render/SiteRenderer.svelte';
	import { previewSitePath } from '$lib/siteUrls';

	let { data } = $props();

	/** Draft pushed by the editor via postMessage; server data is the source until then. */
	let pushedDraft = $state<Site | null>(null);
	const site = $derived(pushedDraft ?? data.site);
	const page = $derived(site.pages.find((p) => p.slug === data.page.slug) ?? site.pages[0]);
	const surfaceLabel = $derived(pushedDraft ? 'Live draft' : 'Saved preview');

	$effect(() => {
		const onMessage = (event: MessageEvent) => {
			if (event.origin !== window.location.origin) return;
			if (event.data?.type !== 'saaskaya:draft') return;
			// Invalid drafts are never rendered (constitution §2) — silently keep the last good one.
			const parsed = siteSchema.safeParse(event.data.site);
			if (parsed.success) pushedDraft = parsed.data;
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	});

	const hrefFor = (pageSlug: string) => previewSitePath(data.site.id, pageSlug, data.locale);
	const localeHrefFor = (locale: Locale) => previewSitePath(data.site.id, data.page.slug, locale);
</script>

<svelte:head>
	<title>{page.title[data.locale]} · {site.settings.siteName}</title>
	{#if site.settings.seo?.description}
		<meta name="description" content={site.settings.seo.description[data.locale]} />
	{/if}
</svelte:head>

<div
	class="fixed top-3 left-3 z-50 flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#171614] shadow-sm backdrop-blur"
>
	<span>{surfaceLabel}</span>
	{#if data.liveUrl}
		<a href={data.liveUrl} class="text-[#2f6f6a] underline-offset-2 hover:underline">
			Published v{data.publishedVersion}
		</a>
	{/if}
</div>

<SiteRenderer {site} {page} locale={data.locale} {hrefFor} {localeHrefFor} />
