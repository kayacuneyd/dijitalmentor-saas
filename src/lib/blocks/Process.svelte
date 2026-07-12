<script lang="ts">
	import type { BlockProps } from '$lib/blocks/registry';

	let { sectionId, props, content }: BlockProps<'process'> = $props();

	const variant = $derived(props.variant ?? 'vertical');
	const title = $derived(content.title);
	const intro = $derived(content.intro);
	const steps = $derived(content.steps);
</script>

<section id={sectionId} class="bg-base-100 px-4 py-16" data-section-type="process">
	<div class="mx-auto max-w-4xl">
		{#if title}
			<h2 class="text-primary text-center text-2xl font-semibold tracking-tight">{title}</h2>
		{/if}
		{#if intro}
			<p class="text-base-content/70 mx-auto mt-3 max-w-2xl text-center">{intro}</p>
		{/if}
		{#if variant === 'vertical'}
			<div class="mt-10 space-y-0">
				{#each steps as step, i (step.label)}
					<div class="relative flex gap-4 pb-8">
						<div class="flex flex-col items-center">
							<div
								class="bg-primary text-primary-content flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
							>
								{i + 1}
							</div>
							{#if i < steps.length - 1}
								<div class="bg-base-300 mt-1 w-0.5 flex-1"></div>
							{/if}
						</div>
						<div class="flex-1 pt-1.5">
							<div class="font-semibold">{step.label}</div>
							<div class="text-base-content/80 mt-1 text-sm">{step.description}</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="mt-10 flex gap-6 overflow-x-auto pb-4">
				{#each steps as step, i (step.label)}
					<div class="w-[220px] shrink-0 text-center">
						<div
							class="bg-primary text-primary-content mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
						>
							{i + 1}
						</div>
						<div class="mt-3 font-semibold">{step.label}</div>
						<div class="text-base-content/80 mt-1 text-sm">{step.description}</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
