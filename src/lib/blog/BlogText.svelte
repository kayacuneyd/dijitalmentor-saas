<script lang="ts">
	import type { BlogTextMark } from './content';

	let { text, marks = [] } = $props<{
		text: string;
		marks?: BlogTextMark[];
	}>();

	const activeMarks = $derived(marks as BlogTextMark[]);
	const href = $derived(
		activeMarks.find((mark: BlogTextMark) => mark.type === 'link')?.attrs?.href ?? ''
	);
	const isBold = $derived(activeMarks.some((mark: BlogTextMark) => mark.type === 'bold'));
	const isItalic = $derived(activeMarks.some((mark: BlogTextMark) => mark.type === 'italic'));
	const isUnderline = $derived(activeMarks.some((mark: BlogTextMark) => mark.type === 'underline'));
	const safeHref = $derived(
		href.startsWith('/') || href.startsWith('https://') || href.startsWith('mailto:') ? href : ''
	);
</script>

{#snippet marked()}
	{#if isBold && isItalic}
		<strong><em class:underline={isUnderline}>{text}</em></strong>
	{:else if isBold}
		<strong class:underline={isUnderline}>{text}</strong>
	{:else if isItalic}
		<em class:underline={isUnderline}>{text}</em>
	{:else if isUnderline}
		<span class="underline">{text}</span>
	{:else}
		{text}
	{/if}
{/snippet}

{#if safeHref}
	<a
		href={safeHref}
		rel="noopener noreferrer"
		target={safeHref.startsWith('http') ? '_blank' : undefined}
	>
		{@render marked()}
	</a>
{:else}
	{@render marked()}
{/if}
