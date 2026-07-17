<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
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
	<title>{t('account.support.title')} · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/account"
	backLabel="account"
	title={t('account.support.title')}
	description={t('account.support.description')}
	canvasLabel="saaskaya.app / account"
>
	{#if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<AppCard>
		<form method="POST" action="?/create" use:enhance class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">{t('account.support.newRequest')}</h2>
			<div class="flex flex-col gap-1">
				<label for="category" class="text-xs text-[var(--sk-faint)]"
					>{t('account.support.categoryLabel')}</label
				>
				<select id="category" name="category" class="sk-input min-h-8 py-1.5 text-sm">
					<option value="general">{t('account.support.categoryGeneral')}</option>
					<option value="billing">{t('account.support.categoryBilling')}</option>
					<option value="technical">{t('account.support.categoryTechnical')}</option>
					<option value="human_review">{t('account.support.categoryHumanReview')}</option>
				</select>
			</div>
			<div class="flex flex-col gap-1">
				<label for="subject" class="text-xs text-[var(--sk-faint)]"
					>{t('account.support.subjectLabel')}</label
				>
				<input
					id="subject"
					name="subject"
					required
					class="sk-input min-h-8 py-1.5 text-sm"
					placeholder={t('account.support.subjectPlaceholder')}
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label for="body" class="text-xs text-[var(--sk-faint)]"
					>{t('account.support.messageLabel')}</label
				>
				<textarea
					id="body"
					name="body"
					required
					rows="4"
					class="sk-input py-1.5 text-sm"
					placeholder={t('account.support.messagePlaceholder')}></textarea>
			</div>
			<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm self-start"
				>{t('account.support.send')}</button
			>
		</form>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">
				{t('account.support.ticketCount', { count: data.tickets.length })}
			</h2>
			{#if data.tickets.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">{t('account.support.empty')}</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each data.tickets as ticket (ticket.id)}
						<li class="flex items-center justify-between gap-2 py-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<a href="/account/support/{ticket.id}" class="sk-link truncate font-medium">
										{ticket.subject}
									</a>
									<StatusPill tone={statusTone(ticket.status)}
										>{statusLabel(ticket.status)}</StatusPill
									>
								</div>
								<p class="text-xs text-[var(--sk-faint)]">
									{categoryLabel(ticket.category)} · {t('account.support.updated', {
										date: new Date(ticket.lastMessageAt).toLocaleString()
									})}
								</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</PageShell>
