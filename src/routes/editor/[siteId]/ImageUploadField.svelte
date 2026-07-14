<script lang="ts">
	import { getTranslate } from '$lib/i18n/context';

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
		<label class="sk-btn sk-btn-secondary sk-btn-sm cursor-pointer">
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
	{#if uploadError}
		<p class="text-xs text-[var(--sk-error)]">{uploadError}</p>
	{/if}
</div>
