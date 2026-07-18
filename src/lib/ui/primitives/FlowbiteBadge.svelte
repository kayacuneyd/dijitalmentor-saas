<script lang="ts">
	import { Badge } from 'flowbite-svelte';

	type Tone = 'neutral' | 'success' | 'warning' | 'error';

	let {
		children,
		tone = 'neutral',
		class: className = '',
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		tone?: Tone;
		class?: string;
		[key: string]: unknown;
	}>();

	const flowbiteColor = $derived(
		tone === 'success' ? 'green' : tone === 'warning' ? 'amber' : tone === 'error' ? 'red' : 'gray'
	);
</script>

<Badge
	color={flowbiteColor}
	class={`sk-flowbite-badge sk-flowbite-badge--${tone} ${className}`}
	{...rest}
>
	{@render children()}
</Badge>
