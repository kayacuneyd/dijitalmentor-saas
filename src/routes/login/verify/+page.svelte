<script lang="ts">
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
</script>

<AppCanvasShell label="saaskaya.app / verify">
	{#snippet right()}
		<FlowbiteButton href="/login" variant="secondary" size="sm">Sign in</FlowbiteButton>
	{/snippet}

	<div class="mx-auto flex w-full max-w-md flex-col justify-center">
		<AppCard class="p-6 sm:p-8">
			<h1 class="sk-display text-4xl leading-none">Sign-in link invalid</h1>
			<p class="mt-4 text-sm leading-6 text-[var(--sk-muted)]">
				This link has expired or was already used. Sign-in links are single-use and valid for 15
				minutes.
			</p>
			<FlowbiteButton href="/login" variant="primary" class="mt-6 w-fit"
				>Request a new link</FlowbiteButton
			>
		</AppCard>
	</div>
</AppCanvasShell>
