<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import SitePreviewThumb from '$lib/ui/SitePreviewThumb.svelte';
	import { uiIcons } from '$lib/ui/icons';

	let { data, form } = $props();

	// Alerts reference sites by id internally; the UI always shows the name.
	const siteName = (id: unknown) => data.sites.find((s) => s.id === id)?.siteName ?? 'Siten';

	const dateTr = (d: string | Date) =>
		new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

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
	<title>Sitelerin · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/"
	title="Sitelerin"
	description={data.user.email}
	max="max-w-7xl"
	canvasMax="max-w-[92rem]"
	canvasLabel="saaskaya.app / panel"
>
	{#snippet actions()}
		<div class="flex flex-wrap gap-2">
			<a href="/new" class="sk-btn sk-btn-primary">{@html uiIcons.plus(16)}Yeni site</a>
			<a href="/account" class="sk-btn sk-btn-secondary">Hesap</a>
			{#if data.user.isAdmin}
				<a href="/admin" class="sk-btn sk-btn-secondary">Admin</a>
			{/if}
			<form method="POST" action="/logout">
				<button type="submit" class="sk-btn sk-btn-ghost">Çıkış yap</button>
			</form>
		</div>
	{/snippet}

	<AppCard class="p-4 sm:p-5">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Plan</div>
				<div class="mt-2 flex flex-wrap items-center gap-2">
					<span class="font-semibold">Pro site bazlıdır</span>
					<StatusPill>{data.proSitePriceEur}€/ay / yayınlanan site</StatusPill>
				</div>
				<p class="mt-1 text-xs text-[var(--sk-muted)]">
					Her web sitesi kendi Pro durumuna sahiptir. Kendi domaini ve tam export sadece ilgili Pro
					site için açılır.
				</p>
			</div>
			<span class="text-xs text-[var(--sk-faint)]">Ödeme ilgili site kartından başlatılır.</span>
		</div>
	</AppCard>

	{#if form?.published}
		<div class="sk-alert sk-alert-success">
			<strong>{siteName(form.published)}</strong> yayında — tebrikler!
		</div>
	{:else if form?.unpublished}
		<div class="sk-alert"><strong>{siteName(form.unpublished)}</strong> yayından kaldırıldı.</div>
	{:else if form?.message}
		<div class="sk-alert"><strong>{siteName(form.siteId)}</strong>: {form.message}</div>
	{:else if form?.domainAttached}
		<div class="sk-alert sk-alert-success">
			<span><strong>{form.domainAttached}</strong> bağlandı. {form.provision}</span>
		</div>
	{:else if form?.domainDetached}
		<div class="sk-alert">Domain siteden kaldırıldı.</div>
	{:else if form?.reserved}
		<div class="sk-alert sk-alert-success">
			<strong>{form.reserved}</strong> kontrol edildi. {form.domainMessage}
		</div>
	{:else if form?.identitySaved}
		<div class="sk-alert sk-alert-success">{form.identityMessage}</div>
	{:else if form?.transferReported}
		<div class="sk-alert sk-alert-success">
			Havale bildirimin alındı — operatör onayladıktan sonra domainin kurulur.
		</div>
	{:else if form?.reservationCancelled}
		<div class="sk-alert">Rezervasyon iptal edildi.</div>
	{:else if form?.deleted}
		<div class="sk-alert"><strong>{form.deleted}</strong> kalıcı olarak silindi.</div>
	{/if}

	{#if data.sites.length === 0}
		<AppCard>
			<div class="flex flex-col items-center gap-3 text-center">
				<p class="text-[var(--sk-muted)]">
					Henüz siten yok. Kendini birkaç cümleyle anlat, ilk siteni AI hazırlasın.
				</p>
				<a href="/new" class="sk-btn sk-btn-primary">İlk siteni oluştur</a>
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
							aria-label={`${site.siteName} — düzenleyicide aç`}
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
										Son güncelleme: {dateTr(site.updatedAt)}
									</p>
								</div>
								{#if site.publishedVersion}
									<div class="flex flex-wrap gap-2">
										<StatusPill tone="success">Yayında</StatusPill>
										{#if site.plan.state === 'active'}
											<StatusPill tone="success">Pro site</StatusPill>
										{:else if site.plan.state === 'grace'}
											<StatusPill tone="warning">Pro ek süre</StatusPill>
										{:else}
											<StatusPill>Free site</StatusPill>
										{/if}
									</div>
								{:else}
									<div class="flex flex-wrap gap-2">
										<StatusPill>Taslak</StatusPill>
										{#if site.plan.state === 'active'}
											<StatusPill tone="success">Pro site</StatusPill>
										{:else}
											<StatusPill>Free site</StatusPill>
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
										Site adı
										<input
											name="siteName"
											value={site.siteName}
											class="sk-input min-h-9 py-1.5 text-sm"
										/>
									</label>
									<label class="flex flex-col gap-1 text-xs text-[var(--sk-muted)]">
										Subdomain
										<input
											name="publicHandle"
											value={site.publicHandle ?? site.id}
											class="sk-input min-h-9 py-1.5 font-[var(--font-mono)] text-sm"
										/>
									</label>
									<label class="flex flex-col gap-1 text-xs text-[var(--sk-muted)]">
										İletişim e-postası
										<input
											name="contactEmail"
											value={site.contactEmail ?? ''}
											class="sk-input min-h-9 py-1.5 text-sm"
										/>
									</label>
									<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm self-end">
										Kaydet
									</button>
								</form>
								<div
									class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-[var(--sk-faint)]"
								>
									<span>Public URL: {site.publicHandle ?? site.id}.saaskaya.com</span>
									<span>Diller: {site.locales.join(' · ').toUpperCase()}</span>
									<span>Varsayılan: {site.defaultLocale.toUpperCase()}</span>
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
											Bu site Pro aktif.
										{:else if site.plan.state === 'grace'}
											Bu site Pro ek sürede.
										{:else}
											Bu site Free.
										{/if}
									</p>
									<p class="mt-1 text-xs text-[var(--sk-muted)]">
										Pro: {data.proSitePriceEur}€/ay veya {data.proSiteYearlyPriceEur}€/yıl.
										Yıllık Pro'ya standart .com alan adı, SSL ve teknik kurulum dahildir.
									</p>
								</div>
								{#if site.plan.state === 'free'}
									{#if data.billingConfigured}
										<div class="flex flex-wrap gap-2">
											<form method="POST" action="/api/billing/checkout">
												<input type="hidden" name="siteId" value={site.id} />
												<input type="hidden" name="planInterval" value="monthly" />
												<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
													Aylık Pro + domain seç
												</button>
											</form>
											<form method="POST" action="/api/billing/checkout">
												<input type="hidden" name="siteId" value={site.id} />
												<input type="hidden" name="planInterval" value="yearly" />
												<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
													Yıllık Pro (.com dahil)
												</button>
											</form>
										</div>
									{:else}
										<span class="text-xs text-[var(--sk-faint)]">
											Pro ödemesi hazır olduğunda burada açılacak.
										</span>
									{/if}
								{/if}
							</div>

							<div class="flex flex-wrap items-center gap-2">
								<a href="/editor/{site.id}" class="sk-btn sk-btn-primary sk-btn-sm">Düzenle</a>
								<a href={site.previewUrl} target="_blank" class="sk-btn sk-btn-secondary sk-btn-sm">
									Önizle
								</a>
								{#if site.publishedVersion}
									<a
										href="{site.liveUrl}?v={site.publishedVersion}"
										target="_blank"
										class="sk-btn sk-btn-secondary sk-btn-sm"
									>
										Canlı siteyi aç {@html uiIcons.external(13)}
									</a>
									<form method="POST" action="?/unpublish" use:enhance>
										<input type="hidden" name="siteId" value={site.id} />
										<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm">
											Yayından kaldır
										</button>
									</form>
								{:else}
									<a href="/editor/{site.id}" class="sk-btn sk-btn-secondary sk-btn-sm"
										>Yayına hazırla</a
									>
								{/if}
								<details class="relative">
									<summary
										class="sk-btn sk-btn-ghost sk-btn-sm cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden"
										aria-label="Diğer işlemler"
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
											Gelen mesajlar
											{#if site.messageCount > 0}
												<span
													class="rounded-full bg-[#b8532f] px-1.5 py-0.5 text-[10px] text-white"
												>
													{site.messageCount}
												</span>
											{/if}
										</a>
										{#if site.publishedVersion}
											<form method="POST" action="?/publish" use:enhance>
												<input type="hidden" name="siteId" value={site.id} />
												<button
													type="submit"
													class="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[#171614]/5"
													title="Kaydedilmiş son taslak yeni canlı sürüm olarak yayınlanır."
												>
													Son değişiklikleri yayına al
												</button>
											</form>
										{/if}
										{#if site.canExport}
											<a
												href="/api/sites/{site.id}/export"
												download
												class="rounded px-2 py-1.5 text-sm hover:bg-[#171614]/5"
											>
												Tam site export
											</a>
										{:else}
											<span class="rounded px-2 py-1.5 text-sm text-[var(--sk-faint)]">
												Tam export Pro site ile
											</span>
										{/if}
										<button
											type="button"
											onclick={() => openDeleteConfirm(site.id)}
											class="w-full rounded px-2 py-1.5 text-left text-sm text-[#b8532f] hover:bg-[#b8532f]/10"
										>
											Siteyi sil
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
											Bu site kalıcı olarak silinecek
										</p>
										<p class="mt-1 text-xs text-[var(--sk-muted)]">
											Site yayından kalkar, bağlı domain ayrılır ve tüm sürümler/medya dosyaları
											silinir. Bu işlem geri alınamaz. Tam export sadece Pro site veya operatör
											desteğiyle alınabilir. Onaylamak için site adını ({site.siteName}) aşağıya
											yaz.
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
											Kalıcı olarak sil
										</button>
										<button
											type="button"
											onclick={closeDeleteConfirm}
											class="sk-btn sk-btn-ghost sk-btn-sm"
										>
											Vazgeç
										</button>
									</form>
								</div>
							{/if}

							<div class="flex flex-col gap-2 border-t border-[var(--sk-line)] pt-4">
								{#if site.domain}
									<div class="flex flex-wrap items-center gap-2 text-sm">
										<span class="text-[var(--sk-muted)]">Domain:</span>
										<a
											href="https://{site.domain}"
											target="_blank"
											class="sk-link font-[var(--font-mono)]"
										>
											{site.domain}
										</a>
										<StatusPill tone="success">Güvenli (SSL)</StatusPill>
										<form method="POST" action="?/detachDomain" use:enhance>
											<input type="hidden" name="siteId" value={site.id} />
											<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
												Kaldır
											</button>
										</form>
									</div>
								{:else if site.reservation}
									{@const res = site.reservation}
									<div class="flex flex-col gap-2 text-sm">
										<div class="flex flex-wrap items-center gap-2">
											<span class="text-[var(--sk-muted)]">Domain rezervasyonu:</span>
											<span class="font-[var(--font-mono)]">{res.domain}</span>
											<StatusPill
												tone={res.status === 'failed'
													? 'error'
													: res.status === 'paid' || res.status === 'registering'
														? 'warning'
														: 'neutral'}
											>
												{res.status === 'pending'
													? 'ödeme bekleniyor'
													: res.status === 'manual_review'
														? 'manuel inceleme'
														: res.status === 'paid'
															? 'ödeme alındı'
															: res.status === 'registering'
																? 'kuruluyor'
																: res.status === 'failed'
																	? 'kurulum hatası'
																	: res.status}
											</StatusPill>
										</div>

										{#if res.status === 'pending' && site.plan.state === 'free' && !data.user.isAdmin}
											<div class="rounded-md bg-[#171614]/5 p-3 text-xs">
												<p class="font-semibold">Domain uygun. Önce bu siteyi Pro yap.</p>
												<p class="mt-1 text-[var(--sk-muted)]">
													Domain tescili ödeme ve iç uygunluk onayından sonra yürütülür.
												</p>
											</div>
											{#if data.billingConfigured}
												<div class="flex flex-wrap gap-2">
													<form method="POST" action="/api/billing/checkout">
												<input type="hidden" name="siteId" value={site.id} />
												<input type="hidden" name="planInterval" value="monthly" />
												<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
															Aylık Pro + domain seç
														</button>
													</form>
													<form method="POST" action="/api/billing/checkout">
														<input type="hidden" name="siteId" value={site.id} />
														<input type="hidden" name="planInterval" value="yearly" />
														<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
															Yıllık Pro (.com dahil)
														</button>
													</form>
												</div>
											{/if}
										{:else if res.status === 'pending' && res.paymentMethod === 'bank_transfer'}
											<div class="rounded-md bg-[#171614]/5 p-3 text-xs">
												<p class="text-[var(--sk-muted)]">Banka havalesi ile öde:</p>
												{#if data.payment.iban}
													<p class="mt-1 font-[var(--font-mono)]">{data.payment.iban}</p>
													{#if data.payment.accountHolder}
														<p class="text-[var(--sk-faint)]">{data.payment.accountHolder}</p>
													{/if}
												{:else}
													<p class="text-[var(--sk-faint)]">IBAN operatör tarafından eklenecek.</p>
												{/if}
												<p class="mt-1">
													Açıklama: <span class="font-[var(--font-mono)]">{res.domain}</span>
												</p>
											</div>
											<div class="flex flex-wrap gap-2">
												<form method="POST" action="?/reportTransfer" use:enhance>
													<input type="hidden" name="reservationId" value={res.id} />
													<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
														✓ Havale yaptım, bildir
													</button>
												</form>
												<form method="POST" action="?/cancelReservation" use:enhance>
													<input type="hidden" name="reservationId" value={res.id} />
													<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
														İptal et
													</button>
												</form>
											</div>
										{:else if res.status === 'pending' && ['stripe', 'creem'].includes(res.paymentMethod)}
											<div class="flex flex-wrap gap-2">
												<form method="POST" action="?/payDomainStripe">
													<input type="hidden" name="reservationId" value={res.id} />
													<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
														Kartla devam et
													</button>
												</form>
												<form method="POST" action="?/cancelReservation" use:enhance>
													<input type="hidden" name="reservationId" value={res.id} />
													<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
														İptal et
													</button>
												</form>
											</div>
										{:else if res.status === 'failed'}
											<p class="text-xs text-[var(--sk-muted)]">
												Kurulum sırasında bir sorun oldu; operatör inceliyor. Bir işlem yapman
												gerekmiyor.
											</p>
										{:else if res.status === 'manual_review'}
											<p class="text-xs text-[var(--sk-muted)]">
												Bu domain manuel incelemede. Uygunluk netleşince seninle iletişime
												geçeceğiz.
											</p>
										{:else}
											<p class="text-xs text-[var(--sk-muted)]">
												Ödemen alındı, domainin kuruluyor. Hazır olduğunda burada görünecek.
											</p>
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
											placeholder="kendisiteniz.com"
											class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
										/>
										<button
											type="submit"
											class="sk-btn sk-btn-secondary sk-btn-sm"
											disabled={site.plan.state === 'free' && !data.user.isAdmin}
										>
											Domainimi bağla
										</button>
									</form>
									<p class="text-[10.5px] text-[var(--sk-faint)]">
										Kendi domainin varsa yukarıdan bağla (domainin bize yönlenmiş olmalı).
									</p>
									{#if data.payment.mode === 'disabled' && !site.hasDomainCredit}
										<p class="text-xs text-[var(--sk-muted)]">
											Yeni domain satın alma kapalı beta sonrasında açılacak.
										</p>
									{:else if site.hasDomainCredit}
										<div class="rounded-md bg-[#eef7ee] p-3 text-xs text-[#285c2a]">
											<p class="font-semibold">Yıllık Pro alan adı hakkın hazır.</p>
											<p class="mt-1">
												Bir standart .com alan adı, SSL güvenliği, DNS kurulumu ve hosting
												bağlantısı pakete dahil.
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
												placeholder="istedigindomain.com"
												class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
											/>
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
												Dahil .com alan adımı seç
											</button>
										</form>
									{:else if site.planDetails.planInterval === 'monthly' &&
										site.plan.state !== 'free' &&
										(data.payment.mode === 'stripe_only' ||
											data.payment.mode === 'card_only' ||
											data.payment.mode === 'hybrid')}
										<div class="rounded-md bg-[#171614]/5 p-3 text-xs">
											<p class="font-semibold">Sıradaki adım: .com alan adını seç.</p>
											<p class="mt-1 text-[var(--sk-muted)]">
												Aylık Pro siten yayında kalır; kendi .com adresin için yıllık alan adı
												hizmeti 15€'dur. SSL, DNS kurulumu ve siteye bağlama tarafımızdan
												yönetilir.
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
												placeholder="istedigindomain.com"
												class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
											/>
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
												.com alan adımı seç
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
												placeholder="istedigindomain.com"
												class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
											/>
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
												Domain uygunluğunu kontrol et
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
												placeholder="istedigindomain.com"
												class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
											/>
											{#if data.payment.mode === 'hybrid'}
												<select name="paymentMethod" class="sk-input min-h-8 py-1.5 text-xs">
													<option value="bank_transfer">🏦 Banka havalesi</option>
													<option value="stripe">💳 Kredi kartı</option>
												</select>
											{:else}
												<input type="hidden" name="paymentMethod" value="bank_transfer" />
											{/if}
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
												Domain uygunluğunu kontrol et
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
