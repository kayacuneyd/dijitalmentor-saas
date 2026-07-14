<script lang="ts">
	import { page } from '$app/state';
	import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';
	import AppCanvasShell from './AppCanvasShell.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import { uiIcons } from './icons';

	let {
		children,
		kicker,
		title,
		description,
		backHref,
		backLabel = 'saaskaya',
		max = 'max-w-3xl',
		canvasMax = 'max-w-6xl',
		canvasLabel = 'saaskaya.app',
		actions
	} = $props<{
		children: import('svelte').Snippet;
		kicker?: string;
		title: string;
		description?: string;
		backHref?: string;
		backLabel?: string;
		max?: string;
		canvasMax?: string;
		canvasLabel?: string;
		actions?: import('svelte').Snippet;
	}>();

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);
</script>

{#snippet localeSwitcher()}
	<LanguageSwitcher {locale} variant="cookie" />
{/snippet}

<AppCanvasShell label={canvasLabel} max={canvasMax} right={localeSwitcher}>
	<div class="mx-auto flex w-full {max} flex-col gap-6">
		<header class="flex flex-wrap items-start justify-between gap-4">
			<div class="min-w-0">
				{#if backHref}
					<a
						href={backHref}
						class="sk-link inline-flex items-center gap-1.5 text-sm text-[var(--sk-faint)]"
						>{@html uiIcons.arrowLeft(14)}{backLabel}</a
					>
				{/if}
				{#if kicker}
					<div class="sk-mono mt-5 text-[10.5px] text-[var(--sk-faint)]">{kicker}</div>
				{/if}
				<h1 class="sk-display mt-2 text-4xl leading-none sm:text-[42px]">{title}</h1>
				{#if description}
					<p class="mt-3 max-w-2xl text-sm leading-6 text-[var(--sk-muted)] sm:text-[15px]">
						{description}
					</p>
				{/if}
			</div>
			{#if actions}
				<div class="flex flex-wrap justify-end gap-2">{@render actions()}</div>
			{/if}
		</header>

		{@render children()}
	</div>
</AppCanvasShell>
