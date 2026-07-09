<script lang="ts">
	import ContentFields from './ContentFields.svelte';
	import ImageUploadField from './ImageUploadField.svelte';
	import type { DraftStore } from '$lib/stores/draft.svelte';

	/**
	 * Generic editor over one locale's `content` object of a section: strings become
	 * inputs/textareas, arrays of objects recurse. Purely schema-driven — adding a block
	 * type needs no editor change. Item add/remove is deferred (AI patch territory, M3).
	 */
	let {
		value,
		store,
		path = [],
		onMediaChange
	}: {
		value: Record<string, unknown>;
		store: DraftStore;
		path?: (string | number)[];
		onMediaChange?: (path: (string | number)[], url: string) => void;
	} = $props();

	const LONG_TEXT_KEYS = new Set([
		'body',
		'description',
		'intro',
		'answer',
		'subtitle',
		'subheadline',
		'text',
		'bio'
	]);
	const isLongText = (key: string, v: string) => LONG_TEXT_KEYS.has(key) || v.length > 80;
	const isImageField = (key: string) => key === 'imageUrl' || key === 'photoUrl' || key === 'url';

	function setField(key: string, next: string) {
		store.update(() => {
			value[key] = next;
		});
	}

	function setImageField(key: string, next: string) {
		if (onMediaChange) onMediaChange([...path, key], next);
		else setField(key, next);
	}
</script>

<div class="flex flex-col gap-3">
	{#each Object.entries(value) as [key, v] (key)}
		{#if typeof v === 'string'}
			{#if isImageField(key)}
				<ImageUploadField
					siteId={store.site.id}
					label={key}
					value={v}
					onchange={(url) => setImageField(key, url)}
				/>
			{:else}
				<label class="form-control">
					<span class="label-text mb-1 block text-xs font-medium capitalize">{key}</span>
					{#if isLongText(key, v)}
						<textarea
							class="textarea textarea-sm min-h-20 w-full text-sm"
							value={v}
							oninput={(e) => setField(key, e.currentTarget.value)}></textarea>
					{:else}
						<input
							type="text"
							class="input input-sm w-full text-sm"
							value={v}
							oninput={(e) => setField(key, e.currentTarget.value)}
						/>
					{/if}
				</label>
			{/if}
		{:else if Array.isArray(v)}
			<fieldset class="border-base-300 rounded-field border p-3">
				<legend class="px-1 text-xs font-medium capitalize">{key}</legend>
				<div class="flex flex-col gap-3">
					{#each v as item, i (i)}
						<div class="bg-base-200 rounded-field p-3">
							<ContentFields
								value={item as Record<string, unknown>}
								{store}
								path={[...path, key, i]}
								{onMediaChange}
							/>
						</div>
					{/each}
				</div>
			</fieldset>
		{/if}
	{/each}
</div>
