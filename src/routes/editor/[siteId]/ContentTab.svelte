<script lang="ts">
	import { setMediaRefAtPath } from '$lib/mediaRefs';
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import ContentFields from './ContentFields.svelte';
	import ImageUploadField from './ImageUploadField.svelte';

	let { store }: { store: DraftStore } = $props();
</script>

<div class="flex flex-col gap-4">
	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">Page</span>
		<select
			class="select select-sm w-full"
			value={store.currentSlug}
			onchange={(e) => (store.currentSlug = e.currentTarget.value)}
		>
			{#each store.site.pages as page (page.slug)}
				<option value={page.slug}>{page.title[store.editLocale]} (/{page.slug})</option>
			{/each}
		</select>
	</label>

	<p class="text-base-content/60 text-xs">
		Editing <span class="badge badge-primary badge-xs">{store.editLocale.toUpperCase()}</span>
		copy — switch the locale in the toolbar. Edits go straight to the draft (no AI).
	</p>

	{#each store.currentPage.sections as section (section.id)}
		<details class="collapse-arrow bg-base-200 collapse">
			<summary class="collapse-title min-h-0 py-3 text-sm font-semibold capitalize">
				{section.type}
				<span class="text-base-content/40 ml-1 text-xs font-normal">#{section.id}</span>
			</summary>
			<div class="collapse-content">
				{#if section.type === 'hero' || section.type === 'about'}
					<div class="mb-4">
						<ImageUploadField
							siteId={store.site.id}
							label="section image"
							value={section.props.imageUrl ?? ''}
							onchange={(url) =>
								store.update(() => {
									section.props.imageUrl = url;
								})}
						/>
					</div>
				{/if}
				<ContentFields
					value={section.content[store.editLocale]}
					{store}
					onMediaChange={(path, url) =>
						store.update(() => {
							for (const locale of store.site.locales) {
								setMediaRefAtPath(section.content[locale], path, url);
							}
						})}
				/>
			</div>
		</details>
	{/each}
</div>
