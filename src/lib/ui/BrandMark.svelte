<script lang="ts">
	let {
		label = 'saaskaya',
		href = '/',
		compact = false
	} = $props<{
		label?: string;
		href?: string;
		compact?: boolean;
	}>();

	const markSize = $derived(compact ? 'size-8 text-[22px]' : 'size-9 text-[26px]');
	const labelSize = $derived(compact ? 'text-xl' : 'text-3xl');
</script>

<a {href} class="sk-link inline-flex min-w-0 items-center gap-3">
	<span
		class="flex shrink-0 items-center justify-center rounded-[9px] bg-[#171614] pb-0.5 font-[var(--font-display)] text-[#f3ecdd] {markSize}"
		aria-hidden="true">s</span
	>
	<span class="sk-display truncate leading-none {labelSize}">
		{label}
	</span>
</a>
