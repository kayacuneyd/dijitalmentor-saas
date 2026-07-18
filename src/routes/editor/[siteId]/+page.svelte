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
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import FlowbiteBadge from '$lib/ui/primitives/FlowbiteBadge.svelte';
	import ShareStoryButton from '$lib/share/ShareStoryButton.svelte';
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
	import {
		ArrowLeftOutline,
		ArrowUpRightFromSquareOutline,
		CloseOutline
	} from 'flowbite-svelte-icons';
	import { getTranslate } from '$lib/i18n/context';

	let { data } = $props();
	const t = getTranslate();

	// The store deliberately captures the load-time draft once; it is the source of
	// truth for this editing session (server data never changes underneath it).
	// svelte-ignore state_referenced_locally
	const store = new DraftStore(data.site);

	const tabs = ['Chat', 'Content', 'Theme', 'Pages', 'Languages', 'Settings'] as const;
	const primaryTabs = ['Chat', 'Content', 'Pages'] as const;
	const secondaryTabs = ['Theme', 'Languages', 'Settings'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Chat');
	const tabLabelKeys = {
		Chat: 'editor.shell.assistant',
		Content: 'editor.shell.fineTune',
		Theme: 'editor.shell.theme',
		Pages: 'editor.shell.pages',
		Languages: 'editor.shell.languages',
		Settings: 'editor.shell.settings'
	} as const;
	const localeLabels = { tr: 'Türkçe', en: 'English', de: 'Deutsch' } as const;

	const viewports = [
		{ id: 'mobile', labelKey: 'editor.shell.mobile', width: '375px' },
		{ id: 'tablet', labelKey: 'editor.shell.tablet', width: '768px' },
		{ id: 'desktop', labelKey: 'editor.shell.desktop', width: '100%' }
	] as const;
	let viewport = $state<(typeof viewports)[number]>(viewports[2]);

	/** The editor rail is open by default because conversation is the primary
	 *  workspace. Closing it creates a focused preview without unmounting the iframe. */
	let dockOpen = $state(true);
	let checklistOpen = $state(false);
	let localeMenuOpen = $state(false);

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
	const draftStatus = $derived(
		store.status === 'saving'
			? t('editor.shell.savingDraft')
			: store.status === 'error'
				? t('editor.shell.saveError')
				: hasUnpublishedChanges
					? t('editor.shell.unsavedDraft')
					: t('editor.shell.savedDraft')
	);

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

	const tabClass = (tab: (typeof tabs)[number]) =>
		activeTab === tab
			? 'bg-[var(--sk-ink)] text-[var(--sk-paper)]'
			: 'text-[var(--sk-muted)] hover:bg-white/70';
	const ActiveTabIcon = $derived(tabIcons[activeTab]);

	function goToChecklistItem(item: CompletionChecklistItem) {
		activeTab = item.tab;
		dockOpen = true;
	}
</script>

<svelte:head>
	<title>{t('editor.shell.title')} · {store.site.settings.siteName}</title>
</svelte:head>

<AppCanvasShell
	label={`saaskaya.app / editor / ${store.site.id}`}
	max="max-w-[96rem]"
	minHeight="h-[calc(100dvh-1rem)] sm:h-[calc(100svh-2.5rem)]"
	contentClass=""
	flush
>
	<div
		class="editor-workbench flex min-h-[calc(100dvh-4.25rem)] flex-col overflow-visible bg-[var(--sk-card)] text-[var(--sk-ink)] lg:h-full lg:min-h-0 lg:overflow-hidden"
	>
		<!-- Persistent workbench bar: navigation, draft truth, preview size and the
		     single live-site action stay visible while the rail changes modes. -->
		<div
			class="editor-workbench__toolbar flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--sk-line)] px-3 py-2"
		>
			<div class="flex min-w-0 items-center gap-2">
				<FlowbiteButton
					href="/dashboard"
					variant="ghost"
					size="sm"
					class="shrink-0"
					aria-label={t('editor.shell.dashboard')}
				>
					<ArrowLeftOutline size="xs" />
					<span class="hidden sm:inline">{t('editor.shell.dashboard')}</span>
				</FlowbiteButton>
				<div class="min-w-0">
					<div class="truncate text-sm font-semibold">{store.site.settings.siteName}</div>
					<div class="flex items-center gap-1.5 text-[10px] text-[var(--sk-muted)]">
						<span
							class="size-1.5 rounded-full {store.status === 'error'
								? 'bg-[var(--sk-error)]'
								: store.status === 'saved'
									? 'bg-[var(--sk-accent)]'
									: 'bg-[var(--sk-warn-ink)]'}"
						></span>
						<span>{draftStatus}</span>
					</div>
				</div>
			</div>

			<div class="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
				<div class="hidden gap-1 rounded-[var(--sk-radius-sm)] bg-[var(--sk-shell)] p-1 sm:flex">
					{#each viewports as vp (vp.id)}
						{@const ViewportIcon = viewportIcons[vp.id]}
						<FlowbiteButton
							variant={viewport.id === vp.id ? 'primary' : 'ghost'}
							size="sm"
							onclick={() => (viewport = vp)}
							aria-label={t(vp.labelKey)}
							aria-pressed={viewport.id === vp.id}
							title={t(vp.labelKey)}
						>
							<ViewportIcon size="sm" />
						</FlowbiteButton>
					{/each}
				</div>

				<div class="dropdown dropdown-end">
					<FlowbiteButton
						variant="ghost"
						size="sm"
						class="gap-1 !px-2 text-[10px] font-bold"
						aria-label={t('editor.shell.editLocale')}
						aria-haspopup="menu"
						aria-expanded={localeMenuOpen}
						onclick={() => (localeMenuOpen = !localeMenuOpen)}
					>
						<span>{store.editLocale.toUpperCase()}</span>
					</FlowbiteButton>
					{#if localeMenuOpen}
						<div class="sk-editor-dropdown-content right-0">
							<ul class="menu menu-sm w-full" role="menu">
								{#each store.site.locales as locale (locale)}
									<li>
										<button
											role="menuitemradio"
											aria-checked={store.editLocale === locale}
											class:menu-active={store.editLocale === locale}
											onclick={() => {
												store.editLocale = locale;
												localeMenuOpen = false;
											}}
										>
											{@html flagSvgs[locale]}
											<span class="font-sans">{localeLabels[locale]}</span>
										</button>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<FlowbiteButton
					variant="primary"
					size="sm"
					onclick={publish}
					disabled={publishing}
					loading={publishing}
					title={canPublish
						? publishedVersion
							? t('editor.shell.republish')
							: t('editor.shell.publish')
						: t('editor.shell.resolvePublish')}
				>
					{#if !canPublish}
						{t('editor.shell.resolvePublish')}
					{:else if publishedVersion}
						{t('editor.shell.republish')}
					{:else}
						{t('editor.shell.publish')}
					{/if}
				</FlowbiteButton>
			</div>
		</div>

		<div class="editor-workbench__body flex min-h-0 flex-1 overflow-visible lg:overflow-hidden">
			<EditorDock
				bind:open={dockOpen}
				label={t('editor.shell.openPanel')}
				closeLabel={t('editor.shell.closePanel')}
			>
				<button
					type="button"
					class="absolute top-3 right-3 z-20 inline-flex size-9 items-center justify-center rounded-full border border-[var(--sk-line-strong)] bg-[var(--sk-card)] text-[var(--sk-ink)] transition-[background-color] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sk-focus)]"
					aria-label={t('editor.shell.closePanel')}
					onclick={() => (dockOpen = false)}
				>
					<CloseOutline size="sm" />
				</button>
				<header
					class="flex shrink-0 items-center justify-between border-b border-[var(--sk-line)] py-3 pr-14 pl-4"
				>
					<div class="min-w-0">
						<p class="sk-mono text-[9px] text-[var(--sk-faint)]">
							{t('editor.shell.workbench')}
						</p>
						<h1 class="mt-1 truncate text-sm font-semibold">{store.site.settings.siteName}</h1>
					</div>
					<details class="relative">
						<summary
							class="sk-disclosure-trigger cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden"
							aria-label={t('editor.shell.moreTools')}
						>
							⋯
						</summary>
						<div
							class="absolute right-0 z-30 mt-1 flex w-60 flex-col gap-1 rounded-[var(--sk-radius-sm)] border border-[var(--sk-line-strong)] bg-[var(--sk-card)] p-2 shadow-[var(--sk-shadow-lg)]"
						>
							<div class="px-2 py-1.5 text-[11px] text-[var(--sk-muted)]">
								{publishedVersion
									? t('editor.shell.publishedVersion', { version: publishedVersion })
									: t('editor.shell.notPublished')} · {draftStatus}
							</div>
							<button
								type="button"
								class="w-full rounded-[var(--sk-radius-sm)] px-2 py-2 text-left text-sm hover:bg-[var(--sk-shell)] focus-visible:outline-2 focus-visible:outline-[var(--sk-focus)]"
								onclick={saveNow}
							>
								{t('editor.shell.saveNow')}
							</button>
							<a
								href={savedPreviewSrc}
								target="_blank"
								class="flex items-center justify-between rounded-[var(--sk-radius-sm)] px-2 py-2 text-sm hover:bg-[var(--sk-shell)] focus-visible:outline-2 focus-visible:outline-[var(--sk-focus)]"
							>
								{t('editor.shell.savedPreview')}
								<ArrowUpRightFromSquareOutline size="xs" />
							</a>
						</div>
					</details>
				</header>

				<div
					role="tablist"
					class="mx-3 mt-3 hidden shrink-0 grid-cols-3 gap-1 rounded-[var(--sk-radius-sm)] bg-[var(--sk-shell)] p-1 sm:grid"
				>
					{#each primaryTabs as tab (tab)}
						{@const TabIcon = tabIcons[tab]}
						<button
							role="tab"
							aria-selected={activeTab === tab}
							class="flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-2 py-2 text-xs font-medium transition-[background-color,color] {tabClass(
								tab
							)}"
							onclick={() => (activeTab = tab)}
						>
							<TabIcon size="sm" />
							{t(tabLabelKeys[tab])}
						</button>
					{/each}
				</div>
				<details class="relative mx-3 mt-2 hidden shrink-0 sm:block">
					<summary
						class="flex min-h-9 cursor-pointer list-none items-center justify-between rounded-[var(--sk-radius-sm)] px-3 text-xs font-medium text-[var(--sk-muted)] hover:bg-[var(--sk-shell)] [&::-webkit-details-marker]:hidden"
					>
						<span>{t('editor.shell.moreTools')}</span>
						<span aria-hidden="true">⌄</span>
					</summary>
					<div
						class="absolute right-0 left-0 z-20 mt-1 grid grid-cols-3 gap-1 rounded-[var(--sk-radius-sm)] border border-[var(--sk-line-strong)] bg-[var(--sk-card)] p-2 shadow-[var(--sk-shadow-lg)]"
					>
						{#each secondaryTabs as tab (tab)}
							{@const TabIcon = tabIcons[tab]}
							<button
								type="button"
								class="flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-2 py-2 text-xs {tabClass(
									tab
								)}"
								onclick={() => (activeTab = tab)}
							>
								<TabIcon size="sm" />
								{t(tabLabelKeys[tab])}
							</button>
						{/each}
					</div>
				</details>
				<details class="relative mx-3 mt-3 sm:hidden">
					<summary
						class="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-[10px] bg-[var(--sk-shell)] px-3 text-sm font-semibold [&::-webkit-details-marker]:hidden"
					>
						<span class="flex items-center gap-2">
							<ActiveTabIcon size="sm" />
							{t(tabLabelKeys[activeTab])}
						</span>
						<span aria-hidden="true">⌄</span>
					</summary>
					<div
						class="absolute left-0 right-0 z-20 mt-1 grid grid-cols-2 gap-1 rounded-[12px] border border-[var(--sk-line-strong)] bg-[var(--sk-card)] p-2 shadow-lg"
					>
						{#each tabs as tab (tab)}
							{@const TabIcon = tabIcons[tab]}
							<button
								type="button"
								class="flex items-center gap-2 rounded-[8px] px-3 py-2 text-left text-sm {tabClass(
									tab
								)}"
								onclick={() => (activeTab = tab)}
							>
								<TabIcon size="sm" />
								{t(tabLabelKeys[tab])}
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
									<FlowbiteBadge tone="neutral">{t('editor.shell.checklist')}</FlowbiteBadge>
									<FlowbiteBadge tone="neutral">
										{checklist.filter((item) => item.complete).length}/{checklist.length}
									</FlowbiteBadge>
									<span class="truncate text-xs font-semibold">{nextAction.label}</span>
								</div>
								<p class="mt-1 truncate text-xs text-[var(--sk-muted)]">{nextAction.helper}</p>
							</div>
							<span class="sk-mono shrink-0 text-[10px] text-[var(--sk-faint)]">
								{checklistOpen ? t('editor.shell.hide') : t('editor.shell.details')}
							</span>
						</summary>
						<FlowbiteButton
							type="button"
							variant="secondary"
							size="sm"
							class="mt-3 shrink-0"
							onclick={() => goToChecklistItem(nextAction)}
						>
							{t('editor.shell.open')}
						</FlowbiteButton>
						<div class="mt-3 flex flex-col gap-2">
							{#each checklist as item (item.id)}
								{@const StateIcon = item.complete ? checkCircleIcon : emptyCircleIcon}
								<button
									type="button"
									class="flex items-start gap-2 rounded-[10px] px-2 py-1.5 text-left text-xs transition hover:bg-[var(--sk-shell)]"
									onclick={() => goToChecklistItem(item)}
								>
									<span class="mt-0.5 shrink-0 {item.complete ? '' : 'text-amber-700'}">
										<StateIcon size="xs" />
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
									<FlowbiteBadge tone={canPublish ? 'success' : 'error'}>
										{canPublish ? t('editor.shell.publishReady') : t('editor.shell.publishBlocked')}
									</FlowbiteBadge>
									{#if publishBlockers.length}
										<FlowbiteBadge tone="error"
											>{t('editor.shell.blockerCount', {
												count: publishBlockers.length
											})}</FlowbiteBadge
										>
									{/if}
									{#if quality.warnings.length}
										<FlowbiteBadge tone="warning"
											>{t('editor.shell.warningCount', {
												count: quality.warnings.length
											})}</FlowbiteBadge
										>
									{/if}
									<span class="truncate text-xs font-semibold">
										{publishBlockers[0]?.message ??
											quality.warnings[0]?.message ??
											t('editor.shell.noBlockers')}
									</span>
								</div>
								<p class="mt-1 truncate text-xs opacity-75">
									{t('editor.shell.qualityHelp')}
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
								publicHandleChangeCount={data.publicHandleChangeCount}
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
			<section class="editor-workbench__preview flex min-h-0 w-full min-w-0 flex-1 flex-col">
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
									<FlowbiteButton
										href={`${liveUrl}?v=${publishNotice.version ?? publishedVersion}`}
										target="_blank"
										variant="secondary"
										size="sm"
									>
										Canlı siteyi aç <ArrowUpRightFromSquareOutline size="xs" />
									</FlowbiteButton>
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
						class="editor-workbench__canvas relative h-full overflow-hidden rounded-[14px] border border-[var(--sk-line)] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,.35)] transition-[width] duration-200"
						style="width: {viewport.width}; max-width: 100%;"
					>
						<iframe
							bind:this={iframeEl}
							src={previewSrc}
							onload={sendDraft}
							title={t('editor.shell.previewTitle')}
							class="h-full w-full"
						></iframe>
					</div>
				</div>
			</section>
		</div>
	</div>
</AppCanvasShell>
