import type { Locale, Site } from '$lib/schema/site';
import { seedSites } from '$lib/seed';

export type PromptRecipe = {
	title: string;
	useCase: string;
	prompt: string;
};

export type ControlledKit = {
	slug: string;
	label: string;
	profession: string;
	category: 'psychology' | 'health' | 'local-service' | 'property';
	audience: string;
	outcome: string;
	featureKits: string[];
	promptRecipes: PromptRecipe[];
	createSite: () => Site;
};

type LocalizedText = Record<Locale, string>;
type ServiceItem = { name: string; description: string };
type FaqItem = { question: string; answer: string };

type ProfessionKitConfig = {
	slug: string;
	basePreset: keyof typeof seedSites;
	label: string;
	profession: string;
	category: ControlledKit['category'];
	audience: string;
	outcome: string;
	siteName: string;
	contactEmail: string;
	colors: Site['theme']['colors'];
	hero: { headline: LocalizedText; subheadline: LocalizedText; ctaLabel: LocalizedText };
	about: { title: LocalizedText; body: LocalizedText };
	services: { title: LocalizedText; intro: LocalizedText; items: Record<Locale, ServiceItem[]> };
	faq: { title: LocalizedText; items: Record<Locale, FaqItem[]> };
	contact: { title: LocalizedText; description: LocalizedText; submitLabel: LocalizedText };
	footer: LocalizedText;
	seo: LocalizedText;
	featureKits: string[];
	promptRecipes: PromptRecipe[];
};

function cloneSite(site: Site): Site {
	return structuredClone(site);
}

