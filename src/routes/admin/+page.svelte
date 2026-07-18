<script lang="ts">
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import Sparkline from '$lib/ui/Sparkline.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();

	const severityTone = { info: 'neutral', warning: 'warning', critical: 'error' } as const;

	const activityLabel = {
		admin_action: 'Admin action',
		error: 'Error',
		site_generated: 'Site generated',
		signup: 'Signup',
		domain_paid: 'Domain paid',
		subscription_activated: 'Subscription',
		ticket_created: 'New ticket',
		ticket_reply: 'Ticket reply'
	} as const;
</script>

<svelte:head>
	<title>Dashboard · saaskaya admin</title>
</svelte:head>

<AdminShell
	title="Overview"
	description="İş, aktivite ve sistem durumuna tek bakışta hakim ol."
	active="/admin"
>
	<div class="admin-ledger">
		{#if data.alerts.length > 0}
			<AppCard class="admin-alerts border-(--sk-error-line) p-4">
				<div class="flex flex-col gap-2">
					<h2 class="font-semibold">Uyarılar ({data.alerts.length})</h2>
					<ul class="flex flex-col gap-2">
						{#each data.alerts as alert, i (i)}
							<li class="flex flex-wrap items-center gap-2 text-sm">
								<StatusPill tone={severityTone[alert.severity]}>{alert.severity}</StatusPill>
								<span class="font-medium">{alert.summary}</span>
								{#if alert.detail}
									<span class="text-xs text-[var(--sk-faint)]">{alert.detail}</span>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			</AppCard>
		{/if}

		<section class="admin-metric-rail grid gap-3 md:grid-cols-3">
			<AppCard class="admin-metric admin-metric--primary p-4">
				<div class="flex flex-col gap-1">
					<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">MRR (tahmini)</span>
					<strong class="sk-display text-4xl leading-none"
						>{data.mrr.mrrEur.toLocaleString('tr-TR')}€</strong
					>
					<span class="text-xs text-[var(--sk-faint)]">
						{data.mrr.activeCount} aktif × {data.mrr.priceEur}€
					</span>
				</div>
			</AppCard>
			<AppCard class="admin-metric p-4">
				<div class="flex flex-col gap-1">
					<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Aboneler</span>
					<strong class="sk-display text-4xl leading-none">{data.subscribers.active}</strong>
					<span class="text-xs text-[var(--sk-faint)]">
						{data.subscribers.grace} grace · {data.subscribers.free} free
					</span>
				</div>
			</AppCard>
			<AppCard class="admin-metric p-4">
				<div class="flex flex-col gap-1">
					<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Bu ay AI harcaması</span>
					<strong class="sk-display text-4xl leading-none">
						${data.aiSpend.usedUsd.toFixed(2)}
					</strong>
					<span class="text-xs text-[var(--sk-faint)]">
						/ ${data.aiSpend.budgetUsd.toFixed(2)} global bütçe
					</span>
				</div>
			</AppCard>
		</section>

		<section class="admin-trend-grid grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
			<AppCard class="admin-trends p-4">
				<div class="grid gap-5 lg:grid-cols-2">
					<div class="flex-1">
						<h2 class="font-semibold">Kayıt trendi (6 ay)</h2>
						<div class="mt-3">
							<Sparkline points={data.signupTrend} />
						</div>
					</div>
					<div class="flex-1">
						<h2 class="font-semibold">AI harcama trendi (6 ay)</h2>
						<div class="mt-3">
							<Sparkline points={data.aiSpendTrend} format={(v) => `$${v.toFixed(2)}`} />
						</div>
					</div>
				</div>
			</AppCard>

			<AppCard class="admin-queue p-4">
				<div class="flex flex-col gap-3">
					<h2 class="font-semibold">Son kayıtlar</h2>
					{#if data.recentSignups.length === 0}
						<p class="text-sm text-[var(--sk-muted)]">Henüz kayıt yok.</p>
					{:else}
						<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
							{#each data.recentSignups as user (user.id)}
								<li class="flex items-center justify-between gap-2 py-2 text-sm">
									<a href="/admin/customers/{user.id}" class="sk-link truncate font-medium">
										{user.email}
									</a>
									<span class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
										{new Date(user.createdAt).toLocaleDateString('tr-TR')}
									</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</AppCard>
		</section>

		<AppCard class="admin-observation p-4">
			<div class="flex flex-col gap-3">
				<div class="flex items-baseline justify-between gap-3">
					<h2 class="font-semibold">Public site visits</h2>
					<span class="text-xs text-[var(--sk-faint)]">last 30 days · aggregate only</span>
				</div>
				<strong class="sk-display text-4xl leading-none">{data.visits.total}</strong>
				{#if data.visits.bySite.length === 0}
					<p class="text-sm text-[var(--sk-muted)]">No public visits recorded yet.</p>
				{:else}
					<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
						{#each data.visits.bySite.slice(0, 5) as site (site.siteId)}
							<li class="flex justify-between gap-2 py-2 text-sm">
								<span class="truncate">{site.siteId}</span>
								<strong>{site.visits}</strong>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</AppCard>

		<AppCard class="admin-activity p-4">
			<div class="flex flex-col gap-3">
				<div class="flex items-center justify-between gap-3">
					<h2 class="font-semibold">Aktivite akışı</h2>
					<FlowbiteButton href="/admin/settings#errors" variant="secondary" size="sm"
						>System logs</FlowbiteButton
					>
				</div>
				{#if data.activity.length === 0}
					<p class="text-sm text-[var(--sk-muted)]">Henüz aktivite yok.</p>
				{:else}
					<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
						{#each data.activity as item, i (i)}
							<li class="flex items-center justify-between gap-2 py-2 text-sm">
								<div class="flex min-w-0 items-center gap-2">
									<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">
										{activityLabel[item.kind]}
									</span>
									<span class="truncate">{item.summary}</span>
								</div>
								<span class="shrink-0 font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
									{new Date(item.at).toLocaleString('tr-TR')}
								</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</AppCard>
	</div>
</AdminShell>
