<script lang="ts">
	import { enhance } from '$app/forms';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';

	let { data, form } = $props();
	let busy = $state(false);
</script>

<svelte:head>
	<title>Sign in · saaskaya</title>
	<meta name="description" content="Sign in to saaskaya with a one-time magic link." />
</svelte:head>

<AppCanvasShell label="saaskaya.app / sign in">
	{#snippet right()}
		<a href="/" class="sk-btn sk-btn-secondary sk-btn-sm">Home</a>
	{/snippet}

	<div class="mx-auto grid w-full max-w-3xl gap-6 md:grid-cols-[0.85fr_1fr] md:items-center">
		<div>
			<a href="/" class="sk-link text-sm text-[var(--sk-faint)]">← saaskaya</a>
			<h1 class="sk-display mt-3 text-4xl leading-none">Sign in</h1>
			{#if data?.betaMode}
				<p
					class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#171614]/5 px-3 py-1 text-xs font-medium"
				>
					🔒 Kapalı Beta — davetiyeyle giriş
				</p>
			{/if}
			<p class="mt-3 text-sm leading-6 text-[var(--sk-muted)]">
				No password — we email you a one-time sign-in link. First sign-in creates your account.
			</p>
		</div>

		<AppCard class="p-6 sm:p-8">
			<div class="flex flex-col gap-5">
				{#if form?.sent}
					<div class="sk-alert sk-alert-success">
						Sign-in link sent to <strong>{form.email}</strong>. It is valid for 15 minutes.
					</div>
					{#if form.devEchoLink}
						<div class="sk-alert sk-alert-warning text-xs">
							<span class="sk-mono block text-[10.5px] text-[var(--sk-faint)]">Dev mode</span>
							<a class="sk-link break-all font-medium" href={form.devEchoLink}>
								Open your sign-in link →
							</a>
						</div>
					{/if}
				{:else}
					<form
						method="POST"
						class="flex flex-col gap-3"
						use:enhance={() => {
							busy = true;
							return async ({ update }) => {
								busy = false;
								await update();
							};
						}}
					>
						<input
							type="email"
							name="email"
							value={data?.email}
							required
							placeholder="you@example.com"
							class="sk-input text-[15px]"
							disabled={busy}
						/>
						{#if form?.message}
							<p class="text-sm text-[#b8532f]">{form.message}</p>
						{/if}
						<button type="submit" class="sk-btn sk-btn-primary sk-btn-lg w-full" disabled={busy}>
							{#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
							Email me a sign-in link
						</button>
					</form>
				{/if}
			</div>
		</AppCard>
	</div>
</AppCanvasShell>
