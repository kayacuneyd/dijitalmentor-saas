<script lang="ts">
	import { page } from '$app/state';
	import { DEFAULT_LOCALE, type Locale } from '$lib/i18n';
	import { getTranslate } from '$lib/i18n/context';
	import AppCanvasShell from './AppCanvasShell.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	type AdminNavItem = {
		href: string;
		label: string;
		eyebrow?: string;
		match?: string;
	};

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
	const nav: AdminNavItem[] = [
		{ href: '/admin', label: t('admin.nav.overview'), eyebrow: 'Ops', match: '/admin' },
		{ href: '/admin/gtm', label: t('admin.nav.gtm'), eyebrow: 'Growth', match: '/admin/gtm' },
		{
			href: '/admin/customers',
			label: t('admin.nav.customers'),
			eyebrow: 'CRM',
			match: '/admin/customers'
		},
		{ href: '/admin/inbox', label: t('admin.nav.inbox'), eyebrow: 'Public', match: '/admin/inbox' },
		{ href: '/admin/blog', label: t('admin.nav.blog'), eyebrow: 'Content', match: '/admin/blog' },
		{ href: '/admin/copy', label: t('admin.nav.copy'), eyebrow: 'Content', match: '/admin/copy' },
		{
			href: '/admin/messages',
			label: t('admin.nav.messages'),
			eyebrow: 'i18n',
			match: '/admin/messages'
		},
		{ href: '/admin/share', label: t('admin.nav.share'), eyebrow: 'Growth', match: '/admin/share' },
		{
			href: '/admin/support',
			label: t('admin.nav.support'),
			eyebrow: 'Help',
			match: '/admin/support'
		},
		{
			href: '/admin/invites',
			label: t('admin.nav.invites'),
			eyebrow: 'Access',
			match: '/admin/invites'
		},
		{
			href: '/admin/settings',
			label: t('admin.nav.settings'),
			eyebrow: 'System',
			match: '/admin/settings'
		}
	];

	function isActive(item: AdminNavItem): boolean {
		if (item.href === '/admin') return active === '/admin';
		return active === item.href || active.startsWith(`${item.match}/`);
	}

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? DEFAULT_LOCALE);
</script>

{#snippet localeSwitcher()}
	<LanguageSwitcher {locale} variant="cookie" />
{/snippet}

<AppCanvasShell label="saaskaya.app / admin" max="max-w-[92rem]" right={localeSwitcher}>
	<div
		class="grid min-h-[calc(100svh-7rem)] gap-0 overflow-hidden rounded-[var(--sk-radius)] border border-[var(--sk-line)] bg-[var(--sk-card)] lg:grid-cols-[232px_1fr]"
	>
		<aside class="border-b border-[var(--sk-line)] bg-[var(--sk-shell)] lg:border-r lg:border-b-0">
			<div class="flex h-full flex-col">
				<div class="border-b border-[var(--sk-line)] p-4">
					<a href="/dashboard" class="sk-link inline-flex items-center gap-2">
						<span
							class="flex size-8 items-center justify-center rounded-[8px] bg-[#171614] pb-0.5 font-[var(--font-display)] text-xl text-[#f3ecdd]"
							>s</span
						>
						<span>
							<span class="block text-sm font-semibold leading-none">saaskaya</span>
							<span class="sk-mono mt-1 block text-[9px] text-[var(--sk-faint)]"
								>{t('admin.chrome.console')}</span
							>
						</span>
					</a>
				</div>
				<nav
					class="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible"
					aria-label={t('admin.chrome.ariaLabel')}
				>
					{#each nav as item (item.href)}
						<a
							href={item.href}
							class="flex min-w-36 items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-sm transition lg:min-w-0 {isActive(
								item
							)
								? 'bg-[var(--sk-ink)] text-[var(--sk-card)]'
								: 'text-[var(--sk-muted)] hover:bg-[rgb(23_22_20_/_0.05)] hover:text-[var(--sk-ink)]'}"
							aria-current={isActive(item) ? 'page' : undefined}
						>
							<span class="font-medium">{item.label}</span>
							{#if item.eyebrow}
								<span class="sk-mono text-[8.5px] opacity-60">{item.eyebrow}</span>
							{/if}
						</a>
					{/each}
				</nav>
				<div class="mt-auto hidden border-t border-[var(--sk-line)] p-3 lg:block">
					<a href="/dashboard" class="sk-btn sk-btn-secondary sk-btn-sm w-full"
						>{t('admin.nav.backToApp')}</a
					>
				</div>
			</div>
		</aside>

		<section class="min-w-0 bg-[#fbfaf7]">
			<div class="mx-auto flex w-full {max} flex-col gap-5 p-4 sm:p-5 lg:p-6">
				<header
					class="flex flex-col gap-3 border-b border-[var(--sk-line)] pb-4 md:flex-row md:items-start md:justify-between"
				>
					<div class="min-w-0">
						<div class="sk-mono text-[10px] text-[var(--sk-faint)]">
							{t('admin.chrome.eyebrow')}
						</div>
						<h1 class="mt-1 text-2xl font-semibold text-[var(--sk-ink)] sm:text-3xl">
							{title}
						</h1>
						{#if description}
							<p class="mt-1 max-w-2xl text-sm leading-6 text-[var(--sk-muted)] md:text-[15px]">
								{description}
							</p>
						{/if}
					</div>
					{#if actions}
						<div class="flex flex-wrap gap-2 md:justify-end">{@render actions()}</div>
					{/if}
				</header>

				{@render children()}
			</div>
		</section>
	</div>
</AppCanvasShell>
