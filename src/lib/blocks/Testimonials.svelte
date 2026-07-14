<script lang="ts">
	import type { BlockProps } from '$lib/blocks/registry';

	let { sectionId, props, content }: BlockProps<'testimonials'> = $props();

	const variant = $derived(props.variant ?? 'grid');
	const title = $derived(content.title);
	const intro = $derived(content.intro);
	const items = $derived(content.items);

	function stars(rating: number | undefined, max = 5): string {
		if (rating == null) return '';
		return '★'.repeat(Math.min(rating, max)) + '☆'.repeat(Math.max(max - rating, 0));
	}
</script>

<section id={sectionId} class="bg-base-200/70 px-4 py-16" data-section-type="testimonials">
	<div class="mx-auto max-w-4xl">
		{#if title}
			<h2 class="text-primary text-center text-2xl font-semibold tracking-tight">
				{title}
			</h2>
		{/if}
		{#if intro}
			<p class="text-base-content/70 mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed">
				{intro}
			</p>
		{/if}

		{#if variant === 'grid'}
			<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as item, i (`${item.name}-${item.quote}-${i}`)}
					<div
						class="border-base-300 bg-base-100 rounded-box flex flex-col gap-3 border p-5 shadow-sm shadow-black/5 transition-shadow hover:shadow-md"
					>
						{#if item.rating != null}
							<div class="text-accent text-lg tracking-wider" aria-label="{item.rating}/5">
								{stars(item.rating)}
							</div>
						{/if}
						<blockquote class="text-base-content/80 flex-1 text-sm leading-relaxed">
							" {item.quote} "
						</blockquote>
						<div class="border-base-300 flex items-center gap-3 border-t pt-3">
							{#if item.avatarUrl}
								<img
									src={item.avatarUrl}
									alt={item.name}
									class="h-9 w-9 rounded-full object-cover"
									loading="lazy"
								/>
							{:else}
								<span
									class="bg-secondary text-secondary-content flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
								>
									{item.name.charAt(0)}
								</span>
							{/if}
							<div class="text-sm">
								<div class="font-semibold">{item.name}</div>
								{#if item.role}
									<div class="text-base-content/60 text-xs">{item.role}</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if variant === 'carousel'}
			<div class="mt-10 overflow-x-auto pb-4">
				<div class="inline-flex gap-6">
					{#each items as item, i (`${item.name}-${item.quote}-${i}`)}
						<div
							class="border-base-300 bg-base-100 rounded-box flex w-[300px] shrink-0 flex-col gap-3 border p-5 shadow-sm shadow-black/5"
						>
							{#if item.rating != null}
								<div class="text-accent text-lg tracking-wider" aria-label="{item.rating}/5">
									{stars(item.rating)}
								</div>
							{/if}
							<blockquote class="text-base-content/80 flex-1 text-sm leading-relaxed">
								" {item.quote} "
							</blockquote>
							<div class="border-base-300 flex items-center gap-3 border-t pt-3">
								{#if item.avatarUrl}
									<img
										src={item.avatarUrl}
										alt={item.name}
										class="h-9 w-9 rounded-full object-cover"
										loading="lazy"
									/>
								{:else}
									<span
										class="bg-secondary text-secondary-content flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
									>
										{item.name.charAt(0)}
									</span>
								{/if}
								<div class="text-sm">
									<div class="font-semibold">{item.name}</div>
									{#if item.role}
										<div class="text-base-content/60 text-xs">{item.role}</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>
