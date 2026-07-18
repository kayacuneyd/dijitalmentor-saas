<script lang="ts">
	import FlowbiteBadge from './primitives/FlowbiteBadge.svelte';

	type Tone = 'neutral' | 'success' | 'warning' | 'error';
	type Props = {
		tone?: Tone;
		children: import('svelte').Snippet;
		class?: string;
	};

	let { tone = 'neutral', children, class: className = '' }: Props = $props();
</script>

<FlowbiteBadge {tone} class={className}>{@render children()}</FlowbiteBadge>
