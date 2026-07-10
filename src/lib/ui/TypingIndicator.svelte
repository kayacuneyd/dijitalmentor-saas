<script lang="ts">
	let { label }: { label?: string } = $props();
</script>

<div class="sk-card w-fit p-3 text-sm">
	<span class="loading loading-dots loading-sm"></span>
	{#if label}
		<span class="ml-2 text-[var(--sk-muted)]">{label}</span>
	{/if}
</div>
