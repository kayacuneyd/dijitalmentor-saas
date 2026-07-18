<script lang="ts">
	import { page } from '$app/state';
	import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';
	import { getTranslate } from '$lib/i18n/context';
	import PanelShell from './PanelShell.svelte';
	import { uiIcons } from './icons';
	import type { PanelNavItem } from './PanelSidebar.svelte';

	let {
		children,
		title,
		description,
		active = '/admin',
		actions,
		max = 'max-w-7xl'
	} = $props<{
		children: import('svelte').Snippet;
		title: string;
		description?: string;
		active?: string;
		actions?: import('svelte').Snippet;
		max?: string;
	}>();

	const t = getTranslate();
	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);
	const mascotUrl = $derived(page.data.platformBranding?.mascotUrl ?? '/mascot-bee.svg');
	const brandName = $derived(page.data.platformBranding?.brandName ?? 'saaskaya');
	const showWordmark = $derived(page.data.platformBranding?.showWordmark ?? true);

	const nav = $derived(
		[
			{ href: '/admin', label: t('admin.nav.overview'), eyebrow: 'Ops', icon: uiIcons.home },
			{
				href: '/admin/gtm',
				label: t('admin.nav.gtm'),
				eyebrow: 'Growth',
				icon: uiIcons.chart
			},
			{
				href: '/admin/customers',
				label: t('admin.nav.customers'),
				eyebrow: 'CRM',
				icon: uiIcons.user
			},
			{
				href: '/admin/inbox',
				label: t('admin.nav.inbox'),
				eyebrow: 'Public',
				icon: uiIcons.inbox
			},
			{
				href: '/admin/blog',
				label: t('admin.nav.blog'),
				eyebrow: 'Content',
				icon: uiIcons.file
			},
			{
				href: '/admin/copy',
				label: t('admin.nav.copy'),
				eyebrow: 'Content',
				icon: uiIcons.edit
			},
			{
				href: '/admin/messages',
				label: t('admin.nav.messages'),
				eyebrow: 'i18n',
				icon: uiIcons.message
			},
			{
				href: '/admin/share',
				label: t('admin.nav.share'),
				eyebrow: 'Growth',
				icon: uiIcons.share
			},
			{
				href: '/admin/support',
				label: t('admin.nav.support'),
				eyebrow: 'Help',
				icon: uiIcons.message
			},
			{
				href: '/admin/invites',
				label: t('admin.nav.invites'),
				eyebrow: 'Access',
				icon: uiIcons.plus
			},
			{
				href: '/admin/settings',
				label: t('admin.nav.settings'),
				eyebrow: 'System',
				icon: uiIcons.settings
			},
			{
				href: '/dashboard',
				label: t('admin.nav.dashboard'),
				eyebrow: t('admin.nav.exit'),
				icon: uiIcons.arrowLeft,
				dividerBefore: true
			}
		].map((item) => ({
			...item,
			active: active === item.href || (item.href !== '/admin' && active.startsWith(`${item.href}/`))
		})) as PanelNavItem[]
	);
</script>

{#snippet brand()}
	<a
		href="/dashboard"
		class="panel-sidebar-brand flex min-w-0 items-center gap-2 text-[var(--sk-ink)]"
	>
		<span
			class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--sk-line)] bg-[var(--sk-paper)]"
		>
			<img src={mascotUrl} alt="saaskaya arı maskotu" class="size-full object-contain" />
		</span>
		{#if showWordmark}
			<span class="panel-sidebar-brand-copy min-w-0">
				<span class="block truncate text-sm font-semibold leading-none">{brandName}</span>
				<span class="sk-mono mt-1 block text-[9px] text-[var(--sk-faint)]"
					>{t('admin.chrome.console')}</span
				>
			</span>
		{/if}
	</a>
{/snippet}

<PanelShell
	{children}
	{title}
	{description}
	{actions}
	{max}
	canvasMax="max-w-[92rem]"
	canvasLabel="saaskaya.app / admin"
	items={nav}
	sidebarLabel={t('admin.chrome.ariaLabel')}
	sidebarPosition="left"
	storageKey="saaskaya.admin.sidebar"
	{brand}
/>
