<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data, form } = $props();

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
		<a href="/admin/support" class="sk-btn sk-btn-secondary sk-btn-sm">Back to support</a>
		<StatusPill tone={statusTone(data.ticket.status)}>{data.ticket.status}</StatusPill>
	{/snippet}

	{#if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<AppCard class="p-4">
		<div class="flex flex-wrap items-center gap-2">
			<span class="text-xs text-[var(--sk-faint)]">Set status:</span>
			{#each statuses as s (s)}
				<form method="POST" action="?/setStatus" use:enhance>
					<input type="hidden" name="status" value={s} />
					<button
						type="submit"
						disabled={data.ticket.status === s}
						class="sk-btn sk-btn-sm {data.ticket.status === s
							? 'sk-btn-primary'
							: 'sk-btn-secondary'}"
					>
						{s}
					</button>
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
							{message.authorKind === 'admin' ? 'You (support)' : data.customerEmail}
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
					placeholder="Reply to the customer…"></textarea>
				<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm self-start">Reply</button>
			</form>
		</AppCard>
	{:else}
		<p class="text-sm text-[var(--sk-muted)]">This ticket is closed.</p>
	{/if}
</AdminShell>
