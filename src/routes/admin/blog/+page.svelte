<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data, form } = $props();

	const tone = (status: string) =>
		status === 'published' ? 'success' : status === 'archived' ? 'error' : 'neutral';
	const completionTone = (complete: boolean) => (complete ? 'success' : 'warning');
</script>

<svelte:head>
	<title>Blog · saaskaya admin</title>
</svelte:head>

<AdminShell
	title="Blog"
	description="Manage multilingual platform articles, SEO summaries, cover images, and publication state."
	active="/admin/blog"
>
	{#snippet actions()}
		<form method="POST" action="?/create" use:enhance>
			<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">New post</button>
		</form>
	{/snippet}

	{#if form?.imported}
		<div class="sk-alert sk-alert-success">
			Imported <code>{form.imported}</code>{form.updatedExisting
				? ' by updating the existing post.'
				: '.'}
			<a href={`/admin/blog/${form.importedPostId}`} class="sk-link">Open editor</a>
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
				<h2 class="text-base font-semibold">Import multilingual JSON</h2>
				<p class="mt-1 text-sm leading-6 text-[var(--sk-muted)]">
					Upload one structured JSON file with complete EN/TR/DE translations. Published imports are
					blocked if any language is incomplete.
				</p>
				<label class="mt-3 block">
					<span class="mb-1 block text-xs font-medium text-[var(--sk-faint)]">JSON file</span>
					<input
						type="file"
						name="blogJson"
						accept="application/json,.json"
						class="w-full rounded-[8px] border border-[var(--sk-line)] bg-white px-3 py-2 text-sm"
					/>
				</label>
				<label class="mt-2 inline-flex items-center gap-2 text-sm text-[var(--sk-muted)]">
					<input type="checkbox" name="updateExisting" class="size-4" />
					Update existing post when slug matches
				</label>
			</div>
			<button type="submit" class="sk-btn sk-btn-secondary">Import JSON</button>
		</form>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-lg font-semibold">{data.posts.length} post(s)</h2>
				<a href="/blog" class="sk-btn sk-btn-secondary sk-btn-sm">View public blog</a>
			</div>

			{#if data.posts.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No posts yet.</p>
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
								<a href={`/blog/${post.slug}`} class="sk-btn sk-btn-secondary sk-btn-sm">Open</a>
								<a href={`/admin/blog/${post.id}`} class="sk-btn sk-btn-primary sk-btn-sm">Edit</a>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</AdminShell>
