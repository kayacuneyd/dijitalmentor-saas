<script lang="ts">
	import type { BlockProps } from '$lib/blocks/registry';

	let { sectionId, props, content }: BlockProps<'pricing'> = $props();

	const variant = $derived(props.variant ?? 'cards');
	const currency = $derived(props.currency ?? '₺');
	const title = $derived(content.title);
	const intro = $derived(content.intro);
	const items = $derived(content.items);
</script>

<section id={sectionId} class="bg-base-200/70 px-4 py-16" data-section-type="pricing">
	<div class="mx-auto max-w-4xl">
		{#if title}
			<h2 class="text-primary text-center text-2xl font-semibold tracking-tight">{title}</h2>
		{/if}
		{#if intro}
			<p class="text-base-content/70 mx-auto mt-3 max-w-2xl text-center">{intro}</p>
		{/if}
		{#if variant === 'cards'}
			<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as item (item.name)}
					<div
						class="border-base-300 bg-base-100 rounded-box flex flex-col gap-4 border p-6 shadow-sm shadow-black/5 {item.highlighted
							? 'ring-primary -mt-2 pb-8 ring-2'
							: ''}"
					>
						<div class="text-center">
							<div class="text-lg font-semibold">{item.name}</div>
							<div class="text-primary mt-2 text-3xl font-bold">
								{item.price}
								<span class="text-base-content/60 text-sm font-normal">{currency}</span>
							</div>
						</div>
						{#if item.description}
							<p class="text-base-content/70 text-center text-sm">{item.description}</p>
						{/if}
						{#if item.features}
							<ul class="space-y-2 text-sm">
								{#each item.features as f (f)}
									<li class="flex gap-2"><span class="text-accent">✓</span> {f}</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="mt-10 overflow-x-auto">
				<table class="w-full border-collapse text-sm">
					<thead>
						<tr>
							{#each items as item (item.name)}
								<th class="border-base-300 border-b p-3 text-center font-semibold">
									{item.name}
									<div class="text-primary mt-1 text-lg">
										{item.price}
										<span class="text-base-content/60 text-xs font-normal">{currency}</span>
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						<tr>
							{#each items as item (item.name)}
								<td class="border-base-300 border-b p-3 text-center">{item.description ?? ''}</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>
