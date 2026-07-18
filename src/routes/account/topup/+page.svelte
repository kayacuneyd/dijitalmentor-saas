<script lang="ts">
	import AppCard from '$lib/ui/AppCard.svelte';
	import PageShell from '$lib/ui/PageShell.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data } = $props();
	const t = getTranslate();
</script>

<svelte:head>
	<title>{t('account.topup.title')} · saaskaya</title>
</svelte:head>

<PageShell
	backHref="/account"
	backLabel={t('account.profile.title')}
	title={t('account.topup.title')}
	description={t('account.topup.description')}
	canvasLabel="saaskaya.app / top-up"
>
	<section class="mx-auto grid w-full max-w-2xl gap-4">
		<AppCard class="p-5 sm:p-7">
			<div class="flex flex-col gap-5">
				<div>
					<p class="sk-mono text-[10px] text-[var(--sk-faint)]">{t('account.topup.eyebrow')}</p>
					<h2 class="mt-2 font-[var(--font-display)] text-3xl leading-tight">
						{t('account.topup.packTitle')}
					</h2>
					<p class="mt-2 max-w-prose text-sm leading-6 text-[var(--sk-muted)]">
						{t('account.topup.packDescription')}
					</p>
				</div>
				<dl class="grid gap-3 border-y border-[var(--sk-line)] py-4 text-sm sm:grid-cols-2">
					<div>
						<dt class="text-[var(--sk-faint)]">{t('account.topup.edits')}</dt>
						<dd class="mt-1 text-lg font-semibold">10</dd>
					</div>
					<div>
						<dt class="text-[var(--sk-faint)]">{t('account.topup.generations')}</dt>
						<dd class="mt-1 text-lg font-semibold">1</dd>
					</div>
				</dl>
				{#if data.configured}
					<form method="POST" action="/api/billing/topup">
						<FlowbiteButton type="submit" variant="primary"
							>{t('account.topup.continue')}</FlowbiteButton
						>
					</form>
				{:else}
					<div
						class="rounded-[var(--sk-radius-sm)] border border-[var(--sk-line)] bg-[var(--sk-shell)] p-3 text-sm text-[var(--sk-muted)]"
					>
						{t('account.topup.unavailable')}
					</div>
				{/if}
			</div>
		</AppCard>
		<p class="text-center text-xs leading-5 text-[var(--sk-faint)]">{t('account.topup.note')}</p>
	</section>
</PageShell>
