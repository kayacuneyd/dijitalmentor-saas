<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import FlowbiteInput from '$lib/ui/primitives/FlowbiteInput.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { ArrowRightOutline, EnvelopeOutline, HomeOutline } from 'flowbite-svelte-icons';
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
				productTitle: 'Your professional website stays in your hands.',
				productBody:
					'Describe your work, review the multilingual draft and keep improving it by chatting.',
				productFlow: 'Describe · review · publish',
				emailLabel: 'Email address',
				emailHelp: 'Use the same address that received your beta invitation.',
				sent: 'Sign-in link sent to',
				valid: 'It is valid for 15 minutes.',
				sentNext: 'Open the link in your inbox to continue. Check spam if it does not arrive.',
				anotherEmail: 'Use another email',
				dev: 'Dev mode',
				open: 'Open your sign-in link',
				placeholder: 'you@example.com',
				submit: 'Email me a sign-in link',
				support: 'Get invitation help',
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
				productTitle: 'Profesyonel sitenin kontrolü sende kalsın.',
				productBody: 'İşini anlat, çok dilli taslağını incele ve konuşarak geliştirmeye devam et.',
				productFlow: 'Anlat · incele · yayınla',
				emailLabel: 'E-posta adresi',
				emailHelp: 'Beta davetini aldığın e-posta adresini kullan.',
				sent: 'Giriş linki gönderildi:',
				valid: '15 dakika geçerlidir.',
				sentNext: 'Devam etmek için gelen kutundaki bağlantıyı aç. Gelmediyse spam klasörüne bak.',
				anotherEmail: 'Başka e-posta kullan',
				dev: 'Dev modu',
				open: 'Giriş linkini aç',
				placeholder: 'sen@example.com',
				submit: 'Giriş linki gönder',
				support: 'Davet için yardım al',
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
				productTitle: 'Deine professionelle Website bleibt in deiner Hand.',
				productBody:
					'Beschreibe deine Arbeit, prüfe den mehrsprachigen Entwurf und entwickle ihn im Gespräch weiter.',
				productFlow: 'Beschreiben · prüfen · veröffentlichen',
				emailLabel: 'E-Mail-Adresse',
				emailHelp: 'Verwende dieselbe Adresse, an die deine Beta-Einladung gesendet wurde.',
				sent: 'Anmeldelink gesendet an',
				valid: 'Er ist 15 Minuten gültig.',
				sentNext:
					'Öffne den Link in deinem Posteingang. Prüfe den Spam-Ordner, falls er nicht ankommt.',
				anotherEmail: 'Andere E-Mail verwenden',
				dev: 'Dev-Modus',
				open: 'Anmeldelink öffnen',
				placeholder: 'du@example.com',
				submit: 'Anmeldelink senden',
				support: 'Hilfe zur Einladung',
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
	<div class="login-brief flex min-h-[calc(100svh-1rem)] flex-col">
		<header
			class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-10"
		>
			<BrandMark href={l('/')} compact wordmark />
			<div class="flex items-center gap-2">
				<FlowbiteButton href={l('/')} variant="secondary" size="sm">
					<HomeOutline size="xs" /><span class="hidden sm:inline">{copy.home}</span>
				</FlowbiteButton>
				<LanguageSwitcher {locale} variant="dropdown" />
			</div>
		</header>

		<main
			class="mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 py-8 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,32rem)] lg:gap-20 lg:py-16"
		>
			<section class="login-brief__story hidden min-w-0 lg:block">
				<p class="sk-mono text-[10px] text-[var(--sk-faint)]">{copy.productFlow}</p>
				<p
					class="sk-display mt-5 max-w-2xl text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.96] tracking-[-0.03em]"
				>
					{copy.productTitle}
				</p>
				<p class="mt-6 max-w-xl text-base leading-7 text-[var(--sk-muted)] sm:text-lg">
					{copy.productBody}
				</p>
				<div class="mt-8 hidden items-center gap-3 text-xs text-[var(--sk-muted)] lg:flex">
					<span class="h-px w-16 bg-[var(--sk-line-strong)]"></span>
					<span>TR · EN · DE</span>
					<span aria-hidden="true">·</span>
					<span>Magic link</span>
				</div>
			</section>

			<section class="login-brief__form w-full">
				<div class="mb-5">
					<div class="sk-mono text-[10px] text-[var(--sk-faint)]">{copy.back}</div>
					<h1 class="sk-display mt-3 text-4xl leading-none sm:text-[42px]">{copy.h1}</h1>
					{#if data?.betaMode}
						<div class="mt-3 flex"><StatusPill>{copy.beta}</StatusPill></div>
					{/if}
					<p class="mt-3 max-w-sm text-sm leading-6 text-[var(--sk-muted)]">{copy.body}</p>
				</div>

				<div class="sk-card p-5 sm:p-7">
					{#if form?.sent}
						<div class="flex items-start gap-3">
							<span
								class="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--sk-success-bg)] text-[var(--sk-success-ink)]"
								><EnvelopeOutline size="sm" /></span
							>
							<div>
								<p class="font-semibold">{copy.sent}</p>
								<p class="mt-1 break-all text-sm">{form.email}</p>
								<p class="mt-3 text-sm leading-6 text-[var(--sk-muted)]">
									{copy.sentNext}
									{copy.valid}
								</p>
							</div>
						</div>
						{#if form.devEchoLink}
							<div class="sk-alert sk-alert-warning mt-3 text-xs">
								<span class="sk-mono block text-[10.5px] text-[var(--sk-faint)]">{copy.dev}</span>
								<a
									class="sk-link inline-flex items-center gap-1.5 break-all font-medium"
									href={form.devEchoLink}>{copy.open}<ArrowRightOutline size="xs" /></a
								>
							</div>
						{/if}
						<FlowbiteButton href={l('/login')} variant="secondary" class="mt-5 w-full">
							{copy.anotherEmail}
						</FlowbiteButton>
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
							<label class="sk-flowbite-field">
								<span class="text-sm font-semibold">{copy.emailLabel}</span>
								<FlowbiteInput
									type="email"
									name="email"
									value={data?.email}
									required
									autocomplete="email"
									inputmode="email"
									placeholder={copy.placeholder}
									size="lg"
									class="text-[15px]"
									disabled={busy}
									aria-describedby="login-email-help"
									aria-invalid={form?.message ? 'true' : undefined}
								/>
								<span id="login-email-help" class="text-xs leading-5 text-[var(--sk-muted)]">
									{copy.emailHelp}
								</span>
							</label>
							{#if form?.message}
								<p class="text-sm text-[var(--sk-error)]" role="alert">{form.message}</p>
							{/if}
							<FlowbiteButton
								type="submit"
								size="lg"
								class="w-full whitespace-nowrap text-sm"
								loading={busy}
								disabled={busy}
							>
								{#if !busy}<EnvelopeOutline size="sm" />{/if}
								{copy.submit}
							</FlowbiteButton>
						</form>
					{/if}
				</div>

				<nav class="mt-3 flex flex-wrap gap-x-4 text-xs text-[var(--sk-muted)]">
					<a href={l('/contact')} class="sk-link inline-flex min-h-11 items-center font-medium"
						>{copy.support}</a
					>
					<a
						href={l('/legal/privacy')}
						class="sk-link inline-flex min-h-11 min-w-11 items-center justify-center"
						>{copy.privacy}</a
					>
					<a
						href={l('/legal/terms')}
						class="sk-link inline-flex min-h-11 min-w-11 items-center justify-center"
						>{copy.terms}</a
					>
				</nav>
			</section>
		</main>
	</div>
</AppCanvasShell>
