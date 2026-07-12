<script lang="ts">
	import type { Locale } from '$lib/schema/site';
	import { getRenderContext, getSiteIntegration, type Integration } from '$lib/render/context';
	import { INTEGRATION_DEFAULT_LABELS } from '$lib/kits/integrations';
	import type { BlockProps } from './registry';

	let { props, content, locale, integrations }: BlockProps<'contact'> & { integrations?: Integration[] } = $props();

	const render = getRenderContext();

	const social = $derived(getSiteIntegration(integrations ?? [], 'social-link'));
	const video = $derived(getSiteIntegration(integrations ?? [], 'video-consult'));
	const extraLinks = $derived(
		[
			social ? { href: social.url!, label: social.label?.tr ?? INTEGRATION_DEFAULT_LABELS['social-link'] } : null,
			video ? { href: video.url!, label: video.label?.tr ?? INTEGRATION_DEFAULT_LABELS['video-consult'] } : null
		].filter(Boolean) as { href: string; label: string }[]
	);

	// Platform UI chrome (field labels) is the block's own dictionary — tenant copy stays in `content`.
	const labels: Record<
		Locale,
		{
			name: string;
			email: string;
			message: string;
			send: string;
			thanks: string;
			error: string;
			previewNote: string;
		}
	> = {
		tr: {
			name: 'Ad Soyad',
			email: 'E-posta',
			message: 'Mesajınız',
			send: 'Gönder',
			thanks: 'Mesajınız iletildi — teşekkürler!',
			error: 'Mesaj gönderilemedi, lütfen tekrar deneyin.',
			previewNote: 'Form, yayınlanan sitede çalışır.'
		},
		en: {
			name: 'Full name',
			email: 'Email',
			message: 'Your message',
			send: 'Send',
			thanks: 'Your message has been sent — thank you!',
			error: 'The message could not be sent, please try again.',
			previewNote: 'The form works on the published site.'
		},
		de: {
			name: 'Name',
			email: 'E-Mail',
			message: 'Ihre Nachricht',
			send: 'Senden',
			thanks: 'Ihre Nachricht wurde gesendet — vielen Dank!',
			error: 'Die Nachricht konnte nicht gesendet werden, bitte erneut versuchen.',
			previewNote: 'Das Formular funktioniert auf der veröffentlichten Website.'
		}
	};
	const l = $derived(labels[locale]);
</script>

<section id="contact" class="bg-base-200/70 px-5 py-20">
	<div class="mx-auto w-full max-w-6xl">
		<p class="text-secondary text-center font-mono text-xs font-semibold uppercase">Contact</p>
		<h2 class="text-primary mt-3 text-center text-3xl leading-tight font-bold md:text-4xl">
			{content.title}
		</h2>
		{#if content.description}
			<p class="text-base-content/70 mx-auto mt-4 max-w-2xl text-center leading-7">
				{content.description}
			</p>
		{/if}

		<div
			class="mx-auto mt-10"
			class:max-w-xl={props.variant === 'form'}
			class:grid={props.variant === 'split'}
			class:max-w-4xl={props.variant === 'split'}
			class:md:grid-cols-2={props.variant === 'split'}
			class:gap-10={props.variant === 'split'}
		>
			{#if props.variant === 'split'}
				<address
					class="border-base-300 bg-base-100 rounded-box flex flex-col gap-4 border p-6 not-italic"
				>
					<a href="mailto:{props.email}" class="text-primary font-semibold break-all no-underline">
						{props.email}
					</a>
					{#if props.phone}
						<a
							href="tel:{props.phone.replace(/\s/g, '')}"
							class="text-base-content/75 no-underline"
						>
							{props.phone}
						</a>
					{/if}
					{#if props.address}
						<p class="text-base-content/70 leading-7">{props.address}</p>
					{/if}
				</address>
			{/if}

			{#if render.contactState === 'sent'}
				<div class="alert alert-success">{l.thanks}</div>
			{:else}
				<!-- Live only on the published site; the ?/contact action stores + notifies (M5). -->
				<form
					method="POST"
					action="?/contact#contact"
					class="border-base-300 bg-base-100 rounded-box border p-6 shadow-sm shadow-black/5"
				>
					<div class="flex flex-col gap-4">
						{#if render.contactState === 'error'}
							<div class="alert alert-error text-sm">{l.error}</div>
						{/if}
						<label class="form-control w-full">
							<span class="mb-1 block text-sm font-medium">{l.name}</span>
							<input
								type="text"
								name="name"
								class="input input-bordered w-full"
								required
								maxlength="200"
							/>
						</label>
						<label class="form-control w-full">
							<span class="mb-1 block text-sm font-medium">{l.email}</span>
							<input
								type="email"
								name="email"
								class="input input-bordered w-full"
								required
								maxlength="320"
							/>
						</label>
						<label class="form-control w-full">
							<span class="mb-1 block text-sm font-medium">{l.message}</span>
							<textarea
								name="message"
								class="textarea textarea-bordered min-h-28 w-full"
								required
								maxlength="5000"></textarea>
						</label>
						<input type="hidden" name="locale" value={locale} />
						<button
							type="submit"
							class="btn btn-primary mt-2 rounded-full"
							disabled={render.mode !== 'public'}
						>
							{content.submitLabel ?? l.send}
						</button>
						{#if render.mode !== 'public'}
							<p class="text-center text-xs opacity-60">{l.previewNote}</p>
						{/if}
					</div>
				</form>
			{/if}
			{#if extraLinks.length > 0}
					<div class="mt-6 flex flex-wrap justify-center gap-3">
						{#each extraLinks as link}
							<a href={link.href} target="_blank" rel="noopener nofollow"
								class="btn btn-outline btn-sm rounded-full"
							>
								{link.label}
							</a>
						{/each}
					</div>
				{/if}
		</div>
	</div>
</section>
