<script lang="ts">
	import Self from './BlogNode.svelte';
	import BlogText from './BlogText.svelte';
	import type { BlogContentNode } from './content';

	let { node } = $props<{ node: BlogContentNode }>();
	const children = $derived(node.content ?? []);
	const level = $derived(node.attrs?.level === 3 ? 3 : 2);
	const imageSrc = $derived(node.attrs?.src ?? '');
	const imageAlt = $derived(node.attrs?.alt ?? '');
	const imageTitle = $derived(node.attrs?.title ?? '');
	const safeImageSrc = $derived(
		imageSrc.startsWith('/') || imageSrc.startsWith('https://') ? imageSrc : ''
	);
</script>

{#if node.type === 'text'}
	<BlogText text={node.text ?? ''} marks={node.marks ?? []} />
{:else if node.type === 'hardBreak'}
	<br />
{:else if node.type === 'paragraph'}
	<p>
		{#each children as child}
			<Self node={child} />
		{/each}
	</p>
{:else if node.type === 'heading'}
	{#if level === 3}
		<h3>
			{#each children as child}
				<Self node={child} />
			{/each}
		</h3>
	{:else}
		<h2>
			{#each children as child}
				<Self node={child} />
			{/each}
		</h2>
	{/if}
{:else if node.type === 'bulletList'}
	<ul>
		{#each children as child}
			<Self node={child} />
		{/each}
	</ul>
{:else if node.type === 'orderedList'}
	<ol>
		{#each children as child}
			<Self node={child} />
		{/each}
	</ol>
{:else if node.type === 'listItem'}
	<li>
		{#each children as child}
			<Self node={child} />
		{/each}
	</li>
{:else if node.type === 'blockquote'}
	<blockquote>
		{#each children as child}
			<Self node={child} />
		{/each}
	</blockquote>
{:else if node.type === 'image' && safeImageSrc}
	<figure>
		<img src={safeImageSrc} alt={imageAlt} loading="lazy" decoding="async" />
		{#if imageTitle}
			<figcaption>{imageTitle}</figcaption>
		{/if}
	</figure>
{/if}
