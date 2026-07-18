<script lang="ts">
	import { Card } from 'flowbite-svelte';

	let {
		children,
		class: className = '',
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<Card shadow="none" class={`sk-flowbite-card ${className}`} {...rest}>
	{@render children()}
</Card>
