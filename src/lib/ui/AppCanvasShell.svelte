<script lang="ts">
	let {
		children,
		label = 'saaskaya.app',
		max = 'max-w-6xl',
		minHeight = 'min-h-[calc(100svh-2.5rem)]',
		contentClass = 'px-5 py-8 sm:px-10 sm:py-12',
		right,
		flush = false,
		chrome = true
	} = $props<{
		children: import('svelte').Snippet;
		label?: string;
		max?: string;
		minHeight?: string;
		contentClass?: string;
		right?: import('svelte').Snippet;
		flush?: boolean;
		chrome?: boolean;
	}>();
</script>

<main class="sk-page">
	<section class="mx-auto flex min-h-screen w-full {max} flex-col px-4 py-4 sm:px-6 sm:py-6">
		{#if chrome}
			<div class="sk-shell flex {minHeight} flex-col overflow-hidden">
				<div
					class="flex shrink-0 items-center gap-3 border-b border-[var(--sk-line)] bg-[var(--sk-shell)] px-4 py-3"
				>
					<div class="sk-browser-dots flex gap-1.5" aria-hidden="true">
						<span></span><span></span><span></span>
					</div>
					<div
						class="sk-mono min-w-0 flex-1 truncate text-center text-[11px] text-[var(--sk-faint)]"
					>
						{label}
					</div>
					<div class="flex min-w-12 justify-end">
						{#if right}
							{@render right()}
						{/if}
					</div>
				</div>
				<div class={flush ? 'min-h-0 flex-1' : `min-h-0 flex-1 ${contentClass}`}>
					{@render children()}
				</div>
			</div>
		{:else}
			<div class={flush ? 'min-h-0 flex-1' : `min-h-0 flex-1 ${contentClass}`}>
				{@render children()}
			</div>
		{/if}
	</section>
</main>
