<script lang="ts">
	import { enhance } from '$app/forms';
	import { LOCALES, localeNames } from '$lib/i18n';
	import AdminShell from '$lib/ui/AdminShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { getTranslate } from '$lib/i18n/context';

	let { data, form } = $props();
	const t = getTranslate();

	let query = $state('');

	const filtered = $derived(
		query.trim()
			? data.entries.filter((entry) => {
					const haystack = [entry.key, entry.label, ...Object.values(entry.textByLocale)]
						.join(' ')
						.toLowerCase();
					return haystack.includes(query.trim().toLowerCase());
				})
			: data.entries
	);

	const namespaces = $derived(() => {
		const groups = new Map<string, typeof data.entries>();
		for (const entry of filtered) {
			const list = groups.get(entry.namespace) ?? [];
			list.push(entry);
			groups.set(entry.namespace, list);
		}
		return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
	});
</script>

<svelte:head>
	<title>{t('admin.messagePanel.title')} · saaskaya admin</title>
</svelte:head>

<AdminShell
	title={t('admin.messagePanel.title')}
	description={t('admin.messagePanel.description')}
	active="/admin/messages"
	max="max-w-[96rem]"
>
	{#if form?.saved}
		<div class="sk-alert sk-alert-success">
			{t('admin.messagePanel.saved', { value: form.saved })}
		</div>
	{:else if form?.reset}
		<div class="sk-alert">{t('admin.messagePanel.reset', { value: form.reset })}</div>
	{:else if form?.message}
		<div class="sk-alert sk-alert-error">{form.message}</div>
	{/if}

	<label class="block max-w-md">
		<span class="text-xs font-medium text-[var(--sk-muted)]">{t('admin.messagePanel.search')}</span>
		<input
			type="search"
			bind:value={query}
			placeholder={t('admin.messagePanel.searchPlaceholder')}
			class="mt-1 w-full rounded-[8px] border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sk-ink)]"
		/>
	</label>

	<div class="grid gap-4">
		{#each namespaces() as [namespace, entries] (namespace)}
			<AppCard class="p-0" id={namespace}>
				<details class="group" open={Boolean(query.trim())}>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
					>
						<span>
							<span class="block text-base font-semibold">{namespace}</span>
							<span class="mt-1 block text-xs text-[var(--sk-faint)]">
								{entries.length} editable {entries.length === 1 ? 'string' : 'strings'}
							</span>
						</span>
						<span class="sk-btn sk-btn-secondary sk-btn-sm">{t('admin.messagePanel.open')}</span>
					</summary>
					<div class="grid gap-4 border-t border-[var(--sk-line)] p-4">
						{#each entries as entry (entry.key)}
							<section class="rounded-[10px] border border-[var(--sk-line)] bg-white p-4">
								<div class="flex items-start justify-between gap-3">
									<div>
										<h2 class="text-sm font-semibold">{entry.label}</h2>
										<p class="sk-mono mt-1 text-[10.5px] text-[var(--sk-faint)]">{entry.key}</p>
									</div>
								</div>
								<div class="mt-3 grid gap-3 md:grid-cols-3">
									{#each LOCALES as locale (locale)}
										{@const override = entry.overrideByLocale[locale]}
										<div>
											<div class="flex items-center justify-between gap-2">
												<span class="text-xs font-medium text-[var(--sk-muted)]"
													>{localeNames[locale]}</span
												>
												<StatusPill tone={override !== undefined ? 'success' : 'neutral'}>
													{override !== undefined ? 'custom' : 'default'}
												</StatusPill>
											</div>
											<form
												method="POST"
												action="?/save"
												class="mt-1 flex flex-col gap-2"
												use:enhance
											>
												<input type="hidden" name="key" value={entry.key} />
												<input type="hidden" name="locale" value={locale} />
												{#if entry.kind === 'textarea'}
													<textarea
														name="value"
														rows="3"
														class="w-full rounded-[8px] border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sk-ink)]"
														>{override ?? entry.textByLocale[locale]}</textarea
													>
												{:else}
													<input
														name="value"
														value={override ?? entry.textByLocale[locale]}
														class="w-full rounded-[8px] border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--sk-ink)]"
													/>
												{/if}
												<div class="flex gap-2">
													<button type="submit" class="sk-btn sk-btn-primary sk-btn-sm">Save</button
													>
												</div>
											</form>
											{#if override !== undefined}
												<form method="POST" action="?/reset" class="mt-1" use:enhance>
													<input type="hidden" name="key" value={entry.key} />
													<input type="hidden" name="locale" value={locale} />
													<button type="submit" class="sk-btn sk-btn-ghost sk-btn-sm">
														Reset to default
													</button>
												</form>
											{/if}
										</div>
									{/each}
								</div>
							</section>
						{/each}
					</div>
				</details>
			</AppCard>
		{/each}
	</div>
</AdminShell>
