<script lang="ts">
	import { getSiteIntegration, type Integration } from '$lib/render/context';
	import { waMeLink, INTEGRATION_DEFAULT_LABELS } from '$lib/kits/integrations';
	import type { BlockProps } from './registry';

	let { props, content, integrations }: BlockProps<'cta'> & { integrations?: Integration[] } = $props();

	const whatsapp = $derived(getSiteIntegration(integrations ?? [], 'whatsapp-order'));
	const social = $derived(getSiteIntegration(integrations ?? [], 'social-link'));
	const video = $derived(getSiteIntegration(integrations ?? [], 'video-consult'));
	const menu = $derived(getSiteIntegration(integrations ?? [], 'menu-digital'));
	const payment = $derived(getSiteIntegration(integrations ?? [], 'payment-link'));

	const waHref = $derived(whatsapp?.phone ? waMeLink(whatsapp.phone) : null);
	const extraLinks = $derived(
		[
			social ? { href: social.url!, label: social.label?.tr ?? INTEGRATION_DEFAULT_LABELS['social-link'] } : null,
			video ? { href: video.url!, label: video.label?.tr ?? INTEGRATION_DEFAULT_LABELS['video-consult'] } : null,
			menu ? { href: menu.url!, label: menu.label?.tr ?? INTEGRATION_DEFAULT_LABELS['menu-digital'] } : null,
			payment ? { href: payment.url!, label: payment.label?.tr ?? INTEGRATION_DEFAULT_LABELS['payment-link'] } : null
		].filter(Boolean) as { href: string; label: string }[]
	);
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
				{#if waHref}
					<a href={waHref} target="_blank" rel="noopener nofollow"
						class="btn btn-ghost border-primary-content/30 mt-2 text-sm"
					>
						💬 {whatsapp?.label?.tr ?? INTEGRATION_DEFAULT_LABELS['whatsapp-order']}
					</a>
				{/if}
				{#each extraLinks as link}
					<a href={link.href} target="_blank" rel="noopener nofollow"
						class="btn btn-ghost border-primary-content/30 mt-1 text-sm">{link.label}</a>
				{/each}
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
			<div class="flex flex-col items-center gap-2">
				<a href={props.href} class="btn btn-secondary btn-lg shrink-0 rounded-full px-7">
					{content.buttonLabel}
				</a>
				{#if waHref}
					<a href={waHref} target="_blank" rel="noopener nofollow"
						class="btn btn-ghost border-primary-content/30 text-sm"
					>
						💬 {whatsapp?.label?.tr ?? INTEGRATION_DEFAULT_LABELS['whatsapp-order']}
					</a>
				{/if}
				{#each extraLinks as link}
					<a href={link.href} target="_blank" rel="noopener nofollow"
						class="btn btn-ghost border-primary-content/30 text-sm">{link.label}</a>
				{/each}
			</div>
		</div>
	</section>
{/if}
