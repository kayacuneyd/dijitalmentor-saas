<script lang="ts">
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import type { Locale } from '$lib/schema/site';

	let { store }: { store: DraftStore } = $props();
</script>

<div class="flex flex-col gap-4">
	<fieldset class="border-base-300 rounded-field border p-3">
		<legend class="px-1 text-xs font-medium">Editing locale</legend>
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
			The Content tab and the preview follow this locale.
		</p>
	</fieldset>

	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">Default locale</span>
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
		<span class="text-xs font-medium">Enabled locales</span>
		<div class="mt-1 flex gap-2">
			{#each store.site.locales as locale (locale)}
				<span class="badge badge-outline">{locale.toUpperCase()}</span>
			{/each}
		</div>
		<p class="text-base-content/50 mt-2 text-xs">
			All sites ship with TR/EN/DE content; per-site locale toggles arrive with publishing (M4).
		</p>
	</div>
</div>
