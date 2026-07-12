<script lang="ts">
	import { goto } from '$app/navigation';
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import AppCard from '$lib/ui/AppCard.svelte';
	import {
		ONBOARDING_QUESTIONS,
		nextQuestion,
		visibleQuestions,
		type OnboardingAnswers,
		type Question
	} from '$lib/onboarding/questions';
	import { VISUAL_DIRECTIONS } from '$lib/onboarding/directions';
	import { localizeDirection, localizeQuestion } from '$lib/i18n/onboarding';
	import { withLocale, type Locale } from '$lib/i18n';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import ChatBubble from '$lib/ui/ChatBubble.svelte';
	import TypingIndicator from '$lib/ui/TypingIndicator.svelte';
	import { uiIcons } from '$lib/ui/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	const copy = $derived(
		{
			en: {
				title: 'New site · saaskaya',
				description:
					'Answer a few questions and saaskaya will prepare a multilingual website through a validated structure.',
				label: 'saaskaya.app / new site',
				home: 'Home',
				back: 'saaskaya',
				h1: 'A few questions, one website.',
				intro:
					'You can start without an account. Answer the questions, then create your account at the final step. Your answers are saved.',
				flow: 'Guided flow',
				campaignLabel: 'Campaign start',
				campaignPrompt: 'You came here for a profession-specific draft. Start with this path:',
				campaignCta: 'Start this draft',
				professionHooks: {
					psych: {
						title: 'Psychology practice website draft',
						body: 'Describe your approach and see a calm, reassuring first draft before creating an account.'
					},
					law: {
						title: 'Law office website draft',
						body: 'Describe your practice areas and see a serious, informative first draft before creating an account.'
					},
					dental: {
						title: 'Dental clinic website draft',
						body: 'Describe your clinic and services, then review a clear first draft without technical setup.'
					},
					dietitian: {
						title: 'Dietitian website draft',
						body: 'Describe your nutrition approach without outcome promises; get a clear counseling-site draft.'
					},
					real_estate: {
						title: 'Real estate advisor website draft',
						body: 'Describe your local market and services; get a trust-led site draft for inquiries.'
					},
					beauty: {
						title: 'Service website draft',
						body: 'Describe your services and booking flow; get a clean first draft for appointment requests.'
					}
				} as Record<string, { title: string; body: string }>,
				steps: [
					'answer a few questions',
					'create a free account',
					'generate multilingual content',
					'preview and publish with a validated structure'
				],
				selectedKit: 'Selected kit',
				kitNote:
					'This kit guides the first draft together with your answers; AI still cannot leave the fixed block set.',
				done: 'Your answers are complete!',
				doneSignedOut: 'Create your account and the site will be ready to generate.',
				doneSignedIn: 'Now your site can be generated.',
				credits: [
					'Free accounts can keep up to 3 preview sites.',
					'Text, theme, and image edits are free.',
					'Creative AI rewrites use extra credits.',
					'If generation fails, your answers are preserved and you can retry.'
				],
				rawPlaceholder:
					'Example: I am Dr. Ada Smith. I offer online therapy for adults in Berlin...',
				rawCount: 'min. 30',
				send: 'Send',
				backToQuestions: 'Back to questions',
				visualDirection: 'Visual direction',
				kit: 'Kit',
				continue: 'Continue',
				addService: 'Write a service and add it...',
				add: 'Add',
				remove: 'Remove',
				answerPlaceholder: 'Write your answer...',
				skip: 'Skip',
				createSite: 'Generate my site',
				startFree: 'Start free',
				generating: 'Generating your site...',
				redirecting: 'Redirecting...',
				rawToggle: 'I want to describe it in my own words',
				stepWord: 'Step',
				stepsDone: 'All done',
				nicheDescriptions: {
					psych: 'A calm, reassuring site for your therapy practice',
					law: 'A serious, professional presence for your firm',
					dental: 'A fresh, modern site for your clinic',
					dietitian: 'A practical nutrition site for counseling and follow-up',
					real_estate: 'A local-trust site for listings and buyer/seller leads',
					beauty: 'A booking-focused site for services and appointment requests',
					unsupported: 'Manual beta review instead of forcing the wrong preset'
				} as Record<string, string>,
				unsupportedTitle: 'This field needs manual beta review.',
				unsupportedBody:
					'We do not map unsupported professions to the lawyer preset. Send us your field and we will review whether it can join the beta.',
				unsupportedAction: 'Email support',
				footer:
					'AI turns your answers into a validated site structure. Questions are free; only site generation uses your monthly AI budget.',
				stages: {
					prepare: 'Preparing your answers...',
					generate: 'AI is generating a validated site draft...',
					editor: 'Opening the editor...'
				},
				errors: {
					generic: 'Something went wrong.',
					network: 'Network error — please try again.',
					generation:
						'The site draft could not be generated. Your answers are saved; you can try again shortly.',
					generationNetwork:
						'Network error — your answers are saved; check the connection and try again.'
				}
			},
			tr: {
				title: 'Yeni site · saaskaya',
				description:
					'Birkaç soruya yanıt ver, saaskaya senin için doğrulanmış bir yapı üzerinden çok dilli bir web sitesi hazırlasın.',
				label: 'saaskaya.app / yeni site',
				home: 'Anasayfa',
				back: 'saaskaya',
				h1: 'Birkaç soru, bir site.',
				intro:
					'Üye olmadan da başlayabilirsin — sorulara yanıt ver, en sonda "Ücretsiz Başla" ile hesabını oluştur. Cevapların kaybolmaz.',
				flow: 'Rehberli akış',
				campaignLabel: 'Kampanya başlangıcı',
				campaignPrompt: 'Mesleğine özel site taslağı için geldin. Bu yoldan başla:',
				campaignCta: 'Bu taslağı başlat',
				professionHooks: {
					psych: {
						title: 'Psikolog sitesi taslağı',
						body: 'Yaklaşımını anlat; hesap oluşturmadan önce sakin ve güven veren ilk taslağı gör.'
					},
					law: {
						title: 'Avukat sitesi taslağı',
						body: 'Çalışma alanlarını anlat; ciddi ve bilgilendirici ilk taslağı hesap oluşturmadan gör.'
					},
					dental: {
						title: 'Diş kliniği sitesi taslağı',
						body: 'Kliniğini ve hizmetlerini anlat; teknik kurulum olmadan net bir ilk taslak gör.'
					},
					dietitian: {
						title: 'Diyetisyen sitesi taslağı',
						body: 'Beslenme yaklaşımını sonuç vaadine kaçmadan anlat; sade danışmanlık sitesi taslağı al.'
					},
					real_estate: {
						title: 'Emlak danışmanı sitesi taslağı',
						body: 'Bölgeni ve hizmetini anlat; portföy ve talepler için güven veren ilk taslağı gör.'
					},
					beauty: {
						title: 'Hizmet sitesi taslağı',
						body: 'Hizmetlerini ve randevu akışını anlat; talep toplamaya uygun temiz bir taslak gör.'
					}
				} as Record<string, { title: string; body: string }>,
				steps: [
					'birkaç soruya yanıt ver',
					'ücretsiz hesabını oluştur',
					'çok dilli içerik üretilsin',
					'doğrulanmış yapı ile önizle ve yayınla'
				],
				selectedKit: 'Seçili kit',
				kitNote:
					'Bu kit, yanıtlarınla birlikte ilk taslağı yönlendirir; AI yine sabit blok setinin dışına çıkamaz.',
				done: 'Cevapların tamam!',
				doneSignedOut: 'Hesabını oluşturunca sitenin oluşturulmaya hazır olacak.',
				doneSignedIn: 'Şimdi sitenin oluşturulabilir.',
				credits: [
					'Free hesapta en fazla 3 preview sitesi tutulabilir.',
					'Metin, tema ve görsel düzenlemeleri ücretsizdir.',
					'AI ile yaratıcı yeniden yazımlar ayrıca kredi kullanır.',
					'Üretim başarısız olursa cevapların kaybolmaz; tekrar deneyebilirsin.'
				],
				rawPlaceholder:
					"Örn: Ben Av. Zeynep Demir. İstanbul'da 12 yıldır aile hukuku ve boşanma davalarına bakıyorum. Ofisim Kadıköy'de…",
				rawCount: 'min. 30',
				send: 'Gönder',
				backToQuestions: 'Sorulara dön',
				visualDirection: 'Görsel yön',
				kit: 'Kit',
				continue: 'Devam et',
				addService: 'Bir hizmet yaz ve ekle…',
				add: 'Ekle',
				remove: 'Kaldır',
				answerPlaceholder: 'Yanıtını yaz…',
				skip: 'Boş geç',
				createSite: 'Siteni oluştur',
				startFree: 'Ücretsiz Başla',
				generating: 'Siten oluşturuluyor…',
				redirecting: 'Yönlendiriliyor…',
				rawToggle: 'Kendi cümlelerimle anlatmak istiyorum',
				stepWord: 'Adım',
				stepsDone: 'Tamamlandı',
				nicheDescriptions: {
					psych: 'Danışanlarına güven veren, sakin bir terapi sitesi',
					law: 'Büron için kurumsal ve ciddi bir vitrin',
					dental: 'Kliniğin için ferah ve modern bir site',
					dietitian: 'Beslenme danışmanlığı ve takip için uygulanabilir bir site',
					real_estate: 'Portföy ve alıcı/satıcı talepleri için güven veren bir site',
					beauty: 'Hizmetler ve randevu talepleri için net bir güzellik salonu sitesi',
					unsupported: 'Yanlış preset’e düşürmek yerine manuel beta incelemesi'
				} as Record<string, string>,
				unsupportedTitle: 'Bu alan manuel beta incelemesi gerektiriyor.',
				unsupportedBody:
					'Desteklenmeyen meslekleri avukat preset’ine eşlemiyoruz. Mesleğini bize gönder; beta kapsamına alınıp alınamayacağını inceleyelim.',
				unsupportedAction: 'Desteğe e-posta gönder',
				footer:
					'AI, sorulara verdiğin yanıtları doğrulanmış bir site yapısına dönüştürür — asla kod yazmaz. Sorular ücretsizdir; yalnızca site oluşturma aylık AI bütçeni kullanır.',
				stages: {
					prepare: 'Cevapların hazırlanıyor…',
					generate: 'AI doğrulanmış site taslağını oluşturuyor…',
					editor: 'Editör açılıyor…'
				},
				errors: {
					generic: 'Bir şeyler ters gitti.',
					network: 'Ağ hatası — lütfen tekrar dene.',
					generation:
						'Site taslağı oluşturulamadı. Cevapların duruyor; birazdan tekrar deneyebilirsin.',
					generationNetwork:
						'Ağ hatası — cevapların duruyor; bağlantıyı kontrol edip tekrar deneyebilirsin.'
				}
			},
			de: {
				title: 'Neue Website · saaskaya',
				description:
					'Beantworte einige Fragen und saaskaya erstellt eine mehrsprachige Website mit validierter Struktur.',
				label: 'saaskaya.app / neue website',
				home: 'Startseite',
				back: 'saaskaya',
				h1: 'Ein paar Fragen, eine Website.',
				intro:
					'Du kannst ohne Konto beginnen. Beantworte die Fragen und erstelle dein Konto im letzten Schritt. Deine Antworten bleiben erhalten.',
				flow: 'Geführter Ablauf',
				campaignLabel: 'Kampagnenstart',
				campaignPrompt:
					'Du bist für einen berufsspezifischen Entwurf hier. Starte mit diesem Pfad:',
				campaignCta: 'Diesen Entwurf starten',
				professionHooks: {
					psych: {
						title: 'Website-Entwurf für psychologische Praxis',
						body: 'Beschreibe deinen Ansatz und sieh vor der Kontoerstellung einen ruhigen, vertrauensvollen Entwurf.'
					},
					law: {
						title: 'Website-Entwurf für Kanzlei',
						body: 'Beschreibe deine Tätigkeitsfelder und sieh einen seriösen, informativen Entwurf.'
					},
					dental: {
						title: 'Website-Entwurf für Zahnarztpraxis',
						body: 'Beschreibe Praxis und Leistungen und prüfe einen klaren ersten Entwurf ohne Technikstress.'
					},
					dietitian: {
						title: 'Website-Entwurf für Ernährungsberatung',
						body: 'Beschreibe deine Beratung sachlich und ohne Ergebnisversprechen; erhalte einen klaren Entwurf.'
					},
					real_estate: {
						title: 'Website-Entwurf für Immobilienberatung',
						body: 'Beschreibe deinen Markt und deine Leistungen; erhalte einen vertrauensbildenden Entwurf.'
					},
					beauty: {
						title: 'Website-Entwurf für Dienstleistungen',
						body: 'Beschreibe Leistungen und Terminablauf; erhalte einen klaren Entwurf für Anfragen.'
					}
				} as Record<string, { title: string; body: string }>,
				steps: [
					'einige Fragen beantworten',
					'kostenloses Konto erstellen',
					'mehrsprachige Inhalte generieren',
					'mit validierter Struktur prüfen und veröffentlichen'
				],
				selectedKit: 'Ausgewähltes Kit',
				kitNote:
					'Dieses Kit steuert den ersten Entwurf zusammen mit deinen Antworten; AI bleibt im festen Block-Set.',
				done: 'Deine Antworten sind vollständig!',
				doneSignedOut: 'Erstelle dein Konto, dann kann die Website generiert werden.',
				doneSignedIn: 'Jetzt kann deine Website generiert werden.',
				credits: [
					'Free-Konten können bis zu 3 Vorschau-Websites behalten.',
					'Text-, Theme- und Bildänderungen sind kostenlos.',
					'Kreative AI-Umschreibungen nutzen zusätzliche Credits.',
					'Wenn die Generierung fehlschlägt, bleiben deine Antworten erhalten.'
				],
				rawPlaceholder:
					'Beispiel: Ich bin Dr. Ada Müller. Ich biete Online-Therapie für Erwachsene in Berlin...',
				rawCount: 'min. 30',
				send: 'Senden',
				backToQuestions: 'Zurück zu Fragen',
				visualDirection: 'Visuelle Richtung',
				kit: 'Kit',
				continue: 'Weiter',
				addService: 'Leistung schreiben und hinzufügen...',
				add: 'Hinzufügen',
				remove: 'Entfernen',
				answerPlaceholder: 'Antwort schreiben...',
				skip: 'Überspringen',
				createSite: 'Website generieren',
				startFree: 'Kostenlos starten',
				generating: 'Website wird generiert...',
				redirecting: 'Weiterleitung...',
				rawToggle: 'Ich möchte es in eigenen Worten beschreiben',
				stepWord: 'Schritt',
				stepsDone: 'Abgeschlossen',
				nicheDescriptions: {
					psych: 'Eine ruhige, vertrauensvolle Website für deine Praxis',
					law: 'Ein seriöser Auftritt für deine Kanzlei',
					dental: 'Eine frische, moderne Website für deine Klinik',
					dietitian: 'Eine praktische Website für Ernährungsberatung und Begleitung',
					real_estate: 'Eine vertrauensbildende Website für Immobilienanfragen',
					beauty: 'Eine terminorientierte Website für Beauty-Leistungen',
					unsupported: 'Manuelle Beta-Prüfung statt falschem Preset'
				} as Record<string, string>,
				unsupportedTitle: 'Dieses Feld benötigt eine manuelle Beta-Prüfung.',
				unsupportedBody:
					'Nicht unterstützte Berufe werden nicht auf das Anwalts-Preset abgebildet. Sende uns dein Feld, wir prüfen die Beta-Eignung.',
				unsupportedAction: 'Support mailen',
				footer:
					'AI verwandelt deine Antworten in eine validierte Website-Struktur. Fragen sind kostenlos; nur die Website-Generierung nutzt dein monatliches AI-Budget.',
				stages: {
					prepare: 'Antworten werden vorbereitet...',
					generate: 'AI generiert einen validierten Website-Entwurf...',
					editor: 'Editor wird geöffnet...'
				},
				errors: {
					generic: 'Etwas ist schiefgelaufen.',
					network: 'Netzwerkfehler — bitte erneut versuchen.',
					generation:
						'Der Website-Entwurf konnte nicht generiert werden. Deine Antworten sind gespeichert; du kannst es erneut versuchen.',
					generationNetwork:
						'Netzwerkfehler — deine Antworten sind gespeichert; prüfe die Verbindung und versuche es erneut.'
				}
			}
		}[locale]
	);

	let answers = $state<OnboardingAnswers>({});
	$effect(() => {
		// Resyncs from a fresh `load()` (e.g. the post-verify redirect back here) —
		// local optimistic updates below don't touch `data`, so no feedback loop.
		answers = data.pending?.answers ?? {};
	});
	let busy = $state(false);
	let errorMessage = $state('');
	let offTopicMessage = $state('');
	let generationStage = $state('');
	let useRaw = $state(false);
	let rawText = $state('');
	let promptSeedApplied = $state(false);

	// Per-question input buffers — reset whenever the active question changes.
	let textValue = $state('');
	let multiValue = $state<string[]>([]);
	let listItems = $state<string[]>([]);
	let listInput = $state('');

	let transcriptEl: HTMLDivElement | undefined = $state();

	function keepInputVisible(event: FocusEvent) {
		(event.currentTarget as HTMLElement | null)?.scrollIntoView({ block: 'center' });
	}

	$effect(() => {
		if (promptSeedApplied || typeof window === 'undefined') return;
		if (Object.keys(answers).length > 0) return;
		const seed = window.localStorage.getItem('saaskaya.promptSeed')?.trim();
		if (!seed) return;
		rawText = seed;
		useRaw = true;
		promptSeedApplied = true;
		window.localStorage.removeItem('saaskaya.promptSeed');
	});

	const hasRaw = $derived(
		typeof answers.rawDescription === 'string' &&
			(answers.rawDescription as string).trim().length >= 30
	);
	const unsupportedNiche = $derived(answers.niche === 'unsupported');
	const current = $derived<Question | undefined>(
		hasRaw || unsupportedNiche ? undefined : nextQuestion(answers)
	);
	const currentDisplay = $derived(current ? localizeQuestion(current, locale) : undefined);
	const answeredQuestions = $derived(ONBOARDING_QUESTIONS.filter((q) => q.id in answers));
	const directions = $derived(
		VISUAL_DIRECTIONS.map((direction) => localizeDirection(direction, locale))
	);
	const campaignHook = $derived(
		data.preselectedNiche ? copy.professionHooks[data.preselectedNiche] : null
	);

	// Keep the newest bubble in view — on phones the transcript is height-capped
	// and new content would otherwise appear below the fold.
	$effect(() => {
		void answeredQuestions.length;
		void busy;
		void offTopicMessage;
		void errorMessage;
		if (!transcriptEl) return;
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		transcriptEl.scrollTo({
			top: transcriptEl.scrollHeight,
			behavior: smooth ? 'smooth' : 'auto'
		});
	});

	// Progress: "Adım X / Y" + bar. Totals adapt as showWhen questions appear.
	const visibleNow = $derived(visibleQuestions(answers));
	const totalSteps = $derived(visibleNow.length);
	const answeredCount = $derived(visibleNow.filter((q) => q.id in answers).length);
	const flowComplete = $derived(!unsupportedNiche && (hasRaw || !current));
	const stepNumber = $derived(Math.min(answeredCount + 1, totalSteps));
	const progressPct = $derived(
		flowComplete ? 100 : Math.round((answeredCount / Math.max(totalSteps, 1)) * 100)
	);

	// Inline stroke icons (leaf / scales / tooth) — no emoji-font dependency.
	const nicheIconPaths: Record<string, string> = {
		psych: 'M5 21c0-9.5 4.5-14.5 14-16-.8 9.5-5.5 14.2-14 16ZM5 21c3.5-5.5 7.5-9 12-11',
		law: 'M12 3v18M4 7h16M6.5 7l-3.5 6.5a3.8 3.8 0 0 0 7 0L6.5 7ZM17.5 7 14 13.5a3.8 3.8 0 0 0 7 0L17.5 7ZM8 21h8',
		dental:
			'M12 5.5C10.5 4 8.8 3 7.2 3 4.7 3 3 5 3 7.5c0 4 2 6.6 3 10.1.4 1.4 1 2.4 2 2.4s1.4-1 1.6-2.4c.3-1.9.7-3.1 2.4-3.1s2.1 1.2 2.4 3.1c.2 1.4.6 2.4 1.6 2.4s1.6-1 2-2.4c1-3.5 3-6.1 3-10.1C21 5 19.3 3 16.8 3c-1.6 0-3.3 1-4.8 2.5Z',
		dietitian:
			'M12 21c-3.8-2.6-6-5.8-6-9.5C6 7.9 8.3 5 12 5s6 2.9 6 6.5c0 3.7-2.2 6.9-6 9.5ZM12 5V3M8 8c2.8 0 5.2 2 5.8 4.8',
		real_estate: 'M3 11l9-7 9 7M5 10.5V21h14V10.5M9 21v-6h6v6',
		beauty:
			'M12 3c1.6 3 3.8 5.2 7 6-3.2.8-5.4 3-7 6-1.6-3-3.8-5.2-7-6 3.2-.8 5.4-3 7-6ZM6 15c.7 1.4 1.7 2.4 3 3-1.3.6-2.3 1.6-3 3-.7-1.4-1.7-2.4-3-3 1.3-.6 2.3-1.6 3-3Z',
		unsupported:
			'M12 3l7 4v5c0 4.2-2.8 7.8-7 9-4.2-1.2-7-4.8-7-9V7l7-4ZM9.5 9.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 17h.01'
	};

	$effect(() => {
		current;
		textValue = '';
		multiValue = [];
		listItems = [];
		listInput = '';
		offTopicMessage = '';
	});

	// Chat-style pacing: the next question (or a rejection) waits for at least a
	// natural "typing" delay after the answer is known, so the AI doesn't feel
	// instantaneous. Real network errors (caught below) skip this — a broken
	// connection isn't "the AI thinking," delaying that message only frustrates.
	let reducedMotion = $state(false);
	$effect(() => {
		reducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	});

	function pacedDelay(startedAt: number): Promise<void> {
		if (reducedMotion) return Promise.resolve();
		const minDelayMs = 600 + Math.random() * 600;
		const remaining = minDelayMs - (Date.now() - startedAt);
		return remaining > 0
			? new Promise((resolve) => setTimeout(resolve, remaining))
			: Promise.resolve();
	}

	function formatAnswer(q: Question, value: unknown): string {
		if (q.kind === 'choice')
			return q.options?.find((o) => o.value === value)?.label ?? String(value);
		if (q.kind === 'multi_choice') {
			const values = Array.isArray(value) ? value : [];
			return values.map((v) => q.options?.find((o) => o.value === v)?.label ?? v).join(', ');
		}
		if (q.kind === 'list_text')
			return Array.isArray(value) ? value.join(', ') : String(value ?? '');
		const text = String(value ?? '').trim();
		return text || '(boş geçildi)';
	}

	async function submitAnswer(questionId: string, value: unknown) {
		if (busy) return;
		busy = true;
		errorMessage = '';
		offTopicMessage = '';
		generationStage = '';
		const startedAt = Date.now();
		try {
			const res = await fetch('/api/onboarding/answer', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ questionId, value, source: data.campaignSource ?? undefined })
			});
			const resData = await res.json();
			if (!res.ok || !resData.ok) {
				await pacedDelay(startedAt);
				if (resData.kind === 'off_topic') {
					offTopicMessage = resData.message;
				} else {
					errorMessage = resData.message ?? copy.errors.generic;
				}
				return;
			}
			// The answer bubble commits immediately (it's the user's own already-known
			// text); the next question stays hidden behind the typing indicator
			// (`{#if ... && !busy}` below) until pacedDelay clears.
			answers = { ...answers, [questionId]: value };
			if (questionId === 'rawDescription') useRaw = false;
			await pacedDelay(startedAt);
		} catch {
			errorMessage = copy.errors.network;
		} finally {
			busy = false;
		}
	}

	function toggleMulti(value: string) {
		multiValue = multiValue.includes(value)
			? multiValue.filter((v) => v !== value)
			: [...multiValue, value];
	}

	function addListItem() {
		const value = listInput.trim();
		if (!value || listItems.length >= 8 || listItems.includes(value)) return;
		listItems = [...listItems, value];
		listInput = '';
	}

	function removeListItem(value: string) {
		listItems = listItems.filter((v) => v !== value);
	}

	async function readApiResponse(res: Response) {
		const text = await res.text();
		if (!text) return {};
		try {
			return JSON.parse(text);
		} catch {
			return {
				ok: false,
				message:
					res.status >= 500
						? `${copy.errors.generation} HTTP ${res.status}.`
						: `${copy.errors.generic} HTTP ${res.status}.`
			};
		}
	}

	async function completeFlow() {
		if (!data.user) {
			await goto(l('/login'));
			return;
		}
		busy = true;
		errorMessage = '';
		generationStage = copy.stages.prepare;
		try {
			const finishRes = await fetch('/api/onboarding/finish', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ kitSlug: data.selectedKit?.slug })
			});
			const finishData = await readApiResponse(finishRes);
			if (!finishRes.ok || !finishData.ok) {
				errorMessage = finishData.message ?? copy.errors.generic;
				return;
			}
			generationStage = copy.stages.generate;
			const genRes = await fetch('/api/sites', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					description: finishData.description,
					onboardingPendingId: finishData.pendingId
				})
			});
			const genData = await readApiResponse(genRes);
			if (!genRes.ok || !genData.ok) {
				const message = genData.message ?? copy.errors.generation;
				const reference =
					genData.errorId && !message.includes(genData.errorId)
						? ` Referans: ${genData.errorId}`
						: '';
				errorMessage = `${message}${reference}`;
				return;
			}
			generationStage = copy.stages.editor;
			await goto(`/editor/${genData.id}?onboarding=${finishData.pendingId}`);
		} catch {
			errorMessage = copy.errors.generationNetwork;
		} finally {
			busy = false;
			generationStage = '';
		}
	}
