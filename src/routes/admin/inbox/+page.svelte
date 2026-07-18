<script lang="ts">
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data } = $props();
	const t = getTranslate();

	const statuses = ['all', 'open', 'pending', 'resolved', 'closed'] as const;
	const sources = ['all', 'contact', 'chat', 'assistant'] as const;

	const statusTone = (status: string) =>
		status === 'resolved' ? 'success' : status === 'closed' ? 'neutral' : 'warning';

	function href(status: string, source: string) {
		const params = new URLSearchParams();
		if (status !== 'all') params.set('status', status);
		if (source !== 'all') params.set('source', source);
		const query = params.toString();
		return query ? `/admin/inbox?${query}` : '/admin/inbox';
	}
</script>

<svelte:head>
	<title>{t('admin.list.inboxTitle')} · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={t('admin.list.inboxTitle')}
	description={t('admin.list.inboxDescription')}
	active="/admin/inbox"
>
	<div class="flex flex-col gap-2">
		<div class="flex flex-wrap gap-2">
			{#each statuses as status (status)}
				<FlowbiteButton
					href={href(status, data.source)}
					variant={data.status === status ? 'primary' : 'secondary'}
					size="sm"
				>
					{status}
				</FlowbiteButton>
			{/each}
		</div>
		<div class="flex flex-wrap gap-2">
			{#each sources as source (source)}
				<FlowbiteButton
					href={href(data.status, source)}
					variant={data.source === source ? 'primary' : 'secondary'}
					size="sm"
				>
					{source}
				</FlowbiteButton>
			{/each}
		</div>
	</div>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">
				{t('admin.list.inquiryCount', { count: data.inquiries.length })}
			</h2>
			{#if data.inquiries.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">{t('admin.list.noInquiries')}</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each data.inquiries as inquiry (inquiry.id)}
						<li class="flex flex-wrap items-center justify-between gap-2 py-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="truncate font-medium">{inquiry.name}</span>
									<StatusPill tone={statusTone(inquiry.status)}>{inquiry.status}</StatusPill>
									{#if inquiry.lastMessageBy === 'visitor' && inquiry.status !== 'closed'}
										<StatusPill tone="warning">{t('admin.list.new')}</StatusPill>
									{/if}
								</div>
								<p class="text-xs text-[var(--sk-faint)]">
									{inquiry.email} · {inquiry.source} · {inquiry.category} · updated {new Date(
										inquiry.lastMessageAt
									).toLocaleString()}
								</p>
							</div>
							<FlowbiteButton href="/admin/inbox/{inquiry.id}" variant="secondary" size="sm">
								{t('admin.list.open')}
							</FlowbiteButton>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</AdminShell>
