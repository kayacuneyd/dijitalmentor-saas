<script lang="ts">
	import { seedSites } from '$lib/seed';
	import FlowAnimation from '$lib/ui/FlowAnimation.svelte';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { uiIcons } from '$lib/ui/icons';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	const seeds = Object.entries(seedSites);

	const swatches = {
		law: '#1e3a5f',
		psych: '#2f6f6a',
		dental: '#0e7490'
	} as const;

	const copy = $derived(
		{
			en: {
				title: 'saaskaya — AI website platform for psychologists, lawyers, and professionals',
				description:
					'AI website platform for psychologists, lawyers, consultants, and expert professionals: describe your practice, get a multilingual site, edit by chat, and publish on your own domain without code risk.',
				login: 'Sign in',
				beta: 'closed beta',
				pills: ['For professionals', 'TR · EN · DE', 'Closed beta'],
				h1: 'Launch a multilingual website for your practice without code.',
				lead: 'Describe your practice, get a multilingual site draft, edit it safely, and publish when ready. AI fills a validated structure; it never writes site code.',
				primary: 'Describe your practice',
				heroTrust: [
					[
						'AI writes no code',
						'Every output is validated before rendering — your site cannot break.'
					],
					['You own your site', 'Pro sites include full export support. No losing your work.']
				],
				examples: 'See example sites',
				pricing: 'Pricing',
				process: 'How it works',
				flowLabel: 'See it in action',
				flowScenes: ['Describe yourself', 'AI generates', 'Live preview', 'Edit', 'Publish'] as [
					string,
					string,
					string,
					string,
					string
				],
				stepLabel: 'Step',
				midCtaTitle: 'Have a few minutes?',
				midCtaBody:
					'Start with your practice description and review the first safe draft before deciding.',
				midCtaAction: 'Open beta start',
				exampleSites: 'Example sites',
				pages: 'pages',
				preview: 'Preview',
				edit: 'Edit',
				features: 'Features',
				priceLabel: 'Pricing',
				perMonth: '/month',
				recommended: 'Recommended',
				allFeatures: 'See all features',
				faq: 'Frequently asked questions',
				trust: 'Trust',
				finalTitle: 'Ready?',
				finalBody:
					'Describe your practice, see your site in minutes. Start free, upgrade to Pro when it fits.',
				legal: {
					privacy: 'Privacy',
					terms: 'Terms',
					kvkk: 'KVKK',
					acceptable: 'Acceptable use',
					refund: 'Cancellation and refund',
					disclaimer: 'Disclaimer'
				},
				steps: [
					[
						'Describe',
						'Write a few lines about your practice, expertise, and style. No long forms.'
					],
					['Generate', 'AI creates your multilingual site as validated structured data.'],
					['Edit', 'Ask for warmer copy or new services by chat. Direct text edits stay free.'],
					['Publish', 'Publish instantly on a subdomain. Move to your own domain with Pro.']
				],
				featureItems: [
					[
						'Chat-based editing',
						'Not a form maze. Ask for a warmer about section and AI updates the draft.'
					],
					[
						'Multilingual (TR · EN · DE)',
						'One-click English/German versions for international clients, reviewed by you.'
					],
					['Safe AI', 'AI never writes HTML/CSS; it produces validated structured data.'],
					[
						'Your own domain',
						'Use a custom domain with Pro. Registration, TLS, and setup are handled.'
					],
					[
						'Contact & leads',
						'Contact forms, email notifications, and a message panel for client inquiries.'
					],
					['Your data', 'Delete anytime; full export support is included with Pro sites.']
				],
				faqs: [
					[
						'Is the AI actually safe?',
						'Yes. AI only produces validated structured data; it cannot write HTML/CSS/JS. Invalid output is never rendered.'
					],
					[
						'Can I lose my site?',
						'No. Your content belongs to you. Even after cancellation, the site stays live on a subdomain; only custom domains detach after the grace period.'
					],
					[
						'Is it suitable for healthcare advertising rules?',
						'The AI avoids guaranteed outcomes and medical claims, but you remain responsible for reviewing content before publishing.'
					],
					[
						'Is it only for psychologists?',
						'No — we target lawyers, academics, psychologists, physiotherapists, occupational therapists, and consultants. The first launch focuses on psychologists; lawyer and dental presets already exist, others open as demand signals arrive.'
					],
					[
						'How do I join the beta?',
						'Closed beta is invite-only. Email support@saaskaya.com with your profession.'
					]
				],
				trustCards: [
					[
						'Structurally safe AI',
						'AI does not write HTML/CSS/JS. Every output is validated before rendering.'
					],
					[
						'Backup and recovery',
						'Nightly backups, health checks, and Pro export support protect your work.'
					],
					['Ownership and portability', 'Pro sites include full JSON export support. No lock-in.'],
					['Local support', 'Turkish onboarding, KVKK-aware processes, and local payment options.']
				]
			},
			tr: {
				title: 'saaskaya — Psikolog, avukat ve uzman meslekler için AI web sitesi platformu',
				description:
					'Psikolog, avukat, danışman ve uzman meslekler için AI web sitesi platformu: pratiğini anlat, çok dilli siteni al, sohbetle düzenle, kendi domaininde yayınla. Kod öğrenmeden, risk almadan.',
				login: 'Giriş',
				beta: 'kapalı beta',
				pills: ['Uzman meslekler için', 'TR · EN · DE', 'Kapalı beta'],
				h1: 'Pratiğin için çok dilli web siteni kod yazmadan yayına al.',
				lead: 'Pratiğini anlat, çok dilli site taslağını gör, güvenle düzenle ve hazır olunca yayınla. AI yalnızca doğrulanmış yapıyı doldurur; site kodu yazmaz.',
				primary: 'Pratiğini anlat',
				heroTrust: [
					['AI kod yazmaz', 'Her çıktı yayınlanmadan doğrulanır — sitenin bozulma riski yok.'],
					['Site senin', 'Pro sitelerde tam export desteği var. Kilit yok, emeğin kaybolmaz.']
				],
				examples: 'Örnek siteleri gör',
				pricing: 'Fiyatlandırma',
				process: 'Nasıl çalışır',
				flowLabel: 'Canlı akışta gör',
				flowScenes: ['Kendini anlat', 'AI üretiyor', 'Canlı önizleme', 'Düzenle', 'Yayında'] as [
					string,
					string,
					string,
					string,
					string
				],
				stepLabel: 'Adım',
				midCtaTitle: 'Birkaç dakikan var mı?',
				midCtaBody: 'Önce pratiğini anlat, güvenli ilk taslağı gör, sonra karar ver.',
				midCtaAction: 'Beta başlangıcını aç',
				exampleSites: 'Örnek siteler',
				pages: 'sayfa',
				preview: 'Önizle',
				edit: 'Düzenle',
				features: 'Özellikler',
				priceLabel: 'Fiyatlandırma',
				perMonth: '/ay',
				recommended: 'Önerilen',
				allFeatures: 'Tüm özellikleri gör',
				faq: 'Sıkça sorulan sorular',
				trust: 'Güven',
				finalTitle: 'Hazır mısın?',
				finalBody:
					"Pratiğini anlat, birkaç dakikada siteni gör. Ücretsiz başla, beğenince Pro'ya geç.",
				legal: {
					privacy: 'Gizlilik',
					terms: 'Şartlar',
					kvkk: 'KVKK',
					acceptable: 'Kabul edilebilir kullanım',
					refund: 'İptal ve iade',
					disclaimer: 'Sorumluluk reddi'
				},
				steps: [
					['Anlat', 'Pratiğini, uzmanlığını ve tarzını birkaç cümlede yaz. Form doldurma yok.'],
					['Üret', 'AI, kontrolü altında, doğrulanmış yapısal veriyle çok dilli siteni oluşturur.'],
					[
						'Düzenle',
						'Sohbetle "daha sıcak olsun", "hizmet ekle" de. Doğrudan metin düzenleme ücretsiz.'
					],
					['Yayınla', 'Alt alan adında anında yayınla. Pro ile kendi domainine taşı.']
				],
				featureItems: [
					[
						'Sohbetle düzenleme',
						'Form değil, sohbet. "Hakkımda bölümünü daha samimi yap" de, AI taslağı güncellesin.'
					],
					[
						'Çok dilli (TR · EN · DE)',
						'Yabancı danışanlar için tek tıkla İngilizce/Almanca sürüm. Çeviri AI ile, sen onayla.'
					],
					[
						'Güvenli AI',
						'AI HTML/CSS yazmaz; doğrulanmış yapısal veri üretir. Hallüsinasyon yapısal olarak imkansız.'
					],
					[
						'Kendi domainin',
						"Pro ile özel domain. Tescilden TLS'e kadar otomatik. Banka havalesi veya kart."
					],
					[
						'İletişim & lead',
						'İletişim formu, e-posta bildirimi, mesaj paneli. Danışanların sana ulaşsın.'
					],
					['Veri senin', 'İstediğin an silebilirsin; tam export desteği Pro sitelerde bulunur.']
				],
				faqs: [
					[
						'AI gerçekten güvenli mi?',
						'Evet. AI yalnızca doğrulanmış yapısal veri üretir; HTML/CSS/JS yazamaz. Geçersiz çıktı asla render edilmez.'
					],
					[
						'Sitemi kaybeder miyim?',
						'Hayır. Site içeriği senin. Abonelik iptalinde bile site alt alan adında yayında kalır; yalnızca özel domain grace sonunda ayrılır.'
					],
					[
						'Sağlık reklam yönetmeliğine uyumlu mu?',
						'AI, tıbbi sonuç iddiası ve garanti içeren ifadelerden kaçınır. İçeriği yayınlamadan önce gözden geçirmek senin sorumluluğunda.'
					],
					[
						'Sadece psikologlar mı?',
						'Hayır — avukat, akademisyen, psikolog, fizyoterapist, ergoterapist ve danışman gibi uzman meslekler hedefte. İlk lansman psikolog odaklı; avukat ve diş hekimi presetleri şimdiden hazır, diğerleri sinyal geldikçe açılıyor.'
					],
					[
						'Beta nedir, nasıl katılırım?',
						"Kapalı beta davetlidir. support@saaskaya.com'a yaz, mesleğini belirt, davet al."
					]
				],
				trustCards: [
					[
						'Yapısal olarak güvenli AI',
						'AI HTML/CSS/JS yazmaz; doğrulanmış yapısal veri üretir. Her çıktı şema ile doğrulanır.'
					],
					[
						'Yedek ve kurtarma',
						'Gecelik yedekler, health endpoint ve Pro export desteği çalışmanı korur.'
					],
					[
						'Sahiplik ve portabilite',
						'Site içeriği senin. Pro sitelerde tam JSON export desteği var. Kilit yok.'
					],
					['Yerel destek', 'Türkçe onboarding, KVKK uyumlu süreçler ve yerel ödeme yöntemleri.']
				]
			},
			de: {
				title: 'saaskaya — AI-Website-Plattform für Psychologen, Anwälte und Experten',
				description:
					'AI-Website-Plattform für Psychologen, Anwälte, Berater und Expertenberufe: Praxis beschreiben, mehrsprachige Website erhalten, per Chat bearbeiten und auf eigener Domain veröffentlichen.',
				login: 'Anmelden',
				beta: 'geschlossene Beta',
				pills: ['Für Expertenberufe', 'TR · EN · DE', 'Geschlossene Beta'],
				h1: 'Starte eine mehrsprachige Website für deine Praxis ohne Code.',
				lead: 'Eine AI-gestützte Website-Plattform. Erhalte in Minuten eine professionelle Praxis-Website, ohne Webdesign zu lernen oder AI-Code zu vertrauen. Kein Code-Risiko: AI füllt nur eine validierte Struktur.',
				primary: 'Praxis beschreiben',
				heroTrust: [
					[
						'AI schreibt keinen Code',
						'Jede Ausgabe wird vor dem Rendern validiert — deine Website kann nicht kaputtgehen.'
					],
					['Deine Website gehört dir', 'Pro-Websites enthalten vollständigen Export-Support.']
				],
				examples: 'Beispiele ansehen',
				pricing: 'Preise',
				process: 'So funktioniert es',
				flowLabel: 'In Aktion ansehen',
				flowScenes: [
					'Beschreibe dich',
					'AI generiert',
					'Live-Vorschau',
					'Bearbeiten',
					'Veröffentlicht'
				] as [string, string, string, string, string],
				stepLabel: 'Schritt',
				midCtaTitle: 'Hast du ein paar Minuten?',
				midCtaBody:
					'Beschreibe zuerst deine Praxis, prüfe den sicheren Entwurf und entscheide dann.',
				midCtaAction: 'Beta-Start öffnen',
				exampleSites: 'Beispielseiten',
				pages: 'Seiten',
				preview: 'Vorschau',
				edit: 'Bearbeiten',
				features: 'Funktionen',
				priceLabel: 'Preise',
				perMonth: '/Monat',
				recommended: 'Empfohlen',
				allFeatures: 'Alle Funktionen ansehen',
				faq: 'Häufige Fragen',
				trust: 'Vertrauen',
				finalTitle: 'Bereit?',
				finalBody:
					'Beschreibe deine Praxis und sieh deine Website in Minuten. Kostenlos starten, später Pro wählen.',
				legal: {
					privacy: 'Datenschutz',
					terms: 'Bedingungen',
					kvkk: 'KVKK',
					acceptable: 'Zulässige Nutzung',
					refund: 'Kündigung und Erstattung',
					disclaimer: 'Haftungsausschluss'
				},
				steps: [
					['Beschreiben', 'Schreibe kurz über Praxis, Expertise und Stil. Keine langen Formulare.'],
					['Generieren', 'AI erstellt deine mehrsprachige Website als validierte Struktur.'],
					[
						'Bearbeiten',
						'Bitte per Chat um wärmere Texte oder neue Leistungen. Direkte Textänderungen bleiben kostenlos.'
					],
					[
						'Veröffentlichen',
						'Sofort auf Subdomain veröffentlichen. Mit Pro auf eigene Domain wechseln.'
					]
				],
				featureItems: [
					[
						'Bearbeitung per Chat',
						'Kein Formular-Labyrinth. Bitte um einen wärmeren Über-uns-Text und AI aktualisiert den Entwurf.'
					],
					[
						'Mehrsprachig (TR · EN · DE)',
						'Englische/deutsche Versionen für internationale Klienten, von dir geprüft.'
					],
					['Sichere AI', 'AI schreibt kein HTML/CSS; sie erzeugt validierte strukturierte Daten.'],
					[
						'Eigene Domain',
						'Nutze mit Pro eine eigene Domain. Registrierung, TLS und Einrichtung werden begleitet.'
					],
					[
						'Kontakt & Leads',
						'Kontaktformulare, E-Mail-Benachrichtigungen und Nachrichtenübersicht.'
					],
					['Deine Daten', 'Löschen jederzeit; vollständiger Export ist in Pro-Websites enthalten.']
				],
				faqs: [
					[
						'Ist die AI wirklich sicher?',
						'Ja. AI erzeugt nur validierte strukturierte Daten und kann kein HTML/CSS/JS schreiben. Ungültige Ausgaben werden nie gerendert.'
					],
					[
						'Kann ich meine Website verlieren?',
						'Nein. Deine Inhalte gehören dir. Nach Kündigung bleibt die Subdomain online; nur eigene Domains werden nach der Frist getrennt.'
					],
					[
						'Passt das zu Gesundheitswerberegeln?',
						'AI vermeidet Heilversprechen und Garantien. Du musst Inhalte vor Veröffentlichung prüfen.'
					],
					[
						'Nur für Psychologen?',
						'Nein — Anwälte, Akademiker, Psychologen, Physiotherapeuten, Ergotherapeuten und Berater gehören zur Zielgruppe. Der erste Launch fokussiert Psychologen; Anwalts- und Zahnarzt-Presets gibt es bereits, weitere folgen bei Nachfrage.'
					],
					[
						'Wie komme ich in die Beta?',
						'Die Beta ist eingeladen. Schreibe mit deinem Beruf an support@saaskaya.com.'
					]
				],
				trustCards: [
					[
						'Strukturell sichere AI',
						'AI schreibt kein HTML/CSS/JS. Jede Ausgabe wird vor dem Rendern validiert.'
					],
					[
						'Backup und Wiederherstellung',
						'Nächtliche Backups, Health Checks und Pro-Export schützen deine Arbeit.'
					],
					[
						'Eigentum und Portabilität',
						'Pro-Websites enthalten vollständigen JSON-Export. Kein Lock-in.'
					],
					[
						'Lokale Unterstützung',
						'Türkisches Onboarding, KVKK-bewusste Prozesse und lokale Zahlungsoptionen.'
					]
				]
			}
		}[locale]
	);

	const steps = $derived(
		copy.steps.map(([title, desc], index) => ({ n: String(index + 1), title, desc }))
	);
	const features = $derived(copy.featureItems.map(([title, desc]) => ({ title, desc })));
	const faqs = $derived(copy.faqs.map(([q, a]) => ({ q, a })));
	const trustCards = $derived(copy.trustCards.map(([title, desc]) => ({ title, desc })));
	const heroTrust = $derived(copy.heroTrust.map(([title, desc]) => ({ title, desc })));

	// Anlat / Üret / Düzenle / Yayınla — one stroke icon per step (index-aligned).
	const stepIconPaths = [
		'M8 10h8M8 14h5M21 12a9 9 0 1 1-4.2-7.6L21 3l-1.2 4.4A8.96 8.96 0 0 1 21 12Z',
		'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15Z',
		'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 6.5l3 3',
		'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.5 9h17M3.5 15h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18'
	];
