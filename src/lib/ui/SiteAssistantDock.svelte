<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import type { Locale } from '$lib/i18n';
	import { withLocale } from '$lib/i18n';
	import MascotBee from '$lib/ui/MascotBee.svelte';
	import {
		ArrowRightOutline,
		CloseOutline,
		MessagesOutline,
		MinusOutline
	} from 'flowbite-svelte-icons';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import FlowbiteInput from '$lib/ui/primitives/FlowbiteInput.svelte';
	import FlowbiteSelect from '$lib/ui/primitives/FlowbiteSelect.svelte';
	import FlowbiteTextarea from '$lib/ui/primitives/FlowbiteTextarea.svelte';

	type AssistantAction =
		| 'start_onboarding'
		| 'show_pricing'
		| 'show_domain_info'
		| 'contact_support'
		| 'login_required'
		| 'open_dashboard'
		| 'open_legal'
		| 'answer'
		| 'fallback';

	type AssistantResponse = {
		ok: boolean;
		action?: AssistantAction;
		reply?: string;
		href?: string;
		prefill?: string;
		message?: string;
	};

	type Message = {
		role: 'assistant' | 'user';
		text: string;
	};

	const copy = {
		tr: {
			title: 'saaskaya asistan',
			open: 'Asistanı aç',
			minimize: 'Küçült',
			close: 'Kapat',
			greeting: 'Merhaba! Site kurma, fiyat veya saaskaya hakkında sorabilirsin.',
			placeholder: 'Örn. Kadıköy’de diyetisyenim, randevulu site istiyorum',
			send: 'Gönder',
			thinking: 'Bakıyorum...',
			contactTitle: 'Destek talebi',
			contactIntro: 'Bunu ekibe iletmek için kısa formu doldurabilirsin.',
			name: 'Ad soyad',
			email: 'E-posta',
			category: 'Konu',
			message: 'Mesaj',
			contactSend: 'Talebi gönder',
			sent: 'Talebin ulaştı. E-posta üzerinden dönüş yapacağız.',
			error: 'Şu an yanıt alınamadı. Birazdan tekrar dene.',
			categories: {
				beta_access: 'Beta erişimi',
				support: 'Destek',
				partnership: 'Partnerlik',
				billing: 'Faturalama',
				other: 'Diğer'
			}
		},
		en: {
			title: 'saaskaya assistant',
			open: 'Open assistant',
			minimize: 'Minimize',
			close: 'Close',
			greeting: 'Hi! Ask about creating a site, pricing, or saaskaya in general.',
			placeholder: 'E.g. I am a dietitian and need a booking website',
			send: 'Send',
			thinking: 'Checking...',
			contactTitle: 'Support request',
			contactIntro: 'Fill this short form to send it to the team.',
			name: 'Full name',
			email: 'Email',
			category: 'Topic',
			message: 'Message',
			contactSend: 'Send request',
			sent: 'Your request arrived. We will reply by email.',
			error: 'No response right now. Please try again shortly.',
			categories: {
				beta_access: 'Beta access',
				support: 'Support',
				partnership: 'Partnership',
				billing: 'Billing',
				other: 'Other'
			}
		},
		de: {
			title: 'saaskaya assistent',
			open: 'Assistent öffnen',
			minimize: 'Minimieren',
			close: 'Schliessen',
			greeting: 'Hallo! Frag zu Website, Preisen oder saaskaya allgemein.',
			placeholder: 'Z. B. Ich bin Ernährungsberaterin und brauche Buchungen',
			send: 'Senden',
			thinking: 'Prüfe...',
			contactTitle: 'Support-Anfrage',
			contactIntro: 'Mit diesem kurzen Formular sendest du es an das Team.',
			name: 'Name',
			email: 'E-Mail',
			category: 'Thema',
			message: 'Nachricht',
			contactSend: 'Anfrage senden',
			sent: 'Deine Anfrage ist angekommen. Wir antworten per E-Mail.',
			error: 'Aktuell keine Antwort. Bitte versuche es gleich erneut.',
			categories: {
				beta_access: 'Beta-Zugang',
				support: 'Support',
				partnership: 'Partnerschaft',
				billing: 'Abrechnung',
				other: 'Sonstiges'
			}
		}
	} satisfies Record<Locale, Record<string, unknown>>;

	let {
		locale,
		userEmail = '',
		currentPath = '/'
	}: { locale: Locale; userEmail?: string | null; currentPath?: string } = $props();

	const t = $derived(copy[locale]);
	let minimized = $state(false);
	let messages = $state<Message[]>([]);
	let input = $state('');
	let busy = $state(false);
	let typing = $state(false);
	let error = $state('');
	let contactMode = $state(false);
	let contactBusy = $state(false);
	let contactSent = $state(false);
	let contactName = $state('');
	let contactEmail = $state('');
	let contactCategory = $state('support');
	let contactMessage = $state('');
	let panelEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		contactEmail = contactEmail || userEmail || '';
	});

	$effect(() => {
		try {
			minimized = localStorage.getItem('saaskaya.assistantMinimized') === '1';
		} catch {
			minimized = false;
		}
	});

	function persistMinimized(value: boolean) {
		minimized = value;
		try {
			localStorage.setItem('saaskaya.assistantMinimized', value ? '1' : '0');
		} catch {
			// localStorage may be unavailable in strict privacy contexts.
		}
	}

	function routeHref(href: string): string {
		if (href === '/dashboard') return href;
		return withLocale(locale, href);
	}

	async function scrollPanel() {
		await tick();
		if (panelEl) panelEl.scrollTop = panelEl.scrollHeight;
	}

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function submit() {
		const message = input.trim();
		if (!message || busy) return;
		input = '';
		error = '';
		busy = true;
		contactMode = false;
		contactSent = false;
		messages = [...messages, { role: 'user', text: message }];
		typing = true;
		const startedAt = performance.now();
		await scrollPanel();
		try {
			const response = await fetch('/api/assistant/route', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ message, currentPath, locale })
			});
			const data = (await response.json()) as AssistantResponse;
			if (!response.ok || !data.ok || !data.reply) throw new Error(data.message ?? 'assistant');
			// Hold the typing bubble briefly so canned replies land at a natural pace;
			// real network latency counts toward the same target.
			const target = Math.min(900, 450 + data.reply.length * 4);
			const elapsed = performance.now() - startedAt;
			if (elapsed < target) await sleep(target - elapsed);
			typing = false;
			messages = [...messages, { role: 'assistant', text: data.reply }];
			await scrollPanel();
			if (data.action === 'contact_support') {
				contactMode = true;
				contactMessage = message;
				return;
			}
			if (data.href) {
				setTimeout(() => void goto(routeHref(data.href as string)), 450);
			}
		} catch {
			error = String(t.error);
		} finally {
			typing = false;
			busy = false;
		}
	}

	async function submitContact() {
		if (contactBusy) return;
		error = '';
		contactBusy = true;
		try {
			const response = await fetch('/api/inquiries', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					source: 'assistant',
					name: contactName,
					email: contactEmail,
					category: contactCategory,
					message: contactMessage,
					website: ''
				})
			});
			const data = (await response.json()) as { ok: boolean; message?: string };
			if (!response.ok || !data.ok) throw new Error(data.message ?? 'inquiry');
			contactSent = true;
			contactMode = false;
			messages = [...messages, { role: 'assistant', text: String(t.sent) }];
			await scrollPanel();
		} catch {
			error = String(t.error);
		} finally {
			contactBusy = false;
		}
	}
