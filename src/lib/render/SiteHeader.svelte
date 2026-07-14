<script lang="ts">
	import type { Locale, Site } from '$lib/schema/site';

	let {
		site,
		locale,
		activeSlug,
		hrefFor,
		localeHrefFor
	}: {
		site: Site;
		locale: Locale;
		activeSlug: string;
		hrefFor: (pageSlug: string) => string;
		localeHrefFor?: (locale: Locale) => string;
	} = $props();

	const navClass = (pageSlug: string) =>
		pageSlug === activeSlug ? 'bg-base-200 text-primary' : 'text-base-content/70 hover:bg-base-200';
</script>

<header class="bg-base-100/95 border-base-300 sticky top-0 z-30 border-b backdrop-blur">
	<div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
		<a
			href={hrefFor(site.pages[0].slug)}
			class="text-primary text-lg font-bold tracking-normal no-underline"
		>
			{site.settings.siteName}
		</a>
		<nav class="flex flex-wrap items-center justify-end gap-1.5">
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
	</div>
</header>
