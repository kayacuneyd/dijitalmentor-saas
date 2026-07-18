<script lang="ts">
	import { Modal } from 'flowbite-svelte';

	let {
		children,
		header,
		footer,
		title = '',
		open = $bindable(false),
		class: className = '',
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		header?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
		title?: string;
		open?: boolean;
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<Modal bind:open class={`sk-flowbite-modal ${className}`} {...rest}>
	{#snippet header()}
		{#if header}
			{@render header()}
		{:else}
			{title}
		{/if}
	{/snippet}
	{#snippet footer()}
		{#if footer}{@render footer()}{/if}
	{/snippet}
	{@render children()}
</Modal>
