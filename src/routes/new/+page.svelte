<script lang="ts">
	import { goto } from '$app/navigation';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';

	let description = $state('');
	let busy = $state(false);
	let errorMessage = $state('');

	async function generate() {
		errorMessage = '';
		busy = true;
		try {
			const res = await fetch('/api/sites', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ description })
			});
			const data = await res.json();
			if (!res.ok || !data.ok) {
				errorMessage = data.message ?? 'Something went wrong — please try again.';
				return;
			}
			await goto(`/editor/${data.id}`);
		} catch {
			errorMessage = 'Network error — please try again.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>New site · saaskaya</title>
	<meta
		name="description"
		content="Describe yourself and let saaskaya generate a multilingual website from a validated structured site schema."
	/>
</svelte:head>

<AppCanvasShell label="saaskaya.app / new site">
	{#snippet right()}
		<a href="/" class="sk-btn sk-btn-secondary sk-btn-sm">Home</a>
	{/snippet}

	<div class="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
		<div class="pt-2">
			<a href="/" class="sk-link text-sm text-[var(--sk-faint)]">← saaskaya</a>
			<h1 class="sk-display mt-3 text-4xl leading-none sm:text-[42px]">Describe yourself.</h1>
			<p class="mt-3 text-[15px] leading-6 text-[var(--sk-muted)]">
				Who are you, what do you do, who are your clients? Write it in your own language — the AI
				builds a multilingual site (TR/EN/DE) from it. You can edit everything afterwards.
			</p>
			<div class="sk-soft mt-6 p-4">
				<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Generation pipeline</div>
				<div class="mt-3 flex flex-col gap-2 text-sm text-[var(--sk-muted)]">
					<div>01 · read your positioning</div>
					<div>02 · choose a controlled niche preset</div>
					<div>03 · write multilingual content</div>
					<div>04 · validate against the Site schema</div>
				</div>
			</div>
		</div>

		<AppCard class="p-6 sm:p-8">
			<form
				class="flex flex-col gap-5"
				onsubmit={(e) => {
					e.preventDefault();
					generate();
				}}
			>
				<div class="relative">
					<textarea
						class="sk-textarea min-h-72 text-[14.5px]"
						rows="10"
						placeholder="Örn: Ben Av. Zeynep Demir. İstanbul'da 12 yıldır aile hukuku ve boşanma davalarına bakıyorum. Ofisim Kadıköy'de…"
						bind:value={description}
						disabled={busy}></textarea>
					<div
						class="absolute right-4 bottom-3 font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]"
					>
						{description.trim().length} / min. 30
					</div>
				</div>

				{#if errorMessage}
					<div class="sk-alert sk-alert-error">{errorMessage}</div>
				{/if}

				{#if busy}
					<div
						class="sk-soft flex flex-col gap-1 p-4 font-[var(--font-mono)] text-[11.5px] text-[var(--sk-muted)]"
					>
						<div>✓ reading description</div>
						<div>✓ picking niche preset</div>
						<div>↳ writing TR / EN / DE content…</div>
						<div class="opacity-50">validating against Site schema</div>
					</div>
				{/if}

				<button
					type="submit"
					class="sk-btn sk-btn-primary sk-btn-lg w-full"
					disabled={busy || description.trim().length < 30}
				>
					{#if busy}
						<span class="loading loading-spinner loading-sm"></span>
						Building your site — this takes about a minute…
					{:else}
						Generate my site
					{/if}
				</button>

				<p class="text-xs leading-5 text-[var(--sk-faint)]">
					The AI fills a fixed, validated site structure — it never writes code. Generation uses
					your monthly AI budget; direct text and color edits in the editor are always free.
				</p>
			</form>
		</AppCard>
	</div>
</AppCanvasShell>
