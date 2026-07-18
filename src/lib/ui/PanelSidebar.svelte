<script lang="ts">
	import { AngleLeftOutline, AngleRightOutline, CloseOutline } from 'flowbite-svelte-icons';
	import type { PlatformIcon } from './icons';

	export type PanelNavItem = {
		href: string;
		label: string;
		icon: PlatformIcon;
		eyebrow?: string;
		active?: boolean;
		dividerBefore?: boolean;
	};

	let {
		id = 'panel-sidebar',
		items,
		label,
		collapsed = false,
		mobileOpen = false,
		position = 'left',
		brand,
		onCloseMobile,
		onToggleDesktop,
		collapseLabel,
		expandLabel
	}: {
		id?: string;
		items: PanelNavItem[];
		label: string;
		collapsed?: boolean;
		mobileOpen?: boolean;
		position?: 'left' | 'right';
		brand?: import('svelte').Snippet;
		onCloseMobile: () => void;
		onToggleDesktop: () => void;
		collapseLabel: string;
		expandLabel: string;
	} = $props();

	const DesktopToggleIcon = $derived(
		position === 'right'
			? collapsed
				? AngleLeftOutline
				: AngleRightOutline
			: collapsed
				? AngleRightOutline
				: AngleLeftOutline
	);
</script>

<aside
	{id}
	class="panel-sidebar panel-sidebar--{position} {mobileOpen
		? 'panel-sidebar--open'
		: 'panel-sidebar--closed'}"
	data-collapsed={collapsed}
	aria-label={label}
>
	<div class="flex min-h-full w-full min-w-0 flex-col bg-[var(--sk-shell)]">
		<div
			class="flex min-h-[4.25rem] items-center justify-between border-b border-[var(--sk-line)] p-3"
		>
			<div class="min-w-0 lg:hidden">
				{#if brand}
					{@render brand()}
				{:else}
					<span class="sk-mono truncate text-[10px] text-[var(--sk-faint)]">saaskaya.app</span>
				{/if}
			</div>
			<button
				type="button"
				class="panel-sidebar-close inline-flex size-11 shrink-0 items-center justify-center rounded-[9px] text-[var(--sk-muted)] transition hover:bg-[rgba(23,22,20,.06)] hover:text-[var(--sk-ink)] lg:hidden"
				aria-label={collapseLabel}
				onclick={onCloseMobile}
			>
				<CloseOutline size="sm" />
			</button>
			<button
				type="button"
				class="panel-sidebar-toggle hidden size-11 shrink-0 items-center justify-center rounded-[9px] text-[var(--sk-muted)] transition hover:bg-[rgba(23,22,20,.06)] hover:text-[var(--sk-ink)] lg:inline-flex"
				class:mx-auto={collapsed}
				aria-label={collapsed ? expandLabel : collapseLabel}
				aria-expanded={!collapsed}
				onclick={onToggleDesktop}
			>
				<DesktopToggleIcon size="sm" />
			</button>
		</div>

		<nav class="flex w-full min-w-0 flex-1 flex-col gap-1 p-2" aria-label={label}>
			{#each items as item (item.href)}
				{@const Icon = item.icon}
				{#if item.dividerBefore}
					<div class="mx-2 my-2 border-t border-[var(--sk-line)]" aria-hidden="true"></div>
				{/if}
				<a
					href={item.href}
					onclick={onCloseMobile}
					class="panel-sidebar-link {item.active
						? 'bg-[var(--sk-ink)] text-[var(--sk-card)]'
						: 'text-[var(--sk-muted)] hover:bg-[rgb(23_22_20_/_0.05)] hover:text-[var(--sk-ink)]'}"
					aria-current={item.active ? 'page' : undefined}
					title={collapsed ? item.label : undefined}
				>
					<span class="panel-sidebar-icon"><Icon size="sm" /></span>
					<span class="panel-sidebar-label min-w-0 flex-1 truncate font-medium">{item.label}</span>
					{#if item.eyebrow}
						<span class="panel-sidebar-eyebrow sk-mono text-[8.5px] opacity-60">{item.eyebrow}</span
						>
					{/if}
				</a>
			{/each}
		</nav>
	</div>
</aside>