function createProfessionSite(config: ProfessionKitConfig): Site {
	const site = cloneSite(seedSites[config.basePreset]);
	site.id = `kit-${config.slug}`;
	site.tenantId = `tenant-kit-${config.slug}`;
	site.domain = undefined;
	site.theme = {
		...site.theme,
		colors: config.colors,
		radius: 'md'
	};
	site.settings = {
		...site.settings,
		siteName: config.siteName,
		contactEmail: config.contactEmail,
		seo: { description: config.seo },
		poweredByBadge: true
	};

	const [home] = site.pages;
	home.title = { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' };
	for (const section of home.sections) {
		section.id = `${section.type}-${config.slug}`;
		switch (section.type) {
			case 'hero':
				delete section.props.imageUrl;
				section.content = {
					tr: {
						headline: config.hero.headline.tr,
						subheadline: config.hero.subheadline.tr,
						ctaLabel: config.hero.ctaLabel.tr
					},
					en: {
						headline: config.hero.headline.en,
						subheadline: config.hero.subheadline.en,
						ctaLabel: config.hero.ctaLabel.en
					},
					de: {
						headline: config.hero.headline.de,
						subheadline: config.hero.subheadline.de,
						ctaLabel: config.hero.ctaLabel.de
					}
				};
				break;
			case 'about':
				delete section.props.imageUrl;
				section.content = {
					tr: { title: config.about.title.tr, body: config.about.body.tr },
					en: { title: config.about.title.en, body: config.about.body.en },
					de: { title: config.about.title.de, body: config.about.body.de }
				};
				break;
			case 'gallery':
				section.content = {
					tr: {
						title: config.services.title.tr,
						images: [{ url: '/og.jpg', alt: `${config.siteName} görsel alanı` }]
					},
					en: {
						title: config.services.title.en,
						images: [{ url: '/og.jpg', alt: `${config.siteName} visual placeholder` }]
					},
					de: {
						title: config.services.title.de,
						images: [{ url: '/og.jpg', alt: `${config.siteName} Bildplatzhalter` }]
					}
				};
				break;
			case 'services':
				section.content = {
					tr: {
						title: config.services.title.tr,
						intro: config.services.intro.tr,
						items: config.services.items.tr
					},
					en: {
						title: config.services.title.en,
						intro: config.services.intro.en,
						items: config.services.items.en
					},
					de: {
						title: config.services.title.de,
						intro: config.services.intro.de,
						items: config.services.items.de
					}
				};
				break;
			case 'faq':
				section.content = {
					tr: { title: config.faq.title.tr, items: config.faq.items.tr },
					en: { title: config.faq.title.en, items: config.faq.items.en },
					de: { title: config.faq.title.de, items: config.faq.items.de }
				};
				break;
			case 'contact':
				section.props = {
					...section.props,
					email: config.contactEmail
				};
				section.content = {
					tr: {
						title: config.contact.title.tr,
						description: config.contact.description.tr,
						submitLabel: config.contact.submitLabel.tr
					},
					en: {
						title: config.contact.title.en,
						description: config.contact.description.en,
						submitLabel: config.contact.submitLabel.en
					},
					de: {
						title: config.contact.title.de,
						description: config.contact.description.de,
						submitLabel: config.contact.submitLabel.de
					}
				};
				break;
			case 'cta':
				section.content = {
					tr: {
						title: config.hero.headline.tr,
						subtitle: config.hero.subheadline.tr,
						buttonLabel: config.hero.ctaLabel.tr
					},
					en: {
						title: config.hero.headline.en,
						subtitle: config.hero.subheadline.en,
						buttonLabel: config.hero.ctaLabel.en
					},
					de: {
						title: config.hero.headline.de,
						subtitle: config.hero.subheadline.de,
						buttonLabel: config.hero.ctaLabel.de
					}
				};
				break;
			case 'footer':
				section.content = {
					tr: { text: config.footer.tr, links: section.content.tr.links },
					en: { text: config.footer.en, links: section.content.en.links },
					de: { text: config.footer.de, links: section.content.de.links }
				};
				break;
			case 'team':
				section.content = {
					tr: {
						...section.content.tr,
						members: section.content.tr.members.map((member) => ({
							...member,
							photoUrl: undefined
						}))
					},
					en: {
						...section.content.en,
						members: section.content.en.members.map((member) => ({
							...member,
							photoUrl: undefined
						}))
					},
					de: {
						...section.content.de,
						members: section.content.de.members.map((member) => ({
							...member,
							photoUrl: undefined
						}))
					}
				};
				break;
		}
	}
	return site;
}

const configs: ProfessionKitConfig[] = [
	{
		slug: 'dietitian-modern',
		basePreset: 'dental',
		label: 'Modern Diyetisyen',
		profession: 'Diyetisyen',
		category: 'health',
		audience: 'Kilo yönetimi, klinik beslenme veya online danışmanlık veren diyetisyenler',
		outcome:
			'Hizmet alanlarını, görüşme sürecini ve randevu talebini netleştirerek güven veren bir sağlık sitesi çıkarır.',
		siteName: 'Dyt. Elif Karaca',
		contactEmail: 'randevu@elifkaraca.example',
		colors: {
			primary: '#3f7d5a',
			secondary: '#dfeee4',
			accent: '#d18b45',
			base: '#fbfaf4',
			neutral: '#24382d'
		},
		hero: {
			headline: {
				tr: 'Beslenme hedeflerin için uygulanabilir bir yol haritası',
				en: 'A practical nutrition roadmap for your goals',
				de: 'Ein praktikabler Ernährungsplan für deine Ziele'
			},
			subheadline: {
				tr: 'Kişisel ihtiyaçlarına, yaşam ritmine ve sağlık hedeflerine uygun beslenme danışmanlığı.',
				en: 'Nutrition counseling shaped around personal needs, daily rhythm and health goals.',
				de: 'Ernährungsberatung passend zu Bedürfnissen, Alltag und Gesundheitszielen.'
			},
			ctaLabel: {
				tr: 'Ön görüşme talep et',
				en: 'Request a first call',
				de: 'Erstgespräch anfragen'
			}
		},
		about: {
			title: { tr: 'Yaklaşım', en: 'Approach', de: 'Ansatz' },
			body: {
				tr: 'İlk görüşmede alışkanlıklarını, hedeflerini ve sürdürülebilir ilerleme alanlarını birlikte değerlendiririz. Amaç, kısa vadeli baskı değil uygulanabilir rutinler kurmaktır.',
				en: 'In the first meeting, habits, goals and sustainable progress areas are reviewed together. The focus is practical routines, not short-term pressure.',
				de: 'Im ersten Gespräch betrachten wir Gewohnheiten, Ziele und realistische nächste Schritte. Im Mittelpunkt stehen tragfähige Routinen statt kurzfristiger Druck.'
			}
		},
		services: {
			title: { tr: 'Danışmanlık alanları', en: 'Counseling areas', de: 'Beratungsbereiche' },
			intro: {
				tr: 'Her program kişisel sağlık bilgileri ve yaşam düzeni dikkate alınarak planlanır.',
				en: 'Each plan is shaped around personal health context and daily life.',
				de: 'Jeder Plan wird an Gesundheitssituation und Alltag angepasst.'
			},
			items: {
				tr: [
					{ name: 'Kilo yönetimi', description: 'Sürdürülebilir alışkanlıklar ve takip planı.' },
					{ name: 'Klinik beslenme', description: 'Doktor yönlendirmesiyle uyumlu destek süreci.' },
					{ name: 'Online danışmanlık', description: 'Uzaktan görüşme ve düzenli takip.' }
				],
				en: [
					{ name: 'Weight management', description: 'Sustainable habits and follow-up planning.' },
					{ name: 'Clinical nutrition', description: 'Support aligned with medical guidance.' },
					{ name: 'Online counseling', description: 'Remote sessions and regular check-ins.' }
				],
				de: [
					{
						name: 'Gewichtsmanagement',
						description: 'Nachhaltige Gewohnheiten und Verlaufskontrolle.'
					},
					{
						name: 'Klinische Ernährung',
						description: 'Begleitung passend zur ärztlichen Empfehlung.'
					},
					{ name: 'Online-Beratung', description: 'Remote-Termine und regelmäßige Begleitung.' }
				]
			}
		},
		faq: {
			title: { tr: 'Sık sorular', en: 'Common questions', de: 'Häufige Fragen' },
			items: {
				tr: [
					{
						question: 'İlk görüşmede ne konuşulur?',
						answer:
							'Hedefler, alışkanlıklar, sağlık bilgileri ve uygun takip ritmi değerlendirilir.'
					},
					{
						question: 'Online takip mümkün mü?',
						answer: 'Evet, uygun durumlarda online görüşme ve takip planı yapılabilir.'
					}
				],
				en: [
					{
						question: 'What happens in the first meeting?',
						answer: 'Goals, habits, health context and follow-up rhythm are reviewed.'
					},
					{
						question: 'Is online follow-up possible?',
						answer: 'Yes, online counseling and follow-up can be planned when suitable.'
					}
				],
				de: [
					{
						question: 'Was passiert im Erstgespräch?',
						answer: 'Ziele, Gewohnheiten, Gesundheitskontext und Begleitrhythmus werden besprochen.'
					},
					{
						question: 'Ist Online-Begleitung möglich?',
						answer: 'Ja, wenn passend, können Online-Termine und Verlaufskontrollen geplant werden.'
					}
				]
			}
		},
		contact: {
			title: { tr: 'Randevu talep et', en: 'Request an appointment', de: 'Termin anfragen' },
			description: {
				tr: 'Kısa bir mesaj bırak; uygun görüşme seçeneği için dönüş yapılır.',
				en: 'Leave a short message and receive a reply about suitable appointment options.',
				de: 'Sende eine kurze Nachricht und erhalte passende Terminoptionen.'
			},
			submitLabel: { tr: 'Gönder', en: 'Send', de: 'Senden' }
		},
		footer: {
			tr: '© 2026 Dyt. Elif Karaca. Bu site tıbbi tanı yerine geçmez.',
			en: '© 2026 Dietitian Elif Karaca. This site does not replace medical diagnosis.',
			de: '© 2026 Ernährungsberaterin Elif Karaca. Diese Website ersetzt keine medizinische Diagnose.'
		},
		seo: {
			tr: 'Diyetisyen Elif Karaca için modern, çok dilli beslenme danışmanlığı sitesi.',
			en: 'A modern multilingual nutrition counseling website for Dietitian Elif Karaca.',
			de: 'Eine moderne mehrsprachige Website für Ernährungsberatung.'
		},
		featureKits: ['booking-request', 'faq', 'whatsapp-cta'],
		promptRecipes: [
			{
				title: 'Beslenme hedeflerini netleştir',
				useCase: 'İlk taslağı kişiselleştirme',
				prompt:
					'Diyetisyen sitemde ana hedef kitlemi, sunduğum danışmanlık türlerini ve randevu akışını daha net anlat. Abartılı sağlık vaadi kullanma.'
			}
		]
	},
	{
		slug: 'real-estate-agent',
		basePreset: 'law',
		label: 'Emlak Danışmanı',
		profession: 'Emlak Danışmanı',
		category: 'property',
		audience: 'Portföy, bölge uzmanlığı ve hızlı iletişim vurgusu isteyen emlak danışmanları',
		outcome:
			'Bölge güveni, portföy danışmanlığı ve satıcı/alıcı iletişimini düzenli bir vitrine taşır.',
		siteName: 'Mert Kaya Gayrimenkul',
		contactEmail: 'info@mertkaya.example',
		colors: {
			primary: '#315f72',
			secondary: '#dce8ed',
			accent: '#b98b4b',
			base: '#f8f7f2',
			neutral: '#1f3138'
		},
		hero: {
			headline: {
				tr: 'Doğru alıcıyla doğru portföyü buluştur',
				en: 'Match the right property with the right buyer',
				de: 'Die passende Immobilie mit dem passenden Käufer verbinden'
			},
			subheadline: {
				tr: 'Bölge bilgisi, şeffaf süreç ve hızlı geri dönüşle alım-satım danışmanlığı.',
				en: 'Real estate guidance with local knowledge, transparent process and quick follow-up.',
				de: 'Immobilienberatung mit lokaler Expertise, transparentem Ablauf und schneller Rückmeldung.'
			},
			ctaLabel: {
				tr: 'Portföy için iletişime geç',
				en: 'Discuss a property',
				de: 'Immobilie besprechen'
			}
		},
		about: {
			title: {
				tr: 'Bölge odaklı danışmanlık',
				en: 'Local-market guidance',
				de: 'Regionale Beratung'
			},
			body: {
				tr: 'Satıcı ve alıcı tarafında beklenti, fiyat aralığı ve süreç adımlarını netleştirerek ilerleriz. Amaç güvenilir, takip edilebilir ve hızlı bir satış/kiralama deneyimidir.',
				en: 'Expectations, price range and process steps are clarified for sellers and buyers. The aim is a reliable, trackable sales or rental experience.',
				de: 'Erwartungen, Preisspanne und Prozessschritte werden für Käufer und Verkäufer geklärt. Ziel ist ein verlässlicher und nachvollziehbarer Ablauf.'
			}
		},
		services: {
			title: { tr: 'Hizmetler', en: 'Services', de: 'Leistungen' },
			intro: {
				tr: 'Portföy hazırlığından görüşme takibine kadar kontrollü bir danışmanlık akışı.',
				en: 'A structured advisory flow from listing preparation to follow-up.',
				de: 'Ein strukturierter Beratungsablauf von der Objektvorbereitung bis zur Nachverfolgung.'
			},
			items: {
				tr: [
					{
						name: 'Satılık portföy danışmanlığı',
						description: 'Fiyatlama, sunum ve alıcı iletişimi.'
					},
					{
						name: 'Kiralık portföy takibi',
						description: 'Talep toplama, randevu ve aday değerlendirme.'
					},
					{
						name: 'Bölge analizi',
						description: 'Mahalle, fiyat bandı ve yatırım beklentisi değerlendirmesi.'
					}
				],
				en: [
					{ name: 'Sales listings', description: 'Pricing, presentation and buyer communication.' },
					{
						name: 'Rental listings',
						description: 'Lead collection, appointments and candidate review.'
					},
					{
						name: 'Area analysis',
						description: 'Neighborhood, price band and investment expectation review.'
					}
				],
				de: [
					{
						name: 'Verkaufsobjekte',
						description: 'Preisfindung, Präsentation und Käuferkommunikation.'
					},
					{ name: 'Mietobjekte', description: 'Anfragen, Termine und Bewerberprüfung.' },
					{ name: 'Standortanalyse', description: 'Lage, Preisband und Investitionserwartungen.' }
				]
			}
		},
		faq: {
			title: { tr: 'Sık sorular', en: 'Common questions', de: 'Häufige Fragen' },
			items: {
				tr: [
					{
						question: 'Portföy değerlendirmesi nasıl başlar?',
						answer: 'Konum, metrekare, durum ve hedef fiyat bilgileriyle ilk değerlendirme yapılır.'
					},
					{
						question: 'Süreçte nasıl bilgilendirilirim?',
						answer: 'Görüşme talepleri ve gelişmeler düzenli olarak paylaşılır.'
					}
				],
				en: [
					{
						question: 'How does a listing review start?',
						answer: 'Location, size, condition and target price are reviewed first.'
					},
					{
						question: 'How will I be updated?',
						answer: 'Viewing requests and progress updates are shared regularly.'
					}
				],
				de: [
					{
						question: 'Wie startet eine Objektbewertung?',
						answer: 'Lage, Größe, Zustand und Zielpreis werden zuerst geprüft.'
					},
					{
						question: 'Wie bleibe ich informiert?',
						answer: 'Besichtigungsanfragen und Entwicklungen werden regelmäßig geteilt.'
					}
				]
			}
		},
		contact: {
			title: {
				tr: 'Portföyünü konuşalım',
				en: 'Let’s discuss your property',
				de: 'Lass uns über deine Immobilie sprechen'
			},
			description: {
				tr: 'Satış, kiralama veya bölge analizi için kısa bilgileri paylaş.',
				en: 'Share a few details for sales, rental or area analysis.',
				de: 'Teile ein paar Details zu Verkauf, Vermietung oder Standortanalyse.'
			},
			submitLabel: { tr: 'Bilgi gönder', en: 'Send details', de: 'Details senden' }
		},
		footer: {
			tr: '© 2026 Mert Kaya Gayrimenkul. Portföy ve fiyat bilgileri değişebilir.',
			en: '© 2026 Mert Kaya Real Estate. Listings and prices may change.',
			de: '© 2026 Mert Kaya Immobilien. Objekte und Preise können sich ändern.'
		},
		seo: {
			tr: 'Emlak danışmanları için portföy ve bölge uzmanlığı odaklı çok dilli site kiti.',
			en: 'A multilingual website kit for real estate agents focused on listings and local trust.',
			de: 'Ein mehrsprachiges Website-Kit für Immobilienberater mit Fokus auf Objekte und regionale Expertise.'
		},
		featureKits: ['property-inquiry', 'map-location', 'whatsapp-cta'],
		promptRecipes: [
			{
				title: 'Bölge uzmanlığını güçlendir',
				useCase: 'Yerel güven ve satış dili',
				prompt:
					'Emlak danışmanı sitemde uzman olduğum bölgeleri, satıcı/alıcı süreçlerini ve hızlı iletişim avantajımı daha güven veren bir dille anlat.'
			}
		]
	},
	{
		slug: 'beauty-salon',
		basePreset: 'dental',
		label: 'Güzellik Salonu',
		profession: 'Güzellik Salonu',
		category: 'local-service',
		audience: 'Randevu, hizmet paketi ve görsel güven isteyen güzellik merkezleri',
		outcome:
			'Hizmetleri, hijyen/güven yaklaşımını ve randevu çağrısını sade bir yerel işletme sitesine dönüştürür.',
		siteName: 'Luna Beauty Studio',
		contactEmail: 'merhaba@lunabeauty.example',
		colors: {
			primary: '#7a5267',
			secondary: '#efdde5',
			accent: '#c79a5f',
			base: '#fbf7f8',
			neutral: '#382932'
		},
		hero: {
			headline: {
				tr: 'Bakım randevularını daha kolay planla',
				en: 'Plan beauty appointments with less friction',
				de: 'Beauty-Termine einfacher planen'
			},
			subheadline: {
				tr: 'Cilt bakımı, kaş-kirpik ve kişisel bakım hizmetleri için temiz, düzenli ve hızlı randevu akışı.',
				en: 'A clean, organized booking flow for skincare, brow-lash and personal care services.',
				de: 'Ein klarer Terminablauf für Hautpflege, Brow-Lash und persönliche Pflegeleistungen.'
			},
			ctaLabel: { tr: 'Randevu iste', en: 'Request appointment', de: 'Termin anfragen' }
		},
		about: {
			title: { tr: 'Studio yaklaşımı', en: 'Studio approach', de: 'Studio-Ansatz' },
			body: {
				tr: 'Her hizmette hijyen, doğru bilgilendirme ve beklenti yönetimi önceliklidir. İlk iletişimde ihtiyacını anlayıp uygun hizmet ve zaman seçeneğini netleştiririz.',
				en: 'Hygiene, clear information and expectation setting come first. The first contact clarifies the right service and appointment option.',
				de: 'Hygiene, klare Information und Erwartungsmanagement stehen im Vordergrund. Im ersten Kontakt klären wir passende Leistung und Terminoption.'
			}
		},
		services: {
			title: { tr: 'Hizmetler', en: 'Services', de: 'Leistungen' },
			intro: {
				tr: 'Hizmet listesi randevu öncesi beklentiyi netleştirmek için sade tutulur.',
				en: 'The service list is kept simple so expectations are clear before booking.',
				de: 'Die Leistungsliste bleibt klar, damit Erwartungen vor dem Termin verständlich sind.'
			},
			items: {
				tr: [
					{ name: 'Cilt bakımı', description: 'İhtiyaca göre planlanan bakım seansları.' },
					{ name: 'Kaş ve kirpik', description: 'Randevu öncesi bilgilendirme ve uygulama akışı.' },
					{ name: 'Bakım paketleri', description: 'Düzenli bakım için paket seçenekleri.' }
				],
				en: [
					{ name: 'Skincare', description: 'Care sessions planned around individual needs.' },
					{
						name: 'Brow and lash',
						description: 'Clear pre-appointment information and service flow.'
					},
					{ name: 'Care packages', description: 'Package options for regular care routines.' }
				],
				de: [
					{
						name: 'Hautpflege',
						description: 'Pflegesitzungen passend zu individuellen Bedürfnissen.'
					},
					{ name: 'Brow und Lash', description: 'Klare Information und Ablauf vor dem Termin.' },
					{ name: 'Pflegepakete', description: 'Paketoptionen für regelmäßige Pflege.' }
				]
			}
		},
		faq: {
			title: { tr: 'Sık sorular', en: 'Common questions', de: 'Häufige Fragen' },
			items: {
				tr: [
					{
						question: 'Randevu nasıl alınır?',
						answer: 'Formu doldurarak veya telefonla uygun gün ve saat için dönüş alabilirsin.'
					},
					{
						question: 'Hangi hizmet bana uygun?',
						answer: 'İlk iletişimde ihtiyacın ve beklentin değerlendirilerek yönlendirme yapılır.'
					}
				],
				en: [
					{
						question: 'How do I book?',
						answer: 'Use the form or phone contact to receive suitable appointment options.'
					},
					{
						question: 'Which service fits me?',
						answer: 'Needs and expectations are reviewed before suggesting a service.'
					}
				],
				de: [
					{
						question: 'Wie buche ich?',
						answer: 'Über Formular oder Telefon erhältst du passende Terminoptionen.'
					},
					{
						question: 'Welche Leistung passt zu mir?',
						answer: 'Bedarf und Erwartungen werden vor einer Empfehlung geklärt.'
					}
				]
			}
		},
		contact: {
			title: { tr: 'Randevu iste', en: 'Request an appointment', de: 'Termin anfragen' },
			description: {
				tr: 'İstediğin hizmeti ve uygun zaman aralığını yaz; sana dönüş yapalım.',
				en: 'Share the service and preferred time window, and we will reply.',
				de: 'Nenne die gewünschte Leistung und Zeitfenster, wir melden uns.'
			},
			submitLabel: { tr: 'Talep gönder', en: 'Send request', de: 'Anfrage senden' }
		},
		footer: {
			tr: '© 2026 Luna Beauty Studio. Hizmet uygunluğu kişisel ihtiyaca göre değişebilir.',
			en: '© 2026 Luna Beauty Studio. Service suitability may vary by individual need.',
			de: '© 2026 Luna Beauty Studio. Die Eignung der Leistungen kann individuell variieren.'
		},
		seo: {
			tr: 'Güzellik salonları için randevu ve hizmet odaklı çok dilli website kiti.',
			en: 'A multilingual appointment-focused website kit for beauty salons.',
			de: 'Ein mehrsprachiges terminorientiertes Website-Kit für Beauty-Studios.'
		},
		featureKits: ['booking-request', 'gallery', 'whatsapp-cta'],
		promptRecipes: [
			{
				title: 'Hizmet listesini satışa hazırla',
				useCase: 'Randevu dönüşümünü artırma',
				prompt:
					'Güzellik salonu sitemde hizmetlerimi, hijyen yaklaşımımı ve randevu alma adımlarını daha net ve profesyonel hale getir.'
			}
		]
	}
];

export const professionKits: ControlledKit[] = configs.map((config) => ({
	slug: config.slug,
	label: config.label,
	profession: config.profession,
	category: config.category,
	audience: config.audience,
	outcome: config.outcome,
	featureKits: config.featureKits,
	promptRecipes: config.promptRecipes,
	createSite: () => createProfessionSite(config)
}));
