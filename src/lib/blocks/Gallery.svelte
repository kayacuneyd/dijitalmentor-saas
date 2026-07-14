<script lang="ts">
	import type { BlockProps } from './registry';

	let { props, content }: BlockProps<'gallery'> = $props();
</script>

<section class="bg-base-100 px-5 py-20">
	<div class="mx-auto w-full max-w-6xl">
		{#if content.title}
			<p class="text-secondary text-center font-mono text-xs font-semibold uppercase">Gallery</p>
			<h2 class="text-primary mt-3 mb-10 text-center text-3xl leading-tight font-bold md:text-4xl">
				{content.title}
			</h2>
		{/if}

		{#if props.variant === 'carousel'}
			<div class="carousel carousel-center rounded-box w-full gap-4">
				{#each content.images as image, i (`${image.url}-${image.alt}-${i}`)}
					<div class="carousel-item">
						<img
							src={image.url}
							alt={image.alt}
							class="border-base-300 rounded-box bg-base-300 h-64 w-96 max-w-[82vw] border object-cover shadow-sm"
						/>
					</div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
				{#each content.images as image, i (`${image.url}-${image.alt}-${i}`)}
					<img
						src={image.url}
						alt={image.alt}
						class="border-base-300 rounded-box bg-base-300 aspect-[4/3] w-full border object-cover shadow-sm"
					/>
				{/each}
			</div>
		{/if}
	</div>
</section>
