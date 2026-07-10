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
	<title>Support · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/account"
	backLabel="account"
	title="Support"
	description="Send us a message — a real person replies here."
	max="max-w-5xl"
	canvasLabel="saaskaya.app / account"
>
	{#if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<AppCard>
		<form method="POST" action="?/create" use:enhance class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">New request</h2>
			<div class="flex flex-col gap-1">
				<label for="category" class="text-xs text-[var(--sk-faint)]">Category</label>
				<select id="category" name="category" class="sk-input min-h-8 py-1.5 text-sm">
					<option value="general">General</option>
					<option value="billing">Billing</option>
					<option value="technical">Technical</option>
					<option value="human_review">Human review (Premium)</option>
				</select>
			</div>
			<div class="flex flex-col gap-1">
				<label for="subject" class="text-xs text-[var(--sk-faint)]">Subject</label>
				<input
					id="subject"
					name="subject"
					required
					class="sk-input min-h-8 py-1.5 text-sm"
					placeholder="What's this about?"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label for="body" class="text-xs text-[var(--sk-faint)]">Message</label>
				<textarea
					id="body"
					name="body"
					required
					rows="4"
					class="sk-input py-1.5 text-sm"
					placeholder="Tell us what's going on."></textarea>
			</div>
			<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm self-start">Send</button>
		</form>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-3">
			<h2 class="sk-display text-2xl leading-none">{data.tickets.length} ticket(s)</h2>
			{#if data.tickets.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No tickets yet.</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each data.tickets as ticket (ticket.id)}
						<li class="flex items-center justify-between gap-2 py-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<a href="/account/support/{ticket.id}" class="sk-link truncate font-medium">
										{ticket.subject}
									</a>
									<StatusPill tone={statusTone(ticket.status)}>{ticket.status}</StatusPill>
								</div>
								<p class="text-xs text-[var(--sk-faint)]">
									{ticket.category} · updated {new Date(ticket.lastMessageAt).toLocaleString()}
								</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</PageShell>
