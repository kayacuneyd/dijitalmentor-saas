<script lang="ts">
	let {
		children,
		id = undefined,
		class: className = '',
		as = 'div',
		band = undefined
	}: {
		children: import('svelte').Snippet;
		id?: string;
		class?: string;
		as?: 'div' | 'section' | 'article' | 'header';
		band?: 'card' | 'paper';
	} = $props();
</script>

{#if band}
	<div class="sk-band sk-band--{band}">
		<svelte:element this={as} {id} class="mx-auto w-full max-w-7xl px-5 sm:px-10 {className}">
			{@render children()}
		</svelte:element>
	</div>
{:else}
	<svelte:element this={as} {id} class="mx-auto w-full max-w-7xl px-5 sm:px-10 {className}">
		{@render children()}
	</svelte:element>
{/if}
