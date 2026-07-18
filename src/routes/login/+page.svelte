<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import FlowbiteInput from '$lib/ui/primitives/FlowbiteInput.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { uiIcons } from '$lib/ui/icons';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data, form } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	let busy = $state(false);

	const copy = $derived(
		{
			en: {
				title: 'Sign in · saaskaya',
				description: 'Sign in to saaskaya with a one-time magic link.',
				home: 'Home',
				back: 'saaskaya',
				h1: 'Sign in',
				beta: 'Closed beta — invite-only sign-in',
				body: 'Enter your email and open the one-time link. No password.',
				sent: 'Sign-in link sent to',
				valid: 'It is valid for 15 minutes.',
				dev: 'Dev mode',
				open: 'Open your sign-in link',
				placeholder: 'you@example.com',
				submit: 'Email me a sign-in link',
				privacy: 'Privacy',
				terms: 'Terms'
			},
			tr: {
				title: 'Giriş · saaskaya',
				description: 'Tek kullanımlık magic link ile saaskaya hesabına giriş yap.',
				home: 'Anasayfa',
				back: 'saaskaya',
				h1: 'Giriş',
				beta: 'Kapalı beta — davetiyeyle giriş',
				body: 'E-postanı yaz, tek kullanımlık linki aç. Şifre yok.',
				sent: 'Giriş linki gönderildi:',
				valid: '15 dakika geçerlidir.',
				dev: 'Dev modu',
				open: 'Giriş linkini aç',
				placeholder: 'sen@example.com',
				submit: 'Giriş linki gönder',
				privacy: 'Gizlilik',
				terms: 'Şartlar'
			},
			de: {
				title: 'Anmelden · saaskaya',
				description: 'Melde dich mit einem einmaligen Magic Link bei saaskaya an.',
				home: 'Startseite',
				back: 'saaskaya',
				h1: 'Anmelden',
				beta: 'Geschlossene Beta — Anmeldung nur mit Einladung',
				body: 'E-Mail eingeben, einmaligen Link öffnen. Kein Passwort.',
				sent: 'Anmeldelink gesendet an',
				valid: 'Er ist 15 Minuten gültig.',
				dev: 'Dev-Modus',
				open: 'Anmeldelink öffnen',
				placeholder: 'du@example.com',
				submit: 'Anmeldelink senden',
				privacy: 'Datenschutz',
				terms: 'Bedingungen'
			}
		}[locale]
	);
</script>

<svelte:head>
	<title>{copy.title}</title>
	<meta name="description" content={copy.description} />
</svelte:head>

<AppCanvasShell label="saaskaya.app / sign in" chrome={false}>
	<div class="flex min-h-[calc(100svh-5rem)] flex-col">
		<header
			class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-10"
		>
			<BrandMark href={l('/')} compact />
			<div class="flex items-center gap-2">
				<FlowbiteButton href={l('/')} variant="secondary" size="sm">
					{@html uiIcons.home(14)}{copy.home}
				</FlowbiteButton>
				<LanguageSwitcher {locale} />
			</div>
		</header>

		<main class="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
			<section class="w-full max-w-[34rem]">
				<div class="mb-5 text-center">
					<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.back}</div>
					<h1 class="sk-display mt-3 text-4xl leading-none sm:text-[42px]">{copy.h1}</h1>
					{#if data?.betaMode}
						<div class="mt-3 flex justify-center"><StatusPill>{copy.beta}</StatusPill></div>
					{/if}
					<p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--sk-muted)]">{copy.body}</p>
				</div>

				<div class="sk-card p-5 sm:p-7">
					{#if form?.sent}
						<div class="sk-alert sk-alert-success">
							{copy.sent} <strong>{form.email}</strong>. {copy.valid}
						</div>
						{#if form.devEchoLink}
							<div class="sk-alert sk-alert-warning mt-3 text-xs">
								<span class="sk-mono block text-[10.5px] text-[var(--sk-faint)]">{copy.dev}</span>
								<a
									class="sk-link inline-flex items-center gap-1.5 break-all font-medium"
									href={form.devEchoLink}>{copy.open}{@html uiIcons.arrowRight(14)}</a
								>
							</div>
						{/if}
					{:else}
						<form
							method="POST"
							class="flex flex-col gap-3"
							use:enhance={() => {
								busy = true;
								return async ({ update }) => {
									busy = false;
									await update();
								};
							}}
						>
							<FlowbiteInput
								type="email"
								name="email"
								value={data?.email}
								required
								placeholder={copy.placeholder}
								size="lg"
								class="text-[15px]"
								disabled={busy}
							/>
							{#if form?.message}
								<p class="text-sm text-[#b8532f]">{form.message}</p>
							{/if}
							<FlowbiteButton type="submit" size="lg" class="w-full" loading={busy} disabled={busy}>
								{#if !busy}{@html uiIcons.mail(16)}{/if}
								{copy.submit}
							</FlowbiteButton>
						</form>
					{/if}
				</div>

				<nav
					class="mt-5 flex justify-center gap-4 text-xs text-[var(--sk-muted)]"
					aria-label="Legal"
				>
					<a href={l('/legal/privacy')} class="sk-link">{copy.privacy}</a>
					<a href={l('/legal/terms')} class="sk-link">{copy.terms}</a>
				</nav>
			</section>
		</main>
	</div>
</AppCanvasShell>
