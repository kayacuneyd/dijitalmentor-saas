<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data, form } = $props();
	const t = getTranslate();

	const tone = (status: string) =>
		status === 'published' ? 'success' : status === 'archived' ? 'error' : 'neutral';
	const completionTone = (complete: boolean) => (complete ? 'success' : 'warning');
</script>

<svelte:head>
	<title>{t('admin.blog.title')} · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={t('admin.blog.title')}
	description={t('admin.blog.description')}
	active="/admin/blog"
>
	{#snippet actions()}
		<form method="POST" action="?/create" use:enhance>
			<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm"
				>{t('admin.blog.newPost')}</button
			>
		</form>
	{/snippet}

	{#if form?.imported}
		<div class="sk-alert sk-alert-success">
			Imported <code>{form.imported}</code>{form.updatedExisting
				? ' by updating the existing post.'
				: '.'}
			<a href={`/admin/blog/${form.importedPostId}`} class="sk-link">{t('admin.blog.edit')}</a>
		</div>
	{:else if form?.importError}
		<div class="sk-alert sk-alert-error">
			<div>
				<div>{form.importError}</div>
				{#if form.importIssues?.length}
					<ul class="mt-2 list-disc pl-5 text-xs">
						{#each form.importIssues as issue}
							<li>{issue}</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	{/if}

	<AppCard class="p-4">
		<form
			method="POST"
			action="?/importJson"
			enctype="multipart/form-data"
			use:enhance
			class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
		>
			<div class="min-w-0">
				<h2 class="text-base font-semibold">{t('admin.blog.importTitle')}</h2>
				<p class="mt-1 text-sm leading-6 text-[var(--sk-muted)]">
					{t('admin.blog.importHelp')}
				</p>
				<label class="mt-3 block">
					<span class="mb-1 block text-xs font-medium text-[var(--sk-faint)]"
						>{t('admin.blog.jsonFile')}</span
					>
					<input
						type="file"
						name="blogJson"
						accept="application/json,.json"
						class="w-full rounded-[8px] border border-[var(--sk-line)] bg-white px-3 py-2 text-sm"
					/>
				</label>
				<label class="mt-2 inline-flex items-center gap-2 text-sm text-[var(--sk-muted)]">
					<input type="checkbox" name="updateExisting" class="size-4" />
					{t('admin.blog.updateExisting')}
				</label>
			</div>
			<button type="submit" class="sk-btn sk-btn-secondary">{t('admin.blog.importJson')}</button>
		</form>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-lg font-semibold">{t('admin.blog.posts', { count: data.posts.length })}</h2>
				<a href="/blog" class="sk-btn sk-btn-secondary sk-btn-sm">{t('admin.blog.publicBlog')}</a>
			</div>

			{#if data.posts.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">{t('admin.blog.empty')}</p>
			{:else}
				<ul class="divide-y divide-[var(--sk-line)]">
					{#each data.posts as post (post.id)}
						<li class="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<StatusPill tone={tone(post.status)}>{post.status}</StatusPill>
									<span class="text-xs text-[var(--sk-faint)]">{post.date}</span>
									<span class="text-xs text-[var(--sk-faint)]">{post.readingMinutes} min</span>
									{#each post.completeness as localeStatus (localeStatus.locale)}
										<StatusPill tone={completionTone(localeStatus.complete)}>
											{localeStatus.locale.toUpperCase()}
										</StatusPill>
									{/each}
								</div>
								<h3 class="mt-2 truncate text-base font-semibold">{post.title.en}</h3>
								<p class="mt-1 line-clamp-2 text-sm leading-6 text-[var(--sk-muted)]">
									{post.description.en}
								</p>
								<p class="mt-1 text-xs text-[var(--sk-faint)]">/{post.slug}</p>
							</div>
							<div class="flex shrink-0 gap-2">
								<a href={`/blog/${post.slug}`} class="sk-btn sk-btn-secondary sk-btn-sm"
									>{t('admin.blog.open')}</a
								>
								<a href={`/admin/blog/${post.id}`} class="sk-btn sk-btn-primary sk-btn-sm"
									>{t('admin.blog.edit')}</a
								>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</AdminShell>
