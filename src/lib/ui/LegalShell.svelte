<script lang="ts">
	import { page } from '$app/state';
	import { stripLocale, withLocale, type Locale } from '$lib/i18n';
	import MarketingSection from './MarketingSection.svelte';
	import PublicBreadcrumb from './PublicBreadcrumb.svelte';
	import PublicShell from './PublicShell.svelte';

	let {
		children,
		title,
		kicker = 'Yasal',
		updated = '9 Temmuz 2026'
	}: {
		children: import('svelte').Snippet;
		title: string;
		kicker?: string;
		updated?: string;
	} = $props();

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? 'tr');
	const l = (path: string) => withLocale(locale, path);
	const currentPath = $derived(stripLocale(page.url.pathname));
	const labels = $derived(
		{
			en: {
				home: 'Home',
				legal: 'Legal',
				updated: 'Last updated',
				docs: 'Legal documents',
				privacy: 'Privacy',
				terms: 'Terms',
				kvkk: 'KVKK',
				acceptable: 'Acceptable Use',
				refund: 'Refund',
				disclaimer: 'Disclaimer'
			},
			tr: {
				home: 'Ana sayfa',
				legal: 'Yasal',
				updated: 'Son güncelleme',
				docs: 'Yasal dokümanlar',
				privacy: 'Gizlilik',
				terms: 'Şartlar',
				kvkk: 'KVKK',
				acceptable: 'Kabul Edilebilir Kullanım',
				refund: 'İade',
				disclaimer: 'Sorumluluk reddi'
			},
			de: {
				home: 'Start',
				legal: 'Rechtliches',
				updated: 'Zuletzt aktualisiert',
				docs: 'Rechtliche Dokumente',
				privacy: 'Datenschutz',
				terms: 'Bedingungen',
				kvkk: 'KVKK',
				acceptable: 'Zulässige Nutzung',
				refund: 'Erstattung',
				disclaimer: 'Haftungsausschluss'
			}
		}[locale]
	);
	const documents = $derived([
		[labels.privacy, '/legal/privacy'],
		[labels.terms, '/legal/terms'],
		[labels.kvkk, '/legal/kvkk'],
		[labels.acceptable, '/legal/acceptable-use'],
		[labels.refund, '/legal/refund'],
		[labels.disclaimer, '/legal/disclaimer']
	]);
</script>

<svelte:head>
	<title>{title} · saaskaya</title>
	<meta name="robots" content="index,follow" />
</svelte:head>

<PublicShell {locale} currentPath="/legal" label="saaskaya.com / legal">
	<MarketingSection class="py-10 sm:py-14">
		<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
			<article class="min-w-0">
				<PublicBreadcrumb
					{locale}
					items={[
						{ label: labels.home, href: '/' },
						{ label: labels.legal, href: '/legal/privacy' },
						{ label: title }
					]}
				/>
				<div class="sk-mono mt-6 text-[10.5px] text-[var(--sk-faint)]">{kicker}</div>
				<h1 class="sk-display mt-2 text-4xl leading-tight sm:text-[44px]">{title}</h1>
				<p class="mt-3 text-sm leading-6 text-[var(--sk-muted)]">
					{labels.updated}: {updated}
				</p>
				<div class="sk-legal mt-9">
					{@render children()}
				</div>
			</article>

			<aside class="sk-soft p-4 lg:sticky lg:top-6">
				<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{labels.docs}</div>
				<nav class="mt-3 flex flex-col gap-1" aria-label={labels.docs}>
					{#each documents as [label, href] (href)}
						<a
							href={l(href)}
							class="rounded px-2.5 py-2 text-sm transition {currentPath === href
								? 'bg-white text-[var(--sk-ink)] shadow-[0_1px_2px_rgb(23_22_20/.04)]'
								: 'text-[var(--sk-muted)] hover:bg-white/55 hover:text-[var(--sk-ink)]'}"
							aria-current={currentPath === href ? 'page' : undefined}
						>
							{label}
						</a>
					{/each}
				</nav>
			</aside>
		</div>
	</MarketingSection>
</PublicShell>

<style>
	.sk-legal :global(h2) {
		margin-top: 2rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--sk-ink);
	}
	.sk-legal :global(h3) {
		margin-top: 1.25rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--sk-ink);
	}
	.sk-legal :global(p) {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.65;
		color: var(--sk-muted);
	}
	.sk-legal :global(ul) {
		margin-top: 0.5rem;
		padding-left: 1.25rem;
	}
	.sk-legal :global(li) {
		margin-top: 0.35rem;
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--sk-muted);
	}
	.sk-legal :global(a) {
		color: var(--sk-ink);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.sk-legal :global(.sk-callout) {
		margin-top: 1rem;
		border: 1px solid var(--sk-line);
		border-radius: 10px;
		background: var(--sk-shell);
		padding: 0.75rem 1rem;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: var(--sk-muted);
	}
	.sk-legal :global(.sk-callout strong) {
		color: var(--sk-ink);
	}
</style>
