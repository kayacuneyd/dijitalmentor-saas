<script lang="ts">
	import type { SectionContent, SectionProps } from '$lib/schema/site';
	import type { Locale } from '$lib/schema/site';

	let {
		sectionId,
		locale,
		props,
		content
	}: {
		sectionId: string;
		locale: Locale;
		props: SectionProps<'stats'>;
		content: SectionContent<'stats'>;
	} = $props();

	const cols = $derived(props.columns ?? 4);
</script>

<section id={sectionId} class="py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-5">
		<h2 class="mb-2 text-center text-3xl font-bold tracking-tight">{content.title}</h2>
		{#if content.intro}
			<p class="mx-auto mb-10 max-w-xl text-center text-base opacity-75">{content.intro}</p>
		{/if}
		<div
			class="grid gap-6"
			style="grid-template-columns: repeat({cols}, minmax(0, 1fr))"
		>
			{#each content.items as item (item.label)}
				<div class="rounded-xl border bg-base-100 p-6 text-center shadow-sm">
					{#if item.icon}
						<div class="mb-3 text-2xl">{item.icon}</div>
					{/if}
					<div class="text-3xl font-bold text-primary">{item.value}</div>
					<div class="mt-1 text-sm opacity-70">{item.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>