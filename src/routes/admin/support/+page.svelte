<script lang="ts">
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();

	const statusTone = (status: string) =>
		status === 'resolved' ? 'success' : status === 'closed' ? 'neutral' : 'warning';

	const filters = ['all', 'open', 'pending', 'resolved', 'closed'] as const;
</script>

<svelte:head>
	<title>Support · saaskaya admin</title>
</svelte:head>

<AdminShell
	title="Support"
	description="Every customer request, most recently active first."
	active="/admin/support"
>
	<div class="flex flex-wrap gap-2">
		{#each filters as f (f)}
			<a
				href={f === 'all' ? '/admin/support' : `/admin/support?status=${f}`}
				class="sk-btn sk-btn-sm {data.status === f ? 'sk-btn-primary' : 'sk-btn-secondary'}"
			>
				{f}
			</a>
		{/each}
	</div>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">{data.tickets.length} ticket(s)</h2>
			{#if data.tickets.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No tickets.</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each data.tickets as ticket (ticket.id)}
						<li class="flex flex-wrap items-center justify-between gap-2 py-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="truncate font-medium">{ticket.subject}</span>
									<StatusPill tone={statusTone(ticket.status)}>{ticket.status}</StatusPill>
								</div>
								<p class="text-xs text-[var(--sk-faint)]">
									{ticket.customerEmail} · {ticket.category} · updated {new Date(
										ticket.lastMessageAt
									).toLocaleString()}
								</p>
							</div>
							<a href="/admin/support/{ticket.id}" class="sk-btn sk-btn-secondary sk-btn-sm">
								Open
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</AdminShell>
