import type { Cookies } from '@sveltejs/kit';

export const LOCALES = ['en', 'tr', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'sk_locale';

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function localeFromPath(pathname: string): Locale | null {
	const first = pathname.split('/').filter(Boolean)[0];
	return isLocale(first) ? first : null;
}

export function stripLocale(pathname: string): string {
	const locale = localeFromPath(pathname);
	if (!locale) return pathname;
	const stripped = pathname.slice(locale.length + 1);
	return stripped.startsWith('/') ? stripped || '/' : `/${stripped}`;
}

export function withLocale(locale: Locale, path: string): string {
	if (/^https?:\/\//.test(path) || path.startsWith('#') || path.startsWith('mailto:')) return path;
	const normalized = path.startsWith('/') ? path : `/${path}`;
	const [pathname, suffix = ''] = normalized.split(/(?=[?#])/);
	const clean = stripLocale(pathname || '/');
	return `/${locale}${clean === '/' ? '' : clean}${suffix}`;
}

function localeFromCountry(country: string | null): Locale | null {
	const normalized = country?.trim().toUpperCase();
	if (normalized === 'TR') return 'tr';
	if (['DE', 'AT', 'CH'].includes(normalized ?? '')) return 'de';
	return null;
}

export function detectLocale(
	acceptLanguage: string | null,
	cookieLocale?: string,
	country?: string | null
): Locale {
	if (isLocale(cookieLocale)) return cookieLocale;
	const countryLocale = localeFromCountry(country ?? null);
	if (countryLocale) return countryLocale;
	for (const part of (acceptLanguage ?? '').split(',')) {
		const code = part.trim().split(';')[0].toLowerCase().split('-')[0];
		if (isLocale(code)) return code;
	}
	return DEFAULT_LOCALE;
}

export function rememberLocale(cookies: Cookies, locale: Locale): void {
	cookies.set(LOCALE_COOKIE, locale, {
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
		secure: true,
		maxAge: 60 * 60 * 24 * 365
	});
}

export const localeNames: Record<Locale, string> = {
	en: 'English',
	tr: 'Türkçe',
	de: 'Deutsch'
};
