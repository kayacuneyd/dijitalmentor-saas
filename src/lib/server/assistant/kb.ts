import type { Locale } from '$lib/i18n';

export type AssistantAction =
	| 'start_onboarding'
	| 'show_pricing'
	| 'show_domain_info'
	| 'contact_support'
	| 'login_required'
	| 'open_dashboard'
	| 'open_legal'
	| 'answer'
	| 'fallback';

export type KbEntry = {
	intent: string;
	action: AssistantAction;
	keywords: Record<Locale, string[]>;
	reply: Record<Locale, string>;
	href?: string;
};

export type AssistantReply = {
	intent: string;
	action: AssistantAction;
	reply: string;
	href?: string;
	prefill?: string;
};

export type AssistantClassifyOptions = {
	authHref?: string;
};

// Ordered — first match wins. Informational intents must stay above the greedy
// start_onboarding entry (which also catches any message of 28+ characters).
export const KB: KbEntry[] = [
	{
		intent: 'show_pricing',
		action: 'show_pricing',
		href: '/pricing',
		keywords: {
			tr: ['fiyat', 'ücret', 'plan', 'abonelik', '17€', '17 euro'],
			en: ['pricing', 'price', 'subscription', 'how much'],
			de: ['kosten', 'preis', 'abo', 'wie viel']
		},
		reply: {
			tr: 'Free ile deneyebilirsin. Aylık Pro 17€/ay; yönetilen .com alan adı eklenirse yıllık toplam 219€ olur. Yıllık Pro 200€/yıl ve .com alan adı dahildir. Fiyat sayfasını açıyorum.',
			en: 'You can try Free first. Monthly Pro is 17€/month; with the managed .com domain service it totals 219€/year. Yearly Pro is 200€/year with the .com domain included. I am opening pricing.',
			de: 'Du kannst zuerst Free testen. Pro monatlich kostet 17€/Monat; mit verwalteter .com Domain sind es 219€/Jahr. Pro jährlich kostet 200€/Jahr inklusive .com Domain. Ich öffne die Preisseite.'
		}
	},
	{
		intent: 'what_is_saaskaya',
		action: 'answer',
		keywords: {
			tr: ['saaskaya nedir', 'nedir bu', 'ne işe yarar', 'hakkında bilgi', 'kimsiniz'],
			en: ['what is saaskaya', 'about saaskaya', 'who are you', 'what does saaskaya'],
			de: ['was ist saaskaya', 'worum geht', 'wer seid ihr']
		},
		reply: {
			tr: 'saaskaya, mesleğini kısaca anlattığında yapay zekânın senin için çok dilli bir web sitesi hazırladığı bir platform. Kod veya tasarım bilgisi gerekmez; siteni önizler, düzenler ve kendi adresinde yayınlarsın.',
			en: 'saaskaya is a platform where you describe your work and AI builds a multilingual website for you. No code or design skills needed — you preview it, edit the copy, and publish it on your own address.',
			de: 'saaskaya ist eine Plattform: Du beschreibst kurz deine Arbeit, und die KI erstellt eine mehrsprachige Website für dich. Kein Code nötig — du schaust sie an, passt Texte an und veröffentlichst sie unter eigener Adresse.'
		}
	},
	{
		intent: 'how_it_works',
		action: 'answer',
		keywords: {
			tr: ['nasıl çalış', 'süreç nasıl', 'adımlar neler'],
			en: ['how does', 'how it works', 'how do you'],
			de: ['wie funktioniert', 'wie läuft']
		},
		reply: {
			tr: 'Şöyle çalışıyor: kendini kısaca anlatırsın → yapay zekâ siteni hazırlar → mobil, tablet ve masaüstü önizlemede görürsün → metinleri düzenlersin → tek tıkla yayınlarsın. İstersen hemen deneyebilirsin.',
			en: 'It works like this: you describe yourself briefly → AI generates your site → you see it in mobile, tablet, and desktop preview → you edit the copy → you publish with one click. You can try it right away.',
			de: 'So funktioniert es: Du beschreibst dich kurz → die KI erstellt deine Website → du siehst sie in Mobil-, Tablet- und Desktop-Vorschau → du passt die Texte an → du veröffentlichst mit einem Klick.'
		}
	},
	{
		intent: 'supported_languages',
		action: 'answer',
		keywords: {
			tr: ['hangi dil', 'dil destek', 'diller', 'çok dilli', 'türkçe', 'ingilizce', 'almanca'],
			en: ['language', 'multilingual', 'english'],
			de: ['sprache', 'mehrsprachig', 'deutsch', 'türkisch']
		},
		reply: {
			tr: 'Hem panel hem de ürettiğimiz siteler çok dilli: Türkçe, İngilizce ve Almanca destekleniyor. Sitenin dillerini kurulum sırasında seçersin.',
			en: 'Both the app and the sites we generate are multilingual: Turkish, English, and German are supported. You pick your site languages during setup.',
			de: 'Sowohl die Oberfläche als auch die erstellten Websites sind mehrsprachig: Türkisch, Englisch und Deutsch. Die Sprachen wählst du beim Einrichten.'
		}
	},
	{
		intent: 'beta_status',
		action: 'answer',
		href: '/beta',
		keywords: {
			tr: ['beta', 'davet', 'erken erişim'],
			en: ['invite', 'early access'],
			de: ['einladung']
		},
		reply: {
			tr: 'saaskaya şu an kapalı betada; erişim davet koduyla. Beta sayfasını açıyorum, oradan davet talep edebilirsin.',
			en: 'saaskaya is currently in closed beta; access is invite-based. I am opening the beta page where you can request an invite.',
			de: 'saaskaya ist derzeit in einer geschlossenen Beta; der Zugang läuft über Einladungen. Ich öffne die Beta-Seite, dort kannst du eine Einladung anfragen.'
		}
	},
	{
		intent: 'editing_media',
		action: 'answer',
		keywords: {
			tr: ['görsel', 'resim', 'foto', 'logo', 'medya', 'yükle'],
			en: ['image', 'photo', 'upload'],
			de: ['bilder', 'hochladen']
		},
		reply: {
			tr: 'Site hazırlandıktan sonra editörden tüm metinleri düzenleyebilir, kendi görsellerini ve logonu yükleyebilirsin. Değişiklikleri üç ekran boyutunda anında önizlersin.',
			en: 'After your site is generated you can edit all the copy in the editor and upload your own images and logo. Changes preview instantly in three screen sizes.',
			de: 'Nach der Erstellung kannst du im Editor alle Texte anpassen und eigene Bilder sowie dein Logo hochladen. Änderungen siehst du sofort in drei Bildschirmgrößen.'
		}
	},
	{
		intent: 'publishing',
		action: 'answer',
		keywords: {
			tr: ['yayın', 'canlıya'],
			en: ['publish', 'go live'],
			de: ['veröffentlich', 'online stellen']
		},
		reply: {
			tr: 'Siten hazır olduğunda tek tıkla yayınlarsın; önce saaskaya.com altında bir önizleme adresi alır, Pro planda kendi domainine taşıyabilirsin.',
			en: 'When your site is ready you publish it with one click; it goes live on a saaskaya.com preview address first, and on Pro you can move it to your own domain.',
			de: 'Wenn deine Website fertig ist, veröffentlichst du sie mit einem Klick; zunächst unter einer saaskaya.com-Adresse, im Pro-Plan mit eigener Domain.'
		}
	},
	{
		intent: 'show_domain_info',
		action: 'show_domain_info',
		href: '/pricing',
		keywords: {
			tr: ['alan adı', 'özel alan'],
			en: ['domain', 'hosting', 'tls', 'subdomain', 'dns'],
			de: []
		},
		reply: {
			tr: 'Özel domain Pro akışında ele alınır. Yıllık Pro’da standart .com dahildir; Aylık Pro’da .com alan adı hizmeti 15€/yıl eklenir. SSL, DNS, hosting bağlantısı ve e-posta yönlendirme kurulumu yönetilir.',
			en: 'Custom domains are handled in the Pro flow. Yearly Pro includes a standard .com; Monthly Pro can add the managed .com service for 15€/year. SSL, DNS, hosting connection, and email forwarding setup are managed.',
			de: 'Eigene Domains laufen über Pro. Pro jährlich enthält eine standard .com; Pro monatlich kann die verwaltete .com für 15€/Jahr hinzufügen. SSL, DNS, Hosting-Verbindung und E-Mail-Weiterleitung werden verwaltet.'
		}
	},
	{
		intent: 'open_legal',
		action: 'open_legal',
		href: '/legal/privacy',
		keywords: {
			tr: ['kvkk', 'gizlilik', 'şart', 'yasal'],
			en: ['privacy', 'terms', 'legal'],
			de: ['datenschutz', 'bedingungen']
		},
		reply: {
			tr: 'Bunu yasal dokümanlarda daha net görebilirsin. İlgili sayfayı açıyorum.',
			en: 'You can find this in the legal documents. I am opening the relevant page.',
			de: 'Das findest du in den rechtlichen Dokumenten. Ich öffne die passende Seite.'
		}
	},
	{
		intent: 'contact_support',
		action: 'contact_support',
		keywords: {
			tr: ['destek', 'yardım', 'iletişim', 'hata', 'sorun'],
			en: ['support', 'contact', 'bug'],
			de: ['hilfe', 'kontakt']
		},
		reply: {
			tr: 'Bunu destek mesajı olarak alabilirim. Kısa bilgilerini yaz, ekip e-posta ile döner.',
			en: 'I can take this as a support message. Add your details and we will reply by email.',
			de: 'Ich kann das als Support-Nachricht aufnehmen. Ergänze kurz deine Daten; wir antworten per E-Mail.'
		}
	},
	{
		intent: 'edit_site',
		action: 'open_dashboard',
		href: '/dashboard',
		keywords: {
			tr: ['düzenle', 'değiştir', 'panel', 'sitem', 'websiteimi'],
			en: ['edit', 'editor', 'dashboard'],
			de: ['bearbeiten']
		},
		reply: {
			tr: 'Hesabındaki siteler için paneli açıyorum.',
			en: 'I am opening your dashboard for your sites.',
			de: 'Ich öffne dein Dashboard für deine Websites.'
		}
	},
	{
		intent: 'account_login',
		action: 'answer',
		href: '/login',
		keywords: {
			tr: ['giriş', 'oturum', 'şifre', 'kayıt ol', 'üye ol', 'hesap', 'hesab'],
			en: ['login', 'log in', 'sign in', 'sign up', 'magic link', 'register', 'account'],
			de: ['anmelden', 'einloggen', 'passwort', 'registrieren', 'konto']
		},
		reply: {
			tr: 'Giriş şifresiz çalışır: e-posta adresine tek kullanımlık bir bağlantı (magic link) göndeririz. Giriş ekranını açıyorum.',
			en: 'Sign-in is passwordless: we email you a one-time magic link. I am opening the sign-in screen.',
			de: 'Die Anmeldung ist passwortlos: Wir senden dir einen einmaligen Magic-Link per E-Mail. Ich öffne den Login.'
		}
	},
	{
		intent: 'start_onboarding',
		action: 'start_onboarding',
		href: '/new',
		keywords: {
			tr: [
				'site',
				'web sitesi',
				'oluştur',
				'kur',
				'başla',
				'psikolog',
				'avukat',
				'diyetisyen',
				'emlak',
				'güzellik'
			],
			en: ['website'],
			de: ['therapie', 'praxis']
		},
		reply: {
			tr: 'Bunu site başlangıcı olarak kullanabilirim. Seni kısa site oluşturma akışına götürüyorum.',
			en: 'I can use this as your website brief. I am opening the guided site creation flow.',
			de: 'Ich kann das als Website-Briefing nutzen. Ich öffne den geführten Website-Start.'
		}
	}
];

