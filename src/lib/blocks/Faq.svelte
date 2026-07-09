<script lang="ts">
	import type { BlockProps } from './registry';

	let { props, content }: BlockProps<'faq'> = $props();
</script>

<section class="bg-base-100 px-5 py-20">
	<div class="mx-auto w-full max-w-3xl">
		{#if content.title}
			<p class="text-secondary text-center font-mono text-xs font-semibold uppercase">FAQ</p>
			<h2 class="text-primary mt-3 mb-10 text-center text-3xl leading-tight font-bold md:text-4xl">
				{content.title}
			</h2>
		{/if}

		{#if props.variant === 'accordion'}
			<div class="flex flex-col gap-3">
				{#each content.items as item (item.question)}
					<div class="collapse-arrow border-base-300 bg-base-100 collapse border shadow-sm">
						<input type="checkbox" aria-label={item.question} />
						<h3 class="collapse-title text-primary font-bold">{item.question}</h3>
						<div class="collapse-content">
							<p class="text-base-content/75 leading-7">{item.answer}</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<dl class="flex flex-col gap-6">
				{#each content.items as item (item.question)}
					<div class="border-base-300 border-b pb-6 last:border-b-0">
						<dt class="text-primary font-bold">{item.question}</dt>
						<dd class="text-base-content/75 mt-2 leading-7">{item.answer}</dd>
					</div>
				{/each}
			</dl>
		{/if}
	</div>
</section>
