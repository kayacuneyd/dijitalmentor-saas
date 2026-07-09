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
		`/preview/${store.site.id}/${store.currentSlug}?locale=${store.editLocale}`
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

	/** Draft → immutable published snapshot; unsaved edits are saved first. */
	async function publish() {
		publishing = true;
		try {
			if (store.status !== 'saved') await store.save();
			const res = await fetch(`/api/sites/${store.site.id}/publish`, { method: 'POST' });
			const body = await res.json();
			if (res.ok && body.ok) publishedVersion = body.version;
			else alert(body.message ?? 'Publish failed — please try again.');
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
						class="rounded-[7px] px-2 py-2 text-xs font-medium transition {tabClass(tab)}"
						onclick={() => (activeTab = tab)}
					>
						{tab}
					</button>
				{/each}
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
				{#if activeTab === 'Chat'}
					<ChatTab {store} />
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
						>
							{vp.label}
						</button>
					{/each}
				</div>
				<div class="flex items-center gap-2">
					<select
						class="sk-select min-h-8 w-auto py-1.5 text-xs"
						value={store.editLocale}
						onchange={(e) => (store.editLocale = e.currentTarget.value as typeof store.editLocale)}
						aria-label="Preview and edit locale"
					>
						{#each store.site.locales as locale (locale)}
							<option value={locale}>{locale.toUpperCase()}</option>
						{/each}
					</select>
					<button class="sk-btn sk-btn-secondary sk-btn-sm" onclick={() => store.save()}
						>Save now</button
					>
					<a href={previewSrc} target="_blank" class="sk-btn sk-btn-ghost sk-btn-sm">Open ↗</a>
					<button class="sk-btn sk-btn-primary sk-btn-sm" onclick={publish} disabled={publishing}>
						{#if publishing}<span class="loading loading-spinner loading-xs"></span>{/if}
						{publishedVersion ? `Republish (v${publishedVersion} live)` : 'Publish'}
					</button>
				</div>
			</div>

			<div class="flex min-h-0 flex-1 justify-center overflow-auto bg-[var(--sk-shell)] p-4 sm:p-6">
				<div
					class="h-full overflow-hidden rounded-[14px] border border-[var(--sk-line)] bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,.35)] transition-[width] duration-200"
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
</AppCanvasShell>
