<script lang="ts">
	import { goto } from '$app/navigation';
	import { withLocale, type Locale } from '$lib/i18n';
	import { uiIcons } from '$lib/ui/icons';

	let {
		locale,
		class: className = ''
	}: {
		locale: Locale;
		class?: string;
	} = $props();

	const l = (path: string) => withLocale(locale, path);
	let prompt = $state('');

	const copy = $derived(
		{
			en: {
				label: 'Start with one sentence',
				placeholder: 'I am a dietitian and want a booking-ready site for online counseling...',
				send: 'Start'
			},
			tr: {
				label: 'Tek cümleyle başla',
				placeholder:
					'Ben diyetisyenim, online danışmanlık için randevu odaklı bir site istiyorum...',
				send: 'Başla'
			},
			de: {
				label: 'Mit einem Satz starten',
				placeholder: 'Ich bin Ernährungsberaterin und brauche eine Website mit Termin-Anfragen...',
				send: 'Start'
			}
		}[locale]
	);

	async function start() {
		const value = prompt.trim();
		if (value && typeof window !== 'undefined') {
			window.localStorage.setItem('saaskaya.promptSeed', value);
		}
		await goto(l('/new'));
	}
</script>

<form
	class="sk-prompt-composer {className}"
	aria-label={copy.label}
	onsubmit={(event) => {
		event.preventDefault();
		void start();
	}}
>
	<label class="sr-only" for="hero-prompt">{copy.label}</label>
	<input id="hero-prompt" bind:value={prompt} placeholder={copy.placeholder} autocomplete="off" />
	<button type="submit" aria-label={copy.send}>
		{@html uiIcons.arrowRight(18)}
	</button>
</form>
