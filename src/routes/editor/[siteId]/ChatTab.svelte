<script lang="ts">
	import type { Site } from '$lib/schema/site';
	import type { DraftStore } from '$lib/stores/draft.svelte';
	import type { ChatMessageRow } from '$lib/server/chatLog';
	import ChatBubble from '$lib/ui/ChatBubble.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import TypingIndicator from '$lib/ui/TypingIndicator.svelte';
	import { uiIcons } from '$lib/ui/icons';
	import { getTranslate } from '$lib/i18n/context';

	const t = getTranslate();

	let { store, history = [] }: { store: DraftStore; history?: ChatMessageRow[] } = $props();

	type ChatMessage = { role: 'user' | 'assistant' | 'error'; text: string };
	type Proposal = {
		message: string;
		distilledPrompt: string;
		riskLevel: 'low' | 'medium' | 'high';
		reply: string;
	};

	// svelte-ignore state_referenced_locally
	let messages = $state<ChatMessage[]>(history.map((row) => ({ role: row.role, text: row.body })));
	let input = $state('');
	let busy = $state(false);
	let proposal = $state<Proposal | null>(null);
	let transcriptEl = $state<HTMLDivElement>();
	let redirected = $state<string | null>(null);
	/** Multi-step undo stack — her AI editinde önceki draft buraya push'lanır (max 5). */
	let undoStack = $state<Site[]>([]);
	const MAX_UNDO = 5;

	type PromptNote = { id: string; title: string; text: string };
	const defaultPromptNotes: PromptNote[] = [
		{
			id: 'clarity',
			title: 'Clearer copy',
			text: 'Rewrite the page copy to be clearer, warmer, and easier to scan.'
		},
		{
			id: 'spacing',
			title: 'More breathing room',
			text: 'Give the main sections more breathing room and make the page feel calmer.'
		},
		{
			id: 'trust',
			title: 'Build trust',
			text: 'Make the page feel more trustworthy for a first-time visitor without inventing claims.'
		},
		{
			id: 'mobile',
			title: 'Mobile polish',
			text: 'Improve the mobile reading flow and make every important action easy to find.'
		}
	];
	let promptNotes = $state<PromptNote[]>(defaultPromptNotes);
	let showPromptNotes = $state(false);
	let newPrompt = $state('');

	$effect(() => {
		try {
			const saved = localStorage.getItem(`saaskaya:prompt-notes:${store.site.id}`);
			if (!saved) return;
			const parsed = JSON.parse(saved);
			if (Array.isArray(parsed)) promptNotes = [...defaultPromptNotes, ...parsed];
		} catch {
			/* optional */
		}
	});

	function persistPromptNotes() {
		try {
			localStorage.setItem(
				`saaskaya:prompt-notes:${store.site.id}`,
				JSON.stringify(promptNotes.slice(defaultPromptNotes.length))
			);
		} catch {
			/* optional */
		}
	}

	function usePrompt(text: string) {
		input = text;
		showPromptNotes = false;
	}

	function addPrompt() {
		const text = newPrompt.trim();
		if (!text) return;
		promptNotes.push({ id: `custom-${Date.now()}`, title: 'My prompt', text });
		newPrompt = '';
		persistPromptNotes();
	}

	const riskCopy: Record<Proposal['riskLevel'], string> = {
		low: t('editor.chat.riskLow'),
		medium: t('editor.chat.riskMedium'),
		high: t('editor.chat.riskHigh')
	};

	function changeSummary(before: Site, after: Site): string | null {
		const beforeSlugs = new Set(before.pages.map((page) => page.slug));
		const afterSlugs = new Set(after.pages.map((page) => page.slug));
		const addedPages = after.pages.filter((page) => !beforeSlugs.has(page.slug));
		const removedPages = before.pages.filter((page) => !afterSlugs.has(page.slug));
		const navChanged = JSON.stringify(before.nav.items) !== JSON.stringify(after.nav.items);
		const titleChanged = after.pages.filter((page) => {
			const previous = before.pages.find((p) => p.slug === page.slug);
			return previous && JSON.stringify(previous.title) !== JSON.stringify(page.title);
		});
		// Section-count diff per matching page.
		let sectionsAdded = 0;
		let sectionsRemoved = 0;
		let sectionsMoved = 0;
		let sectionStyleChanged = false;
		for (const afterPage of after.pages) {
			const beforePage = before.pages.find((p) => p.slug === afterPage.slug);
			if (!beforePage) continue;
			const bLen = beforePage.sections.length;
			const aLen = afterPage.sections.length;
			if (aLen > bLen) sectionsAdded += aLen - bLen;
			if (bLen > aLen) sectionsRemoved += bLen - aLen;
			// Detect moves: same set of ids, different order.
			if (
				aLen === bLen &&
				beforePage.sections.map((s) => s.id).join() ===
					afterPage.sections.map((s) => s.id).join() &&
				!beforePage.sections.every((s, i) => s.id === afterPage.sections[i].id)
			) {
				sectionsMoved += aLen;
			}
			// Detect style changes.
			if (!sectionStyleChanged) {
				sectionStyleChanged = afterPage.sections.some((afterSec) => {
					const beforeSec = beforePage.sections.find((s) => s.id === afterSec.id);
					return beforeSec && JSON.stringify(beforeSec.style) !== JSON.stringify(afterSec.style);
				});
			}
		}
		// Detect page reorder: same slugs, different order.
		const beforeOrder = before.pages.map((p) => p.slug);
		const afterOrder = after.pages.map((p) => p.slug);
		const pagesReordered =
			beforeOrder.length === afterOrder.length &&
			JSON.stringify([...beforeOrder].sort()) === JSON.stringify([...afterOrder].sort()) &&
			JSON.stringify(beforeOrder) !== JSON.stringify(afterOrder);
		const pieces: string[] = [];
		if (addedPages.length) {
			pieces.push(
				t('editor.chat.pagesAdded', {
					count: addedPages.length,
					names: addedPages.map((p) => p.title[store.editLocale] ?? p.slug).join(', ')
				})
			);
		}
		if (removedPages.length) {
			pieces.push(t('editor.chat.pagesRemoved', { count: removedPages.length }));
		}
		if (pagesReordered) pieces.push(t('editor.chat.pagesReordered'));
		if (titleChanged.length) {
			pieces.push(t('editor.chat.titlesUpdated', { count: titleChanged.length }));
		}
		if (navChanged) pieces.push(t('editor.chat.navUpdated'));
		if (sectionsAdded) {
			pieces.push(t('editor.chat.sectionsAdded', { count: sectionsAdded }));
		}
		if (sectionsRemoved) {
			pieces.push(t('editor.chat.sectionsRemoved', { count: sectionsRemoved }));
		}
		if (sectionsMoved) {
			pieces.push(t('editor.chat.sectionsMoved', { count: sectionsMoved }));
		}
		if (sectionStyleChanged) pieces.push(t('editor.chat.sectionStyleUpdated'));
		if (!pieces.length && JSON.stringify(before.theme) !== JSON.stringify(after.theme)) {
			pieces.push(t('editor.chat.themeUpdated'));
		}
		if (!pieces.length) return null;
		return `${t('editor.chat.changeSummaryPrefix')} ${pieces.join(' ')}`;
	}

	function firstAddedPageSlug(before: Site, after: Site): string | null {
		const beforeSlugs = new Set(before.pages.map((page) => page.slug));
		return after.pages.find((page) => !beforeSlugs.has(page.slug))?.slug ?? null;
	}

	$effect(() => {
		void messages.length;
		void busy;
		void proposal;
		void redirected;
		if (!transcriptEl) return;
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		transcriptEl.scrollTo({
			top: transcriptEl.scrollHeight,
			behavior: smooth ? 'smooth' : 'auto'
		});
	});

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
				messages.push({ role: 'error', text: data.message ?? t('editor.chat.genericError') });
				return;
			}
			switch (data.kind) {
				case 'applied': {
					const before = $state.snapshot(store.site) as Site;
					const after = data.site as Site;

					// Honest chat: AI değişiklik yapmadıysa kullanıcıya bildir
					const summary = changeSummary(before, after);
					if (!summary && JSON.stringify(before) === JSON.stringify(after)) {
						messages.push({
							role: 'assistant',
							text: data.reply || 'Hiçbir değişiklik yapılmadı.'
						});
						proposal = null;
						break;
					}

					// Multi-step undo stack
					undoStack.push(before);
					if (undoStack.length > MAX_UNDO) undoStack.shift();

					store.replace(after);
					const focusSlug = firstAddedPageSlug(before, after);
					if (focusSlug) store.currentSlug = focusSlug;
					proposal = null;
					messages.push({ role: 'assistant', text: data.reply });
					if (summary) messages.push({ role: 'assistant', text: summary });
					if (window.matchMedia('(max-width: 1023px)').matches) {
						messages.push({ role: 'assistant', text: t('editor.chat.viewPreviewHint') });
					}
					break;
				}
				case 'proposal':
					proposal = { message: String(body.message), ...data.proposal };
					break;
				case 'redirect':
					messages.push({ role: 'assistant', text: data.reply });
					redirected = String(body.message);
					break;
				default:
					messages.push({ role: 'assistant', text: data.reply });
			}
		} catch {
			messages.push({ role: 'error', text: t('editor.chat.networkError') });
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
		messages.push({ role: 'assistant', text: t('editor.chat.cancelledNotice') });
	}

	function forceSend() {
		if (!redirected || busy) return;
		void dispatch({ message: redirected, force: true });
	}

	async function undo() {
		if (!undoStack.length || busy) return;
		busy = true;
		try {
			const previous = undoStack.pop()!;
			store.replace(previous);
			await store.save();
			messages.push({ role: 'assistant', text: `Geri alındı (${undoStack.length} adım kaldı).` });
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex h-full flex-col gap-3">
	<div
		class="shrink-0 rounded-[12px] border border-[#e4d7bb] bg-[#f8edc9] p-3 shadow-[2px_3px_0_rgb(23_22_20/.08)] rotate-[-.35deg]"
	>
		<button
			type="button"
			class="flex w-full items-center justify-between text-left"
			onclick={() => (showPromptNotes = !showPromptNotes)}
			aria-expanded={showPromptNotes}
		>
			<span
				><span class="text-sm font-semibold">Prompt notes</span><span
					class="ml-2 text-xs text-black/55">copy-ready ideas</span
				></span
			>
			<span class="text-xs text-black/55">{showPromptNotes ? 'Hide' : 'Open'}</span>
		</button>
		{#if showPromptNotes}
			<div class="mt-3 grid gap-2 sm:grid-cols-2">
				{#each promptNotes as note (note.id)}
					<button
						type="button"
						class="rounded-[9px] border border-[#e2d2a8] bg-[#fff8df] p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
						onclick={() => usePrompt(note.text)}
					>
						<span class="block text-xs font-semibold">{note.title}</span>
						<span class="mt-1 block line-clamp-2 text-[11px] leading-4 text-black/60"
							>{note.text}</span
						>
					</button>
				{/each}
			</div>
			<form
				class="mt-2 flex gap-2"
				onsubmit={(e) => {
					e.preventDefault();
					addPrompt();
				}}
			>
				<input
					class="sk-input min-w-0 flex-1 bg-[#fff8df] text-xs"
					bind:value={newPrompt}
					placeholder="Save your own prompt..."
				/>
				<FlowbiteButton variant="ghost" size="sm" type="submit" disabled={!newPrompt.trim()}
					>Save</FlowbiteButton
				>
			</form>
		{/if}
	</div>
	<div bind:this={transcriptEl} class="flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto">
		{#if messages.length === 0}
			<ChatBubble role="assistant">
				<span class="sk-mono mb-2 block text-[10px] text-[var(--sk-faint)]"
					>{t('editor.chat.assistantLabel')}</span
				>
				<span>{t('editor.chat.greeting')}</span>
			</ChatBubble>
		{/if}
		{#each messages as msg, i (i)}
			<ChatBubble role={msg.role} animate={i >= history.length}>{msg.text}</ChatBubble>
		{/each}

		{#if redirected && !busy}
			<FlowbiteButton
				type="button"
				variant="ghost"
				size="sm"
				class="self-start"
				onclick={forceSend}
			>
				{t('editor.chat.forceSendPrompt')}
				{@html uiIcons.arrowRight(14)}
			</FlowbiteButton>
		{/if}

		{#if undoStack.length > 0 && !busy && !proposal}
			<FlowbiteButton type="button" variant="ghost" size="sm" class="self-start" onclick={undo}>
				{t('editor.chat.undo')} ({undoStack.length})
			</FlowbiteButton>
		{/if}

		{#if proposal}
			<div class="sk-card bg-[var(--sk-shell)] p-4">
				<div class="flex flex-col gap-2">
					<p class="text-sm font-semibold">{t('editor.chat.understoodLabel')}</p>
					<p class="text-sm whitespace-pre-line">{proposal.distilledPrompt}</p>
					<p class="text-xs leading-5 text-[var(--sk-muted)]">
						{riskCopy[proposal.riskLevel]}
						{t('editor.chat.previewNote')}
					</p>
					<div class="mt-1 flex flex-wrap gap-2">
						<FlowbiteButton
							type="button"
							variant="primary"
							size="sm"
							onclick={approve}
							disabled={busy}
							loading={busy}
						>
							{t('editor.chat.apply')}
						</FlowbiteButton>
						<FlowbiteButton
							type="button"
							variant="ghost"
							size="sm"
							onclick={cancel}
							disabled={busy}
						>
							{t('editor.chat.cancelProposal')}
						</FlowbiteButton>
					</div>
				</div>
			</div>
		{/if}

		{#if busy}
			<TypingIndicator />
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
			class="sk-input min-h-9 flex-1 py-1.5 text-base sm:text-sm"
			placeholder={t('editor.chat.inputPlaceholder')}
			bind:value={input}
			enterkeyhint="send"
			onfocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest' })}
			disabled={busy || proposal !== null}
		/>
		<FlowbiteButton
			type="submit"
			variant="primary"
			size="sm"
			disabled={busy || proposal !== null || !input.trim()}
			loading={busy}
		>
			{t('editor.chat.send')}
		</FlowbiteButton>
	</form>

	<p class="text-xs leading-5 text-[var(--sk-faint)]">
		{t('editor.chat.freeEditsNote')}
	</p>
</div>
