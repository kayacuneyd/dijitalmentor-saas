<script lang="ts">
	import { DraftStore } from '$lib/stores/draft.svelte';
	import ChatTab from './ChatTab.svelte';
	import ContentTab from './ContentTab.svelte';
	import ThemeTab from './ThemeTab.svelte';
	import PagesTab from './PagesTab.svelte';
	import LanguagesTab from './LanguagesTab.svelte';
	import SettingsTab from './SettingsTab.svelte';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import {
		buildCompletionChecklist,
		nextChecklistItem,
		type CompletionChecklistItem
	} from '$lib/editor/completionChecklist';
	import { siteQualityCheck } from '$lib/quality/siteQuality';
	import { checkCircleIcon, emptyCircleIcon, tabIcons, viewportIcons } from '$lib/editor/icons';
	import { flagSvgs } from '$lib/ui/flags';
	import { previewSitePath } from '$lib/siteUrls';

	let { data } = $props();

	// The store deliberately captures the load-time draft once; it is the source of
	// truth for this editing session (server data never changes underneath it).
	// svelte-ignore state_referenced_locally
	const store = new DraftStore(data.site);

	const tabs = ['Chat', 'Content', 'Theme', 'Pages', 'Languages', 'Settings'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Content');

	const viewports = [
		{ id: 'mobile', label: 'Mobile', width: '375px' },
		{ id: 'tablet', label: 'Tablet', width: '768px' },
		{ id: 'desktop', label: 'Desktop', width: '100%' }
	] as const;
	let viewport = $state<(typeof viewports)[number]>(viewports[2]);

	let iframeEl = $state<HTMLIFrameElement>();
	const previewSrc = $derived(
		previewSitePath(store.site.id, store.currentSlug, store.editLocale, 'live')
	);
	const savedPreviewSrc = $derived(
		previewSitePath(store.site.id, store.currentSlug, store.editLocale, 'persisted')
	);

	/** Live bridge: push the current draft into the iframe — in-place re-render, no reload. */
	function sendDraft() {
		iframeEl?.contentWindow?.postMessage(
			{ type: 'saaskaya:draft', site: $state.snapshot(store.site) },
			window.location.origin
		);
	}
	store.onChange(sendDraft);

	// Deliberate initial-value capture, like the store above: publish state for THIS
	// editing session; later changes come from our own publish() call, not the server.
	// svelte-ignore state_referenced_locally
	let publishedVersion = $state(data.publishedVersion);
	let publishing = $state(false);
	const checklist = $derived(buildCompletionChecklist(store.site, { publishedVersion }));
	const nextAction = $derived(nextChecklistItem(checklist));
	const quality = $derived(siteQualityCheck(store.site));

	/** Draft → immutable published snapshot. Flushes every pending edit first — a plain
	 *  `save()` can resolve while a newer edit is still unsent, which is exactly how
	 *  publish used to snapshot a stale draft. The current draft also travels in the
	 *  publish request body as a belt-and-braces guarantee against that race. */
	async function publish() {
		publishing = true;
		try {
			const flushed = await store.flush();
			if (!flushed) {
				alert('Kaydetme başarısız oldu — yayın iptal edildi. Lütfen tekrar dene.');
				return;
			}
			const res = await fetch(`/api/sites/${store.site.id}/publish`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ draft: $state.snapshot(store.site) })
			});
			const body = await res.json();
			if (res.ok && body.ok) publishedVersion = body.version;
			else if (body.quality?.blockers?.length) {
				alert(`Publish blocked: ${body.quality.blockers[0].message}`);
			} else alert(body.message ?? 'Publish failed — please try again.');
		} finally {
			publishing = false;
		}
	}

	const statusBadge = {
		saved: { label: 'Saved', tone: 'success' },
		dirty: { label: 'Unsaved', tone: 'warning' },
		saving: { label: 'Saving…', tone: 'neutral' },
		error: { label: 'Save failed', tone: 'error' }
	} as const;

	const tabClass = (tab: (typeof tabs)[number]) =>
		activeTab === tab ? 'bg-[#171614] text-[#f3ecdd]' : 'text-[var(--sk-muted)] hover:bg-white/70';

	function goToChecklistItem(item: CompletionChecklistItem) {
		activeTab = item.tab;
	}
