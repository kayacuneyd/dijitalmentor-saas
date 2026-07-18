<script lang="ts">
	import { type Locale } from '$lib/i18n';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import FlowbiteInput from '$lib/ui/primitives/FlowbiteInput.svelte';
	import FlowbiteSelect from '$lib/ui/primitives/FlowbiteSelect.svelte';
	import FlowbiteTextarea from '$lib/ui/primitives/FlowbiteTextarea.svelte';

	let { locale, userEmail = '' }: { locale: Locale; userEmail?: string } = $props();

	let open = $state(false);
	let busy = $state(false);
	let sent = $state(false);
	let error = $state('');
	let name = $state('');
	let email = $state('');
	let category = $state('other');
	let message = $state('');

	$effect(() => {
		if (userEmail && !email) email = userEmail;
	});

	const copy = $derived(
		{
			en: {
				button: 'Message us',
				title: 'Send a message',
				expectation: 'Not live chat. We reply by email.',
				name: 'Name',
				email: 'Email',
				category: 'Category',
				message: 'Message',
				placeholder: 'How can we help?',
				send: 'Send',
				close: 'Close',
				success: 'Message sent. We will reply by email.',
				categories: {
					beta_access: 'Beta access',
					support: 'Support',
					partnership: 'Partnership',
					billing: 'Billing',
					other: 'Other'
				}
			},
			tr: {
				button: 'Mesaj gönder',
				title: 'Mesaj gönder',
				expectation: 'Canlı chat değil. E-posta ile yanıt veririz.',
				name: 'Ad Soyad',
				email: 'E-posta',
				category: 'Kategori',
				message: 'Mesaj',
				placeholder: 'Nasıl yardımcı olabiliriz?',
				send: 'Gönder',
				close: 'Kapat',
				success: 'Mesaj gönderildi. E-posta ile yanıt vereceğiz.',
				categories: {
					beta_access: 'Beta erişimi',
					support: 'Destek',
					partnership: 'İş ortaklığı',
					billing: 'Faturalama',
					other: 'Diğer'
				}
			},
			de: {
				button: 'Nachricht',
				title: 'Nachricht senden',
				expectation: 'Kein Live-Chat. Wir antworten per E-Mail.',
				name: 'Name',
				email: 'E-Mail',
				category: 'Kategorie',
				message: 'Nachricht',
				placeholder: 'Wie können wir helfen?',
				send: 'Senden',
				close: 'Schließen',
				success: 'Nachricht gesendet. Wir antworten per E-Mail.',
				categories: {
					beta_access: 'Beta-Zugang',
					support: 'Support',
					partnership: 'Partnerschaft',
					billing: 'Abrechnung',
					other: 'Andere Frage'
				}
			}
		}[locale]
	);

	const categories = ['beta_access', 'support', 'partnership', 'billing', 'other'] as const;

	async function submit() {
		busy = true;
		error = '';
		try {
			const response = await fetch('/api/inquiries', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ source: 'chat', name, email, category, message, website: '' })
			});
			const data = await response.json();
			if (!response.ok || !data.ok) {
				error = data.message ?? 'Message could not be sent.';
				return;
			}
			sent = true;
			message = '';
		} catch {
			error = 'Message could not be sent. Please try again.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="fixed right-4 bottom-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
	{#if open}
		<div class="sk-card w-[min(22rem,calc(100vw-2rem))] bg-[var(--sk-card)] p-4 shadow-xl">
			<div class="flex items-start justify-between gap-3">
				<div>
					<h2 class="font-semibold">{copy.title}</h2>
					<p class="mt-1 text-xs text-[var(--sk-muted)]">{copy.expectation}</p>
				</div>
				<FlowbiteButton type="button" variant="ghost" size="sm" onclick={() => (open = false)}>
					{copy.close}
				</FlowbiteButton>
			</div>
			{#if sent}
				<div class="sk-alert sk-alert-success mt-4">{copy.success}</div>
			{:else}
				<form
					class="mt-4 flex flex-col gap-2"
					onsubmit={(event) => {
						event.preventDefault();
						submit();
					}}
				>
					{#if error}<div class="sk-alert sk-alert-error py-2 text-xs">{error}</div>{/if}
					<input type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" />
					<FlowbiteInput
						bind:value={name}
						required
						maxlength="120"
						size="sm"
						class="text-sm"
						placeholder={copy.name}
					/>
					<FlowbiteInput
						bind:value={email}
						required
						type="email"
						size="sm"
						class="text-sm"
						placeholder={copy.email}
					/>
					<FlowbiteSelect
						bind:value={category}
						class="text-sm"
						size="sm"
						aria-label={copy.category}
					>
						{#each categories as item (item)}
							<option value={item}>{copy.categories[item]}</option>
						{/each}
					</FlowbiteSelect>
					<FlowbiteTextarea
						bind:value={message}
						required
						minlength="20"
						maxlength="4000"
						rows="4"
						class="text-sm"
						placeholder={copy.placeholder}
					/>
					<FlowbiteButton type="submit" variant="primary" size="sm" loading={busy} disabled={busy}>
						{busy ? '...' : copy.send}
					</FlowbiteButton>
				</form>
			{/if}
		</div>
	{/if}
	<FlowbiteButton
		type="button"
		variant="primary"
		class="shadow-lg"
		aria-expanded={open}
		aria-label={copy.button}
		onclick={() => (open = !open)}
	>
		<span aria-hidden="true">✉</span>
		<span>{copy.button}</span>
	</FlowbiteButton>
</div>
