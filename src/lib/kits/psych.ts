import type { Site } from '$lib/schema/site';
import { themePresets } from '$lib/presets';

export type PsychKitSlug =
	| 'calm-intake'
	| 'modern-clinic'
	| 'online-therapy'
	| 'child-family'
	| 'couples-therapy'
	| 'trauma-informed';

export type PsychKit = {
	slug: PsychKitSlug;
	label: string;
	audience: string;
	outcome: string;
	createSite: () => Site;
};

export const psychProfessionalKits: PsychKit[] = [
	{
		slug: 'calm-intake',
		label: 'Sakin İlk Görüşme',
		audience: 'Muayenehane psikoloğu / bireysel terapi',
		outcome: 'Güven, gizlilik, çalışma alanları ve randevu yolunu tek sayfada netleştirir.',
		createSite: createCalmIntakePsychSite
	},
	{
		slug: 'modern-clinic',
		label: 'Modern Klinik',
		audience: 'Klinik psikolog / çok hizmetli psikolojik danışmanlık pratiği',
		outcome: 'Uzmanlık alanları, süreç ve iletişim yolunu kurumsal ama erişilebilir biçimde sunar.',
		createSite: createModernClinicPsychSite
	},
	{
		slug: 'online-therapy',
		label: 'Online Terapi',
		audience: 'Online seans ağırlıklı çalışan psikolog / terapist',
		outcome: 'Online seans güvenini, hazırlık adımlarını ve randevu akışını sadeleştirir.',
		createSite: createOnlineTherapyPsychSite
	},
	{
		slug: 'child-family',
		label: 'Çocuk ve Aile',
		audience: 'Çocuk, ergen ve ebeveyn danışmanlığı çalışan psikolog',
		outcome: 'Ebeveyn güvenini, süreç sınırlarını ve randevu adımlarını açıklar.',
		createSite: createChildFamilyPsychSite
	},
	{
		slug: 'couples-therapy',
		label: 'Çift Terapisi',
		audience: 'Çift ve ilişki odaklı çalışan psikolog / terapist',
		outcome: 'Tarafsızlık, iletişim odağı ve ilk görüşme çerçevesini netleştirir.',
		createSite: createCouplesTherapyPsychSite
	},
	{
		slug: 'trauma-informed',
		label: 'Travma Duyarlı',
		audience: 'Travma duyarlı bireysel çalışma yapan psikolog / terapist',
		outcome: 'Güvenli tempo, sınırlar ve kaynak odaklı çalışma dilini öne çıkarır.',
		createSite: createTraumaInformedPsychSite
	}
];

export function psychKitBySlug(slug: unknown): PsychKit | undefined {
	return psychProfessionalKits.find((kit) => kit.slug === slug);
}

