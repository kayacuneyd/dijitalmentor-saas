<script lang="ts">
	import { withLocale, type Locale } from '$lib/i18n';
	import { absoluteUrl, organizationJsonLd } from '$lib/seo';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { mergeCopy } from '$lib/publicCopy';

	type ContactFormValues = {
		name?: string;
		email?: string;
		category?: string;
		message?: string;
	};

	let { data, form } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	const formValues = $derived(
		(form && 'values' in form ? form.values : undefined) as ContactFormValues | undefined
	);

	const baseCopy = $derived(
		{
			en: {
				title: 'Contact saaskaya · Beta access and support',
				description:
					'Contact saaskaya for beta access, support, partnerships, billing questions, or product feedback.',
				kicker: 'Contact',
				h1: 'Tell us what you need.',
				lead: 'Use the form for beta access, support, partnerships, billing questions, or product feedback. Your message reaches us directly and we reply by email.',
				email: 'Email support',
				response: 'Typical response: by email during beta onboarding.',
				location: 'Operated from Kornwestheim, Germany.',
				categories: ['Beta access', 'Support', 'Partnership', 'Billing', 'Other'],
				formTitle: 'Message categories',
				formNote: 'Send a message and we will reply by email.',
				name: 'Name',
				emailField: 'Email',
				category: 'Category',
				message: 'Message',
				placeholder: 'Write a short note about what you need.',
				send: 'Send message',
				success: 'Message sent. We will reply by email.',
				start: 'Start beta',
				blog: 'Read blog'
			},
			tr: {
				title: 'saaskaya iletişim · Beta erişimi ve destek',
				description:
					'Beta erişimi, destek, iş birliği, faturalama soruları veya ürün geri bildirimi için saaskaya ile iletişime geçin.',
				kicker: 'İletişim',
				h1: 'Neye ihtiyacınız olduğunu yazın.',
				lead: 'Beta erişimi, destek, iş birliği, faturalama soruları veya ürün geri bildirimi için yazın. Mesajınız bize ulaşır; e-posta ile döneriz.',
				email: 'Destek e-postası',
				response: 'Tipik yanıt: beta döneminde e-posta ile.',
				location: 'Kornwestheim, Almanya merkezli yürütülür.',
				categories: ['Beta erişimi', 'Destek', 'İş birliği', 'Faturalama', 'Diğer'],
				formTitle: 'Mesaj kategorileri',
				formNote: 'Mesajını gönder; e-posta ile yanıtlayalım.',
				name: 'Ad Soyad',
				emailField: 'E-posta',
				category: 'Kategori',
				message: 'Mesaj',
				placeholder: 'Neye ihtiyacınız olduğunu kısaca yazın.',
				send: 'Mesaj gönder',
				success: 'Mesaj gönderildi. E-posta ile yanıt vereceğiz.',
				start: 'Betaya başla',
				blog: 'Blogu oku'
			},
			de: {
				title: 'Kontakt zu saaskaya · Beta-Zugang und Support',
				description:
					'Kontaktiere saaskaya für Beta-Zugang, Support, Partnerschaften, Abrechnung oder Produktfeedback.',
				kicker: 'Kontakt',
				h1: 'Sag uns, was du brauchst.',
				lead: 'Schreibe uns für Beta-Zugang, Support, Partnerschaften, Abrechnung oder Produktfeedback. Deine Nachricht erreicht uns direkt; wir antworten per E-Mail.',
				email: 'Support per E-Mail',
				response: 'Typische Antwort: per E-Mail während des Beta-Onboardings.',
				location: 'Betrieben aus Kornwestheim, Deutschland.',
				categories: ['Beta-Zugang', 'Support', 'Partnerschaft', 'Abrechnung', 'Sonstiges'],
				formTitle: 'Nachrichtenkategorien',
				formNote: 'Sende eine Nachricht und wir antworten per E-Mail.',
				name: 'Name',
				emailField: 'E-Mail',
				category: 'Kategorie',
				message: 'Nachricht',
				placeholder: 'Schreibe kurz, was du brauchst.',
				send: 'Nachricht senden',
				success: 'Nachricht gesendet. Wir antworten per E-Mail.',
				start: 'Beta starten',
				blog: 'Blog lesen'
			}
		}[locale]
	);
	const copy = $derived(mergeCopy(baseCopy, data.copyOverrides?.[locale]));

	const contactJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		name: copy.title,
		url: absoluteUrl(locale, '/contact'),
		description: copy.description,
			mainEntity: organizationJsonLd(data.platformBranding?.logoUrl)
	});
