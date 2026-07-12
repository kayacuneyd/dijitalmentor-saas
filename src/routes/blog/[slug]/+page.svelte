<script lang="ts">
	import BlogBody from '$lib/blog/BlogBody.svelte';
	import { withLocale, type Locale } from '$lib/i18n';
	import { absoluteUrl, organizationJsonLd, SITE_ORIGIN } from '$lib/seo';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const post = $derived(data.post);
	const l = (path: string) => withLocale(locale, path);

	const copy = $derived(
		{
			en: { home: 'Home', blog: 'Blog', min: 'min read' },
			tr: { home: 'Ana sayfa', blog: 'Blog', min: 'dk okuma' },
			de: { home: 'Start', blog: 'Blog', min: 'Min. Lesezeit' }
		}[locale]
	);

	const seoImage = $derived(
		post.coverImageUrl
			? post.coverImageUrl.startsWith('http')
				? post.coverImageUrl
				: `${SITE_ORIGIN}${post.coverImageUrl}`
			: undefined
	);

	const postJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.seoTitle[locale] || post.title[locale],
		description: post.seoDescription[locale] || post.description[locale],
		datePublished: post.date,
		dateModified: post.updatedDate,
		inLanguage: locale,
		url: absoluteUrl(locale, `/blog/${post.slug}`),
		image: seoImage,
		publisher: organizationJsonLd(),
		author: {
			'@type': 'Person',
			name: post.authorName,
			url: 'https://kayacuneyt.com'
		}
	});

	const breadcrumbJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: copy.home,
				item: absoluteUrl(locale, '/')
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: copy.blog,
				item: absoluteUrl(locale, '/blog')
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: post.title[locale],
				item: absoluteUrl(locale, `/blog/${post.slug}`)
			}
		]
	});
</script>

<SeoHead
	{locale}
	path={`/blog/${post.slug}`}
	title={`${post.seoTitle[locale] || post.title[locale]} · saaskaya Blog`}
	description={post.seoDescription[locale] || post.description[locale]}
	type="article"
	image={seoImage}
	jsonLd={[organizationJsonLd(), postJsonLd, breadcrumbJsonLd]}
/>

<PublicShell
	{locale}
	currentPath="/blog"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / blog"
>
	<MarketingSection class="py-10 sm:py-14">
		<article class="mx-auto max-w-5xl">
			<nav
				aria-label="Breadcrumb"
				class="flex flex-wrap items-center gap-2 text-sm text-[var(--sk-muted)]"
			>
				<a href={l('/')} class="sk-link">{copy.home}</a>
				<span class="text-[var(--sk-faint)]">/</span>
				<a href={l('/blog')} class="sk-link">{copy.blog}</a>
				<span class="text-[var(--sk-faint)]">/</span>
				<span aria-current="page" class="max-w-full truncate text-[var(--sk-faint)]">
					{post.title[locale]}
				</span>
			</nav>

			<header class="mt-8 max-w-3xl">
				<div class="flex flex-wrap items-center gap-2">
					<StatusPill>{post.category[locale]}</StatusPill>
					<span class="text-xs text-[var(--sk-faint)]">{post.readingMinutes} {copy.min}</span>
					<span class="text-xs text-[var(--sk-faint)]">{post.date}</span>
				</div>
				<h1 class="sk-display mt-5 text-4xl leading-tight sm:text-[46px]">{post.title[locale]}</h1>
				<p class="mt-4 text-[17px] leading-8 text-[var(--sk-muted)]">{post.description[locale]}</p>
			</header>

			{#if post.coverImageUrl}
				<img
					src={post.coverImageUrl}
					alt={post.coverAlt ?? post.title[locale]}
					class="mt-8 aspect-[16/8] w-full rounded-[12px] border border-[var(--sk-line)] object-cover"
					loading="eager"
					decoding="async"
				/>
			{/if}

			<div class="mt-10 max-w-3xl">
				<BlogBody doc={post.body[locale]} />
			</div>
		</article>
	</MarketingSection>
</PublicShell>
