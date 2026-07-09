<script lang="ts">
	import type { DraftStore } from '$lib/stores/draft.svelte';

	let { store }: { store: DraftStore } = $props();
</script>

<div class="flex flex-col gap-4">
	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">Site name</span>
		<input
			type="text"
			class="input input-sm w-full"
			value={store.site.settings.siteName}
			oninput={(e) => {
				const next = e.currentTarget.value;
				store.update((site) => {
					site.settings.siteName = next;
				});
			}}
		/>
	</label>

	<label class="form-control">
		<span class="label-text mb-1 block text-xs font-medium">Contact email</span>
		<input
			type="email"
			class="input input-sm w-full"
			value={store.site.settings.contactEmail ?? ''}
			oninput={(e) => {
				const next = e.currentTarget.value.trim();
				store.update((site) => {
					if (next) site.settings.contactEmail = next;
					else delete site.settings.contactEmail;
				});
			}}
		/>
	</label>

	<label class="flex items-center justify-between gap-2">
		<span class="text-sm">"Powered by saaskaya" badge</span>
		<input
			type="checkbox"
			class="toggle toggle-primary toggle-sm"
			checked={store.site.settings.poweredByBadge}
			onchange={(e) => {
				const next = e.currentTarget.checked;
				store.update((site) => {
					site.settings.poweredByBadge = next;
				});
			}}
		/>
	</label>

	<div>
		<span class="text-xs font-medium">Domain</span>
		<p class="text-base-content/50 mt-1 text-xs">
			{store.site.domain ?? 'No domain yet — real domain registration arrives in M5.'}
		</p>
	</div>
</div>
