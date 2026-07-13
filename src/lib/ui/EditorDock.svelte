<script lang="ts">
	/** FAB-triggered floating control panel for the editor. Sunum katmanı: iş
	 *  mantığı (activeTab, store, checklist, publish, vb.) tamamen çağıran
	 *  +page.svelte'de kalır; bu bileşen sadece aç/kapa + konumlandırmayı yönetir. */
	let {
		open = $bindable(false),
		label = 'Editör kontrolleri',
		children
	}: {
		open?: boolean;
		label?: string;
		children: import('svelte').Snippet;
	} = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogEl) return;
		if (open && !dialogEl.open) dialogEl.showModal();
		else if (!open && dialogEl.open) dialogEl.close();
	});
</script>

<button
	type="button"
	class="sk-editor-fab"
	aria-expanded={open}
	aria-controls="editor-dock"
	aria-label={label}
	onclick={() => (open = !open)}
>
	s
</button>

<dialog
	id="editor-dock"
	data-editor-dock
	class="sk-editor-dock"
	aria-label={label}
	bind:this={dialogEl}
	onclose={() => (open = false)}
	onclick={(event) => {
		if (event.target === dialogEl) open = false;
	}}
>
	<div class="flex min-h-0 flex-1 flex-col">
		{@render children()}
	</div>
</dialog>
