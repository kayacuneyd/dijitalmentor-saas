<script lang="ts">
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import type { Locale } from '$lib/schema/site';
	import { getTranslate } from '$lib/i18n/context';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import FlowbiteBadge from '$lib/ui/primitives/FlowbiteBadge.svelte';
	import FlowbiteSelect from '$lib/ui/primitives/FlowbiteSelect.svelte';

	const t = getTranslate();

	let { store }: { store: DraftStore } = $props();
</script>

<div class="flex flex-col gap-4">
	<fieldset class="rounded-[10px] border border-[var(--sk-line)] p-3">
		<legend class="px-1 text-xs font-medium">{t('editor.languages.editingLocaleLegend')}</legend>
		<div class="flex w-full gap-1">
			{#each store.site.locales as locale (locale)}
				<FlowbiteButton
					variant={store.editLocale === locale ? 'primary' : 'ghost'}
					size="sm"
					class="grow"
					onclick={() => (store.editLocale = locale)}
				>
					{locale.toUpperCase()}
				</FlowbiteButton>
			{/each}
		</div>
		<p class="mt-2 text-xs text-[var(--sk-muted)]">
			{t('editor.languages.editingLocaleHelp')}
		</p>
	</fieldset>

	<label class="sk-field-stack">
		<span class="mb-1 block text-xs font-medium">{t('editor.languages.defaultLocaleLabel')}</span>
		<FlowbiteSelect
			class="w-full"
			size="sm"
			value={store.site.defaultLocale}
			onchange={(e: Event) => {
				const next = (e.currentTarget as HTMLSelectElement).value as Locale;
				store.update((site) => {
					site.defaultLocale = next;
				});
			}}
		>
			{#each store.site.locales as locale (locale)}
				<option value={locale}>{locale.toUpperCase()}</option>
			{/each}
		</FlowbiteSelect>
	</label>

	<div>
		<span class="text-xs font-medium">{t('editor.languages.enabledLocalesLabel')}</span>
		<div class="mt-1 flex gap-2">
			{#each store.site.locales as locale (locale)}
				<FlowbiteBadge tone="neutral">{locale.toUpperCase()}</FlowbiteBadge>
			{/each}
		</div>
		<p class="mt-2 text-xs text-[var(--sk-muted)]">
			{t('editor.languages.enabledLocalesHelp')}
		</p>
	</div>
</div>
