<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import ShareStoryButton from '$lib/share/ShareStoryButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import SitePreviewThumb from '$lib/ui/SitePreviewThumb.svelte';
	import { uiIcons } from '$lib/ui/icons';
	import { getTranslate } from '$lib/i18n/context';
	import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';

	let { data, form } = $props();

	const t = getTranslate();
	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);

	// Alerts reference sites by id internally; the UI always shows the name.
	const siteName = (id: unknown) =>
		data.sites.find((s) => s.id === id)?.siteName ?? t('dashboard.card.fallbackName');

	const dateLocales: Record<Locale, string> = { en: 'en-US', tr: 'tr-TR', de: 'de-DE' };
	const formatDate = (d: string | Date) =>
		new Date(d).toLocaleDateString(dateLocales[locale], {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});

	// Only one site's delete-confirm panel is open at a time.
	let deleteConfirmSiteId = $state<string | null>(null);
	let deleteConfirmText = $state('');

	function openDeleteConfirm(siteId: string) {
		deleteConfirmSiteId = siteId;
		deleteConfirmText = '';
	}
	function closeDeleteConfirm() {
		deleteConfirmSiteId = null;
		deleteConfirmText = '';
	}
</script>

<svelte:head>
	<title>{t('dashboard.title')} · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/"
	title={t('dashboard.title')}
	description={data.user.email}
	max="max-w-7xl"
	canvasMax="max-w-[92rem]"
	canvasLabel="saaskaya.app / panel"