export function createCalmIntakePsychSite(): Site {
	return {
		id: 'kit-psych-calm-intake',
		tenantId: 'tenant-kit-psych-calm-intake',
		defaultLocale: 'tr',
		locales: ['tr', 'en', 'de'],
		theme: {
			...themePresets.psych,
			colors: {
				primary: '#2f6f6a',
				secondary: '#d8e8df',
				accent: '#c97f73',
				base: '#fbf7f1',
				neutral: '#233633'
			},
			radius: 'lg'
		},
		nav: {
			items: [{ pageSlug: 'home', label: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' } }]
		},
		settings: {
			siteName: 'Psk. Ada Yılmaz',
			contactEmail: 'randevu@adayilmaz.example',
			poweredByBadge: true,
			seo: {
				description: {
					tr: 'Psk. Ada Yılmaz — Kadıköy’de yetişkinler için yüz yüze ve online terapi randevuları.',
					en: 'Psychologist Ada Yılmaz — in-person and online therapy appointments for adults in Kadıköy.',
					de: 'Psychologin Ada Yılmaz — Vor-Ort- und Online-Termine für Erwachsene in Kadıköy.'
				}
			}
		},
		pages: [
			{
				slug: 'home',
				title: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' },
				sections: [
					{
						id: 'hero-calm-intake',
						type: 'hero',
						props: { variant: 'centered', background: 'gradient', ctaHref: '#contact' },
						content: {
							tr: {
								headline: 'Sakin ve güvenli bir görüşme alanı',
								subheadline:
									'Yetişkinlerle kaygı, stres ve ilişki zorlukları üzerine, gizlilik ve meslek etiği çerçevesinde çalışıyorum.',
								ctaLabel: 'Randevu talep et'
							},
							en: {
								headline: 'A calm and safe space to talk',
								subheadline:
									'I work with adults on anxiety, stress and relationship difficulties within confidentiality and professional ethics.',
								ctaLabel: 'Request an appointment'
							},
							de: {
								headline: 'Ein ruhiger und sicherer Gesprächsraum',
								subheadline:
									'Ich arbeite mit Erwachsenen zu Angst, Stress und Beziehungsthemen im Rahmen von Vertraulichkeit und Berufsethik.',
								ctaLabel: 'Termin anfragen'
							}
						}
					},
					{
						id: 'about-calm-intake',
						type: 'about',
						props: { variant: 'text' },
						content: {
							tr: {
								title: 'Yaklaşımım',
								body: 'İlk görüşmede ihtiyacınızı, beklentinizi ve uygun çalışma ritmini birlikte netleştiririz. Süreç boyunca anlaşılır hedefler, güvenli sınırlar ve düzenli değerlendirme önemlidir.'
							},
							en: {
								title: 'My approach',
								body: 'In the first meeting, we clarify your needs, expectations and suitable working rhythm together. Clear goals, safe boundaries and regular review are central to the process.'
							},
							de: {
								title: 'Mein Ansatz',
								body: 'Im Erstgespräch klären wir gemeinsam Ihr Anliegen, Ihre Erwartungen und einen passenden Arbeitsrhythmus. Klare Ziele, sichere Grenzen und regelmäßige Reflexion sind zentral.'
							}
						}
					},
					{
						id: 'services-calm-intake',
						type: 'services',
						props: { variant: 'grid', columns: 3 },
						content: {
							tr: {
								title: 'Çalışma alanları',
								intro:
									'Her başlık kişiye özel değerlendirilir; süreç ilk görüşmede birlikte planlanır.',
								items: [
									{
										name: 'Kaygı ve stres',
										description:
											'Günlük yaşamı zorlaştıran kaygı, yoğun stres ve baş etme becerileri.',
										price: '50 dk görüşme'
									},
									{
										name: 'İlişki zorlukları',
										description:
											'İletişim, sınır koyma ve tekrar eden ilişki örüntülerini anlamlandırma.',
										price: '50 dk görüşme'
									},
									{
										name: 'Tükenmişlik',
										description:
											'İş ve özel yaşam dengesini yeniden değerlendirme ve sürdürülebilir sınırlar.',
										price: '50 dk görüşme'
									}
								]
							},
							en: {
								title: 'Areas of work',
								intro:
									'Each topic is assessed individually; the process is planned together in the first meeting.',
								items: [
									{
										name: 'Anxiety and stress',
										description:
											'Anxiety, intense stress and coping skills that affect daily life.',
										price: '50-min meeting'
									},
									{
										name: 'Relationship difficulties',
										description: 'Communication, boundaries and recurring relationship patterns.',
										price: '50-min meeting'
									},
									{
										name: 'Burnout',
										description: 'Reviewing work-life balance and building sustainable boundaries.',
										price: '50-min meeting'
									}
								]
							},
							de: {
								title: 'Arbeitsschwerpunkte',
								intro:
									'Jedes Anliegen wird individuell betrachtet; der Prozess wird im Erstgespräch gemeinsam geplant.',
								items: [
									{
										name: 'Angst und Stress',
										description: 'Angst, starker Stress und Bewältigungsstrategien im Alltag.',
										price: '50-Min.-Gespräch'
									},
									{
										name: 'Beziehungsthemen',
										description:
											'Kommunikation, Grenzen und wiederkehrende Beziehungsmuster verstehen.',
										price: '50-Min.-Gespräch'
									},
									{
										name: 'Erschöpfung',
										description:
											'Work-Life-Balance reflektieren und tragfähige Grenzen entwickeln.',
										price: '50-Min.-Gespräch'
									}
								]
							}
						}
					},
					{
						id: 'testimonials-calm-intake',
						type: 'testimonials',
						props: { variant: 'grid' },
						content: {
							tr: {
								title: 'Danışan yorumları',
								intro: 'İsimler gizlilik nedeniyle kısaltılmıştır.',
								items: [
									{
										quote:
											'Kendimi rahatça ifade edebildiğim bir ortamdı. İlk seanstan itibaren güven hissettim.',
										name: 'A.K.',
										role: 'danışan',
										rating: 5
									},
									{
										quote:
											'Adım adım ilerlediğimizi hissetmek iyi geldi. Acele ettirilmeden, kendi tempomda çalıştık.',
										name: 'E.D.',
										role: 'danışan',
										rating: 5
									},
									{
										quote:
											'Sorularım net ve dürüst biçimde yanıtlandı. Beklentilerimi daha iyi anlamama yardımcı oldu.',
										name: 'M.T.',
										role: 'danışan',
										rating: 4
									}
								]
							},
							en: {
								title: 'Client feedback',
								intro: 'Names are shortened for confidentiality.',
								items: [
									{
										quote:
											'A space where I felt safe to express myself. I felt trust from the first session.',
										name: 'A.K.',
										role: 'client',
										rating: 5
									},
									{
										quote:
											'I appreciated the step-by-step approach. We worked at my own pace, without pressure.',
										name: 'E.D.',
										role: 'client',
										rating: 5
									},
									{
										quote:
											'My questions were answered clearly and honestly. It helped me better understand my expectations.',
										name: 'M.T.',
										role: 'client',
										rating: 4
									}
								]
							},
							de: {
								title: 'Rückmeldungen',
								intro: 'Namen sind aus Vertraulichkeitsgründen gekürzt.',
								items: [
									{
										quote:
											'Ein Raum, in dem ich mich sicher ausdrücken konnte. Vom ersten Termin an spürte ich Vertrauen.',
										name: 'A.K.',
										role: 'Klient*in',
										rating: 5
									},
									{
										quote:
											'Die schrittweise Vorgehensweise tat gut. Wir arbeiteten in meinem eigenen Tempo, ohne Druck.',
										name: 'E.D.',
										role: 'Klient*in',
										rating: 5
									},
									{
										quote:
											'Meine Fragen wurden klar und ehrlich beantwortet. Es half mir, meine Erwartungen besser zu verstehen.',
										name: 'M.T.',
										role: 'Klient*in',
										rating: 4
									}
								]
							}
						}
					},
					{
						id: 'faq-calm-intake',
						type: 'faq',
						props: { variant: 'accordion' },
						content: {
							tr: {
								title: 'Sık sorulan sorular',
								items: [
									{
										question: 'İlk görüşmede ne olur?',
										answer:
											'Kısaca ihtiyacınızı konuşur, çalışma biçimi ve randevu sıklığı için birlikte bir çerçeve belirleriz.'
									},
									{
										question: 'Görüşmeler gizli midir?',
										answer:
											'Evet. Görüşmeler gizlilik, meslek etiği ve yürürlükteki yasal çerçeveye uygun yürütülür.'
									},
									{
										question: 'Online görüşme mümkün mü?',
										answer:
											'Evet. Uygun olduğunda online görüşme bağlantısı randevu öncesinde e-posta ile paylaşılır.'
									}
								]
							},
							en: {
								title: 'Common questions',
								items: [
									{
										question: 'What happens in the first meeting?',
										answer:
											'We briefly discuss your needs and define a working frame and appointment rhythm together.'
									},
									{
										question: 'Are meetings confidential?',
										answer:
											'Yes. Meetings follow confidentiality, professional ethics and the applicable legal framework.'
									},
									{
										question: 'Is online work possible?',
										answer:
											'Yes. When suitable, an online meeting link is shared by email before the appointment.'
									}
								]
							},
							de: {
								title: 'Häufige Fragen',
								items: [
									{
										question: 'Was passiert im Erstgespräch?',
										answer:
											'Wir besprechen kurz Ihr Anliegen und legen gemeinsam Rahmen und Terminrhythmus fest.'
									},
									{
										question: 'Sind die Gespräche vertraulich?',
										answer:
											'Ja. Gespräche erfolgen im Rahmen von Vertraulichkeit, Berufsethik und geltendem Recht.'
									},
									{
										question: 'Sind Online-Gespräche möglich?',
										answer:
											'Ja. Wenn passend, wird vor dem Termin ein Online-Link per E-Mail geteilt.'
									}
								]
							}
						}
					},
					{
						id: 'cta-calm-intake',
						type: 'cta',
						props: { variant: 'boxed', href: '#contact' },
						content: {
							tr: {
								title: 'İlk adımı küçük tutalım',
								subtitle:
									'Kısa bir randevu talebi gönder; uygun zaman ve çalışma biçimini birlikte netleştirelim.',
								buttonLabel: 'Randevu talep et'
							},
							en: {
								title: 'Keep the first step simple',
								subtitle:
									'Send a short appointment request and we will clarify timing and format together.',
								buttonLabel: 'Request an appointment'
							},
							de: {
								title: 'Der erste Schritt kann klein sein',
								subtitle:
									'Senden Sie eine kurze Terminanfrage; Zeit und Format klären wir gemeinsam.',
								buttonLabel: 'Termin anfragen'
							}
						}
					},
					{
						id: 'booking-calm-intake',
						type: 'booking',
						props: { variant: 'inline', href: '#contact-calm-intake' },
						content: {
							tr: {
								title: 'İlk görüşme için adım atın',
								subtitle: 'Size uygun gün ve saat için aşağıdaki formdan ulaşabilirsiniz.',
								buttonLabel: 'Randevu talep et',
								note: 'Her mesaj gizlilik çerçevesinde değerlendirilir.'
							},
							en: {
								title: 'Take the first step',
								subtitle: 'Reach out via the form below for a suitable appointment time.',
								buttonLabel: 'Request an appointment',
								note: 'Every message is handled confidentially.'
							},
							de: {
								title: 'Machen Sie den ersten Schritt',
								subtitle: 'Kontaktieren Sie uns über das Formular für einen passenden Termin.',
								buttonLabel: 'Termin anfragen',
								note: 'Jede Nachricht wird vertraulich behandelt.'
							}
						}
					},
					{
						id: 'contact-calm-intake',
						type: 'contact',
						props: {
							variant: 'form',
							email: 'randevu@adayilmaz.example',
							phone: '+90 216 555 10 20',
							address: 'Caferağa Mah. Kadıköy / İstanbul'
						},
						content: {
							tr: {
								title: 'Randevu talebi',
								description:
									'Kısa mesajını bırak; en uygun görüşme zamanı için e-posta ile dönüş yapayım.',
								submitLabel: 'Gönder'
							},
							en: {
								title: 'Appointment request',
								description:
									'Leave a short message and I will reply by email about a suitable meeting time.',
								submitLabel: 'Send'
							},
							de: {
								title: 'Terminanfrage',
								description:
									'Hinterlassen Sie eine kurze Nachricht; ich melde mich per E-Mail zu einem passenden Gesprächstermin.',
								submitLabel: 'Senden'
							}
						}
					},
					{
						id: 'footer-calm-intake',
						type: 'footer',
						props: { variant: 'simple' },
						content: {
							tr: {
								text: '© 2026 Psk. Ada Yılmaz. Bu site bilgilendirme amaçlıdır; acil durumlar için yerel acil destek hatlarına başvurun.'
							},
							en: {
								text: '© 2026 Psychologist Ada Yılmaz. This site is informational; for emergencies, contact local emergency support.'
							},
							de: {
								text: '© 2026 Psychologin Ada Yılmaz. Diese Website dient der Information; in Notfällen wenden Sie sich an lokale Notfalldienste.'
							}
						}
					}
				]
			}
		]
	};
}

export function createModernClinicPsychSite(): Site {
	return {
		id: 'kit-psych-modern-clinic',
		tenantId: 'tenant-kit-psych-modern-clinic',
		defaultLocale: 'tr',
		locales: ['tr', 'en', 'de'],
		theme: {
			...themePresets.psych,
			colors: {
				primary: '#264f73',
				secondary: '#e6eef5',
				accent: '#8b6f47',
				base: '#f8fafc',
				neutral: '#172433'
			},
			radius: 'md'
		},
		nav: {
			items: [{ pageSlug: 'home', label: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' } }]
		},
		settings: {
			siteName: 'Klinik Psk. Ece Arman',
			contactEmail: 'iletisim@ecearman.example',
			poweredByBadge: true,
			seo: {
				description: {
					tr: 'Klinik Psk. Ece Arman — yetişkinler için psikolojik danışmanlık, değerlendirme görüşmesi ve randevu bilgileri.',
					en: 'Clinical Psychologist Ece Arman — counselling for adults, consultation sessions and appointment information.',
					de: 'Klinische Psychologin Ece Arman — psychologische Beratung für Erwachsene, Erstgespräch und Termininformationen.'
				}
			}
		},
		pages: [
			{
				slug: 'home',
				title: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' },
				sections: [
					{
						id: 'hero-modern-clinic',
						type: 'hero',
						props: { variant: 'split', background: 'plain', ctaHref: '#contact' },
						content: {
							tr: {
								headline: 'Net, etik ve yapılandırılmış psikolojik destek',
								subheadline:
									'Yetişkin danışanlarla kaygı, yaşam geçişleri ve ilişki örüntüleri üzerine randevulu görüşmeler yürütüyorum.',
								ctaLabel: 'Ön görüşme talep et'
							},
							en: {
								headline: 'Clear, ethical and structured psychological support',
								subheadline:
									'I offer scheduled sessions with adults around anxiety, life transitions and relationship patterns.',
								ctaLabel: 'Request a consultation'
							},
							de: {
								headline: 'Klare, ethische und strukturierte psychologische Unterstützung',
								subheadline:
									'Ich biete Termine für Erwachsene zu Angst, Lebensübergängen und Beziehungsmustern an.',
								ctaLabel: 'Erstgespräch anfragen'
							}
						}
					},
					{
						id: 'services-modern-clinic',
						type: 'services',
						props: { variant: 'grid', columns: 3 },
						content: {
							tr: {
								title: 'Uzmanlık alanları',
								intro:
									'Görüşmeler ilk değerlendirme ile başlar; hedefler ve seans ritmi birlikte belirlenir.',
								items: [
									{
										name: 'Kaygı ve duygu düzenleme',
										description:
											'Gündelik yaşamı etkileyen kaygı, stres ve zorlayıcı düşünce döngülerini anlamlandırma.',
										price: 'Ön görüşme sonrası planlanır'
									},
									{
										name: 'Yaşam geçişleri',
										description:
											'İş, aile, şehir değişimi veya kayıp gibi dönemlerde destekleyici psikolojik çalışma.',
										price: 'Randevulu seans'
									},
									{
										name: 'İlişki örüntüleri',
										description:
											'Sınırlar, iletişim ve tekrar eden ilişki deneyimlerini güvenli bir çerçevede ele alma.',
										price: 'Randevulu seans'
									}
								]
							},
							en: {
								title: 'Areas of focus',
								intro:
									'Work starts with an initial consultation; goals and session rhythm are defined together.',
								items: [
									{
										name: 'Anxiety and emotion regulation',
										description:
											'Understanding anxiety, stress and recurring thought patterns that affect daily life.',
										price: 'Planned after consultation'
									},
									{
										name: 'Life transitions',
										description:
											'Supportive psychological work during changes in work, family, place or loss.',
										price: 'Scheduled session'
									},
									{
										name: 'Relationship patterns',
										description:
											'Exploring boundaries, communication and recurring relationship experiences safely.',
										price: 'Scheduled session'
									}
								]
							},
							de: {
								title: 'Schwerpunkte',
								intro:
									'Die Arbeit beginnt mit einem Erstgespräch; Ziele und Sitzungsrhythmus werden gemeinsam festgelegt.',
								items: [
									{
										name: 'Angst und Emotionsregulation',
										description:
											'Angst, Stress und wiederkehrende Denkmuster verstehen, die den Alltag beeinflussen.',
										price: 'Planung nach Erstgespräch'
									},
									{
										name: 'Lebensübergänge',
										description:
											'Psychologische Unterstützung bei beruflichen, familiären oder persönlichen Veränderungen.',
										price: 'Terminierte Sitzung'
									},
									{
										name: 'Beziehungsmuster',
										description:
											'Grenzen, Kommunikation und wiederkehrende Beziehungserfahrungen sicher betrachten.',
										price: 'Terminierte Sitzung'
									}
								]
							}
						}
					},
					{
						id: 'about-modern-clinic',
						type: 'about',
						props: { variant: 'text' },
						content: {
							tr: {
								title: 'Çalışma biçimi',
								body: 'İlk randevuda başvuru nedeninizi, beklentinizi ve uygun çalışma çerçevesini konuşuruz. Süreç gizlilik, meslek etiği ve açık bilgilendirme ilkeleriyle ilerler.'
							},
							en: {
								title: 'How I work',
								body: 'In the first appointment, we discuss your reason for seeking support, expectations and a suitable working frame. The process follows confidentiality, professional ethics and clear information.'
							},
							de: {
								title: 'Arbeitsweise',
								body: 'Im ersten Termin besprechen wir Ihr Anliegen, Ihre Erwartungen und einen passenden Rahmen. Der Prozess folgt Vertraulichkeit, Berufsethik und klarer Information.'
							}
						}
					},
					{
						id: 'testimonials-modern-clinic',
						type: 'testimonials',
						props: { variant: 'grid' },
						content: {
							tr: {
								title: 'Danışan yorumları',
								intro: 'İsimler gizlilik nedeniyle kısaltılmıştır.',
								items: [
									{
										quote:
											'Kendimi rahatça ifade edebildiğim bir ortamdı. İlk seanstan itibaren güven hissettim.',
										name: 'A.K.',
										role: 'danışan',
										rating: 5
									},
									{
										quote:
											'Adım adım ilerlediğimizi hissetmek iyi geldi. Acele ettirilmeden, kendi tempomda çalıştık.',
										name: 'E.D.',
										role: 'danışan',
										rating: 5
									},
									{
										quote:
											'Sorularım net ve dürüst biçimde yanıtlandı. Beklentilerimi daha iyi anlamama yardımcı oldu.',
										name: 'M.T.',
										role: 'danışan',
										rating: 4
									}
								]
							},
							en: {
								title: 'Client feedback',
								intro: 'Names are shortened for confidentiality.',
								items: [
									{
										quote:
											'A space where I felt safe to express myself. I felt trust from the first session.',
										name: 'A.K.',
										role: 'client',
										rating: 5
									},
									{
										quote:
											'I appreciated the step-by-step approach. We worked at my own pace, without pressure.',
										name: 'E.D.',
										role: 'client',
										rating: 5
									},
									{
										quote:
											'My questions were answered clearly and honestly. It helped me better understand my expectations.',
										name: 'M.T.',
										role: 'client',
										rating: 4
									}
								]
							},
							de: {
								title: 'Rückmeldungen',
								intro: 'Namen sind aus Vertraulichkeitsgründen gekürzt.',
								items: [
									{
										quote:
											'Ein Raum, in dem ich mich sicher ausdrücken konnte. Vom ersten Termin an spürte ich Vertrauen.',
										name: 'A.K.',
										role: 'Klient*in',
										rating: 5
									},
									{
										quote:
											'Die schrittweise Vorgehensweise tat gut. Wir arbeiteten in meinem eigenen Tempo, ohne Druck.',
										name: 'E.D.',
										role: 'Klient*in',
										rating: 5
									},
									{
										quote:
											'Meine Fragen wurden klar und ehrlich beantwortet. Es half mir, meine Erwartungen besser zu verstehen.',
										name: 'M.T.',
										role: 'Klient*in',
										rating: 4
									}
								]
							}
						}
					},
					{
						id: 'faq-modern-clinic',
						type: 'faq',
						props: { variant: 'list' },
						content: {
							tr: {
								title: 'Randevu öncesi',
								items: [
									{
										question: 'İlk randevu ne kadar sürer?',
										answer:
											'Genellikle 50 dakika planlanır; ihtiyaç ve çalışma çerçevesi ilk görüşmede netleştirilir.'
									},
									{
										question: 'Gizlilik nasıl korunur?',
										answer:
											'Görüşmeler meslek etiği, gizlilik ilkeleri ve yürürlükteki yasal çerçeveye uygun yürütülür.'
									},
									{
										question: 'Nasıl randevu alabilirim?',
										answer: 'Formu doldurarak uygun zaman aralığı için dönüş talep edebilirsiniz.'
									}
								]
							},
							en: {
								title: 'Before booking',
								items: [
									{
										question: 'How long is the first appointment?',
										answer:
											'It is usually planned for 50 minutes; needs and the working frame are clarified in the first session.'
									},
									{
										question: 'How is confidentiality protected?',
										answer:
											'Sessions follow professional ethics, confidentiality principles and applicable legal boundaries.'
									},
									{
										question: 'How can I book?',
										answer: 'You can use the form to request a suitable appointment window.'
									}
								]
							},
							de: {
								title: 'Vor dem Termin',
								items: [
									{
										question: 'Wie lange dauert der erste Termin?',
										answer:
											'Er wird meist mit 50 Minuten geplant; Anliegen und Rahmen werden im Erstgespräch geklärt.'
									},
									{
										question: 'Wie wird Vertraulichkeit geschützt?',
										answer:
											'Sitzungen folgen Berufsethik, Vertraulichkeit und den geltenden rechtlichen Grenzen.'
									},
									{
										question: 'Wie kann ich einen Termin vereinbaren?',
										answer: 'Über das Formular können Sie ein passendes Zeitfenster anfragen.'
									}
								]
							}
						}
					},
					{
						id: 'cta-modern-clinic',
						type: 'cta',
						props: { variant: 'banner', href: '#contact' },
						content: {
							tr: {
								title: 'Uygun bir ön görüşme zamanı planlayalım',
								subtitle:
									'Kısa talep formu ile iletişim bilgilerinizi bırakın; randevu seçenekleri e-posta ile paylaşılır.',
								buttonLabel: 'Formu doldur'
							},
							en: {
								title: 'Plan a suitable consultation time',
								subtitle:
									'Leave your contact details through the short form; appointment options are shared by email.',
								buttonLabel: 'Fill the form'
							},
							de: {
								title: 'Einen passenden Ersttermin planen',
								subtitle:
									'Hinterlassen Sie Ihre Kontaktdaten; Terminoptionen werden per E-Mail geteilt.',
								buttonLabel: 'Formular ausfüllen'
							}
						}
					},
					{
						id: 'booking-modern-clinic',
						type: 'booking',
						props: { variant: 'inline', href: '#contact-modern-clinic' },
						content: {
							tr: {
								title: 'İlk görüşme için adım atın',
								subtitle: 'Size uygun gün ve saat için aşağıdaki formdan ulaşabilirsiniz.',
								buttonLabel: 'Randevu talep et',
								note: 'Her mesaj gizlilik çerçevesinde değerlendirilir.'
							},
							en: {
								title: 'Take the first step',
								subtitle: 'Reach out via the form below for a suitable appointment time.',
								buttonLabel: 'Request an appointment',
								note: 'Every message is handled confidentially.'
							},
							de: {
								title: 'Machen Sie den ersten Schritt',
								subtitle: 'Kontaktieren Sie uns über das Formular für einen passenden Termin.',
								buttonLabel: 'Termin anfragen',
								note: 'Jede Nachricht wird vertraulich behandelt.'
							}
						}
					},
					{
						id: 'contact-modern-clinic',
						type: 'contact',
						props: {
							variant: 'split',
							email: 'iletisim@ecearman.example',
							phone: '+90 212 555 18 40',
							address: 'Nişantaşı / İstanbul'
						},
						content: {
							tr: {
								title: 'İletişim ve randevu',
								description:
									'Randevu talebinizi kısa bir notla iletin; uygun görüşme zamanı için dönüş yapılır.',
								submitLabel: 'Talep gönder'
							},
							en: {
								title: 'Contact and appointments',
								description:
									'Send your appointment request with a short note; you will receive a reply about suitable times.',
								submitLabel: 'Send request'
							},
							de: {
								title: 'Kontakt und Termine',
								description:
									'Senden Sie Ihre Terminanfrage mit einer kurzen Nachricht; passende Zeiten werden zurückgemeldet.',
								submitLabel: 'Anfrage senden'
							}
						}
					},
					{
						id: 'footer-modern-clinic',
						type: 'footer',
						props: { variant: 'simple' },
						content: {
							tr: {
								text: '© 2026 Klinik Psk. Ece Arman. Bu web sitesi genel bilgilendirme amaçlıdır; acil durumlarda yerel acil destek birimlerine başvurun.'
							},
							en: {
								text: '© 2026 Clinical Psychologist Ece Arman. This website is for general information; contact local emergency support in urgent situations.'
							},
							de: {
								text: '© 2026 Klinische Psychologin Ece Arman. Diese Website dient der allgemeinen Information; in Notfällen wenden Sie sich an lokale Notfalldienste.'
							}
						}
					}
				]
			}
		]
	};
}

export function createOnlineTherapyPsychSite(): Site {
	return {
		id: 'kit-psych-online-therapy',
		tenantId: 'tenant-kit-psych-online-therapy',
		defaultLocale: 'tr',
		locales: ['tr', 'en', 'de'],
		theme: {
			...themePresets.psych,
			colors: {
				primary: '#3f5f8f',
				secondary: '#e8edf7',
				accent: '#7b8f5a',
				base: '#fcfbf7',
				neutral: '#253047'
			},
			radius: 'lg'
		},
		nav: {
			items: [{ pageSlug: 'home', label: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' } }]
		},
		settings: {
			siteName: 'Psk. Mert Selim',
			contactEmail: 'online@mertselim.example',
			poweredByBadge: true,
			seo: {
				description: {
					tr: 'Psk. Mert Selim — yetişkinler için online terapi ve güvenli randevu süreci bilgileri.',
					en: 'Psychologist Mert Selim — online therapy for adults and clear appointment process information.',
					de: 'Psychologe Mert Selim — Online-Therapie für Erwachsene und klare Informationen zum Terminablauf.'
				}
			}
		},
		pages: [
			{
				slug: 'home',
				title: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' },
				sections: [
					{
						id: 'hero-online-therapy',
						type: 'hero',
						props: { variant: 'centered', background: 'gradient', ctaHref: '#contact' },
						content: {
							tr: {
								headline: 'Bulunduğun yerden güvenli online görüşme',
								subheadline:
									'Yetişkinlerle online seanslarda gizlilik, meslek etiği ve düzenli çalışma çerçevesi içinde buluşuyorum.',
								ctaLabel: 'Online randevu sor'
							},
							en: {
								headline: 'Secure online sessions from where you are',
								subheadline:
									'I meet adults online within confidentiality, professional ethics and a steady working frame.',
								ctaLabel: 'Ask for an online appointment'
							},
							de: {
								headline: 'Sichere Online-Gespräche von Ihrem Ort aus',
								subheadline:
									'Ich arbeite online mit Erwachsenen im Rahmen von Vertraulichkeit, Berufsethik und regelmäßiger Struktur.',
								ctaLabel: 'Online-Termin anfragen'
							}
						}
					},
					{
						id: 'services-online-therapy',
						type: 'services',
						props: { variant: 'list' },
						content: {
							tr: {
								title: 'Online çalışmada ele alınan konular',
								intro:
									'Online seansın uygunluğu ilk görüşmede birlikte değerlendirilir; gerekirse farklı destek yolları konuşulur.',
								items: [
									{
										name: 'Kaygı ve stres',
										description:
											'Günlük rutin, iş yükü ve belirsizlik dönemlerinde duygu düzenleme üzerine çalışma.',
										price: 'Online seans'
									},
									{
										name: 'Yaşam dengesi',
										description:
											'İş-özel yaşam sınırları, tükenmişlik sinyalleri ve sürdürülebilir alışkanlıklar.',
										price: 'Online seans'
									},
									{
										name: 'İlişki ve iletişim',
										description:
											'Yakın ilişkilerde ihtiyaç, sınır ve iletişim örüntülerini güvenli biçimde değerlendirme.',
										price: 'Online seans'
									}
								]
							},
							en: {
								title: 'Topics for online work',
								intro:
									'Suitability for online sessions is considered together in the first meeting; other support paths can be discussed when needed.',
								items: [
									{
										name: 'Anxiety and stress',
										description:
											'Working on emotion regulation during daily routines, workload and uncertainty.',
										price: 'Online session'
									},
									{
										name: 'Life balance',
										description: 'Work-life boundaries, burnout signals and sustainable habits.',
										price: 'Online session'
									},
									{
										name: 'Relationships and communication',
										description:
											'Exploring needs, boundaries and communication patterns in close relationships.',
										price: 'Online session'
									}
								]
							},
							de: {
								title: 'Themen für Online-Arbeit',
								intro:
									'Die Eignung für Online-Sitzungen wird im Erstgespräch gemeinsam betrachtet; andere Unterstützungswege können bei Bedarf besprochen werden.',
								items: [
									{
										name: 'Angst und Stress',
										description:
											'Emotionsregulation im Alltag, bei Arbeitsbelastung und in unsicheren Phasen.',
										price: 'Online-Sitzung'
									},
									{
										name: 'Lebensbalance',
										description:
											'Grenzen zwischen Arbeit und Privatleben, Erschöpfungssignale und tragfähige Gewohnheiten.',
										price: 'Online-Sitzung'
									},
									{
										name: 'Beziehung und Kommunikation',
										description:
											'Bedürfnisse, Grenzen und Kommunikationsmuster in nahen Beziehungen betrachten.',
										price: 'Online-Sitzung'
									}
								]
							}
						}
					},
					{
						id: 'testimonials-online-therapy',
						type: 'testimonials',
						props: { variant: 'grid' },
						content: {
							tr: {
								title: 'Danışan yorumları',
								intro: 'İsimler gizlilik nedeniyle kısaltılmıştır.',
								items: [
									{
										quote:
											'Kendimi rahatça ifade edebildiğim bir ortamdı. İlk seanstan itibaren güven hissettim.',
										name: 'A.K.',
										role: 'danışan',
										rating: 5
									},
									{
										quote:
											'Adım adım ilerlediğimizi hissetmek iyi geldi. Acele ettirilmeden, kendi tempomda çalıştık.',
										name: 'E.D.',
										role: 'danışan',
										rating: 5
									},
									{
										quote:
											'Sorularım net ve dürüst biçimde yanıtlandı. Beklentilerimi daha iyi anlamama yardımcı oldu.',
										name: 'M.T.',
										role: 'danışan',
										rating: 4
									}
								]
							},
							en: {
								title: 'Client feedback',
								intro: 'Names are shortened for confidentiality.',
								items: [
									{
										quote:
											'A space where I felt safe to express myself. I felt trust from the first session.',
										name: 'A.K.',
										role: 'client',
										rating: 5
									},
									{
										quote:
											'I appreciated the step-by-step approach. We worked at my own pace, without pressure.',
										name: 'E.D.',
										role: 'client',
										rating: 5
									},
									{
										quote:
											'My questions were answered clearly and honestly. It helped me better understand my expectations.',
										name: 'M.T.',
										role: 'client',
										rating: 4
									}
								]
							},
							de: {
								title: 'Rückmeldungen',
								intro: 'Namen sind aus Vertraulichkeitsgründen gekürzt.',
								items: [
									{
										quote:
											'Ein Raum, in dem ich mich sicher ausdrücken konnte. Vom ersten Termin an spürte ich Vertrauen.',
										name: 'A.K.',
										role: 'Klient*in',
										rating: 5
									},
									{
										quote:
											'Die schrittweise Vorgehensweise tat gut. Wir arbeiteten in meinem eigenen Tempo, ohne Druck.',
										name: 'E.D.',
										role: 'Klient*in',
										rating: 5
									},
									{
										quote:
											'Meine Fragen wurden klar und ehrlich beantwortet. Es half mir, meine Erwartungen besser zu verstehen.',
										name: 'M.T.',
										role: 'Klient*in',
										rating: 4
									}
								]
							}
						}
					},
					{
						id: 'faq-online-therapy',
						type: 'faq',
						props: { variant: 'accordion' },
						content: {
							tr: {
								title: 'Online seans hakkında',
								items: [
									{
										question: 'Online seans için ne gerekir?',
										answer:
											'Sessiz ve mahrem bir alan, stabil internet bağlantısı ve görüşmeye uygun bir cihaz yeterlidir.'
									},
									{
										question: 'Görüşme bağlantısı nasıl paylaşılır?',
										answer:
											'Randevu zamanı netleştiğinde güvenli görüşme bağlantısı e-posta ile paylaşılır.'
									},
									{
										question: 'Gizlilik online ortamda nasıl ele alınır?',
										answer:
											'Görüşmeler gizlilik ve meslek etiği ilkeleriyle yürütülür; danışanın bulunduğu ortamın mahremiyeti de birlikte değerlendirilir.'
									}
								]
							},
							en: {
								title: 'About online sessions',
								items: [
									{
										question: 'What do I need for an online session?',
										answer:
											'A quiet private space, stable internet and a suitable device are enough.'
									},
									{
										question: 'How is the meeting link shared?',
										answer:
											'Once the appointment time is confirmed, a secure session link is shared by email.'
									},
									{
										question: 'How is privacy handled online?',
										answer:
											'Sessions follow confidentiality and professional ethics; the privacy of the client’s own space is also considered.'
									}
								]
							},
							de: {
								title: 'Über Online-Sitzungen',
								items: [
									{
										question: 'Was brauche ich für eine Online-Sitzung?',
										answer:
											'Ein ruhiger privater Raum, stabile Internetverbindung und ein geeignetes Gerät reichen aus.'
									},
									{
										question: 'Wie wird der Link geteilt?',
										answer:
											'Nach Terminbestätigung wird ein sicherer Sitzungslink per E-Mail geteilt.'
									},
									{
										question: 'Wie wird Datenschutz online behandelt?',
										answer:
											'Sitzungen folgen Vertraulichkeit und Berufsethik; auch die Privatsphäre des eigenen Raums wird betrachtet.'
									}
								]
							}
						}
					},
					{
						id: 'about-online-therapy',
						type: 'about',
						props: { variant: 'text' },
						content: {
							tr: {
								title: 'Online süreci nasıl kuruyorum?',
								body: 'İlk randevuda online çalışmanın ihtiyacınıza uygunluğunu, seans sıklığını ve güvenli görüşme koşullarını konuşuruz. Amaç, düzenli ve anlaşılır bir çalışma alanı oluşturmaktır.'
							},
							en: {
								title: 'How I structure the online process',
								body: 'In the first appointment, we discuss whether online work is suitable for your needs, session rhythm and safe meeting conditions. The aim is to build a steady and clear working space.'
							},
							de: {
								title: 'Wie ich den Online-Prozess strukturiere',
								body: 'Im ersten Termin besprechen wir, ob Online-Arbeit zu Ihrem Anliegen passt, den Sitzungsrhythmus und sichere Gesprächsbedingungen. Ziel ist ein regelmäßiger und klarer Arbeitsraum.'
							}
						}
					},
					{
						id: 'cta-online-therapy',
						type: 'cta',
						props: { variant: 'boxed', href: '#contact' },
						content: {
							tr: {
								title: 'Online ilk görüşme için yazın',
								subtitle:
									'Uygun saatleri ve online görüşme koşullarını kısa bir e-posta dönüşüyle netleştirelim.',
								buttonLabel: 'Randevu talep et'
							},
							en: {
								title: 'Write for an online first meeting',
								subtitle: 'We can clarify suitable times and online meeting conditions by email.',
								buttonLabel: 'Request an appointment'
							},
							de: {
								title: 'Für ein Online-Erstgespräch schreiben',
								subtitle: 'Passende Zeiten und Online-Bedingungen können wir per E-Mail klären.',
								buttonLabel: 'Termin anfragen'
							}
						}
					},
					{
						id: 'booking-online-therapy',
						type: 'booking',
						props: { variant: 'inline', href: '#contact-online-therapy' },
						content: {
							tr: {
								title: 'İlk görüşme için adım atın',
								subtitle: 'Size uygun gün ve saat için aşağıdaki formdan ulaşabilirsiniz.',
								buttonLabel: 'Randevu talep et',
								note: 'Her mesaj gizlilik çerçevesinde değerlendirilir.'
							},
							en: {
								title: 'Take the first step',
								subtitle: 'Reach out via the form below for a suitable appointment time.',
								buttonLabel: 'Request an appointment',
								note: 'Every message is handled confidentially.'
							},
							de: {
								title: 'Machen Sie den ersten Schritt',
								subtitle: 'Kontaktieren Sie uns über das Formular für einen passenden Termin.',
								buttonLabel: 'Termin anfragen',
								note: 'Jede Nachricht wird vertraulich behandelt.'
							}
						}
					},
					{
						id: 'contact-online-therapy',
						type: 'contact',
						props: {
							variant: 'form',
							email: 'online@mertselim.example'
						},
						content: {
							tr: {
								title: 'Online randevu talebi',
								description:
									'Kısaca ihtiyacınızı ve uygun olduğunuz zaman aralıklarını yazın; dönüş e-posta ile yapılır.',
								submitLabel: 'Talep gönder'
							},
							en: {
								title: 'Online appointment request',
								description:
									'Briefly share your needs and suitable time windows; the reply is sent by email.',
								submitLabel: 'Send request'
							},
							de: {
								title: 'Online-Terminanfrage',
								description:
									'Beschreiben Sie kurz Ihr Anliegen und passende Zeiten; die Rückmeldung erfolgt per E-Mail.',
								submitLabel: 'Anfrage senden'
							}
						}
					},
					{
						id: 'footer-online-therapy',
						type: 'footer',
						props: { variant: 'simple' },
						content: {
							tr: {
								text: '© 2026 Psk. Mert Selim. Bu site bilgilendirme amaçlıdır; acil risk durumlarında bulunduğunuz yerdeki acil destek birimlerine başvurun.'
							},
							en: {
								text: '© 2026 Psychologist Mert Selim. This site is informational; in urgent risk situations, contact emergency support where you are.'
							},
							de: {
								text: '© 2026 Psychologe Mert Selim. Diese Website dient der Information; in akuten Risikosituationen wenden Sie sich an lokale Notfalldienste.'
							}
						}
					}
				]
			}
		]
	};
}

type LocalizedString = { tr: string; en: string; de: string };

type StructuredPsychKitInput = {
	slug: Extract<PsychKitSlug, 'child-family' | 'couples-therapy' | 'trauma-informed'>;
	siteName: string;
	email: string;
	phone?: string;
	address?: string;
	theme: {
		primary: string;
		secondary: string;
		accent: string;
		base: string;
		neutral: string;
		radius: 'sm' | 'md' | 'lg';
	};
	seo: LocalizedString;
	hero: { headline: LocalizedString; subheadline: LocalizedString; ctaLabel: LocalizedString };
	services: {
		title: LocalizedString;
		intro: LocalizedString;
		items: {
			name: LocalizedString;
			description: LocalizedString;
			price: LocalizedString;
		}[];
	};
	about: { title: LocalizedString; body: LocalizedString };
	faq: {
		title: LocalizedString;
		items: { question: LocalizedString; answer: LocalizedString }[];
	};
	cta: { title: LocalizedString; subtitle: LocalizedString; buttonLabel: LocalizedString };
	contact: { title: LocalizedString; description: LocalizedString; submitLabel: LocalizedString };
	footer: LocalizedString;
};

function createStructuredPsychKitSite(input: StructuredPsychKitInput): Site {
	const localizedServices = (locale: keyof LocalizedString) => ({
		title: input.services.title[locale],
		intro: input.services.intro[locale],
		items: input.services.items.map((item) => ({
			name: item.name[locale],
			description: item.description[locale],
			price: item.price[locale]
		}))
	});
	const localizedFaq = (locale: keyof LocalizedString) => ({
		title: input.faq.title[locale],
		items: input.faq.items.map((item) => ({
			question: item.question[locale],
			answer: item.answer[locale]
		}))
	});

	return {
		id: `kit-psych-${input.slug}`,
		tenantId: `tenant-kit-psych-${input.slug}`,
		defaultLocale: 'tr',
		locales: ['tr', 'en', 'de'],
		theme: {
			...themePresets.psych,
			colors: {
				primary: input.theme.primary,
				secondary: input.theme.secondary,
				accent: input.theme.accent,
				base: input.theme.base,
				neutral: input.theme.neutral
			},
			radius: input.theme.radius
		},
		nav: {
			items: [{ pageSlug: 'home', label: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' } }]
		},
		settings: {
			siteName: input.siteName,
			contactEmail: input.email,
			poweredByBadge: true,
			seo: { description: input.seo }
		},
		pages: [
			{
				slug: 'home',
				title: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite' },
				sections: [
					{
						id: `hero-${input.slug}`,
						type: 'hero',
						props: { variant: 'centered', background: 'gradient', ctaHref: '#contact' },
						content: {
							tr: {
								headline: input.hero.headline.tr,
								subheadline: input.hero.subheadline.tr,
								ctaLabel: input.hero.ctaLabel.tr
							},
							en: {
								headline: input.hero.headline.en,
								subheadline: input.hero.subheadline.en,
								ctaLabel: input.hero.ctaLabel.en
							},
							de: {
								headline: input.hero.headline.de,
								subheadline: input.hero.subheadline.de,
								ctaLabel: input.hero.ctaLabel.de
							}
						}
					},
					{
						id: `services-${input.slug}`,
						type: 'services',
						props: { variant: 'grid', columns: 3 },
						content: {
							tr: localizedServices('tr'),
							en: localizedServices('en'),
							de: localizedServices('de')
						}
					},
					{
						id: `about-${input.slug}`,
						type: 'about',
						props: { variant: 'text' },
						content: {
							tr: { title: input.about.title.tr, body: input.about.body.tr },
							en: { title: input.about.title.en, body: input.about.body.en },
							de: { title: input.about.title.de, body: input.about.body.de }
						}
					},
					{
						id: `faq-${input.slug}`,
						type: 'faq',
						props: { variant: 'accordion' },
						content: {
							tr: localizedFaq('tr'),
							en: localizedFaq('en'),
							de: localizedFaq('de')
						}
					},
					{
						id: `cta-${input.slug}`,
						type: 'cta',
						props: { variant: 'boxed', href: '#contact' },
						content: {
							tr: {
								title: input.cta.title.tr,
								subtitle: input.cta.subtitle.tr,
								buttonLabel: input.cta.buttonLabel.tr
							},
							en: {
								title: input.cta.title.en,
								subtitle: input.cta.subtitle.en,
								buttonLabel: input.cta.buttonLabel.en
							},
							de: {
								title: input.cta.title.de,
								subtitle: input.cta.subtitle.de,
								buttonLabel: input.cta.buttonLabel.de
							}
						}
					},
					{
						id: `contact-${input.slug}`,
						type: 'contact',
						props: {
							variant: 'form',
							email: input.email,
							phone: input.phone,
							address: input.address
						},
						content: {
							tr: {
								title: input.contact.title.tr,
								description: input.contact.description.tr,
								submitLabel: input.contact.submitLabel.tr
							},
							en: {
								title: input.contact.title.en,
								description: input.contact.description.en,
								submitLabel: input.contact.submitLabel.en
							},
							de: {
								title: input.contact.title.de,
								description: input.contact.description.de,
								submitLabel: input.contact.submitLabel.de
							}
						}
					},
					{
						id: `footer-${input.slug}`,
						type: 'footer',
						props: { variant: 'simple' },
						content: {
							tr: { text: input.footer.tr },
							en: { text: input.footer.en },
							de: { text: input.footer.de }
						}
					}
				]
			}
		]
	};
}

export function createChildFamilyPsychSite(): Site {
	return createStructuredPsychKitSite({
		slug: 'child-family',
		siteName: 'Uzm. Psk. Elif Saran',
		email: 'aile@elifsaran.example',
		phone: '+90 216 555 24 18',
		address: 'Bağdat Caddesi / İstanbul',
		theme: {
			primary: '#5f6f52',
			secondary: '#eef2e7',
			accent: '#c68f5c',
			base: '#fffaf2',
			neutral: '#2f352d',
			radius: 'lg'
		},
		seo: {
			tr: 'Uzm. Psk. Elif Saran — çocuk, ergen ve ebeveyn danışmanlığı için güvenli randevu süreci.',
			en: 'Psychologist Elif Saran — child, adolescent and parent counselling with a clear appointment process.',
			de: 'Psychologin Elif Saran — Beratung für Kinder, Jugendliche und Eltern mit klarem Terminablauf.'
		},
		hero: {
			headline: {
				tr: 'Çocuk, ergen ve aile için güvenli bir görüşme alanı',
				en: 'A safe consultation space for children, adolescents and families',
				de: 'Ein sicherer Gesprächsraum für Kinder, Jugendliche und Familien'
			},
			subheadline: {
				tr: 'Ebeveynlerle iş birliği içinde, çocuğun ihtiyacını ve aile içi iletişimi gizlilik ve meslek etiği çerçevesinde ele alıyorum.',
				en: 'In collaboration with parents, I work on the child’s needs and family communication within confidentiality and professional ethics.',
				de: 'In Zusammenarbeit mit Eltern betrachte ich die Bedürfnisse des Kindes und die Familienkommunikation im Rahmen von Vertraulichkeit und Berufsethik.'
			},
			ctaLabel: {
				tr: 'Ön görüşme talep et',
				en: 'Request a consultation',
				de: 'Erstgespräch anfragen'
			}
		},
		services: {
			title: { tr: 'Çalışma başlıkları', en: 'Areas of work', de: 'Arbeitsschwerpunkte' },
			intro: {
				tr: 'Her aile ve çocuk ayrı değerlendirilir; süreç ilk görüşmede birlikte planlanır.',
				en: 'Each family and child is considered individually; the process is planned together in the first meeting.',
				de: 'Jede Familie und jedes Kind wird individuell betrachtet; der Prozess wird im Erstgespräch gemeinsam geplant.'
			},
			items: [
				{
					name: { tr: 'Ebeveyn danışmanlığı', en: 'Parent counselling', de: 'Elternberatung' },
					description: {
						tr: 'Sınırlar, rutinler, iletişim ve ebeveynlik yükü üzerine yapılandırılmış görüşmeler.',
						en: 'Structured sessions around boundaries, routines, communication and parenting load.',
						de: 'Strukturierte Gespräche zu Grenzen, Routinen, Kommunikation und elterlicher Belastung.'
					},
					price: {
						tr: 'Ön görüşme sonrası planlanır',
						en: 'Planned after consultation',
						de: 'Planung nach Erstgespräch'
					}
				},
				{
					name: {
						tr: 'Çocuk ve ergen görüşmeleri',
						en: 'Child and adolescent sessions',
						de: 'Kinder- und Jugendgespräche'
					},
					description: {
						tr: 'Duygu düzenleme, okul uyumu ve sosyal ilişkiler gibi konular uygun çerçevede ele alınır.',
						en: 'Emotion regulation, school adjustment and social relationships are discussed within a suitable frame.',
						de: 'Emotionsregulation, schulische Anpassung und soziale Beziehungen werden in passendem Rahmen besprochen.'
					},
					price: { tr: 'Randevulu görüşme', en: 'Scheduled session', de: 'Terminierte Sitzung' }
				},
				{
					name: { tr: 'Aile iletişimi', en: 'Family communication', de: 'Familienkommunikation' },
					description: {
						tr: 'Aile içi ihtiyaçları, rolleri ve iletişim örüntülerini daha anlaşılır hale getirme.',
						en: 'Clarifying family needs, roles and communication patterns.',
						de: 'Bedürfnisse, Rollen und Kommunikationsmuster in der Familie klären.'
					},
					price: { tr: 'Randevulu görüşme', en: 'Scheduled session', de: 'Terminierte Sitzung' }
				}
			]
		},
		about: {
			title: {
				tr: 'Süreç nasıl ilerler?',
				en: 'How the process works',
				de: 'Wie der Prozess abläuft'
			},
			body: {
				tr: 'İlk görüşmede başvuru nedenini, çocuğun yaşını, ebeveyn beklentilerini ve uygun görüşme çerçevesini konuşuruz. Süreç boyunca gizlilik, çocuğun güvenliği ve açık bilgilendirme birlikte gözetilir.',
				en: 'In the first meeting, we discuss the reason for contact, the child’s age, parent expectations and a suitable frame. Confidentiality, child safety and clear information are considered throughout.',
				de: 'Im Erstgespräch besprechen wir Anlass, Alter des Kindes, Erwartungen der Eltern und einen passenden Rahmen. Vertraulichkeit, Sicherheit des Kindes und klare Information werden durchgehend beachtet.'
			}
		},
		faq: {
			title: {
				tr: 'Ebeveynlerin sık sorduğu sorular',
				en: 'Common parent questions',
				de: 'Häufige Elternfragen'
			},
			items: [
				{
					question: {
						tr: 'İlk görüşmeye kim katılır?',
						en: 'Who attends the first meeting?',
						de: 'Wer nimmt am Erstgespräch teil?'
					},
					answer: {
						tr: 'Duruma göre ebeveynlerle başlanır; çocuğun katılım biçimi yaşına ve ihtiyaca göre birlikte netleştirilir.',
						en: 'Depending on the situation, we may start with parents; the child’s participation is clarified according to age and need.',
						de: 'Je nach Situation beginnen wir mit den Eltern; die Beteiligung des Kindes wird nach Alter und Bedarf geklärt.'
					}
				},
				{
					question: {
						tr: 'Gizlilik nasıl ele alınır?',
						en: 'How is confidentiality handled?',
						de: 'Wie wird Vertraulichkeit behandelt?'
					},
					answer: {
						tr: 'Görüşmeler gizlilik ve meslek etiği ilkeleriyle yürütülür; ebeveyn bilgilendirmesi çocuğun güvenliği ve yasal çerçeveyle dengelenir.',
						en: 'Sessions follow confidentiality and professional ethics; parent updates are balanced with child safety and the legal frame.',
						de: 'Gespräche folgen Vertraulichkeit und Berufsethik; Elterninformation wird mit Sicherheit des Kindes und rechtlichem Rahmen abgewogen.'
					}
				},
				{
					question: {
						tr: 'Randevu nasıl planlanır?',
						en: 'How is an appointment planned?',
						de: 'Wie wird ein Termin geplant?'
					},
					answer: {
						tr: 'Form üzerinden kısa bilgi bıraktığınızda uygun ilk görüşme zamanı e-posta ile paylaşılır.',
						en: 'After you leave brief information through the form, a suitable first appointment time is shared by email.',
						de: 'Nach kurzer Information über das Formular wird ein passender Ersttermin per E-Mail geteilt.'
					}
				}
			]
		},
		cta: {
			title: {
				tr: 'Aile için ilk adımı netleştirelim',
				en: 'Clarify the first step for your family',
				de: 'Den ersten Schritt für Ihre Familie klären'
			},
			subtitle: {
				tr: 'Kısa bir ön görüşme talebi gönderin; uygun çerçeveyi birlikte konuşalım.',
				en: 'Send a short consultation request; we can discuss the suitable frame together.',
				de: 'Senden Sie eine kurze Anfrage; wir besprechen gemeinsam den passenden Rahmen.'
			},
			buttonLabel: { tr: 'Randevu talep et', en: 'Request an appointment', de: 'Termin anfragen' }
		},
		contact: {
			title: {
				tr: 'Ön görüşme talebi',
				en: 'Consultation request',
				de: 'Anfrage zum Erstgespräch'
			},
			description: {
				tr: 'Çocuğun yaşı, başvuru nedeni ve uygun zaman aralıklarını kısaca yazabilirsiniz.',
				en: 'You can briefly share the child’s age, reason for contact and suitable time windows.',
				de: 'Sie können Alter des Kindes, Anlass und passende Zeitfenster kurz beschreiben.'
			},
			submitLabel: { tr: 'Talep gönder', en: 'Send request', de: 'Anfrage senden' }
		},
		footer: {
			tr: '© 2026 Uzm. Psk. Elif Saran. Bu site bilgilendirme amaçlıdır; acil risk durumlarında yerel acil destek birimlerine başvurun.',
			en: '© 2026 Psychologist Elif Saran. This site is informational; in urgent risk situations, contact local emergency support.',
			de: '© 2026 Psychologin Elif Saran. Diese Website dient der Information; in akuten Risikosituationen wenden Sie sich an lokale Notfalldienste.'
		}
	});
}

export function createCouplesTherapyPsychSite(): Site {
	return createStructuredPsychKitSite({
		slug: 'couples-therapy',
		siteName: 'Psk. Selin Arat',
		email: 'cift@selinarat.example',
		theme: {
			primary: '#6f4e5f',
			secondary: '#f2e8ec',
			accent: '#b98468',
			base: '#fff8f6',
			neutral: '#382b31',
			radius: 'md'
		},
		seo: {
			tr: 'Psk. Selin Arat — çift terapisi, ilişki iletişimi ve ilk görüşme randevu bilgileri.',
			en: 'Psychologist Selin Arat — couples therapy, relationship communication and first appointment information.',
			de: 'Psychologin Selin Arat — Paartherapie, Beziehungskommunikation und Informationen zum Ersttermin.'
		},
		hero: {
			headline: {
				tr: 'İlişkiyi konuşmak için tarafsız ve güvenli bir alan',
				en: 'A neutral and safe space to talk about the relationship',
				de: 'Ein neutraler und sicherer Raum, um über die Beziehung zu sprechen'
			},
			subheadline: {
				tr: 'Çiftlerle iletişim, sınırlar ve tekrar eden ilişki döngüleri üzerine gizlilik ve meslek etiği içinde çalışıyorum.',
				en: 'I work with couples on communication, boundaries and recurring relationship cycles within confidentiality and professional ethics.',
				de: 'Ich arbeite mit Paaren zu Kommunikation, Grenzen und wiederkehrenden Beziehungsmustern im Rahmen von Vertraulichkeit und Berufsethik.'
			},
			ctaLabel: {
				tr: 'İlk görüşme talep et',
				en: 'Request a first meeting',
				de: 'Erstgespräch anfragen'
			}
		},
		services: {
			title: {
				tr: 'Çiftlerle çalışma alanları',
				en: 'Areas of couples work',
				de: 'Themen der Paararbeit'
			},
			intro: {
				tr: 'Süreç taraf tutmadan, iki kişinin de duyulabileceği güvenli bir görüşme çerçevesiyle ilerler.',
				en: 'The process is held in a neutral frame where both partners can be heard safely.',
				de: 'Der Prozess erfolgt in einem neutralen Rahmen, in dem beide Partner sicher gehört werden können.'
			},
			items: [
				{
					name: {
						tr: 'İletişim döngüleri',
						en: 'Communication cycles',
						de: 'Kommunikationsmuster'
					},
					description: {
						tr: 'Tartışma biçimleri, kopma-yaklaşma döngüleri ve ihtiyaçların ifade edilmesi.',
						en: 'Conflict styles, distance-closeness cycles and expressing needs.',
						de: 'Konfliktformen, Distanz-Nähe-Dynamiken und das Ausdrücken von Bedürfnissen.'
					},
					price: { tr: 'Çift görüşmesi', en: 'Couples session', de: 'Paarsitzung' }
				},
				{
					name: {
						tr: 'Güven ve sınırlar',
						en: 'Trust and boundaries',
						de: 'Vertrauen und Grenzen'
					},
					description: {
						tr: 'Güvenin zedelendiği dönemlerde sınırları, beklentileri ve onarım yollarını konuşma.',
						en: 'Discussing boundaries, expectations and repair paths when trust has been strained.',
						de: 'Grenzen, Erwartungen und Wege der Wiederannäherung besprechen, wenn Vertrauen belastet ist.'
					},
					price: { tr: 'Çift görüşmesi', en: 'Couples session', de: 'Paarsitzung' }
				},
				{
					name: { tr: 'Yaşam geçişleri', en: 'Life transitions', de: 'Lebensübergänge' },
					description: {
						tr: 'Evlilik, ayrılık kararı, ebeveynlik veya taşınma gibi dönemlerde ilişkiyi değerlendirme.',
						en: 'Reflecting on the relationship during marriage, separation decisions, parenting or relocation.',
						de: 'Die Beziehung in Phasen wie Heirat, Trennungsentscheidung, Elternschaft oder Umzug reflektieren.'
					},
					price: { tr: 'Çift görüşmesi', en: 'Couples session', de: 'Paarsitzung' }
				}
			]
		},
		about: {
			title: {
				tr: 'Tarafsız çalışma çerçevesi',
				en: 'A neutral working frame',
				de: 'Ein neutraler Arbeitsrahmen'
			},
			body: {
				tr: 'İlk randevuda başvuru nedenini, iki tarafın beklentilerini ve seans yapısını konuşuruz. Amaç, güvenli bir görüşme alanında ilişki dinamiklerini birlikte anlamaktır.',
				en: 'In the first appointment, we discuss the reason for seeking support, both partners’ expectations and the session structure. The aim is to understand relationship dynamics together in a safe space.',
				de: 'Im ersten Termin besprechen wir Anlass, Erwartungen beider Partner und die Sitzungsstruktur. Ziel ist, Beziehungsdynamiken gemeinsam in einem sicheren Raum zu verstehen.'
			}
		},
		faq: {
			title: { tr: 'Çift terapisi hakkında', en: 'About couples therapy', de: 'Über Paartherapie' },
			items: [
				{
					question: {
						tr: 'İlk görüşmeye ikimiz de katılmalı mıyız?',
						en: 'Should we both attend the first meeting?',
						de: 'Sollten wir beide am Erstgespräch teilnehmen?'
					},
					answer: {
						tr: 'Genellikle iki kişinin de katılması tercih edilir; uygun çerçeve randevu öncesi kısaca netleştirilebilir.',
						en: 'It is usually preferred that both partners attend; the suitable frame can be clarified briefly before the appointment.',
						de: 'Meist ist die Teilnahme beider Partner sinnvoll; der passende Rahmen kann vorab kurz geklärt werden.'
					}
				},
				{
					question: {
						tr: 'Gizlilik nasıl işler?',
						en: 'How does confidentiality work?',
						de: 'Wie funktioniert Vertraulichkeit?'
					},
					answer: {
						tr: 'Görüşmeler gizlilik ve meslek etiği ilkeleriyle yürütülür; çift çalışmasının sınırları ilk görüşmede açıklanır.',
						en: 'Sessions follow confidentiality and professional ethics; the boundaries of couples work are explained in the first meeting.',
						de: 'Sitzungen folgen Vertraulichkeit und Berufsethik; die Grenzen der Paararbeit werden im Erstgespräch erklärt.'
					}
				},
				{
					question: {
						tr: 'Randevu nasıl alınır?',
						en: 'How do we book?',
						de: 'Wie vereinbaren wir einen Termin?'
					},
					answer: {
						tr: 'Formdan kısa bir talep göndererek uygun gün ve saat seçenekleri için dönüş alabilirsiniz.',
						en: 'Send a short request through the form to receive suitable day and time options.',
						de: 'Senden Sie über das Formular eine kurze Anfrage, um passende Terminoptionen zu erhalten.'
					}
				}
			]
		},
		cta: {
			title: {
				tr: 'İlk görüşme çerçevesini birlikte belirleyelim',
				en: 'Define the first meeting frame together',
				de: 'Den Rahmen des Erstgesprächs gemeinsam klären'
			},
			subtitle: {
				tr: 'Kısa bir randevu talebi gönderin; uygun saat ve görüşme biçimini netleştirelim.',
				en: 'Send a short appointment request; we can clarify timing and format.',
				de: 'Senden Sie eine kurze Terminanfrage; Zeit und Format können wir klären.'
			},
			buttonLabel: { tr: 'Randevu talep et', en: 'Request an appointment', de: 'Termin anfragen' }
		},
		contact: {
			title: {
				tr: 'Çift görüşmesi talebi',
				en: 'Couples session request',
				de: 'Anfrage für Paargespräch'
			},
			description: {
				tr: 'Kısaca görüşme nedeninizi ve uygun zaman aralıklarınızı yazabilirsiniz.',
				en: 'Briefly share your reason for contact and suitable time windows.',
				de: 'Beschreiben Sie kurz Ihr Anliegen und passende Zeitfenster.'
			},
			submitLabel: { tr: 'Talep gönder', en: 'Send request', de: 'Anfrage senden' }
		},
		footer: {
			tr: '© 2026 Psk. Selin Arat. Bu site bilgilendirme amaçlıdır; acil risk durumlarında yerel acil destek birimlerine başvurun.',
			en: '© 2026 Psychologist Selin Arat. This site is informational; in urgent risk situations, contact local emergency support.',
			de: '© 2026 Psychologin Selin Arat. Diese Website dient der Information; in akuten Risikosituationen wenden Sie sich an lokale Notfalldienste.'
		}
	});
}

export function createTraumaInformedPsychSite(): Site {
	return createStructuredPsychKitSite({
		slug: 'trauma-informed',
		siteName: 'Psk. Derya Koç',
		email: 'destek@deryakoc.example',
		theme: {
			primary: '#4d6864',
			secondary: '#e4efed',
			accent: '#9d8062',
			base: '#f8f5ef',
			neutral: '#243331',
			radius: 'lg'
		},
		seo: {
			tr: 'Psk. Derya Koç — travma duyarlı bireysel psikolojik destek ve güvenli randevu bilgileri.',
			en: 'Psychologist Derya Koç — trauma-informed individual psychological support and appointment information.',
			de: 'Psychologin Derya Koç — traumasensible individuelle psychologische Unterstützung und Termininformationen.'
		},
		hero: {
			headline: {
				tr: 'Güvenli tempo ile travma duyarlı destek',
				en: 'Trauma-informed support at a safe pace',
				de: 'Traumasensible Unterstützung in sicherem Tempo'
			},
			subheadline: {
				tr: 'Zorlayıcı yaşam deneyimleri, kaygı ve bedensel stres tepkileri üzerine acele etmeden, gizlilik ve meslek etiği çerçevesinde çalışıyorum.',
				en: 'I work with difficult life experiences, anxiety and body-based stress responses at a careful pace within confidentiality and professional ethics.',
				de: 'Ich arbeite zu belastenden Lebenserfahrungen, Angst und körperlichen Stressreaktionen in achtsamem Tempo im Rahmen von Vertraulichkeit und Berufsethik.'
			},
			ctaLabel: {
				tr: 'Güvenli ilk adımı sor',
				en: 'Ask about a safe first step',
				de: 'Sicheren ersten Schritt anfragen'
			}
		},
		services: {
			title: { tr: 'Çalışma odağı', en: 'Focus of work', de: 'Arbeitsfokus' },
			intro: {
				tr: 'Travma duyarlı çalışma kişinin hızını, sınırlarını ve kaynaklarını gözeterek planlanır.',
				en: 'Trauma-informed work is planned with attention to the person’s pace, boundaries and resources.',
				de: 'Traumasensible Arbeit wird mit Blick auf Tempo, Grenzen und Ressourcen der Person geplant.'
			},
			items: [
				{
					name: { tr: 'Güvenli zemin oluşturma', en: 'Building safety', de: 'Sicherheit aufbauen' },
					description: {
						tr: 'Seanslarda sınır, güven ve regülasyon kaynaklarını birlikte belirleme.',
						en: 'Identifying boundaries, safety and regulation resources together in sessions.',
						de: 'Grenzen, Sicherheit und Ressourcen zur Regulation gemeinsam in Sitzungen bestimmen.'
					},
					price: { tr: 'Bireysel seans', en: 'Individual session', de: 'Einzelsitzung' }
				},
				{
					name: {
						tr: 'Kaygı ve tetiklenmeler',
						en: 'Anxiety and triggers',
						de: 'Angst und Trigger'
					},
					description: {
						tr: 'Zorlayıcı duygu ve beden tepkilerini anlamlandırmak için yavaş ve yapılandırılmış çalışma.',
						en: 'Slow, structured work to understand difficult emotional and body responses.',
						de: 'Langsame, strukturierte Arbeit, um belastende emotionale und körperliche Reaktionen zu verstehen.'
					},
					price: { tr: 'Bireysel seans', en: 'Individual session', de: 'Einzelsitzung' }
				},
				{
					name: {
						tr: 'Günlük yaşamda kaynaklar',
						en: 'Resources in daily life',
						de: 'Ressourcen im Alltag'
					},
					description: {
						tr: 'Günlük yaşamda destekleyici rutinler, sınırlar ve baş etme kaynaklarını güçlendirme.',
						en: 'Strengthening supportive routines, boundaries and coping resources in daily life.',
						de: 'Unterstützende Routinen, Grenzen und Bewältigungsressourcen im Alltag stärken.'
					},
					price: { tr: 'Bireysel seans', en: 'Individual session', de: 'Einzelsitzung' }
				}
			]
		},
		about: {
			title: { tr: 'Acele etmeyen çalışma', en: 'Work that does not rush', de: 'Arbeit ohne Eile' },
			body: {
				tr: 'İlk görüşmede ihtiyacınızı, beklentinizi ve güvenli çalışma koşullarını konuşuruz. Süreç boyunca kişinin hazır oluşu, sınırları ve düzenli değerlendirme önemlidir.',
				en: 'In the first meeting, we discuss your needs, expectations and safe working conditions. Readiness, boundaries and regular review are important throughout.',
				de: 'Im Erstgespräch besprechen wir Anliegen, Erwartungen und sichere Arbeitsbedingungen. Bereitschaft, Grenzen und regelmäßige Reflexion sind durchgehend wichtig.'
			}
		},
		faq: {
			title: {
				tr: 'Travma duyarlı süreç',
				en: 'Trauma-informed process',
				de: 'Traumasensibler Prozess'
			},
			items: [
				{
					question: {
						tr: 'İlk görüşmede zor deneyimleri anlatmak zorunda mıyım?',
						en: 'Do I have to describe difficult experiences in the first meeting?',
						de: 'Muss ich belastende Erfahrungen im Erstgespräch erzählen?'
					},
					answer: {
						tr: 'Hayır. İlk görüşmede ihtiyaç, güvenli çerçeve ve çalışma temposu konuşulur; ayrıntı paylaşımı kişinin hazır oluşuna göre ilerler.',
						en: 'No. The first meeting focuses on needs, a safe frame and pace; sharing details follows the person’s readiness.',
						de: 'Nein. Im Erstgespräch geht es um Anliegen, sicheren Rahmen und Tempo; Details folgen der Bereitschaft der Person.'
					}
				},
				{
					question: {
						tr: 'Gizlilik nasıl korunur?',
						en: 'How is confidentiality protected?',
						de: 'Wie wird Vertraulichkeit geschützt?'
					},
					answer: {
						tr: 'Görüşmeler gizlilik, meslek etiği ve yürürlükteki yasal çerçeveye uygun yürütülür.',
						en: 'Sessions follow confidentiality, professional ethics and the applicable legal frame.',
						de: 'Sitzungen folgen Vertraulichkeit, Berufsethik und geltendem rechtlichem Rahmen.'
					}
				},
				{
					question: {
						tr: 'Randevuya nasıl başlayabilirim?',
						en: 'How can I start with an appointment?',
						de: 'Wie kann ich mit einem Termin beginnen?'
					},
					answer: {
						tr: 'Kısa bir talep formu bırakabilirsiniz; uygun zaman ve ilk görüşme koşulları e-posta ile netleştirilir.',
						en: 'You can leave a short request form; suitable timing and first-session conditions are clarified by email.',
						de: 'Sie können eine kurze Anfrage senden; passende Zeit und Bedingungen des Erstgesprächs werden per E-Mail geklärt.'
					}
				}
			]
		},
		cta: {
			title: {
				tr: 'Güvenli ilk adımı birlikte belirleyelim',
				en: 'Define a safe first step together',
				de: 'Einen sicheren ersten Schritt gemeinsam klären'
			},
			subtitle: {
				tr: 'Kısa bir randevu talebi gönderin; uygun tempo ve görüşme çerçevesini konuşalım.',
				en: 'Send a short appointment request; we can discuss the suitable pace and frame.',
				de: 'Senden Sie eine kurze Terminanfrage; wir besprechen passendes Tempo und Rahmen.'
			},
			buttonLabel: { tr: 'Randevu talep et', en: 'Request an appointment', de: 'Termin anfragen' }
		},
		contact: {
			title: {
				tr: 'İlk görüşme talebi',
				en: 'First meeting request',
				de: 'Anfrage zum Erstgespräch'
			},
			description: {
				tr: 'Kısaca ihtiyacınızı ve uygun zaman aralıklarını yazabilirsiniz; ayrıntı paylaşmak zorunda değilsiniz.',
				en: 'Briefly share your need and suitable time windows; you do not have to share details.',
				de: 'Beschreiben Sie kurz Ihr Anliegen und passende Zeiten; Details müssen Sie nicht teilen.'
			},
			submitLabel: { tr: 'Talep gönder', en: 'Send request', de: 'Anfrage senden' }
		},
		footer: {
			tr: '© 2026 Psk. Derya Koç. Bu site bilgilendirme amaçlıdır; acil risk durumlarında yerel acil destek birimlerine başvurun.',
			en: '© 2026 Psychologist Derya Koç. This site is informational; in urgent risk situations, contact local emergency support.',
			de: '© 2026 Psychologin Derya Koç. Diese Website dient der Information; in akuten Risikosituationen wenden Sie sich an lokale Notfalldienste.'
		}
	});
}
