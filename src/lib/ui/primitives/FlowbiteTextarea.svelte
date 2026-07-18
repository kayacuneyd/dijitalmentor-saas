<script lang="ts">
	import { Textarea } from 'flowbite-svelte';

	let {
		value = $bindable(''),
		class: className = '',
		...rest
	} = $props<{
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<Textarea {value} class={`sk-flowbite-textarea ${className}`} {...rest} />
