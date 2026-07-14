<script lang="ts">
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data } = $props();

	const t = getTranslate();
</script>

<svelte:head>
	<title>{t('dashboard.messages.title')} · {data.siteName} · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/dashboard"
	backLabel="dashboard"
	title={t('dashboard.messages.title')}
	description={t('dashboard.messages.description', { name: data.siteName })}
	max="max-w-5xl"
	canvasLabel="saaskaya.app / messages"
>
	{#if data.submissions.length === 0}
		<AppCard>
			<p class="text-center text-[var(--sk-muted)]">{t('dashboard.messages.empty')}</p>
		</AppCard>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each data.submissions as msg (msg.id)}
				<li class="sk-shell p-5">
					<div class="flex flex-col gap-3">
						<div class="flex flex-wrap items-start justify-between gap-2">
							<span class="font-semibold">{msg.name}</span>
							<span class="font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]">
								{new Date(msg.createdAt).toLocaleString()} · {msg.locale.toUpperCase()}
							</span>
						</div>
						<a href="mailto:{msg.email}" class="sk-link text-sm text-[var(--sk-muted)]">
							{msg.email}
						</a>
						<p class="text-sm leading-6 whitespace-pre-line">{msg.message}</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</PageShell>
