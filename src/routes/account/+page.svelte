<script lang="ts">
	import { page } from '$app/state';
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';
	import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';

	let { data } = $props();

	const t = getTranslate();
	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);
	const dateLocales: Record<Locale, string> = { en: 'en-US', tr: 'tr-TR', de: 'de-DE' };

	const spentUsd = $derived(data.aiUsage.usage.estimatedCostMicrousd / 1_000_000);
	const spendRatio = $derived(data.aiUsage.budgetUsd > 0 ? spentUsd / data.aiUsage.budgetUsd : 0);
	const spendTone = $derived(spendRatio >= 1 ? 'error' : spendRatio >= 0.8 ? 'warning' : 'success');
</script>

<svelte:head>
	<title>{t('account.profile.title')} · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/dashboard"
	backLabel="dashboard"
	title={t('account.profile.title')}
	description={data.user.email}
	max="max-w-5xl"
	canvasLabel="saaskaya.app / account"
>
	{#snippet actions()}
		<a href="/account/support" class="sk-btn sk-btn-secondary sk-btn-sm"
			>{t('account.supportLink')}</a
		>
		<form method="POST" action="/logout">
			<button type="submit" class="sk-btn sk-btn-ghost">{t('account.signOut')}</button>
		</form>
	{/snippet}

	<section class="grid gap-3 sm:grid-cols-3">
		<AppCard class="p-4">
			<div class="flex flex-col gap-1">
				<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{t('account.stats.sites')}</span>
				<strong class="sk-display text-4xl leading-none">{data.totals.sites}</strong>
			</div>
		</AppCard>
		<AppCard class="p-4">
			<div class="flex flex-col gap-1">
				<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]"
					>{t('account.stats.published')}</span
				>
				<strong class="sk-display text-4xl leading-none">{data.totals.published}</strong>
			</div>
		</AppCard>
		<AppCard class="p-4">
			<div class="flex flex-col gap-1">
				<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]"
					>{t('account.stats.messages')}</span
				>
				<strong class="sk-display text-4xl leading-none">{data.totals.messages}</strong>
			</div>
		</AppCard>
	</section>

	<AppCard>
		<div class="flex flex-col gap-4">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 class="font-semibold">{t('account.plan.title')}</h2>
					<p class="text-sm text-[var(--sk-muted)]">
						{t('account.plan.description')}
					</p>
				</div>
				{#if data.subscription.state === 'active'}
					<StatusPill tone="success">{t('account.plan.pro')}</StatusPill>
				{:else if data.subscription.state === 'grace'}
					<StatusPill tone="warning">{t('account.plan.proGrace')}</StatusPill>
				{:else}
					<StatusPill>{t('account.plan.free')}</StatusPill>
				{/if}
			</div>
			{#if data.subscription.state === 'grace'}
				<p class="text-sm text-[#7a341c]">
					{t('account.plan.graceUntil', {
						date: new Date(data.subscription.until).toLocaleDateString(dateLocales[locale])
					})}
				</p>
			{/if}
			<div class="flex flex-wrap gap-2">
				{#if data.subscription.state !== 'active' && data.billingConfigured}
					<form method="POST" action="/api/billing/checkout">
						<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm"
							>{t('account.plan.upgrade')}</button
						>
					</form>
				{/if}
				<a href="/dashboard" class="sk-btn sk-btn-secondary sk-btn-sm"
					>{t('account.plan.manageSites')}</a
				>
			</div>
		</div>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-4">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 class="font-semibold">{t('account.usage.title')}</h2>
					<p class="text-sm text-[var(--sk-muted)]">
						{t('account.usage.description')}
					</p>
				</div>
				<StatusPill tone={spendTone}>
					${spentUsd.toFixed(2)} / ${data.aiUsage.budgetUsd.toFixed(2)}
				</StatusPill>
			</div>
			<dl class="grid gap-3 text-sm sm:grid-cols-2">
				<div>
					<dt class="text-[var(--sk-faint)]">{t('account.usage.edits')}</dt>
					<dd class="font-medium">
						{data.aiUsage.usage.editCount} / {data.aiUsage.limits.edit}
					</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">{t('account.usage.generations')}</dt>
					<dd class="font-medium">
						{data.aiUsage.usage.generationCount} / {data.aiUsage.limits.generation}
					</dd>
				</div>
			</dl>
		</div>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-4">
			<div>
				<h2 class="font-semibold">{t('account.profile.title')}</h2>
				<p class="text-sm text-[var(--sk-muted)]">
					{t('account.profile.description')}
				</p>
			</div>
			<dl class="grid gap-3 text-sm sm:grid-cols-2">
				<div>
					<dt class="text-[var(--sk-faint)]">{t('account.profile.email')}</dt>
					<dd class="font-medium">{data.user.email}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">{t('account.profile.role')}</dt>
					<dd class="font-medium">
						{data.user.isAdmin ? t('account.profile.roleAdmin') : t('account.profile.roleCustomer')}
					</dd>
				</div>
			</dl>
		</div>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-4">
			<div>
				<h2 class="font-semibold">{t('account.exports.title')}</h2>
				<p class="text-sm text-[var(--sk-muted)]">
					{t('account.exports.description')}
				</p>
			</div>
			{#if data.sites.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">{t('account.exports.empty')}</p>
			{:else}
				<ul class="flex flex-col gap-2">
					{#each data.sites as site (site.id)}
						<li
							class="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--sk-line)] pt-3"
						>
							<div class="min-w-0">
								<p class="truncate text-sm font-medium">{site.siteName}</p>
								<p class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
									{site.id}
									{#if site.domain}
										· {site.domain}{/if}
								</p>
							</div>
							{#if site.canExport}
								<a
									href="/api/sites/{site.id}/export"
									class="sk-btn sk-btn-secondary sk-btn-sm"
									download
								>
									{t('account.exports.export')}
								</a>
							{:else}
								<span class="text-xs text-[var(--sk-faint)]"
									>{t('account.exports.proRequired')}</span
								>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-3">
			<h2 class="font-semibold">{t('account.deletion.title')}</h2>
			<p class="text-sm leading-6 text-[var(--sk-muted)]">
				{t('account.deletion.description')}
			</p>
			<a href="mailto:admin@saaskaya.com" class="sk-btn sk-btn-secondary sk-btn-sm w-fit">
				{t('account.deletion.request')}
			</a>
		</div>
	</AppCard>
</PageShell>
