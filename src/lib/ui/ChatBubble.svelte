<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let {
		role,
		animate = true,
		children
	}: {
		role: 'user' | 'assistant' | 'error';
		/** Set false to skip the entrance transition (e.g. replaying saved history). */
		animate?: boolean;
		children: Snippet;
	} = $props();

	const flyIn = $derived({ duration: animate ? 200 : 0, y: animate ? 8 : 0 });
</script>

{#if role === 'user'}
	<div class="flex justify-end" in:fly={flyIn}>
		<div class="max-w-[92%] rounded-[12px] bg-[#171614] px-3 py-2 text-sm leading-6 text-[#f3ecdd]">
			{@render children()}
		</div>
	</div>
{:else if role === 'assistant'}
	<div class="sk-card max-w-[92%] p-3 text-sm leading-6" in:fly={flyIn}>
		{@render children()}
	</div>
{:else}
	<div class="sk-alert sk-alert-error px-3 py-2 text-xs" in:fly={flyIn}>
		{@render children()}
	</div>
{/if}
