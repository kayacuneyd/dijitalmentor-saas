<script lang="ts">
	let {
		children,
		class: className = '',
		padded = true
	} = $props<{
		children: import('svelte').Snippet;
		class?: string;
		padded?: boolean;
	}>();
</script>

<section class="sk-shell {padded ? 'p-5 sm:p-6' : ''} {className}">
	{@render children()}
</section>
