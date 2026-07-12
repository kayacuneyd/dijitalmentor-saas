<script lang="ts">
	import BlogNode from './BlogNode.svelte';
	import type { BlogDoc } from './content';

	let { doc } = $props<{ doc: BlogDoc }>();
	const nodes = $derived(doc.content ?? []);
</script>

<div class="sk-blog-body">
	{#each nodes as node}
		<BlogNode {node} />
	{/each}
</div>
