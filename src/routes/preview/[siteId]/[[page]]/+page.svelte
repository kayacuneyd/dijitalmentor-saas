<script lang="ts">
	import { siteSchema, type Locale, type Site } from '$lib/schema/site';
	import SiteRenderer from '$lib/render/SiteRenderer.svelte';
	import { previewSitePath } from '$lib/siteUrls';

	let { data } = $props();

	/** Draft pushed by the editor via postMessage; server data is the source until then. */
	let pushedDraft = $state<Site | null>(null);
	let structureMode = $state(false);
	let selectedSectionId = $state<string | null>(null);
	const site = $derived(pushedDraft ?? data.site);
	const page = $derived(site.pages.find((p) => p.slug === data.page.slug) ?? site.pages[0]);
	const surfaceLabel = $derived(pushedDraft ? 'Live draft' : 'Saved preview');

	$effect(() => {
		const onMessage = (event: MessageEvent) => {
			if (event.origin !== window.location.origin) return;
			if (event.data?.type === 'saaskaya:draft') {
				// Invalid drafts are never rendered (constitution §2) — silently keep the last good one.
				const parsed = siteSchema.safeParse(event.data.site);
				if (parsed.success) pushedDraft = parsed.data;
				return;
			}
			if (event.data?.type === 'saaskaya:editor-state') {
				structureMode = Boolean(event.data.structureMode);
				selectedSectionId =
					typeof event.data.selectedSectionId === 'string' ? event.data.selectedSectionId : null;
				if (selectedSectionId) {
					const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
					requestAnimationFrame(() => {
						document
							.querySelector(`[data-section-id="${CSS.escape(selectedSectionId!)}"]`)
							?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
					});
				}
			}
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
	class="fixed top-3 left-3 z-50 flex items-center gap-2 rounded-full border border-[var(--sk-line-strong)] bg-[var(--sk-card)]/90 px-3 py-1 text-[11px] font-semibold text-[var(--sk-ink)] shadow-sm backdrop-blur"
>
	<span
		class="inline-block h-1.5 w-1.5 rounded-full {pushedDraft ? 'bg-amber-400' : 'bg-emerald-500'}"
	></span>
	<span>{surfaceLabel}</span>
	{#if data.liveUrl}
		<span class="text-[var(--sk-faint)]">·</span>
		<a
			href={data.liveUrl}
			class="font-medium text-[var(--sk-accent)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sk-focus)]"
		>
			Published v{data.publishedVersion}
		</a>
	{/if}
</div>

<SiteRenderer
	{site}
	{page}
	locale={data.locale}
	{hrefFor}
	{localeHrefFor}
	editorSelectable={structureMode}
	{selectedSectionId}
	onSectionSelect={(sectionId) => {
		selectedSectionId = sectionId;
		window.parent.postMessage(
			{ type: 'saaskaya:section-select', sectionId },
			window.location.origin
		);
	}}
/>
