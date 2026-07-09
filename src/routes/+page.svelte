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

	const steps = [
		{
			n: '1',
			title: 'Anlat',
			desc: 'Pratiğini, uzmanlığını ve tarzını birkaç cümlede yaz. Form doldurma yok.'
		},
		{
			n: '2',
			title: 'Üret',
			desc: 'AI, kontrolü altında, doğrulanmış yapısal veriyle çok dilli siteni oluşturur.'
		},
		{
			n: '3',
			title: 'Düzenle',
			desc: 'Sohbetle "daha sıcak olsun", "hizmet ekle" de. Doğrudan metin düzenleme ücretsiz.'
		},
		{
			n: '4',
			title: 'Yayınla',
			desc: 'Alt alan adında anında yayınla. Pro ile kendi domainine taşı.'
		}
	];

	const features = [
		{
			title: 'Sohbetle düzenleme',
			desc: 'Form değil, sohbet. "Hakkımda bölümünü daha samimi yap" de, AI taslağı güncellesin.'
		},
		{
			title: 'Çok dilli (TR · EN · DE)',
			desc: 'Yabancı danışanlar için tek tıkla İngilizce/Almanca sürüm. Çeviri AI ile, sen onayla.'
		},
		{
			title: 'Güvenli AI',
			desc: 'AI HTML/CSS yazmaz; doğrulanmış yapısal veri üretir. Hallüsinasyon yapısal olarak imkansız.'
		},
		{
			title: 'Kendi domainin',
			desc: "Pro ile özel domain. Tescilden TLS'e kadar otomatik. Banka havalesi veya kart."
		},
		{
			title: 'İletişim & lead',
			desc: 'İletişim formu, e-posta bildirimi, mesaj paneli. Danışanların sana ulaşsın.'
		},
		{
			title: 'Veri senin',
			desc: 'İstediğin an dışa aktar, istediğin an sil. Sahiplik sende, kilit değil.'
		}
	];

	const faqs = [
		{
			q: 'AI gerçekten güvenli mi?',
			a: 'Evet. AI yalnızca doğrulanmış yapısal veri üretir; HTML/CSS/JS yazamaz. Her çıktı Zod şemasıyla doğrulanır, geçersiz çıktı asla render edilmez. Bu, "vibe coding" riskini yapısal olarak ortadan kaldırır.'
		},
		{
			q: 'Sitemi kaybeder miyim?',
			a: 'Hayır. Site içeriği senin. İstediğin an dışa aktar, başka platforma taşı. Abonelik iptalinde bile site alt alan adında yayında kalır; yalnızca özel domain 30 gün grace sonunda ayrılır.'
		},
		{
			q: 'Sağlık reklam yönetmeliğine uyumlu mu?',
			a: 'AI, tıbbi sonuç iddiası ve garanti içeren ifadelerden kaçınır. Ancak içerik yayınlamadan önce gözden geçirmek senin sorumluluğunda. Detaylı sorumluluk reddi yasal sayfamızda.'
		},
		{
			q: 'Sadece psikologlar mı?',
			a: 'İlk lansman psikologlara odaklı. Avukat ve diş hekimi presetleri hazır; ikinci niş sinyal gelince açılır.'
		},
		{
			q: 'Beta nedir, nasıl katılırım?',
			a: "Kapalı beta davetlidir. destek@saaskaya.com'a yaz, mesleğini belirt, davet al. Beta süresince ödeme operatör kontrollü."
		}
	];
</script>

