import { LOCALES, type Locale } from '$lib/i18n';

export type PublicCopyPage =
	| 'home'
	| 'about'
	| 'pricing'
	| 'templates'
	| 'blog'
	| 'contact'
	| 'beta'
	| 'header'
	| 'footer'
	| 'error'
	| 'privacy'
	| 'terms'
	| 'kvkk'
	| 'refund'
	| 'disclaimer'
	| 'acceptable-use';

export type PublicCopyField = {
	path: string;
	label: string;
	kind?: 'text' | 'textarea' | 'document';
	help?: string;
};

export const publicCopyPages: { key: PublicCopyPage; label: string; path: string }[] = [
	{ key: 'home', label: 'Home', path: '/' },
	{ key: 'pricing', label: 'Pricing', path: '/pricing' },
	{ key: 'about', label: 'About', path: '/about' },
	{ key: 'templates', label: 'Templates', path: '/templates' },
	{ key: 'blog', label: 'Blog', path: '/blog' },
	{ key: 'contact', label: 'Contact', path: '/contact' },
	{ key: 'beta', label: 'Beta', path: '/beta' },
	{ key: 'header', label: 'Header navigation', path: 'global' },
	{ key: 'footer', label: 'Footer', path: 'global' },
	{ key: 'error', label: 'Error pages', path: '/404' },
	{ key: 'privacy', label: 'Privacy policy', path: '/legal/privacy' },
	{ key: 'terms', label: 'Terms of service', path: '/legal/terms' },
	{ key: 'kvkk', label: 'KVKK notice', path: '/legal/kvkk' },
	{ key: 'refund', label: 'Refund policy', path: '/legal/refund' },
	{ key: 'disclaimer', label: 'Disclaimer', path: '/legal/disclaimer' },
	{ key: 'acceptable-use', label: 'Acceptable use', path: '/legal/acceptable-use' }
];

const sharedFields: PublicCopyField[] = [
	{ path: 'title', label: 'SEO title' },
	{ path: 'description', label: 'SEO description', kind: 'textarea' },
	{ path: 'h1', label: 'Main headline' },
	{ path: 'lead', label: 'Lead paragraph', kind: 'textarea' },
	{ path: 'primary', label: 'Primary CTA' },
	{ path: 'secondary', label: 'Secondary CTA' }
];

