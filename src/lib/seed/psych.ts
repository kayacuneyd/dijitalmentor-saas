import type { Site } from '$lib/schema/site';
import { themePresets } from '$lib/presets';

/** Hand-authored seed: psychologist niche. */
export const psychSite: Site = {
	id: 'seed-psych',
	tenantId: 'tenant-seed-psych',
	defaultLocale: 'tr',
	locales: ['tr', 'en', 'de'],
	theme: themePresets.psych,
	nav: {
		items: [{ pageSlug: 'home', label: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' } }]
	},
	settings: {
		siteName: 'Psk. Deniz Arslan',
		contactEmail: 'randevu@denizarslan.example',
		poweredByBadge: true,
		seo: {
			description: {
				tr: 'Klinik Psikolog Deniz Arslan — İzmir’de yüz yüze ve online bireysel terapi.',
				en: 'Clinical psychologist Deniz Arslan — in-person and online individual therapy in Izmir.',
				de: 'Klinische Psychologin Deniz Arslan — Einzeltherapie in Izmir, vor Ort und online.'
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
					props: { variant: 'centered', background: 'gradient', ctaHref: '#contact' },
					content: {
						tr: {
							headline: 'Kendinize iyi bakmanın ilk adımı',
							subheadline:
								'Güvenli ve yargısız bir alanda, size uygun tempoda ilerleyen bireysel terapi.',
							ctaLabel: 'Randevu talep et'
						},
						en: {
							headline: 'The first step to caring for yourself',
							subheadline:
								'Individual therapy at your own pace, in a safe and non-judgmental space.',
							ctaLabel: 'Request an appointment'
						},
						de: {
							headline: 'Der erste Schritt zu mehr Selbstfürsorge',
							subheadline: 'Einzeltherapie in Ihrem Tempo, in einem sicheren und wertfreien Raum.',
							ctaLabel: 'Termin anfragen'
						}
					}
				},
				{
					id: 'about-1',
					type: 'about',
					props: { variant: 'text-image', imageUrl: '/seed/psych/portrait.svg' },
					content: {
						tr: {
							title: 'Merhaba, ben Deniz',
							body: 'Klinik psikoloji yüksek lisansımı tamamladıktan sonra on yıldır yetişkinlerle çalışıyorum. Kaygı, tükenmişlik ve ilişki zorlukları alanlarında bilişsel davranışçı terapi ve şema terapi yaklaşımlarını kullanıyorum. Seanslar yüz yüze veya online yapılabilir.',
							imageAlt: 'Psikolog Deniz Arslan portresi'
						},
						en: {
							title: 'Hello, I am Deniz',
							body: 'Since completing my master’s in clinical psychology, I have worked with adults for ten years. I use cognitive behavioural therapy and schema therapy for anxiety, burnout and relationship difficulties. Sessions are available in person or online.',
							imageAlt: 'Portrait of psychologist Deniz Arslan'
						},
						de: {
							title: 'Hallo, ich bin Deniz',
							body: 'Nach meinem Masterabschluss in klinischer Psychologie arbeite ich seit zehn Jahren mit Erwachsenen. Bei Angst, Erschöpfung und Beziehungsproblemen arbeite ich mit kognitiver Verhaltenstherapie und Schematherapie. Sitzungen sind vor Ort oder online möglich.',
							imageAlt: 'Porträt der Psychologin Deniz Arslan'
						}
					}
				},
				{
					id: 'services-1',
					type: 'services',
					props: { variant: 'grid', columns: 3 },
					content: {
						tr: {
							title: 'Çalışma alanları',
							items: [
								{
									name: 'Kaygı ve Stres',
									description: 'Yaygın kaygı, panik ve sınav kaygısıyla çalışma.',
									price: 'Seans 60 dk'
								},
								{
									name: 'Tükenmişlik',
									description: 'İş yaşamı kaynaklı tükenmişlik ve sınır koyma becerileri.',
									price: 'Seans 60 dk'
								},
								{
									name: 'İlişki Zorlukları',
									description: 'Bağlanma, iletişim ve ayrılık süreçleri.',
									price: 'Seans 60 dk'
								}
							]
						},
						en: {
							title: 'Areas of work',
							items: [
								{
									name: 'Anxiety & Stress',
									description: 'Working with generalized anxiety, panic and exam stress.',
									price: '60-min session'
								},
								{
									name: 'Burnout',
									description: 'Work-related exhaustion and boundary-setting skills.',
									price: '60-min session'
								},
								{
									name: 'Relationship Issues',
									description: 'Attachment, communication and separation processes.',
									price: '60-min session'
								}
							]
						},
						de: {
							title: 'Arbeitsschwerpunkte',
							items: [
								{
									name: 'Angst & Stress',
									description: 'Arbeit mit generalisierter Angst, Panik und Prüfungsstress.',
									price: '60-Min.-Sitzung'
								},
								{
									name: 'Burnout',
									description: 'Berufliche Erschöpfung und das Setzen gesunder Grenzen.',
									price: '60-Min.-Sitzung'
								},
								{
									name: 'Beziehungsthemen',
									description: 'Bindung, Kommunikation und Trennungsprozesse.',
									price: '60-Min.-Sitzung'
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
							title: 'Merak edilenler',
							items: [
								{
									question: 'Online seans nasıl yapılıyor?',
									answer: 'Görüntülü görüşme bağlantısı seans öncesinde e-posta ile gönderilir.'
								},
								{
									question: 'Görüşmeler gizli mi?',
									answer:
										'Evet, tüm görüşmeler meslek etiği ve gizlilik ilkeleri çerçevesinde yürütülür.'
								},
								{
									question: 'Seans sıklığı nedir?',
									answer: 'Genellikle haftada bir seansla başlar, ihtiyaca göre birlikte ayarlarız.'
								}
							]
						},
						en: {
							title: 'Common questions',
							items: [
								{
									question: 'How do online sessions work?',
									answer: 'A video call link is emailed to you before the session.'
								},
								{
									question: 'Are sessions confidential?',
									answer:
										'Yes, all sessions follow professional ethics and confidentiality principles.'
								},
								{
									question: 'How often are sessions?',
									answer: 'Usually weekly to start; we adjust the frequency together as needed.'
								}
							]
						},
						de: {
							title: 'Häufige Fragen',
							items: [
								{
									question: 'Wie laufen Online-Sitzungen ab?',
									answer: 'Sie erhalten vor der Sitzung einen Videolink per E-Mail.'
								},
								{
									question: 'Sind die Gespräche vertraulich?',
									answer:
										'Ja, alle Gespräche unterliegen der Schweigepflicht und den Berufsethikrichtlinien.'
								},
								{
									question: 'Wie oft finden Sitzungen statt?',
									answer:
										'In der Regel wöchentlich zu Beginn; die Frequenz passen wir gemeinsam an.'
								}
							]
						}
					}
				},
				{
					id: 'contact-1',
					type: 'contact',
					props: {
						variant: 'form',
						email: 'randevu@denizarslan.example',
						phone: '+90 232 555 04 56',
						address: 'Alsancak Mah. Şifa Sok. No: 8, Konak / İzmir'
					},
					content: {
						tr: {
							title: 'Randevu ve sorular',
							description: 'Formu doldurun, uygun saatler için birlikte planlayalım.',
							submitLabel: 'Gönder'
						},
						en: {
							title: 'Appointments & questions',
							description: 'Fill in the form and we will plan a suitable time together.',
							submitLabel: 'Send'
						},
						de: {
							title: 'Termine & Fragen',
							description:
								'Füllen Sie das Formular aus – wir finden gemeinsam einen passenden Termin.',
							submitLabel: 'Senden'
						}
					}
				},
				{
					id: 'footer-1',
					type: 'footer',
					props: { variant: 'simple' },
					content: {
						tr: { text: '© 2026 Psk. Deniz Arslan. Bu site profesyonel destek yerine geçmez.' },
						en: {
							text: '© 2026 Deniz Arslan, Psychologist. This site is not a substitute for professional help.'
						},
						de: {
							text: '© 2026 Psychologin Deniz Arslan. Diese Website ersetzt keine professionelle Hilfe.'
						}
					}
				}
			]
		}
	]
};
