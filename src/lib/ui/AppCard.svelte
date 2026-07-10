<script lang="ts">
	let {
		children,
		id,
		class: className = '',
		padded = true
	} = $props<{
		children: import('svelte').Snippet;
		id?: string;
		class?: string;
		padded?: boolean;
	}>();
</script>

<section {id} class="sk-shell {padded ? 'p-5 sm:p-6' : ''} {className}">
	{@render children()}
</section>
