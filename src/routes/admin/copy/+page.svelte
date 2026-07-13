<script lang="ts">
	import { enhance } from '$app/forms';
	import { getPathValue } from '$lib/publicCopy';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Copy · saaskaya admin</title>
</svelte:head>

<AdminShell
	title="Public copy"
	description="Edit marketing-page text without touching code. Empty fields fall back to the built-in defaults."
	active="/admin/copy"
	max="max-w-[96rem]"
>
	{#if form?.saved}
		<div class="sk-alert sk-alert-success">Saved <code>{form.saved}</code>.</div>
	{:else if form?.reset}
		<div class="sk-alert">Reset <code>{form.reset}</code> to code defaults.</div>
	{:else if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<div class="grid gap-4">
		{#each data.pages as page (page.key)}
			<AppCard class="p-0" id={page.key}>
				<details class="group" open={page.key === 'home'}>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
					>
						<span>
							<span class="block text-base font-semibold">{page.label}</span>
							<span class="mt-1 block text-xs text-[var(--sk-faint)]">
								{page.path} · {page.fields.length} editable fields
							</span>
						</span>
						<span class="sk-btn sk-btn-secondary sk-btn-sm">Open</span>
					</summary>
					<div class="grid gap-4 border-t border-[var(--sk-line)] p-4 xl:grid-cols-3">
						{#each page.locales as localeRow (localeRow.locale)}
							<section class="rounded-[10px] border border-[var(--sk-line)] bg-white p-4">
								<div class="flex items-start justify-between gap-3">
									<div>
										<h2 class="text-sm font-semibold uppercase tracking-wide">
											{localeRow.locale}
										</h2>
										<p class="mt-1 text-xs text-[var(--sk-faint)]">
											Only filled fields override the default copy.
										</p>
									</div>
									<StatusPill tone={Object.keys(localeRow.value).length ? 'success' : 'neutral'}>
										{Object.keys(localeRow.value).length ? 'custom' : 'default'}
									</StatusPill>
								</div>

								<form method="POST" action="?/save" class="mt-4 flex flex-col gap-3" use:enhance>
									<input type="hidden" name="page" value={page.key} />
									<input type="hidden" name="locale" value={localeRow.locale} />
									{#each page.fields as field (field.path)}
										<label class="block">
											<span class="text-xs font-medium text-[var(--sk-muted)]">{field.label}</span>
											{#if field.kind === 'textarea'}
												<textarea
													name={field.path}
													rows="3"
													class="mt-1 w-full rounded-[8px] border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sk-ink)]"
												>{getPathValue(localeRow.value, field.path)}</textarea>
											{:else}
												<input
													name={field.path}
													value={getPathValue(localeRow.value, field.path)}
													class="mt-1 w-full rounded-[8px] border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sk-ink)]"
												/>
											{/if}
											{#if field.help}
												<span class="mt-1 block text-[11px] text-[var(--sk-faint)]">{field.help}</span>
											{/if}
										</label>
									{/each}
									<div class="mt-2 flex flex-wrap gap-2">
										<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">Save copy</button>
									</div>
								</form>
								<form method="POST" action="?/reset" class="mt-2" use:enhance>
									<input type="hidden" name="page" value={page.key} />
									<input type="hidden" name="locale" value={localeRow.locale} />
									<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm">
										Reset this language
									</button>
								</form>
							</section>
						{/each}
					</div>
				</details>
			</AppCard>
		{/each}
	</div>
</AdminShell>
