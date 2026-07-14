<script lang="ts">
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import type { Locale } from '$lib/schema/site';
	import { getTranslate } from '$lib/i18n/context';

	const t = getTranslate();

	let { store }: { store: DraftStore } = $props();
</script>

<div class="flex flex-col gap-4">
	<fieldset class="border-base-300 rounded-field border p-3">
		<legend class="px-1 text-xs font-medium">{t('editor.languages.editingLocaleLegend')}</legend>
		<div class="join w-full">
			{#each store.site.locales as locale (locale)}
				<button
					class="join-item btn btn-sm grow {store.editLocale === locale
						? 'btn-primary'
						: 'btn-ghost'}"
					onclick={() => (store.editLocale = locale)}
				>
					{locale.toUpperCase()}
				</button>
			{/each}
		</div>
		<p class="text-base-content/50 mt-2 text-xs">
			{t('editor.languages.editingLocaleHelp')}
		</p>
	</fieldset>

	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium"
			>{t('editor.languages.defaultLocaleLabel')}</span
		>
		<select
			class="select select-sm w-full"
			value={store.site.defaultLocale}
			onchange={(e) => {
				const next = e.currentTarget.value as Locale;
				store.update((site) => {
					site.defaultLocale = next;
				});
			}}
		>
			{#each store.site.locales as locale (locale)}
				<option value={locale}>{locale.toUpperCase()}</option>
			{/each}
		</select>
	</label>

	<div>
		<span class="text-xs font-medium">{t('editor.languages.enabledLocalesLabel')}</span>
		<div class="mt-1 flex gap-2">
			{#each store.site.locales as locale (locale)}
				<span class="badge badge-outline">{locale.toUpperCase()}</span>
			{/each}
		</div>
		<p class="text-base-content/50 mt-2 text-xs">
			{t('editor.languages.enabledLocalesHelp')}
		</p>
	</div>
</div>
