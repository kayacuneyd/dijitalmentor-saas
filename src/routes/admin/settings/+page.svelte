<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data, form } = $props();

	const groups = ['AI', 'AI Providers', 'Email', 'Billing', 'Domains', 'Media', 'Ops'] as const;

	const formatBytes = (n: number | null) =>
		n === null
			? '—'
			: n > 1_048_576
				? `${(n / 1_048_576).toFixed(1)} MB`
				: `${Math.round(n / 1024)} KB`;
	const formatUptime = (s: number) =>
		s > 86_400
			? `${Math.floor(s / 86_400)}d ${Math.floor((s % 86_400) / 3600)}h`
			: `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
</script>

<svelte:head>
	<title>Settings · saaskaya admin</title>
</svelte:head>

<PageShell
	backHref="/dashboard"
	backLabel="dashboard"
	title="Credentials & settings"
	description="Values saved here live in the database and win over .env — no redeploy needed. Secrets are write-only: once saved, only the last characters are shown."
	max="max-w-4xl"
	canvasLabel="saaskaya.app / admin"
>
	{#snippet actions()}
		<a href="/admin/customers" class="sk-btn sk-btn-secondary sk-btn-sm">Customers</a>
		<a href="/admin/invites" class="sk-btn sk-btn-secondary sk-btn-sm">Beta invites</a>
	{/snippet}

	{#if form?.saved}
		<div class="sk-alert sk-alert-success">Saved <code>{form.saved}</code>.</div>
	{:else if form?.cleared}
		<div class="sk-alert">Cleared <code>{form.cleared}</code> (env fallback applies).</div>
	{:else if form?.paymentConfirmed}
		<div class="sk-alert sk-alert-success">
			Confirmed <code>{form.paymentConfirmed}</code> — will be fulfilled by cron, or fulfill now below.
		</div>
	{:else if form?.paymentRejected}
		<div class="sk-alert">Rejected <code>{form.paymentRejected}</code>.</div>
	{:else if form?.fulfilled}
		<div class="sk-alert {form.fulfillError ? 'sk-alert-error' : 'sk-alert-success'}">
			Fulfillment of <code>{form.fulfilled}</code>: {form.fulfillStatus}{form.fulfillError
				? ` — ${form.fulfillError}`
				: ''}.
		</div>
	{:else if form?.errorResolved}
		<div class="sk-alert sk-alert-success">
			Resolved <code>{form.errorResolved}</code>.
		</div>
	{:else if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	{#if data.pending.length > 0}
		<AppCard>
			<div class="flex flex-col gap-4">
				<h2 class="sk-display text-2xl leading-none">
					Bekleyen ödemeler ({data.pending.length})
				</h2>
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each data.pending as res (res.id)}
						<li class="flex flex-col gap-2 py-3">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<span class="sk-mono font-medium">{res.domain}</span>
										<StatusPill
											tone={res.status === 'failed'
												? 'error'
												: res.status === 'paid' || res.status === 'registering'
													? 'warning'
													: 'neutral'}
										>
											{res.status}
										</StatusPill>
										<span class="text-xs text-[var(--sk-faint)]">
											{res.paymentMethod} · {res.priceEur}€
										</span>
									</div>
									<p class="text-xs text-[var(--sk-faint)]">
										{res.id} · created {new Date(res.createdAt).toLocaleString()}
									</p>
								</div>
								<div class="flex flex-wrap gap-2">
									{#if res.status === 'pending'}
										<form method="POST" action="?/confirmPayment" use:enhance>
											<input type="hidden" name="reservationId" value={res.id} />
											<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">Onayla</button>
										</form>
										<form method="POST" action="?/rejectPayment" use:enhance>
											<input type="hidden" name="reservationId" value={res.id} />
											<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
												Reddet
											</button>
										</form>
									{:else if res.status === 'paid' || res.status === 'failed'}
										<form method="POST" action="?/fulfillReservation" use:enhance>
											<input type="hidden" name="reservationId" value={res.id} />
											<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
												{res.status === 'failed' ? 'Tekrar dene' : 'Kur (register + attach)'}
											</button>
										</form>
									{/if}
								</div>
							</div>
							{#if res.operatorNotes}
								<pre
									class="max-h-24 overflow-y-auto rounded bg-[#171614]/5 p-2 text-[10.5px] whitespace-pre-wrap text-[var(--sk-faint)]">{res.operatorNotes}</pre>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</AppCard>
	{/if}

	<AppCard>
		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">System status</h2>
				<StatusPill tone={data.health.ok ? 'success' : 'error'}>
					{data.health.ok ? 'healthy' : 'degraded'}
				</StatusPill>
			</div>
			<div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
				<div>
					<span class="block text-xs text-[var(--sk-faint)]">Database</span>
					{data.health.checks.db} · {formatBytes(data.ops.dbSizeBytes)}
				</div>
				<div>
					<span class="block text-xs text-[var(--sk-faint)]">Disk</span>
					{data.health.checks.disk}
				</div>
				<div>
					<span class="block text-xs text-[var(--sk-faint)]">App uptime</span>
					{formatUptime(data.ops.uptimeSeconds)}
				</div>
				<div>
					<span class="block text-xs text-[var(--sk-faint)]">Sites / users</span>
					{data.ops.counts.sites} / {data.ops.counts.users}
				</div>
				<div class="col-span-2">
					<span class="block text-xs text-[var(--sk-faint)]">Last backup</span>
					{data.ops.lastBackup ?? 'none yet — scripts/backup.sh runs nightly via cron'}
				</div>
				<div class="col-span-2 sm:col-span-3">
					<span class="block text-xs text-[var(--sk-faint)]">AI gate (this month)</span>
					{data.gate.blocked} blocked before Layer&nbsp;2 · {data.gate.agentRuns} agent runs ({data
						.gate.approved}/{data.gate.proposed} proposals approved) · tokens {data.gate.gateTokens}
					gate / {data.gate.agentTokens} agent
				</div>
				<div class="col-span-2 sm:col-span-3">
					<span class="block text-xs text-[var(--sk-faint)]">AI estimated spend</span>
					${data.aiSpend.usedUsd.toFixed(4)} / ${data.aiSpend.budgetUsd.toFixed(2)} monthly backstop
				</div>
			</div>
		</div>
	</AppCard>

	<AppCard>
		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-between gap-3">
				<h2 class="text-lg font-semibold">Recent errors</h2>
				<StatusPill tone={data.unresolvedErrors > 0 ? 'error' : 'success'}>
					{data.unresolvedErrors} unresolved
				</StatusPill>
			</div>
			{#if data.errors.length === 0}
				<p class="text-sm text-[var(--sk-muted)]">No application errors recorded.</p>
			{:else}
				<ul class="flex flex-col divide-y divide-[var(--sk-line)]">
					{#each data.errors as item (item.id)}
						<li class="flex flex-col gap-2 py-3">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<div class="flex flex-wrap items-center gap-2">
									<code class="text-xs font-semibold">{item.id}</code>
									<StatusPill tone={item.resolvedAt ? 'neutral' : 'error'}>
										{item.resolvedAt ? 'resolved' : `${item.status ?? 500}`}
									</StatusPill>
									<span class="text-xs text-[var(--sk-faint)]">
										{new Date(item.createdAt).toLocaleString()}
									</span>
								</div>
								{#if !item.resolvedAt}
									<form method="POST" action="?/resolveError" use:enhance>
										<input type="hidden" name="errorId" value={item.id} />
										<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm">Resolve</button>
									</form>
								{/if}
							</div>
							<p class="text-sm font-medium">{item.errorName}: {item.message}</p>
							<p class="sk-mono text-[10.5px] text-[var(--sk-faint)]">
								{item.method ?? '—'}
								{item.route ?? '—'} · source {item.source}
								{item.userId ? ` · user ${item.userId}` : ''}
								{item.siteId ? ` · site ${item.siteId}` : ''}
							</p>
							{#if item.stack}
								<details>
									<summary class="cursor-pointer text-xs text-[var(--sk-muted)]"
										>Stack trace</summary
									>
									<pre
										class="mt-2 max-h-48 overflow-auto bg-[#171614]/5 p-3 text-[10px] whitespace-pre-wrap">{item.stack}</pre>
								</details>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</AppCard>

	{#each groups as group (group)}
		<AppCard>
			<div class="flex flex-col gap-4">
				<h2 class="sk-display text-3xl leading-none">{group}</h2>
				{#each data.settings.filter((s) => s.group === group) as setting (setting.key)}
					<div
						class="flex flex-col gap-2 border-t border-[var(--sk-line)] pt-4 first:border-t-0 first:pt-0"
					>
						<div class="flex items-baseline justify-between gap-2">
							<label for={setting.key} class="text-sm font-medium">{setting.label}</label>
							<span class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
								{setting.key}
								{#if setting.source}
									· {setting.source}
								{/if}
							</span>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<form method="POST" action="?/save" use:enhance class="flex flex-1 gap-2">
								<input type="hidden" name="key" value={setting.key} />
								<input
									id={setting.key}
									name="value"
									type={setting.secret ? 'password' : 'text'}
									class="sk-input min-h-8 flex-1 py-1.5 font-[var(--font-mono)] text-xs"
									placeholder={setting.display || 'not set'}
									autocomplete="off"
								/>
								<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">Save</button>
							</form>
							{#if setting.source === 'db'}
								<form method="POST" action="?/clear" use:enhance>
									<input type="hidden" name="key" value={setting.key} />
									<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
										Clear
									</button>
								</form>
							{/if}
						</div>
						{#if setting.help}
							<p class="text-xs leading-5 text-[var(--sk-faint)]">{setting.help}</p>
						{/if}
					</div>
				{/each}
			</div>
		</AppCard>
	{/each}
</PageShell>
