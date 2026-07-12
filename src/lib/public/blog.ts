import type { Locale } from '$lib/i18n';

type LocalizedText = Record<Locale, string>;

export type BlogPost = {
	slug: string;
	date: string;
	readingMinutes: number;
	title: LocalizedText;
	description: LocalizedText;
	category: LocalizedText;
	sections: Record<Locale, { heading: string; body: string }[]>;
};

export const blogPosts: BlogPost[] = [
	{
		slug: 'ai-assisted-website-building',
		date: '2026-07-10',
		readingMinutes: 3,
		title: {
			en: 'What is AI-assisted website building?',
			tr: 'AI destekli web sitesi oluşturma nedir?',
			de: 'Was bedeutet AI-gestützter Website-Aufbau?'
		},
		description: {
			en: 'A plain-language explanation of how saaskaya uses AI without letting AI write unsafe website code.',
			tr: "saaskaya'nın AI'i güvensiz web kodu yazdırmadan nasıl kullandığını sade dille anlatır.",
			de: 'Eine einfache Erklärung, wie saaskaya AI nutzt, ohne unsicheren Website-Code schreiben zu lassen.'
		},
		category: {
			en: 'Product',
			tr: 'Ürün',
			de: 'Produkt'
		},
		sections: {
			en: [
				{
					heading: 'It starts with your practice, not a blank editor',
					body: 'You describe who you help, what you offer, and the tone you want. saaskaya turns that into a structured website draft with pages, sections, and copy in the supported languages.'
				},
				{
					heading: 'The important difference: AI does not write code',
					body: 'The platform keeps AI inside a validated structure. It can suggest text and arrange fixed components, but it cannot inject arbitrary HTML, CSS, or scripts into your site.'
				},
				{
					heading: 'You still review before publishing',
					body: 'The first draft is a starting point. You can edit text directly, ask for a warmer tone, and publish only when the result represents your work accurately.'
				}
			],
			tr: [
				{
					heading: 'Boş editörle değil, pratiğinizle başlar',
					body: 'Kime yardımcı olduğunuzu, ne sunduğunuzu ve hangi tonu istediğinizi anlatırsınız. saaskaya bunu sayfaları, bölümleri ve desteklenen dillerde metinleri olan yapısal bir site taslağına çevirir.'
				},
				{
					heading: 'Kritik fark: AI kod yazmaz',
					body: 'Platform AI’i doğrulanmış bir yapının içinde tutar. Metin önerebilir ve sabit bileşenleri düzenleyebilir, fakat sitenize serbest HTML, CSS veya script ekleyemez.'
				},
				{
					heading: 'Yayınlamadan önce kontrol sizde',
					body: 'İlk taslak sadece başlangıçtır. Metinleri doğrudan düzenleyebilir, daha sıcak bir ton isteyebilir ve yalnızca sizi doğru anlattığında yayınlayabilirsiniz.'
				}
			],
			de: [
				{
					heading: 'Es beginnt mit deiner Praxis, nicht mit einem leeren Editor',
					body: 'Du beschreibst, wem du hilfst, was du anbietest und welchen Ton du möchtest. saaskaya macht daraus einen strukturierten Website-Entwurf mit Seiten, Abschnitten und Texten in den unterstützten Sprachen.'
				},
				{
					heading: 'Der wichtige Unterschied: AI schreibt keinen Code',
					body: 'Die Plattform hält AI in einer validierten Struktur. Sie kann Texte vorschlagen und feste Komponenten anordnen, aber kein beliebiges HTML, CSS oder Script in deine Website einfügen.'
				},
				{
					heading: 'Du prüfst vor der Veröffentlichung',
					body: 'Der erste Entwurf ist ein Startpunkt. Du kannst Texte direkt bearbeiten, einen wärmeren Ton anfordern und erst veröffentlichen, wenn das Ergebnis deine Arbeit korrekt darstellt.'
				}
			]
		}
	},
	{
		slug: 'multilingual-websites-for-small-businesses',
		date: '2026-07-10',
		readingMinutes: 3,
		title: {
			en: 'Why small businesses need multilingual websites',
			tr: 'Küçük işletmeler neden çok dilli web sitelerine ihtiyaç duyar?',
			de: 'Warum kleine Unternehmen mehrsprachige Websites brauchen'
		},
		description: {
			en: 'Multilingual pages help professionals become understandable and trustworthy for clients across borders.',
			tr: 'Çok dilli sayfalar uzmanların farklı ülkelerdeki danışanlar için anlaşılır ve güvenilir görünmesine yardımcı olur.',
			de: 'Mehrsprachige Seiten helfen Fachleuten, für Kundinnen und Kunden über Grenzen hinweg verständlich und vertrauenswürdig zu wirken.'
		},
		category: {
			en: 'Growth',
			tr: 'Büyüme',
			de: 'Wachstum'
		},
		sections: {
			en: [
				{
					heading: 'Language is part of trust',
					body: 'A visitor understands your offer faster when the core pages are available in their language. For service businesses, clarity often matters more than a large campaign.'
				},
				{
					heading: 'It helps local and international discovery',
					body: 'A German, Turkish, or English page can answer different search intents and make your business easier to evaluate before a first message.'
				},
				{
					heading: 'Keep it maintainable',
					body: 'The practical goal is not to translate everything forever. Start with the pages that affect trust: home, services, about, contact, and legal basics.'
				}
			],
			tr: [
				{
					heading: 'Dil güvenin parçasıdır',
					body: 'Ziyaretçi temel sayfaları kendi dilinde gördüğünde teklifinizi daha hızlı anlar. Hizmet işletmelerinde açıklık çoğu zaman büyük kampanyadan daha değerlidir.'
				},
				{
					heading: 'Yerel ve uluslararası keşfi destekler',
					body: 'Almanca, Türkçe veya İngilizce bir sayfa farklı arama niyetlerini karşılayabilir ve ilk mesajdan önce işletmenizin değerlendirilmesini kolaylaştırır.'
				},
				{
					heading: 'Sürdürülebilir tutun',
					body: 'Amaç her şeyi sonsuza kadar çevirmek değildir. Güveni etkileyen sayfalardan başlayın: ana sayfa, hizmetler, hakkımızda, iletişim ve temel yasal sayfalar.'
				}
			],
			de: [
				{
					heading: 'Sprache ist Teil von Vertrauen',
					body: 'Besucher verstehen dein Angebot schneller, wenn die wichtigsten Seiten in ihrer Sprache verfügbar sind. Für Dienstleister ist Klarheit oft wichtiger als eine große Kampagne.'
				},
				{
					heading: 'Es unterstützt lokale und internationale Auffindbarkeit',
					body: 'Eine deutsche, türkische oder englische Seite kann verschiedene Suchintentionen beantworten und dein Angebot vor der ersten Nachricht leichter bewertbar machen.'
				},
				{
					heading: 'Halte es pflegbar',
					body: 'Das Ziel ist nicht, alles dauerhaft zu übersetzen. Starte mit den Seiten, die Vertrauen beeinflussen: Start, Leistungen, Über uns, Kontakt und rechtliche Basics.'
				}
			]
		}
	},
	{
		slug: 'saaskaya-for-professionals',
		date: '2026-07-10',
		readingMinutes: 2,
		title: {
			en: 'How saaskaya helps professionals launch faster',
			tr: 'saaskaya uzmanların daha hızlı yayına çıkmasına nasıl yardım eder?',
			de: 'Wie saaskaya Fachleuten schneller zum Launch hilft'
		},
		description: {
			en: 'saaskaya combines guided onboarding, controlled website kits, multilingual copy, and publishing workflow.',
			tr: 'saaskaya yönlendirmeli başlangıç, kontrollü site kitleri, çok dilli metin ve yayınlama akışını birleştirir.',
			de: 'saaskaya kombiniert geführtes Onboarding, kontrollierte Website-Kits, mehrsprachige Texte und Veröffentlichung.'
		},
		category: {
			en: 'Launch',
			tr: 'Lansman',
			de: 'Launch'
		},
		sections: {
			en: [
				{
					heading: 'Less setup, more useful first draft',
					body: 'The onboarding asks for the information that shapes a professional website. Then controlled kits give the draft a safe structure instead of starting from a generic template.'
				},
				{
					heading: 'Editing stays conversational',
					body: 'You can ask for practical changes in plain language. The system turns accepted requests into structured updates, while direct text edits remain simple.'
				},
				{
					heading: 'Publishing is part of the product',
					body: 'The goal is not just to generate a design. saaskaya also covers preview, subdomain publishing, custom-domain readiness, and operational support for launch.'
				}
			],
			tr: [
				{
					heading: 'Daha az kurulum, daha kullanışlı ilk taslak',
					body: 'Onboarding profesyonel bir web sitesini şekillendiren bilgileri sorar. Kontrollü kitler taslağı sıradan bir şablon yerine güvenli bir yapıyla başlatır.'
				},
				{
					heading: 'Düzenleme konuşarak ilerler',
					body: 'Pratik değişiklikleri doğal dille isteyebilirsiniz. Sistem onaylanan talepleri yapısal güncellemelere çevirir; doğrudan metin düzenleme ise basit kalır.'
				},
				{
					heading: 'Yayınlama ürünün parçasıdır',
					body: 'Amaç sadece tasarım üretmek değildir. saaskaya önizleme, alt alan adında yayın, özel domaine hazırlık ve lansman desteğini de kapsar.'
				}
			],
			de: [
				{
					heading: 'Weniger Setup, besserer erster Entwurf',
					body: 'Das Onboarding fragt nach den Informationen, die eine professionelle Website prägen. Kontrollierte Kits geben dem Entwurf eine sichere Struktur statt einer generischen Vorlage.'
				},
				{
					heading: 'Bearbeitung bleibt dialogorientiert',
					body: 'Du kannst praktische Änderungen in normaler Sprache anfordern. Das System macht daraus strukturierte Updates, während direkte Textänderungen einfach bleiben.'
				},
				{
					heading: 'Veröffentlichung gehört zum Produkt',
					body: 'Es geht nicht nur um einen Entwurf. saaskaya unterstützt Vorschau, Subdomain-Veröffentlichung, eigene Domain und operative Launch-Unterstützung.'
				}
			]
		}
	},
	{
		slug: 'domain-ssl-hosting-for-professionals',
		date: '2026-07-12',
		readingMinutes: 4,
		title: {
			en: 'Domain, SSL, and hosting in plain language',
			tr: 'Domain, SSL ve hosting: profesyoneller için sade anlatım',
			de: 'Domain, SSL und Hosting einfach erklärt'
		},
		description: {
			en: 'A non-technical guide for professionals who want a website without managing domain, security, DNS, and email forwarding separately.',
			tr: 'Domain, güvenlik, DNS ve e-posta yönlendirmesini ayrı ayrı yönetmek istemeyen profesyoneller için sade rehber.',
			de: 'Ein einfacher Leitfaden für Fachleute, die Domain, Sicherheit, DNS und E-Mail-Weiterleitung nicht getrennt verwalten möchten.'
		},
		category: {
			en: 'Guide',
			tr: 'Rehber',
			de: 'Leitfaden'
		},
		sections: {
			en: [
				{
					heading: 'A domain is the address people remember',
					body: 'Your domain is the address clients type or see on a business card. With saaskaya Pro Yearly, one standard .com domain can be included so you do not need a separate registrar workflow.'
				},
				{
					heading: 'SSL is the lock icon, not a design detail',
					body: 'SSL makes the connection secure and prevents visitors from seeing browser warnings. For a professional practice, this is basic trust infrastructure rather than an optional extra.'
				},
				{
					heading: 'Hosting, DNS, and email forwarding are the hidden work',
					body: 'A website needs a server, DNS records, renewal tracking, and a clean way to forward messages such as info@yourdomain.com. The point of a managed package is to remove those separate technical chores.'
				}
			],
			tr: [
				{
					heading: 'Domain insanların hatırladığı adrestir',
					body: 'Domain, danışanın ya da müvekkilin kartvizitte gördüğü ve tarayıcıya yazdığı adrestir. saaskaya Yıllık Pro’da bir standart .com alan adı dahil olabilir; ayrı bir domain sağlayıcı süreciyle uğraşmanız gerekmez.'
				},
				{
					heading: 'SSL kilit ikonudur, süs değildir',
					body: 'SSL bağlantıyı güvenli hale getirir ve ziyaretçinin tarayıcı uyarısı görmesini engeller. Profesyonel bir pratik için bu, tasarım detayı değil temel güven altyapısıdır.'
				},
				{
					heading: 'Hosting, DNS ve e-posta yönlendirme görünmeyen iştir',
					body: 'Bir sitenin sunucuya, DNS kayıtlarına, yenileme takibine ve info@alanadiniz.com gibi adresleri yönlendiren sade bir yapıya ihtiyacı vardır. Yönetilen paketin amacı bu teknik işleri ayrı ayrı takip ettirmemektir.'
				}
			],
			de: [
				{
					heading: 'Eine Domain ist die Adresse, die man sich merkt',
					body: 'Die Domain ist die Adresse, die Klienten in den Browser eingeben oder auf einer Visitenkarte sehen. Bei saaskaya Pro jährlich kann eine standard .com Domain enthalten sein, ohne separaten Registrar-Prozess.'
				},
				{
					heading: 'SSL ist das Schloss-Symbol, kein Designdetail',
					body: 'SSL sichert die Verbindung und verhindert Browserwarnungen. Für eine professionelle Praxis ist das Vertrauensinfrastruktur, nicht optionales Feintuning.'
				},
				{
					heading: 'Hosting, DNS und E-Mail-Weiterleitung sind die versteckte Arbeit',
					body: 'Eine Website braucht Server, DNS-Einträge, Verlängerungskontrolle und einen sauberen Weg für Weiterleitungen wie info@ihredomain.com. Ein verwaltetes Paket nimmt diese technischen Einzelaufgaben ab.'
				}
			]
		}
	},
	{
		slug: 'trustworthy-websites-for-psychologists-and-lawyers',
		date: '2026-07-12',
		readingMinutes: 5,
		title: {
			en: 'What makes a professional website feel trustworthy?',
			tr: 'Profesyonel bir web sitesi nasıl güven verir?',
			de: 'Was macht eine professionelle Website vertrauenswürdig?'
		},
		description: {
			en: 'A practical structure for psychologists and lawyers: calm, serious, informative pages without exaggerated claims.',
			tr: 'Psikologlar ve avukatlar için pratik yapı: sakin, ciddi, bilgilendirici ve abartısız sayfalar.',
			de: 'Eine praktische Struktur für Psychologen und Anwälte: ruhig, seriös, informativ und ohne überzogene Versprechen.'
		},
		category: {
			en: 'Positioning',
			tr: 'Konumlandırma',
			de: 'Positionierung'
		},
		sections: {
			en: [
				{
					heading: 'For psychologists: calm before persuasion',
					body: 'A psychology website should first reduce uncertainty. Clear language, visible credentials, service boundaries, and a gentle contact path matter more than aggressive conversion copy.'
				},
				{
					heading: 'For lawyers: seriousness before slogans',
					body: 'A law office website should help people understand practice areas and next steps. It should stay informative and avoid promises about outcomes or superiority.'
				},
				{
					heading: 'The shared structure',
					body: 'Both professions need a clear hero, services, about/credentials, process, FAQ, contact, legal/privacy basics, and multilingual readiness when serving international clients.'
				}
			],
			tr: [
				{
					heading: 'Psikolog için: ikna etmeden önce sakinlik',
					body: 'Psikolog sitesinin ilk görevi belirsizliği azaltmaktır. Açık dil, görünür unvanlar, hizmet sınırları ve yumuşak iletişim yolu agresif satış metninden daha önemlidir.'
				},
				{
					heading: 'Avukat için: slogandan önce ciddiyet',
					body: 'Avukat sitesinin görevi çalışma alanlarını ve sonraki adımı anlaşılır kılmaktır. Bilgilendirici kalmalı; sonuç garantisi, üstünlük iddiası ve abartılı ifadelerden uzak durmalıdır.'
				},
				{
					heading: 'Ortak yapı',
					body: 'İki meslek için de net hero, hizmetler, hakkımda/unvanlar, süreç, SSS, iletişim, yasal/gizlilik temelleri ve gerekirse çok dilli hazırlık güveni artırır.'
				}
			],
			de: [
				{
					heading: 'Für Psychologen: Ruhe vor Überzeugung',
					body: 'Eine psychologische Praxis-Website sollte zuerst Unsicherheit reduzieren. Klare Sprache, sichtbare Qualifikationen, Leistungsgrenzen und ein ruhiger Kontaktweg sind wichtiger als aggressive Conversion-Texte.'
				},
				{
					heading: 'Für Anwälte: Seriosität vor Slogans',
					body: 'Eine Kanzlei-Website sollte Tätigkeitsfelder und nächste Schritte verständlich machen. Sie sollte informativ bleiben und keine Erfolgs- oder Überlegenheitsversprechen nutzen.'
				},
				{
					heading: 'Die gemeinsame Struktur',
					body: 'Beide Berufsgruppen brauchen einen klaren Einstieg, Leistungen, Über-uns/Qualifikationen, Ablauf, FAQ, Kontakt, rechtliche Grundlagen und Mehrsprachigkeit, wenn internationale Klienten angesprochen werden.'
				}
			]
		}
	}
];

export function getBlogPost(slug: string): BlogPost | undefined {
	return blogPosts.find((post) => post.slug === slug);
}
