<script lang="ts">
	import { seedSites } from '$lib/seed';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();
	const seeds = Object.entries(seedSites);

	const swatches = {
		law: '#1e3a5f',
		psych: '#2f6f6a',
		dental: '#0e7490'
	} as const;
</script>

<svelte:head>
	<title>saaskaya</title>
	<link rel="canonical" href="https://saaskaya.com/" />
	<meta
		name="description"
		content="AI website platform for professionals: describe yourself, generate a multilingual site, edit it live, and publish on your own domain."
	/>
</svelte:head>

<AppCanvasShell contentClass="relative px-5 py-8 sm:px-10 sm:py-14 lg:py-16">
	{#snippet right()}
		{#if data.user}
			<a href="/dashboard" class="sk-btn sk-btn-secondary sk-btn-sm">Dashboard</a>
		{:else}
			<a href="/login" class="sk-btn sk-btn-secondary sk-btn-sm">Sign in</a>
		{/if}
	{/snippet}

	<nav class="absolute top-5 right-20 hidden items-center gap-2 sm:flex">
		{#if data.user}
			<span class="text-xs text-[var(--sk-muted)]">{data.user.email}</span>
		{:else}
			<span class="text-xs text-[var(--sk-muted)]">signed out</span>
		{/if}
	</nav>

	<div class="mx-auto flex w-full max-w-4xl flex-col items-start gap-5 pt-6 sm:pt-2">
		<BrandMark />
		<div class="flex flex-wrap gap-2">
			<StatusPill>AI website platform</StatusPill>
			<StatusPill>TR · EN · DE</StatusPill>
		</div>
		<p class="max-w-xl text-[17px] leading-8 text-[var(--sk-muted)]">
			WaaS / progressive CMS — describe yourself, get a multilingual site as validated JSON, edit it
			live, publish it on your own domain.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<a href="/new" class="sk-btn sk-btn-primary sk-btn-lg"> Describe yourself → get your site </a>
			<a href="#demos" class="sk-btn sk-btn-secondary sk-btn-lg">View demo sites</a>
		</div>
	</div>

	<div id="demos" class="mx-auto mt-12 w-full max-w-4xl border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Demo sites</div>
		<ul class="mt-4 flex flex-col gap-3">
			{#each seeds as [preset, site] (preset)}
				<li class="sk-card p-4">
					<div class="flex items-center gap-3">
						<span
							class="size-9 shrink-0 rounded-lg"
							style:background={swatches[preset as keyof typeof swatches]}
							aria-hidden="true"
						></span>
						<div class="min-w-0 flex-1">
							<div class="flex min-w-0 flex-wrap items-center gap-2">
								<a href="/preview/{site.id}" class="sk-link truncate text-sm font-semibold">
									{site.settings.siteName}
								</a>
								<span
									class="rounded px-2 py-0.5 font-[var(--font-mono)] text-[10.5px] text-white"
									style:background={swatches[preset as keyof typeof swatches]}
								>
									{preset}
								</span>
							</div>
							<div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--sk-muted)]">
								<span>{site.pages.length} {site.pages.length === 1 ? 'page' : 'pages'}</span>
								<span class="opacity-40">·</span>
								{#each site.locales as locale (locale)}
									<a
										href="/preview/{site.id}?locale={locale}"
										class="rounded border border-[var(--sk-line-strong)] px-1.5 py-0.5 font-[var(--font-mono)] text-[10px]"
									>
										{locale.toUpperCase()}
									</a>
								{/each}
							</div>
						</div>
						<div class="flex shrink-0 gap-2">
							<a href="/preview/{site.id}" class="sk-btn sk-btn-secondary sk-btn-sm">Preview</a>
							<a href="/editor/{site.id}" class="sk-btn sk-btn-primary sk-btn-sm">Edit</a>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</AppCanvasShell>
