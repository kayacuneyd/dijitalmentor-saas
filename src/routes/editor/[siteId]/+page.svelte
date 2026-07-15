<script lang="ts">
	import { DraftStore } from '$lib/stores/draft.svelte';
	import ChatTab from './ChatTab.svelte';
	import ContentTab from './ContentTab.svelte';
	import ThemeTab from './ThemeTab.svelte';
	import PagesTab from './PagesTab.svelte';
	import LanguagesTab from './LanguagesTab.svelte';
	import SettingsTab from './SettingsTab.svelte';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import EditorDock from '$lib/ui/EditorDock.svelte';
	import ShareStoryButton from '$lib/share/ShareStoryButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import {
		buildCompletionChecklist,
		nextChecklistItem,
		type CompletionChecklistItem
	} from '$lib/editor/completionChecklist';
	import { siteQualityCheck } from '$lib/quality/siteQuality';
	import { checkCircleIcon, emptyCircleIcon, tabIcons, viewportIcons } from '$lib/editor/icons';
	import { flagSvgs } from '$lib/ui/flags';
	import { previewSitePath, publicSitePath } from '$lib/siteUrls';
	import { needsCustomPublicHandle, validatePublicHandle } from '$lib/publicHandle';
	import { uiIcons } from '$lib/ui/icons';

	let { data } = $props();

	// The store deliberately captures the load-time draft once; it is the source of
	// truth for this editing session (server data never changes underneath it).
	// svelte-ignore state_referenced_locally
	const store = new DraftStore(data.site);

	const tabs = ['Chat', 'Content', 'Theme', 'Pages', 'Languages', 'Settings'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Content');
	const tabLabels: Record<(typeof tabs)[number], string> = {
		Chat: 'Chat',
		Content: 'Content',
		Theme: 'Theme',
		Pages: 'Pages',
		Languages: 'Languages',
		Settings: 'Settings'
	};
	const localeLabels = { tr: 'Türkçe', en: 'English', de: 'Deutsch' } as const;

	const viewports = [
		{ id: 'mobile', label: 'Mobile', width: '375px' },
		{ id: 'tablet', label: 'Tablet', width: '768px' },
		{ id: 'desktop', label: 'Desktop', width: '100%' }
	] as const;
	let viewport = $state<(typeof viewports)[number]>(viewports[2]);

	/** All editing controls (tabs, checklist, quality control, locale/status/publish,
	 *  the "..." menu) live behind this FAB-triggered dock; the preview iframe below
	 *  stays mounted and visible at all times regardless of dock state. */
	let dockOpen = $state(false);
	let checklistOpen = $state(false);

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
	// svelte-ignore state_referenced_locally
	let publicHandle = $state(data.publicHandle);
	let publishing = $state(false);
	let publishNotice = $state<{
		tone: 'success' | 'error';
		title: string;
		message: string;
		version?: number;
	} | null>(null);
	// Deliberate initial-value capture: only show the first-run publish success
	// banner when opening the editor directly from onboarding.
	// svelte-ignore state_referenced_locally
	const initialPublishNotice: typeof publishNotice =
		data.fromOnboarding && data.publishedVersion
			? {
					tone: 'success',
					title: `Siten yayında v${data.publishedVersion}`,
					message:
						'İlk canlı subdomain snapshot hazır. Şimdi metinleri ve görselleri iyileştirip istediğinde tekrar yayınlayabilirsin.',
					version: data.publishedVersion
				}
			: null;
	if (initialPublishNotice) publishNotice = initialPublishNotice;
	let saveNotice = $state<{ tone: 'success' | 'error'; message: string } | null>(null);
	const liveUrl = $derived(
		`${data.appOrigin}${publicHandle}.${data.appHost}${publicSitePath(
			store.site,
			store.site.defaultLocale,
			store.site.pages[0].slug
		)}`
	);
	const checklist = $derived(
		buildCompletionChecklist(store.site, { publishedVersion, publicHandle })
	);
	const nextAction = $derived(nextChecklistItem(checklist));
	const quality = $derived(siteQualityCheck(store.site));
	const publishIdentityMissing = $derived(
		needsCustomPublicHandle({ siteId: store.site.id, publicHandle, publishedVersion })
	);
	const publicHandleValidation = $derived(validatePublicHandle(publicHandle ?? ''));
	const publishBlockers = $derived([
		...quality.blockers,
		...(publishIdentityMissing
			? [
					{
						severity: 'blocker' as const,
						code: 'public_handle_missing',
						path: 'publicHandle',
						message: publicHandleValidation.ok
							? 'İlk yayından önce okunabilir bir public subdomain seç.'
							: publicHandleValidation.message
					}
				]
			: [])
	]);
	const canPublish = $derived(quality.canPublish && !publishIdentityMissing);
	const hasUnpublishedChanges = $derived(store.status !== 'saved');

	async function saveNow() {
		saveNotice = null;
		const ok = await store.save();
		saveNotice = ok
			? { tone: 'success', message: 'Taslak kaydedildi.' }
			: { tone: 'error', message: store.lastSaveError ?? 'Taslak kaydedilemedi.' };
	}

	/** Draft → immutable published snapshot. Flushes every pending edit first — a plain
	 *  `save()` can resolve while a newer edit is still unsent, which is exactly how
	 *  publish used to snapshot a stale draft. The current draft also travels in the
	 *  publish request body as a belt-and-braces guarantee against that race. */
	async function publish() {
		publishing = true;
		publishNotice = null;
		try {
			const flushed = await store.flush();
			if (!flushed) {
				publishNotice = {
					tone: 'error',
					title: 'Yayın iptal edildi',
					message:
						store.lastSaveError ?? 'Son taslak kaydedilemedi. Bağlantıyı kontrol edip tekrar dene.'
				};
				return;
			}
			if (!canPublish) {
				activeTab = publishIdentityMissing ? 'Settings' : 'Content';
				dockOpen = true;
				publishNotice = {
					tone: 'error',
					title: 'Yayın için eksik var',
					message:
						publishBlockers[0]?.message ??
						'Yayınlamadan önce kalite kontrolündeki engelleri tamamla.'
				};
				return;
			}
			const res = await fetch(`/api/sites/${store.site.id}/publish`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ draft: $state.snapshot(store.site) })
			});
			const body = await res.json();
			if (res.ok && body.ok) {
				publishedVersion = body.version;
				publishNotice = {
					tone: 'success',
					title: `Published v${body.version}`,
					message:
						'Canlı subdomain yeni snapshot ile güncellendi. Canlı link aynı locale ve sayfayı açar.',
					version: body.version
				};
			} else if (body.quality?.blockers?.length) {
				publishNotice = {
					tone: 'error',
					title: 'Yayın kalite kontrolünde durdu',
					message: body.quality.blockers[0].message
				};
			} else {
				publishNotice = {
					tone: 'error',
					title: 'Yayın başarısız',
					message: body.message ?? 'Publish failed — please try again.'
				};
			}
		} catch {
			publishNotice = {
				tone: 'error',
				title: 'Yayın isteği gönderilemedi',
				message: 'Ağ bağlantısı veya sunucu yanıtı kesildi. Taslağı kaydedip tekrar dene.'
			};
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
		dockOpen = true;
	}
