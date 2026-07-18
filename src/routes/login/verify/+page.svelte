<script lang="ts">
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	const copy = $derived(
		{
			en: {
				title: 'This sign-in link is no longer valid',
				body: 'It may have expired or already been used. Sign-in links are single-use and valid for 15 minutes.',
				action: 'Request a new link',
				help: 'Get help',
				label: 'Secure sign-in'
			},
			tr: {
				title: 'Bu giriş bağlantısı artık geçerli değil',
				body: 'Süresi dolmuş veya daha önce kullanılmış olabilir. Giriş bağlantıları tek kullanımlıktır ve 15 dakika geçerlidir.',
				action: 'Yeni bağlantı iste',
				help: 'Yardım al',
				label: 'Güvenli giriş'
			},
			de: {
				title: 'Dieser Anmeldelink ist nicht mehr gültig',
				body: 'Er ist möglicherweise abgelaufen oder wurde bereits verwendet. Anmeldelinks sind einmalig und 15 Minuten gültig.',
				action: 'Neuen Link anfordern',
				help: 'Hilfe erhalten',
				label: 'Sichere Anmeldung'
			}
		}[locale]
	);
</script>

<svelte:head>
	<title>{copy.title} · saaskaya</title>
</svelte:head>

<AppCanvasShell label="saaskaya.app / verify" chrome={false}>
	<div class="flex min-h-[calc(100svh-1rem)] flex-col">
		<header
			class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-10"
		>
			<BrandMark href={l('/')} compact wordmark />
			<LanguageSwitcher {locale} variant="dropdown" />
		</header>

		<main class="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-10 sm:px-10">
			<section class="max-w-xl">
				<p class="sk-mono text-[10px] text-[var(--sk-error)]">{copy.label}</p>
				<h1 class="sk-display mt-4 text-[clamp(2.5rem,7vw,5rem)] leading-[0.98] tracking-[-0.03em]">
					{copy.title}
				</h1>
				<p class="mt-5 max-w-lg text-base leading-7 text-[var(--sk-muted)]">{copy.body}</p>
				<div class="mt-7 flex flex-wrap gap-3">
					<FlowbiteButton href={l('/login')} variant="primary">{copy.action}</FlowbiteButton>
					<FlowbiteButton href={l('/contact')} variant="secondary">{copy.help}</FlowbiteButton>
				</div>
			</section>
		</main>
	</div>
</AppCanvasShell>
