<script lang="ts">
	import { page } from '$app/state';
	import {
		ArrowRightOutline,
		EditOutline,
		MessagesOutline,
		PlusOutline
	} from 'flowbite-svelte-icons';
	import PageShell from '$lib/ui/PageShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import SitePreviewThumb from '$lib/ui/SitePreviewThumb.svelte';
	import { getTranslate } from '$lib/i18n/context';
	import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';

	let { data, form } = $props();

	const t = getTranslate();
	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);
	const siteName = (id: unknown) =>
		data.sites.find((site) => site.id === id)?.siteName ?? t('dashboard.card.fallbackName');
	const dateLocales: Record<Locale, string> = { en: 'en-US', tr: 'tr-TR', de: 'de-DE' };
	const formatDate = (date: string | Date) =>
		new Date(date).toLocaleDateString(dateLocales[locale], {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	const formatTry = (amount: number) =>
		new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(amount);
	const tryLabels = $derived(
		{
			en: { approx: 'approx.', rate: 'Daily ECB reference rate', paidIn: 'Payment is in EUR' },
			tr: {
				approx: 'yaklaşık',
				rate: 'Günlük ECB referans kuru',
				paidIn: 'Ödeme EUR olarak alınır'
			},
			de: { approx: 'ca.', rate: 'Täglicher EZB-Referenzkurs', paidIn: 'Zahlung erfolgt in EUR' }
		}[locale]
	);
</script>

<svelte:head>
	<title>{t('dashboard.title')} · saaskaya</title>
</svelte:head>

<PageShell
	title={t('dashboard.title')}
	description={data.user.email}
	canvasLabel="saaskaya.app / panel"
>
	{#snippet actions()}
		<FlowbiteButton href="/new" variant="primary">
			<PlusOutline size="sm" />{t('dashboard.nav.newSite')}
		</FlowbiteButton>
	{/snippet}

	{#if form?.published}
		<div class="sk-alert sk-alert-success">
			{t('dashboard.alerts.published', { name: siteName(form.published) })}
		</div>
	{:else if form?.unpublished}
		<div class="sk-alert">
			{t('dashboard.alerts.unpublished', { name: siteName(form.unpublished) })}
		</div>
	{:else if form?.message}
		<div class="sk-alert"><strong>{siteName(form.siteId)}</strong>: {form.message}</div>
	{:else if form?.deleted}
		<div class="sk-alert">{t('dashboard.alerts.deleted', { name: form.deleted })}</div>
	{/if}

	<section class="dashboard-index" aria-labelledby="dashboard-index-title">
		<div
			class="flex flex-col gap-3 border-b border-[var(--sk-line-strong)] pb-4 sm:flex-row sm:items-end sm:justify-between"
		>
			<div>
				<div id="dashboard-index-title" class="sk-mono text-[10px] text-[var(--sk-faint)]">
					{t('dashboard.plan.label')}
				</div>
				<p class="mt-1 text-sm font-semibold text-[var(--sk-ink)]">
					{t('dashboard.plan.name')}
					<span class="ml-1 font-normal text-[var(--sk-muted)]">
						· {t('dashboard.plan.priceSuffix', { price: data.proSitePriceEur })}
					</span>
				</p>
				{#if data.tryEstimate}
					<p class="mt-1 text-xs text-[var(--sk-muted)]">
						{tryLabels.approx} ₺{formatTry(data.tryEstimate.monthly)} / {locale === 'tr'
							? 'ay'
							: locale === 'de'
								? 'Monat'
								: 'mo'} ·
						{tryLabels.paidIn}
					</p>
					<p class="text-[10px] text-[var(--sk-faint)]">
						{tryLabels.rate} · {data.tryEstimate.asOf}
					</p>
				{/if}
				<p class="mt-1 max-w-2xl text-xs leading-5 text-[var(--sk-muted)]">
					{t('dashboard.plan.description')}
				</p>
			</div>
			<FlowbiteButton href="/account/topup" variant="ghost" size="sm">
				{t('dashboard.plan.buyCredits')}
			</FlowbiteButton>
		</div>

		{#if data.sites.length === 0}
			<div class="flex min-h-72 flex-col items-start justify-center gap-4 py-8">
				<p class="max-w-xl text-[var(--sk-muted)]">{t('dashboard.empty.message')}</p>
				<FlowbiteButton href="/new" variant="primary">
					<PlusOutline size="sm" />{t('dashboard.empty.cta')}
				</FlowbiteButton>
			</div>
		{:else}
			<ul class="dashboard-site-list divide-y divide-[var(--sk-line)]">
				{#each data.sites as site (site.id)}
					<li class="dashboard-site-row py-5">
						<div class="grid min-w-0 gap-4 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:items-center">
							<a
								href="/editor/{site.id}"
								class="block min-w-0 overflow-hidden rounded-[var(--sk-radius-sm)] border border-[var(--sk-line)]"
								aria-label={t('dashboard.card.editorAria', { name: site.siteName })}
							>
								<SitePreviewThumb siteId={site.id} title={site.siteName} />
							</a>

							<div class="min-w-0">
								<div class="flex min-w-0 flex-wrap items-center gap-2">
									<h2 class="truncate text-base font-semibold">{site.siteName}</h2>
									<StatusPill tone={site.publishedVersion ? 'success' : 'neutral'}>
										{site.publishedVersion
											? t('dashboard.card.statusPublished')
											: t('dashboard.card.statusDraft')}
									</StatusPill>
									<StatusPill
										tone={site.plan.state === 'active'
											? 'success'
											: site.plan.state === 'grace'
												? 'warning'
												: 'neutral'}
									>
										{site.plan.state === 'active'
											? t('dashboard.card.planActive')
											: site.plan.state === 'grace'
												? t('dashboard.card.planGrace')
												: t('dashboard.card.planFree')}
									</StatusPill>
								</div>
								<p class="mt-2 text-xs text-[var(--sk-muted)]">
									{t('dashboard.card.lastUpdated', { date: formatDate(site.updatedAt) })}
								</p>
								<div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
									<span class="font-[var(--font-mono)] text-[var(--sk-faint)]">
										{site.publicHandle ?? site.id}.saaskaya.com
									</span>
									<a
										href="/dashboard/{site.id}/messages"
										class="inline-flex min-h-8 items-center gap-1.5 font-medium text-[var(--sk-muted)] hover:text-[var(--sk-ink)]"
									>
										<MessagesOutline size="xs" />
										{t('dashboard.actionsRow.inbox')} · {site.messageCount}
									</a>
								</div>
							</div>

							<div class="flex flex-wrap items-center gap-2 md:justify-end">
								<FlowbiteButton href="/editor/{site.id}" variant="primary" size="sm">
									<EditOutline size="xs" />{t('dashboard.actionsRow.edit')}
								</FlowbiteButton>
								<FlowbiteButton href="/dashboard/{site.id}" variant="secondary" size="sm">
									{t('dashboard.actionsRow.manage')}<ArrowRightOutline size="xs" />
								</FlowbiteButton>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</PageShell>
