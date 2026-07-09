<script lang="ts">
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import { LOCALES, type Page } from '$lib/schema/site';

	let { store }: { store: DraftStore } = $props();

	let slug = $state('');
	let titles = $state<Record<string, string>>({ tr: '', en: '', de: '' });
	let formError = $state('');

	const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

	function addPage() {
		formError = '';
		if (!SLUG_RE.test(slug)) {
			formError = 'Slug must be kebab-case (a-z, 0-9, dashes).';
			return;
		}
		if (store.site.pages.some((p) => p.slug === slug)) {
			formError = `A page with slug "${slug}" already exists.`;
			return;
		}
		if (store.site.pages.length >= 10) {
			formError = 'Page limit reached (10).';
			return;
		}
		if (LOCALES.some((l) => !titles[l].trim())) {
			formError = 'A title is required for every locale.';
			return;
		}

		const title = { tr: titles.tr.trim(), en: titles.en.trim(), de: titles.de.trim() };
		const newPage: Page = {
			slug,
			title,
			sections: [
				{
					id: `hero-${slug}`,
					type: 'hero',
					props: { variant: 'centered', background: 'plain' },
					content: {
						tr: { headline: title.tr },
						en: { headline: title.en },
						de: { headline: title.de }
					}
				}
			]
		};
		const newSlug = slug;
		store.update((site) => {
			site.pages.push(newPage);
			if (site.nav.items.length < 8) {
				site.nav.items.push({ pageSlug: newSlug, label: { ...title } });
			}
		});
		store.currentSlug = newSlug;
		slug = '';
		titles = { tr: '', en: '', de: '' };
	}
</script>

<div class="flex flex-col gap-4">
	<ul class="menu bg-base-200 rounded-box w-full">
		{#each store.site.pages as page (page.slug)}
			<li>
				<button
					class:menu-active={page.slug === store.currentSlug}
					onclick={() => (store.currentSlug = page.slug)}
				>
					<span class="truncate">{page.title[store.editLocale]}</span>
					<span class="text-base-content/40 text-xs">/{page.slug}</span>
				</button>
			</li>
		{/each}
	</ul>

	<fieldset class="border-base-300 rounded-field border p-3">
		<legend class="px-1 text-xs font-medium">Add page</legend>
		<div class="flex flex-col gap-2">
			<label class="form-control">
				<span class="label-text mb-1 block text-xs">Slug</span>
				<input type="text" class="input input-sm w-full" placeholder="about-us" bind:value={slug} />
			</label>
			{#each LOCALES as locale (locale)}
				<label class="form-control">
					<span class="label-text mb-1 block text-xs">Title ({locale.toUpperCase()})</span>
					<input type="text" class="input input-sm w-full" bind:value={titles[locale]} />
				</label>
			{/each}
			{#if formError}
				<p class="text-error text-xs">{formError}</p>
			{/if}
			<button class="btn btn-primary btn-sm mt-1" onclick={addPage}>Add page</button>
			<p class="text-base-content/50 text-xs">
				New pages start with a hero section and are added to the navigation.
			</p>
		</div>
	</fieldset>
</div>
