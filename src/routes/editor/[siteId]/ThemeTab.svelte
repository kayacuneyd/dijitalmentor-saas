<script lang="ts">
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import { DEFAULT_LAYOUT, type Layout, type Theme } from '$lib/schema/site';
	import { themePresets } from '$lib/presets';
	import { getTranslate } from '$lib/i18n/context';
	import FlowbiteInput from '$lib/ui/primitives/FlowbiteInput.svelte';
	import FlowbiteSelect from '$lib/ui/primitives/FlowbiteSelect.svelte';

	const t = getTranslate();

	let { store }: { store: DraftStore } = $props();

	const colorKeys = ['primary', 'secondary', 'accent'] as const;
	const radii: Theme['radius'][] = ['none', 'sm', 'md', 'lg', 'full'];
	const heroTitleSizes = ['compact', 'standard', 'large'] as const;
	const containerWidths: Layout['container']['width'][] = ['narrow', 'wide', 'full'];

	function applyPreset(preset: Theme['preset']) {
		store.update((site) => {
			site.theme = structuredClone(themePresets[preset]);
		});
	}
</script>

<div class="flex flex-col gap-4">
	<label class="sk-field-stack">
		<span class="mb-1 block text-xs font-medium">{t('editor.theme.nichePreset')}</span>
		<FlowbiteSelect
			class="w-full"
			size="sm"
			value={store.site.theme.preset}
			onchange={(e: Event) =>
				applyPreset((e.currentTarget as HTMLSelectElement).value as Theme['preset'])}
		>
			{#each Object.keys(themePresets) as preset (preset)}
				<option value={preset}>{preset}</option>
			{/each}
		</FlowbiteSelect>
	</label>

	<fieldset class="rounded-[10px] border border-[var(--sk-line)] p-3">
		<legend class="px-1 text-xs font-medium">{t('editor.theme.brandColors')}</legend>
		<div class="flex flex-col gap-2">
			{#each colorKeys as key (key)}
				<label class="flex items-center justify-between gap-2">
					<span class="text-sm capitalize">{key}</span>
					<span class="flex items-center gap-2">
						<code class="text-base-content/50 text-xs">{store.site.theme.colors[key]}</code>
						<input
							type="color"
							class="h-8 w-12 cursor-pointer rounded border-0 bg-transparent p-0"
							value={store.site.theme.colors[key]}
							oninput={(e) => {
								const next = e.currentTarget.value;
								store.update((site) => {
									site.theme.colors[key] = next;
								});
							}}
						/>
					</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<fieldset class="rounded-[10px] border border-[var(--sk-line)] p-3">
		<legend class="px-1 text-xs font-medium">{t('editor.theme.siteCanvas')}</legend>
		<p class="mb-3 text-[11px] leading-4 text-[var(--sk-muted)]">
			{t('editor.theme.siteCanvasHelp')}
		</p>
		<div class="grid grid-cols-3 gap-1" role="group" aria-label={t('editor.theme.siteCanvas')}>
			{#each containerWidths as width}
				<button
					type="button"
					class="min-h-10 rounded-md border px-2 text-xs font-medium"
					class:border-[var(--sk-accent)]={(store.site.layout?.container.width ??
						DEFAULT_LAYOUT.container.width) === width}
					class:bg-[var(--sk-accent-soft)]={(store.site.layout?.container.width ??
						DEFAULT_LAYOUT.container.width) === width}
					class:border-[var(--sk-line)]={(store.site.layout?.container.width ??
						DEFAULT_LAYOUT.container.width) !== width}
					onclick={() =>
						store.update(
							(site) => {
								site.layout = structuredClone(site.layout ?? DEFAULT_LAYOUT);
								site.layout.container.width = width;
							},
							{ history: true }
						)}
				>
					{t(`editor.theme.canvasWidths.${width}`)}
				</button>
			{/each}
		</div>
	</fieldset>

	<fieldset class="rounded-[10px] border border-[var(--sk-line)] p-3">
		<legend class="px-1 text-xs font-medium">{t('editor.theme.fonts')}</legend>
		<div class="flex flex-col gap-2">
			{#each ['heading', 'body'] as const as key (key)}
				<label class="sk-field-stack">
					<span class="mb-1 block text-xs capitalize">{key}</span>
					<FlowbiteInput
						type="text"
						size="sm"
						class="w-full"
						value={store.site.theme.fonts[key]}
						oninput={(e: Event) => {
							const next = (e.currentTarget as HTMLInputElement).value;
							store.update((site) => {
								site.theme.fonts[key] = next;
							});
						}}
					/>
				</label>
			{/each}
		</div>
	</fieldset>

	<label class="sk-field-stack">
		<span class="mb-1 block text-xs font-medium">{t('editor.theme.cornerRadius')}</span>
		<FlowbiteSelect
			class="w-full"
			size="sm"
			value={store.site.theme.radius}
			onchange={(e: Event) => {
				const next = (e.currentTarget as HTMLSelectElement).value as Theme['radius'];
				store.update((site) => {
					site.theme.radius = next;
				});
			}}
		>
			{#each radii as radius (radius)}
				<option value={radius}>{radius}</option>
			{/each}
		</FlowbiteSelect>
	</label>

	<fieldset class="rounded-[10px] border border-[var(--sk-line)] p-3">
		<legend class="px-1 text-xs font-medium">{t('editor.theme.heroTitleSize')}</legend>
		<div class="grid grid-cols-3 gap-1" role="group" aria-label={t('editor.theme.heroTitleSize')}>
			{#each heroTitleSizes as size}
				<button
					type="button"
					class="min-h-10 rounded-md border px-2 text-xs font-medium"
					class:border-[var(--sk-accent)]={(store.site.theme.heroTitleSize ?? 'standard') === size}
					class:bg-[var(--sk-accent-soft)]={(store.site.theme.heroTitleSize ?? 'standard') === size}
					class:border-[var(--sk-line)]={(store.site.theme.heroTitleSize ?? 'standard') !== size}
					onclick={() =>
						store.update((site) => {
							site.theme.heroTitleSize = size;
						})}
				>
					{t(`editor.theme.heroTitleSizes.${size}`)}
				</button>
			{/each}
		</div>
	</fieldset>
</div>
