<script lang="ts">
	import { normalizePublicHandle } from '$lib/publicHandle';
	import type { DraftStore } from '$lib/stores/draft.svelte';

	let {
		store,
		publicHandle = store.site.id,
		onIdentitySaved
	}: {
		store: DraftStore;
		publicHandle?: string;
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
				memoryMessage = { tone: 'error', text: body.message ?? 'Kaydedilemedi.' };
				return;
			}
			memoryMessage = { tone: 'success', text: 'Memory saved.' };
		} catch {
			memoryMessage = { tone: 'error', text: 'Bağlantı hatası.' };
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
					text: 'Önce son taslak kaydedilemedi. Bağlantıyı kontrol edip tekrar dene.'
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
					text: body.message ?? 'Yayın adresi kaydedilemedi.'
				};
				return;
			}
			handleDraft = body.publicHandle;
			onIdentitySaved?.(body.publicHandle);
			if (body.site) store.replace(body.site);
			identityMessage = {
				tone: 'success',
				text: body.message ?? 'Yayın adresi kaydedildi.'
			};
		} catch {
			identityMessage = {
				tone: 'error',
				text: 'Yayın adresi kaydedilemedi. Bağlantıyı kontrol edip tekrar dene.'
			};
		} finally {
			savingIdentity = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">Site name</span>
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
		<span class="label-text mb-1 block text-xs font-medium">Public subdomain</span>
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
			<span class="join-item border-base-300 bg-base-200 inline-flex items-center border px-2 text-xs">
				.saaskaya.com
			</span>
		</div>
		<p class="mt-1 text-xs text-[var(--sk-faint)]">
			İlk yayından önce site id yerine okunabilir bir adres seç.
		</p>
	</label>

	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">Contact email</span>
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
		Yayın bilgilerini kaydet
	</button>

	{#if identityMessage}
		<div
			class="sk-alert {identityMessage.tone === 'success' ? 'sk-alert-success' : 'sk-alert-error'} text-xs"
		>
			{identityMessage.text}
		</div>
	{/if}

	<label class="flex items-center justify-between gap-2">
		<span class="text-sm">"Powered by saaskaya" badge</span>
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
		<span class="text-xs font-medium">Domain</span>
		<p class="text-base-content/50 mt-1 text-xs">
			{store.site.domain ?? 'No domain yet — real domain registration arrives in M5.'}
		</p>
	</div>

	<hr class="border-base-300 my-2" />

	<div>
		<div class="mb-2 flex items-center justify-between">
			<span class="text-xs font-medium">AI Memory</span>
			<span class="text-base-content/40 text-[10px]">v{memoryVersion}</span>
		</div>
		<p class="text-base-content/50 mb-2 text-[11px] leading-snug">
			AI her sohbet mesajından önce bu notları okur. Yaptığın her değişiklik sonrası buraya kısa bir not düşülür — böylece AI bir sonraki oturumda önceki kararlarını hatırlar. 10 satırdan sonra otomatik özetlenir.
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
				placeholder="Henüz hafıza notu yok. AI ile ilk değişikliği yaptığında buraya otomatik not düşülecek."
			></textarea>
			<div class="mt-2 flex items-center justify-between gap-2">
				<button
					type="button"
					class="sk-btn sk-btn-secondary sk-btn-xs"
					onclick={saveMemory}
					disabled={memorySaving}
				>
					{#if memorySaving}<span class="loading loading-spinner loading-xs"></span>{/if}
					Save
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
