<script lang="ts">
	import { page } from '$app/state';
	import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';
	import { getTranslate } from '$lib/i18n/context';
	import PanelShell from './PanelShell.svelte';
	import { uiIcons } from './icons';
	import type { PanelNavItem } from './PanelSidebar.svelte';

	let {
		children,
		kicker: _kicker,
		title,
		description,
		backHref,
		backLabel = 'saaskaya',
		canvasLabel = 'saaskaya.app',
		actions
	} = $props<{
		children: import('svelte').Snippet;
		kicker?: string;
		title: string;
		description?: string;
		backHref?: string;
		backLabel?: string;
		canvasLabel?: string;
		actions?: import('svelte').Snippet;
	}>();

	const t = getTranslate();
	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);
	const currentPath = $derived(page.url.pathname);
	const logoUrl = $derived(page.data.platformBranding?.logoUrl ?? '/logo.svg');
	const brandName = $derived(page.data.platformBranding?.brandName ?? 'saaskaya');
	const showWordmark = $derived(page.data.platformBranding?.showWordmark ?? true);

	const userItems = $derived(
		[
			{ href: '/dashboard', label: t('dashboard.title'), icon: uiIcons.home },
			{ href: '/new', label: t('dashboard.nav.newSite'), icon: uiIcons.plus },
			{ href: '/account', label: t('dashboard.nav.account'), icon: uiIcons.user },
			{ href: '/account/support', label: t('account.supportLink'), icon: uiIcons.message },
			...(page.data.user?.isAdmin
				? [{ href: '/admin', label: t('dashboard.nav.admin'), icon: uiIcons.settings }]
				: [])
		].map((item) => ({
			...item,
			active: currentPath === item.href || currentPath.startsWith(`${item.href}/`)
		})) as PanelNavItem[]
	);
</script>

{#snippet brand()}
	<a
		href="/dashboard"
		class="panel-sidebar-brand flex min-w-0 items-center gap-2 text-[var(--sk-ink)]"
	>
		<span
			class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#171614]"
		>
			<img src={logoUrl} alt="saaskaya" class="size-full object-contain" />
		</span>
		{#if showWordmark}
			<span class="panel-sidebar-brand-copy min-w-0">
				<span class="block truncate text-sm font-semibold leading-none">{brandName}</span>
				<span class="sk-mono mt-1 block text-[9px] text-[var(--sk-faint)]">
					{locale === 'tr' ? 'çalışma alanı' : locale === 'de' ? 'Arbeitsbereich' : 'workspace'}
				</span>
			</span>
		{/if}
	</a>
{/snippet}

<PanelShell
	{children}
	{title}
	{description}
	{backHref}
	{backLabel}
	max="max-w-7xl"
	canvasMax="max-w-[92rem]"
	{canvasLabel}
	{actions}
	items={userItems}
	sidebarLabel={locale === 'tr'
		? 'Kullanıcı paneli'
		: locale === 'de'
			? 'Benutzerbereich'
			: 'User panel'}
	sidebarPosition="right"
	storageKey="saaskaya.user.sidebar.v2"
	{brand}
/>
