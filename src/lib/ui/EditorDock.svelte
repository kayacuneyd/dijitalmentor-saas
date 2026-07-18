<script lang="ts">
	/** Responsive editor workspace rail. It participates in desktop layout so it
	 *  never hides the preview; on narrow screens the same surface becomes a
	 *  modal sheet. Business state remains in the calling route. */
	let {
		open = $bindable(false),
		label = 'Editör kontrolleri',
		closeLabel = label,
		children
	}: {
		open?: boolean;
		label?: string;
		closeLabel?: string;
		children: import('svelte').Snippet;
	} = $props();
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape' && open) open = false;
	}}
/>

<button
	type="button"
	class="sk-editor-fab"
	aria-expanded={open}
	aria-controls="editor-dock"
	aria-label={label}
	onclick={() => (open = !open)}
>
	s
</button>

{#if open}
	<button
		type="button"
		class="sk-editor-dock-backdrop"
		aria-label={closeLabel}
		onclick={() => (open = false)}
	></button>
{/if}

<aside
	id="editor-dock"
	data-editor-dock
	class="sk-editor-dock"
	aria-label={label}
	aria-hidden={!open}
	data-open={open ? 'true' : 'false'}
>
	<div class="flex min-h-0 flex-1 flex-col">
		{@render children()}
	</div>
</aside>
