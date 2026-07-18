<script lang="ts">
	import { Tooltip } from 'flowbite-svelte';

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

<Tooltip bind:isOpen class={`sk-flowbite-tooltip ${className}`} {...rest}>
	{@render children()}
</Tooltip>
