<script lang="ts">
	import type { Locale } from '$lib/schema/site';
	import SiteRenderer from '$lib/render/SiteRenderer.svelte';

	let { data, form } = $props();

	const homeSlug = $derived(data.site.pages[0].slug);

	function pathFor(locale: Locale, pageSlug: string): string {
		const prefix = locale === data.site.defaultLocale ? '' : `/${locale}`;
		const path = pageSlug === homeSlug ? '' : `/${pageSlug}`;
		return prefix + path || '/';
	}

	const hrefFor = (pageSlug: string) => pathFor(data.locale, pageSlug);
	const localeHrefFor = (locale: Locale) => pathFor(locale, data.page.slug);
</script>

<svelte:head>
	<title>{data.page.title[data.locale]} · {data.site.settings.siteName}</title>
	{#if data.site.settings.seo}
		<meta name="description" content={data.site.settings.seo.description[data.locale]} />
	{/if}
</svelte:head>

<SiteRenderer
	site={data.site}
	page={data.page}
	locale={data.locale}
	{hrefFor}
	{localeHrefFor}
	mode="public"
	contactState={form?.contact ?? 'idle'}
/>
