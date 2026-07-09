<script lang="ts">
	import PageShell from './PageShell.svelte';

	let {
		children,
		title,
		kicker = 'Yasal',
		updated = '9 Temmuz 2026'
	}: {
		children: import('svelte').Snippet;
		title: string;
		kicker?: string;
		updated?: string;
	} = $props();
</script>

<svelte:head>
	<title>{title} · saaskaya</title>
	<meta name="robots" content="index,follow" />
</svelte:head>

<PageShell
	backHref="/"
	backLabel="← Ana sayfa"
	{kicker}
	{title}
	description={`Son güncelleme: ${updated}`}
	max="max-w-3xl"
	canvasLabel="saaskaya.com / legal"
>
	<div class="sk-legal">
		{@render children()}
	</div>
</PageShell>

<style>
	.sk-legal :global(h2) {
		margin-top: 2rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--sk-ink);
	}
	.sk-legal :global(h3) {
		margin-top: 1.25rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--sk-ink);
	}
	.sk-legal :global(p) {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.65;
		color: var(--sk-muted);
	}
	.sk-legal :global(ul) {
		margin-top: 0.5rem;
		padding-left: 1.25rem;
	}
	.sk-legal :global(li) {
		margin-top: 0.35rem;
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--sk-muted);
	}
	.sk-legal :global(a) {
		color: var(--sk-ink);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.sk-legal :global(.sk-callout) {
		margin-top: 1rem;
		border: 1px solid var(--sk-line);
		border-radius: 10px;
		background: var(--sk-shell);
		padding: 0.75rem 1rem;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: var(--sk-muted);
	}
	.sk-legal :global(.sk-callout strong) {
		color: var(--sk-ink);
	}
</style>
