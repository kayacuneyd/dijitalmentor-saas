<script lang="ts">
	import { Label } from 'flowbite-svelte';

	let {
		children,
		label,
		for: htmlFor,
		hint = '',
		error = '',
		class: className = ''
	} = $props<{
		children: import('svelte').Snippet;
		label?: string;
		for?: string;
		hint?: string;
		error?: string;
		class?: string;
	}>();
</script>

<div class={`sk-flowbite-field ${className}`}>
	{#if label}
		<Label for={htmlFor} class="sk-flowbite-field__label">{label}</Label>
	{/if}
	{@render children()}
	{#if error}
		<p class="sk-flowbite-field__error" role="alert">{error}</p>
	{:else if hint}
		<p class="sk-flowbite-field__hint">{hint}</p>
	{/if}
</div>
