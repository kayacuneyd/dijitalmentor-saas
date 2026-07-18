<script lang="ts">
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import { canShareFiles, shareStory } from '$lib/share/webShare';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);

	const copy = $derived(
		{
			en: {
				title: 'Share saaskaya · Post it to your story',
				description:
					'Pick a visual or video and post it to your Instagram story in one tap — help a friend launch their website with AI.',
				kicker: 'Support saaskaya',
				h1: 'Post it to your story in one tap.',
				lead: 'Pick a visual below and hit share — the link is copied automatically so you can add it as a Link sticker.',
				share: 'Share to your story',
				preparing: 'Preparing…',
				copied: 'Link copied — add it to your story as a Link sticker.',
				fallbackTitle: 'Save it, then share it',
				fallbackSteps: [
					'Save the file to your phone.',
					'Open Instagram and create a new story from your gallery.',
					'Add the copied link with a Link sticker.'
				],
				download: 'Save file',
				desktopTitle: 'On a computer?',
				desktopBody: 'Open this page on your phone to share directly:',
				copyLink: 'Copy link',
				defaultText: 'Launch a multilingual website with AI — saaskaya.com'
			},
			tr: {
				title: 'saaskaya’yı paylaş · Story’ne tek dokunuşla ekle',
				description:
					'Bir görsel ya da video seç, tek dokunuşla Instagram story’ne ekle — bir arkadaşının AI ile web sitesi kurmasına yardım et.',
				kicker: 'saaskaya’ya destek ol',
				h1: 'Story’ne tek dokunuşla ekle.',
				lead: 'Aşağıdan bir görsel seç ve paylaş’a bas — link otomatik kopyalanır, story’ne Link etiketi olarak ekleyebilirsin.',
				share: 'Story’de paylaş',
				preparing: 'Hazırlanıyor…',
				copied: 'Link kopyalandı — story’ne Link etiketi olarak ekleyebilirsin.',
				fallbackTitle: 'Önce kaydet, sonra paylaş',
				fallbackSteps: [
					'Dosyayı telefonuna kaydet.',
					'Instagram’ı aç, galeriden yeni bir story oluştur.',
					'Kopyalanan linki Link etiketiyle ekle.'
				],
				download: 'Dosyayı kaydet',
				desktopTitle: 'Bilgisayarda mısın?',
				desktopBody: 'Doğrudan paylaşmak için bu sayfayı telefonundan aç:',
				copyLink: 'Linki kopyala',
				defaultText: 'AI ile çok dilli web siteni dakikalar içinde kur — saaskaya.com'
			},
			de: {
				title: 'saaskaya teilen · Mit einem Tipp in deine Story',
				description:
					'Wähle ein Bild oder Video und poste es mit einem Tipp in deine Instagram-Story — hilf jemandem, seine Website mit KI zu starten.',
				kicker: 'Unterstütze saaskaya',
				h1: 'Mit einem Tipp in deine Story.',
				lead: 'Wähle unten ein Motiv und tippe auf Teilen — der Link wird automatisch kopiert, füge ihn als Link-Sticker hinzu.',
				share: 'In der Story teilen',
				preparing: 'Wird vorbereitet…',
				copied: 'Link kopiert — füge ihn als Link-Sticker in deine Story ein.',
				fallbackTitle: 'Erst speichern, dann teilen',
				fallbackSteps: [
					'Datei auf dem Handy speichern.',
					'Instagram öffnen und eine Story aus der Galerie erstellen.',
					'Den kopierten Link als Link-Sticker hinzufügen.'
				],
				download: 'Datei speichern',
				desktopTitle: 'Am Computer?',
				desktopBody: 'Öffne diese Seite auf deinem Handy, um direkt zu teilen:',
				copyLink: 'Link kopieren',
				defaultText: 'Starte deine mehrsprachige Website mit KI — saaskaya.com'
			}
		}[locale]
	);

	let featuredIndex = $state(0);
	let busy = $state(false);
	let showInstructions = $state(false);
	let copiedToast = $state(false);
	let fileShareSupported = $state<boolean | null>(null);

	const featured = $derived(data.assets[featuredIndex]);
	const featuredCaption = $derived(featured.caption[locale] ?? copy.defaultText);
	const assetPath = (id: string) => `/share/asset/${id}`;

	// Prefetched blob per asset — share() must fire inside the tap's user-gesture
	// window on iOS, so the bytes need to be local before the tap.
	const blobs = new Map<string, Promise<Blob>>();
	function prefetch(id: string): Promise<Blob> {
		let pending = blobs.get(id);
		if (!pending) {
			pending = fetch(assetPath(id)).then((res) => {
				if (!res.ok) throw new Error(`asset ${res.status}`);
				return res.blob();
			});
			pending.catch(() => blobs.delete(id));
			blobs.set(id, pending);
		}
		return pending;
	}

	$effect(() => {
		fileShareSupported = canShareFiles();
	});
	$effect(() => {
		if (featured) void prefetch(featured.id).catch(() => undefined);
	});

	async function share() {
		if (busy) return;
		busy = true;
		showInstructions = false;
		try {
			const blob = await prefetch(featured.id);
			const file = new File([blob], featured.fileName, { type: featured.mimeType });
			const outcome = await shareStory({ file, url: data.pageUrl, text: featuredCaption });
			copiedToast = outcome !== 'cancelled';
			if (outcome === 'fallback') showInstructions = true;
			if (copiedToast) setTimeout(() => (copiedToast = false), 6000);
		} catch {
			showInstructions = true;
		} finally {
			busy = false;
		}
	}

	async function copyLink() {
		await navigator.clipboard?.writeText(data.pageUrl).catch(() => undefined);
		copiedToast = true;
		setTimeout(() => (copiedToast = false), 6000);
	}