</script>

<svelte:head>
	<title>{copy.title}</title>
	<meta name="description" content={copy.description} />
</svelte:head>

<AppCanvasShell label={copy.label}>
	{#snippet right()}
		<a href={l('/')} class="sk-btn sk-btn-secondary sk-btn-sm">{copy.home}</a>
		<LanguageSwitcher {locale} variant="dropdown" />
	{/snippet}

	<div class="mx-auto flex w-full max-w-2xl flex-col gap-5 sm:gap-8">
		<div class="pt-2">
			<a
				href={l('/')}
				class="sk-link inline-flex items-center gap-1.5 text-sm text-[var(--sk-faint)]"
				>{@html uiIcons.arrowLeft(14)}{copy.back}</a
			>
			<h1 class="sk-display mt-3 text-4xl leading-none sm:text-[42px]">{copy.h1}</h1>
			<p class="mt-3 text-[15px] leading-6 text-[var(--sk-muted)]">
				{copy.intro}
			</p>
			<div class="sk-soft mt-6 p-4">
				<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.flow}</div>
				<div class="mt-3 flex flex-col gap-2 text-sm text-[var(--sk-muted)]">
					{#each copy.steps as step, i (step)}
						<div>{String(i + 1).padStart(2, '0')} · {step}</div>
					{/each}
				</div>
			</div>
			{#if campaignHook && !answers.niche}
				<div class="sk-card mt-4 p-4">
					<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.campaignLabel}</div>
					<h2 class="mt-1 text-base font-semibold text-[var(--sk-ink)]">
						{campaignHook.title}
					</h2>
					<p class="mt-1 text-xs leading-5 text-[var(--sk-muted)]">
						{campaignHook.body}
					</p>
					<p class="mt-3 text-[11px] leading-4 text-[var(--sk-faint)]">
						{copy.campaignPrompt}
					</p>
					<button
						type="button"
						class="sk-btn sk-btn-primary sk-btn-sm mt-3"
						disabled={busy}
						onclick={() => submitAnswer('niche', data.preselectedNiche)}
					>
						{copy.campaignCta}
						{@html uiIcons.arrowRight(14)}
					</button>
				</div>
			{/if}
			{#if data.selectedKit}
				<div class="sk-card mt-4 p-4">
					<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.selectedKit}</div>
					<div class="mt-1 text-sm font-semibold text-[var(--sk-ink)]">
						{data.selectedKit.label}
					</div>
					<p class="mt-1 text-xs leading-5 text-[var(--sk-muted)]">
						{data.selectedKit.outcome}
					</p>
					<p class="mt-2 text-[11px] leading-4 text-[var(--sk-faint)]">
						{copy.kitNote}
					</p>
				</div>
			{/if}
		</div>

		<AppCard class="flex flex-col gap-3 p-4 sm:p-8">
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between">
					<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">
						{flowComplete || unsupportedNiche
							? copy.stepsDone
							: `${copy.stepWord} ${stepNumber} / ${totalSteps}`}
					</span>
					<span class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{progressPct}%</span>
				</div>
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-[#171614]/10">
					<div
						class="h-full rounded-full bg-[var(--sk-ink)] transition-all duration-300"
						style="width: {progressPct}%"
					></div>
				</div>
			</div>

			<div
				bind:this={transcriptEl}
				class="flex max-h-[min(28rem,55dvh)] min-h-32 flex-1 flex-col gap-2 overflow-y-auto"
			>
				{#each answeredQuestions as q (q.id)}
					{@const displayedQuestion = localizeQuestion(q, locale)}
					<ChatBubble role="assistant">{displayedQuestion.prompt}</ChatBubble>
					<ChatBubble role="user">{formatAnswer(displayedQuestion, answers[q.id])}</ChatBubble>
				{/each}

				{#if currentDisplay && !useRaw && !busy}
					<ChatBubble role="assistant">
						{currentDisplay.prompt}
						{#if currentDisplay.helper}
							<div class="mt-1 text-xs text-[var(--sk-faint)]">{currentDisplay.helper}</div>
						{/if}
					</ChatBubble>
				{:else if unsupportedNiche && !busy}
					<ChatBubble role="assistant">
						{copy.unsupportedTitle}
						<div
							class="mt-3 border-t border-[rgba(23,22,20,.08)] pt-3 text-xs leading-5 text-[var(--sk-muted)]"
						>
							{copy.unsupportedBody}
						</div>
					</ChatBubble>
				{:else if !current && !busy}
					<ChatBubble role="assistant">
						{copy.done}
						{#if !data.user}{copy.doneSignedOut}{:else}{copy.doneSignedIn}{/if}
						<div
							class="mt-3 border-t border-[rgba(23,22,20,.08)] pt-3 text-xs leading-5 text-[var(--sk-muted)]"
						>
							{#each copy.credits as credit (credit)}
								<div>• {credit}</div>
							{/each}
						</div>
					</ChatBubble>
				{/if}

				{#if offTopicMessage}
					<ChatBubble role="assistant">{offTopicMessage}</ChatBubble>
				{/if}

				{#if errorMessage}
					<ChatBubble role="error">{errorMessage}</ChatBubble>
				{/if}

				{#if busy}
					<TypingIndicator label={generationStage} />
				{/if}
			</div>

			{#if useRaw}
				<div class="flex flex-col gap-2">
					<div class="relative">
						<textarea
							class="sk-textarea min-h-40 text-base sm:text-[14.5px]"
							rows="7"
							placeholder={copy.rawPlaceholder}
							bind:value={rawText}
							onfocus={keepInputVisible}
							disabled={busy}></textarea>
						<div
							class="absolute right-4 bottom-3 font-[var(--font-mono)] text-[10.5px] text-[var(--sk-faint)]"
						>
							{rawText.trim().length} / {copy.rawCount}
						</div>
					</div>
					<div class="flex flex-wrap gap-2">
						<button
							type="button"
							class="sk-btn sk-btn-primary sk-btn-sm"
							disabled={busy || rawText.trim().length < 30}
							onclick={() => submitAnswer('rawDescription', rawText)}
						>
							{copy.send}
						</button>
						<button
							type="button"
							class="sk-btn sk-btn-ghost sk-btn-sm"
							disabled={busy}
							onclick={() => (useRaw = false)}
						>
							{@html uiIcons.arrowLeft(14)}
							{copy.backToQuestions}
						</button>
					</div>
				</div>
			{:else if current?.id === 'visualDirection'}
				<div class="grid gap-2 sm:grid-cols-3">
					{#each directions as direction (direction.id)}
						<button
							type="button"
							class="sk-card flex h-full flex-col items-start gap-2 p-4 text-left transition hover:-translate-y-0.5 hover:border-[rgba(23,22,20,.28)]"
							disabled={busy}
							onclick={() => submitAnswer(current!.id, direction.id)}
						>
							<span class="sk-mono text-[10px] text-[var(--sk-faint)]">{copy.visualDirection}</span>
							<span class="text-sm font-semibold text-[var(--sk-ink)]">{direction.label}</span>
							<span class="text-xs leading-5 text-[var(--sk-muted)]">{direction.preview}</span>
							{#if direction.kit}
								<span
									class="rounded-full bg-[rgba(47,111,106,.1)] px-2 py-1 text-[10.5px] text-[#2f6f6a]"
								>
									{copy.kit} · {direction.kit.label}
								</span>
								<span class="text-[11px] leading-4 text-[var(--sk-muted)]">
									{direction.kit.outcome}
								</span>
							{/if}
							<span class="mt-auto text-[11px] leading-4 text-[var(--sk-faint)]">
								{direction.promise}
							</span>
						</button>
					{/each}
				</div>
			{:else if current?.id === 'niche'}
				<div class="grid gap-2 sm:grid-cols-3">
					{#each currentDisplay?.options ?? [] as option (option.value)}
						<button
							type="button"
							class="sk-card flex h-full flex-col items-start gap-1.5 p-4 text-left transition hover:-translate-y-0.5 hover:border-[rgba(23,22,20,.28)]"
							disabled={busy}
							onclick={() => submitAnswer(current!.id, option.value)}
						>
							<svg
								class="size-6 text-[var(--sk-ink)]"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path
									d={nicheIconPaths[option.value] ??
										'M12 3l2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z'}
								/>
							</svg>
							<span class="text-sm font-semibold text-[var(--sk-ink)]">{option.label}</span>
							<span class="text-xs leading-5 text-[var(--sk-muted)]">
								{copy.nicheDescriptions[option.value] ?? ''}
							</span>
						</button>
					{/each}
				</div>
			{:else if current?.kind === 'choice'}
				<div class="flex flex-wrap gap-2">
					{#each currentDisplay?.options ?? [] as option (option.value)}
						<button
							type="button"
							class="sk-btn sk-btn-secondary sk-btn-sm"
							disabled={busy}
							onclick={() => submitAnswer(current!.id, option.value)}
						>
							{option.label}
						</button>
					{/each}
				</div>
			{:else if current?.kind === 'multi_choice'}
				<div class="flex flex-col gap-2">
					<div class="flex flex-wrap gap-2">
						{#each currentDisplay?.options ?? [] as option (option.value)}
							<button
								type="button"
								class="sk-btn sk-btn-sm {multiValue.includes(option.value)
									? 'sk-btn-primary'
									: 'sk-btn-secondary'}"
								disabled={busy}
								onclick={() => toggleMulti(option.value)}
							>
								{option.label}
							</button>
						{/each}
					</div>
					<button
						type="button"
						class="sk-btn sk-btn-primary sk-btn-sm w-fit"
						disabled={busy || multiValue.length === 0}
						onclick={() => submitAnswer(current!.id, multiValue)}
					>
						{copy.continue}
					</button>
				</div>
			{:else if current?.kind === 'list_text'}
				<div class="flex flex-col gap-2">
					{#if listItems.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each listItems as item (item)}
								<span class="sk-pill">
									{item}
									<button
										type="button"
										class="ml-0.5 inline-flex size-7 items-center justify-center rounded-full opacity-60 hover:opacity-100"
										aria-label="{copy.remove}: {item}"
										onclick={() => removeListItem(item)}>×</button
									>
								</span>
							{/each}
						</div>
					{/if}
					<form
						class="flex gap-2"
						onsubmit={(e) => {
							e.preventDefault();
							addListItem();
						}}
					>
						<input
							type="text"
							class="sk-input min-h-9 flex-1 py-1.5 text-base sm:text-sm"
							placeholder={copy.addService}
							bind:value={listInput}
							onfocus={keepInputVisible}
							disabled={busy || listItems.length >= 8}
						/>
						<button
							type="submit"
							class="sk-btn sk-btn-secondary sk-btn-sm"
							disabled={busy || !listInput.trim() || listItems.length >= 8}
						>
							{copy.add}
						</button>
					</form>
					<button
						type="button"
						class="sk-btn sk-btn-primary sk-btn-sm w-fit"
						disabled={busy || listItems.length === 0}
						onclick={() => submitAnswer(current!.id, listItems)}
					>
						{copy.continue}
					</button>
				</div>
			{:else if current?.kind === 'short_text' || current?.kind === 'open_text'}
				<form
					class="flex gap-2"
					onsubmit={(e) => {
						e.preventDefault();
						submitAnswer(current!.id, textValue);
					}}
				>
					{#if current.kind === 'open_text'}
						<textarea
							class="sk-textarea min-h-20 flex-1 py-1.5 text-base sm:text-sm"
							placeholder={copy.answerPlaceholder}
							bind:value={textValue}
							onfocus={keepInputVisible}
							disabled={busy}></textarea>
					{:else}
						<input
							type="text"
							class="sk-input min-h-9 flex-1 py-1.5 text-base sm:text-sm"
							placeholder={copy.answerPlaceholder}
							bind:value={textValue}
							onfocus={keepInputVisible}
							disabled={busy}
						/>
					{/if}
					<button
						type="submit"
						class="sk-btn sk-btn-primary sk-btn-sm"
						disabled={busy || (current.required && !textValue.trim())}
					>
						{copy.send}
					</button>
				</form>
				{#if !current.required}
					<button
						type="button"
						class="sk-btn sk-btn-ghost sk-btn-sm w-fit"
						disabled={busy}
						onclick={() => submitAnswer(current!.id, '')}
					>
						{copy.skip}
					</button>
				{/if}
			{:else if unsupportedNiche}
				<a href="mailto:support@saaskaya.com" class="sk-btn sk-btn-secondary sk-btn-lg w-full">
					{copy.unsupportedAction}
				</a>
			{:else if !current}
				<button
					type="button"
					class="sk-btn sk-btn-primary sk-btn-lg w-full"
					disabled={busy}
					onclick={completeFlow}
				>
					{#if busy}
						<span class="loading loading-spinner loading-sm"></span>
						{generationStage || (data.user ? copy.generating : copy.redirecting)}
					{:else if data.user}
						{copy.createSite}
					{:else}
						{copy.startFree}
					{/if}
				</button>
			{/if}

			{#if !useRaw && current}
				<button
					type="button"
					class="sk-btn sk-btn-ghost sk-btn-sm w-fit"
					disabled={busy}
					onclick={() => (useRaw = true)}
				>
					{copy.rawToggle}
					{@html uiIcons.arrowRight(14)}
				</button>
			{/if}

			<p class="text-xs leading-5 text-[var(--sk-faint)]">
				{copy.footer}
			</p>
		</AppCard>
	</div>
</AppCanvasShell>
