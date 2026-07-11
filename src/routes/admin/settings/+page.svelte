<script lang="ts">
	import { enhance } from '$app/forms';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data, form } = $props();

	const groups = ['AI', 'AI Providers', 'Email', 'Billing', 'Domains', 'Media', 'Ops'] as const;
	const groupMeta = {
		AI: { label: 'AI', detail: 'Budgets, models and quota controls' },
		'AI Providers': { label: 'Providers', detail: 'Groq, DeepSeek and fallback keys' },
		Email: { label: 'Email', detail: 'SMTP, Resend and sender identity' },
		Billing: { label: 'Billing', detail: 'Subscriptions and checkout providers' },
		Domains: { label: 'Domains', detail: 'Reservation, pricing and registrar settings' },
		Media: { label: 'Media', detail: 'R2 and upload infrastructure' },
		Ops: { label: 'Ops', detail: 'Monitoring, beta gates and cron controls' }
	} as const;

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

	function settingsFor(group: (typeof groups)[number]) {
		return data.settings.filter((s) => s.group === group);
	}

	function groupSummary(group: (typeof groups)[number]) {
		const settings = settingsFor(group);
		const db = settings.filter((s) => s.source === 'db').length;
		const env = settings.filter((s) => s.source === 'env').length;
		return `${settings.length} settings · ${db} db · ${env} env`;
	}

	const requestProbeTotal = $derived(
		data.requestProbes.reduce((total, probe) => total + probe.count, 0)
	);
</script>

<svelte:head>
	<title>Settings · saaskaya admin</title>
</svelte:head>

<AdminShell
	title="Settings"
	description="Credentials, runtime settings and diagnostics. Saved values override .env."
	active="/admin/settings"
