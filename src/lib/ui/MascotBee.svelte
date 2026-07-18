<script lang="ts">
	let {
		size = 'md',
		label = 'SaasKaya bee mascot',
		class: className = ''
	} = $props<{
		size?: 'sm' | 'md' | 'lg';
		label?: string;
		class?: string;
	}>();

	const sizeClass = $derived(size === 'sm' ? 'size-10' : size === 'lg' ? 'size-20' : 'size-14');
</script>

<span
	class="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--sk-line)] bg-[var(--sk-paper)] {sizeClass} {className}"
>
	<img src="/mascot-bee.svg" alt={label} class="h-[72%] w-[72%] object-contain" />
</span>
