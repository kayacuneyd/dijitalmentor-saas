<script lang="ts">
	import {
		ArrowUpRightFromSquareOutline,
		FileCopyOutline,
		FileImageOutline,
		TrashBinOutline
	} from 'flowbite-svelte-icons';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { siteId }: { siteId: string } = $props();
	const t = getTranslate();
	type Asset = {
		id: string;
		url: string;
		fileName: string;
		mimeType: string;
		sizeBytes: number;
		createdAt: string | number | Date;
	};
	let assets = $state<Asset[]>([]);
	let usageBytes = $state(0);
	let limitBytes = $state(0);
	let loading = $state(true);
	let uploading = $state(false);
	let errorMessage = $state('');
	let notice = $state('');
	let copiedId = $state<string | null>(null);

	const formatBytes = (bytes: number) => {
		if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
		return `${(bytes / 1024 / 1024).toFixed(bytes >= 100 * 1024 * 1024 ? 0 : 1)} MB`;
	};

	async function loadAssets() {
		loading = true;
		errorMessage = '';
		try {
			const response = await fetch(`/api/sites/${siteId}/media`);
			const body = await response.json();
			if (!response.ok || !body.ok)
				throw new Error(body.message ?? t('dashboard.media.loadFailed'));
			assets = body.assets;
			usageBytes = body.usageBytes ?? 0;
			limitBytes = body.limitBytes ?? 0;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : t('dashboard.media.loadFailed');
		} finally {
			loading = false;
		}
	}

	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		errorMessage = '';
		notice = '';
		try {
			const form = new FormData();
			form.set('file', file);
			const response = await fetch(`/api/sites/${siteId}/media`, { method: 'POST', body: form });
			const body = await response.json();
			if (!response.ok || !body.ok)
				throw new Error(body.message ?? t('dashboard.media.uploadFailed'));
			notice = t('dashboard.media.uploaded', { name: file.name });
			await loadAssets();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : t('dashboard.media.uploadFailed');
		} finally {
			uploading = false;
			input.value = '';
		}
	}

	async function removeAsset(asset: Asset) {
		if (!window.confirm(t('dashboard.media.confirmDelete', { name: asset.fileName }))) return;
		const response = await fetch(`/api/sites/${siteId}/media`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ id: asset.id })
		});
		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			errorMessage = body.message ?? t('dashboard.media.deleteFailed');
			return;
		}
		assets = assets.filter((item) => item.id !== asset.id);
		usageBytes = Math.max(0, usageBytes - asset.sizeBytes);
		notice = t('dashboard.media.deleted', { name: asset.fileName });
	}

	async function copyUrl(asset: Asset) {
		try {
			await navigator.clipboard.writeText(asset.url);
			copiedId = asset.id;
			setTimeout(() => {
				if (copiedId === asset.id) copiedId = null;
			}, 1800);
		} catch {
			errorMessage = t('dashboard.media.copyFailed');
		}
	}

	$effect(() => {
		void loadAssets();
	});
</script>

<div class="grid gap-5">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h2 class="font-semibold">{t('dashboard.media.title')}</h2>
			<p class="mt-1 max-w-2xl text-sm leading-6 text-[var(--sk-muted)]">
				{t('dashboard.media.description')}
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<label class="sk-flowbite-upload-label cursor-pointer">
				<FileImageOutline size="sm" />
				{uploading ? t('dashboard.media.uploading') : t('dashboard.media.upload')}
				<input
					type="file"
					accept=".svg,image/svg+xml,image/jpeg,image/png,image/gif,image/webp"
					class="sr-only"
					onchange={upload}
					disabled={uploading}
				/>
			</label>
			<FlowbiteButton type="button" variant="ghost" size="sm" onclick={loadAssets}>
				{t('dashboard.media.refresh')}
			</FlowbiteButton>
		</div>
	</div>

	<div
		class="flex flex-wrap items-center justify-between gap-2 rounded-[var(--sk-radius-sm)] bg-[var(--sk-shell)] px-4 py-3 text-xs"
	>
		<span class="font-medium"
			>{t('dashboard.media.usage', {
				used: formatBytes(usageBytes),
				limit: formatBytes(limitBytes)
			})}</span
		>
		<a
			class="inline-flex items-center gap-1 font-semibold text-[var(--sk-accent)] hover:underline"
			href="/editor/{siteId}"
		>
			{t('dashboard.media.openEditor')}
			<ArrowUpRightFromSquareOutline size="xs" />
		</a>
	</div>

	{#if notice}<p class="sk-alert sk-alert-success" role="status">{notice}</p>{/if}
	{#if errorMessage}<p class="sk-alert sk-alert-error" role="alert">{errorMessage}</p>{/if}

	{#if loading}
		<p class="py-10 text-center text-sm text-[var(--sk-muted)]">{t('dashboard.media.loading')}</p>
	{:else if assets.length === 0}
		<div
			class="grid place-items-center gap-3 border border-dashed border-[var(--sk-line-strong)] px-6 py-14 text-center"
		>
			<FileImageOutline size="xl" class="text-[var(--sk-faint)]" />
			<div>
				<p class="font-semibold">{t('dashboard.media.empty')}</p>
				<p class="mt-1 text-sm text-[var(--sk-muted)]">{t('dashboard.media.emptyHelp')}</p>
			</div>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each assets as asset (asset.id)}
				<article
					class="overflow-hidden rounded-[var(--sk-radius-sm)] border border-[var(--sk-line)] bg-white"
				>
					<div class="aspect-[4/3] bg-[var(--sk-shell)]">
						<img
							src={asset.url}
							alt={asset.fileName}
							class="size-full object-cover"
							loading="lazy"
						/>
					</div>
					<div class="grid gap-2 p-3">
						<div class="min-w-0">
							<p class="truncate text-sm font-semibold" title={asset.fileName}>{asset.fileName}</p>
							<p class="sk-mono mt-1 text-[10px] text-[var(--sk-faint)]">
								{formatBytes(asset.sizeBytes)} · {asset.mimeType}
							</p>
						</div>
						<div class="flex flex-wrap gap-1">
							<FlowbiteButton
								type="button"
								variant="ghost"
								size="sm"
								onclick={() => copyUrl(asset)}
							>
								<FileCopyOutline size="xs" />{copiedId === asset.id
									? t('dashboard.media.copied')
									: t('dashboard.media.copyUrl')}
							</FlowbiteButton>
							<FlowbiteButton
								type="button"
								variant="ghost"
								size="sm"
								class="text-[var(--sk-error)]"
								onclick={() => removeAsset(asset)}
							>
								<TrashBinOutline size="xs" />{t('dashboard.media.delete')}
							</FlowbiteButton>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
