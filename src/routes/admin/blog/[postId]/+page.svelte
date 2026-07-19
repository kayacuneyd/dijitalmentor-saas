<script lang="ts">
	import { enhance } from '$app/forms';
	import RichTextEditor from '$lib/admin/RichTextEditor.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data, form } = $props();
	const t = getTranslate();
	const statuses = ['draft', 'published', 'archived'] as const;
	const tone = (status: string) =>
		status === 'published' ? 'success' : status === 'archived' ? 'error' : 'neutral';
</script>

<svelte:head>
	<title>{data.post.title.en} · Blog · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={data.post.title.en}
	description={t('admin.blog.editDescription')}
	active="/admin/blog"
	max="max-w-[78rem]"
>
	{#snippet actions()}
		<FlowbiteButton href="/admin/blog" variant="secondary" size="sm"
			>{t('admin.blog.back')}</FlowbiteButton
		>
		<FlowbiteButton href={`/blog/${data.post.slug}`} variant="secondary" size="sm"
			>{t('admin.blog.openPublic')}</FlowbiteButton
		>
		<StatusPill tone={tone(data.post.status)}>{data.post.status}</StatusPill>
	{/snippet}

	{#if form?.saved}
		<div class="sk-alert sk-alert-success">{t('admin.blog.saved')}</div>
	{:else if form?.coverUploaded}
		<div class="sk-alert sk-alert-success">Cover image uploaded.</div>
	{:else if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<AppCard class="p-4">
		<div class="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
			{#if data.post.coverImageUrl}
				<img
					src={data.post.coverImageUrl}
					alt=""
					class="aspect-[16/9] w-full rounded-[var(--sk-radius-sm)] border border-[var(--sk-line)] object-cover"
				/>
			{:else}
				<div
					class="flex aspect-[16/9] items-center justify-center rounded-[var(--sk-radius-sm)] border border-dashed border-[var(--sk-line-strong)] text-xs text-[var(--sk-faint)]"
				>
					No cover
				</div>
			{/if}
			<form method="POST" action="?/uploadCover" enctype="multipart/form-data" class="grid gap-2">
				<div>
					<h2 class="text-sm font-semibold">Article cover</h2>
					<p class="mt-1 text-xs leading-5 text-[var(--sk-muted)]">
						JPEG, PNG, GIF, WebP or safe SVG · maximum 8 MB. The image appears on cards and above
						the article.
					</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<input
						name="cover"
						type="file"
						accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
						required
						class="block max-w-full text-sm"
					/>
					<FlowbiteButton type="submit" variant="secondary" size="sm">Upload cover</FlowbiteButton>
				</div>
			</form>
		</div>
	</AppCard>

	<form method="POST" action="?/save" use:enhance class="grid gap-5">
		<AppCard class="p-4">
			<div class="grid gap-4 lg:grid-cols-[1fr_16rem_12rem]">
				<div class="grid gap-1">
					<label for="slug" class="text-xs text-[var(--sk-faint)]">{t('admin.blog.slug')}</label>
					<input id="slug" name="slug" required class="sk-input" value={data.post.slug} />
				</div>
				<div class="grid gap-1">
					<label for="status" class="text-xs text-[var(--sk-faint)]">{t('admin.blog.status')}</label
					>
					<select id="status" name="status" class="sk-select" value={data.post.status}>
						{#each statuses as status (status)}
							<option value={status}>{status}</option>
						{/each}
					</select>
				</div>
				<div class="grid gap-1">
					<label for="publishedAt" class="text-xs text-[var(--sk-faint)]"
						>{t('admin.blog.publishDate')}</label
					>
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
						>{t('admin.blog.coverUrl')}</label
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
					<label for="readingMinutes" class="text-xs text-[var(--sk-faint)]"
						>{t('admin.blog.readingMinutes')}</label
					>
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
					<label for="authorName" class="text-xs text-[var(--sk-faint)]"
						>{t('admin.blog.author')}</label
					>
					<input id="authorName" name="authorName" class="sk-input" value={data.post.authorName} />
				</div>
			</div>
		</AppCard>

		<div class="grid gap-5">
			{#each data.locales as localeRow (localeRow.code)}
				{@const locale = localeRow.code}
				<AppCard class="p-4">
					<div class="grid gap-4">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<h2 class="text-lg font-semibold">{localeRow.name}</h2>
							<span class="sk-mono text-[10px] text-[var(--sk-faint)]">{locale}</span>
						</div>
						<div class="grid gap-4 lg:grid-cols-2">
							<div class="grid gap-1">
								<label for={`title_${locale}`} class="text-xs text-[var(--sk-faint)]">Title</label>
								<input
									id={`title_${locale}`}
									name={`title_${locale}`}
									required={localeRow.active}
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
									required={localeRow.active}
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
									required={localeRow.active}
									rows="2"
									class="sk-textarea">{data.post.description[locale]}</textarea
								>
							</div>
							<div class="grid gap-1 lg:col-span-2">
								<label for={`coverAlt_${locale}`} class="text-xs text-[var(--sk-faint)]">
									Cover alt text
								</label>
								<input
									id={`coverAlt_${locale}`}
									name={`coverAlt_${locale}`}
									class="sk-input"
									value={data.post.coverAlt[locale]}
								/>
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
								placeholder={`Write the ${localeRow.name} article...`}
							/>
						</div>
					</div>
				</AppCard>
			{/each}
		</div>

		<div class="sticky bottom-3 z-10 flex justify-end">
			<FlowbiteButton type="submit" variant="primary">{t('admin.blog.save')}</FlowbiteButton>
		</div>
	</form>
</AdminShell>