>
	{#if form?.saved}
		<div class="sk-alert sk-alert-success">Saved <code>{form.saved}</code>.</div>
	{:else if form?.cleared}
		<div class="sk-alert">Cleared <code>{form.cleared}</code> (env fallback applies).</div>
	{:else if form?.paymentConfirmed}
		<div class="sk-alert sk-alert-success">
			Confirmed <code>{form.paymentConfirmed}</code> — cron or manual fulfill can complete it.
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

	<section class="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
		<AppCard class="p-4" id="system">
			<div class="flex flex-col gap-4">
				<div class="flex items-center justify-between gap-3">
					<div>
						<h2 class="text-base font-semibold">System status</h2>
						<p class="mt-1 text-xs text-[var(--sk-muted)]">Runtime, database and AI backstop.</p>
					</div>
					<StatusPill tone={data.health.ok ? 'success' : 'error'}>
						{data.health.ok ? 'healthy' : 'degraded'}
					</StatusPill>
				</div>
				<div class="grid grid-cols-2 gap-x-5 gap-y-3 text-sm md:grid-cols-4">
					<div>
						<span class="block text-xs text-[var(--sk-faint)]">Database</span>
						{data.health.checks.db} · {formatBytes(data.ops.dbSizeBytes)}
					</div>
					<div>
						<span class="block text-xs text-[var(--sk-faint)]">Disk</span>
						{data.health.checks.disk}
					</div>
					<div>
						<span class="block text-xs text-[var(--sk-faint)]">Uptime</span>
						{formatUptime(data.ops.uptimeSeconds)}
					</div>
					<div>
						<span class="block text-xs text-[var(--sk-faint)]">Sites / users</span>
						{data.ops.counts.sites} / {data.ops.counts.users}
					</div>
					<div class="col-span-2">
						<span class="block text-xs text-[var(--sk-faint)]">AI estimated spend</span>
						${data.aiSpend.usedUsd.toFixed(4)} / ${data.aiSpend.budgetUsd.toFixed(2)}
					</div>
					<div class="col-span-2">
						<span class="block text-xs text-[var(--sk-faint)]">AI gate this month</span>
						{data.gate.blocked} blocked · {data.gate.agentRuns} agent runs · {data.gate
							.approved}/{data.gate.proposed} approved
					</div>
				</div>
			</div>
		</AppCard>

		<AppCard class="p-4">
			<div class="flex flex-col gap-4">
				<div class="flex items-center justify-between gap-3">
					<div>
						<h2 class="text-base font-semibold">Domain payments</h2>
						<p class="mt-1 text-xs text-[var(--sk-muted)]">Pending reservation fulfillment.</p>
					</div>
					<StatusPill tone={data.pending.length > 0 ? 'warning' : 'success'}>
						{data.pending.length} pending
					</StatusPill>
				</div>
				{#if data.pending.length === 0}
					<p class="text-sm text-[var(--sk-muted)]">No pending payment actions.</p>
				{:else}
					<ul class="flex max-h-72 flex-col divide-y divide-[var(--sk-line)] overflow-auto">
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
										</div>
										<p class="text-xs text-[var(--sk-faint)]">
											{res.paymentMethod} · {res.priceEur}€ · {res.id}
										</p>
									</div>
									<div class="flex flex-wrap gap-2">
										{#if res.status === 'pending'}
											<form method="POST" action="?/confirmPayment" use:enhance>
												<input type="hidden" name="reservationId" value={res.id} />
												<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm"
													>Confirm</button
												>
											</form>
											<form method="POST" action="?/rejectPayment" use:enhance>
												<input type="hidden" name="reservationId" value={res.id} />
												<button type="submit" class="sk-btn sk-btn-ghost sk-btn-danger sk-btn-sm">
													Reject
												</button>
											</form>
										{:else if res.status === 'paid' || res.status === 'failed'}
											<form method="POST" action="?/fulfillReservation" use:enhance>
												<input type="hidden" name="reservationId" value={res.id} />
												<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
													{res.status === 'failed' ? 'Retry' : 'Fulfill'}
												</button>
											</form>
										{/if}
									</div>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</AppCard>
	</section>

	<section class="grid gap-4 xl:grid-cols-[188px_1fr]">
		<aside class="xl:sticky xl:top-4 xl:self-start">
			<AppCard class="p-2">
				<nav
					class="flex gap-1 overflow-x-auto xl:flex-col xl:overflow-visible"
					aria-label="Settings groups"
				>
					{#each groups as group (group)}
						<a
							href="#{group.toLowerCase().replaceAll(' ', '-')}"
							class="flex min-w-36 justify-between rounded-[8px] px-3 py-2 text-sm text-[var(--sk-muted)] hover:bg-[rgb(23_22_20_/_0.05)] hover:text-[var(--sk-ink)] xl:min-w-0"
						>
							<span class="font-medium">{groupMeta[group].label}</span>
							<span class="sk-mono text-[8.5px] opacity-60">{settingsFor(group).length}</span>
						</a>
					{/each}
					<a
						href="#errors"
						class="flex min-w-36 justify-between rounded-[8px] px-3 py-2 text-sm text-[var(--sk-muted)] hover:bg-[rgb(23_22_20_/_0.05)] hover:text-[var(--sk-ink)] xl:min-w-0"
					>
						<span class="font-medium">Errors</span>
						<span class="sk-mono text-[8.5px] opacity-60">{data.unresolvedErrors}</span>
					</a>
					<a
						href="#request-probes"
						class="flex min-w-36 justify-between rounded-[8px] px-3 py-2 text-sm text-[var(--sk-muted)] hover:bg-[rgb(23_22_20_/_0.05)] hover:text-[var(--sk-ink)] xl:min-w-0"
					>
						<span class="font-medium">Probes</span>
						<span class="sk-mono text-[8.5px] opacity-60">{data.requestProbes.length}</span>
					</a>
				</nav>
			</AppCard>
		</aside>

		<div class="flex min-w-0 flex-col gap-3">
			{#each groups as group (group)}
				<AppCard class="p-0" id={group.toLowerCase().replaceAll(' ', '-')}>
					<details class="group" open={group === 'Ops'}>
						<summary
							class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
						>
							<span>
								<span class="block text-sm font-semibold">{groupMeta[group].label}</span>
								<span class="mt-0.5 block text-xs text-[var(--sk-faint)]">
									{groupMeta[group].detail} · {groupSummary(group)}
								</span>
							</span>
							<span class="sk-btn sk-btn-secondary sk-btn-sm">Open</span>
						</summary>
						<div class="border-t border-[var(--sk-line)]">
							{#each settingsFor(group) as setting (setting.key)}
								<div
									class="grid gap-3 border-b border-[var(--sk-line)] px-4 py-3 last:border-b-0 lg:grid-cols-[minmax(220px,0.75fr)_1.25fr]"
								>
									<div class="min-w-0">
										<label for={setting.key} class="text-sm font-medium">{setting.label}</label>
										<p class="sk-mono mt-1 break-all text-[10px] text-[var(--sk-faint)]">
											{setting.key}{#if setting.source}
												· {setting.source}{/if}
										</p>
										{#if setting.help}
											<p class="mt-1 text-xs leading-5 text-[var(--sk-faint)]">{setting.help}</p>
										{/if}
									</div>
									<div class="flex min-w-0 flex-wrap items-start gap-2">
										<form
											method="POST"
											action="?/save"
											use:enhance
											class="flex min-w-0 flex-1 gap-2"
										>
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
								</div>
							{/each}
						</div>
					</details>
				</AppCard>
			{/each}

			<AppCard class="p-0" id="errors">
				<details open>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
					>
						<span>
							<span class="block text-sm font-semibold">Recent errors</span>
							<span class="mt-0.5 block text-xs text-[var(--sk-faint)]">
								{data.unresolvedErrors} unresolved · newest first
							</span>
						</span>
						<StatusPill tone={data.unresolvedErrors > 0 ? 'error' : 'success'}>
							{data.unresolvedErrors} unresolved
						</StatusPill>
					</summary>
					<div class="border-t border-[var(--sk-line)] px-4 py-3">
						{#if data.errors.length === 0}
							<p class="text-sm text-[var(--sk-muted)]">No application errors recorded.</p>
						{:else}
							<ul
								class="flex max-h-[34rem] flex-col divide-y divide-[var(--sk-line)] overflow-auto"
							>
								{#each data.errors as item (item.id)}
									<li class="grid gap-2 py-3 text-sm lg:grid-cols-[1fr_auto]">
										<div class="min-w-0">
											<div class="flex flex-wrap items-center gap-2">
												<code class="text-xs font-semibold">{item.id}</code>
												<StatusPill tone={item.resolvedAt ? 'neutral' : 'error'}>
													{item.resolvedAt ? 'resolved' : `${item.status ?? 500}`}
												</StatusPill>
												<span class="text-xs text-[var(--sk-faint)]">
													{new Date(item.createdAt).toLocaleString()}
												</span>
											</div>
											<p class="mt-1 truncate font-medium">{item.errorName}: {item.message}</p>
											<p class="sk-mono mt-1 truncate text-[10px] text-[var(--sk-faint)]">
												{item.method ?? '—'}
												{item.route ?? '—'} · {item.source}
												{item.userId ? ` · user ${item.userId}` : ''}
												{item.siteId ? ` · site ${item.siteId}` : ''}
											</p>
											{#if item.stack}
												<details class="mt-2">
													<summary class="cursor-pointer text-xs text-[var(--sk-muted)]">
														Stack trace
													</summary>
													<pre
														class="mt-2 max-h-48 overflow-auto rounded bg-[#171614]/5 p-3 text-[10px] whitespace-pre-wrap">{item.stack}</pre>
												</details>
											{/if}
										</div>
										{#if !item.resolvedAt}
											<form method="POST" action="?/resolveError" use:enhance>
												<input type="hidden" name="errorId" value={item.id} />
												<button type="submit" class="sk-btn sk-btn-secondary sk-btn-sm">
													Resolve
												</button>
											</form>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</details>
			</AppCard>

			<AppCard class="p-0" id="request-probes">
				<details open>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
					>
						<span>
							<span class="block text-sm font-semibold">Request probes</span>
							<span class="mt-0.5 block text-xs text-[var(--sk-faint)]">
								404 scanner and missing-route telemetry · aggregate only
							</span>
						</span>
						<StatusPill tone={requestProbeTotal > 0 ? 'warning' : 'success'}>
							{requestProbeTotal} requests
						</StatusPill>
					</summary>
					<div class="border-t border-[var(--sk-line)] px-4 py-3">
						{#if data.requestProbes.length === 0}
							<p class="text-sm text-[var(--sk-muted)]">No request probes recorded.</p>
						{:else}
							<ul
								class="flex max-h-[28rem] flex-col divide-y divide-[var(--sk-line)] overflow-auto"
							>
								{#each data.requestProbes as probe (probe.pattern)}
									<li class="grid gap-2 py-3 text-sm lg:grid-cols-[1fr_auto]">
										<div class="min-w-0">
											<div class="flex flex-wrap items-center gap-2">
												<code class="text-xs font-semibold">{probe.pattern}</code>
												<StatusPill tone="warning">{probe.status}</StatusPill>
												<span class="text-xs text-[var(--sk-faint)]">
													last {new Date(probe.lastSeenAt).toLocaleString()}
												</span>
											</div>
											<p class="sk-mono mt-1 truncate text-[10px] text-[var(--sk-faint)]">
												{probe.samplePath}
											</p>
											<p class="sk-mono mt-1 truncate text-[10px] text-[var(--sk-faint)]">
												first {new Date(probe.firstSeenAt).toLocaleString()}
												{probe.lastUserAgentHash ? ` · ua ${probe.lastUserAgentHash}` : ''}
												{probe.lastIpPrefixHash ? ` · ip ${probe.lastIpPrefixHash}` : ''}
											</p>
										</div>
										<div class="sk-mono text-right text-xs font-semibold">
											{probe.count} hits
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</details>
			</AppCard>
		</div>
	</section>
</AdminShell>