<svelte:head>
	<title>saaskaya — Psikologlar için AI web sitesi platformu</title>
	<link rel="canonical" href="https://saaskaya.com/" />
	<meta
		name="description"
		content="Psikologlar için AI web sitesi platformu: pratiğini anlat, çok dilli siteni al, sohbetle düzenle, kendi domaininde yayınla. Kod öğrenmeden, risk almadan."
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

	<nav class="absolute top-5 right-20 hidden items-center gap-2 sm:flex">
		{#if data.user}
			<span class="text-xs text-[var(--sk-muted)]">{data.user.email}</span>
		{:else}
			<span class="text-xs text-[var(--sk-muted)]">kapalı beta</span>
		{/if}
	</nav>

	<!-- Hero -->
	<div class="mx-auto flex w-full max-w-4xl flex-col items-start gap-5 pt-6 sm:pt-2">
		<BrandMark />
		<div class="flex flex-wrap gap-2">
			<StatusPill>Psikologlar için</StatusPill>
			<StatusPill>TR · EN · DE</StatusPill>
			<StatusPill>Kapalı beta</StatusPill>
		</div>
		<h1 class="sk-display text-4xl leading-tight sm:text-[44px]">
			Pratiğini anlat, çok dilli siteni al, sohbetle düzenle, kendi domaininde yayınla.
		</h1>
		<p class="max-w-xl text-[17px] leading-8 text-[var(--sk-muted)]">
			AI destekli web sitesi platformu. Web tasarım öğrenmeden, AI'in ürettiği koda güvenmeden,
			birkaç dakikada profesyonel bir pratik sitesi. Kod riski yok — AI yalnızca doğrulanmış yapısal
			veri üretir.
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<a href="/new" class="sk-btn sk-btn-primary sk-btn-lg">Pratiğini anlat → siteni gör</a>
			<a href="#ornekler" class="sk-btn sk-btn-secondary sk-btn-lg">Örnek siteleri gör</a>
			<a href="/pricing" class="sk-btn sk-btn-ghost sk-btn-lg">Fiyatlandırma</a>
		</div>
	</div>

	<!-- Process -->
	<div class="mx-auto mt-12 w-full max-w-4xl border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Nasıl çalışır</div>
		<div class="mt-4 grid gap-4 sm:grid-cols-4">
			{#each steps as step (step.n)}
				<div class="sk-card p-4">
					<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Adım {step.n}</div>
					<div class="mt-1 text-sm font-semibold">{step.title}</div>
					<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">{step.desc}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Examples -->
	<div id="ornekler" class="mx-auto mt-12 w-full max-w-4xl border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Örnek siteler</div>
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
								<span>{site.pages.length} sayfa</span>
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
							<a href="/preview/{site.id}" class="sk-btn sk-btn-secondary sk-btn-sm">Önizle</a>
							<a href="/editor/{site.id}" class="sk-btn sk-btn-primary sk-btn-sm">Düzenle</a>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Features -->
	<div class="mx-auto mt-12 w-full max-w-4xl border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Özellikler</div>
		<div class="mt-4 grid gap-4 sm:grid-cols-2">
			{#each features as f (f.title)}
				<div class="sk-card p-4">
					<h3 class="text-sm font-semibold">{f.title}</h3>
					<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">{f.desc}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Pricing teaser -->
	<div class="mx-auto mt-12 w-full max-w-4xl border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Fiyatlandırma</div>
		<div class="mt-4 grid gap-4 sm:grid-cols-3">
			<div class="sk-card p-4">
				<div class="text-sm font-semibold">Free</div>
				<div class="mt-2 sk-display text-2xl">
					0₺<span class="text-sm text-[var(--sk-faint)]">/ay</span>
				</div>
				<p class="mt-2 text-xs text-[var(--sk-muted)]">1 site, alt alan adı, 10 AI düzenleme.</p>
			</div>
			<div class="sk-card p-4 border-[var(--sk-ink)] ring-1 ring-[var(--sk-ink)]">
				<div class="flex items-center justify-between">
					<div class="text-sm font-semibold">Pro</div>
					<StatusPill tone="success">Önerilen</StatusPill>
				</div>
				<div class="mt-2 sk-display text-2xl">
					299₺<span class="text-sm text-[var(--sk-faint)]">/ay</span>
				</div>
				<p class="mt-2 text-xs text-[var(--sk-muted)]">Özel domain, 50 AI düzenleme, çok dilli.</p>
			</div>
			<div class="sk-card p-4">
				<div class="text-sm font-semibold">Premium</div>
				<div class="mt-2 sk-display text-2xl">
					599₺<span class="text-sm text-[var(--sk-faint)]">/ay</span>
				</div>
				<p class="mt-2 text-xs text-[var(--sk-muted)]">Rozetsiz, 200 AI, insan incelemesi.</p>
			</div>
		</div>
		<a href="/pricing" class="sk-btn sk-btn-ghost sk-btn-sm mt-4">Tüm özellikleri gör →</a>
	</div>

	<!-- FAQ -->
	<div class="mx-auto mt-12 w-full max-w-4xl border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Sıkça sorulan sorular</div>
		<dl class="mt-4 flex flex-col gap-3">
			{#each faqs as faq (faq.q)}
				<div class="sk-card p-4">
					<dt class="text-sm font-semibold">{faq.q}</dt>
					<dd class="mt-1.5 text-xs leading-6 text-[var(--sk-muted)]">{faq.a}</dd>
				</div>
			{/each}
		</dl>
	</div>

	<!-- Trust -->
	<div class="mx-auto mt-12 w-full max-w-4xl border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">Güven</div>
		<div class="mt-4 grid gap-3 sm:grid-cols-2">
			<div class="sk-soft p-4">
				<h3 class="text-sm font-semibold">Yapısal olarak güvenli AI</h3>
				<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">
					AI HTML/CSS/JS yazmaz; doğrulanmış yapısal veri üretir. Her çıktı şema ile doğrulanır,
					geçersiz çıktı asla render edilmez. "Vibe coding" riski yok.
				</p>
			</div>
			<div class="sk-soft p-4">
				<h3 class="text-sm font-semibold">Yedek ve kurtarma</h3>
				<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">
					Gecelik yedekler, 14 günlük rolling pencere, health endpoint. Verini istediğin an dışa
					aktar.
				</p>
			</div>
			<div class="sk-soft p-4">
				<h3 class="text-sm font-semibold">Sahiplik ve portabilite</h3>
				<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">
					Site içeriği senin. JSON olarak dışa aktar, başka platforma taşı. Kilit yok.
				</p>
			</div>
			<div class="sk-soft p-4">
				<h3 class="text-sm font-semibold">Türkçe destek</h3>
				<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">
					Türkçe onboarding, KVKK uyumlu, yerel ödeme yöntemleri (banka havalesi). Yabancı değil.
				</p>
			</div>
		</div>
		<div class="mt-4 flex flex-wrap gap-3 text-xs">
			<a href="/legal/privacy" class="sk-link text-[var(--sk-muted)]">Gizlilik</a>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href="/legal/terms" class="sk-link text-[var(--sk-muted)]">Şartlar</a>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href="/legal/kvkk" class="sk-link text-[var(--sk-muted)]">KVKK</a>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href="/legal/acceptable-use" class="sk-link text-[var(--sk-muted)]"
				>Kabul edilebilir kullanım</a
			>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href="/legal/refund" class="sk-link text-[var(--sk-muted)]">İptal ve iade</a>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href="/legal/disclaimer" class="sk-link text-[var(--sk-muted)]">Sorumluluk reddi</a>
		</div>
	</div>

	<!-- Final CTA -->
	<div class="mx-auto mt-12 w-full max-w-4xl">
		<div class="sk-card flex flex-col items-center gap-3 p-6 text-center">
			<h2 class="sk-display text-2xl">Hazır mısın?</h2>
			<p class="max-w-md text-sm text-[var(--sk-muted)]">
				Pratiğini anlat, birkaç dakikada siteni gör. Ücretsiz başla, beğenince Pro'ya geç.
			</p>
			<a href="/new" class="sk-btn sk-btn-primary sk-btn-lg">Pratiğini anlat → siteni gör</a>
		</div>
	</div>
</AppCanvasShell>
