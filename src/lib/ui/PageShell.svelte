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

	const t = getTranslate();
	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);
	const currentPath = $derived(page.url.pathname);

	const userItems = $derived(
		[
			{ href: '/dashboard', label: t('dashboard.title'), icon: uiIcons.home(16) },
			{ href: '/new', label: t('dashboard.nav.newSite'), icon: uiIcons.plus(16) },
			{ href: '/account', label: t('dashboard.nav.account'), icon: uiIcons.lock(16) },
			{ href: '/account/support', label: t('account.supportLink'), icon: uiIcons.message(16) },
			...(page.data.user?.isAdmin
				? [{ href: '/admin', label: t('dashboard.nav.admin'), icon: uiIcons.settings(16) }]
				: [])
		].map((item) => ({ ...item, active: currentPath === item.href || currentPath.startsWith(`${item.href}/`) })) as PanelNavItem[]
	);
</script>

<PanelShell
	{children}
	{title}
	{description}
	{backHref}
	{backLabel}
	{max}
	{canvasMax}
	{canvasLabel}
	{actions}
	items={userItems}
	sidebarLabel={locale === 'tr' ? 'Kullanıcı paneli' : locale === 'de' ? 'Benutzerbereich' : 'User panel'}
	sidebarPosition="right"
	storageKey="saaskaya.user.sidebar"
/>
