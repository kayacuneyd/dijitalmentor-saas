<script lang="ts">
	import { page } from '$app/state';
	import {
		ArrowUpRightFromSquareOutline,
		CreditCardOutline,
		DownloadOutline,
		EditOutline,
		EnvelopeOutline,
		EyeOutline,
		GlobeOutline,
		TrashBinOutline
	} from 'flowbite-svelte-icons';
	import PageShell from '$lib/ui/PageShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import SitePreviewThumb from '$lib/ui/SitePreviewThumb.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data, form } = $props();
	const t = getTranslate();
	let section = $state<'overview' | 'identity' | 'domain'>('overview');
	const sections = [
		{ id: 'overview', label: t('dashboard.control.overview') },
		{ id: 'identity', label: t('dashboard.control.identity') },
		{ id: 'domain', label: t('dashboard.control.domain') }
	] as const;
</script>

<svelte:head>
	<title>{data.site.siteName} · {t('dashboard.title')}</title>
</svelte:head>

<PageShell
	title={data.site.siteName}
	description={data.site.publicHandle ?? data.site.id}
	backHref="/dashboard"
	backLabel={t('dashboard.title')}
	canvasLabel="saaskaya.app / control center"
>
	{#snippet actions()}
		<FlowbiteButton href="/editor/{data.site.id}" variant="primary">
			<EditOutline size="sm" />{t('dashboard.actionsRow.edit')}
		</FlowbiteButton>
		<FlowbiteButton href={data.site.previewUrl} target="_blank" variant="secondary">
			<EyeOutline size="sm" />{t('dashboard.actionsRow.preview')}
		</FlowbiteButton>
	{/snippet}

	{#if form?.message || form?.identityMessage || form?.domainMessage}
		<div class="sk-alert">
			{form.message ?? form.identityMessage ?? form.domainMessage}
		</div>
	{/if}

	<nav class="mb-6 flex gap-1 border-b border-[var(--sk-line)]" aria-label="Site controls">
		{#each sections as item}
			<button
				type="button"
				class:active={section === item.id}
				class="control-tab"
				onclick={() => (section = item.id)}
			>
				{item.label}
			</button>
		{/each}
	</nav>

	{#if section === 'overview'}
		<div class="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
			<AppCard>
				<h2 class="mb-4 font-semibold">{t('dashboard.control.preview')}</h2>
				<div class="overflow-hidden rounded-[var(--sk-radius-sm)] border border-[var(--sk-line)]">
					<SitePreviewThumb siteId={data.site.id} title={data.site.siteName} />
				</div>
				<div class="mt-4 flex flex-wrap gap-2">
					{#if data.site.publishedVersion}
						<FlowbiteButton href={data.site.liveUrl} target="_blank" variant="secondary" size="sm">
							<ArrowUpRightFromSquareOutline size="xs" />{t('dashboard.actionsRow.live')}
						</FlowbiteButton>
					{/if}
					<FlowbiteButton href="/dashboard/{data.site.id}/messages" variant="ghost" size="sm">
						<EnvelopeOutline size="xs" />{t('dashboard.actionsRow.inbox')} · {data.site
							.messageCount}
					</FlowbiteButton>
				</div>
			</AppCard>

			<div class="grid content-start gap-4">
				<AppCard>
					<h2 class="mb-4 font-semibold">{t('dashboard.control.status')}</h2>
					<div class="flex flex-wrap gap-2">
						<StatusPill tone={data.site.publishedVersion ? 'success' : 'neutral'}>
							{data.site.publishedVersion
								? t('dashboard.card.statusPublished')
								: t('dashboard.card.statusDraft')}
						</StatusPill>
						<StatusPill tone={data.site.plan.state === 'active' ? 'success' : 'neutral'}>
							{data.site.plan.state === 'active'
								? t('dashboard.card.planActive')
								: t('dashboard.card.planFree')}
						</StatusPill>
					</div>
					<p class="mt-3 text-sm leading-6 text-[var(--sk-muted)]">
						{t('dashboard.plan.description')}
					</p>
					{#if data.site.plan.state === 'free'}
						{#if data.billingConfigured}
							<div class="mt-4 flex flex-wrap gap-2">
								<form method="POST" action="/api/billing/checkout">
									<input type="hidden" name="siteId" value={data.site.id} />
									<input type="hidden" name="planInterval" value="monthly" />
									<FlowbiteButton type="submit" variant="secondary" size="sm">
										{t('dashboard.billing.monthlyButton')}
									</FlowbiteButton>
								</form>
								<form method="POST" action="/api/billing/checkout">
									<input type="hidden" name="siteId" value={data.site.id} />
									<input type="hidden" name="planInterval" value="yearly" />
									<FlowbiteButton type="submit" variant="primary" size="sm">
										{t('dashboard.billing.yearlyButton')}
									</FlowbiteButton>
								</form>
							</div>
						{:else}
							<p class="mt-3 text-xs text-[var(--sk-faint)]">
								{t('dashboard.billing.comingSoon')}
							</p>
						{/if}
					{/if}
				</AppCard>

				<AppCard>
					<h2 class="mb-4 font-semibold">{t('dashboard.control.quickActions')}</h2>
					<div class="grid gap-2">
						<FlowbiteButton href="/editor/{data.site.id}" variant="secondary">
							<EditOutline size="sm" />{t('dashboard.actionsRow.edit')}
						</FlowbiteButton>
						{#if data.site.publishedVersion}
							<form method="POST" action="?/unpublish">
								<input type="hidden" name="siteId" value={data.site.id} />
								<FlowbiteButton type="submit" variant="ghost">
									{t('dashboard.actionsRow.unpublish')}
								</FlowbiteButton>
							</form>
							<form method="POST" action="?/publish">
								<input type="hidden" name="siteId" value={data.site.id} />
								<FlowbiteButton type="submit" variant="ghost">
									{t('dashboard.overflow.publishNowLabel')}
								</FlowbiteButton>
							</form>
						{/if}
						{#if data.site.canExport}
							<FlowbiteButton href="/api/sites/{data.site.id}/export" download variant="ghost">
								<DownloadOutline size="sm" />{t('dashboard.overflow.fullExport')}
							</FlowbiteButton>
						{/if}
						<button
							class="sk-button sk-button-ghost justify-start"
							onclick={() => (section = 'identity')}
						>
							<CreditCardOutline size="sm" />{t('dashboard.control.identity')}
						</button>
						<button
							class="sk-button sk-button-ghost justify-start"
							onclick={() => (section = 'domain')}
						>
							<GlobeOutline size="sm" />{t('dashboard.control.domain')}
						</button>
					</div>
				</AppCard>
			</div>
		</div>
	{:else if section === 'identity'}
		<AppCard class="max-w-2xl">
			<h2 class="mb-5 font-semibold">{t('dashboard.identity.title')}</h2>
			<form method="POST" action="?/updateIdentity" class="grid gap-5">
				<input type="hidden" name="siteId" value={data.site.id} />
				<label class="sk-field">
					<span>{t('dashboard.identity.siteName')}</span>
					<input class="sk-input" name="siteName" value={data.site.siteName} required />
				</label>
				<label class="sk-field">
					<span>{t('dashboard.identity.publicHandle')}</span>
					<input
						class="sk-input"
						name="publicHandle"
						value={data.site.publicHandle ?? ''}
						required
					/>
				</label>
				<label class="sk-field">
					<span>{t('dashboard.identity.contactEmail')}</span>
					<input
						class="sk-input"
						name="contactEmail"
						type="email"
						value={data.site.contactEmail ?? data.user?.email ?? ''}
						required
					/>
				</label>
				<div>
					<FlowbiteButton type="submit" variant="primary"
						>{t('dashboard.identity.save')}</FlowbiteButton
					>
				</div>
			</form>
		</AppCard>
	{:else}
		<div class="grid min-w-0 gap-6 xl:grid-cols-2">
			<AppCard>
				<h2 class="mb-4 font-semibold">{t('dashboard.domain.title')}</h2>
				{#if data.site.domain}
					<p class="text-lg font-semibold">{data.site.domain.domain}</p>
					<p class="mt-2 text-sm text-[var(--sk-muted)]">{t('dashboard.domain.connected')}</p>
					<form method="POST" action="?/detachDomain" class="mt-5">
						<input type="hidden" name="siteId" value={data.site.id} />
						<FlowbiteButton type="submit" variant="secondary"
							>{t('dashboard.domain.detach')}</FlowbiteButton
						>
					</form>
				{:else}
					<p class="text-sm leading-6 text-[var(--sk-muted)]">
						{t('dashboard.domain.description')}
					</p>
					<form method="POST" action="?/attachDomain" class="mt-5 grid gap-4">
						<input type="hidden" name="siteId" value={data.site.id} />
						<label class="sk-field">
							<span>{t('dashboard.domain.domainLabel')}</span>
							<input class="sk-input" name="domain" placeholder="www.example.com" required />
						</label>
						<div>
							<FlowbiteButton type="submit" variant="primary">
								<GlobeOutline size="sm" />{t('dashboard.domain.connect')}
							</FlowbiteButton>
						</div>
					</form>
				{/if}
			</AppCard>

			<AppCard>
				<h2 class="mb-4 font-semibold">{t('dashboard.control.dangerZone')}</h2>
				<p class="text-sm leading-6 text-[var(--sk-muted)]">{t('dashboard.delete.description')}</p>
				<form method="POST" action="?/deleteSite" class="mt-5 grid gap-3">
					<input type="hidden" name="siteId" value={data.site.id} />
					<label class="sk-field">
						<span>{t('dashboard.delete.typeName', { name: data.site.siteName })}</span>
						<input class="sk-input" name="confirmName" autocomplete="off" required />
					</label>
					<div>
						<FlowbiteButton type="submit" variant="danger">
							<TrashBinOutline size="sm" />{t('dashboard.delete.confirm')}
						</FlowbiteButton>
					</div>
				</form>
			</AppCard>
		</div>
	{/if}
</PageShell>

<style>
	.control-tab {
		min-height: 44px;
		padding: 0 0.9rem;
		border-bottom: 2px solid transparent;
		color: var(--sk-muted);
		font-size: 0.82rem;
		font-weight: 650;
	}
	.control-tab:hover,
	.control-tab.active {
		border-bottom-color: var(--sk-ink);
		color: var(--sk-ink);
	}
</style>
