<script lang="ts">
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import { withLocale, type Locale } from '$lib/i18n';

	let {
		locale,
		currentPath = '/',
		userEmail = null
	}: {
		locale: Locale;
		currentPath?: string;
		userEmail?: string | null;
	} = $props();

	const l = (path: string) => withLocale(locale, path);
	const normalizedCurrent = $derived(currentPath === '' ? '/' : currentPath);
	const isActive = (path: string) =>
		path === '/'
			? normalizedCurrent === '/'
			: normalizedCurrent === path || normalizedCurrent.startsWith(`${path}/`);

	const labels = $derived(
		{
			en: {
				nav: [
					['Home', '/'],
					['Pricing', '/pricing'],
					['About', '/about'],
					['Blog', '/blog'],
					['Contact', '/contact']
				],
				login: 'Login',
				dashboard: 'Dashboard',
				start: 'Start beta'
			},
			tr: {
				nav: [
					['Ana sayfa', '/'],
					['Fiyat', '/pricing'],
					['Hakkımızda', '/about'],
					['Blog', '/blog'],
					['İletişim', '/contact']
				],
				login: 'Giriş',
				dashboard: 'Panel',
				start: 'Betaya başla'
			},
			de: {
				nav: [
					['Start', '/'],
					['Preise', '/pricing'],
					['Über uns', '/about'],
					['Blog', '/blog'],
					['Kontakt', '/contact']
				],
				login: 'Login',
				dashboard: 'Dashboard',
				start: 'Beta starten'
			}
		}[locale]
	);
</script>

<header class="border-b border-[var(--sk-line)] bg-[rgb(251_250_247/.86)]">
	<div
		class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
	>
		<div class="flex min-w-0 items-center justify-between gap-3">
			<BrandMark href={l('/')} compact />
			<div class="lg:hidden">
				<LanguageSwitcher {locale} />
			</div>
		</div>

		<nav class="flex flex-wrap items-center gap-1.5" aria-label="Primary">
			{#each labels.nav as [label, path] (path)}
				<a
					href={l(path)}
					class="rounded px-2.5 py-1.5 text-sm transition {isActive(path)
						? 'bg-[rgba(47,111,106,.12)] text-[var(--sk-ink)]'
						: 'text-[var(--sk-muted)] hover:bg-[rgba(23,22,20,.06)] hover:text-[var(--sk-ink)]'}"
					aria-current={isActive(path) ? 'page' : undefined}
				>
					{label}
				</a>
			{/each}
		</nav>

		<div class="flex flex-wrap items-center gap-2">
			<div class="hidden lg:block">
				<LanguageSwitcher {locale} />
			</div>
			{#if userEmail}
				<a href="/dashboard" class="sk-btn sk-btn-secondary sk-btn-sm">{labels.dashboard}</a>
			{:else}
				<a href={l('/login')} class="sk-btn sk-btn-secondary sk-btn-sm">{labels.login}</a>
			{/if}
			<a href={l('/beta')} class="sk-btn sk-btn-primary sk-btn-sm">{labels.start}</a>
		</div>
	</div>
</header>