</script>

<div class="sk-assistant-dock" data-testid="site-assistant-dock">
	{#if minimized}
		<button
			type="button"
			class="sk-assistant-pill"
			aria-label={String(t.open)}
			onclick={() => persistMinimized(false)}
		>
			<MascotBee size="xs" label="" />
			<span>{String(t.title)}</span>
		</button>
	{:else}
		<div class="sk-assistant-shell">
			<div class="sk-assistant-head">
				<div class="sk-assistant-heading">
					<MascotBee size="xs" label="" />
					<span class="sk-assistant-title">{String(t.title)}</span>
				</div>
				<div class="sk-assistant-controls">
					<button
						type="button"
						aria-label={String(t.minimize)}
						onclick={() => persistMinimized(true)}
					>
						<MinusOutline size="xs" />
					</button>
					<button type="button" aria-label={String(t.close)} onclick={() => persistMinimized(true)}>
						<CloseOutline size="xs" />
					</button>
				</div>
			</div>

			<div class="sk-assistant-panel" bind:this={panelEl} aria-live="polite">
				{#if messages.length === 0}
					<div class="sk-assistant-msg sk-assistant-msg-assistant sk-assistant-greeting">
						{String(t.greeting)}
					</div>
				{/if}
				{#each messages as message}
					<div class={`sk-assistant-msg sk-assistant-msg-${message.role}`}>{message.text}</div>
				{/each}
				{#if typing}
					<div
						class="sk-assistant-msg sk-assistant-msg-assistant sk-assistant-typing"
						aria-hidden="true"
					>
						<span></span><span></span><span></span>
					</div>
				{/if}
				{#if error}<div class="sk-assistant-error">{error}</div>{/if}
			</div>

			{#if contactMode}
				<form
					class="sk-assistant-contact"
					onsubmit={(event) => (event.preventDefault(), submitContact())}
				>
					<div>
						<strong>{String(t.contactTitle)}</strong>
						<p>{String(t.contactIntro)}</p>
					</div>
					<div class="sk-assistant-contact-grid">
						<FlowbiteInput bind:value={contactName} placeholder={String(t.name)} required />
						<FlowbiteInput
							type="email"
							bind:value={contactEmail}
							placeholder={String(t.email)}
							required
						/>
					</div>
					<FlowbiteSelect bind:value={contactCategory}>
						<option value="beta_access">{String(t.categories.beta_access)}</option>
						<option value="support">{String(t.categories.support)}</option>
						<option value="partnership">{String(t.categories.partnership)}</option>
						<option value="billing">{String(t.categories.billing)}</option>
						<option value="other">{String(t.categories.other)}</option>
					</FlowbiteSelect>
					<FlowbiteTextarea
						bind:value={contactMessage}
						placeholder={String(t.message)}
						rows="3"
						required
					/>
					<FlowbiteButton
						type="submit"
						variant="primary"
						loading={contactBusy}
						disabled={contactBusy}
					>
						{contactBusy ? String(t.thinking) : String(t.contactSend)}
					</FlowbiteButton>
				</form>
			{/if}

			<form class="sk-assistant-bar" onsubmit={(event) => (event.preventDefault(), submit())}>
				<input
					bind:value={input}
					placeholder={String(t.placeholder)}
					aria-label={String(t.placeholder)}
					disabled={busy}
				/>
				<button
					class="sk-assistant-send"
					type="submit"
					aria-label={String(t.send)}
					disabled={busy || !input.trim()}
				>
					<ArrowRightOutline size="sm" />
				</button>
			</form>
		</div>
	{/if}
</div>