</script>

<SeoHead
	{locale}
	path="/contact"
	title={copy.title}
	description={copy.description}
	jsonLd={[organizationJsonLd(data.platformBranding?.logoUrl), contactJsonLd]}
/>

<PublicShell
	{locale}
	currentPath="/contact"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / contact"
>
	<MarketingSection as="section" class="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_.95fr]">
		<div>
			<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.kicker}</div>
			<h1 class="sk-display mt-4 text-4xl leading-tight sm:text-[46px]">{copy.h1}</h1>
			<p class="mt-4 max-w-2xl text-[17px] leading-8 text-[var(--sk-muted)]">{copy.lead}</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<a href="mailto:support@saaskaya.com" class="sk-btn sk-btn-primary sk-btn-lg">
					{copy.email}
				</a>
				<a href={l('/beta')} class="sk-btn sk-btn-secondary sk-btn-lg">{copy.start}</a>
				<a href={l('/blog')} class="sk-btn sk-btn-ghost sk-btn-lg">{copy.blog}</a>
			</div>
			<div class="mt-6 space-y-2 text-sm text-[var(--sk-muted)]">
				<p><strong class="text-[var(--sk-ink)]">support@saaskaya.com</strong></p>
				<p>{copy.response}</p>
				<p>{copy.location}</p>
			</div>
		</div>

		<aside class="sk-card p-5">
			<h2 class="text-lg font-semibold">{copy.formTitle}</h2>
			<p class="mt-2 text-sm leading-6 text-[var(--sk-muted)]">{copy.formNote}</p>
			{#if form?.sent}
				<div class="sk-alert sk-alert-success mt-5">{copy.success}</div>
			{:else}
				<form method="POST" class="mt-5 flex flex-col gap-3">
					{#if form?.message}
						<div class="sk-alert sk-alert-error text-xs">{form.message}</div>
					{/if}
					<input type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" />
					<label class="grid gap-1.5 text-sm font-medium">
						<span>{copy.name}</span>
						<input
							name="name"
							required
							maxlength="120"
							class="sk-input"
							value={formValues?.name ?? ''}
							autocomplete="name"
						/>
					</label>
					<label class="grid gap-1.5 text-sm font-medium">
						<span>{copy.emailField}</span>
						<input
							name="email"
							required
							type="email"
							class="sk-input"
							value={formValues?.email ?? data.userEmail ?? ''}
							autocomplete="email"
						/>
					</label>
					<label class="grid gap-1.5 text-sm font-medium">
						<span>{copy.category}</span>
						<select name="category" class="sk-select" value={formValues?.category ?? 'other'}>
							{#each ['beta_access', 'support', 'partnership', 'billing', 'other'] as value, index (value)}
								<option {value}>{copy.categories[index]}</option>
							{/each}
						</select>
					</label>
					<label class="grid gap-1.5 text-sm font-medium">
						<span>{copy.message}</span>
						<textarea
							name="message"
							required
							minlength="20"
							maxlength="4000"
							rows="6"
							class="sk-textarea"
							placeholder={copy.placeholder}>{formValues?.message ?? ''}</textarea
						>
					</label>
					<button type="submit" class="sk-btn sk-btn-primary">{copy.send}</button>
				</form>
			{/if}
		</aside>
	</MarketingSection>
</PublicShell>
