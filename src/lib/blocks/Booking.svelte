<script lang="ts">
	import type { BlockProps } from '$lib/blocks/registry';
	import { getSiteIntegration, type Integration } from '$lib/render/context';

	let { sectionId, props, content, integrations }: BlockProps<'booking'> & { integrations?: Integration[] } = $props();

	const variant = $derived(props.variant ?? 'inline');
	const title = $derived(content.title);
	const subtitle = $derived(content.subtitle);
	const buttonLabel = $derived(content.buttonLabel);
	const note = $derived(content.note);

	const booking = $derived(getSiteIntegration(integrations ?? [], 'booking-external'));
	const linkHref = $derived(booking?.url ?? props.href);
	const linkLabel = $derived(booking?.label?.tr ?? buttonLabel);
</script>

<section
	id={sectionId}
	class="px-4 py-16 {variant === 'banner' ? 'bg-secondary' : 'bg-base-100'}"
	data-section-type="booking"
>
	<div class="mx-auto max-w-4xl">
		{#if variant === 'inline'}
			<div
				class="border-base-300 bg-base-100 rounded-box border p-8 text-center shadow-sm shadow-black/5"
			>
				<h2 class="text-primary text-2xl font-semibold tracking-tight">{title}</h2>
				{#if subtitle}<p class="text-base-content/80 mt-2">{subtitle}</p>{/if}
				<a
					href={linkHref}
					target={booking ? '_blank' : undefined}
					rel={booking ? 'noopener nofollow' : undefined}
					class="bg-primary text-primary-content rounded-field mt-4 inline-block px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
				>
					{linkLabel}
				</a>
				{#if note}<p class="text-base-content/50 mt-3 text-xs">{note}</p>{/if}
			</div>
		{:else}
			<div class="text-center">
				<h2 class="text-secondary-content text-2xl font-semibold tracking-tight">{title}</h2>
				{#if subtitle}<p class="text-secondary-content/80 mt-2">{subtitle}</p>{/if}
				<a
					href={linkHref}
					target={booking ? '_blank' : undefined}
					rel={booking ? 'noopener nofollow' : undefined}
					class="bg-primary text-primary-content rounded-field mt-4 inline-block px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
				>
					{linkLabel}
				</a>
				{#if note}<p class="text-secondary-content/60 mt-3 text-xs">{note}</p>{/if}
			</div>
		{/if}
	</div>
</section>
