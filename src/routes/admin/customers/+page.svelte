<script lang="ts">
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();

	function planLabel(subscription: (typeof data.customers)[number]['subscription']): string {
		if (subscription.state === 'active') return 'Pro';
		if (subscription.state === 'grace') return 'Pro · grace';
		return 'Free';
	}

	function planTone(subscription: (typeof data.customers)[number]['subscription']) {
		if (subscription.state === 'active') return 'success' as const;
		if (subscription.state === 'grace') return 'warning' as const;
		return 'neutral' as const;
	}

	function summaryLine(customer: (typeof data.customers)[number]): string {
		const spent = (customer.usage.estimatedCostMicrousd / 1_000_000).toFixed(2);
		const budget = customer.budgetUsd.toFixed(2);
		const joined = new Date(customer.createdAt).toLocaleDateString();
		return (
			`${customer.siteCount} site(s) · edits ${customer.usage.editCount}/${customer.limits.edit}` +
			` · gens ${customer.usage.generationCount}/${customer.limits.generation}` +
			` · $${spent}/$${budget} · joined ${joined}`
		);
	}
</script>

<svelte:head>
	<title>Customers · saaskaya admin</title>
</svelte:head>

<PageShell
	backHref="/admin/settings"
	backLabel="settings"
	title="Customers"
	description="Every account, their plan, and this month's AI usage."
	max="max-w-4xl"
	canvasLabel="saaskaya.app / admin"
>
	<AppCard>
		<div class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">{data.customers.length} customer(s)</h2>
			{#if data.customers.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No customers yet.</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each data.customers as customer (customer.id)}
						<li class="flex flex-wrap items-center justify-between gap-2 py-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="truncate font-medium">{customer.email}</span>
									<StatusPill tone={planTone(customer.subscription)}>
										{planLabel(customer.subscription)}
									</StatusPill>
								</div>
								<p class="font-[var(--font-mono)] text-[11px] text-[var(--sk-faint)]">
									{summaryLine(customer)}
								</p>
							</div>
							<a href="/admin/customers/{customer.id}" class="sk-btn sk-btn-secondary sk-btn-sm">
								View
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</PageShell>