>
	{#snippet actions()}
		<div class="flex flex-wrap gap-2">
			<a href="/new" class="sk-btn sk-btn-primary"
				>{@html uiIcons.plus(16)}{t('dashboard.nav.newSite')}</a
			>
			<a href="/account" class="sk-btn sk-btn-secondary">{t('dashboard.nav.account')}</a>
			{#if data.user.isAdmin}
				<a href="/admin" class="sk-btn sk-btn-secondary">{t('dashboard.nav.admin')}</a>
			{/if}
			<form method="POST" action="/logout">
				<button type="submit" class="sk-btn sk-btn-ghost">{t('dashboard.nav.signOut')}</button>
			</form>
		</div>
	{/snippet}

	<AppCard class="p-4 sm:p-5">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{t('dashboard.plan.label')}</div>
				<div class="mt-2 flex flex-wrap items-center gap-2">
					<span class="font-semibold">{t('dashboard.plan.name')}</span>
					<StatusPill>{t('dashboard.plan.priceSuffix', { price: data.proSitePriceEur })}</StatusPill
					>
				</div>
				<p class="mt-1 text-xs text-[var(--sk-muted)]">
					{t('dashboard.plan.description')}
				</p>
			</div>
			<span class="text-xs text-[var(--sk-faint)]">{t('dashboard.plan.billingNote')}</span>
		</div>
	</AppCard>

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
	{:else if form?.domainAttached}
		<div class="sk-alert sk-alert-success">
			<span
				><strong>{form.domainAttached}</strong>
				{t('dashboard.alerts.domainConnectedSuffix')}
				{form.provision}</span
			>
		</div>
	{:else if form?.domainDetached}
		<div class="sk-alert">{t('dashboard.alerts.domainDetached')}</div>
	{:else if form?.reserved}
		<div class="sk-alert sk-alert-success">
			<strong>{form.reserved}</strong>
			{t('dashboard.alerts.domainCheckedSuffix')}
			{form.domainMessage}
		</div>
	{:else if form?.identitySaved}
		<div class="sk-alert sk-alert-success">{form.identityMessage}</div>
	{:else if form?.transferReported}
		<div class="sk-alert sk-alert-success">
			{t('dashboard.alerts.transferReported')}
		</div>
	{:else if form?.reservationCancelled}
		<div class="sk-alert">{t('dashboard.alerts.reservationCancelled')}</div>
	{:else if form?.deleted}
		<div class="sk-alert">{t('dashboard.alerts.deleted', { name: form.deleted })}</div>
	{/if}

	{#if data.sites.length === 0}
		<AppCard>
			<div class="flex flex-col items-center gap-3 text-center">
				<p class="text-[var(--sk-muted)]">
					{t('dashboard.empty.message')}
				</p>
				<a href="/new" class="sk-btn sk-btn-primary">{t('dashboard.empty.cta')}</a>
			</div>
		</AppCard>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each data.sites as site (site.id)}
				<li class="sk-shell p-5">
					<div class="flex flex-col gap-4 sm:flex-row sm:gap-5">
						<a
							href="/editor/{site.id}"
							class="block shrink-0 sm:w-56"
							aria-label={t('dashboard.card.editorAria', { name: site.siteName })}
						>
							<SitePreviewThumb siteId={site.id} title={site.siteName} />
						</a>
						<div class="flex min-w-0 flex-1 flex-col gap-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div class="min-w-0">
									<div class="flex min-w-0 flex-wrap items-center gap-2">
										<span class="size-2.5 rounded-sm bg-[#171614]/80"></span>
										<h2 class="truncate font-semibold">{site.siteName}</h2>
									</div>
									<p class="mt-1 text-xs text-[var(--sk-muted)]">
										{t('dashboard.card.lastUpdated', { date: formatDate(site.updatedAt) })}
									</p>
								</div>
								{#if site.publishedVersion}
									<div class="flex flex-wrap gap-2">
										<StatusPill tone="success">{t('dashboard.card.statusPublished')}</StatusPill>
										{#if site.plan.state === 'active'}
											<StatusPill tone="success">{t('dashboard.card.planActive')}</StatusPill>
										{:else if site.plan.state === 'grace'}
											<StatusPill tone="warning">{t('dashboard.card.planGrace')}</StatusPill>
										{:else}
											<StatusPill>{t('dashboard.card.planFree')}</StatusPill>
										{/if}
									</div>
								{:else}
									<div class="flex flex-wrap gap-2">
										<StatusPill>{t('dashboard.card.statusDraft')}</StatusPill>
										{#if site.plan.state === 'active'}
											<StatusPill tone="success">{t('dashboard.card.planActive')}</StatusPill>
										{:else}
											<StatusPill>{t('dashboard.card.planFree')}</StatusPill>
										{/if}
									</div>
								{/if}
							</div>

							<div class="rounded-[10px] border border-[var(--sk-line)] bg-[#171614]/[0.025] p-3">
								<form
									method="POST"
									action="?/updateIdentity"
									use:enhance
									class="grid gap-3 lg:grid-cols-[1.2fr_1fr_1.2fr_auto]"
								>
									<input type="hidden" name="siteId" value={site.id} />
									<label class="flex flex-col gap-1 text-xs text-[var(--sk-muted)]">
										{t('dashboard.identity.siteName')}
										<input
											name="siteName"
											value={site.siteName}
											class="sk-input min-h-9 py-1.5 text-sm"
										/>
									</label>
									<label class="flex flex-col gap-1 text-xs text-[var(--sk-muted)]">
										{t('dashboard.identity.subdomain')}
										<input
											name="publicHandle"
											value={site.publicHandle ?? site.id}
											class="sk-input min-h-9 py-1.5 font-[var(--font-mono)] text-sm"
										/>
									</label>
									<label class="flex flex-col gap-1 text-xs text-[var(--sk-muted)]">
										{t('dashboard.identity.contactEmail')}
										<input
											name="contactEmail"
											value={site.contactEmail ?? ''}
											class="sk-input min-h-9 py-1.5 text-sm"
										/>
									</label>
									<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm self-end">
										{t('dashboard.identity.save')}
									</button>
								</form>
								<div
									class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-[var(--sk-faint)]"
								>
									<span
										>{t('dashboard.meta.publicUrl', { handle: site.publicHandle ?? site.id })}</span
									>
									<span
										>{t('dashboard.meta.languages', {
											list: site.locales.join(' · ').toUpperCase()
										})}</span
									>
									<span
										>{t('dashboard.meta.defaultLocale', {
											locale: site.defaultLocale.toUpperCase()
										})}</span
									>
								</div>
								{#if form?.identityMessage && form?.siteId === site.id}
									<p class="mt-2 text-xs text-[#b8532f]">{form.identityMessage}</p>
								{/if}
							</div>

							<div
								class="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--sk-line)] p-3 text-sm"
							>
								<div>
									<p class="font-semibold">
										{#if site.plan.state === 'active'}
											{t('dashboard.billing.proActiveLine')}
										{:else if site.plan.state === 'grace'}
											{t('dashboard.billing.proGraceLine')}
										{:else}
											{t('dashboard.billing.proFreeLine')}
										{/if}
									</p>
									<p class="mt-1 text-xs text-[var(--sk-muted)]">
										{t('dashboard.billing.priceLine', {
											monthly: data.proSitePriceEur,
											yearly: data.proSiteYearlyPriceEur
										})}
									</p>
								</div>
								{#if site.plan.state === 'free'}
									{#if data.billingConfigured}
										<div class="flex flex-wrap gap-2">
											<form method="POST" action="/api/billing/checkout">
												<input type="hidden" name="siteId" value={site.id} />
												<input type="hidden" name="planInterval" value="monthly" />
												<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
													{t('dashboard.billing.monthlyButton')}
												</button>
											</form>
											<form method="POST" action="/api/billing/checkout">
												<input type="hidden" name="siteId" value={site.id} />
												<input type="hidden" name="planInterval" value="yearly" />
												<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
													{t('dashboard.billing.yearlyButton')}
												</button>
											</form>
										</div>
									{:else}
										<span class="text-xs text-[var(--sk-faint)]">
											{t('dashboard.billing.comingSoon')}
										</span>
									{/if}
								{/if}
							</div>

							<div class="flex flex-wrap items-center gap-2">
								<a href="/editor/{site.id}" class="sk-btn sk-btn-primary sk-btn-sm"
									>{t('dashboard.actionsRow.edit')}</a
								>
								<a href={site.previewUrl} target="_blank" class="sk-btn sk-btn-secondary sk-btn-sm">
									{t('dashboard.actionsRow.preview')}
								</a>
								{#if site.publishedVersion}
									<a
										href="{site.liveUrl}?v={site.publishedVersion}"
										target="_blank"
										class="sk-btn sk-btn-secondary sk-btn-sm"
									>
										{t('dashboard.actionsRow.openLive')}
										{@html uiIcons.external(13)}
									</a>
									<form method="POST" action="?/unpublish" use:enhance>
										<input type="hidden" name="siteId" value={site.id} />
										<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm">
											{t('dashboard.actionsRow.unpublish')}
										</button>
									</form>
								{:else}
									<a href="/editor/{site.id}" class="sk-btn sk-btn-secondary sk-btn-sm"
										>{t('dashboard.actionsRow.prepareForLaunch')}</a
									>
								{/if}
								<details class="relative">
									<summary
										class="sk-btn sk-btn-ghost sk-btn-sm cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden"
										aria-label={t('dashboard.actionsRow.moreActionsAria')}
									>
										⋯
									</summary>
									<div
										class="absolute right-0 z-10 mt-1 flex w-52 flex-col gap-1 rounded-[10px] border border-[var(--sk-line-strong)] bg-[var(--sk-card)] p-2 shadow-lg"
									>
										<a
											href="/dashboard/{site.id}/messages"
											class="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-[#171614]/5"
										>
											{t('dashboard.actionsRow.inbox')}
											{#if site.messageCount > 0}
												<span
													class="rounded-full bg-[#b8532f] px-1.5 py-0.5 text-[10px] text-white"
												>
													{site.messageCount}
												</span>
											{/if}
										</a>
										{#if site.publishedVersion}
											<div class="px-2 py-1.5">
												<ShareStoryButton
													siteName={site.siteName}
													liveUrl={site.liveUrl}
													locale={site.defaultLocale as 'tr' | 'en' | 'de'}
													class="w-full rounded px-0 py-0 text-left text-sm hover:underline"
												/>
											</div>
											<form method="POST" action="?/publish" use:enhance>
												<input type="hidden" name="siteId" value={site.id} />
												<button
													type="submit"
													class="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[#171614]/5"
													title={t('dashboard.overflow.publishNowTitle')}
												>
													{t('dashboard.overflow.publishNowLabel')}
												</button>
											</form>
										{/if}
										{#if site.canExport}
											<a
												href="/api/sites/{site.id}/export"
												download
												class="rounded px-2 py-1.5 text-sm hover:bg-[#171614]/5"
											>
												{t('dashboard.overflow.fullExport')}
											</a>
										{:else}
											<span class="rounded px-2 py-1.5 text-sm text-[var(--sk-faint)]">
												{t('dashboard.overflow.fullExportProOnly')}
											</span>
										{/if}
										<button
											type="button"
											onclick={() => openDeleteConfirm(site.id)}
											class="w-full rounded px-2 py-1.5 text-left text-sm text-[#b8532f] hover:bg-[#b8532f]/10"
										>
											{t('dashboard.overflow.deleteSite')}
										</button>
									</div>
								</details>
							</div>

							{#if deleteConfirmSiteId === site.id}
								<div
									class="flex flex-col gap-3 rounded-[10px] border border-[#b8532f]/40 bg-[#b8532f]/5 p-4"
								>
									<div>
										<p class="text-sm font-semibold text-[#b8532f]">
											{t('dashboard.deleteConfirm.title')}
										</p>
										<p class="mt-1 text-xs text-[var(--sk-muted)]">
											{t('dashboard.deleteConfirm.body', { name: site.siteName })}
										</p>
									</div>
									{#if form?.deleteMessage && form?.siteId === site.id}
										<p class="text-xs text-[#b8532f]">{form.deleteMessage}</p>
									{/if}
									<form
										method="POST"
										action="?/deleteSite"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												closeDeleteConfirm();
											};
										}}
										class="flex flex-wrap items-center gap-2"
									>
										<input type="hidden" name="siteId" value={site.id} />
										<input
											type="text"
											name="confirmName"
											bind:value={deleteConfirmText}
											placeholder={site.siteName}
											class="sk-input min-h-8 w-52 py-1.5 text-sm"
											autocomplete="off"
										/>
										<button
											type="submit"
											disabled={deleteConfirmText !== site.siteName}
											class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm"
										>
											{t('dashboard.deleteConfirm.confirmButton')}
										</button>
										<button
											type="button"
											onclick={closeDeleteConfirm}
											class="sk-btn sk-btn-ghost sk-btn-sm"
										>
											{t('dashboard.deleteConfirm.cancel')}
										</button>
									</form>
								</div>
							{/if}

							<div class="flex flex-col gap-2 border-t border-[var(--sk-line)] pt-4">
								{#if site.domain}
									<div class="flex flex-wrap items-center gap-2 text-sm">
										<span class="text-[var(--sk-muted)]">{t('dashboard.domain.label')}</span>
										<a
											href="https://{site.domain}"
											target="_blank"
											class="sk-link font-[var(--font-mono)]"
										>
											{site.domain}
										</a>
										<StatusPill tone="success"
											>{site.domainSetupLabel ?? t('dashboard.domain.active')}</StatusPill
										>
										<form method="POST" action="?/detachDomain" use:enhance>
											<input type="hidden" name="siteId" value={site.id} />
											<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
												{t('dashboard.domain.remove')}
											</button>
										</form>
									</div>
									{#if site.reservation?.emailLocalPart && site.reservation?.emailDestination}
										<p class="text-xs text-[var(--sk-muted)]">
											{t('dashboard.domain.forwardTo', {
												local: site.reservation.emailLocalPart,
												domain: site.domain,
												dest: site.reservation.emailDestination
											})}
											{site.reservation.emailRoutingStatus === 'pending_verification'
												? t('dashboard.domain.forwardPendingVerification')
												: ''}
										</p>
									{/if}
								{:else if site.reservation}
									{@const res = site.reservation}
									<div class="flex flex-col gap-2 text-sm">
										<div class="flex flex-wrap items-center gap-2">
											<span class="text-[var(--sk-muted)]">{t('dashboard.reservation.label')}</span>
											<span class="font-[var(--font-mono)]">{res.domain}</span>
											<StatusPill
												tone={res.status === 'failed'
													? 'error'
													: res.status === 'paid' || res.status === 'registering'
														? 'warning'
														: 'neutral'}
											>
												{res.status === 'pending'
													? t('dashboard.reservation.statusPending')
													: res.status === 'manual_review'
														? t('dashboard.reservation.statusManualReview')
														: res.status === 'paid'
															? t('dashboard.reservation.statusPaid')
															: res.status === 'registering'
																? t('dashboard.reservation.statusRegistering')
																: res.status === 'failed'
																	? t('dashboard.reservation.statusFailed')
																	: res.status}
											</StatusPill>
										</div>

										{#if res.status === 'pending' && site.plan.state === 'free' && !data.user.isAdmin}
											<div class="rounded-md bg-[#171614]/5 p-3 text-xs">
												<p class="font-semibold">{t('dashboard.reservation.eligibleTitle')}</p>
												<p class="mt-1 text-[var(--sk-muted)]">
													{t('dashboard.reservation.eligibleBody')}
												</p>
											</div>
											{#if data.billingConfigured}
												<div class="flex flex-wrap gap-2">
													<form method="POST" action="/api/billing/checkout">
														<input type="hidden" name="siteId" value={site.id} />
														<input type="hidden" name="planInterval" value="monthly" />
														<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
															{t('dashboard.billing.monthlyButton')}
														</button>
													</form>
													<form method="POST" action="/api/billing/checkout">
														<input type="hidden" name="siteId" value={site.id} />
														<input type="hidden" name="planInterval" value="yearly" />
														<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
															{t('dashboard.billing.yearlyButton')}
														</button>
													</form>
												</div>
											{/if}
										{:else if res.status === 'pending' && res.paymentMethod === 'bank_transfer'}
											<div class="rounded-md bg-[#171614]/5 p-3 text-xs">
												<p class="text-[var(--sk-muted)]">{t('dashboard.reservation.bankLabel')}</p>
												{#if data.payment.iban}
													<p class="mt-1 font-[var(--font-mono)]">{data.payment.iban}</p>
													{#if data.payment.accountHolder}
														<p class="text-[var(--sk-faint)]">{data.payment.accountHolder}</p>
													{/if}
												{:else}
													<p class="text-[var(--sk-faint)]">
														{t('dashboard.reservation.ibanPending')}
													</p>
												{/if}
												<p class="mt-1">
													{t('dashboard.reservation.descriptionLabel')}
													<span class="font-[var(--font-mono)]">{res.domain}</span>
												</p>
											</div>
											<div class="flex flex-wrap gap-2">
												<form method="POST" action="?/reportTransfer" use:enhance>
													<input type="hidden" name="reservationId" value={res.id} />
													<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
														{t('dashboard.reservation.reportTransfer')}
													</button>
												</form>
												<form method="POST" action="?/cancelReservation" use:enhance>
													<input type="hidden" name="reservationId" value={res.id} />
													<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
														{t('dashboard.reservation.cancel')}
													</button>
												</form>
											</div>
										{:else if res.status === 'pending' && ['stripe', 'creem'].includes(res.paymentMethod)}
											<div class="flex flex-wrap gap-2">
												<form method="POST" action="?/payDomainStripe">
													<input type="hidden" name="reservationId" value={res.id} />
													<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
														{t('dashboard.reservation.cardContinue')}
													</button>
												</form>
												<form method="POST" action="?/cancelReservation" use:enhance>
													<input type="hidden" name="reservationId" value={res.id} />
													<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
														{t('dashboard.reservation.cancel')}
													</button>
												</form>
											</div>
										{:else if res.status === 'failed'}
											<p class="text-xs text-[var(--sk-muted)]">
												{t('dashboard.reservation.failedNote')}
											</p>
										{:else if res.status === 'manual_review'}
											<p class="text-xs text-[var(--sk-muted)]">
												{t('dashboard.reservation.manualReviewNote')}
											</p>
										{:else}
											<div class="rounded-md bg-[#171614]/5 p-3 text-xs text-[var(--sk-muted)]">
												<p>{t('dashboard.reservation.preparingDomain')}</p>
												<p>{t('dashboard.reservation.preparingSsl')}</p>
												{#if res.emailLocalPart && res.emailDestination}
													<p>
														{t('dashboard.domain.forwardTo', {
															local: res.emailLocalPart,
															domain: res.domain,
															dest: res.emailDestination
														})}
														{res.emailRoutingStatus === 'pending_verification'
															? t('dashboard.reservation.emailForwardPendingVerification')
															: ''}
													</p>
												{:else}
													<p>{t('dashboard.reservation.emailPreparing')}</p>
												{/if}
											</div>
										{/if}
									</div>
								{:else}
									<form
										method="POST"
										action="?/attachDomain"
										use:enhance
										class="flex flex-wrap items-center gap-2"
									>
										<input type="hidden" name="siteId" value={site.id} />
										<input
											type="text"
											name="domain"
											placeholder={t('dashboard.attach.placeholder')}
											class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
										/>
										<button
											type="submit"
											class="sk-btn sk-btn-secondary sk-btn-sm"
											disabled={site.plan.state === 'free' && !data.user.isAdmin}
										>
											{t('dashboard.attach.button')}
										</button>
									</form>
									<p class="text-[10.5px] text-[var(--sk-faint)]">
										{t('dashboard.attach.note')}
									</p>
									{#if data.payment.mode === 'disabled' && !site.hasDomainCredit}
										<p class="text-xs text-[var(--sk-muted)]">
											{t('dashboard.attach.purchaseClosed')}
										</p>
									{:else if site.hasDomainCredit}
										<div class="rounded-md bg-[#eef7ee] p-3 text-xs text-[#285c2a]">
											<p class="font-semibold">{t('dashboard.attach.creditReadyTitle')}</p>
											<p class="mt-1">
												{t('dashboard.attach.creditReadyBody')}
											</p>
										</div>
										<form
											method="POST"
											action="?/reserveDomain"
											use:enhance
											class="flex flex-wrap items-center gap-2"
										>
											<input type="hidden" name="siteId" value={site.id} />
											<input
												type="text"
												name="domain"
												placeholder={t('dashboard.attach.domainPlaceholder')}
												class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
											/>
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
												{t('dashboard.attach.includedButton')}
											</button>
										</form>
									{:else if site.planDetails.planInterval === 'monthly' && site.plan.state !== 'free' && (data.payment.mode === 'stripe_only' || data.payment.mode === 'card_only' || data.payment.mode === 'hybrid')}
										<div class="rounded-md bg-[#171614]/5 p-3 text-xs">
											<p class="font-semibold">{t('dashboard.attach.nextStepTitle')}</p>
											<p class="mt-1 text-[var(--sk-muted)]">
												{t('dashboard.attach.nextStepBody')}
											</p>
										</div>
										<form
											method="POST"
											action="?/reserveDomain"
											use:enhance
											class="flex flex-wrap items-center gap-2"
										>
											<input type="hidden" name="siteId" value={site.id} />
											<input type="hidden" name="paymentMethod" value="stripe" />
											<input
												type="text"
												name="domain"
												placeholder={t('dashboard.attach.domainPlaceholder')}
												class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
											/>
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
												{t('dashboard.attach.yearlyButton')}
											</button>
										</form>
									{:else if data.payment.mode === 'stripe_only' || data.payment.mode === 'card_only'}
										<form
											method="POST"
											action="?/reserveDomain"
											use:enhance
											class="flex flex-wrap items-center gap-2"
										>
											<input type="hidden" name="siteId" value={site.id} />
											<input type="hidden" name="paymentMethod" value="stripe" />
											<input
												type="text"
												name="domain"
												placeholder={t('dashboard.attach.domainPlaceholder')}
												class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
											/>
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
												{t('dashboard.attach.checkAvailability')}
											</button>
										</form>
									{:else}
										<form
											method="POST"
											action="?/reserveDomain"
											use:enhance
											class="flex flex-wrap items-center gap-2"
										>
											<input type="hidden" name="siteId" value={site.id} />
											<input
												type="text"
												name="domain"
												placeholder={t('dashboard.attach.domainPlaceholder')}
												class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
											/>
											{#if data.payment.mode === 'hybrid'}
												<select name="paymentMethod" class="sk-input min-h-8 py-1.5 text-xs">
													<option value="bank_transfer">{t('dashboard.attach.bankOption')}</option>
													<option value="stripe">{t('dashboard.attach.cardOption')}</option>
												</select>
											{:else}
												<input type="hidden" name="paymentMethod" value="bank_transfer" />
											{/if}
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
												{t('dashboard.attach.checkAvailability')}
											</button>
										</form>
									{/if}
									{#if form?.domainMessage && form?.siteId === site.id}
										<p class="text-xs text-[#b8532f]">{form.domainMessage}</p>
									{/if}
								{/if}
							</div>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</PageShell>
