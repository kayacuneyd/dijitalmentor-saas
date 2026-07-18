<script lang="ts">
	import { setMediaRefAtPath } from '$lib/mediaRefs';
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import ContentFields from './ContentFields.svelte';
	import ImageUploadField from './ImageUploadField.svelte';
	import { getTranslate } from '$lib/i18n/context';
	import type { CatalogKey } from '$lib/i18n/catalog';
	import SectionStyleControls from './SectionStyleControls.svelte';
	import { DEFAULT_SECTION_STYLE, type SectionStyle } from '$lib/schema/site';
	import FlowbiteSelect from '$lib/ui/primitives/FlowbiteSelect.svelte';

	const t = getTranslate();
	const sectionLabel = (type: string) => t(`editor.blocks.${type}` as CatalogKey);

	let {
		store,
		selectedSectionId = null
	}: {
		store: DraftStore;
		selectedSectionId?: string | null;
	} = $props();
</script>

<div class="flex flex-col gap-4">
	<label class="sk-field-stack">
		<span class="mb-1 block text-xs font-medium">{t('editor.content.pageLabel')}</span>
		<FlowbiteSelect
			class="w-full"
			size="sm"
			value={store.currentSlug}
			onchange={(e: Event) => (store.currentSlug = (e.currentTarget as HTMLSelectElement).value)}
		>
			{#each store.site.pages as page, i (`${page.slug}-${i}`)}
				<option value={page.slug}>{page.title[store.editLocale]} (/{page.slug})</option>
			{/each}
		</FlowbiteSelect>
	</label>

	<p class="text-xs text-[var(--sk-muted)]">
		{t('editor.content.editingNote', { locale: store.editLocale.toUpperCase() })}
	</p>

	{#each store.currentPage.sections as section, i (`${section.id}-${i}`)}
		<details class="sk-editor-collapse" open={selectedSectionId === section.id}>
			<summary class="min-h-0 cursor-pointer list-none py-3 text-sm font-semibold">
				{sectionLabel(section.type)}
				<span class="ml-1 text-xs font-normal text-[var(--sk-faint)]">#{section.id}</span>
			</summary>
			<div class="px-4 pb-4">
				<SectionStyleControls
					style={{ ...DEFAULT_SECTION_STYLE, ...section.style }}
					onupdate={(key, value) =>
						store.update(() => {
							section.style = {
								...DEFAULT_SECTION_STYLE,
								...section.style,
								[key]: value
							} as SectionStyle;
						})}
				/>
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
