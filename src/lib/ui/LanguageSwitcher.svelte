<script lang="ts">
	import { afterNavigate, goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { isLocale, LOCALES, localeNames, stripLocale, withLocale, type Locale } from '$lib/i18n';
	import { flagSvgs } from '$lib/ui/flags';
	import { AngleDownOutline } from 'flowbite-svelte-icons';
	type PublicLocaleOption = { code: string; name: string };

	let {
		locale,
		publicLocale = locale,
		variant = 'pills'
	}: {
		locale: Locale;
		publicLocale?: string;
		variant?: 'pills' | 'dropdown' | 'cookie';
	} = $props();
	const publicLocales: PublicLocaleOption[] = $derived(
		variant === 'cookie'
			? LOCALES.map((code) => ({ code, name: localeNames[code] }))
			: page.data.publicLocales?.length
				? page.data.publicLocales
				: LOCALES.map((code) => ({ code, name: localeNames[code] }))
	);

	const currentPath = $derived(stripLocale(page.url.pathname) + page.url.search);

	let dropdownEl: HTMLDetailsElement | undefined = $state();

	/** Authenticated chrome (dashboard/editor/admin/account) never gets a
	 *  locale-prefixed URL — no SEO/crawl benefit there, and prefixing would
	 *  double every route and break existing bookmarks/deep links for zero
	 *  product gain. The switch is cookie-only + `invalidateAll`. */
	async function setCookieLocale(target: Locale) {
		await fetch('/api/locale', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ locale: target })
		});
		await invalidateAll();
	}

	function onLocaleClick(event: MouseEvent, target: string) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
			return;
		event.preventDefault();
		dropdownEl?.removeAttribute('open');
		if (variant === 'cookie') {
			if (isLocale(target)) void setCookieLocale(target);
			return;
		}
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

{#if variant === 'dropdown' || variant === 'cookie'}
	<details class="sk-lang-dropdown" bind:this={dropdownEl}>
		<summary
			class="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[9px] border border-[var(--sk-line)] bg-[rgb(251_250_247/.68)] px-2.5 py-1.5 font-[var(--font-mono)] text-[11px] text-[var(--sk-ink)]"
			aria-label={publicLocales.find((item) => item.code === publicLocale)?.name ?? publicLocale}
		>
			{#if isLocale(publicLocale)}{@html flagSvgs[publicLocale]}{/if}
			<span>{publicLocale.toUpperCase()}</span>
			<AngleDownOutline size="xs" />
		</summary>
		<nav class="sk-lang-menu" aria-label="Language">
			{#each publicLocales as item (item.code)}
				<a
					href={variant === 'cookie' ? currentPath : withLocale(item.code, currentPath)}
					onclick={(event) => onLocaleClick(event, item.code)}
					class="flex min-h-11 items-center gap-2.5 px-3 text-sm transition {item.code ===
					publicLocale
						? 'bg-[rgba(47,111,106,.12)] font-medium text-[var(--sk-ink)]'
						: 'text-[var(--sk-muted)] hover:bg-[rgba(23,22,20,.06)] hover:text-[var(--sk-ink)]'}"
					aria-current={item.code === publicLocale ? 'true' : undefined}
				>
					{#if isLocale(item.code)}{@html flagSvgs[item.code]}{/if}
					<span>{item.name}</span>
				</a>
			{/each}
		</nav>
	</details>
{:else}
	<nav class="flex items-center gap-1" aria-label="Language">
		{#each publicLocales as item (item.code)}
			<a
				href={withLocale(item.code, currentPath)}
				onclick={(event) => onLocaleClick(event, item.code)}
				class="inline-flex items-center gap-1.5 rounded border px-2 py-1 font-[var(--font-mono)] text-[10.5px] transition {item.code ===
				publicLocale
					? 'border-[rgba(47,111,106,.24)] bg-[rgba(47,111,106,.12)] text-[var(--sk-ink)]'
					: 'border-transparent text-[var(--sk-faint)] hover:border-[var(--sk-line)] hover:bg-[rgba(23,22,20,.06)]'}"
				aria-current={item.code === publicLocale ? 'true' : undefined}
				title={item.name}
			>
				{#if isLocale(item.code)}{@html flagSvgs[item.code]}{/if}
				<span>{item.code.toUpperCase()}</span>
			</a>
		{/each}
	</nav>
{/if}
