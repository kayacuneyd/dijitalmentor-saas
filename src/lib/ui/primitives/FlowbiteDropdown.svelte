<script lang="ts">
	import { Dropdown } from 'flowbite-svelte';

	let {
		children,
		isOpen = $bindable(false),
		class: className = '',
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		isOpen?: boolean;
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<Dropdown bind:isOpen class={`sk-flowbite-dropdown ${className}`} {...rest}>
	{@render children()}
</Dropdown>
