<script lang="ts">
	import type { BlockProps } from './registry';

	let { props, content }: BlockProps<'about'> = $props();
</script>

<section class="bg-base-100 px-5 py-20">
	<div
		class="mx-auto w-full max-w-6xl"
		class:md:grid={props.variant === 'text-image'}
		class:md:grid-cols-2={props.variant === 'text-image'}
		class:md:items-center={props.variant === 'text-image'}
		class:md:gap-14={props.variant === 'text-image'}
	>
		<div class:max-w-3xl={props.variant === 'text'} class:mx-auto={props.variant === 'text'}>
			<p class="text-secondary mb-3 font-mono text-xs font-semibold uppercase">About</p>
			<h2 class="text-primary text-3xl leading-tight font-bold md:text-4xl">{content.title}</h2>
			<p class="text-base-content/75 mt-5 leading-8 whitespace-pre-line">{content.body}</p>
		</div>
		{#if props.variant === 'text-image' && props.imageUrl}
			<div class="border-base-300 rounded-box bg-base-200 mt-10 overflow-hidden border p-2 md:mt-0">
				<img
					src={props.imageUrl}
					alt={content.imageAlt ?? content.title}
					class="rounded-box bg-base-300 aspect-[4/3] w-full object-cover"
				/>
			</div>
		{/if}
	</div>
</section>
