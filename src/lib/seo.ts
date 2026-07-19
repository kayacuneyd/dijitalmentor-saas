import { LOCALES, withLocale, type Locale } from '$lib/i18n';

export const SITE_ORIGIN = 'https://saaskaya.com';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og.jpg`;
export const DEFAULT_LOGO = `${SITE_ORIGIN}/logo.svg`;

export type SeoAlternate = {
	locale: string | 'x-default';
	href: string;
};

export function absoluteUrl(locale: string, path: string): string {
	return `${SITE_ORIGIN}${withLocale(locale, path)}`;
}

export function seoAlternates(path: string, locales: readonly string[] = LOCALES): SeoAlternate[] {
	const alternates = locales.map((locale) => ({
		locale,
		href: absoluteUrl(locale, path)
	}));
	return [...alternates, { locale: 'x-default', href: absoluteUrl('en', path) }];
}

export function stringifyJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

function absoluteAssetUrl(url: string): string {
	return url.startsWith('/') ? `${SITE_ORIGIN}${url}` : url;
}

export function organizationJsonLd(logo = DEFAULT_LOGO) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'saaskaya',
		url: SITE_ORIGIN,
		logo: absoluteAssetUrl(logo),
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Kornwestheim',
			addressCountry: 'DE'
		},
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer support',
			email: 'support@saaskaya.com',
			availableLanguage: ['English', 'Turkish', 'German']
		}
	};
}

export function webSiteJsonLd(locale: Locale, logo = DEFAULT_LOGO) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'saaskaya',
		url: absoluteUrl(locale, '/'),
		inLanguage: locale,
		publisher: organizationJsonLd(logo)
	};
}

export function softwareJsonLd(locale: Locale, description: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'saaskaya',
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		url: absoluteUrl(locale, '/'),
		description,
		offers: {
			'@type': 'Offer',
			price: '17',
			priceCurrency: 'EUR'
		}
	};
}