</script>

<svelte:head>
	<title>Editor · {store.site.settings.siteName}</title>
</svelte:head>

<AppCanvasShell
	label={`saaskaya.app / editor / ${store.site.id}`}
	minHeight="h-[calc(100svh-2.5rem)]"
	contentClass=""
	flush
>
	{#snippet right()}
		<a href="/dashboard" class="sk-btn sk-btn-secondary sk-btn-sm">Dashboard</a>
	{/snippet}

	<div class="flex h-full min-h-0 overflow-hidden bg-[var(--sk-card)] text-[var(--sk-ink)]">
		<!-- Left sidebar -->
		<aside
			class="flex w-[22rem] max-w-[88vw] shrink-0 flex-col border-r border-[var(--sk-line)] bg-[var(--sk-card)]"
		>
			<header
				class="flex items-start justify-between gap-3 border-b border-[var(--sk-line)] px-4 py-4"
			>
				<div class="min-w-0">
					<BrandMark compact />
					<h1 class="mt-3 truncate text-sm font-semibold">{store.site.settings.siteName}</h1>
				</div>
				<StatusPill tone={statusBadge[store.status].tone} class="shrink-0">
					{statusBadge[store.status].label}
				</StatusPill>
			</header>

			<div
				role="tablist"
				class="m-3 grid shrink-0 grid-cols-3 gap-1 rounded-[10px] bg-[var(--sk-shell)] p-1"
			>
				{#each tabs as tab (tab)}
					<button
						role="tab"
						class="flex flex-col items-center gap-1 rounded-[7px] px-2 py-2 text-[10px] font-medium transition {tabClass(
							tab
						)}"
						onclick={() => (activeTab = tab)}
					>
						{@html tabIcons[tab]}
						{tab}
					</button>
				{/each}
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
				<div class="sk-card mb-4 p-4">
					<div class="flex items-start justify-between gap-3">
						<div>
							<div class="sk-mono text-[10px] text-[var(--sk-faint)]">İlk yayın checklist</div>
							<h2 class="mt-1 text-sm font-semibold">Sıradaki adım: {nextAction.label}</h2>
							<p class="mt-1 text-xs leading-5 text-[var(--sk-muted)]">{nextAction.helper}</p>
						</div>
						<button
							type="button"
							class="sk-btn sk-btn-secondary sk-btn-sm shrink-0"
							onclick={() => goToChecklistItem(nextAction)}
						>
							Aç
						</button>
					</div>
					<div class="mt-3 flex flex-col gap-2">
						{#each checklist as item (item.id)}
							<button
								type="button"
								class="flex items-start gap-2 rounded-[10px] px-2 py-1.5 text-left text-xs transition hover:bg-[var(--sk-shell)]"
								onclick={() => goToChecklistItem(item)}
							>
								<span class="mt-0.5 shrink-0 {item.complete ? '' : 'text-amber-700'}">
									{@html item.complete ? checkCircleIcon() : emptyCircleIcon()}
								</span>
								<span class={item.complete ? 'text-[var(--sk-muted)]' : 'text-[var(--sk-ink)]'}>
									{item.label}
								</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="sk-card mb-4 p-4">
					<div class="flex items-start justify-between gap-3">
						<div>
							<div class="sk-mono text-[10px] text-[var(--sk-faint)]">Kalite kontrol</div>
							<h2 class="mt-1 text-sm font-semibold">
								{quality.blockers.length
									? `${quality.blockers.length} yayın engeli var`
									: quality.warnings.length
										? `${quality.warnings.length} uyarı var`
										: 'Yayın için kritik engel yok'}
							</h2>
							<p class="mt-1 text-xs leading-5 text-[var(--sk-muted)]">
								Engeller yayınlamayı durdurur; uyarılar yayınlanabilir ama gözden geçirilmelidir.
							</p>
						</div>
						<span
							class="rounded-full px-2 py-1 text-[10px] font-semibold {quality.canPublish
								? 'bg-emerald-100 text-emerald-800'
								: 'bg-red-100 text-red-800'}"
						>
							{quality.canPublish ? 'Publish OK' : 'Blocked'}
						</span>
					</div>
					{#if quality.issues.length}
						<div class="mt-3 flex max-h-40 flex-col gap-2 overflow-y-auto">
							{#each quality.issues.slice(0, 6) as issue (`${issue.code}-${issue.path}`)}
								<div class="rounded-[10px] bg-[var(--sk-shell)] px-3 py-2 text-xs leading-5">
									<div
										class={issue.severity === 'blocker'
											? 'font-semibold text-red-800'
											: 'font-semibold text-amber-800'}
									>
										{issue.severity === 'blocker' ? 'Engel' : 'Uyarı'} · {issue.code}
									</div>
									<div class="text-[var(--sk-muted)]">{issue.message}</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				{#if activeTab === 'Chat'}
					<ChatTab {store} history={data.chatHistory} />
				{:else if activeTab === 'Content'}
					<ContentTab {store} />
				{:else if activeTab === 'Theme'}
					<ThemeTab {store} />
				{:else if activeTab === 'Pages'}
					<PagesTab {store} />
				{:else if activeTab === 'Languages'}
					<LanguagesTab {store} />
				{:else}
					<SettingsTab {store} />
				{/if}
			</div>
		</aside>

		<!-- Right: toolbar + preview -->
		<section class="flex min-w-0 flex-1 flex-col">
			<div
				class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--sk-line)] bg-[var(--sk-card)] px-4 py-3"
			>
				<div class="flex gap-1 rounded-[10px] bg-[var(--sk-shell)] p-1">
					{#each viewports as vp (vp.id)}
						<button
							class="sk-btn sk-btn-sm {viewport.id === vp.id ? 'sk-btn-primary' : 'sk-btn-ghost'}"
							onclick={() => (viewport = vp)}
							aria-label={vp.label}
							aria-pressed={viewport.id === vp.id}
							title={vp.label}
						>
							{@html viewportIcons[vp.id]}
						</button>
					{/each}
				</div>
				<div class="flex items-center gap-2">
					<div class="flex gap-1 rounded-[10px] bg-[var(--sk-shell)] p-1">
						{#each store.site.locales as locale (locale)}
							<button
								type="button"
								class="inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1 text-[10.5px] font-medium transition {store.editLocale ===
								locale
									? 'bg-[#171614] text-[#f3ecdd]'
									: 'text-[var(--sk-muted)] hover:bg-white/70'}"
								onclick={() => (store.editLocale = locale)}
								aria-pressed={store.editLocale === locale}
								aria-label={`Düzenleme dili: ${locale.toUpperCase()}`}
							>
								{@html flagSvgs[locale]}
								{locale.toUpperCase()}
							</button>
						{/each}
					</div>
					<button class="sk-btn sk-btn-secondary sk-btn-sm" onclick={() => store.save()}
						>Save now</button
					>
					<a href={savedPreviewSrc} target="_blank" class="sk-btn sk-btn-ghost sk-btn-sm"
						>Saved preview ↗</a
					>
					<button
						class="sk-btn sk-btn-primary sk-btn-sm"
						onclick={publish}
						disabled={publishing || !quality.canPublish}
						title={quality.canPublish ? 'Publish' : 'Fix quality blockers before publishing'}
					>
						{#if publishing}<span class="loading loading-spinner loading-xs"></span>{/if}
						{publishedVersion ? `Republish (v${publishedVersion} live)` : 'Publish'}
					</button>
				</div>
			</div>

			<div class="flex min-h-0 flex-1 justify-center overflow-auto bg-[var(--sk-shell)] p-4 sm:p-6">
				<div
					class="relative h-full overflow-hidden rounded-[14px] border border-[var(--sk-line)] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,.35)] transition-[width] duration-200"
					style="width: {viewport.width}; max-width: 100%;"
				>
					<div
						class="pointer-events-none absolute top-3 left-3 z-10 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#171614] shadow-sm backdrop-blur"
					>
						Live draft
					</div>
					<iframe
						bind:this={iframeEl}
						src={previewSrc}
						onload={sendDraft}
						title="Site preview"
						class="h-full w-full"
					></iframe>
				</div>
			</div>
		</section>
	</div>
</AppCanvasShell>
