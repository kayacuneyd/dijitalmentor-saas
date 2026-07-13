<script lang="ts">
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { uiIcons } from '$lib/ui/icons';
	import { mergeCopy } from '$lib/publicCopy';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);

	const baseCopy = $derived(
		{
			en: {
				title: 'Pricing · saaskaya',
				description:
					'saaskaya pricing: Free, Pro Monthly, and Pro Yearly with an included standard .com domain.',
				login: 'Sign in',
				pills: ['Pricing', 'VAT excluded'],
				h1: 'Clear pricing for a professional practice website',
				lead: 'Start free and see the first draft. Monthly Pro plus a managed .com domain totals 219€/year; Yearly Pro is 200€/year with the .com domain included.',
				month: '/month',
				year: '/year',
				recommended: 'Recommended',
				startFree: 'Start free',
				upgrade: 'Upgrade to',
				start: 'Start',
				domainNote:
					'You are not buying only a domain. saaskaya manages the website, hosting, SSL security, DNS setup, domain renewal tracking, maintenance, contact forms, and professional email forwarding setup for your domain.',
				faqLabel: 'Frequently asked questions',
				ctaText: 'Not sure yet? See your first website, then decide.',
				cta: 'Create first site',
				plans: [
					[
						'Free',
						'0€',
						'Try and see',
						[
							'3 preview sites',
							'1 published website',
							'*.saaskaya.com subdomain',
							'10 AI chat edits / month',
							'3 pages',
							'20 MB media',
							'TR language',
							'Contact form',
							'saaskaya badge required'
						]
					],
					[
						'Pro site',
						'17€',
						'/month',
						'Per published site',
						[
							'1 published site',
							'*.saaskaya.com subdomain',
							'Managed .com domain service: +15€/year',
							'Annual total with .com: 219€',
							'50 AI chat edits / month',
							'8 pages',
							'500 MB media',
							'TR + 1 language (EN/DE)',
							'Contact form + email notification',
							'Hosting, SSL, DNS setup, maintenance',
							'Professional email forwarding setup',
							'saaskaya badge required',
							'Full site data export',
							'Priority email support'
						]
					],
					[
						'Pro Yearly',
						'200€',
						'/year',
						'Best for going live',
						[
							'Everything in Monthly Pro',
							'One standard .com domain included',
							'200€/year instead of 219€/year',
							'About 9% advantage versus monthly + domain',
							'Domain renewal managed while yearly plan stays active',
							'SSL, hosting, DNS, maintenance included',
							'Professional email forwarding setup',
							'Priority email support',
							'Simpler yearly payment'
						]
					]
				],
				faqs: [
					[
						'Is a domain included?',
						'Yearly Pro includes one standard .com domain. Monthly Pro customers are guided to add the managed .com domain service for 15€/year, so they do not need to buy or configure a domain elsewhere.'
					],
					[
						'What is an AI credit?',
						'A site generation or AI chat edit uses credit. Direct text/theme/media edits stay free.'
					],
					[
						'What happens if credits run out?',
						'Direct editing continues. Extra credits/top-ups are intentionally deferred.'
					],
					[
						'What happens if I cancel?',
						'Paid features stay active until the period ends, then the grace policy applies.'
					],
					[
						'Is beta different?',
						'Closed beta is invite-only and payment methods are operator-controlled.'
					]
				]
			},
			tr: {
				title: 'Fiyatlandırma · saaskaya',
				description:
					'saaskaya fiyatlandırması: Free, Aylık Pro ve standart .com alan adı dahil Yıllık Pro.',
				login: 'Giriş',
				pills: ['Fiyatlandırma', 'KDV hariç'],
				h1: 'Web siteni yayına almak için sade fiyat',
				lead: 'Ücretsiz başla ve ilk siteyi gör. Aylık Pro + yönetilen .com alan adı yılda 219€ tutar; Yıllık Pro 200€/yıl ve standart .com alan adı dahildir.',
				month: '/ay',
				year: '/yıl',
				recommended: 'Önerilen',
				startFree: 'Ücretsiz başla',
				upgrade: 'Yükselt:',
				start: 'Başla:',
				domainNote:
					'Sadece domain almıyorsunuz. saaskaya web sitesini, hosting’i, SSL güvenliğini, DNS kurulumunu, domain yenileme takibini, bakım-onarımı, iletişim formlarını ve profesyonel e-posta yönlendirme kurulumunu sizin için yönetir.',
				faqLabel: 'Sıkça sorulan sorular',
				ctaText: 'Henüz emin değil misiniz? Önce ilk web siteni gör, sonra karar ver.',
				cta: 'İlk siteyi oluştur',
				plans: [
					[
						'Free',
						'0€',
						'Dene ve gör',
						[
							'3 preview site',
							'1 yayınlanan website',
							'*.saaskaya.com alt alan adı',
							'10 AI sohbet düzenleme / ay',
							'3 sayfa',
							'20 MB medya',
							'TR dil',
							'İletişim formu',
							'saaskaya rozeti (zorunlu)'
						]
					],
					[
						'Pro site',
						'17€',
						'/ay',
						'Yayınlanan site başına',
						[
							'1 yayınlanmış site',
							'*.saaskaya.com alt alan adı',
							'Yönetilen .com alan adı hizmeti: +15€/yıl',
							'.com ile yıllık toplam: 219€',
							'50 AI sohbet düzenleme / ay',
							'8 sayfa',
							'500 MB medya',
							'TR + 1 dil (EN/DE)',
							'İletişim formu + e-posta bildirimi',
							'Hosting, SSL, DNS kurulumu, bakım',
							'Profesyonel e-posta yönlendirme kurulumu',
							'saaskaya rozeti (zorunlu)',
							'Tam site veri exportu',
							'Öncelikli e-posta destek'
						]
					],
					[
						'Yıllık Pro',
						'200€',
						'/yıl',
						'Yayına çıkmak için en net paket',
						[
							'Aylık Pro’daki her şey',
							'Bir standart .com alan adı dahil',
							'219€ yerine 200€/yıl',
							'Aylık + domain toplamına göre yaklaşık %9 avantaj',
							'Yıllık plan aktifken domain yenileme yönetilir',
							'SSL, hosting, DNS ve bakım dahil',
							'Profesyonel e-posta yönlendirme kurulumu',
							'Öncelikli e-posta destek',
							'Daha sade yıllık ödeme'
						]
					]
				],
				faqs: [
					[
						'Domain dahil mi?',
						'Yıllık Pro’ya bir standart .com alan adı dahildir. Aylık Pro müşterisi .com alan adını 15€/yıl yönetilen hizmet olarak ekler; ayrıca domain satın alma veya teknik kurulumla uğraşmaz.'
					],
					[
						'AI kredisi ne demek?',
						'Site üretimi veya AI sohbet düzenlemesi kredi kullanır. Doğrudan metin/tema/medya düzenleme ücretsizdir.'
					],
					[
						'Kredilerim biterse ne olur?',
						'Doğrudan düzenleme çalışmaya devam eder. Ek kredi/top-up bilinçli olarak sonraya bırakıldı.'
					],
					[
						'İptal edersem ne olur?',
						'Ücretli özellikler ödeme dönemi sonuna kadar aktif kalır, sonra grace politikası uygulanır.'
					],
					[
						'Beta döneminde farklılık var mı?',
						'Kapalı beta davetlidir; ödeme yöntemleri operatör tarafından kontrol edilir.'
					]
				]
			},
			de: {
				title: 'Preise · saaskaya',
				description:
					'saaskaya Preise: Free, Pro monatlich und Pro jährlich mit standard .com Domain.',
				login: 'Anmelden',
				pills: ['Preise', 'zzgl. MwSt.'],
				h1: 'Klare Preise für eine professionelle Praxis-Website',
				lead: 'Kostenlos starten und den ersten Entwurf sehen. Pro monatlich plus verwaltete .com Domain ergibt 219€/Jahr; Pro jährlich kostet 200€/Jahr mit .com Domain inklusive.',
				month: '/Monat',
				year: '/Jahr',
				recommended: 'Empfohlen',
				startFree: 'Kostenlos starten',
				upgrade: 'Upgrade auf',
				start: 'Starten mit',
				domainNote:
					'Sie kaufen nicht nur eine Domain. saaskaya verwaltet Website, Hosting, SSL-Sicherheit, DNS-Einrichtung, Domain-Verlängerung, Wartung, Kontaktformulare und professionelle E-Mail-Weiterleitung.',
				faqLabel: 'Häufige Fragen',
				ctaText: 'Noch unsicher? Sieh dir zuerst deine Website an und entscheide dann.',
				cta: 'Website starten',
				plans: [
					[
						'Free',
						'0€',
						'Ausprobieren',
						[
							'3 Vorschau-Websites',
							'1 veröffentlichte Website',
							'*.saaskaya.com Subdomain',
							'10 AI-Chat-Bearbeitungen / Monat',
							'3 Seiten',
							'20 MB Medien',
							'TR Sprache',
							'Kontaktformular',
							'saaskaya Badge erforderlich'
						]
					],
					[
						'Pro site',
						'17€',
						'/Monat',
						'Pro veröffentlichter Website',
						[
							'1 veröffentlichte Website',
							'*.saaskaya.com Subdomain',
							'Verwaltete .com Domain: +15€/Jahr',
							'Jahressumme mit .com: 219€',
							'50 AI-Chat-Bearbeitungen / Monat',
							'8 Seiten',
							'500 MB Medien',
							'TR + 1 Sprache (EN/DE)',
							'Kontaktformular + E-Mail-Benachrichtigung',
							'Hosting, SSL, DNS-Einrichtung, Wartung',
							'Professionelle E-Mail-Weiterleitung',
							'saaskaya Badge erforderlich',
							'Vollständiger Website-Datenexport',
							'Priorisierter E-Mail-Support'
						]
					],
					[
						'Pro Jährlich',
						'200€',
						'/Jahr',
						'Am einfachsten für den Livegang',
						[
							'Alles aus Pro monatlich',
							'Eine standard .com Domain enthalten',
							'200€/Jahr statt 219€/Jahr',
							'Rund 9% Vorteil gegenüber monatlich + Domain',
							'Domain-Verlängerung wird bei aktivem Jahresplan verwaltet',
							'SSL, Hosting, DNS und Wartung enthalten',
							'Professionelle E-Mail-Weiterleitung',
							'Priorisierter E-Mail-Support',
							'Einfachere jährliche Zahlung'
						]
					]
				],
				faqs: [
					[
						'Ist eine Domain enthalten?',
						'Pro jährlich enthält eine standard .com Domain. Pro monatlich kann die verwaltete .com Domain für 15€/Jahr hinzufügen, ohne Domainkauf oder technische Einrichtung selbst zu erledigen.'
					],
					[
						'Was ist ein AI-Credit?',
						'Website-Generierung oder AI-Chat-Bearbeitung nutzt Credits. Direkte Text/Theme/Medien-Änderungen bleiben kostenlos.'
					],
					[
						'Was passiert, wenn Credits aufgebraucht sind?',
						'Direkte Bearbeitung funktioniert weiter. Zusätzliche Credits/Top-ups sind bewusst verschoben.'
					],
					[
						'Was passiert bei Kündigung?',
						'Bezahlte Funktionen bleiben bis Periodenende aktiv, danach gilt die Grace Policy.'
					],
					[
						'Ist die Beta anders?',
						'Die geschlossene Beta ist eingeladen; Zahlungsarten sind operator-gesteuert.'
					]
				]
			}
		}[locale]
	);
	const copy = $derived(mergeCopy(baseCopy, data.copyOverrides?.[locale]));

	const plans = $derived(
		copy.plans.map(([name, price, periodOrTagline, taglineOrFeatures, maybeFeatures]) => {
			const hasPeriod = Array.isArray(maybeFeatures);
			const tagline = hasPeriod ? String(taglineOrFeatures) : String(periodOrTagline);
			const features = hasPeriod ? maybeFeatures : taglineOrFeatures;
			return {
			name,
			price,
			period: hasPeriod ? String(periodOrTagline) : '',
			tagline,
			features,
			highlight:
				String(name).includes('Yearly') ||
				String(name).includes('Yıllık') ||
				String(name).includes('Jährlich')
			};
		})
	);
	const faqs = $derived(copy.faqs.map(([q, a]) => ({ q, a })));
