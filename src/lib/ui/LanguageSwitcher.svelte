<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { LOCALES, localeNames, stripLocale, withLocale, type Locale } from '$lib/i18n';
	import { flagSvgs } from '$lib/ui/flags';

	let { locale, variant = 'pills' }: { locale: Locale; variant?: 'pills' | 'dropdown' } = $props();

	const currentPath = $derived(stripLocale(page.url.pathname) + page.url.search);

	let dropdownEl: HTMLDetailsElement | undefined = $state();

	function onLocaleClick(event: MouseEvent, target: Locale) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
			return;
		event.preventDefault();
		dropdownEl?.removeAttribute('open');
		goto(withLocale(target, currentPath), { invalidateAll: true });
	}

	$effect(() => {
		if (variant !== 'dropdown') return;
		const onPointerDown = (event: PointerEvent) => {
			if (dropdownEl?.open && event.target instanceof Node && !dropdownEl.contains(event.target)) {
				dropdownEl.removeAttribute('open');
			}
		};
		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	});

	afterNavigate(() => dropdownEl?.removeAttribute('open'));
</script>

{#if variant === 'dropdown'}
	<details class="sk-lang-dropdown" bind:this={dropdownEl}>
		<summary
			class="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[9px] border border-[var(--sk-line)] bg-[rgb(251_250_247/.68)] px-2.5 py-1.5 font-[var(--font-mono)] text-[11px] text-[var(--sk-ink)]"
			aria-label={localeNames[locale]}
		>
			{@html flagSvgs[locale]}
			<span>{locale.toUpperCase()}</span>
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				width="12"
				height="12"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg
			>
		</summary>
		<nav class="sk-lang-menu" aria-label="Language">
			{#each LOCALES as item (item)}
				<a
					href={withLocale(item, currentPath)}
					onclick={(event) => onLocaleClick(event, item)}
					class="flex min-h-11 items-center gap-2.5 px-3 text-sm transition {item === locale
						? 'bg-[rgba(47,111,106,.12)] font-medium text-[var(--sk-ink)]'
						: 'text-[var(--sk-muted)] hover:bg-[rgba(23,22,20,.06)] hover:text-[var(--sk-ink)]'}"
					aria-current={item === locale ? 'true' : undefined}
				>
					{@html flagSvgs[item]}
					<span>{localeNames[item]}</span>
				</a>
			{/each}
		</nav>
	</details>
{:else}
	<nav class="flex items-center gap-1" aria-label="Language">
		{#each LOCALES as item (item)}
			<a
				href={withLocale(item, currentPath)}
				onclick={(event) => onLocaleClick(event, item)}
				class="inline-flex items-center gap-1.5 rounded border px-2 py-1 font-[var(--font-mono)] text-[10.5px] transition {item ===
				locale
					? 'border-[rgba(47,111,106,.24)] bg-[rgba(47,111,106,.12)] text-[var(--sk-ink)]'
					: 'border-transparent text-[var(--sk-faint)] hover:border-[var(--sk-line)] hover:bg-[rgba(23,22,20,.06)]'}"
				aria-current={item === locale ? 'true' : undefined}
				title={localeNames[item]}
			>
				{@html flagSvgs[item]}
				<span>{item.toUpperCase()}</span>
			</a>
		{/each}
	</nav>
{/if}
