<script lang="ts">
	import type { Locale } from '$lib/schema/site';
	import SiteRenderer from '$lib/render/SiteRenderer.svelte';
	import { publicSitePath } from '$lib/siteUrls';

	let { data, form } = $props();

	const hrefFor = (pageSlug: string) => publicSitePath(data.site, data.locale, pageSlug);
	const localeHrefFor = (locale: Locale) => publicSitePath(data.site, locale, data.page.slug);
</script>

<svelte:head>
	<title
		>{data.page.meta?.title ??
			`${data.page.title[data.locale]} · ${data.site.settings.siteName}`}</title
	>
	{#if data.site.settings.seo?.description}
		<meta
			name="description"
			content={data.page.meta?.description ?? data.site.settings.seo.description[data.locale]}
		/>
	{/if}
	<link rel="canonical" href={data.canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={data.canonicalUrl} />
	<meta property="og:title" content={data.page.meta?.title ?? data.page.title[data.locale]} />
	<meta
		property="og:description"
		content={data.page.meta?.description ??
			data.site.settings.seo?.description?.[data.locale] ??
			data.page.title[data.locale]}
	/>
	{#if data.site.settings.seo?.ogImage}<meta
			property="og:image"
			content={data.site.settings.seo.ogImage}
		/>{/if}
	<meta
		name="twitter:card"
		content={data.site.settings.seo?.twitterCard ?? 'summary_large_image'}
	/>
	<meta name="twitter:title" content={data.page.meta?.title ?? data.page.title[data.locale]} />
	<meta
		name="twitter:description"
		content={data.page.meta?.description ??
			data.site.settings.seo?.description?.[data.locale] ??
			data.page.title[data.locale]}
	/>
</svelte:head>

{#if data.publishedVersion}
	<div
		class="fixed top-3 left-3 z-50 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#171614] shadow-sm backdrop-blur"
	>
		Published v{data.publishedVersion}
	</div>
{/if}

<SiteRenderer
	site={data.site}
	page={data.page}
	locale={data.locale}
	{hrefFor}
	{localeHrefFor}
	mode="public"
	contactState={form?.contact ?? 'idle'}
/>
