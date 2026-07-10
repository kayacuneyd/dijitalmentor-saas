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
				title: 'Finish your beta profile',
				home: 'Home',
				h1: 'A quick profile, then your website draft.',
				body: 'This helps saaskaya prepare the first website workflow for the right kind of business. No password needed; your magic link is your sign-in.',
				fullName: 'Full name',
				profession: 'Profession / business type',
				city: 'City',
				fullNamePlaceholder: 'Ada Smith',
				professionPlaceholder: 'Psychologist',
				cityPlaceholder: 'Berlin',
				submit: 'Continue to website builder'
			},
			tr: {
				title: 'Beta profilini tamamla',
				home: 'Anasayfa',
				h1: 'Kısa profil, sonra web sitesi taslağın.',
				body: 'Bu bilgiler saaskaya’nın ilk website akışını doğru işletme türüne göre hazırlamasına yardımcı olur. Şifre gerekmez; magic link girişin için yeterli.',
				fullName: 'Ad soyad',
				profession: 'Meslek / işletme türü',
				city: 'Şehir',
				fullNamePlaceholder: 'Ada Yılmaz',
				professionPlaceholder: 'Psikolog',
				cityPlaceholder: 'İstanbul',
				submit: 'Website oluşturucuya devam et'
			},
			de: {
				title: 'Beta-Profil abschließen',
				home: 'Startseite',
				h1: 'Kurzprofil, dann dein Website-Entwurf.',
				body: 'Diese Angaben helfen saaskaya, den ersten Website-Ablauf passend zu deinem Unternehmen vorzubereiten. Kein Passwort nötig; dein Magic Link ist dein Login.',
				fullName: 'Vollständiger Name',
				profession: 'Beruf / Unternehmenstyp',
				city: 'Stadt',
				fullNamePlaceholder: 'Ada Müller',
				professionPlaceholder: 'Psychologin',
				cityPlaceholder: 'Berlin',
				submit: 'Weiter zum Website-Builder'
			}
		}[locale]
	);
</script>

<svelte:head>
	<title>{copy.title} · saaskaya</title>
</svelte:head>

<AppCanvasShell label="saaskaya.app / beta profile">
	{#snippet right()}
		<a href={l('/')} class="sk-btn sk-btn-secondary sk-btn-sm">{copy.home}</a>
		<LanguageSwitcher {locale} />
	{/snippet}

	<div class="mx-auto grid w-full max-w-3xl gap-6 md:grid-cols-[0.85fr_1fr] md:items-center">
		<div>
			<a href={l('/')} class="sk-link text-sm text-[var(--sk-faint)]">← saaskaya</a>
			<h1 class="sk-display mt-4 text-4xl leading-tight">{copy.h1}</h1>
			<p class="mt-4 text-sm leading-6 text-[var(--sk-muted)]">{copy.body}</p>
		</div>

		<AppCard class="p-6 sm:p-8">
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
				<label class="flex flex-col gap-1 text-sm font-medium">
					{copy.fullName}
					<input
						name="fullName"
						required
						minlength="2"
						maxlength="100"
						value={data.profile?.fullName ?? ''}
						placeholder={copy.fullNamePlaceholder}
						class="sk-input text-[15px]"
						disabled={busy}
					/>
				</label>
				<label class="flex flex-col gap-1 text-sm font-medium">
					{copy.profession}
					<input
						name="profession"
						required
						minlength="2"
						maxlength="80"
						value={data.profile?.profession ?? ''}
						placeholder={copy.professionPlaceholder}
						class="sk-input text-[15px]"
						disabled={busy}
					/>
				</label>
				<label class="flex flex-col gap-1 text-sm font-medium">
					{copy.city}
					<input
						name="city"
						required
						minlength="2"
						maxlength="80"
						value={data.profile?.city ?? ''}
						placeholder={copy.cityPlaceholder}
						class="sk-input text-[15px]"
						disabled={busy}
					/>
				</label>
				{#if form?.message}
					<div class="sk-alert sk-alert-error text-xs">{form.message}</div>
				{/if}
				<button type="submit" class="sk-btn sk-btn-primary sk-btn-lg w-full" disabled={busy}>
					{#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
					{copy.submit}
				</button>
			</form>
		</AppCard>
	</div>
</AppCanvasShell>
