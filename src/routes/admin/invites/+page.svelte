<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data, form } = $props();
	const t = getTranslate();

	const tone = (status: string) =>
		status === 'joined' ? 'success' : status === 'revoked' ? 'error' : 'neutral';
</script>

<svelte:head>
	<title>{t('admin.invites.title')} · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={t('admin.invites.title')}
	description={t('admin.invites.description')}
	active="/admin/invites"
>
	<AppCard class="p-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<p class="text-sm font-medium">{t('admin.invites.access')}</p>
				<p class="mt-1 text-xs text-[var(--sk-muted)]">
					{data.betaMode ? t('admin.invites.enabled') : t('admin.invites.disabled')}
				</p>
			</div>
			<form method="POST" action="?/toggleBeta" use:enhance>
				<input type="hidden" name="enabled" value={data.betaMode ? '0' : '1'} />
				<FlowbiteButton type="submit" variant={data.betaMode ? 'secondary' : 'primary'} size="sm">
					{data.betaMode ? t('admin.invites.disable') : t('admin.invites.enable')}
				</FlowbiteButton>
			</form>
		</div>
	</AppCard>

	{#if form?.sent}
		<div class="sk-alert sk-alert-success">
			Invitation sent to <strong>{form.sent}</strong>.
		</div>
	{:else if form && 'saved' in form && form.saved}
		<div class="sk-alert sk-alert-warning">
			<strong>{form.saved}</strong> was added to the list, but the email was not sent.
			{form.message}
		</div>
	{:else if form?.betaEnabled === true}
		<div class="sk-alert sk-alert-success">Closed beta enabled.</div>
	{:else if form?.betaEnabled === false}
		<div class="sk-alert">Closed beta disabled.</div>
	{:else if form?.revoked}
		<div class="sk-alert">Revoked <strong>{form.revoked}</strong>.</div>
	{:else if form?.reactivated}
		<div class="sk-alert sk-alert-success">Reactivated <strong>{form.reactivated}</strong>.</div>
	{:else if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<AppCard class="p-4">
		<form method="POST" action="?/send" use:enhance class="flex flex-wrap items-end gap-2">
			<div class="flex flex-1 flex-col gap-1">
				<label for="email" class="text-xs text-[var(--sk-faint)]">{t('admin.invites.email')}</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					placeholder="avukat@example.com"
					class="sk-input min-h-8 py-1.5 text-sm"
				/>
			</div>
			<div class="flex w-32 flex-col gap-1">
				<label for="profession" class="text-xs text-[var(--sk-faint)]"
					>{t('admin.invites.profession')}</label
				>
				<input
					id="profession"
					name="profession"
					placeholder="law"
					class="sk-input min-h-8 py-1.5 text-sm"
				/>
			</div>
			<div class="flex w-24 flex-col gap-1">
				<label for="locale" class="text-xs text-[var(--sk-faint)]"
					>{t('admin.invites.language')}</label
				>
				<select id="locale" name="locale" class="sk-input min-h-8 py-1.5 text-sm">
					<option value="en">EN</option>
					<option value="tr">TR</option>
					<option value="de">DE</option>
				</select>
			</div>
			<FlowbiteButton type="submit" variant="primary" size="sm"
				>{t('admin.invites.send')}</FlowbiteButton
			>
		</form>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">{data.invites.length} invite(s)</h2>
			{#if data.invites.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">{t('admin.invites.empty')}</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each data.invites as invite (invite.email)}
						<li class="flex flex-wrap items-center justify-between gap-2 py-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="truncate font-medium">{invite.email}</span>
									<StatusPill tone={tone(invite.status)}>{invite.status}</StatusPill>
								</div>
								<p class="text-xs text-[var(--sk-faint)]">
									{invite.profession ?? '—'} · invited {new Date(
										invite.invitedAt
									).toLocaleDateString()}
									{#if invite.joinedAt}
										· joined {new Date(invite.joinedAt).toLocaleDateString()}
									{/if}
								</p>
							</div>
							{#if invite.status === 'revoked'}
								<form method="POST" action="?/reactivate" use:enhance>
									<input type="hidden" name="email" value={invite.email} />
									<FlowbiteButton type="submit" variant="ghost" size="sm"
										>{t('admin.invites.reactivate')}</FlowbiteButton
									>
								</form>
							{:else}
								<form method="POST" action="?/revoke" use:enhance>
									<input type="hidden" name="email" value={invite.email} />
									<FlowbiteButton type="submit" variant="danger" size="sm">
										{t('admin.invites.revoke')}
									</FlowbiteButton>
								</form>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</AdminShell>
