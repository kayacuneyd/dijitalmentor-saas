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
	}
];

export function getBlogPost(slug: string): BlogPost | undefined {
	return blogPosts.find((post) => post.slug === slug);
}
