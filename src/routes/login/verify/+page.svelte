<script lang="ts">
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
</script>

<AppCanvasShell label="saaskaya.app / verify">
	{#snippet right()}
		<a href="/login" class="sk-btn sk-btn-secondary sk-btn-sm">Sign in</a>
	{/snippet}

	<div class="mx-auto flex w-full max-w-md flex-col justify-center">
		<AppCard class="p-6 sm:p-8">
			<h1 class="sk-display text-4xl leading-none">Sign-in link invalid</h1>
			<p class="mt-4 text-sm leading-6 text-[var(--sk-muted)]">
				This link has expired or was already used. Sign-in links are single-use and valid for 15
				minutes.
			</p>
			<a href="/login" class="sk-btn sk-btn-primary mt-6 w-fit">Request a new link</a>
		</AppCard>
	</div>
</AppCanvasShell>
