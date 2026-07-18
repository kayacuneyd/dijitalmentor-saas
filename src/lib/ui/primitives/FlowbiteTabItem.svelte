<script lang="ts">
	import { TabItem } from 'flowbite-svelte';

	let {
		children,
		title,
		class: className = '',
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		title: string;
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<TabItem {title} class={`sk-flowbite-tab-item ${className}`} {...rest}>
	{@render children()}
</TabItem>