const fields = (paths: string[]): PublicCopyField[] =>
	paths.map((path) => ({
		path,
		label: path,
		kind: /(?:body|description|lead|\.1)$/.test(path) ? 'textarea' : 'text'
	}));

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
		{ path: 'finalBody', label: 'Final CTA body', kind: 'textarea' },
		...fields([
			'login',
			'beta',
			'pills.0',
			'pills.1',
			'pills.2',
			'process',
			'segmentsLabel',
			'segmentsTitle',
			'segmentCards.0.0',
			'segmentCards.0.1',
			'segmentCards.0.2',
			'segmentCards.0.3',
			'segmentCards.0.4',
			'segmentCards.1.0',
			'segmentCards.1.1',
			'segmentCards.1.2',
			'segmentCards.1.3',
			'segmentCards.1.4',
			'segmentCards.2.0',
			'segmentCards.2.1',
			'segmentCards.2.2',
			'segmentCards.2.3',
			'segmentCards.2.4',
			'flowLabel',
			'stepLabel',
			'midCtaTitle',
			'midCtaBody',
			'midCtaAction',
			'sectionTitles.problems',
			'sectionTitles.process',
			'sectionTitles.examples',
			'sectionTitles.pricing',
			'sectionTitles.trust',
			'featuresEyebrow',
			'faqEyebrow',
			'presetLabels.law',
			'presetLabels.psych',
			'presetLabels.dental',
			'planAria.free',
			'planAria.pro',
			'planAria.premium',
			'exampleSites',
			'pages',
			'preview',
			'edit',
			'perMonth',
			'recommended',
			'allFeatures',
			'faq',
			'trust',
			'steps.0.0',
			'steps.0.1',
			'steps.1.0',
			'steps.1.1',
			'steps.2.0',
			'steps.2.1',
			'steps.3.0',
			'steps.3.1',
			'featureItems.0.0',
			'featureItems.0.1',
			'featureItems.1.0',
			'featureItems.1.1',
			'featureItems.2.0',
			'featureItems.2.1',
			'featureItems.3.0',
			'featureItems.3.1',
			'featureItems.4.0',
			'featureItems.4.1',
			'featureItems.5.0',
			'featureItems.5.1',
			'faqs.0.0',
			'faqs.0.1',
			'faqs.1.0',
			'faqs.1.1',
			'faqs.2.0',
			'faqs.2.1',
			'faqs.3.0',
			'faqs.3.1',
			'faqs.4.0',
			'faqs.4.1',
			'trustCards.0.0',
			'trustCards.0.1',
			'trustCards.1.0',
			'trustCards.1.1',
			'trustCards.2.0',
			'trustCards.2.1',
			'trustCards.3.0',
			'trustCards.3.1'
		])
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
		{ path: 'trustBody', label: 'Trust body', kind: 'textarea' },
		...fields(['pills.0', 'pills.1', 'pills.2'])
	],
	pricing: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'ctaText', label: 'Bottom CTA text', kind: 'textarea' },
		{ path: 'cta', label: 'Bottom CTA button' },
		{ path: 'domainNote', label: 'Domain note', kind: 'textarea' },
		...fields([
			'login',
			'pills.0',
			'pills.1',
			'month',
			'year',
			'recommended',
			'startFree',
			'upgrade',
			'start',
			'faqLabel',
			'plans.0.0',
			'plans.0.1',
			'plans.0.2',
			'plans.1.0',
			'plans.1.1',
			'plans.1.2',
			'plans.1.3',
			'plans.2.0',
			'plans.2.1',
			'plans.2.2',
			'plans.2.3',
			'faqs.0.0',
			'faqs.0.1',
			'faqs.1.0',
			'faqs.1.1',
			'faqs.2.0',
			'faqs.2.1',
			'faqs.3.0',
			'faqs.3.1',
			'faqs.4.0',
			'faqs.4.1'
		])
	],
	templates: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'emptyTitle', label: 'Empty state title' },
		{ path: 'emptyBody', label: 'Empty state body', kind: 'textarea' },
		...fields([
			'create',
			'pills.0',
			'pills.2',
			'pricing',
			'profession',
			'audience',
			'outcome',
			'features',
			'prompts',
			'structure',
			'sections',
			'languages',
			'quality',
			'blockers',
			'warnings',
			'startStyle',
			'note'
		])
	],
	blog: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'emptyTitle', label: 'Empty state title' },
		{ path: 'emptyBody', label: 'Empty state body', kind: 'textarea' },
		...fields(['read', 'min'])
	],
	contact: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'formTitle', label: 'Form title' },
		{ path: 'formBody', label: 'Form body', kind: 'textarea' },
		...fields([
			'email',
			'response',
			'location',
			'categories.0',
			'categories.1',
			'categories.2',
			'categories.3',
			'categories.4',
			'formNote',
			'name',
			'emailField',
			'category',
			'message',
			'placeholder',
			'send',
			'success',
			'start',
			'blog'
		])
	],
	beta: [
		...sharedFields.filter((field) => field.path !== 'secondary'),
		{ path: 'kicker', label: 'Kicker' },
		{ path: 'after', label: 'After sign-in note', kind: 'textarea' },
		...fields([
			'home',
			'badge',
			'body',
			'email',
			'placeholder',
			'submit',
			'successTitle',
			'success',
			'codeMissing',
			'dev',
			'open'
		])
	],
	footer: [
		{ path: 'product', label: 'Product column' },
		{ path: 'company', label: 'Company column' },
		{ path: 'legal', label: 'Legal column' },
		{ path: 'account', label: 'Account column' },
		{ path: 'home', label: 'Home link' },
		{ path: 'pricing', label: 'Pricing link' },
		{ path: 'templates', label: 'Templates link' },
		{ path: 'start', label: 'Start link' },
		{ path: 'about', label: 'About link' },
		{ path: 'blog', label: 'Blog link' },
		{ path: 'contact', label: 'Contact link' },
		{ path: 'privacy', label: 'Privacy link' },
		{ path: 'terms', label: 'Terms link' },
		{ path: 'kvkk', label: 'KVKK link' },
		{ path: 'refund', label: 'Refund link' },
		{ path: 'disclaimer', label: 'Disclaimer link' },
		{ path: 'acceptable', label: 'Acceptable use link' },
		{ path: 'login', label: 'Login link' },
		{ path: 'dashboard', label: 'Dashboard link' },
		{ path: 'tagline', label: 'Brand description', kind: 'textarea' },
		{ path: 'location', label: 'Location line' },
		{ path: 'credit', label: 'Copyright / attribution line' }
	],
	header: [
		{ path: 'nav.0.0', label: 'Home link' },
		{ path: 'nav.1.0', label: 'Pricing link' },
		{ path: 'nav.2.0', label: 'About link' },
		{ path: 'nav.3.0', label: 'Blog link' },
		{ path: 'nav.4.0', label: 'Contact link' },
		{ path: 'login', label: 'Login action' },
		{ path: 'dashboard', label: 'Dashboard action' },
		{ path: 'start', label: 'Start action' },
		{ path: 'menu', label: 'Open-menu label' },
		{ path: 'close', label: 'Close-menu label' }
	],
	error: [
		{ path: 'notFoundTitle', label: '404 title' },
		{ path: 'notFoundBody', label: '404 description', kind: 'textarea' },
		{ path: 'failedTitle', label: 'Error title' },
		{ path: 'failedBody', label: 'Error description', kind: 'textarea' },
		{ path: 'cta', label: 'Return button' }
	],
	privacy: [
		{ path: 'title', label: 'Page title' },
		{
			path: 'body',
			label: 'Document body',
			kind: 'document',
			help: 'Use ## for headings and - for list items.'
		}
	],
	terms: [
		{ path: 'title', label: 'Page title' },
		{
			path: 'body',
			label: 'Document body',
			kind: 'document',
			help: 'Use ## for headings and - for list items.'
		}
	],
	kvkk: [
		{ path: 'title', label: 'Page title' },
		{
			path: 'body',
			label: 'Document body',
			kind: 'document',
			help: 'Use ## for headings and - for list items.'
		}
	],
	refund: [
		{ path: 'title', label: 'Page title' },
		{
			path: 'body',
			label: 'Document body',
			kind: 'document',
			help: 'Use ## for headings and - for list items.'
		}
	],
	disclaimer: [
		{ path: 'title', label: 'Page title' },
		{
			path: 'body',
			label: 'Document body',
			kind: 'document',
			help: 'Use ## for headings and - for list items.'
		}
	],
	'acceptable-use': [
		{ path: 'title', label: 'Page title' },
		{
			path: 'body',
			label: 'Document body',
			kind: 'document',
			help: 'Use ## for headings and - for list items.'
		}
	]
};

export function isPublicCopyPage(value: string): value is PublicCopyPage {
	return publicCopyPages.some((page) => page.key === value);
}

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}

export function baseLocaleForPublic(value: string): Locale {
	return isLocale(value) ? value : 'en';
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
