<script lang="ts">
	import { enhance } from '$app/forms';
	import { LOCALES, localeNames } from '$lib/i18n';
	import RichTextEditor from '$lib/admin/RichTextEditor.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data, form } = $props();
	const statuses = ['draft', 'published', 'archived'] as const;
	const tone = (status: string) =>
		status === 'published' ? 'success' : status === 'archived' ? 'error' : 'neutral';
</script>

<svelte:head>
	<title>{data.post.title.en} · Blog · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={data.post.title.en}
	description="Edit the public blog article in Turkish, English, and German."
	active="/admin/blog"
	max="max-w-[78rem]"
>
	{#snippet actions()}
		<a href="/admin/blog" class="sk-btn sk-btn-secondary sk-btn-sm">Back to blog</a>
		<a href={`/blog/${data.post.slug}`} class="sk-btn sk-btn-secondary sk-btn-sm">Open public</a>
		<StatusPill tone={tone(data.post.status)}>{data.post.status}</StatusPill>
	{/snippet}

	{#if form?.saved}
		<div class="sk-alert sk-alert-success">Blog post saved.</div>
	{:else if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<form method="POST" action="?/save" use:enhance class="grid gap-5">
		<AppCard class="p-4">
			<div class="grid gap-4 lg:grid-cols-[1fr_16rem_12rem]">
				<div class="grid gap-1">
					<label for="slug" class="text-xs text-[var(--sk-faint)]">Slug</label>
					<input id="slug" name="slug" required class="sk-input" value={data.post.slug} />
				</div>
				<div class="grid gap-1">
					<label for="status" class="text-xs text-[var(--sk-faint)]">Status</label>
					<select id="status" name="status" class="sk-select" value={data.post.status}>
						{#each statuses as status (status)}
							<option value={status}>{status}</option>
						{/each}
					</select>
				</div>
				<div class="grid gap-1">
					<label for="publishedAt" class="text-xs text-[var(--sk-faint)]">Publish date</label>
					<input
						id="publishedAt"
						name="publishedAt"
						type="date"
						class="sk-input"
						value={data.post.date}
					/>
				</div>
				<div class="grid gap-1">
					<label for="coverImageUrl" class="text-xs text-[var(--sk-faint)]"
						>Cover / SEO image URL</label
					>
					<input
						id="coverImageUrl"
						name="coverImageUrl"
						class="sk-input"
						placeholder="/blog/example-cover.jpg"
						value={data.post.coverImageUrl ?? ''}
					/>
				</div>
				<div class="grid gap-1">
					<label for="coverAlt" class="text-xs text-[var(--sk-faint)]">Cover alt text</label>
					<input id="coverAlt" name="coverAlt" class="sk-input" value={data.post.coverAlt ?? ''} />
				</div>
				<div class="grid gap-1">
					<label for="readingMinutes" class="text-xs text-[var(--sk-faint)]">Reading minutes</label>
					<input
						id="readingMinutes"
						name="readingMinutes"
						type="number"
						min="1"
						max="30"
						class="sk-input"
						value={data.post.readingMinutes}
					/>
				</div>
				<div class="grid gap-1 lg:col-span-3">
					<label for="authorName" class="text-xs text-[var(--sk-faint)]">Author</label>
					<input id="authorName" name="authorName" class="sk-input" value={data.post.authorName} />
				</div>
			</div>
		</AppCard>

		<div class="grid gap-5">
			{#each LOCALES as locale (locale)}
				<AppCard class="p-4">
					<div class="grid gap-4">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<h2 class="text-lg font-semibold">{localeNames[locale]}</h2>
							<span class="sk-mono text-[10px] text-[var(--sk-faint)]">{locale}</span>
						</div>
						<div class="grid gap-4 lg:grid-cols-2">
							<div class="grid gap-1">
								<label for={`title_${locale}`} class="text-xs text-[var(--sk-faint)]">Title</label>
								<input
									id={`title_${locale}`}
									name={`title_${locale}`}
									required
									class="sk-input"
									value={data.post.title[locale]}
								/>
							</div>
							<div class="grid gap-1">
								<label for={`category_${locale}`} class="text-xs text-[var(--sk-faint)]"
									>Category</label
								>
								<input
									id={`category_${locale}`}
									name={`category_${locale}`}
									required
									class="sk-input"
									value={data.post.category[locale]}
								/>
							</div>
							<div class="grid gap-1 lg:col-span-2">
								<label for={`description_${locale}`} class="text-xs text-[var(--sk-faint)]"
									>Summary</label
								>
								<textarea
									id={`description_${locale}`}
									name={`description_${locale}`}
									required
									rows="2"
									class="sk-textarea">{data.post.description[locale]}</textarea
								>
							</div>
							<div class="grid gap-1">
								<label for={`seoTitle_${locale}`} class="text-xs text-[var(--sk-faint)]"
									>SEO title</label
								>
								<input
									id={`seoTitle_${locale}`}
									name={`seoTitle_${locale}`}
									class="sk-input"
									value={data.post.seoTitle[locale]}
								/>
							</div>
							<div class="grid gap-1">
								<label for={`seoDescription_${locale}`} class="text-xs text-[var(--sk-faint)]"
									>SEO description</label
								>
								<input
									id={`seoDescription_${locale}`}
									name={`seoDescription_${locale}`}
									class="sk-input"
									value={data.post.seoDescription[locale]}
								/>
							</div>
						</div>
						<div class="grid gap-1">
							<span class="text-xs text-[var(--sk-faint)]">Body</span>
							<RichTextEditor
								name={`body_${locale}`}
								value={data.post.body[locale]}
								placeholder={`Write the ${localeNames[locale]} article...`}
							/>
						</div>
					</div>
				</AppCard>
			{/each}
		</div>

		<div class="sticky bottom-3 z-10 flex justify-end">
			<button type="submit" class="sk-btn sk-btn-primary">Save blog post</button>
		</div>
	</form>
</AdminShell>
