import type { Site } from '$lib/schema/site';

export type EditorChecklistTab = 'Content' | 'Theme' | 'Languages' | 'Settings';

export type CompletionChecklistItem = {
	id: string;
	label: string;
	helper: string;
	complete: boolean;
	tab: EditorChecklistTab;
};

type Options = {
	publishedVersion?: number | null;
};

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function homepageHeadlineReady(site: Site): boolean {
	const home = site.pages[0];
	const hero = home?.sections.find((section) => section.type === 'hero');
	if (!hero) return false;
	return text(hero.content[site.defaultLocale]?.headline).length >= 12;
}

function contactPathReady(site: Site): boolean {
	if (site.settings.contactEmail) return true;
	return site.pages.some((page) =>
		page.sections.some((section) => section.type === 'contact' && Boolean(section.props.email))
	);
}

function servicesReady(site: Site): boolean {
	return site.pages.some((page) =>
		page.sections.some(
			(section) =>
				section.type === 'services' && section.content[site.defaultLocale].items.length > 0
		)
	);
}

function languagesReady(site: Site): boolean {
	return site.locales.includes(site.defaultLocale) && site.locales.length >= 1;
}

function imageRefs(site: Site): string[] {
	const refs: string[] = [];
	for (const page of site.pages) {
		for (const section of page.sections) {
			if ('imageUrl' in section.props && section.props.imageUrl) refs.push(section.props.imageUrl);
			if (section.type === 'gallery') {
				refs.push(...section.content[site.defaultLocale].images.map((image) => image.url));
			}
			if (section.type === 'team') {
				refs.push(
					...section.content[site.defaultLocale].members
						.map((member) => member.photoUrl)
						.filter((url): url is string => Boolean(url))
				);
			}
		}
	}
	return refs;
}

function mediaReady(site: Site): boolean {
	const refs = imageRefs(site);
	if (refs.length === 0) return true;
	return refs.some((ref) => ref.startsWith('/media/') || ref.startsWith('https://'));
}

export function buildCompletionChecklist(
	site: Site,
	options: Options = {}
): CompletionChecklistItem[] {
	return [
		{
			id: 'headline',
			label: 'Ana sayfa başlığını kontrol et',
			helper: 'İlk ekranda kime, hangi güven vaadiyle seslendiğin net olmalı.',
			complete: homepageHeadlineReady(site),
			tab: 'Content'
		},
		{
			id: 'contact',
			label: 'İletişim yolunu doğrula',
			helper: 'E-posta veya telefon yanlışsa potansiyel danışan kaybedilir.',
			complete: contactPathReady(site),
			tab: 'Settings'
		},
		{
			id: 'services',
			label: 'Hizmetleri gözden geçir',
			helper: 'Uzmanlık alanları kısa, anlaşılır ve iddiasız kalmalı.',
			complete: servicesReady(site),
			tab: 'Content'
		},
		{
			id: 'languages',
			label: 'Dilleri kontrol et',
			helper: 'Yayınlanacak dillerin doğru seçildiğinden emin ol.',
			complete: languagesReady(site),
			tab: 'Languages'
		},
		{
			id: 'media',
			label: 'Görselleri değiştir veya onayla',
			helper: 'Hazır görseller yerine kendi fotoğrafların güveni artırır.',
			complete: mediaReady(site),
			tab: 'Content'
		},
		{
			id: 'publish',
			label: 'Hazır olduğunda yayınla',
			helper: 'Önizleme doğru görünüyorsa siteyi canlı alt alan adına yayınla.',
			complete: Boolean(options.publishedVersion),
			tab: 'Settings'
		}
	];
}

export function nextChecklistItem(items: CompletionChecklistItem[]): CompletionChecklistItem {
	return items.find((item) => !item.complete) ?? items[items.length - 1];
}
