<script lang="ts">
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import MessageBubble from '$lib/ui/MessageBubble.svelte';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);

	const copy = $derived(
		{
			en: {
				title: 'Pricing · saaskaya',
				description:
					'saaskaya pricing: Free and Pro at 17€/month for AI-assisted practice websites.',
				login: 'Sign in',
				pills: ['Pricing', 'VAT excluded'],
				h1: 'Clear pricing for a professional practice website',
				lead: 'Start free and see the first draft. Pro gives one published site custom-domain readiness, multilingual site generation, and AI editing for 17€/month.',
				month: '/month',
				recommended: 'Recommended',
				startFree: 'Start free',
				upgrade: 'Upgrade to',
				start: 'Start',
				domainNote:
					'Custom domain registration is handled after payment and internal approval. Provider costs are never exposed in the checkout flow.',
				faqLabel: 'Frequently asked questions',
				ctaText: 'Not sure yet? Generate your first draft, then decide.',
				cta: 'Describe your practice → see your site',
				plans: [
					[
						'Free',
						'0€',
						'Try and see',
						[
							'1 draft site',
							'*.saaskaya.com subdomain',
							'1 AI site generation / month',
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
						'Per published site',
						[
							'1 published site',
							'Custom domain + subdomain',
							'5 AI site generations / month',
							'50 AI chat edits / month',
							'8 pages',
							'500 MB media',
							'TR + 1 language (EN/DE)',
							'Contact form + email notification',
							'saaskaya badge required',
							'Full site data export',
							'Priority email support'
						]
					],
					[
						'Premium',
						'Later',
						'To be decided',
						[
							'Top-ups and extra services will be clarified later',
							'Human review remains a future service',
							'No public Premium self-service yet'
						]
					]
				],
				faqs: [
					[
						'Is a domain included?',
						'Custom domains are available on Pro sites. Registration runs only after payment and internal approval.'
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
					'saaskaya fiyatlandırması: Free ve Pro 17€/ay. Psikologlar için AI web sitesi platformu.',
				login: 'Giriş',
				pills: ['Fiyatlandırma', 'KDV hariç'],
				h1: 'Profesyonel pratik için net fiyat',
				lead: 'Ücretsiz dene, beğen. Pro ile bir yayınlanmış site için özel domain yolu + çok dilli site + AI düzenleme açılır. Pro fiyatı site başına 17€/ay.',
				month: '/ay',
				recommended: 'Önerilen',
				startFree: 'Ücretsiz başla',
				upgrade: 'Yükselt:',
				start: 'Başla:',
				domainNote:
					'Özel domain tescili ödeme ve iç uygunluk onayından sonra yürütülür. Sağlayıcı maliyetleri ödeme akışında gösterilmez.',
				faqLabel: 'Sıkça sorulan sorular',
				ctaText: 'Henüz emin değil misiniz? Önce siteni üret, sonra karar ver.',
				cta: 'Pratiğini anlat → siteni gör',
				plans: [
					[
						'Free',
						'0€',
						'Dene ve gör',
						[
							'1 taslak site',
							'*.saaskaya.com alt alan adı',
							'1 AI site üretimi / ay',
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
						'Yayınlanan site başına',
						[
							'1 yayınlanmış site',
							'Özel domain + alt alan adı',
							'5 AI site üretimi / ay',
							'50 AI sohbet düzenleme / ay',
							'8 sayfa',
							'500 MB medya',
							'TR + 1 dil (EN/DE)',
							'İletişim formu + e-posta bildirimi',
							'saaskaya rozeti (zorunlu)',
							'Tam site veri exportu',
							'Öncelikli e-posta destek'
						]
					],
					[
						'Premium',
						'Sonra',
						'Sonra netleşecek',
						[
							'Top-up ve ek servisler sonra netleşecek',
							'İnsan incelemesi gelecek servis olarak kalır',
							'Şu an public Premium self-service yok'
						]
					]
				],
				faqs: [
					[
						'Domain dahil mi?',
						'Özel domain Pro sitelerde açılır. Tescil yalnızca ödeme ve iç uygunluk onayından sonra yapılır.'
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
					'saaskaya Preise: Free und Pro für 17€/Monat für AI-gestützte Praxis-Websites.',
				login: 'Anmelden',
				pills: ['Preise', 'zzgl. MwSt.'],
				h1: 'Klare Preise für eine professionelle Praxis-Website',
				lead: 'Kostenlos starten und den ersten Entwurf sehen. Pro bietet Domain-Bereitschaft, mehrsprachige Website und AI-Bearbeitung für eine veröffentlichte Website für 17€/Monat.',
				month: '/Monat',
				recommended: 'Empfohlen',
				startFree: 'Kostenlos starten',
				upgrade: 'Upgrade auf',
				start: 'Starten mit',
				domainNote:
					'Eigene Domains werden nach Zahlung und interner Freigabe registriert. Providerkosten werden im Checkout nicht angezeigt.',
				faqLabel: 'Häufige Fragen',
				ctaText: 'Noch unsicher? Erstelle zuerst deinen Entwurf und entscheide dann.',
				cta: 'Praxis beschreiben → Website sehen',
				plans: [
					[
						'Free',
						'0€',
						'Ausprobieren',
						[
							'1 Entwurfsseite',
							'*.saaskaya.com Subdomain',
							'1 AI-Website-Generierung / Monat',
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
						'Pro veröffentlichter Website',
						[
							'1 veröffentlichte Website',
							'Eigene Domain + Subdomain',
							'5 AI-Website-Generierungen / Monat',
							'50 AI-Chat-Bearbeitungen / Monat',
							'8 Seiten',
							'500 MB Medien',
							'TR + 1 Sprache (EN/DE)',
							'Kontaktformular + E-Mail-Benachrichtigung',
							'saaskaya Badge erforderlich',
							'Vollständiger Website-Datenexport',
							'Priorisierter E-Mail-Support'
						]
					],
					[
						'Premium',
						'Später',
						'Wird später entschieden',
						[
							'Top-ups und Zusatzservices werden später geklärt',
							'Menschliche Prüfung bleibt ein künftiger Service',
							'Noch kein öffentliches Premium-Self-Service'
						]
					]
				],
				faqs: [
					[
						'Ist eine Domain enthalten?',
						'Eigene Domains sind für Pro-Websites verfügbar. Registrierung erfolgt nur nach Zahlung und interner Freigabe.'
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

	const plans = $derived(
		copy.plans.map(([name, price, tagline, features]) => ({
			name,
			price,
			tagline,
			features,
			highlight: String(name).startsWith('Pro')
		}))
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
	<div
		class="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-5 pt-10 sm:px-10 sm:pt-12"
	>
		<BrandMark href={l('/')} />
		<div class="flex flex-wrap gap-2">
			{#each copy.pills as pill (pill)}
				<StatusPill>{pill}</StatusPill>
			{/each}
		</div>
		<h1 class="sk-display text-4xl leading-none sm:text-[42px]">{copy.h1}</h1>
		<p class="max-w-xl text-[17px] leading-8 text-[var(--sk-muted)]">{copy.lead}</p>
	</div>

	<div class="mx-auto mt-10 w-full max-w-6xl px-5 sm:px-10">
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
						{#if plan.name !== 'Premium'}
							<span class="text-sm text-[var(--sk-faint)]">{copy.month}</span>
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
	</div>

	<div class="mx-auto mt-6 w-full max-w-6xl px-5 sm:px-10">
		<div class="sk-soft p-4 text-xs text-[var(--sk-muted)]">{copy.domainNote}</div>
	</div>

	<div class="mx-auto mt-10 w-full max-w-6xl border-t border-[var(--sk-line)] px-5 pt-7 sm:px-10">
		<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.faqLabel}</div>
		<dl class="mt-4 flex flex-col gap-4">
			{#each faqs as faq (faq.q)}
				<div class="sk-card p-4">
					<dt class="text-sm font-semibold">{faq.q}</dt>
					<dd class="mt-1.5 text-xs leading-6 text-[var(--sk-muted)]">{faq.a}</dd>
				</div>
			{/each}
		</dl>
	</div>

	<div class="mx-auto mt-10 w-full max-w-6xl px-5 pb-12 sm:px-10">
		<div class="sk-card flex flex-col items-center gap-3 p-6 text-center">
			<p class="text-sm text-[var(--sk-muted)]">{copy.ctaText}</p>
			<a href={l('/new')} class="sk-btn sk-btn-primary sk-btn-lg">{copy.cta}</a>
		</div>
	</div>
	<MessageBubble {locale} userEmail={data.user?.email ?? ''} />
</PublicShell>
