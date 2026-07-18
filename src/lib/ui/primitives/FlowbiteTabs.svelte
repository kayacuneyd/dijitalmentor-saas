<script lang="ts">
	import { Tabs } from 'flowbite-svelte';

	let {
		children,
		selected = $bindable(),
		tabStyle = 'none',
		class: className = '',
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		selected?: string;
		tabStyle?: string;
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<Tabs bind:selected {tabStyle} class={`sk-flowbite-tabs ${className}`} {...rest}>
	{@render children()}
</Tabs>
