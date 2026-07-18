<script lang="ts">
	import { Select } from 'flowbite-svelte';

	let {
		value = $bindable(''),
		children,
		class: className = '',
		...rest
	} = $props<{
		children?: import('svelte').Snippet;
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<Select {value} class={`sk-flowbite-select ${className}`} {...rest}>
	{#if children}{@render children()}{/if}
</Select>
