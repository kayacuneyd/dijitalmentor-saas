<script lang="ts">
	type Point = { month: string; value: number };
	let {
		points,
		format = (v: number) => String(v)
	}: { points: Point[]; format?: (v: number) => string } = $props();

	const max = $derived(Math.max(1, ...points.map((p) => p.value)));
</script>

<div class="flex items-end gap-1.5" style="height: 64px">
	{#each points as point (point.month)}
		<div
			class="flex flex-1 flex-col items-center gap-1"
			title="{point.month}: {format(point.value)}"
		>
			<div
				class="w-full rounded-t-sm bg-[var(--sk-ink)] opacity-70"
				style="height: {Math.max(2, (point.value / max) * 44)}px"
			></div>
			<span class="sk-mono text-[9px] whitespace-nowrap text-[var(--sk-faint)]">
				{point.month.slice(5)}
			</span>
		</div>
	{/each}
</div>