</script>

<SeoHead
	{locale}
	path="/"
	title={copy.title}
	description={copy.description}
	jsonLd={[organizationJsonLd(), webSiteJsonLd(locale), softwareJsonLd(locale, copy.description)]}
/>

<PublicShell {locale} currentPath="/" userEmail={data.user?.email ?? null} label="saaskaya.com">
	<!-- Hero -->
	<MarketingSection
		class="grid gap-8 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(30rem,1.05fr)] lg:items-start"
	>
		<div class="flex max-w-3xl flex-col items-start gap-4 lg:pt-1">
			<h1 class="sk-display max-w-[24ch] text-3xl leading-[1.08] sm:text-[2rem] lg:text-[2.5rem]">
				{copy.h1}
			</h1>
			<p class="max-w-2xl text-[15px] leading-6 text-[var(--sk-muted)]">
				{copy.lead}
			</p>
			<div class="flex flex-wrap items-center gap-3">
				<a href={l('/new')} class="sk-btn sk-btn-primary sk-btn-lg"
					>{copy.primary}{@html uiIcons.arrowRight(16)}</a
				>
				<a href="#ornekler" class="sk-btn sk-btn-secondary sk-btn-lg">{copy.examples}</a>
				<a href={l('/pricing')} class="sk-btn sk-btn-ghost sk-btn-lg">{copy.pricing}</a>
			</div>
			<!-- The two decisive trust answers, before the fold (full Trust section stays below) -->
			<div class="mt-1 grid w-full gap-3 sm:grid-cols-2">
				{#each heroTrust as card (card.title)}
					<div class="flex min-h-24 items-start gap-2.5 border-t border-[var(--sk-line)] pt-3">
						<svg
							class="mt-0.5 size-4 shrink-0 text-[var(--sk-ink)]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3Z" />
							<path d="M9 12l2 2 4-4" />
						</svg>
						<div>
							<h3 class="text-[13px] font-semibold">{card.title}</h3>
							<p class="mt-0.5 text-xs leading-4 text-[var(--sk-muted)]">{card.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Flow animation: the whole product story in ~20s -->
		<div class="w-full lg:pt-1">
			<FlowAnimation sceneLabels={copy.flowScenes} loopCaption="" reducedMotionCaption="" />
		</div>
	</MarketingSection>

	<!-- Process -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.process}</div>
		<div class="mt-4 grid gap-4 sm:grid-cols-4">
			{#each steps as step, i (step.n)}
				<div class="sk-card p-4">
					<div class="flex items-center justify-between">
						<svg
							class="size-5 text-[var(--sk-ink)]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d={stepIconPaths[i]} />
						</svg>
						<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">
							{copy.stepLabel}
							{step.n}
						</span>
					</div>
					<div class="mt-2 text-sm font-semibold">{step.title}</div>
					<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">{step.desc}</p>
				</div>
			{/each}
		</div>
	</MarketingSection>

	<MarketingSection class="mt-8">
		<div class="sk-soft flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h2 class="text-lg font-semibold">{copy.midCtaTitle}</h2>
				<p class="mt-1 text-sm leading-6 text-[var(--sk-muted)]">{copy.midCtaBody}</p>
			</div>
			<a href={l('/beta')} class="sk-btn sk-btn-primary shrink-0">{copy.midCtaAction}</a>
		</div>
	</MarketingSection>

	<!-- Examples -->
	<MarketingSection id="ornekler" class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.exampleSites}</div>
		<ul class="mt-4 grid gap-4 sm:grid-cols-3">
			{#each seeds as [preset, site] (preset)}
				<li class="sk-card flex flex-col overflow-hidden p-0">
					<a href="/preview/{site.id}" class="block" title={site.settings.siteName}>
						<img
							src="/examples/{preset}.jpg"
							alt="{site.settings.siteName} — {copy.preview}"
							loading="lazy"
							width="1280"
							height="860"
							class="aspect-[3/2] w-full border-b border-[var(--sk-line)] object-cover object-top transition hover:opacity-90"
						/>
					</a>
					<div class="flex flex-1 flex-col gap-2 p-4">
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
						<div class="flex flex-wrap items-center gap-2 text-xs text-[var(--sk-muted)]">
							<span>{site.pages.length} {copy.pages}</span>
							<span class="opacity-40">·</span>
							{#each site.locales as locale (locale)}
								<a
									href="/preview/{site.id}?locale={locale}"
									class="inline-flex min-h-7 items-center rounded border border-[var(--sk-line-strong)] px-2 py-0.5 font-[var(--font-mono)] text-[10px]"
								>
									{locale.toUpperCase()}
								</a>
							{/each}
						</div>
						<div class="mt-auto flex gap-2 pt-1">
							<a href="/preview/{site.id}" class="sk-btn sk-btn-secondary sk-btn-sm flex-1">
								{copy.preview}
							</a>
							<a href="/editor/{site.id}" class="sk-btn sk-btn-primary sk-btn-sm flex-1">
								{copy.edit}
							</a>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</MarketingSection>

	<!-- Features -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.features}</div>
		<div class="mt-4 grid gap-4 sm:grid-cols-2">
			{#each features as f (f.title)}
				<div class="sk-card p-4">
					<h3 class="text-sm font-semibold">{f.title}</h3>
					<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">{f.desc}</p>
				</div>
			{/each}
		</div>
	</MarketingSection>

	<!-- Pricing teaser -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.priceLabel}</div>
		<div class="mt-4 grid gap-4 sm:grid-cols-3">
			<div class="sk-card p-4">
				<div class="text-sm font-semibold">Free</div>
				<div class="mt-2 flex items-baseline gap-1.5">
					<span class="sk-display text-3xl">0€</span>
					<span class="text-xs text-[var(--sk-faint)]">{copy.perMonth}</span>
				</div>
				<p class="mt-2 text-xs text-[var(--sk-muted)]">
					{locale === 'tr'
						? '3 preview site, 1 yayınlanan site, 10 AI düzenleme.'
						: locale === 'de'
							? '3 Vorschau-Websites, 1 veröffentlichte Website, 10 AI-Bearbeitungen.'
							: '3 preview sites, 1 published website, 10 AI edits.'}
				</p>
			</div>
			<div class="sk-card p-4 border-[var(--sk-ink)] ring-1 ring-[var(--sk-ink)]">
				<div class="flex items-center justify-between">
					<div class="text-sm font-semibold">Pro</div>
					<StatusPill tone="success">{copy.recommended}</StatusPill>
				</div>
				<div class="mt-2 flex items-baseline gap-1.5">
					<span class="sk-display text-3xl">17€</span>
					<span class="text-xs text-[var(--sk-faint)]">{copy.perMonth}</span>
				</div>
				<p class="mt-2 text-xs text-[var(--sk-muted)]">
					{locale === 'tr'
						? 'Özel domain, 50 AI düzenleme, çok dilli.'
						: locale === 'de'
							? 'Eigene Domain, 50 AI-Bearbeitungen, mehrsprachig.'
							: 'Custom domain, 50 AI edits, multilingual.'}
				</p>
			</div>
			<div class="sk-card p-4">
				<div class="text-sm font-semibold">Premium</div>
				<div class="mt-2 sk-display text-3xl">
					{locale === 'tr' ? 'Sonra' : locale === 'de' ? 'Später' : 'Later'}
				</div>
				<p class="mt-2 text-xs text-[var(--sk-muted)]">
					{locale === 'tr'
						? 'Top-up ve ek servisler sonra netleşecek.'
						: locale === 'de'
							? 'Top-ups und Zusatzservices werden später entschieden.'
							: 'Top-ups and extra services will be decided later.'}
				</p>
			</div>
		</div>
		<a href={l('/pricing')} class="sk-btn sk-btn-ghost sk-btn-sm mt-4"
			>{copy.allFeatures}{@html uiIcons.arrowRight(14)}</a
		>
	</MarketingSection>

	<!-- FAQ -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.faq}</div>
		<div class="mt-4 flex flex-col gap-3">
			{#each faqs as faq (faq.q)}
				<details class="sk-card group p-4">
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold select-none [&::-webkit-details-marker]:hidden"
					>
						{faq.q}
						<span
							class="shrink-0 text-[var(--sk-faint)] transition-transform group-open:rotate-45"
							aria-hidden="true"
						>
							+
						</span>
					</summary>
					<p class="mt-2 text-xs leading-6 text-[var(--sk-muted)]">{faq.a}</p>
				</details>
			{/each}
		</div>
	</MarketingSection>

	<!-- Trust -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.trust}</div>
		<div class="mt-4 grid gap-3 sm:grid-cols-2">
			{#each trustCards as card (card.title)}
				<div class="sk-soft p-4">
					<h3 class="text-sm font-semibold">{card.title}</h3>
					<p class="mt-1.5 text-xs leading-5 text-[var(--sk-muted)]">{card.desc}</p>
				</div>
			{/each}
		</div>
		<div class="mt-4 flex flex-wrap gap-3 text-xs">
			<a href={l('/legal/privacy')} class="sk-link text-[var(--sk-muted)]">{copy.legal.privacy}</a>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href={l('/legal/terms')} class="sk-link text-[var(--sk-muted)]">{copy.legal.terms}</a>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href={l('/legal/kvkk')} class="sk-link text-[var(--sk-muted)]">{copy.legal.kvkk}</a>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href={l('/legal/acceptable-use')} class="sk-link text-[var(--sk-muted)]"
				>{copy.legal.acceptable}</a
			>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href={l('/legal/refund')} class="sk-link text-[var(--sk-muted)]">{copy.legal.refund}</a>
			<span class="text-[var(--sk-faint)]">·</span>
			<a href={l('/legal/disclaimer')} class="sk-link text-[var(--sk-muted)]"
				>{copy.legal.disclaimer}</a
			>
		</div>
	</MarketingSection>

	<!-- Final CTA -->
	<MarketingSection class="mt-12 pb-12">
		<div class="sk-card flex flex-col items-center gap-3 p-6 text-center">
			<h2 class="sk-display text-2xl">{copy.finalTitle}</h2>
			<p class="max-w-md text-sm text-[var(--sk-muted)]">
				{copy.finalBody}
			</p>
			<a href={l('/new')} class="sk-btn sk-btn-primary sk-btn-lg"
				>{copy.primary}{@html uiIcons.arrowRight(16)}</a
			>
		</div>
	</MarketingSection>
</PublicShell>
