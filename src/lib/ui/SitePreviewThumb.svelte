<script lang="ts">
	let { siteId, title }: { siteId: string; title: string } = $props();
</script>

<div
	class="relative aspect-[16/10] w-full overflow-hidden rounded-[10px] border border-[var(--sk-line)] bg-white"
>
	<iframe
		src="/preview/{siteId}"
		title={`${title} — önizleme`}
		loading="lazy"
		tabindex="-1"
		aria-hidden="true"
		class="pointer-events-none absolute top-0 left-0 origin-top-left"
		style="width: 400%; height: 400%; transform: scale(0.25);"
	></iframe>
</div>
