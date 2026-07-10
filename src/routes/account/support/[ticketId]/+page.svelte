<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data, form } = $props();

	const statusTone = (status: string) =>
		status === 'resolved' ? 'success' : status === 'closed' ? 'neutral' : 'warning';
</script>

<svelte:head>
	<title>{data.ticket.subject} · Support · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/account/support"
	backLabel="support"
	title={data.ticket.subject}
	description="{data.ticket.category} · opened {new Date(
		data.ticket.createdAt
	).toLocaleDateString()}"
	max="max-w-5xl"
	canvasLabel="saaskaya.app / account"
>
	{#snippet actions()}
		<StatusPill tone={statusTone(data.ticket.status)}>{data.ticket.status}</StatusPill>
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
							{message.authorKind === 'admin' ? 'saaskaya support' : 'You'}
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
					placeholder="Write a reply…"></textarea>
				<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm self-start">Reply</button>
			</form>
		</AppCard>
	{:else}
		<p class="text-sm text-[var(--sk-muted)]">This ticket is closed.</p>
	{/if}
</PageShell>
