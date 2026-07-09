<script lang="ts">
	import type { BlockProps } from './registry';

	let { props, content }: BlockProps<'footer'> = $props();
</script>

<footer
	class="footer footer-center bg-neutral text-neutral-content gap-5 px-5 py-12"
	class:md:footer-horizontal={props.variant === 'columns'}
	class:md:justify-between={props.variant === 'columns'}
>
	<p class="max-w-md leading-6 opacity-80">{content.text}</p>
	{#if content.links?.length}
		<nav class="flex flex-wrap justify-center gap-4">
			{#each content.links as link (link.href + link.label)}
				<a href={link.href} class="font-medium no-underline opacity-85 hover:opacity-100">
					{link.label}
				</a>
			{/each}
		</nav>
	{/if}
</footer>
