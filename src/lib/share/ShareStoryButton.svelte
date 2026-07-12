<script lang="ts">
	import { renderStoryCard } from '$lib/share/storyCard';
	import { shareStory } from '$lib/share/webShare';
	import type { Locale } from '$lib/i18n';

	let {
		siteName,
		liveUrl,
		locale = 'tr',
		class: className = 'sk-btn sk-btn-secondary sk-btn-sm'
	}: {
		siteName: string;
		liveUrl: string;
		locale?: Locale;
		class?: string;
	} = $props();

	const copy = $derived(
		{
			tr: {
				share: 'Story olarak paylaş',
				preparing: 'Hazırlanıyor…',
				copied: 'Link kopyalandı — story’ne Link etiketi olarak ekleyebilirsin.',
				fallback: 'Kartı indir, Instagram’da galeriden story olarak paylaş:',
				download: 'Kartı indir'
			},
			en: {
				share: 'Share as story',
				preparing: 'Preparing…',
				copied: 'Link copied — add it to your story as a Link sticker.',
				fallback: 'Save the card, then share it as a story from your gallery:',
				download: 'Save card'
			},
			de: {
				share: 'Als Story teilen',
				preparing: 'Wird vorbereitet…',
				copied: 'Link kopiert — füge ihn als Link-Sticker hinzu.',
				fallback: 'Karte speichern und aus der Galerie als Story teilen:',
				download: 'Karte speichern'
			}
		}[locale]
	);

	let busy = $state(false);
	let toast = $state(false);
	let downloadUrl = $state<string | null>(null);
	let downloadName = $state('story.png');

	async function share() {
		if (busy) return;
		busy = true;
		try {
			const file = await renderStoryCard({ siteName, liveUrl, locale });
			const outcome = await shareStory({ file, url: liveUrl, text: `${siteName} · ${liveUrl}` });
			if (outcome !== 'cancelled') {
				toast = true;
				setTimeout(() => (toast = false), 6000);
			}
			if (outcome === 'fallback') {
				if (downloadUrl) URL.revokeObjectURL(downloadUrl);
				downloadUrl = URL.createObjectURL(file);
				downloadName = file.name;
			}
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex flex-col gap-2" data-testid="share-story">
	<button type="button" class={className} onclick={share} disabled={busy}>
		{#if busy}<span class="loading loading-spinner loading-xs"></span>{copy.preparing}
		{:else}{copy.share}{/if}
	</button>
	{#if toast}
		<p class="text-xs leading-5 text-emerald-800" data-testid="share-story-toast">{copy.copied}</p>
	{/if}
	{#if downloadUrl}
		<p class="text-xs leading-5 opacity-80" data-testid="share-story-fallback">
			{copy.fallback}
			<a href={downloadUrl} download={downloadName} class="underline">{copy.download}</a>
		</p>
	{/if}
</div>
