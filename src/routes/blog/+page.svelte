<script lang="ts">
	import { blogPosts } from '$lib/public/blog';
	import { organizationJsonLd, webSiteJsonLd } from '$lib/seo';
	import MessageBubble from '$lib/ui/MessageBubble.svelte';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);

	const copy = $derived(
		{
			en: {
				title: 'saaskaya Blog · AI-assisted website building',
				description:
					'Plain-language articles about AI-assisted websites, multilingual launch, and safer web publishing for professionals.',
				kicker: 'Blog',
				h1: 'Practical notes for launching a better professional website.',
				lead: 'Short, non-technical articles for professionals evaluating multilingual websites and AI-assisted launch workflows.',
				read: 'Read article',
				min: 'min read'
			},
			tr: {
				title: 'saaskaya Blog · AI destekli web sitesi oluşturma',
				description:
					'Uzmanlar için AI destekli web siteleri, çok dilli lansman ve daha güvenli yayınlama hakkında sade yazılar.',
				kicker: 'Blog',
				h1: 'Daha iyi bir profesyonel web sitesi yayına almak için pratik notlar.',
				lead: 'Çok dilli web sitesi ve AI destekli lansman akışını değerlendiren uzmanlar için kısa, teknik olmayan yazılar.',
				read: 'Yazıyı oku',
				min: 'dk okuma'
			},
			de: {
				title: 'saaskaya Blog · AI-gestützter Website-Aufbau',
				description:
					'Einfache Artikel über AI-gestützte Websites, mehrsprachigen Launch und sichereres Publishing für Fachleute.',
				kicker: 'Blog',
				h1: 'Praktische Notizen für eine bessere professionelle Website.',
				lead: 'Kurze, nicht-technische Artikel für Fachleute, die mehrsprachige Websites und AI-gestützte Launch-Workflows bewerten.',
				read: 'Artikel lesen',
				min: 'Min. Lesezeit'
			}
		}[locale]
	);
</script>

<SeoHead
	{locale}
	path="/blog"
	title={copy.title}
	description={copy.description}
	jsonLd={[organizationJsonLd(), webSiteJsonLd(locale)]}
/>

<PublicShell
	{locale}
	currentPath="/blog"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / blog"
>
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-10 sm:py-14">
		<div class="max-w-3xl">
			<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.kicker}</div>
			<h1 class="sk-display mt-4 text-4xl leading-tight sm:text-[46px]">{copy.h1}</h1>
			<p class="mt-4 text-[17px] leading-8 text-[var(--sk-muted)]">{copy.lead}</p>
		</div>

		<div class="grid gap-4 lg:grid-cols-3">
			{#each blogPosts as post (post.slug)}
				<article class="sk-card flex min-h-full flex-col p-5">
					<div class="flex flex-wrap items-center gap-2">
						<StatusPill>{post.category[locale]}</StatusPill>
						<span class="text-xs text-[var(--sk-faint)]">{post.readingMinutes} {copy.min}</span>
					</div>
					<h2 class="mt-4 text-xl font-semibold leading-snug">
						<a class="hover:underline" href={l(`/blog/${post.slug}`)}>{post.title[locale]}</a>
					</h2>
					<p class="mt-3 flex-1 text-sm leading-7 text-[var(--sk-muted)]">
						{post.description[locale]}
					</p>
					<a href={l(`/blog/${post.slug}`)} class="sk-btn sk-btn-secondary sk-btn-sm mt-5 w-fit">
						{copy.read}
					</a>
				</article>
			{/each}
		</div>
	</section>
	<MessageBubble {locale} userEmail={data.user?.email ?? ''} />
</PublicShell>
