<script lang="ts">
	import { onMount } from 'svelte';

	let visible = $state(false);

	onMount(() => {
		const update = () => {
			visible = window.scrollY > 480;
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		return () => window.removeEventListener('scroll', update);
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

{#if visible}
	<button
		type="button"
		class="fixed bottom-4 left-4 z-40 inline-flex size-10 items-center justify-center rounded-full border border-[var(--sk-line-strong)] bg-[var(--sk-card)] text-lg text-[var(--sk-ink)] shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(23_22_20/.24)]"
		aria-label="Scroll to top"
		onclick={scrollToTop}
	>
		↑
	</button>
{/if}
