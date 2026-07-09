<script lang="ts">
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();

	const plans = [
		{
			name: 'Free',
			price: '0₺',
			period: '/ay',
			tagline: 'Dene ve gör',
			highlight: false,
			features: [
				'1 taslak site',
				'*.saaskaya.com alt alan adı',
				'1 AI site üretimi / ay',
				'10 AI sohbet düzenleme / ay',
				'3 sayfa',
				'20 MB medya',
				'TR dil',
				'İletişim formu',
				'saaskaya rozeti (zorunlu)',
				'Veri dışa aktarma'
			]
		},
		{
			name: 'Pro',
			price: '299₺',
			period: '/ay',
			tagline: 'Profesyonel pratik için',
			highlight: true,
			features: [
				'1 yayınlanmış site',
				'Özel domain + alt alan adı',
				'5 AI site üretimi / ay',
				'50 AI sohbet düzenleme / ay',
				'8 sayfa',
				'500 MB medya',
				'TR + 1 dil (EN/DE)',
				'İletişim formu + e-posta bildirimi',
				'saaskaya rozeti (zorunlu)',
				'Veri dışa aktarma',
				'Öncelikli e-posta destek'
			]
		},
		{
			name: 'Premium',
			price: '599₺',
			period: '/ay',
			tagline: 'Done-with-you',
			highlight: false,
			features: [
				'1 yayınlanmış site',
				'Özel domain + alt alan adı',
				'10 AI site üretimi / ay',
				'200 AI sohbet düzenleme / ay',
				'20 sayfa',
				'2 GB medya',
				'TR + EN + DE',
				'İletişim + e-posta + lead paneli',
				'Rozet kaldırılabilir',
				'1 insan incelemesi / ay dahil',
				'Öncelikli + insan inceleme'
			]
		}
	];

	const faqs = [
		{
			q: 'Domain dahil mi?',
			a: 'Domain ayrı yıllık ~500₺ (≈15€). Pro/Premium abonelik domain yenilemesini kapsamaz; tescil ve yenileme ayrı faturalanır. Domain her zaman ödeme sonrası tescil edilir.'
		},
		{
			q: 'AI kredisi ne demek?',
			a: '1 AI sohbet düzenleme = 1 kredi, 1 site üretimi = 1 kredi. Gatekeeper triage, sorular ve yönlendirmeler ücretsiz. Doğrudan metin/tema/medya düzenleme asla kredi tüketmez.'
		},
		{
			q: 'Kredilerim biterse ne olur?',
			a: 'Doğrudan düzenleme her zaman çalışır. AI üretimi/düzenleme için sonraki aya beklersiniz veya plan yükseltirsiniz. Ek kredi satın alma (top-up) yakında.'
		},
		{
			q: 'İptal edersem ne olur?',
			a: 'Ödeme dönemi sonuna kadar ücretli özellikler aktif, sonra 30 gün grace. Grace sonunda domain ayrılır, site alt alan adında yayında kalır. İlk 14 gün koşulsuz iade (domain hariç).'
		},
		{
			q: 'Beta döneminde farklılık var mı?',
			a: 'Kapalı beta davetlidir. Beta süresince ödeme yöntemleri operatör tarafından kontrol edilir (PAYMENT_MODE). Genel lansmanda Stripe + banka havalesi tam aktif olur.'
		}
	];
</script>

<svelte:head>
	<title>Fiyatlandırma · saaskaya</title>
	<link rel="canonical" href="https://saaskaya.com/pricing" />
	<meta
		name="description"
		content="saaskaya fiyatlandırması: Free, Pro (299₺/ay) ve Premium (599₺/ay). Psikologlar için AI web sitesi platformu."
	/>
</svelte:head>

