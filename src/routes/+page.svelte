<script lang="ts">
	import { seedSites } from '$lib/seed';
	import FlowAnimation from '$lib/ui/FlowAnimation.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import MascotBee from '$lib/ui/MascotBee.svelte';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import {
		ArrowRightOutline,
		CheckOutline,
		GlobeOutline,
		MessagesOutline,
		PenOutline,
		WandMagicSparklesOutline
	} from 'flowbite-svelte-icons';
	import { baseLocaleForPublic, mergeCopy } from '$lib/publicCopy';
	import { reveal } from '$lib/actions/reveal';
	import { withLocale, type Locale } from '$lib/i18n';

	let { data } = $props();
	const publicLocale = $derived(data.publicLocale ?? data.locale);
	const locale: Locale = $derived(baseLocaleForPublic(publicLocale));
	const l = (path: string) => withLocale(publicLocale, path);
	const seeds = Object.entries(seedSites);

	const swatches = {
		law: '#1e3a5f',
		psych: '#2f6f6a',
		dental: '#0e7490'
	} as const;

	const baseCopy = $derived(
		{
			en: {
				title: 'saaskaya — AI website platform for psychologists, lawyers, and professionals',
				description:
					'AI website platform for psychologists, lawyers, consultants, and expert professionals: describe your work, get a multilingual site draft, edit by chat, and publish without copywriting, translation, or technical setup overload.',
				login: 'Sign in',
				beta: 'closed beta',
				pills: ['For professionals', 'TR · EN · DE', 'Closed beta'],
				h1: 'Describe your work. Get your website ready.',
				lead: 'Skip the blank brief, copywriting, translation, domain, and setup maze. Start with a short description, review the first version, edit the text, and publish when ready.',
				primary: 'Create first site',
				problemsLabel: 'Skip the hard parts',
				problemItems: [
					{ title: 'Writing the copy', body: 'You do not start from a blank page.' },
					{ title: 'Translation', body: 'TR, EN and DE versions can be prepared together.' },
					{ title: 'Technical setup', body: 'Domain, SSL and hosting steps become clear.' },
					{ title: 'AI risk', body: 'AI does not write code; the site structure stays protected.' }
				],
				examples: 'See example sites',
				pricing: 'Pricing',
				process: 'How it works',
				segmentsLabel: 'Focused beta segments',
				segmentsTitle: 'Start with the draft that matches your profession.',
				segmentCards: [
					[
						'Psychologists',
						'A calm, safe first impression for people evaluating your practice.',
						'Approach, services, credentials, contact flow',
						'Create psychology draft',
						'/new?profession=psych&utm_source=homepage&utm_campaign=gtm-30'
					],
					[
						'Lawyers',
						'A serious, informative website that presents practice areas without exaggerated claims.',
						'Practice areas, office profile, trust signals, inquiry path',
						'Create lawyer draft',
						'/new?profession=law&utm_source=homepage&utm_campaign=gtm-30'
					],
					[
						'Dietitians, dentists, academics',
						'Second-wave kits use the same controlled blocks and conservative messaging.',
						'Clear services, no risky promises, multilingual readiness',
						'Explore guided start',
						'/new?utm_source=homepage&utm_campaign=gtm-30'
					]
				],
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
					'Start with one clear description of your work and review the first safe draft before deciding.',
				midCtaAction: 'Start the beta',
				sectionTitles: {
					problems: 'The tiring parts are not yours.',
					process: 'Live in four steps.',
					examples: 'Browse real drafts.',
					pricing: 'Simple, clear pricing.',
					trust: 'Your work stays protected.'
				},
				featuresEyebrow: 'Features',
				faqEyebrow: 'FAQ',
				presetLabels: { law: 'Law', psych: 'Psychology', dental: 'Dental' },
				planAria: { free: 'Free plan', pro: 'Pro plan pricing', premium: 'Premium plan details' },
				exampleSites: 'Example sites',
				pages: 'pages',
				preview: 'Preview',
				edit: 'Edit',
				features: 'What to use each part for',
				priceLabel: 'Pricing',
				perMonth: '/month',
				recommended: 'Recommended',
				allFeatures: 'See all features',
				faq: 'Frequently asked questions',
				trust: 'Trust',
				finalTitle: 'Ready?',
				finalBody:
					'Describe your work, review the first multilingual draft, then decide whether it is ready to publish.',
				steps: [
					[
						'Describe',
						'Write a few lines about your work, services, audience, and tone. No long forms.'
					],
					[
						'Generate',
						'AI turns that brief into a multilingual site draft inside the fixed safe structure.'
					],
					['Edit', 'Ask for clearer copy or new services by chat. Direct text edits stay free.'],
					[
						'Publish',
						'Publish on a subdomain first. Move to your own domain with Pro when it fits.'
					]
				],
				featureItems: [
					[
						'Use chat editing to revise wording',
						'Ask for a warmer about section, clearer services, or a shorter hero without hunting through forms.'
					],
					[
						'Use TR · EN · DE for international visitors',
						'Create English or German versions for clients who do not read your main language, then review before publishing.'
					],
					[
						'Use safe AI when you do not trust generated code',
						'AI never writes HTML/CSS; it fills validated structured data that must pass the schema first.'
					],
					[
						'Use domain and hosting support to avoid setup work',
						'Pro handles the custom domain path, TLS, DNS setup, hosting, and maintenance details.'
					],
					[
						'Use contact forms to collect real inquiries',
						'Visitors can send messages; you get email notifications and a message panel for follow-up.'
					],
					[
						'Use export support to avoid lock-in',
						'Delete anytime; Pro sites include full export support so your work is portable.'
					]
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
					'Psikolog, avukat, danışman ve uzman meslekler için AI web sitesi platformu: mesleğini anlat, çok dilli site taslağını gör, sohbetle düzenle ve teknik kurulum yükü olmadan yayınla.',
				login: 'Giriş',
				beta: 'kapalı beta',
				pills: ['Uzman meslekler için', 'TR · EN · DE', 'Kapalı beta'],
				h1: 'Mesleğini anlat, web siten hazırlansın.',
				lead: 'Ne yazacağım, nasıl çevireceğim, domaini nasıl bağlayacağım diye uğraşma. Kısa bir anlatımla ilk web siteni gör; metni düzenle, hazır olduğunda yayına al.',
				primary: 'İlk siteyi oluştur',
				problemsLabel: 'Bunlarla uğraşma',
				problemItems: [
					{ title: 'Metin yazma', body: 'Boş sayfadan başlamazsın.' },
					{ title: 'Çeviri', body: 'TR, EN ve DE sürümleri birlikte hazırlanır.' },
					{ title: 'Teknik kurulum', body: 'Domain, SSL ve hosting yolu netleşir.' },
					{ title: 'AI riski', body: 'AI kod yazmaz; site yapısı korunur.' }
				],
				examples: 'Örnek siteleri gör',
				pricing: 'Fiyatlandırma',
				process: 'Nasıl çalışır',
				segmentsLabel: 'Odak beta segmentleri',
				segmentsTitle: 'Mesleğine uygun ilk taslakla başla.',
				segmentCards: [
					[
						'Psikologlar',
						'Danışanın seni değerlendirirken sakin, güvenli ve anlaşılır bir ilk izlenim görsün.',
						'Yaklaşım, hizmetler, unvanlar, iletişim akışı',
						'Psikolog taslağı oluştur',
						'/new?profession=psych&utm_source=homepage&utm_campaign=gtm-30'
					],
					[
						'Avukatlar',
						'Çalışma alanlarını abartılı iddia olmadan ciddi ve bilgilendirici biçimde anlat.',
						'Çalışma alanları, büro profili, güven sinyalleri, talep akışı',
						'Avukat taslağı oluştur',
						'/new?profession=law&utm_source=homepage&utm_campaign=gtm-30'
					],
					[
						'Diyetisyen, diş hekimi, akademisyen',
						'İkinci dalga kitler aynı kontrollü bloklar ve muhafazakar mesaj diliyle ilerler.',
						'Net hizmetler, risksiz vaat dili, çok dilli hazırlık',
						'Rehberli başlangıcı aç',
						'/new?utm_source=homepage&utm_campaign=gtm-30'
					]
				],
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
				midCtaBody:
					'Önce mesleğini ve hizmetlerini anlat, güvenli ilk taslağı gör, sonra karar ver.',
				midCtaAction: 'Betaya başla',
				sectionTitles: {
					problems: 'Yorucu kısımlar sende değil.',
					process: 'Dört adımda yayında.',
					examples: 'Gerçek taslaklara bak.',
					pricing: 'Net ve basit fiyat.',
					trust: 'Emeğin güvende.'
				},
				featuresEyebrow: 'Özellikler',
				faqEyebrow: 'SSS',
				presetLabels: { law: 'Hukuk', psych: 'Psikoloji', dental: 'Diş' },
				planAria: {
					free: 'Free planı',
					pro: 'Pro plan fiyatları',
					premium: 'Premium plan detayları'
				},
				exampleSites: 'Örnek siteler',
				pages: 'sayfa',
				preview: 'Önizle',
				edit: 'Düzenle',
				features: 'Hangi parçayı ne için kullanırsın?',
				priceLabel: 'Fiyatlandırma',
				perMonth: '/ay',
				recommended: 'Önerilen',
				allFeatures: 'Tüm özellikleri gör',
				faq: 'Sıkça sorulan sorular',
				trust: 'Güven',
				finalTitle: 'Hazır mısın?',
				finalBody:
					'Mesleğini anlat, ilk çok dilli taslağı incele, yayına hazır olup olmadığına sonra karar ver.',
				steps: [
					['Anlat', 'Uzmanlığını, hizmetlerini, hedef kitleni ve tonunu birkaç cümlede yaz.'],
					['Üret', 'AI bu briefi sabit güvenli yapı içinde çok dilli site taslağına dönüştürür.'],
					[
						'Düzenle',
						'Sohbetle "daha net olsun", "hizmet ekle" de. Doğrudan metin düzenleme ücretsiz.'
					],
					['Yayınla', 'Alt alan adında anında yayınla. Pro ile kendi domainine taşı.']
				],
				featureItems: [
					[
						'Metni revize etmek için sohbet',
						'Form aramak yerine "hakkımda bölümünü daha net yap" veya "hizmet ekle" de, taslak güncellensin.'
					],
					[
						'Yabancı ziyaretçiler için TR · EN · DE',
						'İngilizce veya Almanca sürümü AI hazırlasın; sen kontrol edip yayına al.'
					],
					[
						'Site kodunu riske atmamak için güvenli AI',
						'AI HTML/CSS yazmaz; yalnızca şemadan geçen doğrulanmış yapısal veri üretir.'
					],
					[
						'Teknik yayına alma yükü için domain ve hosting',
						'Pro ile özel domain, TLS, DNS kurulumu, hosting ve bakım süreci yönetilir.'
					],
					[
						'Gelen talepler için iletişim formu',
						'Ziyaretçiler mesaj bırakır; e-posta bildirimi ve mesaj paneliyle takip edersin.'
					],
					[
						'Kilitlenme korkusu için export',
						'İstediğin an silebilirsin; Pro sitelerde tam export desteği bulunur.'
					]
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
					'AI-Website-Plattform für Psychologen, Anwälte, Berater und Expertenberufe: berufliches Profil beschreiben, mehrsprachigen Website-Entwurf erhalten, per Chat bearbeiten und ohne technische Überlastung veröffentlichen.',
				login: 'Anmelden',
				beta: 'geschlossene Beta',
				pills: ['Für Expertenberufe', 'TR · EN · DE', 'Geschlossene Beta'],
				h1: 'Beschreibe dein Angebot. Deine Website entsteht.',
				lead: 'Kein leeres Briefing, keine Text- und Übersetzungsblockade, keine Domain- oder Technikliste. Starte mit einer kurzen Beschreibung, prüfe die erste Version und veröffentliche, wenn sie passt.',
				primary: 'Website starten',
				problemsLabel: 'Diese Arbeit gibst du ab',
				problemItems: [
					{ title: 'Texte schreiben', body: 'Du beginnst nicht mit einer leeren Seite.' },
					{ title: 'Übersetzen', body: 'TR, EN und DE können gemeinsam vorbereitet werden.' },
					{ title: 'Technik einrichten', body: 'Domain, SSL und Hosting werden greifbar.' },
					{ title: 'AI-Risiko', body: 'AI schreibt keinen Code; die Struktur bleibt geschützt.' }
				],
				examples: 'Beispiele ansehen',
				pricing: 'Preise',
				process: 'So funktioniert es',
				segmentsLabel: 'Fokussierte Beta-Segmente',
				segmentsTitle: 'Starte mit dem Entwurf, der zu deinem Beruf passt.',
				segmentCards: [
					[
						'Psychologinnen und Psychologen',
						'Ein ruhiger, sicherer erster Eindruck für Menschen, die deine Praxis prüfen.',
						'Ansatz, Leistungen, Qualifikationen, Kontaktablauf',
						'Psychologie-Entwurf erstellen',
						'/new?profession=psych&utm_source=homepage&utm_campaign=gtm-30'
					],
					[
						'Anwältinnen und Anwälte',
						'Ein seriöser, informativer Auftritt für Tätigkeitsfelder ohne überzogene Versprechen.',
						'Tätigkeitsfelder, Kanzleiprofil, Vertrauenssignale, Anfrageweg',
						'Kanzlei-Entwurf erstellen',
						'/new?profession=law&utm_source=homepage&utm_campaign=gtm-30'
					],
					[
						'Ernährung, Zahnmedizin, Wissenschaft',
						'Zweite Welle: dieselben kontrollierten Blöcke und sachliche Kommunikation.',
						'Klare Leistungen, keine riskanten Versprechen, mehrsprachig bereit',
						'Geführten Start öffnen',
						'/new?utm_source=homepage&utm_campaign=gtm-30'
					]
				],
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
					'Beschreibe zuerst dein Angebot, prüfe den sicheren Entwurf und entscheide dann.',
				midCtaAction: 'Beta starten',
				sectionTitles: {
					problems: 'Die mühsamen Teile übernimmt die Plattform.',
					process: 'In vier Schritten online.',
					examples: 'Echte Entwürfe ansehen.',
					pricing: 'Einfache, klare Preise.',
					trust: 'Deine Arbeit bleibt geschützt.'
				},
				featuresEyebrow: 'Funktionen',
				faqEyebrow: 'FAQ',
				presetLabels: { law: 'Recht', psych: 'Psychologie', dental: 'Zahnmedizin' },
				planAria: {
					free: 'Free-Plan',
					pro: 'Pro-Plan-Preise',
					premium: 'Premium-Plan-Details'
				},
				exampleSites: 'Beispielseiten',
				pages: 'Seiten',
				preview: 'Vorschau',
				edit: 'Bearbeiten',
				features: 'Wofür du die Bausteine nutzt',
				priceLabel: 'Preise',
				perMonth: '/Monat',
				recommended: 'Empfohlen',
				allFeatures: 'Alle Funktionen ansehen',
				faq: 'Häufige Fragen',
				trust: 'Vertrauen',
				finalTitle: 'Bereit?',
				finalBody:
					'Beschreibe dein berufliches Profil, prüfe den ersten mehrsprachigen Entwurf und entscheide dann.',
				steps: [
					[
						'Beschreiben',
						'Schreibe kurz über Angebot, Expertise, Zielgruppe und Ton. Keine langen Formulare.'
					],
					[
						'Generieren',
						'AI wandelt das Briefing in einen mehrsprachigen Entwurf innerhalb der sicheren Struktur um.'
					],
					[
						'Bearbeiten',
						'Bitte per Chat um klarere Texte oder neue Leistungen. Direkte Textänderungen bleiben kostenlos.'
					],
					[
						'Veröffentlichen',
						'Sofort auf Subdomain veröffentlichen. Mit Pro auf eigene Domain wechseln.'
					]
				],
				featureItems: [
					[
						'Chat nutzen, um Texte zu überarbeiten',
						'Bitte um klarere Leistungen, einen kürzeren Hero oder einen wärmeren Über-uns-Text.'
					],
					[
						'TR · EN · DE für internationale Besucher',
						'Englische oder deutsche Versionen entstehen aus dem Entwurf und werden vor Veröffentlichung von dir geprüft.'
					],
					[
						'Sichere AI nutzen, wenn du keinem AI-Code trauen willst',
						'AI schreibt kein HTML/CSS; sie erzeugt validierte strukturierte Daten.'
					],
					[
						'Domain und Hosting nutzen, um Technik abzugeben',
						'Mit Pro werden eigene Domain, TLS, DNS, Hosting und Wartung begleitet.'
					],
					[
						'Kontaktformular nutzen, um Anfragen zu sammeln',
						'Besucher schreiben dir; E-Mail-Benachrichtigungen und Nachrichtenübersicht helfen beim Nachfassen.'
					],
					[
						'Export nutzen, um Lock-in zu vermeiden',
						'Löschen jederzeit; vollständiger Export ist in Pro-Websites enthalten.'
					]
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
	const copy = $derived(mergeCopy(baseCopy, data.publicCopy?.home));

	const steps = $derived(
		copy.steps.map(([title, desc], index) => ({ n: String(index + 1), title, desc }))
	);
	const segmentCards = $derived(
		copy.segmentCards.map(([title, desc, details, action, href]) => ({
			title,
			desc,
			details,
			action,
			href
		}))
	);
	const features = $derived(copy.featureItems.map(([title, desc]) => ({ title, desc })));
	const faqs = $derived(copy.faqs.map(([q, a]) => ({ q, a })));
	const trustCards = $derived(copy.trustCards.map(([title, desc]) => ({ title, desc })));
	const problemItems = $derived(copy.problemItems);

	const stepIcons = [MessagesOutline, WandMagicSparklesOutline, PenOutline, GlobeOutline];
</script>

<SeoHead
	{locale}
	path="/"
	title={copy.title}
	description={copy.description}
	jsonLd={[
		organizationJsonLd(data.platformBranding?.logoUrl),
		webSiteJsonLd(locale, data.platformBranding?.logoUrl),
		softwareJsonLd(locale, copy.description)
	]}
/>

<PublicShell
	{locale}
	{publicLocale}
	currentPath="/"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com"
>
	<!-- Hero -->
	<MarketingSection class="flex flex-col items-center gap-4 pt-10 text-center sm:pt-14">
		<h1 class="sk-display max-w-[24ch] text-4xl leading-[1.08] sm:text-[2.75rem] lg:text-[3.25rem]">
			{copy.h1}
		</h1>
		<p class="max-w-2xl text-base leading-7 text-[var(--sk-muted)] sm:text-[17px]">
			{copy.lead}
		</p>
		<div class="flex flex-wrap items-center justify-center gap-3">
			<FlowbiteButton href={l('/new')} variant="primary" size="lg"
				>{copy.primary}<ArrowRightOutline size="sm" /></FlowbiteButton
			>
			<FlowbiteButton href={l('/pricing')} variant="secondary" size="lg"
				>{copy.pricing}</FlowbiteButton
			>
		</div>
	</MarketingSection>

	<!-- Flow animation: the whole product story in ~20s, as the hero's visual continuation -->
	<MarketingSection class="mt-10">
		<div class="sk-eyebrow text-center">{copy.flowLabel}</div>
		<div class="mt-4 w-full">
			<FlowAnimation sceneLabels={copy.flowScenes} loopCaption="" reducedMotionCaption="" />
		</div>
	</MarketingSection>

	<!-- Problem band -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-eyebrow">{copy.problemsLabel}</div>
		<h2 class="sk-display mt-3 max-w-3xl text-2xl leading-tight sm:text-3xl">
			{copy.sectionTitles.problems}
		</h2>
		<ul class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{#each problemItems as item (item.title)}
				<li class="sk-card flex min-h-[6.25rem] gap-3 p-3.5">
					<span
						class="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--sk-accent-soft)] text-[var(--sk-accent)]"
						aria-hidden="true"
					>
						<CheckOutline size="xs" />
					</span>
					<span class="min-w-0">
						<span class="block text-sm font-semibold leading-5 text-[var(--sk-ink)]">
							{item.title}
						</span>
						<span class="mt-1 block text-[13px] leading-5 text-[var(--sk-muted)]">
							{item.body}
						</span>
					</span>
				</li>
			{/each}
		</ul>
	</MarketingSection>

	<!-- Process -->
	<MarketingSection band="card" class="py-10">
		<div class="sk-eyebrow">{copy.process}</div>
		<h2 class="sk-display mt-3 max-w-3xl text-2xl leading-tight sm:text-3xl">
			{copy.sectionTitles.process}
		</h2>
		<div class="mt-5 grid gap-4 sm:grid-cols-4">
			{#each steps as step, i (step.n)}
				{@const StepIcon = stepIcons[i]}
				<div class="sk-soft p-4">
					<div class="flex items-center justify-between">
						<StepIcon size="md" class="text-[var(--sk-accent)]" />
						<span class="sk-eyebrow">
							{copy.stepLabel}
							{step.n}
						</span>
					</div>
					<div class="mt-2 text-sm font-semibold">{step.title}</div>
					<p class="mt-1.5 text-[13px] leading-5 text-[var(--sk-muted)]">{step.desc}</p>
				</div>
			{/each}
		</div>
	</MarketingSection>

	<MarketingSection class="mt-8">
		<div class="sk-soft flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex min-w-0 items-center gap-4">
				<MascotBee size="sm" label="" class="hidden sm:inline-flex" />
				<div>
					<h2 class="text-lg font-semibold">{copy.midCtaTitle}</h2>
					<p class="mt-1 text-sm leading-6 text-[var(--sk-muted)]">{copy.midCtaBody}</p>
				</div>
			</div>
			<FlowbiteButton href={l('/beta')} variant="primary" class="shrink-0"
				>{copy.midCtaAction}</FlowbiteButton
			>
		</div>
	</MarketingSection>

	<!-- Examples -->
	<MarketingSection id="ornekler" class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-eyebrow">{copy.exampleSites}</div>
		<h2 class="sk-display mt-3 max-w-3xl text-2xl leading-tight sm:text-3xl">
			{copy.sectionTitles.examples}
		</h2>
		<ul class="mt-5 grid gap-4 sm:grid-cols-3">
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
								class="rounded px-2 py-0.5 font-[var(--font-mono)] text-[11px] text-white"
								style:background={swatches[preset as keyof typeof swatches]}
							>
								{copy.presetLabels[preset as keyof typeof swatches]}
							</span>
						</div>
						<div class="flex flex-wrap items-center gap-2 text-xs text-[var(--sk-muted)]">
							<span>{site.pages.length} {copy.pages}</span>
							<span class="opacity-40">·</span>
							{#each site.locales as locale (locale)}
								<a
									href="/preview/{site.id}?locale={locale}"
									class="inline-flex min-h-8 items-center rounded border border-[var(--sk-line-strong)] px-2 py-0.5 font-[var(--font-mono)] text-[11px]"
								>
									{locale.toUpperCase()}
								</a>
							{/each}
						</div>
						<div class="mt-auto flex gap-2 pt-1">
							<FlowbiteButton
								href="/preview/{site.id}"
								variant="secondary"
								size="sm"
								class="flex-1"
							>
								{copy.preview}
							</FlowbiteButton>
							<FlowbiteButton href="/editor/{site.id}" variant="secondary" size="sm" class="flex-1">
								{copy.edit}
							</FlowbiteButton>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</MarketingSection>

	<!-- Profession-specific GTM hooks -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-eyebrow">{copy.segmentsLabel}</div>
		<div class="mt-3 flex max-w-3xl flex-col gap-2">
			<h2 class="sk-display text-2xl leading-tight sm:text-3xl">{copy.segmentsTitle}</h2>
		</div>
		<div class="mt-5 grid gap-4 lg:grid-cols-3">
			{#each segmentCards as segment (segment.title)}
				<a
					href={l(segment.href)}
					class="sk-card group flex min-h-56 flex-col p-5 transition hover:-translate-y-0.5 hover:border-[rgba(47,111,106,.4)]"
				>
					<h3 class="text-base font-semibold text-[var(--sk-ink)]">{segment.title}</h3>
					<p class="mt-2 text-sm leading-6 text-[var(--sk-muted)]">{segment.desc}</p>
					<p
						class="mt-4 border-t border-[var(--sk-line)] pt-3 text-xs leading-5 text-[var(--sk-faint)]"
					>
						{segment.details}
					</p>
					<span
						class="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-[var(--sk-accent)]"
					>
						{segment.action}
						<span class="transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
					</span>
				</a>
			{/each}
		</div>
	</MarketingSection>

	<!-- Features -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-eyebrow">{copy.featuresEyebrow}</div>
		<h2 class="sk-display mt-3 max-w-3xl text-2xl leading-tight sm:text-3xl">{copy.features}</h2>
		<div class="mt-5 grid gap-4 sm:grid-cols-2">
			{#each features as f (f.title)}
				<div class="sk-card p-4">
					<h3 class="text-sm font-semibold">{f.title}</h3>
					<p class="mt-1.5 text-[13px] leading-5 text-[var(--sk-muted)]">{f.desc}</p>
				</div>
			{/each}
		</div>
	</MarketingSection>

	<!-- Pricing teaser -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-eyebrow">{copy.priceLabel}</div>
		<h2 class="sk-display mt-3 max-w-3xl text-2xl leading-tight sm:text-3xl">
			{copy.sectionTitles.pricing}
		</h2>
		<div class="mt-5 grid gap-4 sm:grid-cols-3">
			<a
				href={l('/new')}
				class="sk-card group block p-4 transition hover:-translate-y-0.5 hover:border-[rgba(47,111,106,.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sk-ink)]"
				aria-label={copy.planAria.free}
			>
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
				<span
					class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sk-accent)]"
				>
					{copy.primary}
					<span class="transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
				</span>
			</a>
			<a
				href={l('/pricing')}
				class="sk-card group block border-[var(--sk-accent)] p-4 ring-1 ring-[var(--sk-accent)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sk-ink)]"
				aria-label={copy.planAria.pro}
			>
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
				<span
					class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sk-accent)]"
				>
					{copy.pricing}
					<span class="transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
				</span>
			</a>
			<a
				href={l('/pricing')}
				class="sk-card group block p-4 transition hover:-translate-y-0.5 hover:border-[rgba(47,111,106,.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sk-ink)]"
				aria-label={copy.planAria.premium}
			>
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
				<span
					class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sk-accent)]"
				>
					{copy.allFeatures}
					<span class="transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
				</span>
			</a>
		</div>
		<FlowbiteButton href={l('/pricing')} variant="ghost" size="sm" class="mt-4"
			>{copy.allFeatures}<ArrowRightOutline size="xs" /></FlowbiteButton
		>
	</MarketingSection>

	<!-- FAQ -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-eyebrow">{copy.faqEyebrow}</div>
		<h2 class="sk-display mt-3 max-w-3xl text-2xl leading-tight sm:text-3xl">{copy.faq}</h2>
		<div class="mt-5 flex flex-col gap-3">
			{#each faqs as faq (faq.q)}
				<details class="sk-card group p-4">
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold transition-colors select-none hover:text-[var(--sk-accent)] [&::-webkit-details-marker]:hidden"
					>
						{faq.q}
						<span
							class="shrink-0 text-[var(--sk-faint)] transition-transform group-open:rotate-45 group-open:text-[var(--sk-accent)]"
							aria-hidden="true"
						>
							+
						</span>
					</summary>
					<p class="mt-2 text-sm leading-6 text-[var(--sk-muted)]">{faq.a}</p>
				</details>
			{/each}
		</div>
	</MarketingSection>

	<!-- Trust -->
	<MarketingSection class="mt-12 border-t border-[var(--sk-line)] pt-7">
		<div class="sk-eyebrow">{copy.trust}</div>
		<h2 class="sk-display mt-3 max-w-3xl text-2xl leading-tight sm:text-3xl">
			{copy.sectionTitles.trust}
		</h2>
		<div class="mt-5 grid gap-3 sm:grid-cols-2">
			{#each trustCards as card (card.title)}
				<div class="sk-card p-4">
					<h3 class="text-sm font-semibold">{card.title}</h3>
					<p class="mt-1.5 text-[13px] leading-5 text-[var(--sk-muted)]">{card.desc}</p>
				</div>
			{/each}
		</div>
	</MarketingSection>

	<!-- Final CTA: the page's one dark moment -->
	<MarketingSection band="ink" class="py-14 sm:py-16">
		<div use:reveal class="flex flex-col items-center gap-4 text-center">
			<MascotBee size="lg" label="SaasKaya bee mascot" class="sk-cta-bee" />
			<h2 class="sk-display text-3xl text-[var(--sk-paper)] sm:text-4xl">{copy.finalTitle}</h2>
			<p class="max-w-md text-base leading-7 text-[rgba(243,236,221,0.75)]">
				{copy.finalBody}
			</p>
			<FlowbiteButton href={l('/new')} variant="primary" size="lg"
				>{copy.primary}<ArrowRightOutline size="sm" /></FlowbiteButton
			>
		</div>
	</MarketingSection>
</PublicShell>
