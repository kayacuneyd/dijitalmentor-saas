<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';
	import AppCanvasShell from './AppCanvasShell.svelte';
	import FlowbiteButton from './primitives/FlowbiteButton.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import PanelSidebar, { type PanelNavItem } from './PanelSidebar.svelte';
	import { BarsOutline, ArrowLeftOutline } from 'flowbite-svelte-icons';

	let {
		children,
		title,
		description,
		backHref,
		backLabel = 'saaskaya',
		max = 'max-w-7xl',
		canvasMax = 'max-w-[92rem]',
		canvasLabel = 'saaskaya.app',
		actions,
		items,
		sidebarLabel = 'Panel navigation',
		sidebarPosition = 'right',
		storageKey = 'saaskaya.user.sidebar',
		brand
	} = $props<{
		children: import('svelte').Snippet;
		title: string;
		description?: string;
		backHref?: string;
		backLabel?: string;
		max?: string;
		canvasMax?: string;
		canvasLabel?: string;
		actions?: import('svelte').Snippet;
		items: PanelNavItem[];
		sidebarLabel?: string;
		sidebarPosition?: 'left' | 'right';
		storageKey?: string;
		brand?: import('svelte').Snippet;
	}>();

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);
	const labels = $derived(
		{
			en: {
				open: 'Open sidebar',
				close: 'Close sidebar',
				collapse: 'Collapse sidebar',
				expand: 'Expand sidebar'
			},
			tr: {
				open: 'Kenar çubuğunu aç',
				close: 'Kenar çubuğunu kapat',
				collapse: 'Kenar çubuğunu daralt',
				expand: 'Kenar çubuğunu genişlet'
			},
			de: {
				open: 'Seitenleiste öffnen',
				close: 'Seitenleiste schließen',
				collapse: 'Seitenleiste einklappen',
				expand: 'Seitenleiste ausklappen'
			}
		}[locale]
	);

	let collapsed = $state(false);
	let mobileOpen = $state(false);
	let hydrated = $state(false);

	$effect(() => {
		if (!browser || hydrated) return;
		const stored = window.localStorage.getItem(storageKey);
		if (stored === 'collapsed') collapsed = true;
		hydrated = true;
	});

	$effect(() => {
		if (!browser || !hydrated) return;
		window.localStorage.setItem(storageKey, collapsed ? 'collapsed' : 'expanded');
	});

	$effect(() => {
		if (!browser) return;
		document.body.style.overflow = mobileOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	afterNavigate(() => (mobileOpen = false));

	function toggleSidebar() {
		if (window.matchMedia('(min-width: 1024px)').matches) collapsed = !collapsed;
		else mobileOpen = !mobileOpen;
	}

	const gridClass = $derived(
		sidebarPosition === 'left'
			? collapsed
				? 'lg:grid-cols-[72px_minmax(0,1fr)]'
				: 'lg:grid-cols-[232px_minmax(0,1fr)]'
			: collapsed
				? 'lg:grid-cols-[minmax(0,1fr)_72px]'
				: 'lg:grid-cols-[minmax(0,1fr)_232px]'
	);
	const contentPlacement = $derived(
		sidebarPosition === 'left' ? 'lg:col-start-2 lg:row-start-1' : 'lg:col-start-1 lg:row-start-1'
	);
</script>

{#snippet chromeLeft()}
	{#if brand}
		{@render brand()}
	{:else}
		<span class="sk-mono text-[10px] text-[var(--sk-faint)]">saaskaya.app</span>
	{/if}
{/snippet}

{#snippet chromeRight()}
	<div class="flex items-center gap-2">
		<FlowbiteButton
			variant="secondary"
			size="sm"
			class="size-11 !p-0 lg:hidden"
			aria-expanded={mobileOpen || !collapsed}
			aria-controls="panel-sidebar"
			aria-label={mobileOpen ? labels.close : collapsed ? labels.expand : labels.collapse}
			onclick={toggleSidebar}
		>
			<BarsOutline size="sm" />
		</FlowbiteButton>
		<LanguageSwitcher {locale} variant="cookie" />
	</div>
{/snippet}

<AppCanvasShell label={canvasLabel} max={canvasMax} left={chromeLeft} right={chromeRight} flush>
	<div
		class="panel-shell-grid relative grid min-h-[calc(100svh-4.5rem)] gap-0 overflow-hidden bg-[var(--sk-card)] {gridClass}"
	>
		{#if mobileOpen}
			<button
				type="button"
				class="fixed inset-0 z-40 bg-[#171614]/35 lg:hidden"
				aria-label={labels.close}
				onclick={() => (mobileOpen = false)}
			></button>
		{/if}
		<PanelSidebar
			id="panel-sidebar"
			{items}
			label={sidebarLabel}
			{collapsed}
			{mobileOpen}
			position={sidebarPosition}
			{brand}
			onCloseMobile={() => (mobileOpen = false)}
			onToggleDesktop={() => (collapsed = !collapsed)}
			collapseLabel={labels.collapse}
			expandLabel={labels.expand}
		/>

		<section class="min-w-0 bg-[#fbfaf7] {contentPlacement}">
			<div class="mx-auto flex w-full {max} flex-col gap-5 p-4 sm:p-5 lg:p-6">
				<header
					class="flex flex-col gap-3 border-b border-[var(--sk-line)] pb-4 md:flex-row md:items-start md:justify-between"
				>
					<div class="min-w-0">
						{#if backHref}
							<a
								href={backHref}
								class="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--sk-radius-sm)] px-2 text-sm font-medium text-[var(--sk-muted)] hover:bg-[var(--sk-shell)] hover:text-[var(--sk-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sk-focus)]"
							>
								<ArrowLeftOutline size="sm" />{backLabel}
							</a>
						{/if}
						<div class="sk-mono mt-2 text-[10px] text-[var(--sk-faint)]">saaskaya.app</div>
						<h1 class="sk-display mt-1 text-4xl leading-none sm:text-[42px]">{title}</h1>
						{#if description}
							<p class="mt-3 max-w-2xl text-sm leading-6 text-[var(--sk-muted)] sm:text-[15px]">
								{description}
							</p>
						{/if}
					</div>
					{#if actions}
						<div class="flex flex-wrap justify-start gap-2 md:justify-end">{@render actions()}</div>
					{/if}
				</header>

				{@render children()}
			</div>
		</section>
	</div>
</AppCanvasShell>
