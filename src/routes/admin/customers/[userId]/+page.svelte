<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import AppCard from '$lib/ui/AppCard.svelte';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { uiIcons } from '$lib/ui/icons';

	let { data, form } = $props();
	const c = $derived(data.customer);

	function liveUrl(site: (typeof c.sites)[number]): string {
		const host = site.domain ?? `${site.publicHandle ?? site.id}.${page.url.host}`;
		return `https://${host}${site.publishedVersion ? `?v=${site.publishedVersion}` : ''}`;
	}

	function planLabel(subscription: typeof c.subscription): string {
		if (subscription.state === 'active') return 'Pro';
		if (subscription.state === 'grace') return 'Pro · grace';
		return 'Free';
	}

	function planTone(subscription: typeof c.subscription) {
		if (subscription.state === 'active') return 'success' as const;
		if (subscription.state === 'grace') return 'warning' as const;
		return 'neutral' as const;
	}

	function sitePlanLabel(plan: (typeof c.sites)[number]['plan']): string {
		if (plan.state === 'active') return 'Pro site';
		if (plan.state === 'grace') return 'Pro grace';
		return 'Free site';
	}

	function sitePlanTone(plan: (typeof c.sites)[number]['plan']) {
		if (plan.state === 'active') return 'success' as const;
		if (plan.state === 'grace') return 'warning' as const;
		return 'neutral' as const;
	}

	function ticketTone(status: string) {
		if (status === 'resolved') return 'success' as const;
		if (status === 'closed') return 'neutral' as const;
		return 'warning' as const;
	}

	let deleteConfirmSiteId = $state<string | null>(null);
</script>

<svelte:head>
	<title>{c.email} · Customers · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={c.email}
	description="Joined {new Date(c.createdAt).toLocaleDateString()}"
	active="/admin/customers"
