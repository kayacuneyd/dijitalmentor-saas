<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { LOCALES } from '$lib/i18n';
	import { getTranslate } from '$lib/i18n/context';

	let { data, form } = $props();
	const t = getTranslate();

	let uploading = $state(false);

	const sizeLabel = (bytes: number) =>
		bytes >= 1024 * 1024
			? `${(bytes / 1024 / 1024).toFixed(1)} MB`
			: `${Math.ceil(bytes / 1024)} KB`;
</script>

<svelte:head>
	<title>{t('admin.share.title')} · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={t('admin.share.title')}
	description={t('admin.share.description')}
	active="/admin/share"
>
	<AppCard class="p-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<p class="text-sm font-medium">{t('admin.share.page')}</p>
				<p class="mt-1 text-xs text-[var(--sk-muted)]">
					{data.sharePageEnabled ? t('admin.share.live') : t('admin.share.disabled')}
				</p>
			</div>
			<form method="POST" action="?/togglePage" use:enhance>
				<input type="hidden" name="enabled" value={data.sharePageEnabled ? '0' : '1'} />
				<button
					type="submit"
					class={data.sharePageEnabled
						? 'sk-btn sk-btn-secondary sk-btn-sm'
						: 'sk-btn sk-btn-primary sk-btn-sm'}
				>
					{data.sharePageEnabled ? t('admin.share.disable') : t('admin.share.enable')}
				</button>
			</form>
		</div>
	</AppCard>

	{#if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{:else if form?.uploaded}
		<div class="sk-alert sk-alert-success">
			{t('admin.share.uploaded', { name: form.uploaded })}
		</div>
	{:else if form?.deleted}
		<div class="sk-alert">{t('admin.share.assetDeleted')}</div>
	{:else if form?.captionSaved}
		<div class="sk-alert sk-alert-success">{t('admin.share.captionSaved')}</div>
	{:else if form?.pageEnabled === true}
		<div class="sk-alert sk-alert-success">{t('admin.share.pageEnabled')}</div>
	{:else if form?.pageEnabled === false}
		<div class="sk-alert">{t('admin.share.pageDisabled')}</div>
	{/if}

	<AppCard class="p-4">
		<h2 class="text-sm font-semibold">{t('admin.share.uploadTitle')}</h2>
		<p class="mt-1 text-xs leading-5 text-[var(--sk-muted)]">
			Story format: 1080×1920 (9:16). Images up to 8 MB (JPEG/PNG/WebP/GIF), videos up to 60 MB (MP4
			· H.264 — keep story videos around 15–20 MB for in-app browsers). Captions are shown under the
			preview on /share and travel as the share text.
		</p>
		<form
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			class="mt-3 flex flex-col gap-3"
			use:enhance={() => {
				uploading = true;
				return async ({ update }) => {
					uploading = false;
					await update();
				};
			}}
		>
			<input
				type="file"
				name="file"
				required
				accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
				class="sk-input py-2"
			/>
			<div class="grid gap-2 sm:grid-cols-3">
				{#each LOCALES as locale (locale)}
					<label class="grid gap-1 text-xs font-medium">
						<span class="sk-mono text-[10px] text-[var(--sk-faint)] uppercase">
							Caption · {locale}
						</span>
						<input
							type="text"
							name={`caption_${locale}`}
							maxlength="200"
							class="sk-input min-h-9 py-1.5 text-sm"
						/>
					</label>
				{/each}
			</div>
			<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm w-fit" disabled={uploading}>
				{#if uploading}<span class="loading loading-spinner loading-xs"></span>{t(
						'admin.share.uploading'
					)}{:else}{t('admin.share.upload')}{/if}
			</button>
		</form>
	</AppCard>

	{#if data.assets.length === 0}
		<AppCard class="p-6 text-sm text-[var(--sk-muted)]">
			{t('admin.share.empty')} Upload a story image or MP4 above — the first video can be generated with
			<code class="sk-mono text-xs">node scripts/generate-share-video.mjs</code>.
		</AppCard>
	{:else}
		<div class="flex flex-col gap-3">
			{#each data.assets as asset, index (asset.id)}
				<AppCard class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
					<div class="w-24 shrink-0 overflow-hidden rounded-[10px] border border-[var(--sk-line)]">
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
							<img src={asset.url} alt={asset.fileName} class="aspect-9/16 w-full object-cover" />
						{/if}
					</div>

					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<span class="truncate text-sm font-semibold">{asset.fileName}</span>
							<StatusPill tone={asset.active ? 'success' : 'neutral'}>
								{asset.active ? t('admin.share.active') : t('admin.share.hidden')}
							</StatusPill>
							<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">
								{asset.kind} · {sizeLabel(asset.sizeBytes)}
							</span>
						</div>

						<form method="POST" action="?/saveCaption" use:enhance class="mt-3 flex flex-col gap-2">
							<input type="hidden" name="id" value={asset.id} />
							<div class="grid gap-2 sm:grid-cols-3">
								{#each LOCALES as locale (locale)}
									<input
										type="text"
										name={`caption_${locale}`}
										maxlength="200"
										placeholder={`Caption · ${locale.toUpperCase()}`}
										value={asset.captionByLocale[locale] ?? ''}
										class="sk-input min-h-9 py-1.5 text-sm"
									/>
								{/each}
							</div>
							<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm w-fit"
								>{t('admin.share.saveCaptions')}</button
							>
						</form>
					</div>

					<div class="flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-col sm:items-end">
						<form method="POST" action="?/toggle" use:enhance>
							<input type="hidden" name="id" value={asset.id} />
							<input type="hidden" name="active" value={asset.active ? '0' : '1'} />
							<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
								{asset.active ? t('admin.share.hide') : t('admin.share.activate')}
							</button>
						</form>
						<div class="flex gap-1.5">
							<form method="POST" action="?/moveUp" use:enhance>
								<input type="hidden" name="id" value={asset.id} />
								<button
									type="submit"
									class="sk-btn sk-btn-ghost sk-btn-sm"
									disabled={index === 0}
									aria-label={t('admin.share.moveUp')}>↑</button
								>
							</form>
							<form method="POST" action="?/moveDown" use:enhance>
								<input type="hidden" name="id" value={asset.id} />
								<button
									type="submit"
									class="sk-btn sk-btn-ghost sk-btn-sm"
									disabled={index === data.assets.length - 1}
									aria-label={t('admin.share.moveDown')}>↓</button
								>
							</form>
						</div>
						<form
							method="POST"
							action="?/delete"
							use:enhance={({ cancel }) => {
								if (!confirm(t('admin.share.confirmDelete'))) cancel();
							}}
						>
							<input type="hidden" name="id" value={asset.id} />
							<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm sk-btn-danger"
								>{t('admin.share.delete')}</button
							>
						</form>
					</div>
				</AppCard>
			{/each}
		</div>
	{/if}
</AdminShell>
