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
		props: SectionProps<'video'>;
		content: SectionContent<'video'>;
	} = $props();

	const aspectClass = $derived(
		props.aspectRatio === '16/9'
			? 'aspect-video'
			: props.aspectRatio === '4/3'
				? 'aspect-4/3'
				: 'aspect-square'
	);

	function embedUrl(url: string): string {
		const ytMatch = url.match(
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
		);
		if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

		const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
		if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

		return url;
	}
</script>

<section id={sectionId} class="py-16 sm:py-20">
	<div class="mx-auto max-w-4xl px-5">
		<h2 class="mb-2 text-center text-3xl font-bold tracking-tight">{content.title}</h2>
		{#if content.caption}
			<p class="mx-auto mb-8 max-w-xl text-center text-base opacity-75">{content.caption}</p>
		{/if}
		<div class="overflow-hidden rounded-xl bg-black shadow-lg {aspectClass}">
			<iframe
				src={embedUrl(props.url)}
				title={content.title}
				class="h-full w-full"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				loading="lazy"
			></iframe>
		</div>
	</div>
</section>