>
	{#snippet actions()}
		<a href="/admin/customers" class="sk-btn sk-btn-secondary sk-btn-sm">Back to customers</a>
	{/snippet}
	{#if form?.overridden}
		<div class="sk-alert sk-alert-success">
			Plan manually set to <strong>{form.overridden === 'active' ? 'Pro' : 'Free'}</strong>.
		</div>
	{:else if form?.toppedUp}
		<div class="sk-alert sk-alert-success">AI credit top-up granted.</div>
	{:else if form?.domainDetached}
		<div class="sk-alert sk-alert-success">
			Domain detached from <strong>{form.domainDetached}</strong>.
		</div>
	{:else if form?.published}
		<div class="sk-alert sk-alert-success"><strong>{form.published}</strong> published.</div>
	{:else if form?.unpublished}
		<div class="sk-alert sk-alert-success"><strong>{form.unpublished}</strong> unpublished.</div>
	{:else if form?.siteDeleted}
		<div class="sk-alert sk-alert-success">
			<strong>{form.siteDeleted}</strong> permanently deleted.
		</div>
	{:else if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="font-semibold">Profile</h2>
			<div class="-mx-1 grid gap-3 text-sm sm:grid-cols-3">
				<div>
					<dt class="text-[var(--sk-faint)]">Full name</dt>
					<dd class="font-medium">{c.fullName ?? '—'}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">Profession</dt>
					<dd class="font-medium">{c.profession ?? '—'}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">City</dt>
					<dd class="font-medium">{c.city ?? '—'}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">Email</dt>
					<dd class="break-all font-medium">{c.email}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">Locale</dt>
					<dd class="font-medium">{c.locale?.toUpperCase() ?? '—'}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">Joined</dt>
					<dd class="font-medium">{new Date(c.createdAt).toLocaleDateString()}</dd>
				</div>
				{#if c.betaProfileCompletedAt}
					<div>
						<dt class="text-[var(--sk-faint)]">Beta profile</dt>
						<dd class="font-medium">{new Date(c.betaProfileCompletedAt).toLocaleDateString()}</dd>
					</div>
				{/if}
				<div>
					<dt class="text-[var(--sk-faint)]">Last AI edit</dt>
					<dd class="font-medium">{c.lastAiEditAt ? new Date(c.lastAiEditAt).toLocaleString() : 'Never'}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">Last publish</dt>
					<dd class="font-medium">{c.lastPublishedAt ? new Date(c.lastPublishedAt).toLocaleString() : 'Never'}</dd>
				</div>
			</div>
		</div>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 class="font-semibold">Plan</h2>
					{#if c.hasStripeCustomer}
						<p class="mt-1 text-xs text-[var(--sk-muted)]">
							Has a live Stripe subscription — overriding here won't cancel it in Stripe, and the
							next webhook event can silently overwrite this override.
						</p>
					{/if}
				</div>
				<StatusPill tone={planTone(c.subscription)}>{planLabel(c.subscription)}</StatusPill>
			</div>
			<div class="flex flex-wrap gap-2">
				{#if c.subscription.state === 'free'}
					<form method="POST" action="?/overrideSubscription" use:enhance>
						<input type="hidden" name="next" value="active" />
						<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">Comp Pro</button>
					</form>
				{:else}
					<form method="POST" action="?/overrideSubscription" use:enhance>
						<input type="hidden" name="next" value="free" />
						<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm">Revert to Free</button>
					</form>
				{/if}
			</div>
		</div>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-4">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h2 class="font-semibold">AI usage this month</h2>
				<StatusPill>
					${(c.usage.estimatedCostMicrousd / 1_000_000).toFixed(2)} / ${c.budgetUsd.toFixed(2)}
				</StatusPill>
			</div>
			<dl class="grid gap-3 text-sm sm:grid-cols-2">
				<div>
					<dt class="text-[var(--sk-faint)]">Edits</dt>
					<dd class="font-medium">{c.usage.editCount} / {c.limits.edit}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">Site generations</dt>
					<dd class="font-medium">{c.usage.generationCount} / {c.limits.generation}</dd>
				</div>
			</dl>
			<form
				method="POST"
				action="?/topUp"
				use:enhance
				class="flex flex-col gap-2 border-t border-[var(--sk-line)] pt-3"
			>
				<p class="text-xs text-[var(--sk-faint)]">Grant a one-time credit top-up this month</p>
				<div class="flex flex-wrap gap-2">
					<input
						type="number"
						name="edits"
						min="0"
						placeholder="+edits"
						class="sk-input min-h-8 w-24 py-1.5 text-sm"
					/>
					<input
						type="number"
						name="generations"
						min="0"
						placeholder="+generations"
						class="sk-input min-h-8 w-28 py-1.5 text-sm"
					/>
					<input
						type="number"
						name="usdWaived"
						min="0"
						step="0.01"
						placeholder="+$ waived"
						class="sk-input min-h-8 w-24 py-1.5 text-sm"
					/>
				</div>
				<input
					type="text"
					name="reason"
					required
					placeholder="Reason (required)"
					class="sk-input min-h-8 py-1.5 text-sm"
				/>
				<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm w-fit">Grant top-up</button>
			</form>
		</div>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="font-semibold">Sites ({c.sites.length})</h2>
			{#if c.sites.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No sites yet.</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each c.sites as site (site.id)}
						<li class="flex flex-col gap-2 py-3">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<div class="min-w-0">
									<p class="truncate text-sm font-medium">{site.siteName}</p>
								<p class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
									{site.id}
									{#if site.domain}
										· {site.domain}{/if}
									{#if site.lastChatAt}
										· last chat {new Date(site.lastChatAt).toLocaleDateString()}{/if}
								</p>
								</div>
								<div class="flex flex-wrap items-center gap-2">
									<StatusPill tone={site.publishedVersion ? 'success' : 'neutral'}>
										{site.publishedVersion ? 'Published' : 'Draft'}
									</StatusPill>
									<StatusPill tone={sitePlanTone(site.plan)}>
										{sitePlanLabel(site.plan)}
									</StatusPill>
									{#if site.chatCount > 0}
										<StatusPill>{site.chatCount} chats</StatusPill>
									{/if}
									{#if site.lastGateDecision}
										<StatusPill
											tone={site.lastGateDecision === 'applied' || site.lastGateDecision === 'auto_applied'
												? 'success'
												: 'neutral'}
										>
											AI: {site.lastGateDecision}
										</StatusPill>
									{/if}
									<a
										href="/preview/{site.id}"
										target="_blank"
										class="sk-btn sk-btn-ghost sk-btn-sm"
									>
										Preview
									</a>
									<a href="/editor/{site.id}" class="sk-btn sk-btn-secondary sk-btn-sm">Edit</a>
									{#if site.domain}
										<form method="POST" action="?/detachDomain" use:enhance>
											<input type="hidden" name="siteId" value={site.id} />
											<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm">
												Detach domain
											</button>
										</form>
									{/if}
									{#if site.publishedVersion}
										<a href={liveUrl(site)} target="_blank" class="sk-btn sk-btn-ghost sk-btn-sm">
											Live {@html uiIcons.external(13)}
										</a>
										<form method="POST" action="?/unpublish" use:enhance>
											<input type="hidden" name="siteId" value={site.id} />
											<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
												Unpublish
											</button>
										</form>
									{:else}
										<form method="POST" action="?/publish" use:enhance>
											<input type="hidden" name="siteId" value={site.id} />
											<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm">Publish</button>
										</form>
									{/if}
									<button
										type="button"
										onclick={() => (deleteConfirmSiteId = site.id)}
										class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm"
									>
										Delete
									</button>
								</div>
							</div>
							{#if deleteConfirmSiteId === site.id}
								<div
									class="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#b8532f]/40 bg-[#b8532f]/5 p-3"
								>
									<p class="text-xs text-[#b8532f]">
										Permanently delete <strong>{site.siteName}</strong>? This unpublishes it,
										detaches its domain, and removes all versions/media. Cannot be undone.
									</p>
									<form
										method="POST"
										action="?/deleteSite"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												deleteConfirmSiteId = null;
											};
										}}
									>
										<input type="hidden" name="siteId" value={site.id} />
										<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
											Confirm delete
										</button>
									</form>
									<button
										type="button"
										onclick={() => (deleteConfirmSiteId = null)}
										class="sk-btn sk-btn-ghost sk-btn-sm"
									>
										Cancel
									</button>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="font-semibold">Contact submissions ({c.submissions.length})</h2>
			{#if c.submissions.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No messages yet.</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each c.submissions as msg (msg.id)}
						<li class="py-3">
							<div class="flex items-center justify-between gap-2">
								<span class="text-sm font-medium">{msg.name} · {msg.email}</span>
								<span class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
									{msg.siteId} · {new Date(msg.createdAt).toLocaleDateString()}
								</span>
							</div>
							<p class="mt-1 text-sm text-[var(--sk-muted)]">{msg.message}</p>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="font-semibold">Support tickets ({c.tickets.length})</h2>
			{#if c.tickets.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No tickets from this customer.</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each c.tickets as ticket (ticket.id)}
						<li class="flex flex-wrap items-center justify-between gap-2 py-3">
							<div class="min-w-0">
								<a href="/admin/support/{ticket.id}" class="sk-link truncate font-medium">
									{ticket.subject}
								</a>
								<p class="text-xs text-[var(--sk-faint)]">
									{ticket.category} · updated {new Date(ticket.lastMessageAt).toLocaleDateString()}
								</p>
							</div>
							<StatusPill tone={ticketTone(ticket.status)}>{ticket.status}</StatusPill>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>

	<AppCard class="p-4">
		<div class="flex flex-col gap-3">
			<h2 class="font-semibold">Admin action log ({c.actions.length})</h2>
			{#if c.actions.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No admin actions on this account yet.</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each c.actions as action (action.id)}
						<li class="py-2 text-sm">
							<span class="font-medium">{action.action}</span>
							<span class="text-[var(--sk-muted)]"> — {action.detail}</span>
							<span class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
								· {action.adminEmail} · {new Date(action.createdAt).toLocaleString()}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>
</AdminShell>
