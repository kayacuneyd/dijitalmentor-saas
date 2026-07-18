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
		props: SectionProps<'clients'>;
		content: SectionContent<'clients'>;
	} = $props();
</script>

<section id={sectionId} class="py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-5">
		<h2 class="mb-2 text-center text-3xl font-bold tracking-tight">{content.title}</h2>
		{#if content.intro}
			<p class="mx-auto mb-10 max-w-xl text-center text-base opacity-75">{content.intro}</p>
		{/if}
		<div class="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
			{#each content.logos as logo (logo.alt)}
				<img
					src={logo.url}
					alt={logo.alt}
					class="h-10 max-w-[140px] object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-12"
					loading="lazy"
				/>
			{/each}
		</div>
	</div>
</section>
