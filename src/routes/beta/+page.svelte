<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import SiteAssistantDock from '$lib/ui/SiteAssistantDock.svelte';
	import { ArrowRightOutline, HomeOutline } from 'flowbite-svelte-icons';
	import { mergeCopy } from '$lib/publicCopy';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data, form } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	let busy = $state(false);

	const baseCopy = $derived(
		{
			en: {
				title: 'Join the saaskaya beta',
				description:
					'Request your beta sign-in link and start preparing your first saaskaya website.',
				home: 'Home',
				badge: 'Invite-only beta',
				h1: 'Create your beta access link.',
				body: 'Enter the email address where you received this beta invitation. We will send a secure one-time magic link.',
				email: 'Email address',
				placeholder: 'you@example.com',
				submit: 'Send my beta link',
				successTitle: 'Check your inbox',
				success:
					'We sent your secure sign-in link. Open it within 15 minutes to finish your quick profile and start building your website.',
				codeMissing:
					'This beta link needs a valid code. Please use the full invitation link you received.',
				dev: 'Dev mode',
				open: 'Open your sign-in link',
				after: 'After sign-in: short profile → website setup → preview → publish.'
			},
			tr: {
				title: "saaskaya Beta'ya Katıl",
				description: 'saaskaya beta için giriş linkini al ve ilk web siteni hazırlamaya başla.',
				home: 'Anasayfa',
				badge: 'Davetli beta',
				h1: 'Beta giriş linkini oluştur.',
				body: 'Beta davetini aldığın e-posta adresini gir. Sana güvenli, tek kullanımlık magic link göndereceğiz.',
				email: 'E-posta adresi',
				placeholder: 'sen@example.com',
				submit: 'Beta linkimi gönder',
				successTitle: 'E-postanı kontrol et',
				success:
					'Güvenli giriş linkini gönderdik. 15 dakika içinde aç; kısa profilini tamamlayıp web siteni oluşturmaya başlayacaksın.',
				codeMissing:
					'Bu beta linki geçerli bir kod gerektiriyor. Lütfen sana gönderilen tam davet linkini kullan.',
				dev: 'Dev modu',
				open: 'Giriş linkini aç',
				after: 'Girişten sonra: kısa profil → web sitesi hazırlığı → önizleme → yayın.'
			},
			de: {
				title: 'Der saaskaya Beta beitreten',
				description: 'Fordere deinen Beta-Anmeldelink an und starte deine erste saaskaya Website.',
				home: 'Startseite',
				badge: 'Beta nur mit Einladung',
				h1: 'Erstelle deinen Beta-Zugangslink.',
				body: 'Gib die E-Mail-Adresse ein, an die du diese Beta-Einladung erhalten hast. Wir senden dir einen sicheren einmaligen Magic Link.',
				email: 'E-Mail-Adresse',
				placeholder: 'du@example.com',
				submit: 'Beta-Link senden',
				successTitle: 'Posteingang prüfen',
				success:
					'Wir haben deinen sicheren Anmeldelink gesendet. Öffne ihn innerhalb von 15 Minuten, vervollständige dein Kurzprofil und starte deine Website.',
				codeMissing:
					'Dieser Beta-Link benötigt einen gültigen Code. Bitte nutze den vollständigen Einladungslink.',
				dev: 'Dev-Modus',
				open: 'Anmeldelink öffnen',
				after: 'Nach dem Login: Kurzprofil → Website vorbereiten → Vorschau → veröffentlichen.'
			}
		}[locale]
	);
	const copy = $derived(mergeCopy(baseCopy, data.copyOverrides?.[locale]));
</script>

<svelte:head>
	<title>{copy.title} · saaskaya</title>
	<meta name="description" content={copy.description} />
</svelte:head>

<AppCanvasShell label="saaskaya.app / beta">
	{#snippet left()}
		<BrandMark href={l('/')} compact wordmark />
	{/snippet}
	{#snippet right()}
		<FlowbiteButton href={l('/')} variant="secondary" size="sm"
			><HomeOutline size="xs" />{copy.home}</FlowbiteButton
		>
		<LanguageSwitcher {locale} />
	{/snippet}

	<div class="mx-auto flex w-full max-w-2xl flex-col gap-8">
		<div>
			<div
				class="inline-flex rounded-full bg-[rgba(47,111,106,.1)] px-3 py-1 text-xs font-medium text-[#2f6f6a]"
			>
				{copy.badge}
			</div>
			<h1 class="sk-display mt-4 text-4xl leading-tight sm:text-[44px]">{copy.h1}</h1>
			<p class="mt-4 max-w-xl text-[16px] leading-7 text-[var(--sk-muted)]">{copy.body}</p>
			<p class="mt-4 text-xs leading-5 text-[var(--sk-faint)]">{copy.after}</p>
		</div>

		<AppCard class="p-6 sm:p-8">
			{#if !data.codeAllowed}
				<div class="sk-alert sk-alert-warning">{copy.codeMissing}</div>
			{:else if form?.sent}
				<div class="flex flex-col gap-4">
					<div class="sk-alert sk-alert-success">
						<strong>{copy.successTitle}</strong><br />
						{copy.success}
					</div>
					<p class="text-sm text-[var(--sk-muted)]">{form.email}</p>
					{#if form.devEchoLink}
						<div class="sk-alert sk-alert-warning text-xs">
							<span class="sk-mono block text-[10.5px] text-[var(--sk-faint)]">{copy.dev}</span>
							<a
								class="sk-link inline-flex items-center gap-1.5 break-all font-medium"
								href={form.devEchoLink}>{copy.open}<ArrowRightOutline size="xs" /></a
							>
						</div>
					{/if}
				</div>
			{:else}
				<form
					method="POST"
					class="flex flex-col gap-4"
					use:enhance={() => {
						busy = true;
						return async ({ update }) => {
							busy = false;
							await update();
						};
					}}
				>
					<input type="hidden" name="code" value={data.code} />
					<label class="flex flex-col gap-1 text-sm font-medium">
						{copy.email}
						<input
							type="email"
							name="email"
							required
							placeholder={copy.placeholder}
							class="sk-input text-[15px]"
							disabled={busy}
						/>
					</label>
					{#if form?.message}
						<div class="sk-alert sk-alert-error text-xs">{form.message}</div>
					{/if}
					<FlowbiteButton
						type="submit"
						variant="primary"
						size="lg"
						class="w-full"
						loading={busy}
						disabled={busy}
					>
						{#if busy}<span class="sk-spinner sk-spinner-sm" aria-hidden="true"></span>{/if}
						{copy.submit}
						{#if !busy}<ArrowRightOutline size="sm" />{/if}
					</FlowbiteButton>
				</form>
			{/if}
		</AppCard>
	</div>
</AppCanvasShell>
<SiteAssistantDock {locale} currentPath="/beta" userEmail={data.user?.email ?? ''} />
