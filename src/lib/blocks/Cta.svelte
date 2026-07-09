<script lang="ts">
	import type { BlockProps } from './registry';

	let { props, content }: BlockProps<'cta'> = $props();
</script>

{#if props.variant === 'boxed'}
	<section class="bg-base-100 px-5 py-20">
		<div
			class="bg-primary text-primary-content rounded-box mx-auto w-full max-w-4xl overflow-hidden"
		>
			<div class="flex flex-col items-center gap-4 px-6 py-14 text-center">
				<h2 class="text-3xl leading-tight font-bold md:text-4xl">{content.title}</h2>
				{#if content.subtitle}
					<p class="max-w-2xl opacity-90">{content.subtitle}</p>
				{/if}
				<a href={props.href} class="btn btn-secondary btn-lg mt-3 rounded-full px-7"
					>{content.buttonLabel}</a
				>
			</div>
		</div>
	</section>
{:else}
	<section class="bg-primary text-primary-content px-5 py-14">
		<div
			class="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left"
		>
			<div>
				<h2 class="text-3xl leading-tight font-bold md:text-4xl">{content.title}</h2>
				{#if content.subtitle}
					<p class="mt-3 max-w-2xl opacity-90">{content.subtitle}</p>
				{/if}
			</div>
			<a href={props.href} class="btn btn-secondary btn-lg shrink-0 rounded-full px-7">
				{content.buttonLabel}
			</a>
		</div>
	</section>
{/if}
