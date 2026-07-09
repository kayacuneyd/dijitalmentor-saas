import type { Site } from '$lib/schema/site';
import { themePresets } from '$lib/presets';

/** Hand-authored seed: law niche (constitution — develop against seeds before the AI exists). */
export const lawSite: Site = {
	id: 'seed-law',
	tenantId: 'tenant-seed-law',
	defaultLocale: 'tr',
	locales: ['tr', 'en', 'de'],
	theme: themePresets.law,
	nav: {
		items: [
			{ pageSlug: 'home', label: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' } },
			{ pageSlug: 'services', label: { tr: 'Hizmetler', en: 'Services', de: 'Leistungen' } }
		]
	},
	settings: {
		siteName: 'Aksoy Hukuk Bürosu',
		contactEmail: 'info@aksoyhukuk.example',
		poweredByBadge: true,
		seo: {
			description: {
				tr: 'İstanbul merkezli Aksoy Hukuk Bürosu — ticaret, iş ve aile hukukunda güvenilir danışmanlık.',
				en: 'Aksoy Law Office in Istanbul — trusted counsel in commercial, employment and family law.',
				de: 'Kanzlei Aksoy in Istanbul — verlässliche Beratung im Handels-, Arbeits- und Familienrecht.'
			}
		}
	},
	pages: [
		{
			slug: 'home',
			title: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' },
			sections: [
				{
					id: 'hero-1',
					type: 'hero',
					props: {
						variant: 'split',
						background: 'image',
						imageUrl: '/seed/law/hero.svg',
						ctaHref: '#contact'
					},
					content: {
						tr: {
							headline: 'Haklarınız için güçlü bir ses',
							subheadline: 'Yirmi yılı aşkın deneyimle ticaret, iş ve aile hukukunda yanınızdayız.',
							ctaLabel: 'Ücretsiz ön görüşme'
						},
						en: {
							headline: 'A strong voice for your rights',
							subheadline:
								'Over twenty years of experience in commercial, employment and family law.',
							ctaLabel: 'Free initial consultation'
						},
						de: {
							headline: 'Eine starke Stimme für Ihr Recht',
							subheadline: 'Über zwanzig Jahre Erfahrung im Handels-, Arbeits- und Familienrecht.',
							ctaLabel: 'Kostenloses Erstgespräch'
						}
					}
				},
				{
					id: 'about-1',
					type: 'about',
					props: { variant: 'text-image', imageUrl: '/seed/law/office.svg' },
					content: {
						tr: {
							title: 'Büromuz hakkında',
							body: 'Aksoy Hukuk Bürosu, 2003 yılından bu yana İstanbul’da bireylere ve şirketlere hukuki danışmanlık sunmaktadır. Çözüm odaklı yaklaşımımızla her dosyayı titizlikle ele alır, süreci şeffaf biçimde yönetiriz.',
							imageAlt: 'Aksoy Hukuk Bürosu ofisi'
						},
						en: {
							title: 'About our office',
							body: 'Since 2003, Aksoy Law Office has advised individuals and companies in Istanbul. We handle every case with care and manage each matter transparently, always focused on practical solutions.',
							imageAlt: 'Aksoy Law Office premises'
						},
						de: {
							title: 'Über unsere Kanzlei',
							body: 'Seit 2003 berät die Kanzlei Aksoy Privatpersonen und Unternehmen in Istanbul. Wir bearbeiten jeden Fall sorgfältig, führen jedes Mandat transparent und setzen auf praxisnahe Lösungen.',
							imageAlt: 'Räumlichkeiten der Kanzlei Aksoy'
						}
					}
				},
				{
					id: 'team-1',
					type: 'team',
					props: { variant: 'cards' },
					content: {
						tr: {
							title: 'Ekibimiz',
							members: [
								{
									name: 'Av. Elif Aksoy',
									role: 'Kurucu Ortak',
									bio: 'Ticaret hukuku ve şirketler hukuku alanında uzman.',
									photoUrl: '/seed/law/elif.svg'
								},
								{
									name: 'Av. Mert Kaya',
									role: 'Ortak Avukat',
									bio: 'İş hukuku ve arabuluculuk süreçlerinde deneyimli.',
									photoUrl: '/seed/law/mert.svg'
								}
							]
						},
						en: {
							title: 'Our team',
							members: [
								{
									name: 'Elif Aksoy, Attorney',
									role: 'Founding Partner',
									bio: 'Specialist in commercial and corporate law.',
									photoUrl: '/seed/law/elif.svg'
								},
								{
									name: 'Mert Kaya, Attorney',
									role: 'Partner',
									bio: 'Experienced in employment law and mediation.',
									photoUrl: '/seed/law/mert.svg'
								}
							]
						},
						de: {
							title: 'Unser Team',
							members: [
								{
									name: 'RAin Elif Aksoy',
									role: 'Gründungspartnerin',
									bio: 'Spezialistin für Handels- und Gesellschaftsrecht.',
									photoUrl: '/seed/law/elif.svg'
								},
								{
									name: 'RA Mert Kaya',
									role: 'Partner',
									bio: 'Erfahren im Arbeitsrecht und in Mediationsverfahren.',
									photoUrl: '/seed/law/mert.svg'
								}
							]
						}
					}
				},
				{
					id: 'faq-1',
					type: 'faq',
					props: { variant: 'accordion' },
					content: {
						tr: {
							title: 'Sık sorulan sorular',
							items: [
								{
									question: 'İlk görüşme ücretli mi?',
									answer: 'Hayır, 30 dakikalık ön görüşmemiz ücretsizdir.'
								},
								{
									question: 'Dava süreci ne kadar sürer?',
									answer:
										'Dosyanın niteliğine göre değişir; ilk görüşmede gerçekçi bir takvim sunarız.'
								}
							]
						},
						en: {
							title: 'Frequently asked questions',
							items: [
								{
									question: 'Is the first consultation free?',
									answer: 'Yes, our 30-minute initial consultation is free of charge.'
								},
								{
									question: 'How long does a case take?',
									answer:
										'It depends on the matter; we give you a realistic timeline in the first meeting.'
								}
							]
						},
						de: {
							title: 'Häufige Fragen',
							items: [
								{
									question: 'Ist das Erstgespräch kostenlos?',
									answer: 'Ja, unser 30-minütiges Erstgespräch ist kostenfrei.'
								},
								{
									question: 'Wie lange dauert ein Verfahren?',
									answer:
										'Das hängt vom Fall ab; im Erstgespräch nennen wir Ihnen einen realistischen Zeitrahmen.'
								}
							]
						}
					}
				},
				{
					id: 'contact-1',
					type: 'contact',
					props: {
						variant: 'split',
						email: 'info@aksoyhukuk.example',
						phone: '+90 212 555 01 23',
						address: 'Levent Mah. Adalet Cad. No: 12, Beşiktaş / İstanbul'
					},
					content: {
						tr: {
							title: 'Bize ulaşın',
							description:
								'Sorularınız için formu doldurun, en geç bir iş günü içinde dönüş yapalım.',
							submitLabel: 'Gönder'
						},
						en: {
							title: 'Contact us',
							description: 'Fill in the form and we will get back to you within one business day.',
							submitLabel: 'Send'
						},
						de: {
							title: 'Kontakt',
							description: 'Füllen Sie das Formular aus – wir melden uns innerhalb eines Werktags.',
							submitLabel: 'Senden'
						}
					}
				},
				{
					id: 'footer-1',
					type: 'footer',
					props: { variant: 'simple' },
					content: {
						tr: { text: '© 2026 Aksoy Hukuk Bürosu. Tüm hakları saklıdır.' },
						en: { text: '© 2026 Aksoy Law Office. All rights reserved.' },
						de: { text: '© 2026 Kanzlei Aksoy. Alle Rechte vorbehalten.' }
					}
				}
			]
		},
		{
			slug: 'services',
			title: { tr: 'Hizmetler', en: 'Services', de: 'Leistungen' },
			sections: [
				{
					id: 'services-1',
					type: 'services',
					props: { variant: 'grid', columns: 3 },
					content: {
						tr: {
							title: 'Çalışma alanlarımız',
							intro: 'Bireysel ve kurumsal müvekkillerimize aşağıdaki alanlarda hizmet veriyoruz.',
							items: [
								{
									name: 'Ticaret Hukuku',
									description: 'Sözleşmeler, şirket kuruluşu ve ortaklık uyuşmazlıkları.'
								},
								{
									name: 'İş Hukuku',
									description: 'İşe iade, kıdem-ihbar tazminatı ve işveren danışmanlığı.'
								},
								{ name: 'Aile Hukuku', description: 'Boşanma, velayet ve mal paylaşımı süreçleri.' }
							]
						},
						en: {
							title: 'Practice areas',
							intro: 'We advise individual and corporate clients in the following areas.',
							items: [
								{
									name: 'Commercial Law',
									description: 'Contracts, company formation and shareholder disputes.'
								},
								{
									name: 'Employment Law',
									description: 'Reinstatement claims, severance disputes and employer advisory.'
								},
								{ name: 'Family Law', description: 'Divorce, custody and division of assets.' }
							]
						},
						de: {
							title: 'Tätigkeitsbereiche',
							intro: 'Wir beraten Privat- und Unternehmensmandanten in folgenden Bereichen.',
							items: [
								{
									name: 'Handelsrecht',
									description: 'Verträge, Unternehmensgründung und Gesellschafterstreitigkeiten.'
								},
								{
									name: 'Arbeitsrecht',
									description: 'Kündigungsschutz, Abfindungen und Arbeitgeberberatung.'
								},
								{
									name: 'Familienrecht',
									description: 'Scheidung, Sorgerecht und Vermögensaufteilung.'
								}
							]
						}
					}
				},
				{
					id: 'cta-1',
					type: 'cta',
					props: { variant: 'banner', href: '/#contact' },
					content: {
						tr: {
							title: 'Dosyanızı birlikte değerlendirelim',
							subtitle: 'İlk görüşme ücretsizdir.',
							buttonLabel: 'Randevu alın'
						},
						en: {
							title: 'Let us review your case together',
							subtitle: 'The first consultation is free.',
							buttonLabel: 'Book an appointment'
						},
						de: {
							title: 'Lassen Sie uns Ihren Fall gemeinsam prüfen',
							subtitle: 'Das Erstgespräch ist kostenlos.',
							buttonLabel: 'Termin vereinbaren'
						}
					}
				},
				{
					id: 'footer-2',
					type: 'footer',
					props: { variant: 'simple' },
					content: {
						tr: { text: '© 2026 Aksoy Hukuk Bürosu. Tüm hakları saklıdır.' },
						en: { text: '© 2026 Aksoy Law Office. All rights reserved.' },
						de: { text: '© 2026 Kanzlei Aksoy. Alle Rechte vorbehalten.' }
					}
				}
			]
		}
	]
};
