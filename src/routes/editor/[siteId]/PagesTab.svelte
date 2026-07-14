<script lang="ts">
	import { page } from '$app/state';
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import { LOCALES, type Locale } from '$lib/schema/site';
	import { addPage, removePage, MAX_PAGES } from '$lib/editor/pageOps';
	import { getTranslate } from '$lib/i18n/context';
	import { DEFAULT_LOCALE, type Locale as AppLocale } from '$lib/i18n';
	import type { CatalogKey } from '$lib/i18n/catalog';
	import { siteQualityCheck } from '$lib/quality/siteQuality';

	const t = getTranslate();
	const appLocale: AppLocale = $derived(
		(page.data.locale as AppLocale | undefined) ?? DEFAULT_LOCALE
	);

	let { store }: { store: DraftStore } = $props();

	let slug = $state('');
	let titles = $state<Record<Locale, string>>({ tr: '', en: '', de: '' });
	let formError = $state('');
	let addFormOpen = $state(false);
	let confirmRemoveSlug = $state<string | null>(null);

	const sectionLabel = (type: string) => t(`editor.blocks.${type}` as CatalogKey);

	const navSlugs = $derived(new Set(store.site.nav.items.map((item) => item.pageSlug)));

	function pageHasContact(pageSlug: string) {
		return store.site.pages
			.find((page) => page.slug === pageSlug)
			?.sections.some((section) => section.type === 'contact' || section.type === 'booking');
	}

	function submitAddPage() {
		formError = '';
		let result: ReturnType<typeof addPage> | undefined;
		store.update((site) => {
			result = addPage(site, { slug, titles }, appLocale);
		});
		if (!result || !result.ok) {
			formError = result?.error ?? t('editor.pages.addFailed');
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
			result = removePage(site, pageSlug, appLocale);
		});
		if (result?.ok && store.currentSlug === pageSlug) {
			store.currentSlug = result.nextSlug;
		}
		confirmRemoveSlug = null;
	}

	// Quality-driven sitemap suggestions — AI next-best-actions for site structure
	const quality = $derived(siteQualityCheck(store.site));
	const suggestions = $derived.by(() => {
		const items: Array<{ severity: 'warning' | 'info'; message: string; action: string }> = [];
		const hasFaq = store.site.pages.some((p) => p.sections.some((s) => s.type === 'faq'));
		const hasContact = store.site.pages.some(
			(p) => p.sections.some((s) => s.type === 'contact')
		);
		const hasCredentials = store.site.pages.some(
			(p) => p.sections.some((s) => s.type === 'credentials')
		);
		const hasTestimonials = store.site.pages.some(
			(p) => p.sections.some((s) => s.type === 'testimonials')
		);
		if (!hasContact) {
			items.push({ severity: 'warning', message: 'İletişim section ekle — ziyaretçiler sana ulaşamaz.', action: 'contact-block' });
		}
		if (!hasFaq && store.site.pages.length < MAX_PAGES) {
			items.push({ severity: 'info', message: 'SSS sayfası ekle — güveni artırır.', action: 'add-faq-page' });
		}
		if (!hasCredentials) {
			items.push({ severity: 'info', message: 'Sertifika/yetkinlik section\'ı ekle — profesyonel güven.', action: 'credentials-section' });
		}
		if (!hasTestimonials) {
			items.push({ severity: 'info', message: 'Referans section\'ı ekle — sosyal kanıt sağlar.', action: 'testimonials-section' });
		}
		if (quality.warnings.find((w) => w.code === 'missing_contact_path')) {
			items.push({ severity: 'warning', message: 'İletişim yolun zayıf — contact veya booking section ekle.', action: 'contact-page' });
		}
		return items;
	});

	const pageStatuses = $derived.by(() => {
		return store.site.pages.map((page) => {
			const issues: Array<{ kind: 'warning' | 'info'; label: string }> = [];
			const hasContact = page.sections.some(
				(s) => s.type === 'contact' || s.type === 'booking'
			);
			const hasMissingLocale = LOCALES.some(
				(loc) => !page.title[loc] || page.title[loc].trim() === ''
			);
			const isInNav = navSlugs.has(page.slug);
			if (!hasContact && page.slug === store.site.pages.at(-1)?.slug) {
				issues.push({ kind: 'warning', label: 'İletişim yok' });
			}
			if (hasMissingLocale) {
				issues.push({ kind: 'warning', label: 'Eksik çeviri' });
			}
			if (!isInNav) {
				issues.push({ kind: 'info', label: 'Menüde gizli' });
			}
			return { slug: page.slug, issues };
		});
	});

	function pageStatus(pageSlug: string) {
		return pageStatuses.find((p) => p.slug === pageSlug)?.issues ?? [];
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center justify-between">
		<span class="sk-mono text-[10px] text-[var(--sk-faint)]">{t('editor.pages.title')}</span>
		<span class="sk-mono text-[10px] text-[var(--sk-faint)]">
			{store.site.pages.length}/{MAX_PAGES}
		</span>
	</div>

	<ul class="flex flex-col gap-2">
		{#each store.site.pages as pageItem, pageIndex (`${pageItem.slug}-${pageIndex}`)}
			{@const statuses = pageStatus(pageItem.slug)}
			<li class="rounded-[10px] border border-[var(--sk-line)] bg-white/70">
				<div class="flex items-start gap-1 p-1.5">
					<button
						type="button"
						class="min-w-0 flex-1 rounded-[8px] px-2.5 py-2 text-left text-sm transition {pageItem.slug ===
						store.currentSlug
							? 'bg-[#171614] text-[#f3ecdd]'
							: 'hover:bg-[var(--sk-shell)]'}"
						onclick={() => (store.currentSlug = pageItem.slug)}
					>
						<span class="block truncate font-semibold">{pageItem.title[store.editLocale]}</span>
						<span
							class="font-[var(--font-mono)] text-[10px] {pageItem.slug === store.currentSlug
								? 'text-[#f3ecdd]/60'
								: 'text-[var(--sk-faint)]'}"
						>
							/{pageItem.slug}
						</span>
					</button>
					{#if store.site.pages.length > 1}
						<button
							type="button"
							class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm shrink-0 px-2"
							onclick={() => (confirmRemoveSlug = pageItem.slug)}
							aria-label={t('editor.pages.deleteAria', { name: pageItem.title[store.editLocale] })}
							title={t('editor.pages.deleteTitle')}
						>
							✕
						</button>
					{/if}
				</div>
				<div class="flex flex-wrap gap-1 px-3 pb-2">
					<span class="badge badge-sm badge-secondary"
						>{t('editor.pages.sectionsBadge', { count: pageItem.sections.length })}</span
					>
					{#if navSlugs.has(pageItem.slug)}
						<span class="badge badge-sm">{t('editor.pages.inMenu')}</span>
					{:else}
						<span class="badge badge-sm badge-warning">{t('editor.pages.notInMenu')}</span>
					{/if}
					{#if pageHasContact(pageItem.slug)}
						<span class="badge badge-sm badge-success">{t('editor.pages.hasContact')}</span>
					{/if}
					{#each statuses as status (status.label)}
						<span
							class="badge badge-sm {status.kind === 'warning' ? 'badge-warning' : 'badge-ghost'}"
							title={status.label}
						>
							{status.label}
						</span>
					{/each}
				</div>
				<ol class="border-t border-[var(--sk-line)] px-3 py-2">
					{#each pageItem.sections as section, index (`${section.id}-${index}`)}
						<li class="flex items-center gap-2 py-1 text-xs text-[var(--sk-muted)]">
							<span class="sk-mono w-5 text-[10px] text-[var(--sk-faint)]">
								{index + 1}
							</span>
							<span class="badge badge-sm">{sectionLabel(section.type)}</span>
							<span class="min-w-0 truncate font-[var(--font-mono)] text-[10px]">{section.id}</span>
						</li>
					{/each}
				</ol>
			</li>
			{#if confirmRemoveSlug === pageItem.slug}
				<li
					class="flex flex-col gap-2 rounded-[10px] border border-[#b8532f]/40 bg-[#b8532f]/5 p-3"
				>
					<p class="text-xs text-[#b8532f]">
						{t('editor.pages.confirmDeleteQuestion', { name: pageItem.title[store.editLocale] })}
						{#if pageItem.slug === store.site.pages[0].slug}
							{t('editor.pages.confirmDeleteHomeWarning')}
						{/if}
					</p>
					<div class="flex gap-2">
						<button
							type="button"
							class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm"
							onclick={() => confirmRemove(pageItem.slug)}
						>
							{t('editor.pages.confirmYes')}
						</button>
						<button
							type="button"
							class="sk-btn sk-btn-ghost sk-btn-sm"
							onclick={() => (confirmRemoveSlug = null)}
						>
							{t('editor.pages.confirmCancel')}
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
			{t('editor.pages.addNew')}
		</summary>
		<div class="flex flex-col gap-2 border-t border-[var(--sk-line)] p-3">
			<label class="flex flex-col gap-1">
				<span class="text-xs text-[var(--sk-faint)]">{t('editor.pages.slugLabel')}</span>
				<input
					type="text"
					class="sk-input min-h-8 py-1.5 text-sm"
					placeholder="about-us"
					bind:value={slug}
				/>
			</label>
			{#each LOCALES as locale (locale)}
				<label class="flex flex-col gap-1">
					<span class="text-xs text-[var(--sk-faint)]"
						>{t('editor.pages.titleLabel', { locale: locale.toUpperCase() })}</span
					>
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
				{t('editor.pages.addButton')}
			</button>
			<p class="text-xs text-[var(--sk-faint)]">
				{t('editor.pages.addHelp')}
			</p>
		</div>
	</details>

	{#if suggestions.length}
		<div class="rounded-[12px] border border-blue-200 bg-blue-50/70 p-3">
			<div class="mb-2 text-[10px] font-semibold text-blue-800">AI Önerileri</div>
			<div class="flex flex-col gap-1.5">
				{#each suggestions as sug (`${sug.action}`)}
					<div
						class="flex items-start gap-2 rounded-[8px] bg-white/80 px-2.5 py-2 text-xs {sug.severity === 'warning' ? 'text-amber-800' : 'text-blue-800'}"
					>
						<span class="mt-0.5 shrink-0">{sug.severity === 'warning' ? '⚠' : '💡'}</span>
						<span class="leading-5">{sug.message}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>