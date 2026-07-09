<script lang="ts">
	type Tone = 'neutral' | 'success' | 'warning' | 'error';
	type Props = {
		tone?: Tone;
		children: import('svelte').Snippet;
		class?: string;
	};

	let { tone = 'neutral', children, class: className = '' }: Props = $props();

	const toneClass = {
		neutral: '',
		success: 'sk-pill-success',
		warning: 'sk-pill-warning',
		error: 'sk-pill-error'
	} as const;
</script>

<span class="sk-pill {toneClass[tone]} {className}">
	{@render children()}
</span>
