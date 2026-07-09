<script lang="ts">
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Account · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/dashboard"
	backLabel="dashboard"
	title="Account"
	description={data.user.email}
	max="max-w-4xl"
	canvasLabel="saaskaya.app / account"
>
	{#snippet actions()}
		<form method="POST" action="/logout">
			<button type="submit" class="sk-btn sk-btn-ghost">Sign out</button>
		</form>
	{/snippet}

	<section class="grid gap-3 sm:grid-cols-3">
		<AppCard class="p-4">
			<div class="flex flex-col gap-1">
				<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Sites</span>
				<strong class="sk-display text-4xl leading-none">{data.totals.sites}</strong>
			</div>
		</AppCard>
		<AppCard class="p-4">
			<div class="flex flex-col gap-1">
				<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Published</span>
				<strong class="sk-display text-4xl leading-none">{data.totals.published}</strong>
			</div>
		</AppCard>
		<AppCard class="p-4">
			<div class="flex flex-col gap-1">
				<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Messages</span>
				<strong class="sk-display text-4xl leading-none">{data.totals.messages}</strong>
			</div>
		</AppCard>
	</section>

	<AppCard>
		<div class="flex flex-col gap-4">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 class="font-semibold">Plan</h2>
					<p class="text-sm text-[var(--sk-muted)]">
						Custom domains require Pro. Published subdomains stay available on Free.
					</p>
				</div>
				{#if data.subscription.state === 'active'}
					<StatusPill tone="success">Pro</StatusPill>
				{:else if data.subscription.state === 'grace'}
					<StatusPill tone="warning">Pro · grace</StatusPill>
				{:else}
					<StatusPill>Free</StatusPill>
				{/if}
			</div>
			{#if data.subscription.state === 'grace'}
				<p class="text-sm text-[#7a341c]">
					Paid features remain active until
					{new Date(data.subscription.until).toLocaleDateString()}.
				</p>
			{/if}
			<div class="flex flex-wrap gap-2">
				{#if data.subscription.state !== 'active' && data.billingConfigured}
					<form method="POST" action="/api/billing/checkout">
						<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">Upgrade to Pro</button>
					</form>
				{/if}
				<a href="/dashboard" class="sk-btn sk-btn-secondary sk-btn-sm">Manage sites</a>
			</div>
		</div>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-4">
			<div>
				<h2 class="font-semibold">Profile</h2>
				<p class="text-sm text-[var(--sk-muted)]">
					Your account uses magic-link sign-in. No password is stored.
				</p>
			</div>
			<dl class="grid gap-3 text-sm sm:grid-cols-2">
				<div>
					<dt class="text-[var(--sk-faint)]">Email</dt>
					<dd class="font-medium">{data.user.email}</dd>
				</div>
				<div>
					<dt class="text-[var(--sk-faint)]">Role</dt>
					<dd class="font-medium">{data.user.isAdmin ? 'Super admin' : 'Customer'}</dd>
				</div>
			</dl>
		</div>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-4">
			<div>
				<h2 class="font-semibold">Data exports</h2>
				<p class="text-sm text-[var(--sk-muted)]">
					Each export contains the full site JSON and contact-form submissions for that site.
				</p>
			</div>
			{#if data.sites.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No sites to export yet.</p>
			{:else}
				<ul class="flex flex-col gap-2">
					{#each data.sites as site (site.id)}
						<li
							class="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--sk-line)] pt-3"
						>
							<div class="min-w-0">
								<p class="truncate text-sm font-medium">{site.siteName}</p>
								<p class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
									{site.id}
									{#if site.domain}
										· {site.domain}{/if}
								</p>
							</div>
							<a
								href="/api/sites/{site.id}/export"
								class="sk-btn sk-btn-secondary sk-btn-sm"
								download
							>
								Export
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-3">
			<h2 class="font-semibold">Deletion requests</h2>
			<p class="text-sm leading-6 text-[var(--sk-muted)]">
				Account deletion is handled by the operator for now. It removes your account, sites,
				published versions and messages from the database; backups age out under the retention
				policy.
			</p>
			<a
				href="mailto:admin@saaskaya.com"
				class="sk-btn sk-btn-secondary sk-btn-sm w-fit"
			>
				Request deletion
			</a>
		</div>
	</AppCard>
</PageShell>
