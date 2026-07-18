<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';
	import type { CatalogKey } from '$lib/i18n/catalog';

	let { data, form } = $props();

	const t = getTranslate();

	const statusTone = (status: string) =>
		status === 'resolved' ? 'success' : status === 'closed' ? 'neutral' : 'warning';
	const statusLabel = (status: string) =>
		t(`account.support.status${status.charAt(0).toUpperCase()}${status.slice(1)}` as CatalogKey);
	const categoryLabel = (category: string) =>
		category === 'human_review'
			? t('account.support.categoryHumanReview')
			: t(
					`account.support.category${category.charAt(0).toUpperCase()}${category.slice(1)}` as CatalogKey
				);
</script>

<svelte:head>
	<title>{data.ticket.subject} · {t('account.support.title')} · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/account/support"
	backLabel="support"
	title={data.ticket.subject}
	description="{categoryLabel(data.ticket.category)} · {t('account.support.detail.openedOn', {
		date: new Date(data.ticket.createdAt).toLocaleDateString()
	})}"
	canvasLabel="saaskaya.app / account"
>
	{#snippet actions()}
		<StatusPill tone={statusTone(data.ticket.status)}>{statusLabel(data.ticket.status)}</StatusPill>
	{/snippet}

	{#if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<AppCard>
		<ul class="flex flex-col gap-4">
			{#each data.ticket.messages as message (message.id)}
				<li class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<span class="text-xs font-semibold">
							{message.authorKind === 'admin'
								? t('account.support.detail.team')
								: t('account.support.detail.you')}
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
		<AppCard>
			<form method="POST" action="?/reply" use:enhance class="flex flex-col gap-3">
				<textarea
					name="body"
					required
					rows="4"
					class="sk-input py-1.5 text-sm"
					placeholder={t('account.support.detail.replyPlaceholder')}></textarea>
				<FlowbiteButton type="submit" variant="primary" size="sm" class="self-start"
					>{t('account.support.detail.reply')}</FlowbiteButton
				>
			</form>
		</AppCard>
	{:else}
		<p class="text-sm text-[var(--sk-muted)]">{t('account.support.detail.closedNotice')}</p>
	{/if}
</PageShell>
