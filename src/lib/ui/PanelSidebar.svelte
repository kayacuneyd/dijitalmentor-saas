<script lang="ts">
	import { uiIcons } from './icons';

	export type PanelNavItem = {
		href: string;
		label: string;
		icon: string;
		eyebrow?: string;
		active?: boolean;
	};

	let {
		id = 'panel-sidebar',
		items,
		label,
		collapsed = false,
		mobileOpen = false,
		position = 'left',
		brand,
		onCloseMobile
	}: {
		id?: string;
		items: PanelNavItem[];
		label: string;
		collapsed?: boolean;
		mobileOpen?: boolean;
		position?: 'left' | 'right';
		brand?: import('svelte').Snippet;
		onCloseMobile: () => void;
	} = $props();

	const sideClass = $derived(position === 'right' ? 'right-0 border-l' : 'left-0 border-r');
	const mobilePositionClass = $derived('translate-x-0');
	const orderClass = $derived(position === 'right' ? 'lg:order-2' : 'lg:order-0');
</script>

<aside
		{id}
		class="panel-sidebar {orderClass} {sideClass} {mobileOpen
		? mobilePositionClass
		: position === 'right'
			? 'translate-x-full'
			: '-translate-x-full'}"
		data-collapsed={collapsed}
		aria-label={label}
	>
	<div class="flex min-h-full flex-col bg-[var(--sk-shell)]">
		<div class="flex items-center justify-between border-b border-[var(--sk-line)] p-3 sm:p-4">
			{#if brand}
				{@render brand()}
			{:else}
				<span class="sk-mono truncate text-[10px] text-[var(--sk-faint)]">saaskaya.app</span>
			{/if}
			<button
				type="button"
				class="panel-sidebar-close inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] text-[var(--sk-muted)] transition hover:bg-[rgba(23,22,20,.06)] hover:text-[var(--sk-ink)] lg:hidden"
				aria-label="Close sidebar"
				onclick={onCloseMobile}
			>
				{@html uiIcons.x(16)}
			</button>
		</div>

		<nav class="flex flex-1 flex-col gap-1 p-2" aria-label={label}>
			{#each items as item (item.href)}
				<a
					href={item.href}
					onclick={onCloseMobile}
					class="panel-sidebar-link {item.active
						? 'bg-[var(--sk-ink)] text-[var(--sk-card)]'
						: 'text-[var(--sk-muted)] hover:bg-[rgb(23_22_20_/_0.05)] hover:text-[var(--sk-ink)]'}"
					aria-current={item.active ? 'page' : undefined}
					title={collapsed ? item.label : undefined}
				>
					<span class="panel-sidebar-icon">{@html item.icon}</span>
					<span class="panel-sidebar-label min-w-0 flex-1 truncate font-medium">{item.label}</span>
					{#if item.eyebrow}
						<span class="panel-sidebar-eyebrow sk-mono text-[8.5px] opacity-60">{item.eyebrow}</span>
					{/if}
				</a>
			{/each}
		</nav>
	</div>
</aside>
