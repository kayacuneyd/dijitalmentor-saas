<script lang="ts">
	import { Button } from 'flowbite-svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	let {
		children,
		variant = 'primary',
		size = 'md',
		href,
		type = 'button',
		disabled = false,
		loading = false,
		class: className = '',
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		variant?: Variant;
		size?: Size;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		loading?: boolean;
		class?: string;
		[key: string]: unknown;
	}>();

	const flowbiteColor = $derived(
		variant === 'primary' || variant === 'danger'
			? 'dark'
			: variant === 'secondary'
				? 'light'
				: 'alternative'
	);
</script>

<Button
	color={flowbiteColor}
	{size}
	{href}
	{type}
	{disabled}
	{loading}
	class={`sk-flowbite-btn sk-flowbite-btn--${variant} ${className}`}
	{...rest}
>
	{@render children()}
</Button>
