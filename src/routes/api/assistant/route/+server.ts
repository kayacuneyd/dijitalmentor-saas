import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { rateLimit } from '$lib/server/auth';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	message: z.string().trim().min(1).max(1200),
	currentPath: z.string().trim().max(240).optional(),
	locale: z.enum(['tr', 'en', 'de']).default('tr')
});

type AssistantAction =
	| 'start_onboarding'
	| 'show_pricing'
	| 'show_domain_info'
	| 'contact_support'
	| 'login_required'
	| 'open_dashboard'
	| 'open_legal'
	| 'fallback';

type Locale = z.infer<typeof bodySchema>['locale'];

function includesAny(text: string, words: string[]): boolean {
	return words.some((word) => text.includes(word));
}

function localized(locale: Locale) {
	return {
		tr: {
			start:
				'Bunu site başlangıcı olarak kullanabilirim. Seni kısa site oluşturma akışına götürüyorum.',
			pricing:
				'Free ile deneyebilirsin; Pro site başına 17€/ay. Detayları fiyat sayfasında açıyorum.',
			domain:
				'Özel domain Pro akışında ele alınır. Tescil yalnızca ödeme ve iç uygunluk onayından sonra yapılır; domain maliyeti kontrollü tutulur.',
			support:
				'Bunu destek mesajı olarak alabilirim. Kısa bilgilerini yaz, ekip e-posta ile döner.',
			login: 'Site düzenlemek için önce giriş yapmalısın. Giriş ekranını açıyorum.',
			dashboard: 'Hesabındaki siteler için paneli açıyorum.',
			legal: 'Bunu yasal dokümanlarda daha net görebilirsin. İlgili sayfayı açıyorum.',
			fallback:
				'Site oluşturma, fiyat, domain, destek veya hesabındaki sitelerle ilgili yardımcı olabilirim. Ne yapmak istediğini biraz daha net yaz.'
		},
		en: {
			start: 'I can use this as your website brief. I am opening the guided site creation flow.',
			pricing: 'You can try Free first; Pro is 17€/month per site. I am opening the pricing page.',
			domain:
				'Custom domains are handled in the Pro flow. Registration only happens after payment and internal approval, with provider cost controlled.',
			support: 'I can take this as a support message. Add your details and we will reply by email.',
			login: 'You need to sign in before editing a site. I am opening the sign-in screen.',
			dashboard: 'I am opening your dashboard for your sites.',
			legal: 'You can find this in the legal documents. I am opening the relevant page.',
			fallback:
				'I can help with creating a site, pricing, domains, support, or your existing sites. Tell me a little more clearly what you want to do.'
		},
		de: {
			start: 'Ich kann das als Website-Briefing nutzen. Ich öffne den geführten Website-Start.',
			pricing:
				'Du kannst zuerst Free testen; Pro kostet 17€/Monat pro Website. Ich öffne die Preisseite.',
			domain:
				'Eigene Domains laufen über den Pro-Ablauf. Registrierung erfolgt erst nach Zahlung und interner Freigabe.',
			support:
				'Ich kann das als Support-Nachricht aufnehmen. Ergänze kurz deine Daten; wir antworten per E-Mail.',
			login: 'Zum Bearbeiten einer Website musst du dich zuerst anmelden. Ich öffne den Login.',
			dashboard: 'Ich öffne dein Dashboard für deine Websites.',
			legal: 'Das findest du in den rechtlichen Dokumenten. Ich öffne die passende Seite.',
			fallback:
				'Ich kann beim Erstellen einer Website, Preisen, Domains, Support oder deinen bestehenden Websites helfen. Beschreibe kurz genauer, was du tun möchtest.'
		}
	}[locale];
}

function classify(message: string, signedIn: boolean): AssistantAction {
	const text = message.toLocaleLowerCase('tr-TR');

	if (
		includesAny(text, [
			'fiyat',
			'ücret',
			'plan',
			'pricing',
			'price',
			'kosten',
			'preis',
			'abonelik',
			'17€',
			'17 euro'
		])
	) {
		return 'show_pricing';
	}
	if (
		includesAny(text, [
			'domain',
			'alan adı',
			'özel alan',
			'hosting',
			'mail',
			'e-posta',
			'email',
			'tls',
			'subdomain'
		])
	) {
		return 'show_domain_info';
	}
	if (
		includesAny(text, [
			'kvkk',
			'gizlilik',
			'şart',
			'yasal',
			'privacy',
			'terms',
			'legal',
			'datenschutz',
			'bedingungen'
		])
	) {
		return 'open_legal';
	}
	if (
		includesAny(text, [
			'destek',
			'yardım',
			'support',
			'iletişim',
			'contact',
			'hata',
			'sorun',
			'bug',
			'hilfe',
			'kontakt'
		])
	) {
		return 'contact_support';
	}
	if (
		includesAny(text, [
			'düzenle',
			'değiştir',
			'edit',
			'editor',
			'panel',
			'dashboard',
			'sitem',
			'websiteimi',
			'bearbeiten'
		])
	) {
		return signedIn ? 'open_dashboard' : 'login_required';
	}
	if (
		includesAny(text, [
			'site',
			'website',
			'web sitesi',
			'oluştur',
			'kur',
			'başla',
			'psikolog',
			'avukat',
			'diyetisyen',
			'emlak',
			'güzellik',
			'therapie',
			'praxis'
		]) ||
		text.length >= 28
	) {
		return 'start_onboarding';
	}
	return 'fallback';
}

function hrefFor(action: AssistantAction): string | undefined {
	return {
		start_onboarding: '/new',
		show_pricing: '/pricing',
		show_domain_info: '/pricing',
		contact_support: undefined,
		login_required: '/login',
		open_dashboard: '/dashboard',
		open_legal: '/legal/privacy',
		fallback: undefined
	}[action];
}

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	if (!rateLimit(`assistant-route:${getClientAddress()}`, 24, 60_000)) {
		return json(
			{ ok: false, message: 'Too many assistant messages. Try again shortly.' },
			{ status: 429 }
		);
	}

	let rawBody: unknown;
	try {
		rawBody = await request.json();
	} catch {
		return json({ ok: false, message: 'Invalid request.' }, { status: 400 });
	}
	const body = bodySchema.safeParse(rawBody);
	if (!body.success) {
		return json({ ok: false, message: body.error.issues[0].message }, { status: 400 });
	}

	const action = classify(body.data.message, Boolean(locals.user));
	const copy = localized(body.data.locale);
	return json({
		ok: true,
		action,
		reply:
			copy[
				action === 'start_onboarding'
					? 'start'
					: action === 'show_pricing'
						? 'pricing'
						: action === 'show_domain_info'
							? 'domain'
							: action === 'contact_support'
								? 'support'
								: action === 'login_required'
									? 'login'
									: action === 'open_dashboard'
										? 'dashboard'
										: action === 'open_legal'
											? 'legal'
											: 'fallback'
			],
		href: hrefFor(action),
		prefill: action === 'start_onboarding' ? body.data.message : undefined
	});
};
