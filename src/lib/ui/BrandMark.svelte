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

	// The source logo has a large square transparent canvas. The cropped derivative
	// keeps the wordmark legible without making the header 7rem tall (`h-28`).
	const logoSize = $derived(compact ? 'h-7 w-32' : 'h-9 w-40');
</script>

<a {href} class="sk-link inline-flex min-w-0 items-center gap-3">
	<span class="flex shrink-0 items-center overflow-hidden rounded-[9px] bg-[var(--sk-shell)] {logoSize}">
		<img src="/brand-logo.png" alt={label} class="h-full w-full object-contain" />
	</span>
</a>
