import type { Locale, Page, Section, SectionType } from '$lib/schema/site';

export const VISUAL_SECTION_TYPES = [
	'hero',
	'about',
	'services',
	'process',
	'faq',
	'cta',
	'contact',
	'booking',
	'collection',
	'footer'
] as const satisfies readonly SectionType[];

export type VisualSectionType = (typeof VISUAL_SECTION_TYPES)[number];

const copy = {
	tr: {
		title: 'Yeni bölüm',
		body: 'Bu bölümün içeriğini düzenleyin.',
		item: 'Yeni öğe',
		action: 'İletişime geç',
		question: 'Sık sorulan soru',
		answer: 'Yanıtı buraya yazın.',
		step: 'Yeni adım',
		footer: 'Site açıklaması'
	},
	en: {
		title: 'New section',
		body: 'Edit the content of this section.',
		item: 'New item',
		action: 'Get in touch',
		question: 'Frequently asked question',
		answer: 'Write the answer here.',
		step: 'New step',
		footer: 'Site description'
	},
	de: {
		title: 'Neuer Abschnitt',
		body: 'Bearbeiten Sie den Inhalt dieses Abschnitts.',
		item: 'Neuer Eintrag',
		action: 'Kontakt aufnehmen',
		question: 'Häufig gestellte Frage',
		answer: 'Schreiben Sie die Antwort hier.',
		step: 'Neuer Schritt',
		footer: 'Website-Beschreibung'
	}
} as const;

function localized<T>(factory: (locale: Locale) => T): Record<Locale, T> {
	return {
		tr: factory('tr'),
		en: factory('en'),
		de: factory('de')
	};
}

function uniqueSectionId(page: Page, type: SectionType): string {
	const used = new Set(page.sections.map((section) => section.id));
	let index = 1;
	while (used.has(`${type}-${index}`)) index += 1;
	return `${type}-${index}`;
}

export function createVisualSection(
	page: Page,
	type: VisualSectionType,
	contactEmail: string
): Section {
	const id = uniqueSectionId(page, type);
	const style = {
		layout: 'full' as const,
		paddingY: 'standard' as const,
		marginY: 'none' as const,
		minHeight: 'auto' as const,
		contentWidth: 'wide' as const
	};

	switch (type) {
		case 'hero':
			return {
				id,
				type,
				props: { variant: 'split', background: 'plain', ctaHref: '#contact' },
				style,
				content: localized((locale) => ({
					headline: copy[locale].title,
					subheadline: copy[locale].body,
					ctaLabel: copy[locale].action
				}))
			};
		case 'about':
			return {
				id,
				type,
				props: { variant: 'text' },
				style,
				content: localized((locale) => ({
					title: copy[locale].title,
					body: copy[locale].body
				}))
			};
		case 'services':
			return {
				id,
				type,
				props: { variant: 'grid', columns: 3 },
				style,
				content: localized((locale) => ({
					title: copy[locale].title,
					intro: copy[locale].body,
					items: [{ name: copy[locale].item, description: copy[locale].body }]
				}))
			};
		case 'process':
			return {
				id,
				type,
				props: { variant: 'vertical' },
				style,
				content: localized((locale) => ({
					title: copy[locale].title,
					intro: copy[locale].body,
					steps: [{ label: copy[locale].step, description: copy[locale].body }]
				}))
			};
		case 'faq':
			return {
				id,
				type,
				props: { variant: 'accordion' },
				style,
				content: localized((locale) => ({
					title: copy[locale].title,
					items: [{ question: copy[locale].question, answer: copy[locale].answer }]
				}))
			};
		case 'cta':
			return {
				id,
				type,
				props: { variant: 'banner', href: '#contact' },
				style,
				content: localized((locale) => ({
					title: copy[locale].title,
					subtitle: copy[locale].body,
					buttonLabel: copy[locale].action
				}))
			};
		case 'contact':
			return {
				id,
				type,
				props: {
					variant: 'form',
					email: contactEmail,
					fields: ['name', 'email', 'message']
				},
				style,
				content: localized((locale) => ({
					title: copy[locale].title,
					description: copy[locale].body
				}))
			};
		case 'booking':
			return {
				id,
				type,
				props: { variant: 'inline', href: '#contact' },
				style,
				content: localized((locale) => ({
					title: copy[locale].title,
					subtitle: copy[locale].body,
					buttonLabel: copy[locale].action
				}))
			};
		case 'collection':
			return {
				id,
				type,
				props: { variant: 'cards', kind: 'resources' },
				style,
				content: localized((locale) => ({
					title: copy[locale].title,
					intro: copy[locale].body,
					items: [{ title: copy[locale].item, description: copy[locale].body }]
				}))
			};
		case 'footer':
			return {
				id,
				type,
				props: { variant: 'simple' },
				style,
				content: localized((locale) => ({ text: copy[locale].footer, links: [] }))
			};
	}
}

export function moveSection(page: Page, sectionId: string, toIndex: number): boolean {
	const fromIndex = page.sections.findIndex((section) => section.id === sectionId);
	if (fromIndex < 0) return false;
	const boundedIndex = Math.max(0, Math.min(toIndex, page.sections.length - 1));
	if (fromIndex === boundedIndex) return false;
	const [section] = page.sections.splice(fromIndex, 1);
	page.sections.splice(boundedIndex, 0, section);
	return true;
}

export function duplicateSection(page: Page, sectionId: string): string | null {
	const index = page.sections.findIndex((section) => section.id === sectionId);
	if (index < 0 || page.sections.length >= 12) return null;
	const duplicate = structuredClone(page.sections[index]);
	const base = `${duplicate.id}-copy`;
	let suffix = 1;
	while (page.sections.some((section) => section.id === `${base}-${suffix}`)) suffix += 1;
	duplicate.id = `${base}-${suffix}`;
	page.sections.splice(index + 1, 0, duplicate);
	return duplicate.id;
}

export function removeSection(page: Page, sectionId: string): boolean {
	if (page.sections.length <= 1) return false;
	const index = page.sections.findIndex((section) => section.id === sectionId);
	if (index < 0) return false;
	page.sections.splice(index, 1);
	return true;
}
