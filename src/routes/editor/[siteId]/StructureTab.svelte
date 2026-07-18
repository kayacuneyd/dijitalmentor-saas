<script lang="ts">
	import {
		AngleDownOutline,
		AngleUpOutline,
		BarsOutline,
		FileCopyOutline,
		PlusOutline,
		RedoOutline,
		TrashBinOutline,
		UndoOutline
	} from 'flowbite-svelte-icons';
	import type { CatalogKey } from '$lib/i18n/catalog';
	import { getTranslate } from '$lib/i18n/context';
	import {
		createVisualSection,
		duplicateSection,
		moveSection,
		removeSection,
		VISUAL_SECTION_TYPES,
		type VisualSectionType
	} from '$lib/editor/sectionOps';
	import { DEFAULT_SECTION_STYLE, type SectionStyle } from '$lib/schema/site';
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import SectionStyleControls from './SectionStyleControls.svelte';

	let {
		store,
		selectedSectionId,
		onselect,
		onedit
	}: {
		store: DraftStore;
		selectedSectionId: string | null;
		onselect: (sectionId: string) => void;
		onedit: (sectionId: string) => void;
	} = $props();

	const t = getTranslate();
	const sectionLabel = (type: string) => t(`editor.blocks.${type}` as CatalogKey);
	let insertAt = $state<number | null>(null);
	let pendingDelete = $state<string | null>(null);
	let draggedSectionId = $state<string | null>(null);
	const selectedSection = $derived(
		store.currentPage.sections.find((section) => section.id === selectedSectionId) ?? null
	);

	function commit(mutate: () => void) {
		store.update(mutate, { history: true });
	}

	function move(sectionId: string, toIndex: number) {
		commit(() => moveSection(store.currentPage, sectionId, toIndex));
		onselect(sectionId);
	}

	function add(type: VisualSectionType) {
		if (insertAt === null || store.currentPage.sections.length >= 12) return;
		let sectionId = '';
		commit(() => {
			const section = createVisualSection(
				store.currentPage,
				type,
				store.site.settings.contactEmail ?? 'hello@example.com'
			);
			sectionId = section.id;
			store.currentPage.sections.splice(insertAt!, 0, section);
		});
		insertAt = null;
		onselect(sectionId);
	}

	function duplicate(sectionId: string) {
		let duplicateId: string | null = null;
		commit(() => {
			duplicateId = duplicateSection(store.currentPage, sectionId);
		});
		if (duplicateId) onselect(duplicateId);
	}

	function remove(sectionId: string) {
		const index = store.currentPage.sections.findIndex((section) => section.id === sectionId);
		if (index < 0) return;
		commit(() => removeSection(store.currentPage, sectionId));
		pendingDelete = null;
		const fallback =
			store.currentPage.sections[Math.min(index, store.currentPage.sections.length - 1)];
		if (fallback) onselect(fallback.id);
	}

	function dropAt(index: number) {
		if (!draggedSectionId) return;
		move(draggedSectionId, index);
		draggedSectionId = null;
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-start justify-between gap-3">
		<div>
			<h2 class="text-sm font-semibold">{t('editor.structure.title')}</h2>
			<p class="mt-1 text-xs leading-5 text-[var(--sk-muted)]">
				{t('editor.structure.description')}
			</p>
		</div>
		<div class="flex shrink-0 gap-1">
			<FlowbiteButton
				type="button"
				variant="ghost"
				size="sm"
				class="size-10 !p-0"
				disabled={!store.canUndo}
				aria-label={t('editor.structure.undo')}
				title={t('editor.structure.undo')}
				onclick={() => store.undo()}
			>
				<UndoOutline size="sm" />
			</FlowbiteButton>
			<FlowbiteButton
				type="button"
				variant="ghost"
				size="sm"
				class="size-10 !p-0"
				disabled={!store.canRedo}
				aria-label={t('editor.structure.redo')}
				title={t('editor.structure.redo')}
				onclick={() => store.redo()}
			>
				<RedoOutline size="sm" />
			</FlowbiteButton>
		</div>
	</div>

	<label class="sk-field-stack">
		<span class="mb-1 text-xs font-medium">{t('editor.content.pageLabel')}</span>
		<select
			class="sk-input min-h-10 text-sm"
			value={store.currentSlug}
			onchange={(event) => {
				store.currentSlug = event.currentTarget.value;
				const first = store.currentPage.sections[0];
				if (first) onselect(first.id);
			}}
		>
			{#each store.site.pages as page (`${page.slug}-${page.title[store.editLocale]}`)}
				<option value={page.slug}>{page.title[store.editLocale]}</option>
			{/each}
		</select>
	</label>

	<div
		class="rounded-[var(--sk-radius-sm)] border border-[var(--sk-line)] bg-[var(--sk-shell)] p-2"
		role="list"
	>
		<button
			type="button"
			class="structure-insert"
			disabled={store.currentPage.sections.length >= 12}
			onclick={() => (insertAt = insertAt === 0 ? null : 0)}
		>
			<PlusOutline size="xs" />{t('editor.structure.addSection')}
		</button>
		{#if insertAt === 0}
			<div class="mb-2 grid grid-cols-2 gap-1 rounded-[var(--sk-radius-sm)] bg-white p-2">
				{#each VISUAL_SECTION_TYPES as type}
					<button type="button" class="structure-library-item" onclick={() => add(type)}>
						{sectionLabel(type)}
					</button>
				{/each}
			</div>
		{/if}

		{#each store.currentPage.sections as section, index (`${section.id}-${index}`)}
			<div
				class="structure-row"
				class:structure-row-selected={selectedSectionId === section.id}
				role="listitem"
				draggable={true}
				ondragstart={(event) => {
					draggedSectionId = section.id;
					event.dataTransfer?.setData('text/plain', section.id);
				}}
				ondragover={(event) => event.preventDefault()}
				ondrop={(event) => {
					event.preventDefault();
					dropAt(index);
				}}
			>
				<button
					type="button"
					class="flex min-w-0 flex-1 items-center gap-2 text-left"
					onclick={() => onselect(section.id)}
					onkeydown={(event) => {
						if (!event.altKey) return;
						if (event.key === 'ArrowUp' && index > 0) {
							event.preventDefault();
							move(section.id, index - 1);
						}
						if (event.key === 'ArrowDown' && index < store.currentPage.sections.length - 1) {
							event.preventDefault();
							move(section.id, index + 1);
						}
					}}
				>
					<BarsOutline size="sm" class="shrink-0 text-[var(--sk-faint)]" />
					<span class="min-w-0">
						<span class="block truncate text-xs font-semibold">{sectionLabel(section.type)}</span>
						<span class="sk-mono mt-0.5 block truncate text-[9px] text-[var(--sk-faint)]">
							{section.id}
						</span>
					</span>
				</button>
				<div class="flex shrink-0 items-center gap-0.5">
					<button
						type="button"
						class="structure-icon-button"
						disabled={index === 0}
						aria-label={t('editor.structure.moveUp')}
						onclick={() => move(section.id, index - 1)}
					>
						<AngleUpOutline size="xs" />
					</button>
					<button
						type="button"
						class="structure-icon-button"
						disabled={index === store.currentPage.sections.length - 1}
						aria-label={t('editor.structure.moveDown')}
						onclick={() => move(section.id, index + 1)}
					>
						<AngleDownOutline size="xs" />
					</button>
					<button
						type="button"
						class="structure-icon-button"
						disabled={store.currentPage.sections.length >= 12}
						aria-label={t('editor.structure.duplicate')}
						onclick={() => duplicate(section.id)}
					>
						<FileCopyOutline size="xs" />
					</button>
					<button
						type="button"
						class="structure-icon-button text-[var(--sk-error)]"
						disabled={store.currentPage.sections.length <= 1}
						aria-label={t('editor.structure.delete')}
						onclick={() => (pendingDelete = section.id)}
					>
						<TrashBinOutline size="xs" />
					</button>
				</div>
			</div>

			{#if pendingDelete === section.id}
				<div class="mx-1 mb-2 rounded-[var(--sk-radius-sm)] bg-[var(--sk-error-bg)] p-3">
					<p class="text-xs leading-5 text-[var(--sk-error-ink)]">
						{t('editor.structure.deleteConfirm', { name: sectionLabel(section.type) })}
					</p>
					<div class="mt-2 flex gap-2">
						<FlowbiteButton
							type="button"
							variant="danger"
							size="sm"
							onclick={() => remove(section.id)}
						>
							{t('editor.structure.delete')}
						</FlowbiteButton>
						<FlowbiteButton
							type="button"
							variant="ghost"
							size="sm"
							onclick={() => (pendingDelete = null)}
						>
							{t('editor.structure.cancel')}
						</FlowbiteButton>
					</div>
				</div>
			{/if}

			<button
				type="button"
				class="structure-insert"
				disabled={store.currentPage.sections.length >= 12}
				onclick={() => (insertAt = insertAt === index + 1 ? null : index + 1)}
			>
				<PlusOutline size="xs" />{t('editor.structure.addSection')}
			</button>

			{#if insertAt === index + 1}
				<div class="mb-2 grid grid-cols-2 gap-1 rounded-[var(--sk-radius-sm)] bg-white p-2">
					{#each VISUAL_SECTION_TYPES as type}
						<button type="button" class="structure-library-item" onclick={() => add(type)}>
							{sectionLabel(type)}
						</button>
					{/each}
				</div>
			{/if}
		{/each}
	</div>

	{#if selectedSection}
		<div class="border-t border-[var(--sk-line)] pt-4">
			<div class="mb-3 flex items-center justify-between gap-3">
				<div>
					<div class="sk-mono text-[9px] text-[var(--sk-faint)]">
						{t('editor.structure.selected')}
					</div>
					<h3 class="mt-1 text-sm font-semibold">{sectionLabel(selectedSection.type)}</h3>
				</div>
				<FlowbiteButton
					type="button"
					variant="secondary"
					size="sm"
					onclick={() => onedit(selectedSection.id)}
				>
					{t('editor.structure.editContent')}
				</FlowbiteButton>
			</div>
			<SectionStyleControls
				style={{ ...DEFAULT_SECTION_STYLE, ...selectedSection.style }}
				onupdate={(key, value) =>
					store.update(
						() => {
							selectedSection.style = {
								...DEFAULT_SECTION_STYLE,
								...selectedSection.style,
								[key]: value
							} as SectionStyle;
						},
						{ history: true }
					)}
			/>
		</div>
	{/if}
</div>

<style>
	.structure-row {
		display: flex;
		min-height: 3.25rem;
		align-items: center;
		gap: 0.5rem;
		margin-block: 0.25rem;
		padding: 0.375rem;
		border: 1px solid transparent;
		border-radius: var(--sk-radius-sm);
		background: var(--sk-card);
	}
	.structure-row-selected {
		border-color: var(--sk-accent);
		background: var(--sk-accent-soft);
	}
	.structure-row:focus-within {
		outline: 2px solid var(--sk-focus);
		outline-offset: 1px;
	}
	.structure-icon-button {
		display: inline-flex;
		width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: var(--sk-radius-sm);
		color: var(--sk-muted);
	}
	.structure-icon-button:hover:not(:disabled) {
		background: var(--sk-shell);
		color: var(--sk-ink);
	}
	.structure-icon-button:focus-visible,
	.structure-insert:focus-visible,
	.structure-library-item:focus-visible {
		outline: 2px solid var(--sk-focus);
		outline-offset: 1px;
	}
	.structure-icon-button:disabled,
	.structure-insert:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}
	.structure-insert {
		display: flex;
		width: 100%;
		min-height: 2rem;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		color: var(--sk-faint);
		font-size: 0.6875rem;
	}
	.structure-insert:hover:not(:disabled) {
		color: var(--sk-ink);
	}
	.structure-library-item {
		min-height: 2.5rem;
		padding-inline: 0.5rem;
		border-radius: var(--sk-radius-sm);
		color: var(--sk-muted);
		font-size: 0.75rem;
		font-weight: 600;
		text-align: left;
	}
	.structure-library-item:hover {
		background: var(--sk-shell);
		color: var(--sk-ink);
	}
</style>
