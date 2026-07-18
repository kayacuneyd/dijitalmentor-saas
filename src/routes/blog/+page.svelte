<script lang="ts">
	import { organizationJsonLd, webSiteJsonLd } from '$lib/seo';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { mergeCopy } from '$lib/publicCopy';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);

	const baseCopy = $derived(
		{
			en: {
				title: 'saaskaya Blog · Notes for professional websites',
				description:
					'Plain-language articles about multilingual websites, domain setup, trust, and publishing for professionals.',
				kicker: 'Blog',
				h1: 'Short notes that help you prepare a better professional website.',
				lead: 'Plain articles on multilingual sites, domains, trust, and publishing without technical detours.',
				read: 'Read article',
				min: 'min read'
			},
			tr: {
				title: 'saaskaya Blog · Profesyonel web siteleri için notlar',
				description:
					'Uzmanlar için çok dilli web sitesi, alan adı, güven ve yayına alma hakkında sade yazılar.',
				kicker: 'Blog',
				h1: 'Web sitesi hazırlarken işine yarayacak kısa notlar.',
				lead: 'Çok dilli site, alan adı, güven ve yayına alma konularını teknik detaya boğmadan anlatıyoruz.',
				read: 'Yazıyı oku',
				min: 'dk okuma'
			},
			de: {
				title: 'saaskaya Blog · Notizen für professionelle Websites',
				description:
					'Einfache Artikel über mehrsprachige Websites, Domains, Vertrauen und Veröffentlichung für Fachleute.',
				kicker: 'Blog',
				h1: 'Kurze Notizen für eine bessere professionelle Website.',
				lead: 'Mehrsprachige Websites, Domains, Vertrauen und Veröffentlichung ohne technische Umwege erklärt.',
				read: 'Artikel lesen',
				min: 'Min. Lesezeit'
			}
		}[locale]
	);
	const copy = $derived(mergeCopy(baseCopy, data.copyOverrides?.[locale]));
</script>

<SeoHead
	{locale}
	path="/blog"
	title={copy.title}
	description={copy.description}
	jsonLd={[
		organizationJsonLd(data.platformBranding?.logoUrl),
		webSiteJsonLd(locale, data.platformBranding?.logoUrl)
	]}
/>

<PublicShell
	{locale}
	currentPath="/blog"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / blog"
>
	<MarketingSection as="section" class="flex flex-col gap-8 py-10 sm:py-14">
		<div class="max-w-3xl">
			<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.kicker}</div>
			<h1 class="sk-display mt-4 text-4xl leading-tight sm:text-[46px]">{copy.h1}</h1>
			<p class="mt-4 text-[17px] leading-8 text-[var(--sk-muted)]">{copy.lead}</p>
		</div>

		<div class="grid gap-4 lg:grid-cols-3">
			{#each data.posts as post (post.slug)}
				<article class="sk-card flex min-h-full flex-col p-5">
					{#if post.coverImageUrl}
						<img
							src={post.coverImageUrl}
							alt={post.coverAlt ?? post.title[locale]}
							class="mb-4 aspect-[16/9] w-full rounded-[10px] border border-[var(--sk-line)] object-cover"
							loading="lazy"
							decoding="async"
						/>
					{/if}
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
					<FlowbiteButton
						href={l(`/blog/${post.slug}`)}
						variant="secondary"
						size="sm"
						class="mt-5 w-fit"
					>
						{copy.read}
					</FlowbiteButton>
				</article>
			{:else}
				<div class="sk-card p-5 text-sm text-[var(--sk-muted)] lg:col-span-3">
					No published articles yet.
				</div>
			{/each}
		</div>
	</MarketingSection>
</PublicShell>
