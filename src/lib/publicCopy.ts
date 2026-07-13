import { LOCALES, type Locale } from '$lib/i18n';

export type PublicCopyPage =
	| 'home'
	| 'about'
	| 'pricing'
	| 'templates'
	| 'blog'
	| 'contact'
	| 'beta';

export type PublicCopyField = {
	path: string;
	label: string;
	kind?: 'text' | 'textarea';
	help?: string;
};

export const publicCopyPages: { key: PublicCopyPage; label: string; path: string }[] = [
	{ key: 'home', label: 'Home', path: '/' },
	{ key: 'pricing', label: 'Pricing', path: '/pricing' },
	{ key: 'about', label: 'About', path: '/about' },
	{ key: 'templates', label: 'Templates', path: '/templates' },
	{ key: 'blog', label: 'Blog', path: '/blog' },
	{ key: 'contact', label: 'Contact', path: '/contact' },
	{ key: 'beta', label: 'Beta', path: '/beta' }
];

const sharedFields: PublicCopyField[] = [
	{ path: 'title', label: 'SEO title' },
	{ path: 'description', label: 'SEO description', kind: 'textarea' },
	{ path: 'h1', label: 'Main headline' },
	{ path: 'lead', label: 'Lead paragraph', kind: 'textarea' },
	{ path: 'primary', label: 'Primary CTA' },
	{ path: 'secondary', label: 'Secondary CTA' }
];

export const publicCopyFields: Record<PublicCopyPage, PublicCopyField[]> = {
	home: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'examples', label: 'Examples CTA' },
		{ path: 'pricing', label: 'Pricing CTA' },
		{ path: 'problemsLabel', label: 'Problem band title' },
		{ path: 'problemItems.0.title', label: 'Problem 1 title' },
		{ path: 'problemItems.0.body', label: 'Problem 1 body' },
		{ path: 'problemItems.1.title', label: 'Problem 2 title' },
		{ path: 'problemItems.1.body', label: 'Problem 2 body' },
		{ path: 'problemItems.2.title', label: 'Problem 3 title' },
		{ path: 'problemItems.2.body', label: 'Problem 3 body' },
		{ path: 'problemItems.3.title', label: 'Problem 4 title' },
		{ path: 'problemItems.3.body', label: 'Problem 4 body' },
		{ path: 'features', label: 'Use-case section title' },
		{ path: 'priceLabel', label: 'Pricing section title' },
		{ path: 'finalTitle', label: 'Final CTA title' },
		{ path: 'finalBody', label: 'Final CTA body', kind: 'textarea' }
	],
	about: [
		...sharedFields,
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'sections.0.0', label: 'Card 1 title' },
		{ path: 'sections.0.1', label: 'Card 1 body', kind: 'textarea' },
		{ path: 'sections.1.0', label: 'Card 2 title' },
		{ path: 'sections.1.1', label: 'Card 2 body', kind: 'textarea' },
		{ path: 'sections.2.0', label: 'Card 3 title' },
		{ path: 'sections.2.1', label: 'Card 3 body', kind: 'textarea' },
		{ path: 'trustTitle', label: 'Trust title' },
		{ path: 'trustBody', label: 'Trust body', kind: 'textarea' }
	],
	pricing: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'ctaText', label: 'Bottom CTA text', kind: 'textarea' },
		{ path: 'cta', label: 'Bottom CTA button' },
		{ path: 'domainNote', label: 'Domain note', kind: 'textarea' }
	],
	templates: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'emptyTitle', label: 'Empty state title' },
		{ path: 'emptyBody', label: 'Empty state body', kind: 'textarea' }
	],
	blog: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'emptyTitle', label: 'Empty state title' },
		{ path: 'emptyBody', label: 'Empty state body', kind: 'textarea' }
	],
	contact: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'formTitle', label: 'Form title' },
		{ path: 'formBody', label: 'Form body', kind: 'textarea' }
	],
	beta: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'after', label: 'After sign-in note', kind: 'textarea' }
	]
};

export function isPublicCopyPage(value: string): value is PublicCopyPage {
	return publicCopyPages.some((page) => page.key === value);
}

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function mergeCopy<T>(base: T, override: unknown): T {
	if (Array.isArray(base)) {
		if (!Array.isArray(override)) return base;
		return base.map((item, index) => mergeCopy(item, override[index])) as T;
	}
	if (isObject(base)) {
		if (!isObject(override)) return base;
		const merged: Record<string, unknown> = { ...base };
		for (const [key, value] of Object.entries(override)) {
			if (key in merged) merged[key] = mergeCopy(merged[key], value);
		}
		return merged as T;
	}
	return override === undefined || override === null ? base : (override as T);
}

export function getPathValue(source: unknown, path: string): string {
	const value = path.split('.').reduce<unknown>((current, segment) => {
		if (current === undefined || current === null) return undefined;
		if (Array.isArray(current)) return current[Number(segment)];
		if (typeof current === 'object') return (current as Record<string, unknown>)[segment];
		return undefined;
	}, source);
	return typeof value === 'string' ? value : '';
}

export function setPathValue(target: Record<string, unknown>, path: string, value: string): void {
	const parts = path.split('.');
	let current: Record<string, unknown> | unknown[] = target;
	for (const [index, part] of parts.entries()) {
		const last = index === parts.length - 1;
		const nextPart = parts[index + 1];
		if (last) {
			if (Array.isArray(current)) current[Number(part)] = value;
			else current[part] = value;
			return;
		}
		const nextIsArray = /^\d+$/.test(nextPart);
		if (Array.isArray(current)) {
			const arrayIndex = Number(part);
			current[arrayIndex] ??= nextIsArray ? [] : {};
			current = current[arrayIndex] as Record<string, unknown> | unknown[];
		} else {
			current[part] ??= nextIsArray ? [] : {};
			current = current[part] as Record<string, unknown> | unknown[];
		}
	}
}
