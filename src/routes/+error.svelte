<script lang="ts">
	import { page } from '$app/state';
	import { withLocale, type Locale } from '$lib/i18n';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';

	const copy = $derived(
		{
			tr: {
				notFound: {
					label: 'Sayfa bulunamadı',
					body: 'Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.'
				},
				failed: {
					label: 'Bir şeyler ters gitti',
					body: 'Sayfa yüklenirken beklenmeyen bir hata oluştu.'
				},
				cta: 'Ana sayfaya dön'
			},
			en: {
				notFound: {
					label: 'Page not found',
					body: 'The page you requested may have moved or may not exist.'
				},
				failed: {
					label: 'Something went wrong',
					body: 'An unexpected error occurred while loading this page.'
				},
				cta: 'Back home'
			},
			de: {
				notFound: {
					label: 'Seite nicht gefunden',
					body: 'Die gesuchte Seite wurde verschoben oder existiert nicht.'
				},
				failed: {
					label: 'Etwas ist schiefgelaufen',
					body: 'Beim Laden dieser Seite ist ein unerwarteter Fehler aufgetreten.'
				},
				cta: 'Zur Startseite'
			}
		}[(page.data.locale as Locale | undefined) ?? 'en']
	);
	const message = $derived(page.status === 404 ? copy.notFound : copy.failed);
	const home = $derived(withLocale((page.data.locale as Locale | undefined) ?? 'en', '/'));
</script>

<main class="flex min-h-dvh flex-col bg-[var(--sk-card)] text-[var(--sk-ink)]">
	<header class="border-b border-[var(--sk-line)] bg-[rgb(251_250_247/.86)] px-4 py-3 sm:px-6">
		<BrandMark href={home} compact />
	</header>
	<section class="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-12 sm:px-6">
		<div class="w-full border-l border-[var(--sk-line-strong)] pl-5 sm:pl-8">
			<p class="sk-mono text-xs text-[var(--sk-faint)]">{page.status}</p>
			<h1 class="mt-3 font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">
				{message.label}
			</h1>
			<p class="mt-3 max-w-lg text-sm leading-6 text-[var(--sk-muted)]">{message.body}</p>
			<div class="mt-6">
				<FlowbiteButton href={home} variant="primary">{copy.cta}</FlowbiteButton>
			</div>
		</div>
	</section>
</main>