</script>

<SeoHead
	{locale}
	path="/pricing"
	title={copy.title}
	description={copy.description}
	jsonLd={[organizationJsonLd(), webSiteJsonLd(locale), softwareJsonLd(locale, copy.description)]}
/>

<PublicShell
	{locale}
	currentPath="/pricing"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / pricing"
>
	<MarketingSection class="flex flex-col items-start gap-5 pt-10 sm:pt-12">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.pills[0]}</div>
		<div class="flex flex-wrap gap-2">
			{#each copy.pills.slice(1) as pill (pill)}
				<StatusPill>{pill}</StatusPill>
			{/each}
		</div>
		<div>
			<h1 class="sk-display max-w-4xl text-4xl leading-tight sm:text-[46px]">{copy.h1}</h1>
			<p class="mt-4 max-w-2xl text-[17px] leading-8 text-[var(--sk-muted)]">{copy.lead}</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<a href={l('/new')} class="sk-btn sk-btn-primary sk-btn-lg"
				>{copy.cta}{@html uiIcons.arrowRight(16)}</a
			>
			<a href="#pricing-faq" class="sk-btn sk-btn-secondary sk-btn-lg">{copy.faqLabel}</a>
		</div>
	</MarketingSection>

	<MarketingSection class="mt-10">
		<div class="grid gap-4 sm:grid-cols-3">
			{#each plans as plan (plan.name)}
				<div
					class="sk-card flex flex-col p-5 {plan.highlight
						? 'border-[var(--sk-ink)] ring-1 ring-[var(--sk-ink)]'
						: ''}"
				>
					<div class="flex items-center justify-between gap-2">
						<h2 class="text-lg font-semibold">{plan.name}</h2>
						{#if plan.highlight}
							<StatusPill tone="success">{copy.recommended}</StatusPill>
						{/if}
					</div>
					<p class="mt-1 text-xs text-[var(--sk-muted)]">{plan.tagline}</p>
					<div class="mt-4 flex items-baseline gap-1">
						<span class="sk-display text-3xl">{plan.price}</span>
						{#if plan.period}
							<span class="text-sm text-[var(--sk-faint)]">{plan.period}</span>
						{/if}
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
						<a href={l('/new')} class="sk-btn sk-btn-secondary sk-btn-sm mt-5">{copy.startFree}</a>
					{:else if data.user}
						<a href="/dashboard" class="sk-btn sk-btn-primary sk-btn-sm mt-5">
							{copy.upgrade}
							{plan.name}
						</a>
					{:else}
						<a href={l('/login')} class="sk-btn sk-btn-primary sk-btn-sm mt-5">
							{copy.start}
							{plan.name}
						</a>
					{/if}
				</div>
			{/each}
		</div>
	</MarketingSection>

	<MarketingSection class="mt-6">
		<div class="sk-soft p-4 text-xs text-[var(--sk-muted)]">{copy.domainNote}</div>
	</MarketingSection>

	<MarketingSection id="pricing-faq" class="mt-10 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.faqLabel}</div>
		<dl class="mt-4 flex flex-col gap-4">
			{#each faqs as faq (faq.q)}
				<div class="sk-card p-4">
					<dt class="text-sm font-semibold">{faq.q}</dt>
					<dd class="mt-1.5 text-xs leading-6 text-[var(--sk-muted)]">{faq.a}</dd>
				</div>
			{/each}
		</dl>
	</MarketingSection>

	<MarketingSection class="mt-10 pb-12">
		<div class="sk-card flex flex-col items-center gap-3 p-6 text-center">
			<p class="text-sm text-[var(--sk-muted)]">{copy.ctaText}</p>
			<a href={l('/new')} class="sk-btn sk-btn-primary sk-btn-lg"
				>{copy.cta}{@html uiIcons.arrowRight(16)}</a
			>
		</div>
	</MarketingSection>
</PublicShell>
