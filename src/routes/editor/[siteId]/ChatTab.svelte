<script lang="ts">
	import type { Site } from '$lib/schema/site';
	import type { DraftStore } from '$lib/stores/draft.svelte';

	let { store }: { store: DraftStore } = $props();

	type ChatMessage = { role: 'user' | 'assistant' | 'error'; text: string };
	type Proposal = {
		message: string; // original user message — resent verbatim on confirm
		distilledPrompt: string;
		riskLevel: 'low' | 'medium' | 'high';
		reply: string;
	};

	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let busy = $state(false);
	let proposal = $state<Proposal | null>(null);
	/** Original message behind the last off-topic redirect ("yine de gönder"). */
	let redirected = $state<string | null>(null);
	/** Draft as it was before the last applied AI edit — one-step Geri Al. */
	let undoSite = $state<Site | null>(null);

	const riskCopy: Record<Proposal['riskLevel'], string> = {
		low: 'Küçük bir metin değişikliği.',
		medium: 'Bu değişiklik sitenin görünümünü değiştirecek.',
		high: 'Bu büyük bir değişiklik — uygulandıktan sonra preview’da mutlaka kontrol et.'
	};

	function historyForGate() {
		return messages
			.filter((m) => m.role !== 'error')
			.slice(-6)
			.map((m) => ({ role: m.role as 'user' | 'assistant', text: m.text }));
	}

	async function post(body: Record<string, unknown>) {
		const res = await fetch(`/api/sites/${store.site.id}/chat`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		});
		return { ok: res.ok, data: await res.json() };
	}

	async function dispatch(body: Record<string, unknown>) {
		busy = true;
		redirected = null;
		try {
			const { ok, data } = await post(body);
			if (!ok || !data.ok) {
				messages.push({ role: 'error', text: data.message ?? 'Bir şeyler ters gitti.' });
				return;
			}
			switch (data.kind) {
				case 'applied': {
					// snapshot BEFORE replacing → tek tık Geri Al
					undoSite = $state.snapshot(store.site) as Site;
					store.replace(data.site); // server-persisted draft → live preview
					proposal = null;
					messages.push({ role: 'assistant', text: data.reply });
					break;
				}
				case 'proposal':
					proposal = { message: String(body.message), ...data.proposal };
					break;
				case 'redirect':
					messages.push({ role: 'assistant', text: data.reply });
					redirected = String(body.message);
					break;
				default: // 'reply' | 'help' — gate answered, 0 düzenleme hakkı harcandı
					messages.push({ role: 'assistant', text: data.reply });
			}
		} catch {
			messages.push({ role: 'error', text: 'Ağ hatası — lütfen tekrar dene.' });
		} finally {
			busy = false;
		}
	}

	function send() {
		const message = input.trim();
		if (!message || busy || proposal) return;
		messages.push({ role: 'user', text: message });
		input = '';
		void dispatch({ message, history: historyForGate() });
	}

	function approve() {
		if (!proposal) return;
		void dispatch({
			message: proposal.message,
			approvedPrompt: proposal.distilledPrompt,
			riskLevel: proposal.riskLevel
		});
	}

	function cancel() {
		proposal = null;
		messages.push({ role: 'assistant', text: 'İptal edildi — hiçbir şey değişmedi.' });
	}

	function forceSend() {
		if (!redirected || busy) return;
		void dispatch({ message: redirected, force: true });
	}

	async function undo() {
		if (!undoSite || busy) return;
		busy = true;
		try {
			store.replace(undoSite);
			await store.save(); // replace() alone doesn't persist — the server had the AI version
			undoSite = null;
			messages.push({ role: 'assistant', text: 'Değişiklik geri alındı.' });
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex h-full flex-col gap-3">
	<div class="flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto">
		{#if messages.length === 0}
			<div class="sk-card max-w-[92%] p-3 text-sm leading-6">
				<div class="sk-mono mb-2 text-[10px] text-[var(--sk-faint)]">Assistant</div>
				<p>
					Merhaba! Siten hakkında konuşalım — ne değiştirmek istersin? Renk, metin, bölümler,
					sayfalar… anlat yeter.
				</p>
			</div>
		{/if}
		{#each messages as msg, i (i)}
			{#if msg.role === 'user'}
				<div class="flex justify-end">
					<div
						class="max-w-[92%] rounded-[12px] bg-[#171614] px-3 py-2 text-sm leading-6 text-[#f3ecdd]"
					>
						{msg.text}
					</div>
				</div>
			{:else if msg.role === 'assistant'}
				<div class="sk-card max-w-[92%] p-3 text-sm leading-6">
					{msg.text}
				</div>
			{:else}
				<div class="sk-alert sk-alert-error px-3 py-2 text-xs">{msg.text}</div>
			{/if}
		{/each}

		{#if redirected && !busy}
			<button type="button" class="sk-btn sk-btn-ghost sk-btn-sm self-start" onclick={forceSend}>
				Sitenle ilgili olduğunu düşünüyorsan yine de gönder →
			</button>
		{/if}

		{#if undoSite && !busy && !proposal}
			<button type="button" class="sk-btn sk-btn-ghost sk-btn-sm self-start" onclick={undo}>
				Geri Al
			</button>
		{/if}

		{#if proposal}
			<div class="sk-card bg-[var(--sk-shell)] p-4">
				<div class="flex flex-col gap-2">
					<p class="text-sm font-semibold">Anladığım kadarıyla:</p>
					<p class="text-sm whitespace-pre-line">{proposal.distilledPrompt}</p>
					<p class="text-xs leading-5 text-[var(--sk-muted)]">
						{riskCopy[proposal.riskLevel]} Değişiklik taslağına uygulanır — yayınlamadan önce preview&rsquo;da
						kontrol edebilirsin.
					</p>
					<div class="mt-1 flex flex-wrap gap-2">
						<button
							type="button"
							class="sk-btn sk-btn-primary sk-btn-sm"
							onclick={approve}
							disabled={busy}
						>
							Uygula
						</button>
						<button
							type="button"
							class="sk-btn sk-btn-ghost sk-btn-sm"
							onclick={cancel}
							disabled={busy}
						>
							İptal
						</button>
					</div>
				</div>
			</div>
		{/if}

		{#if busy}
			<div class="sk-card w-fit p-3 text-sm">
				<span class="loading loading-dots loading-sm"></span>
			</div>
		{/if}
	</div>

	<form
		class="flex gap-2"
		onsubmit={(e) => {
			e.preventDefault();
			send();
		}}
	>
		<input
			type="text"
			class="sk-input min-h-9 flex-1 py-1.5 text-sm"
			placeholder="ör. Fiyatlandırma için bir SSS bölümü ekle…"
			bind:value={input}
			disabled={busy || proposal !== null}
		/>
		<button
			type="submit"
			class="sk-btn sk-btn-primary sk-btn-sm"
			disabled={busy || proposal !== null || !input.trim()}
		>
			Gönder
		</button>
	</form>

	<p class="text-xs leading-5 text-[var(--sk-faint)]">
		Sorular ve konu dışı mesajlar bütçeni harcamaz; yalnızca uygulanan düzenlemeler aylık AI
		düzenleme hakkından düşer. Metin/renk düzenlemeleri Content ve Theme sekmelerinde her zaman
		ücretsizdir.
	</p>
</div>
