<script lang="ts">
	import { setMediaRefAtPath } from '$lib/mediaRefs';
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import ContentFields from './ContentFields.svelte';
	import ImageUploadField from './ImageUploadField.svelte';
	import { getTranslate } from '$lib/i18n/context';
	import type { CatalogKey } from '$lib/i18n/catalog';

	const t = getTranslate();
	const sectionLabel = (type: string) => t(`editor.blocks.${type}` as CatalogKey);

	let { store }: { store: DraftStore } = $props();
</script>

<div class="flex flex-col gap-4">
	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">{t('editor.content.pageLabel')}</span>
		<select
			class="select select-sm w-full"
			value={store.currentSlug}
			onchange={(e) => (store.currentSlug = e.currentTarget.value)}
		>
			{#each store.site.pages as page, i (`${page.slug}-${i}`)}
				<option value={page.slug}>{page.title[store.editLocale]} (/{page.slug})</option>
			{/each}
		</select>
	</label>

	<p class="text-base-content/60 text-xs">
		{t('editor.content.editingNote', { locale: store.editLocale.toUpperCase() })}
	</p>

	{#each store.currentPage.sections as section, i (`${section.id}-${i}`)}
		<details class="collapse-arrow bg-base-200 collapse">
			<summary class="collapse-title min-h-0 py-3 text-sm font-semibold">
				{sectionLabel(section.type)}
				<span class="text-base-content/40 ml-1 text-xs font-normal">#{section.id}</span>
			</summary>
			<div class="collapse-content">
				{#if section.type === 'hero' || section.type === 'about'}
					<div class="mb-4">
						<ImageUploadField
							siteId={store.site.id}
							label={t('editor.content.sectionImageLabel')}
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
