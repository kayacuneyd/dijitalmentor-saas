<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();

	const tone = (status: string) =>
		status === 'published' ? 'success' : status === 'archived' ? 'error' : 'neutral';
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
