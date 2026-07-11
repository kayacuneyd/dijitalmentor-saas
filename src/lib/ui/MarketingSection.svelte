<script lang="ts">
	let {
		children,
		id = undefined,
		class: className = '',
		as = 'div'
	}: {
		children: import('svelte').Snippet;
		id?: string;
		class?: string;
		as?: 'div' | 'section' | 'article' | 'header';
	} = $props();
</script>

{#if as === 'section'}
	<section {id} class="mx-auto w-full max-w-7xl px-5 sm:px-10 {className}">
		{@render children()}
	</section>
{:else if as === 'article'}
	<article {id} class="mx-auto w-full max-w-7xl px-5 sm:px-10 {className}">
		{@render children()}
	</article>
{:else if as === 'header'}
	<header {id} class="mx-auto w-full max-w-7xl px-5 sm:px-10 {className}">
		{@render children()}
	</header>
{:else}
	<div {id} class="mx-auto w-full max-w-7xl px-5 sm:px-10 {className}">
		{@render children()}
	</div>
{/if}
