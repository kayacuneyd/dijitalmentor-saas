<script lang="ts">
	import BlogBody from '$lib/blog/BlogBody.svelte';
	import { withLocale, type Locale } from '$lib/i18n';
	import { baseLocaleForPublic } from '$lib/publicCopy';
	import { absoluteUrl, organizationJsonLd, SITE_ORIGIN } from '$lib/seo';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();
	const publicLocale = $derived(data.publicLocale ?? data.locale);
	const locale: Locale = $derived(baseLocaleForPublic(publicLocale));
	const post = $derived(data.post);
	const l = (path: string) => withLocale(publicLocale, path);
	const postTitle = $derived(post.title[publicLocale] || post.title[locale]);
	const postDescription = $derived(post.description[publicLocale] || post.description[locale]);

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
		headline: post.seoTitle[publicLocale] || postTitle,
		description: post.seoDescription[publicLocale] || postDescription,
		datePublished: post.date,
		dateModified: post.updatedDate,
		inLanguage: publicLocale,
		url: absoluteUrl(publicLocale, `/blog/${post.slug}`),
		image: seoImage,
		publisher: organizationJsonLd(data.platformBranding?.logoUrl),
		author: {
			'@type': 'Organization',
			name: post.authorName,
			url: 'https://saaskaya.com'
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
				item: absoluteUrl(publicLocale, '/')
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: copy.blog,
				item: absoluteUrl(publicLocale, '/blog')
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: postTitle,
				item: absoluteUrl(publicLocale, `/blog/${post.slug}`)
			}
		]
	});
</script>

<SeoHead
	{locale}
	path={`/blog/${post.slug}`}
	title={`${post.seoTitle[publicLocale] || postTitle} · saaskaya Blog`}
	description={post.seoDescription[publicLocale] || postDescription}
	type="article"
	image={seoImage}
	jsonLd={[organizationJsonLd(data.platformBranding?.logoUrl), postJsonLd, breadcrumbJsonLd]}
/>

<PublicShell
	{locale}
	{publicLocale}
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
					{postTitle}
				</span>
			</nav>

			<header class="mt-8 max-w-3xl">
				<div class="flex flex-wrap items-center gap-2">
					<StatusPill>{post.category[publicLocale] || post.category[locale]}</StatusPill>
					<span class="text-xs text-[var(--sk-faint)]">{post.readingMinutes} {copy.min}</span>
					<span class="text-xs text-[var(--sk-faint)]">{post.date}</span>
				</div>
				<h1 class="sk-display mt-5 text-4xl leading-tight sm:text-[46px]">{postTitle}</h1>
				<p class="mt-4 text-[17px] leading-8 text-[var(--sk-muted)]">{postDescription}</p>
			</header>

			{#if post.coverImageUrl}
				<img
					src={post.coverImageUrl}
					alt={post.coverAlt[publicLocale] || post.coverAlt[locale] || postTitle}
					class="mt-8 aspect-[16/8] w-full rounded-[12px] border border-[var(--sk-line)] object-cover"
					loading="eager"
					decoding="async"
				/>
			{/if}

			<div class="mt-10 max-w-3xl">
				<BlogBody doc={post.body[publicLocale] || post.body[locale]} />
			</div>
		</article>
	</MarketingSection>
</PublicShell>
