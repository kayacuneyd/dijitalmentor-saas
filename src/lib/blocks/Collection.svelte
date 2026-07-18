<script lang="ts">
	import type { BlockProps } from '$lib/blocks/registry';

	let { sectionId, props, content }: BlockProps<'collection'> = $props();
	const isCards = $derived((props.variant ?? 'cards') === 'cards');
</script>

<section id={sectionId} class="bg-base-100 px-4 py-16 sm:py-20" data-section-type="collection">
	<div class="mx-auto max-w-6xl">
		<h2 class="text-primary text-center text-2xl font-semibold tracking-tight">{content.title}</h2>
		{#if content.intro}
			<p class="text-base-content/70 mx-auto mt-3 max-w-2xl text-center">{content.intro}</p>
		{/if}
		<div
			class={isCards
				? 'mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
				: 'mt-10 divide-y divide-base-300'}
		>
			{#each content.items as item, i (`${item.title}-${i}`)}
				<article
					class={isCards
						? 'overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm'
						: 'py-5 first:pt-0 last:pb-0'}
				>
					{#if isCards && item.imageUrl}
						<img
							src={item.imageUrl}
							alt={item.imageAlt ?? item.title}
							class="h-40 w-full object-cover"
							loading="lazy"
						/>
					{/if}
					<div
						class={isCards
							? 'p-5'
							: 'flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between'}
					>
						<div>
							{#if item.meta}<p class="text-primary text-xs font-semibold uppercase tracking-wide">
									{item.meta}
								</p>{/if}
							<h3 class="mt-1 text-lg font-semibold">{item.title}</h3>
							{#if item.description}<p class="text-base-content/70 mt-2 text-sm">
									{item.description}
								</p>{/if}
						</div>
						{#if item.href}<a
								class="text-primary mt-4 inline-flex text-sm font-semibold hover:underline sm:mt-0"
								href={item.href}>Detay →</a
							>{/if}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
