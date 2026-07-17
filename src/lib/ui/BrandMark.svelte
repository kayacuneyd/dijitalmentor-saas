<script lang="ts">
	import { page } from '$app/state';
	let {
		label = 'saaskaya',
		href = '/',
		compact = false
	} = $props<{
		label?: string;
		href?: string;
		compact?: boolean;
	}>();

	const logoSize = $derived(compact ? 'size-8' : 'size-10');
	const logoUrl = $derived(page.data.platformBranding?.logoUrl ?? '/logo.svg');
</script>

<a {href} class="sk-link inline-flex min-w-0 items-center gap-3">
	<span class="flex shrink-0 items-center overflow-hidden rounded-[9px] bg-[var(--sk-shell)] {logoSize}">
		<img src={logoUrl} alt={label} class="h-full w-full object-contain" />
	</span>
	<span class="text-sm font-semibold tracking-[-0.02em]">saaskaya</span>
</a>
