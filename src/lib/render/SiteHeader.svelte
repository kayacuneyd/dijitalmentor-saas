<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import type { Layout, Locale, Site } from '$lib/schema/site';
	import { BarsOutline, CloseOutline } from 'flowbite-svelte-icons';

	let {
		site,
		locale,
		activeSlug,
		hrefFor,
		localeHrefFor,
		layout
	}: {
		site: Site;
		locale: Locale;
		activeSlug: string;
		hrefFor: (pageSlug: string) => string;
		localeHrefFor?: (locale: Locale) => string;
		layout?: Layout;
	} = $props();

	const navVariant = $derived(layout?.nav?.variant ?? 'inline');
	const mobileBreakpoint = $derived(layout?.nav?.mobileBreakpoint ?? 'lg');
	const sticky = $derived(layout?.nav?.sticky ?? true);

	// Show desktop nav only above the mobile breakpoint
	const breakpointClass = $derived(
		mobileBreakpoint === 'sm'
			? 'hidden sm:flex'
			: mobileBreakpoint === 'md'
				? 'hidden md:flex'
				: 'hidden lg:flex'
	);
	const hamburgerClass = $derived(
		mobileBreakpoint === 'sm' ? 'sm:hidden' : mobileBreakpoint === 'md' ? 'md:hidden' : 'lg:hidden'
	);

	const showHamburger = $derived(navVariant === 'hamburger' || navVariant === 'drawer');

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

	const navClass = (pageSlug: string) =>
		pageSlug === activeSlug ? 'bg-base-200 text-primary' : 'text-base-content/70 hover:bg-base-200';

	const headerClass = $derived(
		`bg-base-100/95 border-base-300 z-30 border-b backdrop-blur ${sticky ? 'sticky top-0' : 'relative'}`
	);
</script>

<header class={headerClass}>
	<div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
		<a
			href={hrefFor(site.pages[0].slug)}
			class="text-primary text-lg font-bold tracking-normal no-underline"
		>
			{site.settings.siteName}
		</a>

		<!-- Desktop nav (inline variant, or hidden per breakpoint) -->
		{#if navVariant === 'inline'}
			<nav class="{breakpointClass} flex flex-wrap items-center gap-1.5">
				{#each site.nav.items as item, i (`${item.pageSlug}-${i}`)}
					<a
						href={hrefFor(item.pageSlug)}
						class="rounded-full px-3 py-1.5 text-sm font-medium no-underline transition {navClass(
							item.pageSlug
						)}"
					>
						{item.label[locale]}
					</a>
				{/each}
				{#if localeHrefFor && site.locales.length > 1}
					<div class="bg-base-200 ml-2 flex rounded-full p-1">
						{#each site.locales as loc (loc)}
							<a
								href={localeHrefFor(loc)}
								class="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold no-underline {loc ===
								locale
									? 'bg-primary text-primary-content'
									: 'text-base-content/60'}"
								aria-current={loc === locale ? 'true' : undefined}
							>
								{loc.toUpperCase()}
							</a>
						{/each}
					</div>
				{/if}
			</nav>
		{/if}

		<!-- Desktop inline nav content for hamburger/drawer variants (only locale switcher) -->
		{#if showHamburger}
			<nav class="{breakpointClass} flex flex-wrap items-center gap-1.5">
				{#each site.nav.items as item, i (`${item.pageSlug}-${i}`)}
					<a
						href={hrefFor(item.pageSlug)}
						class="rounded-full px-3 py-1.5 text-sm font-medium no-underline transition {navClass(
							item.pageSlug
						)}"
					>
						{item.label[locale]}
					</a>
				{/each}
				{#if localeHrefFor && site.locales.length > 1}
					<div class="bg-base-200 ml-2 flex rounded-full p-1">
						{#each site.locales as loc (loc)}
							<a
								href={localeHrefFor(loc)}
								class="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold no-underline {loc ===
								locale
									? 'bg-primary text-primary-content'
									: 'text-base-content/60'}"
								aria-current={loc === locale ? 'true' : undefined}
							>
								{loc.toUpperCase()}
							</a>
						{/each}
					</div>
				{/if}
			</nav>

			<!-- Mobile hamburger button -->
			<button
				type="button"
				class="{hamburgerClass} inline-flex h-10 w-10 items-center justify-center rounded-[9px] border border-base-300 bg-base-100 text-base-content transition hover:bg-base-200"
				aria-expanded={menuOpen}
				aria-controls="site-mobile-nav"
				aria-label="Open menu"
				onclick={openMenu}
			>
				<BarsOutline size="sm" />
			</button>
		{/if}
	</div>
</header>

<!-- Mobile menu dialog (hamburger/drawer variants) -->
{#if showHamburger}
	<dialog
		id="site-mobile-nav"
		bind:this={dialogEl}
		onclose={() => (menuOpen = false)}
		onclick={(event) => {
			if (event.target === dialogEl) closeMenu();
		}}
		class={navVariant === 'drawer'
			? 'fixed inset-y-0 left-0 z-40 m-0 h-full max-h-full w-72 max-w-[80vw] rounded-r-xl border border-base-300 bg-base-100 p-0 shadow-2xl backdrop:bg-black/40'
			: 'rounded-xl border border-base-300 bg-base-100 p-0 shadow-2xl backdrop:bg-black/40'}
	>
		<div
			class="flex shrink-0 items-center justify-between gap-3 border-b border-base-300 px-4 py-3"
		>
			<a
				href={hrefFor(site.pages[0].slug)}
				class="text-primary text-lg font-bold tracking-normal no-underline"
			>
				{site.settings.siteName}
			</a>
			<button
				type="button"
				class="inline-flex h-10 w-10 items-center justify-center rounded-[9px] text-base-content/60 transition hover:bg-base-200"
				aria-label="Close menu"
				onclick={closeMenu}
			>
				<CloseOutline size="sm" />
			</button>
		</div>

		<nav class="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
			<div class="flex flex-col gap-1">
				{#each site.nav.items as item, i (`${item.pageSlug}-${i}`)}
					<a
						href={hrefFor(item.pageSlug)}
						class="flex min-h-12 items-center rounded-[10px] px-3 text-base transition {navClass(
							item.pageSlug
						)}"
						aria-current={item.pageSlug === activeSlug ? 'page' : undefined}
					>
						{item.label[locale]}
					</a>
				{/each}
			</div>
			{#if localeHrefFor && site.locales.length > 1}
				<div class="mt-4 flex gap-1 border-t border-base-300 pt-4">
					{#each site.locales as loc (loc)}
						<a
							href={localeHrefFor(loc)}
							class="rounded-full px-3 py-1 font-mono text-xs font-semibold no-underline {loc ===
							locale
								? 'bg-primary text-primary-content'
								: 'text-base-content/60'}"
							aria-current={loc === locale ? 'true' : undefined}
						>
							{loc.toUpperCase()}
						</a>
					{/each}
				</div>
			{/if}
		</nav>
	</dialog>
{/if}
