<script lang="ts">
	import { withLocale, type Locale } from '$lib/i18n';
	import { absoluteUrl, organizationJsonLd } from '$lib/seo';
	import MessageBubble from '$lib/ui/MessageBubble.svelte';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const post = $derived(data.post);
	const l = (path: string) => withLocale(locale, path);

	const copy = $derived(
		{
			en: { blog: 'Blog', min: 'min read', back: 'All articles' },
			tr: { blog: 'Blog', min: 'dk okuma', back: 'Tüm yazılar' },
			de: { blog: 'Blog', min: 'Min. Lesezeit', back: 'Alle Artikel' }
		}[locale]
	);

	const postJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title[locale],
		description: post.description[locale],
		datePublished: post.date,
		dateModified: post.date,
		inLanguage: locale,
		url: absoluteUrl(locale, `/blog/${post.slug}`),
		publisher: organizationJsonLd(),
		author: {
			'@type': 'Person',
			name: 'Cüneyt Kaya',
			url: 'https://kayacuneyt.com'
		}
	});
</script>

<SeoHead
	{locale}
	path={`/blog/${post.slug}`}
	title={`${post.title[locale]} · saaskaya Blog`}
	description={post.description[locale]}
	type="article"
	jsonLd={[organizationJsonLd(), postJsonLd]}
/>

<PublicShell
	{locale}
	currentPath="/blog"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / blog"
>
	<article class="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
		<a href={l('/blog')} class="sk-link text-sm text-[var(--sk-muted)]">← {copy.back}</a>
		<div class="mt-6 flex flex-wrap items-center gap-2">
			<StatusPill>{post.category[locale]}</StatusPill>
			<span class="text-xs text-[var(--sk-faint)]">{post.readingMinutes} {copy.min}</span>
		</div>
		<h1 class="sk-display mt-5 text-4xl leading-tight sm:text-[46px]">{post.title[locale]}</h1>
		<p class="mt-4 text-[17px] leading-8 text-[var(--sk-muted)]">{post.description[locale]}</p>
		<div class="mt-10 space-y-8">
			{#each post.sections[locale] as section (section.heading)}
				<section>
					<h2 class="text-xl font-semibold">{section.heading}</h2>
					<p class="mt-3 text-[15px] leading-8 text-[var(--sk-muted)]">{section.body}</p>
				</section>
			{/each}
		</div>
	</article>
	<MessageBubble {locale} userEmail={data.user?.email ?? ''} />
</PublicShell>
