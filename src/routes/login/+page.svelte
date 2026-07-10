<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
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
				back: '← saaskaya',
				h1: 'Sign in',
				beta: 'Closed beta — invite-only sign-in',
				body: 'No password — we email you a one-time sign-in link. First sign-in creates your account.',
				sent: 'Sign-in link sent to',
				valid: 'It is valid for 15 minutes.',
				dev: 'Dev mode',
				open: 'Open your sign-in link →',
				placeholder: 'you@example.com',
				submit: 'Email me a sign-in link'
			},
			tr: {
				title: 'Giriş · saaskaya',
				description: 'Tek kullanımlık magic link ile saaskaya hesabına giriş yap.',
				home: 'Anasayfa',
				back: '← saaskaya',
				h1: 'Giriş',
				beta: 'Kapalı beta — davetiyeyle giriş',
				body: 'Şifre yok — tek kullanımlık giriş linkini e-posta ile gönderiyoruz. İlk giriş hesabını oluşturur.',
				sent: 'Giriş linki gönderildi:',
				valid: '15 dakika geçerlidir.',
				dev: 'Dev modu',
				open: 'Giriş linkini aç →',
				placeholder: 'sen@example.com',
				submit: 'Giriş linki gönder'
			},
			de: {
				title: 'Anmelden · saaskaya',
				description: 'Melde dich mit einem einmaligen Magic Link bei saaskaya an.',
				home: 'Startseite',
				back: '← saaskaya',
				h1: 'Anmelden',
				beta: 'Geschlossene Beta — Anmeldung nur mit Einladung',
				body: 'Kein Passwort — wir senden dir einen einmaligen Anmeldelink. Die erste Anmeldung erstellt dein Konto.',
				sent: 'Anmeldelink gesendet an',
				valid: 'Er ist 15 Minuten gültig.',
				dev: 'Dev-Modus',
				open: 'Anmeldelink öffnen →',
				placeholder: 'du@example.com',
				submit: 'Anmeldelink senden'
			}
		}[locale]
	);
</script>

<svelte:head>
	<title>{copy.title}</title>
	<meta name="description" content={copy.description} />
</svelte:head>

<AppCanvasShell label="saaskaya.app / sign in">
	{#snippet right()}
		<a href={l('/')} class="sk-btn sk-btn-secondary sk-btn-sm">{copy.home}</a>
		<LanguageSwitcher {locale} />
	{/snippet}

	<div class="mx-auto grid w-full max-w-3xl gap-6 md:grid-cols-[0.85fr_1fr] md:items-center">
		<div>
			<a href={l('/')} class="sk-link text-sm text-[var(--sk-faint)]">{copy.back}</a>
			<h1 class="sk-display mt-3 text-4xl leading-none">{copy.h1}</h1>
			{#if data?.betaMode}
				<p
					class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#171614]/5 px-3 py-1 text-xs font-medium"
				>
					{copy.beta}
				</p>
			{/if}
			<p class="mt-3 text-sm leading-6 text-[var(--sk-muted)]">{copy.body}</p>
		</div>

		<AppCard class="p-6 sm:p-8">
			<div class="flex flex-col gap-5">
				{#if form?.sent}
					<div class="sk-alert sk-alert-success">
						{copy.sent} <strong>{form.email}</strong>. {copy.valid}
					</div>
					{#if form.devEchoLink}
						<div class="sk-alert sk-alert-warning text-xs">
							<span class="sk-mono block text-[10.5px] text-[var(--sk-faint)]">{copy.dev}</span>
							<a class="sk-link break-all font-medium" href={form.devEchoLink}>{copy.open}</a>
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
						<input
							type="email"
							name="email"
							value={data?.email}
							required
							placeholder={copy.placeholder}
							class="sk-input text-[15px]"
							disabled={busy}
						/>
						{#if form?.message}
							<p class="text-sm text-[#b8532f]">{form.message}</p>
						{/if}
						<button type="submit" class="sk-btn sk-btn-primary sk-btn-lg w-full" disabled={busy}>
							{#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
							{copy.submit}
						</button>
					</form>
				{/if}
			</div>
		</AppCard>
	</div>
</AppCanvasShell>
