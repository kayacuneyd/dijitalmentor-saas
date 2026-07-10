<script lang="ts">
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import { LOCALES, type Locale } from '$lib/schema/site';
	import { addPage, removePage, MAX_PAGES } from '$lib/editor/pageOps';

	let { store }: { store: DraftStore } = $props();

	let slug = $state('');
	let titles = $state<Record<Locale, string>>({ tr: '', en: '', de: '' });
	let formError = $state('');
	let addFormOpen = $state(false);
	let confirmRemoveSlug = $state<string | null>(null);

	function submitAddPage() {
		formError = '';
		let result: ReturnType<typeof addPage> | undefined;
		store.update((site) => {
			result = addPage(site, { slug, titles });
		});
		if (!result || !result.ok) {
			formError = result?.error ?? 'Sayfa eklenemedi.';
			return;
		}
		store.currentSlug = result.slug;
		slug = '';
		titles = { tr: '', en: '', de: '' };
		addFormOpen = false;
	}

	function confirmRemove(pageSlug: string) {
		let result: ReturnType<typeof removePage> | undefined;
		store.update((site) => {
			result = removePage(site, pageSlug);
		});
		if (result?.ok && store.currentSlug === pageSlug) {
			store.currentSlug = result.nextSlug;
		}
		confirmRemoveSlug = null;
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center justify-between">
		<span class="sk-mono text-[10px] text-[var(--sk-faint)]">Sayfalar</span>
		<span class="sk-mono text-[10px] text-[var(--sk-faint)]">
			{store.site.pages.length}/{MAX_PAGES}
		</span>
	</div>

	<ul class="flex flex-col gap-1">
		{#each store.site.pages as page (page.slug)}
			<li class="flex items-center gap-1">
				<button
					type="button"
					class="min-w-0 flex-1 rounded-[10px] px-2.5 py-2 text-left text-sm transition {page.slug ===
					store.currentSlug
						? 'bg-[#171614] text-[#f3ecdd]'
						: 'hover:bg-[var(--sk-shell)]'}"
					onclick={() => (store.currentSlug = page.slug)}
				>
					<span class="truncate">{page.title[store.editLocale]}</span>
					<span
						class="ml-1.5 font-[var(--font-mono)] text-[10px] {page.slug === store.currentSlug
							? 'text-[#f3ecdd]/60'
							: 'text-[var(--sk-faint)]'}"
					>
						/{page.slug}
					</span>
				</button>
				{#if store.site.pages.length > 1}
					<button
						type="button"
						class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm shrink-0 px-2"
						onclick={() => (confirmRemoveSlug = page.slug)}
						aria-label={`"${page.title[store.editLocale]}" sayfasını sil`}
						title="Sayfayı sil"
					>
						✕
					</button>
				{/if}
			</li>
			{#if confirmRemoveSlug === page.slug}
				<li
					class="flex flex-col gap-2 rounded-[10px] border border-[#b8532f]/40 bg-[#b8532f]/5 p-3"
				>
					<p class="text-xs text-[#b8532f]">
						"{page.title[store.editLocale]}" sayfasını sil?
						{#if page.slug === store.site.pages[0].slug}
							Bu ana sayfa — silersen listedeki bir sonraki sayfa ana sayfa olur.
						{/if}
					</p>
					<div class="flex gap-2">
						<button
							type="button"
							class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm"
							onclick={() => confirmRemove(page.slug)}
						>
							Evet, sil
						</button>
						<button
							type="button"
							class="sk-btn sk-btn-ghost sk-btn-sm"
							onclick={() => (confirmRemoveSlug = null)}
						>
							Vazgeç
						</button>
					</div>
				</li>
			{/if}
		{/each}
	</ul>

	<details bind:open={addFormOpen} class="rounded-[10px] border border-[var(--sk-line)]">
		<summary
			class="cursor-pointer list-none px-3 py-2 text-sm font-medium select-none [&::-webkit-details-marker]:hidden"
		>
			+ Yeni sayfa
		</summary>
		<div class="flex flex-col gap-2 border-t border-[var(--sk-line)] p-3">
			<label class="flex flex-col gap-1">
				<span class="text-xs text-[var(--sk-faint)]">Slug</span>
				<input
					type="text"
					class="sk-input min-h-8 py-1.5 text-sm"
					placeholder="about-us"
					bind:value={slug}
				/>
			</label>
			{#each LOCALES as locale (locale)}
				<label class="flex flex-col gap-1">
					<span class="text-xs text-[var(--sk-faint)]">Başlık ({locale.toUpperCase()})</span>
					<input type="text" class="sk-input min-h-8 py-1.5 text-sm" bind:value={titles[locale]} />
				</label>
			{/each}
			{#if formError}
				<p class="sk-alert sk-alert-error px-3 py-2 text-xs">{formError}</p>
			{/if}
			<button
				type="button"
				class="sk-btn sk-btn-primary sk-btn-sm mt-1 w-fit"
				onclick={submitAddPage}
				disabled={store.site.pages.length >= MAX_PAGES}
			>
				Sayfa ekle
			</button>
			<p class="text-xs text-[var(--sk-faint)]">
				Yeni sayfalar bir hero bölümüyle başlar ve menüye eklenir.
			</p>
		</div>
	</details>
</div>
