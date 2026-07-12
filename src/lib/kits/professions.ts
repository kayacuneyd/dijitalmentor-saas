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
	testimonials?: { title: LocalizedText; intro: LocalizedText; items: Record<string, { quote: string; name: string; role: string; rating: number }[]> };
	pricing?: { title: LocalizedText; intro: LocalizedText; items: Record<string, { name: string; price: string; description: string; features: string[]; highlighted: boolean }[]> };
	process?: { title: LocalizedText; intro: LocalizedText; steps: Record<string, { label: string; description: string }[]> };
	booking?: { title: LocalizedText; subtitle: LocalizedText; buttonLabel: LocalizedText; note: LocalizedText };
	credentials?: { title: LocalizedText; intro: LocalizedText; items: Record<string, { name: string; issuer: string; year: string }[]> };
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
	site.pages = [home];
	site.nav.items = site.nav.items.filter((item) => item.pageSlug === home.slug);
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

	// --- Insertion helper for optional kit sections ---
	const insertions: { key: string; matchers: string[] }[] = [
		{ key: 'process',     matchers: ['faq', 'cta', 'contact'] },
		{ key: 'pricing',     matchers: ['faq', 'cta', 'contact', 'testimonials'] },
		{ key: 'testimonials',matchers: ['faq', 'cta', 'contact'] },
		{ key: 'credentials', matchers: ['faq', 'cta', 'contact'] },
		{ key: 'booking',     matchers: ['contact', 'footer'] }
	];
	for (const ins of insertions) {
		const content = (config as Record<string,unknown>)[ins.key];
		if (!content) continue;
		let at = home.sections.length;
		for (let i = 0; i < home.sections.length; i++) {
			if (ins.matchers.includes(home.sections[i].type)) { at = i; break; }
		}
		// Dynamic kit section insertion — type-erased; validated by siteSchema on read

		home.sections.push({ id: ins.key + "-" + config.slug, type: ins.key, props: (ins.key === "booking" ? { variant: "inline", href: "#contact-" + config.slug } : ins.key === "process" ? { variant: "vertical" } : ins.key === "pricing" ? { variant: "cards", currency: "₺" } : { variant: "grid" }), content } as never);
	}
	if (home.sections.length > 12) throw new Error('Kit ' + config.slug + ' has ' + home.sections.length + ' sections (max 12).');
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
,

	{
		slug: 'physiotherapist-modern', basePreset: 'dental', label: 'Fizyoterapist', profession: 'Fizyoterapist', category: 'health',
		audience: 'Manuel terapi, spor rehabilitasyonu veya kronik ağrı yönetimi yapan fizyoterapistler',
		outcome: 'Tedavi alanlarını ve randevu yolunu güven veren bir sağlık sitesinde toparlar.',
		siteName: 'Fzt. Deniz Korkmaz', contactEmail: 'randevu@denizkorkmaz.example',
		colors: { primary: '#2e6b62', secondary: '#ddebe5', accent: '#c48644', base: '#faf9f4', neutral: '#213530' },
		hero: { headline: { tr: 'Hareketle iyileş, güçlen, devam et', en: 'Recover, strengthen, keep moving', de: 'Heilen, kräftigen, weiter bewegen' }, subheadline: { tr: 'Kişiye özel fizyoterapi ve rehabilitasyon.', en: 'Personalized physiotherapy and rehabilitation.', de: 'Individuelle Physiotherapie und Rehabilitation.' }, ctaLabel: { tr: 'Ön görüşme talep et', en: 'Request a first call', de: 'Erstgespräch anfragen' } },
		about: { title: { tr: 'Yaklaşım', en: 'Approach', de: 'Ansatz' }, body: { tr: 'İlk seansta hareket analizi ve hedefler değerlendirilir. Plan kişiye özel hedeflerle yürütülür.', en: 'Movement analysis and goals are assessed in the first session.', de: 'Bewegungsanalyse und Ziele werden in der ersten Sitzung bewertet.' } },
		services: { title: { tr: 'Tedavi alanları', en: 'Treatment areas', de: 'Behandlungsbereiche' }, intro: { tr: 'Her program bireysel değerlendirme sonrası planlanır.', en: 'Each program is planned after individual assessment.', de: 'Jedes Programm wird nach individueller Bewertung geplant.' }, items: { tr: [{ name: 'Manuel terapi', description: 'Eklem ve yumuşak doku mobilizasyonu.' }, { name: 'Spor rehabilitasyonu', description: 'Sakatlık sonrası güvenli spora dönüş.' }, { name: 'Kronik ağrı', description: 'Duruş, güçlendirme ve günlük yaşam stratejileri.' }], en: [{ name: 'Manual therapy', description: 'Joint and soft-tissue mobilization.' }, { name: 'Sports rehab', description: 'Safe return to sport after injury.' }, { name: 'Chronic pain', description: 'Posture, strengthening and daily-life strategies.' }], de: [{ name: 'Manuelle Therapie', description: 'Gelenk- und Weichteilmobilisation.' }, { name: 'Sport-Reha', description: 'Sichere Rückkehr zum Sport.' }, { name: 'Chronische Schmerzen', description: 'Haltung, Kräftigung und Alltagsstrategien.' }] } },
		faq: { title: { tr: 'Sık sorular', en: 'Common questions', de: 'Häufige Fragen' }, items: { tr: [{ question: 'İlk seansta ne yapılır?', answer: 'Hareket analizi, ağrı değerlendirmesi ve hedef belirleme yapılır.' }, { question: 'Kaç seans gerekir?', answer: 'Değerlendirme sonrası tahmini seans sayısı paylaşılır.' }], en: [{ question: 'First session?', answer: 'Movement analysis, pain assessment and goal setting.' }, { question: 'How many sessions?', answer: 'An estimate is shared after assessment.' }], de: [{ question: 'Erste Sitzung?', answer: 'Bewegungsanalyse, Schmerzbewertung und Zielsetzung.' }, { question: 'Wie viele Sitzungen?', answer: 'Eine Schätzung wird nach der Bewertung geteilt.' }] } },
		contact: { title: { tr: 'Randevu talep et', en: 'Request an appointment', de: 'Termin anfragen' }, description: { tr: 'Kısa bir mesaj bırak; dönüş yapılır.', en: 'Leave a short message for a suitable appointment.', de: 'Sende eine kurze Nachricht.' }, submitLabel: { tr: 'Gönder', en: 'Send', de: 'Senden' } },
		footer: { tr: '© Fzt. Deniz Korkmaz. Bu site tıbbi tanı yerine geçmez.', en: '© Physio Deniz Korkmaz. Not a medical diagnosis.', de: '© Physio Deniz Korkmaz. Keine medizinische Diagnose.' },
		seo: { tr: 'Fizyoterapist Deniz Korkmaz için hareket odaklı site.', en: 'Movement-focused site for Physiotherapist Deniz Korkmaz.', de: 'Bewegungsorientierte Website für Physiotherapeut Deniz Korkmaz.' },
		featureKits: ['booking-request', 'faq', 'whatsapp-cta'], promptRecipes: [{ title: 'Tedavi alanlarını netleştir', useCase: 'İlk taslak', prompt: 'Fizyoterapist sitemde tedavi alanlarımı ve randevu sürecimi daha güven veren bir dille anlat. Tıbbi garanti kullanma.' }],
		process: { title: { tr: 'Tedavi süreci', en: 'Treatment process', de: 'Behandlungsablauf' }, intro: { tr: 'İlk görüşmeden taburcuya adımlar.', en: 'Steps from first visit to discharge.', de: 'Schritte vom Erstbesuch bis zur Entlassung.' }, steps: { tr: [{ label: 'Değerlendirme', description: 'Hareket analizi ve hedef belirleme.' }, { label: 'Tedavi planı', description: 'Kişiye özel program.' }, { label: 'Takip', description: 'Düzenli ölçüm ve güncelleme.' }], en: [{ label: 'Assessment', description: 'Movement analysis and goal setting.' }, { label: 'Treatment plan', description: 'Personalized program.' }, { label: 'Follow-up', description: 'Regular measurement and updates.' }], de: [{ label: 'Bewertung', description: 'Bewegungsanalyse und Zielsetzung.' }, { label: 'Behandlungsplan', description: 'Individuelles Programm.' }, { label: 'Verlaufskontrolle', description: 'Regelmäßige Messung.' }] } },
		pricing: { title: { tr: 'Seans seçenekleri', en: 'Session options', de: 'Sitzungsoptionen' }, intro: { tr: 'İhtiyaca göre paket.', en: 'Package based on need.', de: 'Paket nach Bedarf.' }, items: { tr: [{ name: 'Tek seans', price: '800 ₺', description: 'Değerlendirme ve tedavi.', features: ['50 dk', 'Egzersiz planı'], highlighted: false }, { name: '5 seans', price: '3500 ₺', description: 'Kapsamlı rehabilitasyon.', features: ['5 × 50 dk', 'İlerleme raporu', 'Mesaj desteği'], highlighted: true }, { name: '10 seans', price: '6500 ₺', description: 'Uzun süreli takip.', features: ['10 × 50 dk', 'Detaylı rapor', 'Öncelikli randevu'], highlighted: false }], en: [{ name: 'Single', price: '800 TL', description: 'Assessment and treatment.', features: ['50-min', 'Exercise plan'], highlighted: false }, { name: '5-pack', price: '3500 TL', description: 'Comprehensive rehab.', features: ['5 × 50-min', 'Progress report', 'Message support'], highlighted: true }, { name: '10-pack', price: '6500 TL', description: 'Long-term follow-up.', features: ['10 × 50-min', 'Detailed report', 'Priority booking'], highlighted: false }], de: [{ name: 'Einzeln', price: '800 TL', description: 'Bewertung und Behandlung.', features: ['50-Min.', 'Übungsplan'], highlighted: false }, { name: '5er-Paket', price: '3500 TL', description: 'Umfassende Reha.', features: ['5 × 50-Min.', 'Fortschrittsbericht'], highlighted: true }, { name: '10er-Paket', price: '6500 TL', description: 'Langzeit.', features: ['10 × 50-Min.'], highlighted: false }] } },
		testimonials: { title: { tr: 'Danışan yorumları', en: 'Client feedback', de: 'Rückmeldungen' }, intro: { tr: 'İsimler gizlilik nedeniyle kısaltılmıştır.', en: 'Names shortened for confidentiality.', de: 'Namen aus Vertraulichkeit gekürzt.' }, items: { tr: [{ quote: 'Bel ağrım 3 seansta büyük ölçüde azaldı.', name: 'Ö.K.', role: 'danışan', rating: 5 }, { quote: 'Spor sakatlığım sonrası güvenle koşuya döndüm.', name: 'T.M.', role: 'sporcu', rating: 5 }, { quote: 'Kronik boyun ağrım için duruş analizi çok faydalı oldu.', name: 'R.A.', role: 'danışan', rating: 4 }], en: [{ quote: 'Back pain reduced significantly in 3 sessions.', name: 'Ö.K.', role: 'client', rating: 5 }, { quote: 'Returned to running safely post-injury.', name: 'T.M.', role: 'athlete', rating: 5 }, { quote: 'Posture analysis helped my chronic neck pain.', name: 'R.A.', role: 'client', rating: 4 }], de: [{ quote: 'Rückenschmerzen in 3 Sitzungen stark reduziert.', name: 'Ö.K.', role: 'Klient*in', rating: 5 }, { quote: 'Sicher zum Laufen zurückgekehrt.', name: 'T.M.', role: 'Sportler*in', rating: 5 }, { quote: 'Haltungsanalyse half bei Nackenschmerzen.', name: 'R.A.', role: 'Klient*in', rating: 4 }] } },
		booking: { title: { tr: 'İlk adımı atın', en: 'Take the first step', de: 'Machen Sie den ersten Schritt' }, subtitle: { tr: 'Uygun gün ve saat için formu doldurun.', en: 'Fill out the form.', de: 'Formular ausfüllen.' }, buttonLabel: { tr: 'Randevu talep et', en: 'Request appointment', de: 'Termin anfragen' }, note: { tr: 'Her mesaj gizlilik çerçevesinde değerlendirilir.', en: 'Every message is handled confidentially.', de: 'Vertrauliche Behandlung.' } }
	},
	{
		slug: 'dentist-clinic', basePreset: 'dental', label: 'Diş Kliniği', profession: 'Diş Hekimi', category: 'health',
		audience: 'Muayenehane veya klinikte genel diş hekimliği yapan profesyoneller',
		outcome: 'Hizmetleri ve randevu yolunu güven veren bir klinik vitrininde toparlar.',
		siteName: 'Dt. Selin Arslan', contactEmail: 'randevu@selinarslan.example',
		colors: { primary: '#3d6b8a', secondary: '#dde7f0', accent: '#b8804c', base: '#f7f9fb', neutral: '#1f303c' },
		hero: { headline: { tr: 'Sağlıklı gülüşler için güvenilir dokunuş', en: 'Trusted care for healthy smiles', de: 'Vertrauensvolle Pflege für gesunde Lächeln' }, subheadline: { tr: 'Genel diş hekimliği, koruyucu bakım ve estetik uygulamalar.', en: 'General dentistry, preventive care and aesthetic treatments.', de: 'Allgemeine Zahnheilkunde, Prophylaxe und ästhetische Behandlungen.' }, ctaLabel: { tr: 'Randevu al', en: 'Book an appointment', de: 'Termin vereinbaren' } },
		about: { title: { tr: 'Kliniğimiz', en: 'Our clinic', de: 'Unsere Praxis' }, body: { tr: 'Modern ekipman ve titiz hijyenle her yaştan hastaya hizmet veriyoruz.', en: 'We serve patients of all ages with modern equipment and strict hygiene.', de: 'Wir betreuen Patienten jeden Alters mit moderner Ausstattung.' } },
		services: { title: { tr: 'Hizmetler', en: 'Services', de: 'Leistungen' }, intro: { tr: 'Her tedavi bireysel değerlendirme sonrası planlanır.', en: 'Every treatment is planned after individual assessment.', de: 'Jede Behandlung wird individuell geplant.' }, items: { tr: [{ name: 'Genel diş hekimliği', description: 'Check-up, dolgu, kanal tedavisi.' }, { name: 'Estetik diş hekimliği', description: 'Beyazlatma, bonding, laminate veneer.' }, { name: 'Koruyucu bakım', description: 'Periyodik kontrol ve hijyen danışmanlığı.' }], en: [{ name: 'General dentistry', description: 'Check-ups, fillings, root canals.' }, { name: 'Aesthetic dentistry', description: 'Whitening, bonding, veneers.' }, { name: 'Preventive care', description: 'Periodic exams and hygiene counseling.' }], de: [{ name: 'Allgemeine Zahnheilkunde', description: 'Check-ups, Füllungen.' }, { name: 'Ästhetische Zahnheilkunde', description: 'Bleaching, Veneers.' }, { name: 'Prophylaxe', description: 'Regelmäßige Kontrollen.' }] } },
		faq: { title: { tr: 'Sık sorular', en: 'Common questions', de: 'Häufige Fragen' }, items: { tr: [{ question: 'İlk muayenede ne yapılır?', answer: 'Ağız içi muayene ve tedavi planı sunulur.' }, { question: 'Randevu nasıl alınır?', answer: 'Formu doldurarak veya telefonla.' }], en: [{ question: 'First exam?', answer: 'Oral exam and treatment plan.' }, { question: 'How to book?', answer: 'Use the form or phone.' }], de: [{ question: 'Erste Untersuchung?', answer: 'Munduntersuchung und Behandlungsplan.' }, { question: 'Termin buchen?', answer: 'Über Formular oder Telefon.' }] } },
		contact: { title: { tr: 'Randevu talep et', en: 'Request an appointment', de: 'Termin anfragen' }, description: { tr: 'Kısa mesaj bırak; dönüş yapalım.', en: 'Leave a message for a suitable time.', de: 'Nachricht für passenden Termin.' }, submitLabel: { tr: 'Gönder', en: 'Send', de: 'Senden' } },
		footer: { tr: '© Dt. Selin Arslan. Bilgilendirme amaçlıdır.', en: '© Dentist Selin Arslan. Informational only.', de: '© Zahnärztin Selin Arslan. Nur zu Informationszwecken.' },
		seo: { tr: 'Diş hekimi Selin Arslan için klinik sitesi.', en: 'Dental clinic site for Dentist Selin Arslan.', de: 'Zahnarztpraxis-Website für Selin Arslan.' },
		featureKits: ['booking-request', 'faq', 'gallery'], promptRecipes: [{ title: 'Klinik hizmetlerini vurgula', useCase: 'İlk taslak', prompt: 'Diş hekimi sitemde hizmetlerimi daha profesyonel bir dille anlat.' }],
		testimonials: { title: { tr: 'Hasta yorumları', en: 'Patient feedback', de: 'Patientenfeedback' }, intro: { tr: 'İsimler kısaltılmıştır.', en: 'Names shortened.', de: 'Namen gekürzt.' }, items: { tr: [{ quote: 'En rahat gittiğim muayenehane.', name: 'B.D.', role: 'hasta', rating: 5 }, { quote: 'Kanal tedavisi çok konforlu geçti.', name: 'E.Ç.', role: 'hasta', rating: 5 }, { quote: 'Gülüş tasarımı sonrası özgüvenim arttı.', name: 'M.Y.', role: 'hasta', rating: 4 }], en: [{ quote: 'Most comfortable practice ever.', name: 'B.D.', role: 'patient', rating: 5 }, { quote: 'Root canal was very comfortable.', name: 'E.Ç.', role: 'patient', rating: 5 }, { quote: 'Confidence boost after smile design.', name: 'M.Y.', role: 'patient', rating: 4 }], de: [{ quote: 'Angenehmste Praxis seit Jahren.', name: 'B.D.', role: 'Patient*in', rating: 5 }, { quote: 'Wurzelbehandlung sehr angenehm.', name: 'E.Ç.', role: 'Patient*in', rating: 5 }, { quote: 'Selbstvertrauen nach Lächel-Design gestiegen.', name: 'M.Y.', role: 'Patient*in', rating: 4 }] } },
		pricing: { title: { tr: 'Tedavi paketleri', en: 'Treatment packages', de: 'Behandlungspakete' }, intro: { tr: 'Fiyatlar muayene sonrası netleşir.', en: 'Prices finalized after examination.', de: 'Preise nach Untersuchung festgelegt.' }, items: { tr: [{ name: 'Check-up', price: '600 ₺', description: 'Muayene ve röntgen.', features: ['Ağız içi muayene', 'Röntgen', 'Tedavi planı'], highlighted: false }, { name: 'Diş taşı + beyazlatma', price: '2500 ₺', description: 'Profesyonel temizlik.', features: ['Diş taşı temizliği', 'Beyazlatma', 'Kontrol'], highlighted: true }, { name: 'Yıllık bakım', price: '1200 ₺', description: '2 check-up ve koruyucu bakım.', features: ['2 muayene', '1 temizlik', 'Flor'], highlighted: false }], en: [{ name: 'Check-up', price: '600 TL', description: 'Exam and x-ray.', features: ['Oral exam', 'X-ray'], highlighted: false }, { name: 'Scaling + whitening', price: '2500 TL', description: 'Professional cleaning.', features: ['Scaling', 'Whitening'], highlighted: true }, { name: 'Annual care', price: '1200 TL', description: '2 check-ups.', features: ['2 exams', '1 scaling'], highlighted: false }], de: [{ name: 'Check-up', price: '600 TL', description: 'Untersuchung und Röntgen.', features: ['Munduntersuchung'], highlighted: false }, { name: 'Reinigung + Bleaching', price: '2500 TL', description: 'Professionelle Reinigung.', features: ['Zahnreinigung', 'Bleaching'], highlighted: true }, { name: 'Jahrespflege', price: '1200 TL', description: '2 Check-ups.', features: ['2 Untersuchungen'], highlighted: false }] } },
		booking: { title: { tr: 'Randevunuzu planlayın', en: 'Book your appointment', de: 'Termin buchen' }, subtitle: { tr: 'Uygun gün ve saat için formu doldurun.', en: 'Fill out the form.', de: 'Formular ausfüllen.' }, buttonLabel: { tr: 'Randevu al', en: 'Book appointment', de: 'Termin buchen' }, note: { tr: 'Acil durumlar için telefonla ulaşın.', en: 'For emergencies, please call.', de: 'In Notfällen anrufen.' } },
		credentials: { title: { tr: 'Üyelik ve sertifikalar', en: 'Memberships', de: 'Mitgliedschaften' }, intro: { tr: '', en: '', de: '' }, items: { tr: [{ name: 'Diş Hekimi Ruhsatı', issuer: 'TDB', year: '2014' }, { name: 'Estetik Diş Hekimliği Sertifikası', issuer: 'EDAD', year: '2018' }], en: [{ name: 'Dental License', issuer: 'TDA', year: '2014' }, { name: 'Aesthetic Dentistry Cert', issuer: 'EDAC', year: '2018' }], de: [{ name: 'Approbation', issuer: 'TDB', year: '2014' }, { name: 'Zertifikat Ästhetik', issuer: 'EDAC', year: '2018' }] } }
	},
	{
		slug: 'lawyer-trust', basePreset: 'law', label: 'Avukat Güven Odaklı', profession: 'Avukat', category: 'local-service',
		audience: 'Serbest avukat veya küçük hukuk bürosu',
		outcome: 'Çalışma alanlarını ve yetkinlikleri güven veren bir vitrine dönüştürür.',
		siteName: 'Av. Kerem Demir', contactEmail: 'info@keremdemir.example',
		colors: { primary: '#3a3f6b', secondary: '#dfe0ed', accent: '#8a7540', base: '#f8f8fa', neutral: '#1c1e30' },
		hero: { headline: { tr: 'Haklarınızı bilmek ilk adımdır', en: 'Knowing your rights is the first step', de: 'Ihre Rechte zu kennen ist der erste Schritt' }, subheadline: { tr: 'Bireysel ve ticari hukukta şeffaf süreç.', en: 'Transparent process in civil and commercial law.', de: 'Transparenter Prozess im Zivil- und Wirtschaftsrecht.' }, ctaLabel: { tr: 'Ön görüşme talep et', en: 'Request a consultation', de: 'Erstberatung anfragen' } },
		about: { title: { tr: 'Yaklaşım', en: 'Approach', de: 'Ansatz' }, body: { tr: 'İlk görüşmede durumunuzu dinler, hukuki çerçeveyi sade bir dille açıklarız.', en: 'We listen and explain the legal framework in plain language.', de: 'Wir hören zu und erklären den rechtlichen Rahmen in einfacher Sprache.' } },
		services: { title: { tr: 'Çalışma alanları', en: 'Practice areas', de: 'Tätigkeitsbereiche' }, intro: { tr: 'Her dosya bireysel değerlendirilir.', en: 'Each case is individually assessed.', de: 'Jeder Fall wird individuell bewertet.' }, items: { tr: [{ name: 'Aile hukuku', description: 'Boşanma, velayet, nafaka.' }, { name: 'Ticaret hukuku', description: 'Şirket sözleşmeleri, alacak.' }, { name: 'Gayrimenkul hukuku', description: 'Tapu, kira, imar.' }], en: [{ name: 'Family law', description: 'Divorce, custody, alimony.' }, { name: 'Commercial law', description: 'Company contracts, debt.' }, { name: 'Real estate law', description: 'Title deeds, leases.' }], de: [{ name: 'Familienrecht', description: 'Scheidung, Sorgerecht.' }, { name: 'Wirtschaftsrecht', description: 'Gesellschaftsverträge.' }, { name: 'Immobilienrecht', description: 'Grundbuch, Miete.' }] } },
		faq: { title: { tr: 'Sık sorular', en: 'Common questions', de: 'Häufige Fragen' }, items: { tr: [{ question: 'İlk görüşme ücretli mi?', answer: 'Durum değerlendirilir; ücret bilgisi önceden paylaşılır.' }, { question: 'Süreç ne kadar sürer?', answer: 'Dosyaya göre değişir; tahmini zaman çizelgesi verilir.' }], en: [{ question: 'Is the first meeting free?', answer: 'Fee info shared beforehand.' }, { question: 'How long?', answer: 'Varies per case; timeline provided.' }], de: [{ question: 'Erstgespräch kostenlos?', answer: 'Gebühreninfo vorab.' }, { question: 'Wie lange?', answer: 'Fallabhängig; Zeitschätzung.' }] } },
		contact: { title: { tr: 'Ön görüşme talep et', en: 'Request a consultation', de: 'Erstberatung anfragen' }, description: { tr: 'Kısa mesaj bırak; dönüş yapalım.', en: 'Leave a short message.', de: 'Kurze Nachricht.' }, submitLabel: { tr: 'Gönder', en: 'Send', de: 'Senden' } },
		footer: { tr: '© Av. Kerem Demir. Hukuki danışmanlık yerine geçmez.', en: '© Att. Kerem Demir. Not legal advice.', de: '© RA Kerem Demir. Keine Rechtsberatung.' },
		seo: { tr: 'Avukat Kerem Demir için güven odaklı hukuk bürosu sitesi.', en: 'Trust-focused law office site for Attorney Kerem Demir.', de: 'Vertrauensorientierte Kanzlei-Website.' },
		featureKits: ['whatsapp-cta', 'map-location'], promptRecipes: [{ title: 'Çalışma alanlarını güçlendir', useCase: 'İlk taslak', prompt: 'Avukat sitemde çalışma alanlarımı güven veren bir dille anlat. Sonuç garantisi kullanma.' }],
		process: { title: { tr: 'Çalışma süreci', en: 'Work process', de: 'Arbeitsablauf' }, intro: { tr: 'İlk görüşmeden sonuca şeffaf adımlar.', en: 'Transparent steps from consultation to resolution.', de: 'Transparente Schritte vom Erstgespräch zur Lösung.' }, steps: { tr: [{ label: 'Ön görüşme', description: 'Durum değerlendirmesi.' }, { label: 'Strateji', description: 'Dosyaya özel yol haritası.' }, { label: 'Yürütme', description: 'Dava veya sözleşme süreci.' }], en: [{ label: 'Consultation', description: 'Situation assessment.' }, { label: 'Strategy', description: 'Case roadmap.' }, { label: 'Execution', description: 'Litigation or contract process.' }], de: [{ label: 'Erstberatung', description: 'Situationsbewertung.' }, { label: 'Strategie', description: 'Fall-Roadmap.' }, { label: 'Durchführung', description: 'Prozess oder Vertrag.' }] } },
		credentials: { title: { tr: 'Baro ve yetkinlikler', en: 'Bar admission', de: 'Zulassung' }, intro: { tr: '', en: '', de: '' }, items: { tr: [{ name: 'İstanbul Barosu', issuer: 'TBB', year: '2010' }, { name: 'Arabuluculuk Yetki Belgesi', issuer: 'Adalet Bakanlığı', year: '2017' }], en: [{ name: 'Istanbul Bar', issuer: 'UBA', year: '2010' }, { name: 'Mediation License', issuer: 'Ministry of Justice', year: '2017' }], de: [{ name: 'Rechtsanwaltskammer', issuer: 'TBB', year: '2010' }, { name: 'Mediationslizenz', issuer: 'Justizministerium', year: '2017' }] } },
		testimonials: { title: { tr: 'Danışan yorumları', en: 'Client feedback', de: 'Mandantenfeedback' }, intro: { tr: 'İsimler kısaltılmıştır.', en: 'Names shortened.', de: 'Namen gekürzt.' }, items: { tr: [{ quote: 'Süreci adım adım anlatması çok rahatlattı.', name: 'N.Y.', role: 'danışan', rating: 5 }, { quote: 'Hukuki dili sadeleştirerek anlatması karar vermemi kolaylaştırdı.', name: 'F.K.', role: 'danışan', rating: 5 }, { quote: 'Dosyamın takibinde her zaman ulaşılabilirdi.', name: 'S.D.', role: 'danışan', rating: 4 }], en: [{ quote: 'Step-by-step explanation was very reassuring.', name: 'N.Y.', role: 'client', rating: 5 }, { quote: 'Simplifying legal language helped me decide.', name: 'F.K.', role: 'client', rating: 5 }, { quote: 'Always reachable for case updates.', name: 'S.D.', role: 'client', rating: 4 }], de: [{ quote: 'Schrittweise Erklärung war beruhigend.', name: 'N.Y.', role: 'Mandant*in', rating: 5 }, { quote: 'Vereinfachung half bei Entscheidungen.', name: 'F.K.', role: 'Mandant*in', rating: 5 }, { quote: 'Immer erreichbar für Updates.', name: 'S.D.', role: 'Mandant*in', rating: 4 }] } }
	}
];export const professionKits: ControlledKit[] = configs.map((config) => ({ slug: config.slug, label: config.label, profession: config.profession, category: config.category, audience: config.audience, outcome: config.outcome, featureKits: config.featureKits, promptRecipes: config.promptRecipes, createSite: () => createProfessionSite(config)}));
