<script lang="ts">
	import { page } from '$app/state';
	let {
		label = 'saaskaya',
		href = '/',
		compact = false,
		wordmark
	} = $props<{
		label?: string;
		href?: string;
		compact?: boolean;
		/** Route-level trust surfaces (for example login) may require the name
		 *  even when an operator configured icon-only navigation elsewhere. */
		wordmark?: boolean;
	}>();

	const logoSize = $derived(compact ? 'size-8' : 'size-10');
	const logoUrl = $derived(page.data.platformBranding?.logoUrl ?? '/logo.svg');
	const brandName = $derived(page.data.platformBranding?.brandName ?? 'saaskaya');
	const showWordmark = $derived(wordmark ?? page.data.platformBranding?.showWordmark ?? true);
</script>

<a {href} class="sk-link inline-flex min-h-11 min-w-0 items-center gap-3">
	<span
		class="flex shrink-0 items-center overflow-hidden rounded-[9px] bg-[var(--sk-shell)] {logoSize}"
	>
		<img src={logoUrl} alt={label} class="h-full w-full object-contain" />
	</span>
	{#if showWordmark}<span class="text-sm font-semibold tracking-[-0.02em]">{brandName}</span>{/if}
</a>