</script>

<svelte:head>
	<title>Editor · {store.site.settings.siteName}</title>
</svelte:head>

<AppCanvasShell
	label={`saaskaya.app / editor / ${store.site.id}`}
	max="max-w-[96rem]"
	minHeight="h-[calc(100dvh-1rem)] sm:h-[calc(100svh-2.5rem)]"
	contentClass=""
	flush
>
	<div
		class="flex min-h-[calc(100dvh-4.25rem)] flex-col overflow-visible bg-[var(--sk-card)] text-[var(--sk-ink)] lg:h-full lg:min-h-0 lg:overflow-hidden"
	>
		<!-- Top bar: only the viewport switcher stays permanently visible. Everything
		     else (locale, status, publish, overflow menu, tabs, checklist, quality
		     control) lives inside the FAB-triggered EditorDock below, so the preview
		     stays clean by default at every viewport. -->
		<div class="flex shrink-0 items-center gap-2 border-b border-[var(--sk-line)] px-3 py-2">
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
		</div>

		<div class="flex min-h-0 flex-1 overflow-visible lg:overflow-hidden">
			<EditorDock bind:open={dockOpen}>
				<button
					type="button"
					class="absolute right-3 top-3 z-20 inline-flex size-9 items-center justify-center rounded-full border border-[var(--sk-line-strong)] bg-[var(--sk-card)] text-[var(--sk-ink)] shadow-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(23_22_20/.24)]"
					aria-label="Paneli kapat"
					onclick={() => (dockOpen = false)}
				>
					{@html uiIcons.x(16)}
				</button>
				<header
					class="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--sk-line)] py-3 pr-14 pl-4"
				>
					<div class="flex min-w-0 items-center gap-2">
						<a
							href="/dashboard"
							class="sk-btn sk-btn-ghost sk-btn-sm"
							aria-label="saaskaya dashboard"
						>
							{@html uiIcons.arrowLeft(13)} Dashboard
						</a>
						<h1 class="truncate text-sm font-semibold">{store.site.settings.siteName}</h1>
					</div>
					<div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
						<div class="dropdown dropdown-end">
							<button
								tabindex="0"
								class="sk-btn sk-btn-ghost sk-btn-sm gap-1 px-1.5 text-[10px] font-bold"
								aria-label="Düzenleme dili"
							>
								<svg class="text-base-content/70 size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
									><path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" d="M12 21a9 9 0 1 0 0-18m0 18a9 9 0 1 1 0-18m0 18c2.761 0 3.941-5.163 3.941-9S14.761 3 12 3m0 18c-2.761 0-3.941-5.163-3.941-9S9.239 3 12 3M3.5 9h17m-17 6h17"
									/></svg
								>
								<span>{store.editLocale.toUpperCase()}</span>
							</button>
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<div
								tabindex="0"
								class="dropdown-content bg-base-200 text-base-content rounded-box z-20 mt-1 max-h-44 w-44 overflow-y-auto border border-white/5 p-2 shadow-2xl outline outline-1 outline-black/5"
							>
								<ul class="menu menu-sm w-full">
									{#each store.site.locales as locale (locale)}
										<li>
											<button
												class:menu-active={store.editLocale === locale}
												onclick={() => (store.editLocale = locale)}
											>
												{@html flagSvgs[locale]}
												<span class="font-sans">{localeLabels[locale]}</span>
											</button>
										</li>
									{/each}
								</ul>
							</div>
						</div>
						<StatusPill tone={statusBadge[store.status].tone} class="shrink-0">
							{statusBadge[store.status].label}
						</StatusPill>
						<button
							class="sk-btn sk-btn-primary sk-btn-sm"
							onclick={publish}
							disabled={publishing}
							title={canPublish ? 'Publish' : 'Publish engelini görmek için tıkla'}
						>
							{#if publishing}<span class="loading loading-spinner loading-xs"></span>{/if}
							{#if !canPublish}
								Yayın engelini çöz
							{:else if publishedVersion}
								Republish
							{:else}
								Publish
							{/if}
						</button>
						<details class="relative">
							<summary
								class="sk-btn sk-btn-ghost sk-btn-sm cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden"
								aria-label="Diğer işlemler"
							>
								⋯
							</summary>
							<div
								class="absolute right-0 z-10 mt-1 flex w-56 flex-col gap-1 rounded-[10px] border border-[var(--sk-line-strong)] bg-[var(--sk-card)] p-2 shadow-lg"
							>
								<div class="px-2 py-1.5 text-[11px] text-[var(--sk-muted)]">
									{publishedVersion ? `Published v${publishedVersion}` : 'Not published'} ·
									{hasUnpublishedChanges ? 'Unsaved draft changes' : 'Saved draft'}
								</div>
								<button
									type="button"
									class="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[#171614]/5"
									onclick={saveNow}
								>
									Save now
								</button>
								<a
									href={savedPreviewSrc}
									target="_blank"
									class="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-[#171614]/5"
								>
									Saved preview {@html uiIcons.external(13)}
								</a>
							</div>
						</details>
					</div>
				</header>

				<div
					role="tablist"
					class="m-3 hidden shrink-0 grid-cols-3 gap-1 rounded-[10px] bg-[var(--sk-shell)] p-1 sm:grid"
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
				<details class="relative mx-3 mt-3 sm:hidden">
					<summary
						class="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-[10px] bg-[var(--sk-shell)] px-3 text-sm font-semibold [&::-webkit-details-marker]:hidden"
					>
						<span class="flex items-center gap-2">
							{@html tabIcons[activeTab]}
							{tabLabels[activeTab]}
						</span>
						<span aria-hidden="true">⌄</span>
					</summary>
					<div
						class="absolute left-0 right-0 z-20 mt-1 grid grid-cols-2 gap-1 rounded-[12px] border border-[var(--sk-line-strong)] bg-[var(--sk-card)] p-2 shadow-lg"
					>
						{#each tabs as tab (tab)}
							<button
								type="button"
								class="flex items-center gap-2 rounded-[8px] px-3 py-2 text-left text-sm {tabClass(
									tab
								)}"
								onclick={() => (activeTab = tab)}
							>
								{@html tabIcons[tab]}
								{tabLabels[tab]}
							</button>
						{/each}
					</div>
				</details>

				<div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
					<details
						class="mb-3 shrink-0 rounded-[12px] border border-[var(--sk-line)] bg-white/80 p-2"
						bind:open={checklistOpen}
					>
						<summary
							class="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden"
						>
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-1.5">
									<span class="badge badge-sm badge-secondary">Checklist</span>
									<span class="badge badge-sm">
										{checklist.filter((item) => item.complete).length}/{checklist.length}
									</span>
									<span class="truncate text-xs font-semibold">{nextAction.label}</span>
								</div>
								<p class="mt-1 truncate text-xs text-[var(--sk-muted)]">{nextAction.helper}</p>
							</div>
							<span class="sk-mono shrink-0 text-[10px] text-[var(--sk-faint)]">
								{checklistOpen ? 'Gizle' : 'Detay'}
							</span>
						</summary>
						<button
							type="button"
							class="sk-btn sk-btn-secondary sk-btn-sm mt-3 shrink-0"
							onclick={() => goToChecklistItem(nextAction)}
						>
							Aç
						</button>
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
					</details>

					<details
						class="mb-3 shrink-0 rounded-[12px] border p-2 {canPublish
							? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
							: 'border-red-200 bg-red-50/70 text-red-950'}"
					>
						<summary
							class="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden"
						>
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-1.5">
									<span class="badge badge-sm {canPublish ? 'badge-success' : 'badge-error'}">
										{canPublish ? 'Publish OK' : 'Blocked'}
									</span>
									{#if publishBlockers.length}
										<span class="badge badge-sm badge-error">{publishBlockers.length} engel</span>
									{/if}
									{#if quality.warnings.length}
										<span class="badge badge-sm badge-warning">{quality.warnings.length} uyarı</span
										>
									{/if}
									<span class="truncate text-xs font-semibold">
										{publishBlockers[0]?.message ??
											quality.warnings[0]?.message ??
											'Yayın için kritik engel yok'}
									</span>
								</div>
								<p class="mt-1 truncate text-xs opacity-75">
									Detayları görmek için aç; yalnızca kritik engeller publish'i durdurur.
								</p>
							</div>
						</summary>
						{#if publishBlockers.length || quality.warnings.length}
							<div class="mt-3 flex max-h-40 flex-col gap-2 overflow-y-auto">
								{#each [...publishBlockers, ...quality.warnings].slice(0, 6) as issue, i (`${issue.code}-${issue.path}-${i}`)}
									<div class="rounded-[10px] bg-white/80 px-3 py-2 text-xs leading-5">
										<div
											class={issue.severity === 'blocker'
												? 'font-semibold text-red-800'
												: 'font-semibold text-amber-800'}
										>
											{issue.severity === 'blocker' ? 'Engel' : 'Uyarı'} · {issue.code}
										</div>
										<div class="text-red-900/75">{issue.message}</div>
									</div>
								{/each}
							</div>
						{/if}
					</details>

					<div class={activeTab === 'Chat' ? 'min-h-[22rem] flex-1 overflow-hidden' : ''}>
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
							<SettingsTab
								{store}
								{publicHandle}
								onIdentitySaved={(handle) => {
									publicHandle = handle;
									publishNotice = null;
								}}
							/>
						{/if}
					</div>
				</div>
			</EditorDock>

			<!-- Preview: always visible, at every viewport — the dock floats above it. -->
			<section class="flex min-h-0 w-full min-w-0 flex-1 flex-col">
				{#if publishNotice}
					<div
						class="border-b px-4 py-3 text-sm {publishNotice.tone === 'success'
							? 'border-emerald-200 bg-emerald-50 text-emerald-900'
							: 'border-red-200 bg-red-50 text-red-900'}"
					>
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<div class="font-semibold">{publishNotice.title}</div>
								<p class="mt-0.5 text-xs leading-5 opacity-80">{publishNotice.message}</p>
							</div>
							{#if publishNotice.tone === 'success'}
								<div class="flex flex-wrap items-start gap-2">
									<a
										href={`${liveUrl}?v=${publishNotice.version ?? publishedVersion}`}
										target="_blank"
										class="sk-btn sk-btn-secondary sk-btn-sm"
									>
										Canlı siteyi aç {@html uiIcons.external(13)}
									</a>
									<ShareStoryButton
										siteName={store.site.settings.siteName}
										{liveUrl}
										locale={store.site.defaultLocale}
									/>
								</div>
							{/if}
						</div>
					</div>
				{/if}
				{#if saveNotice || store.status === 'error'}
					<div
						class="border-b px-4 py-2 text-xs {saveNotice?.tone === 'success' &&
						store.status !== 'error'
							? 'border-emerald-200 bg-emerald-50 text-emerald-900'
							: 'border-red-200 bg-red-50 text-red-900'}"
					>
						{saveNotice?.message ?? store.lastSaveError ?? 'Taslak kaydedilemedi.'}
					</div>
				{/if}

				<div
					class="flex min-h-0 flex-1 justify-center overflow-auto bg-[var(--sk-shell)] p-2 sm:p-4 lg:p-6"
				>
					<div
						class="relative h-full overflow-hidden rounded-[14px] border border-[var(--sk-line)] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,.35)] transition-[width] duration-200"
						style="width: {viewport.width}; max-width: 100%;"
					>
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
	</div>
</AppCanvasShell>
