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
	const rowClass = $derived(role === 'user' ? 'chat chat-end' : 'chat chat-start');
	const bubbleClass = $derived(
		role === 'user'
			? 'chat-bubble bg-[#171614] text-[#f3ecdd]'
			: role === 'error'
				? 'chat-bubble chat-bubble-error text-xs'
				: 'chat-bubble bg-[var(--sk-card)] text-[var(--sk-ink)] shadow-sm'
	);
</script>

<div class={rowClass} in:fly={flyIn}>
	<div class="{bubbleClass} max-w-[92%] text-sm leading-6">
		{@render children()}
	</div>
</div>
