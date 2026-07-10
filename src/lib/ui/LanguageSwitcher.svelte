<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { LOCALES, localeNames, stripLocale, withLocale, type Locale } from '$lib/i18n';
	import { flagSvgs } from '$lib/ui/flags';

	let { locale }: { locale: Locale } = $props();

	const currentPath = $derived(stripLocale(page.url.pathname) + page.url.search);

	function onLocaleClick(event: MouseEvent, target: Locale) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
			return;
		event.preventDefault();
		goto(withLocale(target, currentPath), { invalidateAll: true });
	}
</script>

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