</script>

<SeoHead
	{locale}
	path="/share"
	title={copy.title}
	description={copy.description}
	image={data.assets.find((asset) => asset.kind === 'image')?.url}
/>

<PublicShell
	{locale}
	currentPath="/share"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / share"
>
	<MarketingSection as="section" class="grid gap-8 py-10 sm:py-14 lg:grid-cols-[.9fr_1.1fr]">
		<div class="order-2 lg:order-1">
			<div class="sk-mono text-[10.5px] text-[var(--sk-faint)] uppercase">{copy.kicker}</div>
			<h1 class="sk-display mt-3 text-3xl leading-tight sm:text-[40px]">{copy.h1}</h1>
			<p class="mt-3 max-w-xl text-[15px] leading-7 text-[var(--sk-muted)]">{copy.lead}</p>

			<div class="mt-6 flex flex-col gap-3">
				<FlowbiteButton
					variant="primary"
					size="lg"
					class="w-full sm:w-auto"
					onclick={share}
					disabled={busy}
					loading={busy}
					data-testid="share-button"
				>
					{#if busy}{copy.preparing}
					{:else}{copy.share}{/if}
				</FlowbiteButton>

				{#if copiedToast}
					<div class="sk-alert sk-alert-success text-sm" data-testid="copied-toast">
						{copy.copied}
					</div>
				{/if}

				{#if showInstructions || fileShareSupported === false}
					<div class="sk-card p-4" data-testid="share-fallback">
						<h2 class="text-sm font-semibold">{copy.fallbackTitle}</h2>
						<ol class="mt-2 flex flex-col gap-1.5 text-sm leading-6 text-[var(--sk-muted)]">
							{#each copy.fallbackSteps as step, i (step)}
								<li>{i + 1}. {step}</li>
							{/each}
						</ol>
						<FlowbiteButton
							href={assetPath(featured.id)}
							download={featured.fileName}
							variant="secondary"
							size="sm"
							class="mt-3"
						>
							{copy.download}
						</FlowbiteButton>
					</div>
				{/if}
			</div>

			<div class="sk-card mt-6 hidden p-4 lg:block" data-testid="desktop-qr">
				<h2 class="text-sm font-semibold">{copy.desktopTitle}</h2>
				<p class="mt-1 text-sm leading-6 text-[var(--sk-muted)]">{copy.desktopBody}</p>
				<div class="mt-3 flex items-center gap-4">
					<div class="w-28 shrink-0 overflow-hidden rounded-[10px] border border-[var(--sk-line)]">
						{@html data.qrSvg}
					</div>
					<FlowbiteButton type="button" variant="secondary" size="sm" onclick={copyLink}>
						{copy.copyLink}
					</FlowbiteButton>
				</div>
			</div>

			<p class="mt-6 text-xs leading-5 text-[var(--sk-faint)]">
				<a href={l('/')} class="sk-link underline">saaskaya.com</a>
			</p>
		</div>

		<div class="order-1 lg:order-2">
			<div
				class="mx-auto w-full max-w-[22rem] overflow-hidden rounded-[20px] border border-[var(--sk-line)] bg-[var(--sk-card)] shadow-[0_30px_60px_-35px_rgba(30,20,10,.4)]"
			>
				{#if featured.kind === 'video'}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video
						src={featured.url}
						muted
						playsinline
						loop
						autoplay
						preload="metadata"
						class="aspect-9/16 w-full object-cover"
						data-testid="featured-video"
					></video>
				{:else}
					<img
						src={featured.url}
						alt={featuredCaption}
						class="aspect-9/16 w-full object-cover"
						data-testid="featured-image"
					/>
				{/if}
			</div>
			<p class="mx-auto mt-3 max-w-[22rem] text-center text-sm leading-6 text-[var(--sk-muted)]">
				{featuredCaption}
			</p>

			{#if data.assets.length > 1}
				<div class="mx-auto mt-4 flex max-w-[22rem] flex-wrap justify-center gap-2">
					{#each data.assets as asset, index (asset.id)}
						<button
							type="button"
							class="w-14 overflow-hidden rounded-[8px] border-2 transition {index === featuredIndex
								? 'border-[var(--sk-ink)]'
								: 'border-transparent opacity-60 hover:opacity-100'}"
							onclick={() => {
								featuredIndex = index;
								showInstructions = false;
							}}
							aria-label={asset.fileName}
							aria-pressed={index === featuredIndex}
						>
							{#if asset.kind === 'video'}
								<!-- svelte-ignore a11y_media_has_caption -->
								<video
									src={asset.url}
									muted
									playsinline
									preload="metadata"
									class="aspect-9/16 w-full object-cover"
								></video>
							{:else}
								<img src={asset.url} alt="" class="aspect-9/16 w-full object-cover" />
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</MarketingSection>
</PublicShell>
