<script lang="ts">
	import { Input } from 'flowbite-svelte';

	type Size = 'sm' | 'md' | 'lg';

	let {
		value = $bindable(''),
		size = 'md',
		class: className = '',
		...rest
	} = $props<{
		size?: Size;
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<Input
	{value}
	{size}
	color="gray"
	class={`sk-flowbite-input sk-flowbite-input--${size} ${className}`}
	{...rest}
/>
