<script lang="ts">
	let { label }: { label?: string } = $props();
</script>

<div class="sk-card w-fit p-3 text-sm">
	<span class="sk-spinner sk-spinner-dots" aria-label={label ?? 'Loading'}></span>
	{#if label}
		<span class="ml-2 text-[var(--sk-muted)]">{label}</span>
	{/if}
</div>
