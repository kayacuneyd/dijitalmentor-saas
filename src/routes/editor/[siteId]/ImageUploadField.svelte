<script lang="ts">
	import { getTranslate } from '$lib/i18n/context';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';

	const t = getTranslate();

	let {
		siteId,
		label,
		value,
		onchange
	}: {
		siteId: string;
		label: string;
		value: string;
		onchange: (url: string) => void;
	} = $props();

	let uploading = $state(false);
	let uploadError = $state('');
	let assets = $state<{ id: string; url: string; fileName: string }[]>([]);
	let libraryOpen = $state(false);

	async function loadLibrary() {
		libraryOpen = true;
		try {
			const response = await fetch(`/api/sites/${siteId}/media`);
			const body = await response.json();
			if (body.ok) assets = body.assets;
		} catch {
			assets = [];
		}
	}

	async function removeAsset(id: string) {
		const response = await fetch(`/api/sites/${siteId}/media`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ id })
		});
		if (response.ok) assets = assets.filter((asset) => asset.id !== id);
	}

	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		uploadError = '';
		try {
			const form = new FormData();
			form.set('file', file);
			const response = await fetch(`/api/sites/${siteId}/media`, { method: 'POST', body: form });
			const body = await response.json();
			if (!response.ok || !body.ok)
				throw new Error(body.message || t('editor.imageUpload.uploadFailed'));
			onchange(body.asset.url);
		} catch (cause) {
			uploadError = cause instanceof Error ? cause.message : t('editor.imageUpload.uploadFailed');
		} finally {
			uploading = false;
			input.value = '';
		}
	}
</script>

<div class="flex flex-col gap-2">
	<span class="text-xs font-medium capitalize">{label}</span>
	{#if value}
		<div class="h-24 overflow-hidden rounded-[6px] border border-[var(--sk-line)] bg-white">
			<img src={value} alt="" class="h-full w-full object-cover" />
		</div>
	{/if}
	<div class="flex items-center gap-2">
		<label class="sk-flowbite-upload-label cursor-pointer">
			{uploading
				? t('editor.imageUpload.uploading')
				: value
					? t('editor.imageUpload.replaceImage')
					: t('editor.imageUpload.uploadImage')}
			<input
				type="file"
				accept="image/jpeg,image/png,image/gif,image/webp"
				class="sr-only"
				onchange={upload}
				disabled={uploading}
			/>
		</label>
		{#if value}
			<input
				type="url"
				class="sk-input min-h-8 min-w-0 flex-1 py-1.5 text-xs"
				{value}
				oninput={(event) => onchange(event.currentTarget.value)}
				aria-label={t('editor.imageUpload.urlAria', { label })}
			/>
		{/if}
	</div>
	<FlowbiteButton type="button" variant="ghost" size="sm" onclick={loadLibrary}>
		{libraryOpen ? 'Medya kütüphanesini yenile' : 'Medya kütüphanesini aç'}
	</FlowbiteButton>
	{#if uploadError}
		<p class="text-xs text-[var(--sk-error)]">{uploadError}</p>
	{/if}
	{#if libraryOpen}
		<div class="grid grid-cols-3 gap-2 rounded-[6px] border border-[var(--sk-line)] bg-white p-2">
			{#if assets.length === 0}
				<p class="col-span-3 text-xs text-base-content/60">Henüz yüklenmiş medya yok.</p>
			{:else}
				{#each assets as asset (asset.id)}
					<div class="group relative overflow-hidden rounded border border-base-300">
						<button
							type="button"
							class="block w-full"
							onclick={() => onchange(asset.url)}
							title={asset.fileName}
						>
							<img src={asset.url} alt={asset.fileName} class="aspect-square w-full object-cover" />
						</button>
						<button
							type="button"
							class="absolute right-1 top-1 hidden rounded bg-black/70 px-1.5 py-1 text-[10px] text-white group-hover:block"
							onclick={() => removeAsset(asset.id)}
							aria-label={`Delete ${asset.fileName}`}
						>
							×
						</button>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>
