<script lang="ts">
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import type { Theme } from '$lib/schema/site';
	import { themePresets } from '$lib/presets';

	let { store }: { store: DraftStore } = $props();

	const colorKeys = ['primary', 'secondary', 'accent'] as const;
	const radii: Theme['radius'][] = ['none', 'sm', 'md', 'lg', 'full'];

	function applyPreset(preset: Theme['preset']) {
		store.update((site) => {
			site.theme = structuredClone(themePresets[preset]);
		});
	}
</script>

<div class="flex flex-col gap-4">
	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">Niche preset</span>
		<select
			class="select select-sm w-full"
			value={store.site.theme.preset}
			onchange={(e) => applyPreset(e.currentTarget.value as Theme['preset'])}
		>
			{#each Object.keys(themePresets) as preset (preset)}
				<option value={preset}>{preset}</option>
			{/each}
		</select>
	</label>

	<fieldset class="border-base-300 rounded-field border p-3">
		<legend class="px-1 text-xs font-medium">Brand colors</legend>
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

	<fieldset class="border-base-300 rounded-field border p-3">
		<legend class="px-1 text-xs font-medium">Fonts</legend>
		<div class="flex flex-col gap-2">
			{#each ['heading', 'body'] as const as key (key)}
				<label class="form-control">
					<span class="label-text mb-1 block text-xs capitalize">{key}</span>
					<input
						type="text"
						class="input input-sm w-full"
						value={store.site.theme.fonts[key]}
						oninput={(e) => {
							const next = e.currentTarget.value;
							store.update((site) => {
								site.theme.fonts[key] = next;
							});
						}}
					/>
				</label>
			{/each}
		</div>
	</fieldset>

	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">Corner radius</span>
		<select
			class="select select-sm w-full"
			value={store.site.theme.radius}
			onchange={(e) => {
				const next = e.currentTarget.value as Theme['radius'];
				store.update((site) => {
					site.theme.radius = next;
				});
			}}
		>
			{#each radii as radius (radius)}
				<option value={radius}>{radius}</option>
			{/each}
		</select>
	</label>
</div>