// Not part of the ordered KB: chosen instead of edit_site when the visitor is
// signed out, since the dashboard requires a session.
const LOGIN_REQUIRED: Pick<KbEntry, 'reply' | 'href'> = {
	href: '/login',
	reply: {
		tr: 'Site düzenlemek için önce giriş yapmalısın. Giriş ekranını açıyorum.',
		en: 'You need to sign in before editing a site. I am opening the sign-in screen.',
		de: 'Zum Bearbeiten einer Website musst du dich zuerst anmelden. Ich öffne den Login.'
	}
};

const FALLBACK: Pick<KbEntry, 'reply'> = {
	reply: {
		tr: 'Site oluşturma, fiyat, domain, beta, giriş veya saaskaya hakkında genel soruları yanıtlayabilirim. Ne yapmak istediğini biraz daha net yaz.',
		en: 'I can help with creating a site, pricing, domains, the beta, signing in, or general questions about saaskaya. Tell me a little more clearly what you want to do.',
		de: 'Ich kann beim Erstellen einer Website, Preisen, Domains, der Beta, dem Login oder allgemeinen Fragen zu saaskaya helfen. Beschreibe kurz genauer, was du tun möchtest.'
	}
};

// Any message this long is treated as a website brief (start_onboarding), the
// same heuristic the endpoint used before the KB extraction.
const ONBOARDING_MIN_LENGTH = 28;

