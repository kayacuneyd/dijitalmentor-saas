<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data, form } = $props();
	const t = getTranslate();

	const statusTone = (status: string) =>
		status === 'resolved' ? 'success' : status === 'closed' ? 'neutral' : 'warning';

	const statuses = ['open', 'pending', 'resolved', 'closed'] as const;
</script>

<svelte:head>
	<title>{data.ticket.subject} · Support · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={data.ticket.subject}
	description="{data.customerEmail} · {data.ticket.category}"
	active="/admin/support"
>
	{#snippet actions()}
		<FlowbiteButton href="/admin/support" variant="secondary" size="sm"
			>{t('admin.detail.backSupport')}</FlowbiteButton
		>
		<StatusPill tone={statusTone(data.ticket.status)}>{data.ticket.status}</StatusPill>
	{/snippet}

	{#if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<AppCard class="p-4">
		<div class="flex flex-wrap items-center gap-2">
			<span class="text-xs text-[var(--sk-faint)]">{t('admin.detail.setStatus')}</span>
			{#each statuses as s (s)}
				<form method="POST" action="?/setStatus" use:enhance>
					<input type="hidden" name="status" value={s} />
					<FlowbiteButton
						type="submit"
						disabled={data.ticket.status === s}
						variant={data.ticket.status === s ? 'primary' : 'secondary'}
						size="sm"
					>
						{s}
					</FlowbiteButton>
				</form>
			{/each}
		</div>
	</AppCard>

	<AppCard class="p-4">
		<ul class="flex flex-col gap-4">
			{#each data.ticket.messages as message (message.id)}
				<li class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<span class="text-xs font-semibold">
							{message.authorKind === 'admin' ? t('admin.detail.youSupport') : data.customerEmail}
						</span>
						<span class="text-xs text-[var(--sk-faint)]">
							{new Date(message.createdAt).toLocaleString()}
						</span>
					</div>
					<p class="text-sm whitespace-pre-wrap">{message.body}</p>
				</li>
			{/each}
		</ul>
	</AppCard>

	{#if data.ticket.status !== 'closed'}
		<AppCard class="p-4">
			<form method="POST" action="?/reply" use:enhance class="flex flex-col gap-3">
				<textarea
					name="body"
					required
					rows="4"
					class="sk-input py-1.5 text-sm"
					placeholder={t('admin.detail.replyCustomer')}></textarea>
				<FlowbiteButton type="submit" variant="primary" size="sm" class="self-start"
					>{t('admin.detail.reply')}</FlowbiteButton
				>
			</form>
		</AppCard>
	{:else}
		<p class="text-sm text-[var(--sk-muted)]">{t('admin.detail.ticketClosed')}</p>
	{/if}
</AdminShell>
