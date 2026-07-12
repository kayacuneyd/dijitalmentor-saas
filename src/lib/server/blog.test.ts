import { describe, expect, it } from 'vitest';
import { blogCompleteness, importBlogPostJson, saveBlogPost } from './blog';
import { sectionsToBlogDoc } from '$lib/blog/content';
import type { Locale } from '$lib/i18n';

const locales: Locale[] = ['en', 'tr', 'de'];

function translations(bodyText = 'This body has enough detail for publication checks.') {
	return Object.fromEntries(
		locales.map((locale) => [
			locale,
			{
				title: `Title ${locale}`,
				description: `Description ${locale} is long enough for the validation rule.`,
				category: locale === 'de' ? 'Leitfaden' : locale === 'tr' ? 'Rehber' : 'Guide',
				seoTitle: '',
				seoDescription: '',
				body: sectionsToBlogDoc([{ heading: `Heading ${locale}`, body: bodyText }])
			}
		])
	) as Parameters<typeof saveBlogPost>[0]['translations'];
}

describe('blog CMS publishing and import', () => {
	it('blocks published posts with incomplete translations', () => {
		const t = translations();
		t.de.body = { type: 'doc', content: [{ type: 'paragraph' }] };
		const result = saveBlogPost({
			slug: `published-incomplete-${crypto.randomUUID().slice(0, 8)}`,
			status: 'published',
			readingMinutes: 4,
			authorName: 'Cüneyt Kaya',
			publishedAt: '2026-07-12',
			translations: t
		});

		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.message).toContain('complete EN/TR/DE translations');
	});

	it('imports a complete multilingual JSON file as a published post', () => {
		const slug = `json-import-${crypto.randomUUID().slice(0, 8)}`;
		const result = importBlogPostJson(
			JSON.stringify({
				slug,
				status: 'published',
				date: '2026-07-12',
				readingMinutes: 5,
				translations: {
					en: {
						title: 'English import title',
						description: 'English import description long enough to publish safely.',
						category: 'Guide',
						sections: [
							{ heading: 'English heading', body: 'English body text with enough detail.' }
						]
					},
					tr: {
						title: 'Türkçe import başlığı',
						description: 'Türkçe import açıklaması yayın için yeterince uzun.',
						category: 'Rehber',
						sections: [{ heading: 'Türkçe başlık', body: 'Türkçe gövde metni yeterince uzun.' }]
					},
					de: {
						title: 'Deutscher Importtitel',
						description: 'Deutsche Importbeschreibung ist lang genug für die Veröffentlichung.',
						category: 'Leitfaden',
						sections: [
							{ heading: 'Deutsche Überschrift', body: 'Deutscher Text mit genug Inhalt.' }
						]
					}
				}
			})
		);

		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('expected import to succeed');
		expect(result.post.status).toBe('published');
		expect(blogCompleteness(result.post).every((item) => item.complete)).toBe(true);
	});

	it('requires explicit overwrite when importing an existing slug', () => {
		const slug = `json-duplicate-${crypto.randomUUID().slice(0, 8)}`;
		const payload = JSON.stringify({
			slug,
			status: 'draft',
			translations: {
				en: {
					title: 'First title',
					description: 'English import description long enough to save.',
					category: 'Guide',
					sections: [{ heading: 'Heading', body: 'English body text with enough detail.' }]
				},
				tr: {
					title: 'İlk başlık',
					description: 'Türkçe import açıklaması kayıt için yeterince uzun.',
					category: 'Rehber',
					sections: [{ heading: 'Başlık', body: 'Türkçe gövde metni yeterince uzun.' }]
				},
				de: {
					title: 'Erster Titel',
					description: 'Deutsche Importbeschreibung ist lang genug.',
					category: 'Leitfaden',
					sections: [{ heading: 'Überschrift', body: 'Deutscher Text mit genug Inhalt.' }]
				}
			}
		});

		const first = importBlogPostJson(payload);
		expect(first.ok).toBe(true);
		const duplicate = importBlogPostJson(payload);
		expect(duplicate.ok).toBe(false);
		const update = importBlogPostJson(payload, { updateExisting: true });
		expect(update.ok).toBe(true);
		if (!update.ok) throw new Error('expected update import to succeed');
		expect(update.updatedExisting).toBe(true);
	});
});
