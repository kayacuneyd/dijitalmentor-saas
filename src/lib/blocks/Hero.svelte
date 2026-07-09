<script lang="ts">
	import type { BlockProps } from './registry';

	let { props, content }: BlockProps<'hero'> = $props();

	const centeredBg = $derived(
		props.background === 'gradient'
			? 'bg-gradient-to-br from-primary/15 via-base-100 to-secondary/25'
			: props.background === 'plain'
				? 'bg-base-100'
				: ''
	);
</script>

{#if props.variant === 'split'}
	<section class="bg-base-200/70">
		<div
			class="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2 lg:py-24"
		>
			<div class="max-w-xl">
				<h1 class="text-primary text-4xl leading-tight font-bold md:text-5xl">
					{content.headline}
				</h1>
				{#if content.subheadline}
					<p class="text-base-content/75 mt-5 text-lg leading-8">{content.subheadline}</p>
				{/if}
				{#if content.ctaLabel && props.ctaHref}
					<a href={props.ctaHref} class="btn btn-primary btn-lg mt-7 rounded-full px-7">
						{content.ctaLabel}
					</a>
				{/if}
			</div>
			{#if props.imageUrl}
				<div
					class="border-base-300 bg-base-100 rounded-box overflow-hidden border p-2 shadow-xl shadow-black/5"
				>
					<img
						src={props.imageUrl}
						alt={content.headline}
						class="rounded-box bg-base-300 aspect-[4/3] w-full object-cover"
					/>
				</div>
			{/if}
		</div>
	</section>
{:else}
	<section
		class="hero min-h-[64vh] {centeredBg}"
		style={props.background === 'image' && props.imageUrl
			? `background-image: url(${props.imageUrl}); background-size: cover; background-position: center;`
			: ''}
	>
		{#if props.background === 'image'}
			<div class="hero-overlay"></div>
		{/if}
		<div
			class="hero-content px-5 py-20 text-center"
			class:text-neutral-content={props.background === 'image'}
		>
			<div class="max-w-3xl">
				<h1 class="text-primary text-4xl leading-tight font-bold md:text-6xl">
					{content.headline}
				</h1>
				{#if content.subheadline}
					<p class="text-base-content/75 mx-auto mt-5 max-w-2xl text-lg leading-8">
						{content.subheadline}
					</p>
				{/if}
				{#if content.ctaLabel && props.ctaHref}
					<a href={props.ctaHref} class="btn btn-primary btn-lg mt-7 rounded-full px-7">
						{content.ctaLabel}
					</a>
				{/if}
			</div>
		</div>
	</section>
{/if}
