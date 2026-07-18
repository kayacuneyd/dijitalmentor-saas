<script lang="ts">
	import { Drawer } from 'flowbite-svelte';

	let {
		children,
		header,
		title = '',
		open = $bindable(false),
		placement = 'right',
		class: className = '',
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		header?: import('svelte').Snippet;
		title?: string;
		open?: boolean;
		placement?: 'left' | 'right' | 'top' | 'bottom';
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<Drawer bind:open {placement} class={`sk-flowbite-drawer ${className}`} {...rest}>
	{#if header}
		{@render header()}
	{:else if title}
		<h2 class="sk-flowbite-drawer__title">{title}</h2>
	{/if}
	{@render children()}
</Drawer>
