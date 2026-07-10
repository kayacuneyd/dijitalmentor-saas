<script lang="ts">
	import { DEFAULT_OG_IMAGE, absoluteUrl, seoAlternates, stringifyJsonLd } from '$lib/seo';
	import type { Locale } from '$lib/i18n';

	let {
		locale,
		path,
		title,
		description,
		type = 'website',
		image = DEFAULT_OG_IMAGE,
		jsonLd = []
	}: {
		locale: Locale;
		path: string;
		title: string;
		description: string;
		type?: 'website' | 'article';
		image?: string;
		jsonLd?: unknown[];
	} = $props();

	const canonical = $derived(absoluteUrl(locale, path));
	const alternates = $derived(seoAlternates(path));
	const jsonLdScripts = $derived(
		jsonLd
			.map((item) => `<script type="application/ld+json">${stringifyJsonLd(item)}<${'/'}script>`)
			.join('\n')
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#each alternates as alternate (`${alternate.locale}-${alternate.href}`)}
		<link rel="alternate" hreflang={alternate.locale} href={alternate.href} />
	{/each}
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:locale" content={locale} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	{@html jsonLdScripts}
</svelte:head>
