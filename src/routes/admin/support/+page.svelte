<script lang="ts">
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data } = $props();
	const t = getTranslate();

	const statusTone = (status: string) =>
		status === 'resolved' ? 'success' : status === 'closed' ? 'neutral' : 'warning';

	const filters = ['all', 'open', 'pending', 'resolved', 'closed'] as const;
</script>

<svelte:head>
	<title>{t('admin.list.supportTitle')} · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={t('admin.list.supportTitle')}
	description={t('admin.list.supportDescription')}
	active="/admin/support"
>
	<div class="flex flex-wrap gap-2">
		{#each filters as f (f)}
			<FlowbiteButton
				href={f === 'all' ? '/admin/support' : `/admin/support?status=${f}`}
				variant={data.status === f ? 'primary' : 'secondary'}
				size="sm"
			>
				{f}
			</FlowbiteButton>
		{/each}
	</div>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">
				{t('admin.list.ticketCount', { count: data.tickets.length })}
			</h2>
			{#if data.tickets.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">{t('admin.list.noTickets')}</p>
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
							<FlowbiteButton href="/admin/support/{ticket.id}" variant="secondary" size="sm">
								{t('admin.list.open')}
							</FlowbiteButton>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</AdminShell>
