<script lang="ts">
	import { normalizePublicHandle } from '$lib/publicHandle';
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import {
		INTEGRATION_TYPES,
		INTEGRATION_DEFAULT_LABELS,
		INTEGRATION_DOMAIN_ALLOWLIST
	} from '$lib/kits/integrations';
	import { getTranslate } from '$lib/i18n/context';

	const t = getTranslate();

	let {
		store,
		publicHandle = store.site.id,
		publicHandleChangeCount = 0,
		onIdentitySaved
	}: {
		store: DraftStore;
		publicHandle?: string;
		publicHandleChangeCount?: number;
		onIdentitySaved?: (publicHandle: string) => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	let handleDraft = $state(publicHandle);
	let savingIdentity = $state(false);
	let identityMessage = $state<{ tone: 'success' | 'error'; text: string } | null>(null);

	// AI memory — owner-viewable, owner-editable.
	let memoryContent = $state<string | null>(null);
	let memoryVersion = $state(0);
	let memoryLoading = $state(false);
	let memorySaving = $state(false);
	let memoryMessage = $state<{ tone: 'success' | 'error'; text: string } | null>(null);

	async function loadMemory() {
		memoryLoading = true;
		try {
			const res = await fetch(`/api/sites/${store.site.id}/memory`);
			const body = await res.json();
			if (body.ok && body.memory) {
				memoryContent = body.memory.content;
				memoryVersion = body.memory.version;
			} else {
				memoryContent = '';
				memoryVersion = 0;
			}
		} catch {
			memoryContent = '';
			memoryVersion = 0;
		} finally {
			memoryLoading = false;
		}
	}

	async function saveMemory() {
		memorySaving = true;
		memoryMessage = null;
		try {
			const res = await fetch(`/api/sites/${store.site.id}/memory`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ content: memoryContent ?? '' })
			});
			const body = await res.json();
			if (!res.ok || !body.ok) {
				memoryMessage = {
					tone: 'error',
					text: body.message ?? t('editor.settings.aiMemorySaveFailed')
				};
				return;
			}
			memoryMessage = { tone: 'success', text: t('editor.settings.aiMemorySaved') };
		} catch {
			memoryMessage = { tone: 'error', text: t('editor.settings.aiMemoryNetworkError') };
		} finally {
			memorySaving = false;
		}
	}

	$effect(() => {
		loadMemory();
	});

	$effect(() => {
		handleDraft = publicHandle;
	});

	async function saveIdentity() {
		savingIdentity = true;
		identityMessage = null;
		try {
			const flushed = await store.flush();
			if (!flushed) {
				identityMessage = {
					tone: 'error',
					text: t('editor.settings.flushFailed')
				};
				return;
			}
			const res = await fetch(`/api/sites/${store.site.id}/identity`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					siteName: store.site.settings.siteName,
					publicHandle: handleDraft,
					contactEmail: store.site.settings.contactEmail ?? ''
				})
			});
			const body = await res.json();
			if (!res.ok || !body.ok) {
				identityMessage = {
					tone: 'error',
					text: body.message ?? t('editor.settings.identitySaveFailed')
				};
				return;
			}
			handleDraft = body.publicHandle;
			onIdentitySaved?.(body.publicHandle);
			if (body.site) store.replace(body.site);
			identityMessage = {
				tone: 'success',
				text: body.message ?? t('editor.settings.identitySaved')
			};
		} catch {
			identityMessage = {
				tone: 'error',
				text: t('editor.settings.identitySaveNetworkError')
			};
		} finally {
			savingIdentity = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium"
			>{t('editor.settings.siteNameLabel')}</span
		>
		<input
			type="text"
			class="input input-sm w-full"
			value={store.site.settings.siteName}
			oninput={(e) => {
				const next = e.currentTarget.value;
				store.update((site) => {
					site.settings.siteName = next;
				});
			}}
		/>
	</label>

	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium"
			>{t('editor.settings.publicSubdomainLabel')}</span
		>
		<div class="join w-full">
			<input
				type="text"
				class="input input-sm join-item min-w-0 flex-1 font-[var(--font-mono)]"
				value={handleDraft}
				oninput={(e) => {
					handleDraft = normalizePublicHandle(e.currentTarget.value);
				}}
				placeholder="ogo-football"
			/>
			<span
				class="join-item border-base-300 bg-base-200 inline-flex items-center border px-2 text-xs"
			>
				.saaskaya.com
			</span>
		</div>
		<p class="mt-1 text-xs text-[var(--sk-faint)]">
			{t('editor.settings.publicSubdomainHelp')}
		</p>
		{#if publicHandleChangeCount === 0}
			<p class="mt-1 text-xs text-amber-700">{t('editor.settings.publicSubdomainRenameNotice')}</p>
		{:else}
			<p class="mt-1 text-xs text-[var(--sk-faint)]">{t('editor.settings.publicSubdomainRenameUsed')}</p>
		{/if}
	</label>

	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium"
			>{t('editor.settings.contactEmailLabel')}</span
		>
		<input
			type="email"
			class="input input-sm w-full"
			value={store.site.settings.contactEmail ?? ''}
			oninput={(e) => {
				const next = e.currentTarget.value.trim();
				store.update((site) => {
					if (next) site.settings.contactEmail = next;
					else delete site.settings.contactEmail;
				});
			}}
		/>
	</label>

	<button
		type="button"
		class="sk-btn sk-btn-secondary sk-btn-sm w-fit"
		onclick={saveIdentity}
		disabled={savingIdentity}
	>
		{#if savingIdentity}<span class="loading loading-spinner loading-xs"></span>{/if}
		{t('editor.settings.saveIdentity')}
	</button>

	{#if identityMessage}
		<div
			class="sk-alert {identityMessage.tone === 'success'
				? 'sk-alert-success'
				: 'sk-alert-error'} text-xs"
		>
			{identityMessage.text}
		</div>
	{/if}

	<label class="flex items-center justify-between gap-2">
		<span class="text-sm">{t('editor.settings.poweredByBadgeLabel')}</span>
		<input
			type="checkbox"
			class="toggle toggle-primary toggle-sm"
			checked={store.site.settings.poweredByBadge}
			onchange={(e) => {
				const next = e.currentTarget.checked;
				store.update((site) => {
					site.settings.poweredByBadge = next;
				});
			}}
		/>
	</label>

	<div>
		<span class="text-xs font-medium">{t('editor.settings.domainLabel')}</span>
		<p class="text-base-content/50 mt-1 text-xs">
			{store.site.domain ?? t('editor.settings.domainNone')}
		</p>
	</div>

	<hr class="border-base-300 my-2" />

	<div>
		<span class="text-xs font-medium">{t('editor.settings.integrationsLabel')}</span>
		<p class="text-base-content/50 mt-1 text-[11px] leading-snug">
			{t('editor.settings.integrationsHelp')}
		</p>
		<div class="mt-3 flex flex-col gap-3">
			{#each INTEGRATION_TYPES as type}
				{@const entry = (store.site.settings.integrations ?? []).find((i) => i.type === type)}
				{@const enabled = entry?.enabled ?? false}
				{@const currentUrl = entry?.url ?? ''}
				{@const currentPhone = entry?.phone ?? ''}
				{@const allowlist = INTEGRATION_DOMAIN_ALLOWLIST[type]}
				<div class="sk-card sk-card-sm flex flex-col gap-2 p-3">
					<label class="flex items-center justify-between gap-2">
						<span class="text-sm font-medium">{INTEGRATION_DEFAULT_LABELS[type]}</span>
						<input
							type="checkbox"
							class="toggle toggle-primary toggle-sm"
							checked={enabled}
							onchange={(e) => {
								const checked = e.currentTarget.checked;
								store.update((site) => {
									const list = site.settings.integrations ?? [];
									const existing = list.find((i) => i.type === type);
									if (checked && !existing) {
										list.push({ type, enabled: true });
									} else if (!checked && existing) {
										site.settings.integrations = list.filter((i) => i.type !== type);
									} else if (existing) {
										existing.enabled = checked;
									}
									if (!site.settings.integrations?.length) {
										delete site.settings.integrations;
									}
								});
							}}
						/>
					</label>
					{#if enabled}
						{#if type === 'whatsapp-order'}
							<label class="form-control">
								<span class="label-text mb-1 block text-[11px]"
									>{t('editor.settings.phoneLabel', {
										example: t('editor.settings.phoneExample')
									})}</span
								>
								<input
									type="text"
									class="input input-sm w-full font-[var(--font-mono)] text-xs"
									value={currentPhone}
									placeholder={t('editor.settings.phoneExample')}
									oninput={(e) => {
										const next = e.currentTarget.value;
										store.update((site) => {
											const list = site.settings.integrations ?? [];
											const item = list.find((i) => i.type === type);
											if (item) item.phone = next;
										});
									}}
								/>
							</label>
						{:else}
							<label class="form-control">
								<span class="label-text mb-1 block text-[11px]">
									{t('editor.settings.linkLabel')}
									{#if allowlist.length > 0}
										<span class="text-base-content/40"> ({allowlist.join(', ')})</span>
									{/if}
								</span>
								<input
									type="url"
									class="input input-sm w-full font-[var(--font-mono)] text-xs"
									value={currentUrl}
									placeholder="https://..."
									oninput={(e) => {
										const next = e.currentTarget.value;
										store.update((site) => {
											const list = site.settings.integrations ?? [];
											const item = list.find((i) => i.type === type);
											if (item) item.url = next;
										});
									}}
								/>
							</label>
						{/if}
						{#if entry?.label}
							<label class="form-control">
								<span class="label-text mb-1 block text-[11px]"
									>{t('editor.settings.buttonLabelLabel', {
										default: INTEGRATION_DEFAULT_LABELS[type]
									})}</span
								>
								<input
									type="text"
									class="input input-sm w-full text-xs"
									value={entry.label?.tr ?? ''}
									oninput={(e) => {
										const next = e.currentTarget.value;
										store.update((site) => {
											const list = site.settings.integrations ?? [];
											const item = list.find((i) => i.type === type);
											if (item) {
												if (!item.label) item.label = { tr: '', en: '', de: '' };
												item.label.tr = next;
												item.label.en = next;
												item.label.de = next;
											}
										});
									}}
								/>
							</label>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<hr class="border-base-300 my-2" />

	<div>
		<div class="mb-2 flex items-center justify-between">
			<span class="text-xs font-medium">{t('editor.settings.aiMemoryLabel')}</span>
			<span class="text-base-content/40 text-[10px]">v{memoryVersion}</span>
		</div>
		<p class="text-base-content/50 mb-2 text-[11px] leading-snug">
			{t('editor.settings.aiMemoryHelp')}
		</p>
		{#if memoryLoading}
			<span class="loading loading-spinner loading-xs"></span>
		{:else}
			<textarea
				class="textarea textarea-bordered textarea-xs h-40 w-full font-[var(--font-mono)] text-[11px] leading-snug"
				value={memoryContent ?? ''}
				oninput={(e) => {
					memoryContent = e.currentTarget.value;
					memoryMessage = null;
				}}
				placeholder={t('editor.settings.aiMemoryPlaceholder')}></textarea>
			<div class="mt-2 flex items-center justify-between gap-2">
				<button
					type="button"
					class="sk-btn sk-btn-secondary sk-btn-xs"
					onclick={saveMemory}
					disabled={memorySaving}
				>
					{#if memorySaving}<span class="loading loading-spinner loading-xs"></span>{/if}
					{t('editor.settings.aiMemorySave')}
				</button>
				{#if memoryMessage}
					<span
						class="text-[10px] {memoryMessage.tone === 'success' ? 'text-success' : 'text-error'}"
					>
						{memoryMessage.text}
					</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
