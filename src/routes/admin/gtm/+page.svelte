<script lang="ts">
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data } = $props();
	const t = getTranslate();

	const pct = (value: number | null) => (value === null ? '—' : `${value.toFixed(1)}%`);
	const categoryTone = (category: string) =>
		category === 'hot_lead'
			? 'success'
			: category === 'compliance_sensitive'
				? 'warning'
				: 'neutral';
</script>

<svelte:head>
	<title>GTM · saaskaya admin</title>
</svelte:head>

<AdminShell title="GTM" description={t('admin.gtm.description')} active="/admin/gtm">
	<section class="grid gap-3 md:grid-cols-4">
		<AppCard class="p-4">
			<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{t('admin.gtm.starts')}</span>
			<strong class="sk-display mt-1 block text-4xl leading-none">{data.funnel.starts}</strong>
			<span class="mt-1 block text-xs text-[var(--sk-faint)]">{t('admin.gtm.last7Days')}</span>
		</AppCard>
		<AppCard class="p-4">
			<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{t('admin.gtm.completed')}</span>
			<strong class="sk-display mt-1 block text-4xl leading-none">{data.funnel.completed}</strong>
			<span class="mt-1 block text-xs text-[var(--sk-faint)]">{pct(data.funnel.completionPct)}</span
			>
		</AppCard>
		<AppCard class="p-4">
			<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{t('admin.gtm.preview')}</span>
			<strong class="sk-display mt-1 block text-4xl leading-none">{data.funnel.generated}</strong>
			<span class="mt-1 block text-xs text-[var(--sk-faint)]"
				>{pct(data.funnel.previewReachPct)}</span
			>
		</AppCard>
		<AppCard class="p-4">
			<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{t('admin.gtm.editor')}</span>
			<strong class="sk-display mt-1 block text-4xl leading-none">{data.funnel.editorOpened}</strong
			>
			<span class="mt-1 block text-xs text-[var(--sk-faint)]">{pct(data.funnel.editorOpenPct)}</span
			>
		</AppCard>
	</section>

	<section class="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
		<AppCard class="p-4">
			<div class="flex flex-col gap-3">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 class="text-base font-semibold">{t('admin.gtm.sources')}</h2>
						<p class="mt-1 text-xs text-[var(--sk-muted)]">
							Use links like <code
								>/new?profession=psych&utm_source=linkedin&utm_campaign=gtm-30</code
							>.
						</p>
					</div>
					<StatusPill>{t('admin.gtm.sourceCount', { count: data.sourceRows.length })}</StatusPill>
				</div>

				{#if data.sourceRows.length === 0}
					<p class="text-sm text-[var(--sk-muted)]">{t('admin.gtm.noSources')}</p>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full min-w-[680px] text-left text-sm">
							<thead class="border-b border-[var(--sk-line)] text-xs text-[var(--sk-faint)]">
								<tr>
									<th class="py-2 pr-3 font-medium">{t('admin.gtm.source')}</th>
									<th class="px-3 py-2 font-medium">{t('admin.gtm.start')}</th>
									<th class="px-3 py-2 font-medium">{t('admin.gtm.complete')}</th>
									<th class="px-3 py-2 font-medium">{t('admin.gtm.preview')}</th>
									<th class="px-3 py-2 font-medium">{t('admin.gtm.editor')}</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-[var(--sk-line)]">
								{#each data.sourceRows as row (row.source)}
									<tr>
										<td class="max-w-[280px] truncate py-3 pr-3 font-medium">{row.source}</td>
										<td class="px-3 py-3">{row.starts}</td>
										<td class="px-3 py-3"
											>{row.completed}
											<span class="text-xs text-[var(--sk-faint)]">{pct(row.completionPct)}</span
											></td
										>
										<td class="px-3 py-3"
											>{row.generated}
											<span class="text-xs text-[var(--sk-faint)]">{pct(row.previewPct)}</span></td
										>
										<td class="px-3 py-3"
											>{row.editorOpened}
											<span class="text-xs text-[var(--sk-faint)]">{pct(row.editorOpenPct)}</span
											></td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</AppCard>

		<AppCard class="p-4">
			<div class="flex flex-col gap-3">
				<div>
					<h2 class="text-base font-semibold">{t('admin.gtm.leadTriage')}</h2>
					<p class="mt-1 text-xs text-[var(--sk-muted)]">
						{t('admin.gtm.triageHelp')}
					</p>
				</div>
				<div class="grid grid-cols-3 gap-2 text-sm">
					<div class="rounded-[8px] border border-[var(--sk-line)] p-3">
						<span class="block text-xs text-[var(--sk-faint)]">{t('admin.gtm.hot')}</span>
						<strong class="text-xl">{data.categoryCounts.hot_lead ?? 0}</strong>
					</div>
					<div class="rounded-[8px] border border-[var(--sk-line)] p-3">
						<span class="block text-xs text-[var(--sk-faint)]">{t('admin.gtm.beta')}</span>
						<strong class="text-xl">{data.categoryCounts.beta_candidate ?? 0}</strong>
					</div>
					<div class="rounded-[8px] border border-[var(--sk-line)] p-3">
						<span class="block text-xs text-[var(--sk-faint)]">{t('admin.gtm.review')}</span>
						<strong class="text-xl">{data.categoryCounts.compliance_sensitive ?? 0}</strong>
					</div>
				</div>

				{#if data.triaged.length === 0}
					<p class="text-sm text-[var(--sk-muted)]">{t('admin.gtm.noLeads')}</p>
				{:else}
					<ul class="max-h-[520px] divide-y divide-[var(--sk-line)] overflow-auto">
						{#each data.triaged as item (item.inquiry.id)}
							<li class="py-3">
								<div class="flex flex-wrap items-center justify-between gap-2">
									<a href={`/admin/inbox/${item.inquiry.id}`} class="sk-link font-medium">
										{item.inquiry.name}
									</a>
									<div class="flex items-center gap-2">
										<StatusPill tone={categoryTone(item.triage.category)}>
											{item.triage.category}
										</StatusPill>
										<span class="sk-mono text-[10px] text-[var(--sk-faint)]">
											{item.triage.score}
										</span>
									</div>
								</div>
								<p class="mt-1 text-xs text-[var(--sk-faint)]">{item.inquiry.email}</p>
								<p class="mt-2 line-clamp-2 text-sm leading-6 text-[var(--sk-muted)]">
									{item.message}
								</p>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</AppCard>
	</section>
</AdminShell>