<AppCanvasShell contentClass="relative px-5 py-8 sm:px-10 sm:py-14 lg:py-16">
	{#snippet right()}
		{#if data.user}
			<a href="/dashboard" class="sk-btn sk-btn-secondary sk-btn-sm">Dashboard</a>
		{:else}
			<a href="/login" class="sk-btn sk-btn-secondary sk-btn-sm">Giriş</a>
		{/if}
	{/snippet}

	<div class="mx-auto flex w-full max-w-4xl flex-col items-start gap-5 pt-6 sm:pt-2">
		<BrandMark />
		<div class="flex flex-wrap gap-2">
			<StatusPill>Fiyatlandırma</StatusPill>
			<StatusPill>KDV hariç</StatusPill>
		</div>
		<h1 class="sk-display text-4xl leading-none sm:text-[42px]">
			Profesyonel pratik için net fiyat
		</h1>
		<p class="max-w-xl text-[17px] leading-8 text-[var(--sk-muted)]">
			Ücretsiz dene, beğen. Pro ile özel domain + çok dilli site + AI düzenleme. Premium ile insan
			incelemesi dahil.
		</p>
	</div>

	<!-- Plan cards -->
	<div class="mx-auto mt-10 w-full max-w-4xl">
		<div class="grid gap-4 sm:grid-cols-3">
			{#each plans as plan (plan.name)}
				<div
					class="sk-card flex flex-col p-5 {plan.highlight
						? 'border-[var(--sk-ink)] ring-1 ring-[var(--sk-ink)]'
						: ''}"
				>
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-semibold">{plan.name}</h2>
						{#if plan.highlight}
							<StatusPill tone="success">Önerilen</StatusPill>
						{/if}
					</div>
					<p class="mt-1 text-xs text-[var(--sk-muted)]">{plan.tagline}</p>
					<div class="mt-4 flex items-baseline gap-1">
						<span class="sk-display text-3xl">{plan.price}</span>
						<span class="text-sm text-[var(--sk-faint)]">{plan.period}</span>
					</div>
					<ul class="mt-4 flex flex-1 flex-col gap-1.5">
						{#each plan.features as f (f)}
							<li class="flex items-start gap-2 text-xs text-[var(--sk-muted)]">
								<span class="mt-0.5 text-[var(--sk-ink)]">✓</span>
								<span>{f}</span>
							</li>
						{/each}
					</ul>
					{#if plan.name === 'Free'}
						<a href="/new" class="sk-btn sk-btn-secondary sk-btn-sm mt-5">Ücretsiz başla</a>
					{:else if data.user}
						<a href="/dashboard" class="sk-btn sk-btn-primary sk-btn-sm mt-5">
							{plan.name}'e yükselt
						</a>
					{:else}
						<a href="/login" class="sk-btn sk-btn-primary sk-btn-sm mt-5">
							{plan.name}'e başla
						</a>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Domain note -->
	<div class="mx-auto mt-6 w-full max-w-4xl">
		<div class="sk-soft p-4 text-xs text-[var(--sk-muted)]">
			<strong class="text-[var(--sk-ink)]">Domain:</strong> .com ve popüler TLD'ler ~500₺/yıl (≈15€).
			Pro/Premium aboneliğe dahil değildir; yıllık ayrı faturalanır. Banka havalesi veya Stripe ile ödenebilir.
			Tescil her zaman ödeme sonrası yapılır.
		</div>
	</div>

	<!-- FAQ -->
	<div class="mx-auto mt-10 w-full max-w-4xl border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Sıkça sorulan sorular</div>
		<dl class="mt-4 flex flex-col gap-4">
			{#each faqs as faq (faq.q)}
				<div class="sk-card p-4">
					<dt class="text-sm font-semibold">{faq.q}</dt>
					<dd class="mt-1.5 text-xs leading-6 text-[var(--sk-muted)]">{faq.a}</dd>
				</div>
			{/each}
		</dl>
	</div>

	<!-- CTA -->
	<div class="mx-auto mt-10 w-full max-w-4xl">
		<div class="sk-card flex flex-col items-center gap-3 p-6 text-center">
			<p class="text-sm text-[var(--sk-muted)]">
				Henüz emin değil misiniz? Önce siteni üret, sonra karar ver.
			</p>
			<a href="/new" class="sk-btn sk-btn-primary sk-btn-lg">Pratikini anlat → siteni gör</a>
		</div>
	</div>
</AppCanvasShell>
