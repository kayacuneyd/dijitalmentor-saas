<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Dashboard · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/"
	title="Your sites"
	description={data.user.email}
	max="max-w-4xl"
	canvasLabel="saaskaya.app / dashboard"
>
	{#snippet actions()}
		<div class="flex flex-wrap gap-2">
			<a href="/new" class="sk-btn sk-btn-primary">+ New site</a>
			<a href="/account" class="sk-btn sk-btn-secondary">Account</a>
			{#if data.user.isAdmin}
				<a href="/admin/settings" class="sk-btn sk-btn-secondary">Settings</a>
			{/if}
			<form method="POST" action="/logout">
				<button type="submit" class="sk-btn sk-btn-ghost">Sign out</button>
			</form>
		</div>
	{/snippet}

	<AppCard class="p-4 sm:p-5">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Plan</div>
				{#if data.subscription.state === 'active'}
					<div class="mt-2 flex items-center gap-2">
						<span class="font-semibold">Professional workspace</span>
						<StatusPill tone="success">Pro · active</StatusPill>
					</div>
				{:else if data.subscription.state === 'grace'}
					<div class="mt-2 flex flex-wrap items-center gap-2">
						<span class="font-semibold">Professional workspace</span>
						<StatusPill tone="warning">Pro · grace</StatusPill>
					</div>
					<p class="mt-1 text-xs text-[var(--sk-muted)]">
						Subscription ended — paid features stay on until
						{new Date(data.subscription.until).toLocaleDateString()} (see cancellation policy).
					</p>
				{:else}
					<div class="mt-2 flex flex-wrap items-center gap-2">
						<span class="font-semibold">Free workspace</span>
						<StatusPill>Free</StatusPill>
					</div>
					<p class="mt-1 text-xs text-[var(--sk-muted)]">Custom domains need the Pro plan.</p>
				{/if}
			</div>
			{#if data.subscription.state !== 'active'}
				{#if data.billingConfigured}
					<form method="POST" action="/api/billing/checkout">
						<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">Upgrade to Pro</button>
					</form>
				{:else}
					<span class="text-xs text-[var(--sk-faint)]">Billing not configured yet.</span>
				{/if}
			{/if}
		</div>
	</AppCard>

	{#if form?.published}
		<div class="sk-alert sk-alert-success">
			Published <strong>{form.published}</strong> as v{form.version}.
		</div>
	{:else if form?.unpublished}
		<div class="sk-alert">Unpublished <strong>{form.unpublished}</strong>.</div>
	{:else if form?.domainAttached}
		<div class="sk-alert sk-alert-success">
			<span><strong>{form.domainAttached}</strong> attached. {form.provision}</span>
		</div>
	{:else if form?.domainDetached}
		<div class="sk-alert">Domain removed from <strong>{form.domainDetached}</strong>.</div>
	{:else if form?.reserved}
		<div class="sk-alert sk-alert-success">
			<strong>{form.reserved}</strong> rezerve edildi — aşağıdan ödeme adımına geç.
		</div>
	{:else if form?.transferReported}
		<div class="sk-alert sk-alert-success">
			Havale bildirimin alındı — operatör onayladıktan sonra domainin kurulur.
		</div>
	{:else if form?.reservationCancelled}
		<div class="sk-alert">Rezervasyon iptal edildi.</div>
	{/if}

	{#if data.sites.length === 0}
		<AppCard>
			<div class="flex flex-col items-center gap-3 text-center">
				<p class="text-[var(--sk-muted)]">
					No sites yet. Describe yourself and the AI builds your first one.
				</p>
				<a href="/new" class="sk-btn sk-btn-primary">Create your first site</a>
			</div>
		</AppCard>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each data.sites as site (site.id)}
				<li class="sk-shell p-5">
					<div class="flex flex-col gap-4">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="min-w-0">
								<div class="flex min-w-0 flex-wrap items-center gap-2">
									<span class="size-2.5 rounded-sm bg-[#171614]/80"></span>
									<h2 class="truncate font-semibold">{site.siteName}</h2>
									<span class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
										{site.id}
									</span>
								</div>
								<p class="mt-1 text-xs text-[var(--sk-muted)]">
									{site.id} · updated {new Date(site.updatedAt).toLocaleString()}
								</p>
							</div>
							{#if site.publishedVersion}
								<StatusPill tone="success">live · v{site.publishedVersion}</StatusPill>
							{:else}
								<StatusPill>draft only</StatusPill>
							{/if}
						</div>

						<div class="flex flex-wrap items-center gap-2">
							<a href="/editor/{site.id}" class="sk-btn sk-btn-primary sk-btn-sm">Edit</a>
							<a
								href="/preview/{site.id}"
								target="_blank"
								class="sk-btn sk-btn-secondary sk-btn-sm"
							>
								Preview
							</a>
							<form method="POST" action="?/publish" use:enhance>
								<input type="hidden" name="siteId" value={site.id} />
								<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
									{site.publishedVersion ? 'Republish' : 'Publish'}
								</button>
							</form>
							{#if site.publishedVersion}
								<a href={site.liveUrl} target="_blank" class="sk-btn sk-btn-ghost sk-btn-sm">
									View live ↗
								</a>
								<form method="POST" action="?/unpublish" use:enhance>
									<input type="hidden" name="siteId" value={site.id} />
									<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
										Unpublish
									</button>
								</form>
							{/if}
							<a href="/dashboard/{site.id}/messages" class="sk-btn sk-btn-ghost sk-btn-sm">
								Messages
								{#if site.messageCount > 0}
									<span class="rounded-full bg-[#b8532f] px-1.5 py-0.5 text-[10px] text-white">
										{site.messageCount}
									</span>
								{/if}
							</a>
							<a href="/api/sites/{site.id}/export" class="sk-btn sk-btn-ghost sk-btn-sm" download>
								Export
							</a>
						</div>

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
									<StatusPill tone="success">TLS ready</StatusPill>
									<form method="POST" action="?/detachDomain" use:enhance>
										<input type="hidden" name="siteId" value={site.id} />
										<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
											Remove
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
												: res.status === 'paid'
													? 'ödeme alındı'
													: res.status === 'registering'
														? 'kuruluyor'
														: res.status === 'failed'
															? 'kurulum hatası'
															: res.status}
										</StatusPill>
									</div>

									{#if res.status === 'pending' && res.paymentMethod === 'bank_transfer'}
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
												Açıklama: <span class="font-[var(--font-mono)]">{res.domain}</span> · Tutar:
												{res.priceEur}€ (≈ {res.priceTry}₺)
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
									{:else if res.status === 'pending' && res.paymentMethod === 'stripe'}
										<div class="flex flex-wrap gap-2">
											<form method="POST" action="?/payDomainStripe">
												<input type="hidden" name="reservationId" value={res.id} />
												<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
													💳 Kredi kartıyla öde ({res.priceEur}€)
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
										placeholder="yourdomain.com"
										class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
									/>
									<button
										type="submit"
										class="sk-btn sk-btn-secondary sk-btn-sm"
										disabled={!data.subscribed && !data.user.isAdmin}
									>
										Attach my domain
									</button>
								</form>
								<p class="text-[10.5px] text-[var(--sk-faint)]">
									Kendi domainin varsa yukarıdan bağla (DNS bize bakmalı).
								</p>
								{#if data.payment.mode === 'disabled'}
									<p class="text-xs text-[var(--sk-muted)]">
										Yeni domain satın alma kapalı beta sonrasında açılacak.
									</p>
								{:else if data.payment.mode === 'stripe_only'}
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
											placeholder="istediginizdomain.com"
											class="sk-input min-h-8 w-52 py-1.5 font-[var(--font-mono)] text-xs"
										/>
										<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">
											💳 Domain al ({data.payment.priceEur}€)
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
											placeholder="istediginizdomain.com"
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
											Rezerve et ({data.payment.priceEur}€)
										</button>
									</form>
								{/if}
								{#if form?.domainMessage && form?.siteId === site.id}
									<p class="text-xs text-[#b8532f]">{form.domainMessage}</p>
								{/if}
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</PageShell>
