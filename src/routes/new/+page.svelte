<script lang="ts">
	import { goto } from '$app/navigation';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import {
		ONBOARDING_QUESTIONS,
		nextQuestion,
		type OnboardingAnswers,
		type Question
	} from '$lib/onboarding/questions';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let answers = $state<OnboardingAnswers>({});
	$effect(() => {
		// Resyncs from a fresh `load()` (e.g. the post-verify redirect back here) —
		// local optimistic updates below don't touch `data`, so no feedback loop.
		answers = data.pending?.answers ?? {};
	});
	let busy = $state(false);
	let errorMessage = $state('');
	let offTopicMessage = $state('');
	let useRaw = $state(false);
	let rawText = $state('');

	// Per-question input buffers — reset whenever the active question changes.
	let textValue = $state('');
	let multiValue = $state<string[]>([]);
	let listItems = $state<string[]>([]);
	let listInput = $state('');

	const hasRaw = $derived(
		typeof answers.rawDescription === 'string' &&
			(answers.rawDescription as string).trim().length >= 30
	);
	const current = $derived<Question | undefined>(hasRaw ? undefined : nextQuestion(answers));
	const answeredQuestions = $derived(ONBOARDING_QUESTIONS.filter((q) => q.id in answers));

	$effect(() => {
		current;
		textValue = '';
		multiValue = [];
		listItems = [];
		listInput = '';
		offTopicMessage = '';
	});

	function formatAnswer(q: Question, value: unknown): string {
		if (q.kind === 'choice')
			return q.options?.find((o) => o.value === value)?.label ?? String(value);
		if (q.kind === 'multi_choice') {
			const values = Array.isArray(value) ? value : [];
			return values.map((v) => q.options?.find((o) => o.value === v)?.label ?? v).join(', ');
		}
		if (q.kind === 'list_text')
			return Array.isArray(value) ? value.join(', ') : String(value ?? '');
		const text = String(value ?? '').trim();
		return text || '(boş geçildi)';
	}

	async function submitAnswer(questionId: string, value: unknown) {
		if (busy) return;
		busy = true;
		errorMessage = '';
		offTopicMessage = '';
		try {
			const res = await fetch('/api/onboarding/answer', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ questionId, value })
			});
			const resData = await res.json();
			if (!res.ok || !resData.ok) {
				if (resData.kind === 'off_topic') {
					offTopicMessage = resData.message;
				} else {
					errorMessage = resData.message ?? 'Bir şeyler ters gitti.';
				}
				return;
			}
			answers = { ...answers, [questionId]: value };
			if (questionId === 'rawDescription') useRaw = false;
		} catch {
			errorMessage = 'Ağ hatası — lütfen tekrar dene.';
		} finally {
			busy = false;
		}
	}

	function toggleMulti(value: string) {
		multiValue = multiValue.includes(value)
			? multiValue.filter((v) => v !== value)
			: [...multiValue, value];
	}

	function addListItem() {
		const value = listInput.trim();
		if (!value || listItems.length >= 8 || listItems.includes(value)) return;
		listItems = [...listItems, value];
		listInput = '';
	}

	function removeListItem(value: string) {
		listItems = listItems.filter((v) => v !== value);
	}

	async function completeFlow() {
		if (!data.user) {
			await goto('/login');
			return;
		}
		busy = true;
		errorMessage = '';
		try {
			const finishRes = await fetch('/api/onboarding/finish', { method: 'POST' });
			const finishData = await finishRes.json();
			if (!finishRes.ok || !finishData.ok) {
				errorMessage = finishData.message ?? 'Bir şeyler ters gitti.';
				return;
			}
			const genRes = await fetch('/api/sites', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ description: finishData.description })
			});
			const genData = await genRes.json();
			if (!genRes.ok || !genData.ok) {
				errorMessage = genData.message ?? 'Bir şeyler ters gitti.';
				return;
			}
			await goto(`/editor/${genData.id}`);
		} catch {
			errorMessage = 'Ağ hatası — lütfen tekrar dene.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Yeni site · saaskaya</title>
	<meta
		name="description"
		content="Birkaç soruya yanıt ver, saaskaya senin için doğrulanmış bir yapı üzerinden çok dilli bir web sitesi hazırlasın."
	/>
</svelte:head>

<AppCanvasShell label="saaskaya.app / yeni site">
	{#snippet right()}
		<a href="/" class="sk-btn sk-btn-secondary sk-btn-sm">Anasayfa</a>
	{/snippet}

	<div class="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
		<div class="pt-2">
			<a href="/" class="sk-link text-sm text-[var(--sk-faint)]">← saaskaya</a>
			<h1 class="sk-display mt-3 text-4xl leading-none sm:text-[42px]">Birkaç soru, bir site.</h1>
			<p class="mt-3 text-[15px] leading-6 text-[var(--sk-muted)]">
				Üye olmadan da başlayabilirsin — sorulara yanıt ver, en sonda "Ücretsiz Başla" ile hesabını
				oluştur. Cevapların kaybolmaz.
			</p>
			<div class="sk-soft mt-6 p-4">
				<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Rehberli akış</div>
				<div class="mt-3 flex flex-col gap-2 text-sm text-[var(--sk-muted)]">
					<div>01 · birkaç soruya yanıt ver</div>
					<div>02 · ücretsiz hesabını oluştur</div>
					<div>03 · çok dilli içerik üretilsin</div>
					<div>04 · doğrulanmış yapı ile önizle ve yayınla</div>
				</div>
			</div>
		</div>

		<AppCard class="flex flex-col gap-3 p-6 sm:p-8">
			<div class="flex max-h-[28rem] min-h-32 flex-1 flex-col gap-2 overflow-y-auto">
				{#each answeredQuestions as q (q.id)}
					<div class="sk-card max-w-[92%] p-3 text-sm leading-6">{q.prompt}</div>
					<div class="flex justify-end">
						<div
							class="max-w-[92%] rounded-[12px] bg-[#171614] px-3 py-2 text-sm leading-6 text-[#f3ecdd]"
						>
							{formatAnswer(q, answers[q.id])}
						</div>
					</div>
				{/each}

				{#if current && !useRaw}
					<div class="sk-card max-w-[92%] p-3 text-sm leading-6">
						{current.prompt}
						{#if current.helper}
							<div class="mt-1 text-xs text-[var(--sk-faint)]">{current.helper}</div>
						{/if}
					</div>
				{:else if !current}
					<div class="sk-card max-w-[92%] p-3 text-sm leading-6">
						Cevapların tamam! 🎉 {#if !data.user}Hesabını oluşturunca sitenin oluşturulmaya hazır
							olacak.{:else}Şimdi sitenin oluşturulabilir.{/if}
					</div>
				{/if}

				{#if offTopicMessage}
					<div class="sk-card max-w-[92%] p-3 text-sm leading-6">{offTopicMessage}</div>
				{/if}

				{#if errorMessage}
					<div class="sk-alert sk-alert-error px-3 py-2 text-xs">{errorMessage}</div>
				{/if}

				{#if busy}
					<div class="sk-card w-fit p-3 text-sm">
						<span class="loading loading-dots loading-sm"></span>
					</div>
				{/if}
			</div>

			{#if useRaw}
				<div class="flex flex-col gap-2">
					<div class="relative">
						<textarea
							class="sk-textarea min-h-40 text-[14.5px]"
							rows="7"
							placeholder="Örn: Ben Av. Zeynep Demir. İstanbul'da 12 yıldır aile hukuku ve boşanma davalarına bakıyorum. Ofisim Kadıköy'de…"
							bind:value={rawText}
							disabled={busy}></textarea>
						<div
							class="absolute right-4 bottom-3 font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]"
						>
							{rawText.trim().length} / min. 30
						</div>
					</div>
					<div class="flex flex-wrap gap-2">
						<button
							type="button"
							class="sk-btn sk-btn-primary sk-btn-sm"
							disabled={busy || rawText.trim().length < 30}
							onclick={() => submitAnswer('rawDescription', rawText)}
						>
							Gönder
						</button>
						<button
							type="button"
							class="sk-btn sk-btn-ghost sk-btn-sm"
							disabled={busy}
							onclick={() => (useRaw = false)}
						>
							← Sorulara dön
						</button>
					</div>
				</div>
			{:else if current?.kind === 'choice'}
				<div class="flex flex-wrap gap-2">
					{#each current.options ?? [] as option (option.value)}
						<button
							type="button"
							class="sk-btn sk-btn-secondary sk-btn-sm"
							disabled={busy}
							onclick={() => submitAnswer(current!.id, option.value)}
						>
							{option.label}
						</button>
					{/each}
				</div>
			{:else if current?.kind === 'multi_choice'}
				<div class="flex flex-col gap-2">
					<div class="flex flex-wrap gap-2">
						{#each current.options ?? [] as option (option.value)}
							<button
								type="button"
								class="sk-btn sk-btn-sm {multiValue.includes(option.value)
									? 'sk-btn-primary'
									: 'sk-btn-secondary'}"
								disabled={busy}
								onclick={() => toggleMulti(option.value)}
							>
								{option.label}
							</button>
						{/each}
					</div>
					<button
						type="button"
						class="sk-btn sk-btn-primary sk-btn-sm w-fit"
						disabled={busy || multiValue.length === 0}
						onclick={() => submitAnswer(current!.id, multiValue)}
					>
						Devam et
					</button>
				</div>
			{:else if current?.kind === 'list_text'}
				<div class="flex flex-col gap-2">
					{#if listItems.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each listItems as item (item)}
								<span class="sk-pill">
									{item}
									<button
										type="button"
										class="ml-1 opacity-60 hover:opacity-100"
										onclick={() => removeListItem(item)}>×</button
									>
								</span>
							{/each}
						</div>
					{/if}
					<form
						class="flex gap-2"
						onsubmit={(e) => {
							e.preventDefault();
							addListItem();
						}}
					>
						<input
							type="text"
							class="sk-input min-h-9 flex-1 py-1.5 text-sm"
							placeholder="Bir hizmet yaz ve ekle…"
							bind:value={listInput}
							disabled={busy || listItems.length >= 8}
						/>
						<button
							type="submit"
							class="sk-btn sk-btn-secondary sk-btn-sm"
							disabled={busy || !listInput.trim() || listItems.length >= 8}
						>
							Ekle
						</button>
					</form>
					<button
						type="button"
						class="sk-btn sk-btn-primary sk-btn-sm w-fit"
						disabled={busy || listItems.length === 0}
						onclick={() => submitAnswer(current!.id, listItems)}
					>
						Devam et
					</button>
				</div>
			{:else if current?.kind === 'short_text' || current?.kind === 'open_text'}
				<form
					class="flex gap-2"
					onsubmit={(e) => {
						e.preventDefault();
						submitAnswer(current!.id, textValue);
					}}
				>
					{#if current.kind === 'open_text'}
						<textarea
							class="sk-textarea min-h-20 flex-1 py-1.5 text-sm"
							placeholder="Yanıtını yaz…"
							bind:value={textValue}
							disabled={busy}></textarea>
					{:else}
						<input
							type="text"
							class="sk-input min-h-9 flex-1 py-1.5 text-sm"
							placeholder="Yanıtını yaz…"
							bind:value={textValue}
							disabled={busy}
						/>
					{/if}
					<button
						type="submit"
						class="sk-btn sk-btn-primary sk-btn-sm"
						disabled={busy || (current.required && !textValue.trim())}
					>
						Gönder
					</button>
				</form>
				{#if !current.required}
					<button
						type="button"
						class="sk-btn sk-btn-ghost sk-btn-sm w-fit"
						disabled={busy}
						onclick={() => submitAnswer(current!.id, '')}
					>
						Boş geç
					</button>
				{/if}
			{:else if !current}
				<button
					type="button"
					class="sk-btn sk-btn-primary sk-btn-lg w-full"
					disabled={busy}
					onclick={completeFlow}
				>
					{#if busy}
						<span class="loading loading-spinner loading-sm"></span>
						{data.user ? 'Siten oluşturuluyor…' : 'Yönlendiriliyor…'}
					{:else if data.user}
						Siteni oluştur
					{:else}
						Ücretsiz Başla
					{/if}
				</button>
			{/if}

			{#if !useRaw && current}
				<button
					type="button"
					class="sk-btn sk-btn-ghost sk-btn-sm w-fit"
					disabled={busy}
					onclick={() => (useRaw = true)}
				>
					Kendi cümlelerimle anlatmak istiyorum →
				</button>
			{/if}

			<p class="text-xs leading-5 text-[var(--sk-faint)]">
				AI, sorulara verdiğin yanıtları doğrulanmış bir site yapısına dönüştürür — asla kod yazmaz.
				Sorular ücretsizdir; yalnızca site oluşturma aylık AI bütçeni kullanır.
			</p>
		</AppCard>
	</div>
</AppCanvasShell>
