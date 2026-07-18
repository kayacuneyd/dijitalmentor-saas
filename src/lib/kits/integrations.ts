export const INTEGRATION_TYPES = [
	'booking-external',
	'whatsapp-order',
	'payment-link',
	'social-link',
	'video-consult',
	'menu-digital',
	'review-platform',
	'academic-profile',
	'portfolio-gallery'
] as const;
export type IntegrationType = (typeof INTEGRATION_TYPES)[number];

/** Domain allowlist per integration type. URLs must match one of these domains. */
export const INTEGRATION_DOMAIN_ALLOWLIST: Record<IntegrationType, string[]> = {
	'booking-external': ['calendly.com', 'cal.com', 'healcode.com'],
	'whatsapp-order': [], // uses phone (E.164), not URL
	'payment-link': [
		'iyzico.com',
		'iyzi.link',
		'paytr.com',
		'paytr.link',
		'stripe.com',
		'buymeacoffee.com'
	],
	'social-link': [
		'instagram.com',
		'tiktok.com',
		'@tiktok',
		'youtube.com',
		'linkedin.com',
		'twitter.com',
		'x.com'
	],
	'video-consult': ['zoom.us', 'meet.google.com', 'teams.microsoft.com', 'whereby.com'],
	'menu-digital': [], // open-ended — restaurants may host menus anywhere
	'review-platform': ['trustpilot.com', 'provenexpert.com', 'doctoralia.com'],
	'academic-profile': ['orcid.org', 'scholar.google.com', 'researchgate.net'],
	'portfolio-gallery': [
		'behance.net',
		'dribbble.com',
		'artstation.com',
		'github.com',
		'gitlab.com',
		'500px.com'
	]
};

/** Default display label per integration type (tr). Renderer uses locale key. */
export const INTEGRATION_DEFAULT_LABELS: Record<IntegrationType, string> = {
	'booking-external': 'Randevu Al',
	'whatsapp-order': 'WhatsApp',
	'payment-link': 'Ödeme Yap',
	'social-link': 'Takip Et',
	'video-consult': 'Görüntülü Görüşme',
	'menu-digital': 'Menü',
	'review-platform': 'Bewertungen',
	'academic-profile': 'Akademik profil',
	'portfolio-gallery': 'Portföy'
};

/**
 * Produces a wa.me link from an E.164 phone number and an optional locale-aware
 * prefill message.  The message is not encoded here — callers provide it raw
 * and this helper applies encodeURIComponent.
 */
export function waMeLink(phone: string, message?: string): string {
	const base = `https://wa.me/${phone.replace(/^\+/, '')}`;
	return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Returns the full set of feature-kit strings that were historically used
 * in ProfessionKitConfig.featureKits.  This lets us map old string[] values
 * to the new IntegrationType[] without a breaking change in every kit config.
 */
export const LEGACY_FEATURE_KIT_MAP: Record<string, IntegrationType> = {
	'booking-request': 'booking-external',
	'whatsapp-cta': 'whatsapp-order',
	payment: 'payment-link',
	social: 'social-link',
	video: 'video-consult',
	menu: 'menu-digital',
	'property-inquiry': 'whatsapp-order',
	'map-location': 'menu-digital', // v1.5'te Leaflet facade'e dönüşecek; v1'de no-op
	gallery: 'social-link',
	faq: 'menu-digital', // v1'de no-op, bloğa özel değil
	'contact-form': 'menu-digital' // v1'de no-op
};

/**
 * Coerces a legacy featureKit string array into the new IntegrationType[].
 * Unknown strings are silently dropped.
 */
export function coerceFeatureKits(raw: string[]): IntegrationType[] {
	const result: IntegrationType[] = [];
	for (const item of raw) {
		const mapped = LEGACY_FEATURE_KIT_MAP[item];
		if (mapped && !result.includes(mapped)) {
			result.push(mapped);
		}
	}
	return result;
}

/**
 * Validates that an integration entry has the right field for its type:
 * - whatsapp-order → phone required, url forbidden
 * - everything else → url required, phone forbidden
 * Also checks the URL domain against the allowlist (unless allowlist is empty/open).
 */
export function validateIntegrationTarget(
	entry: { type: IntegrationType; enabled: boolean; phone?: string; url?: string },
	ctx: { addIssue: (arg: { code: 'custom'; path: (string | number)[]; message: string }) => void }
): void {
	// If disabled, skip all field checks — the entry is just a placeholder
	if (!entry.enabled) return;

	const allowlist = INTEGRATION_DOMAIN_ALLOWLIST[entry.type];

	if (entry.type === 'whatsapp-order') {
		if (!entry.phone || entry.phone.trim() === '') {
			ctx.addIssue({
				code: 'custom',
				path: ['phone'],
				message: 'whatsapp-order requires a phone number (E.164)'
			});
		}
		if (entry.url) {
			ctx.addIssue({
				code: 'custom',
				path: ['url'],
				message: 'whatsapp-order must not have a url — use phone instead'
			});
		}
	} else {
		if (!entry.url || entry.url.trim() === '') {
			ctx.addIssue({ code: 'custom', path: ['url'], message: `${entry.type} requires a url` });
		}
		if (entry.phone) {
			ctx.addIssue({
				code: 'custom',
				path: ['phone'],
				message: `${entry.type} must not have a phone — use url instead`
			});
		}
	}

	// Domain allowlist check (skip if allowlist is empty/open)
	if (entry.url && allowlist.length > 0) {
		let hostname: string;
		try {
			hostname = new URL(entry.url).hostname;
		} catch {
			ctx.addIssue({ code: 'custom', path: ['url'], message: `Invalid URL: ${entry.url}` });
			return;
		}
		const allowed = allowlist.some(
			(domain) => hostname === domain || hostname.endsWith('.' + domain)
		);
		if (!allowed) {
			ctx.addIssue({
				code: 'custom',
				path: ['url'],
				message: `Domain "${hostname}" is not allowed for ${entry.type}. Allowed: ${allowlist.join(', ')}`
			});
		}
	}
}
