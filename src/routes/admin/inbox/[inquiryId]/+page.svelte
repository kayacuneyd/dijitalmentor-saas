<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data, form } = $props();
	const t = getTranslate();

	const statuses = ['open', 'pending', 'resolved', 'closed'] as const;
	const statusTone = (status: string) =>
		status === 'resolved' ? 'success' : status === 'closed' ? 'neutral' : 'warning';
</script>

<svelte:head>
	<title>{data.inquiry.name} · Inbox · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={data.inquiry.name}
	description="{data.inquiry.email} · {data.inquiry.source} · {data.inquiry.category}"
	active="/admin/inbox"
>
	{#snippet actions()}
		<FlowbiteButton href="/admin/inbox" variant="secondary" size="sm"
			>{t('admin.detail.backInbox')}</FlowbiteButton
		>
		<StatusPill tone={statusTone(data.inquiry.status)}>{data.inquiry.status}</StatusPill>
	{/snippet}

	{#if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}
	{#if form?.replied}
		<div class="sk-alert sk-alert-success">{t('admin.detail.replyStored')}</div>
	{/if}

	<AppCard class="p-4">
		<div class="flex flex-wrap items-center gap-2">
			<span class="text-xs text-[var(--sk-faint)]">{t('admin.detail.setStatus')}</span>
			{#each statuses as status (status)}
				<form method="POST" action="?/setStatus" use:enhance>
					<input type="hidden" name="status" value={status} />
					<FlowbiteButton
						type="submit"
						disabled={data.inquiry.status === status}
						variant={data.inquiry.status === status ? 'primary' : 'secondary'}
						size="sm"
					>
						{status}
					</FlowbiteButton>
				</form>
			{/each}
		</div>
	</AppCard>

	<AppCard class="p-4">
		<ul class="flex flex-col gap-4">
			{#each data.inquiry.messages as message (message.id)}
				<li class="flex flex-col gap-1">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-xs font-semibold">
							{message.authorKind === 'admin' ? t('admin.detail.youAdmin') : data.inquiry.email}
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

	{#if data.inquiry.status !== 'closed'}
		<AppCard class="p-4">
			<form method="POST" action="?/reply" use:enhance class="flex flex-col gap-3">
				<textarea
					name="body"
					required
					maxlength="4000"
					rows="4"
					class="sk-textarea text-sm"
					placeholder={t('admin.detail.replyEmail')}></textarea>
				<FlowbiteButton type="submit" variant="primary" size="sm" class="self-start"
					>{t('admin.detail.reply')}</FlowbiteButton
				>
			</form>
		</AppCard>
	{:else}
		<p class="text-sm text-[var(--sk-muted)]">{t('admin.detail.inquiryClosed')}</p>
	{/if}
</AdminShell>
