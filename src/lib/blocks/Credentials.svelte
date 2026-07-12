<script lang="ts">
	import type { BlockProps } from '$lib/blocks/registry';

	let { sectionId, props, content }: BlockProps<'credentials'> = $props();

	const variant = $derived(props.variant ?? 'grid');
	const title = $derived(content.title);
	const intro = $derived(content.intro);
	const items = $derived(content.items);
</script>

<section id={sectionId} class="bg-base-100 px-4 py-16" data-section-type="credentials">
	<div class="mx-auto max-w-4xl">
		{#if title}
			<h2 class="text-primary text-center text-2xl font-semibold tracking-tight">{title}</h2>
		{/if}
		{#if intro}
			<p class="text-base-content/70 mx-auto mt-3 max-w-2xl text-center">{intro}</p>
		{/if}
		{#if variant === 'grid'}
			<div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as item (item.name)}
					<div
						class="border-base-300 bg-base-100 rounded-box flex items-center gap-3 border p-4 shadow-sm shadow-black/5"
					>
						{#if item.iconUrl}
							<img src={item.iconUrl} alt={item.name} class="h-8 w-8 rounded object-contain" />
						{/if}
						<div class="text-sm">
							<div class="font-semibold">{item.name}</div>
							{#if item.issuer}
								<div class="text-base-content/70">
									{item.issuer}{#if item.year}
										· {item.year}{/if}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="divide-base-300 mt-10 divide-y">
				{#each items as item (item.name)}
					<div class="flex items-center gap-3 py-3">
						{#if item.iconUrl}
							<img src={item.iconUrl} alt={item.name} class="h-8 w-8 rounded object-contain" />
						{/if}
						<div class="text-sm">
							<span class="font-semibold">{item.name}</span>{#if item.issuer}
								— {item.issuer}{#if item.year}
									· {item.year}{/if}{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
