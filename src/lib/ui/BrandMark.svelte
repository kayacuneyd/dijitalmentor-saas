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

	const logoSize = 'h-12 w-[46px]';
	const logoUrl = $derived(
		page.data.platformBranding?.logoUrl ?? '/do-more-with-less-download-free-ebook.svg'
	);
	const brandName = $derived(page.data.platformBranding?.brandName ?? 'saaskaya');
	const showWordmark = $derived(wordmark ?? page.data.platformBranding?.showWordmark ?? true);
</script>

<a {href} class="sk-link inline-flex min-h-11 min-w-0 items-center gap-3">
	<span
		class="flex shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[#fbfaf7db] {logoSize}"
	>
		<img src={logoUrl} alt={label} class="h-full w-full object-contain" />
	</span>
	{#if showWordmark}<span class="text-base font-semibold tracking-[-0.02em] lg:text-xl"
			>{brandName}</span
		>{/if}
</a>