function entryKeywords(entry: KbEntry): string[] {
	return [...entry.keywords.tr, ...entry.keywords.en, ...entry.keywords.de];
}

// Match against both Turkish-locale and default lowercasing so uppercase
// Turkish (FİYAT → fiyat) and uppercase English (What Is → what is, where
// tr-TR lowercasing would produce "ıs") both hit the lowercase keyword lists.
function matchesAny(variants: string[], words: string[]): boolean {
	return words.some((word) => variants.some((text) => text.includes(word)));
}

export function classify(
	message: string,
	locale: Locale,
	signedIn: boolean,
	options: AssistantClassifyOptions = {}
): AssistantReply {
	const variants = [message.toLocaleLowerCase('tr-TR'), message.toLowerCase()];
	const authHref = options.authHref || LOGIN_REQUIRED.href;
	for (const entry of KB) {
		if (!matchesAny(variants, entryKeywords(entry))) continue;
		if (entry.intent === 'edit_site' && !signedIn) {
			return {
				intent: entry.intent,
				action: 'login_required',
				reply: LOGIN_REQUIRED.reply[locale],
				href: authHref
			};
		}
		return {
			intent: entry.intent,
			action: entry.action,
			reply: entry.reply[locale],
			href: entry.intent === 'account_login' && !signedIn ? authHref : entry.href
		};
	}
	const onboarding = KB.find((entry) => entry.intent === 'start_onboarding');
	if (onboarding && message.trim().length >= ONBOARDING_MIN_LENGTH) {
		return {
			intent: onboarding.intent,
			action: onboarding.action,
			reply: onboarding.reply[locale],
			href: onboarding.href
		};
	}
	return { intent: 'fallback', action: 'fallback', reply: FALLBACK.reply[locale] };
}
