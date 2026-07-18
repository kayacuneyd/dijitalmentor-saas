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
	const hasImageBackground = $derived(props.background === 'image' && Boolean(props.imageUrl));
</script>

{#if props.variant === 'split'}
	<section class="bg-base-200/70">
		<div
			class="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2 lg:py-24"
		>
			<div class="max-w-xl">
				<h1
					class="text-primary text-[clamp(2rem,8vw,var(--hero-title-left-max))] leading-[1.05] font-bold text-balance break-words"
				>
					{content.headline}
				</h1>
				{#if content.subheadline}
					<p
						class="text-base-content/75 mt-5 max-w-prose text-[clamp(1rem,3vw,1.125rem)] leading-8"
					>
						{content.subheadline}
					</p>
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
		class="hero relative min-h-[min(42rem,72svh)] overflow-hidden {centeredBg}"
		style={props.background === 'image' && props.imageUrl
			? `background-image: url(${props.imageUrl}); background-size: cover; background-position: center;`
			: ''}
	>
		{#if hasImageBackground}
			<div class="absolute inset-0 bg-black/55"></div>
		{/if}
		<div
			class="hero-content relative z-10 px-5 py-16 text-center sm:py-20"
			class:text-neutral-content={hasImageBackground}
		>
			<div class="w-full max-w-3xl">
				<h1
					class="text-[clamp(2.25rem,10vw,var(--hero-title-centered-max))] leading-[1.02] font-bold text-balance break-words {hasImageBackground
						? 'text-neutral-content drop-shadow-sm'
						: 'text-primary'}"
				>
					{content.headline}
				</h1>
				{#if content.subheadline}
					<p
						class="mx-auto mt-5 max-w-2xl text-[clamp(1rem,3.5vw,1.125rem)] leading-8 {hasImageBackground
							? 'text-neutral-content/85'
							: 'text-base-content/75'}"
					>
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
