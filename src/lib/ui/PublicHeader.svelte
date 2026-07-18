<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import { BarsOutline, CloseOutline } from 'flowbite-svelte-icons';
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

	let dialogEl: HTMLDialogElement | undefined = $state();
	let menuOpen = $state(false);

	function openMenu() {
		menuOpen = true;
		dialogEl?.showModal();
	}

	function closeMenu() {
		dialogEl?.close();
	}

	afterNavigate(() => closeMenu());

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
				start: 'Start beta',
				menu: 'Open menu',
				close: 'Close menu'
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
				start: 'Betaya başla',
				menu: 'Menüyü aç',
				close: 'Menüyü kapat'
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
				start: 'Beta starten',
				menu: 'Menü öffnen',
				close: 'Menü schließen'
			}
		}[locale]
	);
</script>

<header class="border-b border-[var(--sk-line)] bg-[rgb(251_250_247/.86)]">
	<div
		class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:py-4"
	>
		<BrandMark href={l('/')} compact />

		<nav class="hidden flex-wrap items-center gap-1.5 lg:flex" aria-label="Primary">
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

		<div class="hidden flex-wrap items-center gap-2 lg:flex">
			<LanguageSwitcher {locale} variant="dropdown" />
			{#if userEmail}
				<FlowbiteButton href="/dashboard" variant="secondary" size="sm"
					>{labels.dashboard}</FlowbiteButton
				>
			{:else}
				<FlowbiteButton href={l('/login')} variant="secondary" size="sm"
					>{labels.login}</FlowbiteButton
				>
			{/if}
			<FlowbiteButton href={l('/beta')} variant="primary" size="sm">{labels.start}</FlowbiteButton>
		</div>

		<div class="flex items-center gap-2 lg:hidden">
			<LanguageSwitcher {locale} variant="dropdown" />
			<button
				type="button"
				class="inline-flex h-10 w-10 items-center justify-center rounded-[9px] border border-[var(--sk-line)] bg-[rgb(251_250_247/.68)] text-[var(--sk-ink)] transition hover:bg-white"
				aria-expanded={menuOpen}
				aria-controls="mobile-nav"
				aria-label={labels.menu}
				onclick={openMenu}
			>
				<BarsOutline size="sm" />
			</button>
		</div>
	</div>
</header>

<dialog
	id="mobile-nav"
	data-nav
	class="sk-mobile-nav"
	bind:this={dialogEl}
	onclose={() => (menuOpen = false)}
	onclick={(event) => {
		if (event.target === dialogEl) closeMenu();
	}}
>
	<div
		class="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--sk-line)] px-4 py-3 sm:px-6"
	>
		<BrandMark href={l('/')} compact />
		<button
			type="button"
			class="inline-flex h-10 w-10 items-center justify-center rounded-[9px] text-[var(--sk-muted)] transition hover:bg-[rgba(23,22,20,.06)] hover:text-[var(--sk-ink)]"
			aria-label={labels.close}
			onclick={closeMenu}
		>
			<CloseOutline size="sm" />
		</button>
	</div>

	<nav class="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
		<div class="flex flex-col gap-1">
			{#each labels.nav as [label, path] (path)}
				<a
					href={l(path)}
					class="flex min-h-12 items-center rounded-[10px] px-3 text-base transition {isActive(path)
						? 'bg-[rgba(47,111,106,.12)] font-medium text-[var(--sk-ink)]'
						: 'text-[var(--sk-muted)] hover:bg-[rgba(23,22,20,.06)] hover:text-[var(--sk-ink)]'}"
					aria-current={isActive(path) ? 'page' : undefined}
				>
					{label}
				</a>
			{/each}
		</div>
	</nav>

	<div class="flex shrink-0 flex-col gap-2 border-t border-[var(--sk-line)] px-4 py-4">
		{#if userEmail}
			<FlowbiteButton href="/dashboard" variant="secondary" class="w-full"
				>{labels.dashboard}</FlowbiteButton
			>
		{:else}
			<FlowbiteButton href={l('/login')} variant="secondary" class="w-full"
				>{labels.login}</FlowbiteButton
			>
		{/if}
		<FlowbiteButton href={l('/beta')} variant="primary" class="w-full"
			>{labels.start}</FlowbiteButton
		>
	</div>
</dialog>
