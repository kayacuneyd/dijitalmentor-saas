import type { Site } from '$lib/schema/site';
import { themePresets } from '$lib/presets';

/** Hand-authored seed: dental practice niche. */
export const dentalSite: Site = {
	id: 'seed-dental',
	tenantId: 'tenant-seed-dental',
	defaultLocale: 'de',
	locales: ['tr', 'en', 'de'],
	theme: themePresets.dental,
	nav: {
		items: [{ pageSlug: 'home', label: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' } }]
	},
	settings: {
		siteName: 'Praxis Dr. Yılmaz',
		contactEmail: 'termin@praxis-yilmaz.example',
		poweredByBadge: true,
		seo: {
			description: {
				tr: 'Dr. Yılmaz Diş Kliniği — Berlin’de modern, ağrısız ve güler yüzlü diş hekimliği.',
				en: 'Dr. Yılmaz Dental Practice — modern, gentle and friendly dentistry in Berlin.',
				de: 'Zahnarztpraxis Dr. Yılmaz — moderne, sanfte und freundliche Zahnmedizin in Berlin.'
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
						imageUrl: '/seed/dental/hero.svg',
						ctaHref: '#contact'
					},
					content: {
						tr: {
							headline: 'Sağlıklı bir gülüş, güvenle başlar',
							subheadline:
								'Modern teknoloji ve ağrısız tedavi yaklaşımıyla tüm aile için diş hekimliği.',
							ctaLabel: 'Online randevu'
						},
						en: {
							headline: 'A healthy smile starts with trust',
							subheadline:
								'Dentistry for the whole family, with modern technology and gentle treatment.',
							ctaLabel: 'Book online'
						},
						de: {
							headline: 'Ein gesundes Lächeln beginnt mit Vertrauen',
							subheadline:
								'Zahnmedizin für die ganze Familie – mit moderner Technik und sanfter Behandlung.',
							ctaLabel: 'Online Termin buchen'
						}
					}
				},
				{
					id: 'about-1',
					type: 'about',
					props: { variant: 'text-image', imageUrl: '/seed/dental/praxis.svg' },
					content: {
						tr: {
							title: 'Kliniğimiz',
							body: 'Praxis Dr. Yılmaz, Berlin Kreuzberg’de 2015’ten beri hizmet vermektedir. Dijital röntgen, lazer destekli tedavi ve titiz sterilizasyon standartlarıyla; korkusuz, konforlu bir tedavi deneyimi sunuyoruz. Türkçe, Almanca ve İngilizce hizmet verilir.',
							imageAlt: 'Dr. Yılmaz kliniğinin tedavi odası'
						},
						en: {
							title: 'Our practice',
							body: 'Praxis Dr. Yılmaz has served Berlin-Kreuzberg since 2015. With digital X-rays, laser-assisted treatment and rigorous sterilisation standards, we make every visit comfortable and stress-free. We speak Turkish, German and English.',
							imageAlt: 'Treatment room at Dr. Yılmaz’s practice'
						},
						de: {
							title: 'Unsere Praxis',
							body: 'Die Praxis Dr. Yılmaz ist seit 2015 in Berlin-Kreuzberg für Sie da. Mit digitalem Röntgen, lasergestützter Behandlung und strengen Hygienestandards machen wir jeden Besuch angenehm und stressfrei. Wir sprechen Türkisch, Deutsch und Englisch.',
							imageAlt: 'Behandlungszimmer der Praxis Dr. Yılmaz'
						}
					}
				},
				{
					id: 'services-1',
					type: 'services',
					props: { variant: 'grid', columns: 3 },
					content: {
						tr: {
							title: 'Tedavilerimiz',
							items: [
								{
									name: 'Koruyucu Diş Hekimliği',
									description: 'Düzenli kontrol, diş taşı temizliği ve florür uygulaması.'
								},
								{
									name: 'İmplant',
									description: 'Eksik dişler için kalıcı, doğal görünümlü çözümler.'
								},
								{
									name: 'Estetik Diş Hekimliği',
									description: 'Beyazlatma, laminate veneer ve gülüş tasarımı.'
								},
								{
									name: 'Çocuk Diş Hekimliği',
									description: 'Çocuklar için sabırlı ve oyunlaştırılmış tedavi yaklaşımı.'
								}
							]
						},
						en: {
							title: 'Our treatments',
							items: [
								{
									name: 'Preventive Dentistry',
									description: 'Regular check-ups, professional cleaning and fluoride care.'
								},
								{
									name: 'Implants',
									description: 'Permanent, natural-looking solutions for missing teeth.'
								},
								{
									name: 'Cosmetic Dentistry',
									description: 'Whitening, laminate veneers and smile design.'
								},
								{
									name: 'Pediatric Dentistry',
									description: 'Patient, playful treatment tailored to children.'
								}
							]
						},
						de: {
							title: 'Unsere Behandlungen',
							items: [
								{
									name: 'Prophylaxe',
									description:
										'Regelmäßige Kontrolle, professionelle Zahnreinigung und Fluoridierung.'
								},
								{
									name: 'Implantate',
									description: 'Dauerhafte, natürlich wirkende Lösungen bei fehlenden Zähnen.'
								},
								{
									name: 'Ästhetische Zahnmedizin',
									description: 'Bleaching, Veneers und Smile-Design.'
								},
								{
									name: 'Kinderzahnheilkunde',
									description: 'Geduldige, spielerische Behandlung speziell für Kinder.'
								}
							]
						}
					}
				},
				{
					id: 'gallery-1',
					type: 'gallery',
					props: { variant: 'grid' },
					content: {
						tr: {
							title: 'Klinikten kareler',
							images: [
								{ url: '/seed/dental/g1.svg', alt: 'Bekleme salonu' },
								{ url: '/seed/dental/g2.svg', alt: 'Modern tedavi ünitesi' },
								{ url: '/seed/dental/g3.svg', alt: 'Sterilizasyon odası' }
							]
						},
						en: {
							title: 'Inside the practice',
							images: [
								{ url: '/seed/dental/g1.svg', alt: 'Waiting area' },
								{ url: '/seed/dental/g2.svg', alt: 'Modern treatment unit' },
								{ url: '/seed/dental/g3.svg', alt: 'Sterilisation room' }
							]
						},
						de: {
							title: 'Einblicke in die Praxis',
							images: [
								{ url: '/seed/dental/g1.svg', alt: 'Wartebereich' },
								{ url: '/seed/dental/g2.svg', alt: 'Moderne Behandlungseinheit' },
								{ url: '/seed/dental/g3.svg', alt: 'Sterilisationsraum' }
							]
						}
					}
				},
				{
					id: 'cta-1',
					type: 'cta',
					props: { variant: 'boxed', href: '#contact' },
					content: {
						tr: {
							title: 'Diş ağrısını ertelemeyin',
							subtitle: 'Akut ağrılarda aynı gün randevu veriyoruz.',
							buttonLabel: 'Hemen ara'
						},
						en: {
							title: 'Don’t postpone tooth pain',
							subtitle: 'Same-day appointments for acute pain.',
							buttonLabel: 'Call now'
						},
						de: {
							title: 'Zahnschmerzen nicht aufschieben',
							subtitle: 'Bei akuten Schmerzen gibt es Termine noch am selben Tag.',
							buttonLabel: 'Jetzt anrufen'
						}
					}
				},
				{
					id: 'contact-1',
					type: 'contact',
					props: {
						variant: 'split',
						email: 'termin@praxis-yilmaz.example',
						phone: '+49 30 555 07 89',
						address: 'Oranienstraße 45, 10969 Berlin'
					},
					content: {
						tr: {
							title: 'Randevu alın',
							description: 'Formu doldurun, ekibimiz sizi arayarak randevunuzu netleştirsin.',
							submitLabel: 'Randevu iste'
						},
						en: {
							title: 'Book an appointment',
							description:
								'Fill in the form and our team will call you to confirm your appointment.',
							submitLabel: 'Request appointment'
						},
						de: {
							title: 'Termin vereinbaren',
							description: 'Füllen Sie das Formular aus – unser Team ruft Sie zur Bestätigung an.',
							submitLabel: 'Termin anfragen'
						}
					}
				},
				{
					id: 'footer-1',
					type: 'footer',
					props: { variant: 'columns' },
					content: {
						tr: {
							text: '© 2026 Praxis Dr. Yılmaz.',
							links: [
								{ label: 'Gizlilik', href: '/privacy' },
								{ label: 'Künye', href: '/imprint' }
							]
						},
						en: {
							text: '© 2026 Praxis Dr. Yılmaz.',
							links: [
								{ label: 'Privacy', href: '/privacy' },
								{ label: 'Imprint', href: '/imprint' }
							]
						},
						de: {
							text: '© 2026 Praxis Dr. Yılmaz.',
							links: [
								{ label: 'Datenschutz', href: '/privacy' },
								{ label: 'Impressum', href: '/imprint' }
							]
						}
					}
				}
			]
		}
	]
};
