<script lang="ts">
	import { withLocale, type Locale } from '$lib/i18n';

	type Crumb = {
		label: string;
		href?: string;
	};

	let {
		locale,
		routeLocale = locale,
		items
	}: {
		locale: Locale;
		routeLocale?: string;
		items: Crumb[];
	} = $props();

	const l = (path: string) => withLocale(routeLocale, path);
</script>

<nav
	class="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-[var(--sk-faint)]"
	aria-label="Breadcrumb"
>
	{#each items as item, i (`${item.label}-${i}`)}
		{#if item.href}
			<a href={l(item.href)} class="sk-link text-[var(--sk-muted)] hover:text-[var(--sk-ink)]">
				{item.label}
			</a>
		{:else}
			<span class="min-w-0 text-[var(--sk-ink)]">{item.label}</span>
		{/if}
		{#if i < items.length - 1}
			<span aria-hidden="true">/</span>
		{/if}
	{/each}
</nav>
