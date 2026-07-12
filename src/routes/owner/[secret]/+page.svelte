<script lang="ts">
	import { enhance } from '$app/forms';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import { uiIcons } from '$lib/ui/icons';

	let { form } = $props();
	let busy = $state(false);
	const needsCode = $derived(Boolean(form?.needsCode));
</script>

<svelte:head>
	<title>Owner login · saaskaya</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="flex min-h-svh items-center justify-center bg-[#f6f2ea] px-5 py-10">
	<section class="w-full max-w-[28rem]">
		<div class="mb-5 text-center">
			<div class="flex justify-center"><BrandMark href="/" compact /></div>
			<p class="sk-mono mt-4 text-[10.5px] text-[var(--sk-faint)]">owner access</p>
			<h1 class="sk-display mt-2 text-4xl leading-none">Private sign in</h1>
		</div>

		<div class="sk-card p-5 sm:p-7">
			{#if form?.message}
				<div
					class={needsCode ? 'sk-alert sk-alert-success mb-4' : 'sk-alert sk-alert-warning mb-4'}
				>
					{form.message}
				</div>
			{/if}

			{#if needsCode}
				<form
					method="POST"
					action="?/verifyCode"
					class="flex flex-col gap-3"
					use:enhance={() => {
						busy = true;
						return async ({ update }) => {
							busy = false;
							await update();
						};
					}}
				>
					<label class="text-sm font-medium" for="code">Email onay kodu</label>
					<input type="hidden" name="deviceToken" value={form?.deviceToken ?? ''} />
					<input
						id="code"
						name="code"
						inputmode="numeric"
						autocomplete="one-time-code"
						maxlength="11"
						required
						class="sk-input text-center font-[var(--font-mono)] text-xl tracking-[0.3em]"
						disabled={busy}
					/>
					<button type="submit" class="sk-btn sk-btn-primary sk-btn-lg w-full" disabled={busy}>
						{#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
						{#if !busy}{@html uiIcons.lock(16)}{/if}
						Onayla
					</button>
				</form>
			{:else}
				<form
					method="POST"
					action="?/login"
					class="flex flex-col gap-3"
					use:enhance={() => {
						busy = true;
						return async ({ update }) => {
							busy = false;
							await update();
						};
					}}
				>
					<label class="text-sm font-medium" for="password">Owner şifresi</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						class="sk-input text-[15px]"
						disabled={busy}
					/>
					<button type="submit" class="sk-btn sk-btn-primary sk-btn-lg w-full" disabled={busy}>
						{#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
						{#if !busy}{@html uiIcons.lock(16)}{/if}
						Giriş yap
					</button>
				</form>
			{/if}
		</div>
	</section>
</main>
