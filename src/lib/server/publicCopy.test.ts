import { describe, expect, it } from 'vitest';
import { and, eq, like } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { messageOverrides, publicCopyDrafts } from '$lib/server/db/schema';
import {
	getPublicCopyOverrides,
	getPublicCopyOverridesForLocale,
	publishPublicCopyOverride,
	resetPublicCopyOverride,
	savePublicCopyOverride
} from './publicCopy';
import { addPublicLocale, normalizePublicLocaleCode } from './publicLocales';

describe('owner public content workflow', () => {
	it('saves, publishes, reads and resets page-locale overrides', () => {
		const key = 'marketing.home.%';
		db.delete(messageOverrides)
			.where(and(eq(messageOverrides.locale, 'tr'), like(messageOverrides.key, key)))
			.run();
		db.delete(publicCopyDrafts)
			.where(and(eq(publicCopyDrafts.locale, 'tr'), like(publicCopyDrafts.key, key)))
			.run();

		const form = new FormData();
		form.set('h1', 'Test ana başlık');
		form.set('lead', 'Test açıklama');
		form.set('problemItems.0.title', 'Test problem');

		expect(savePublicCopyOverride('home', 'tr', form).ok).toBe(true);
		expect(getPublicCopyOverrides('home').tr).toEqual({});
		expect(publishPublicCopyOverride('home', 'tr').ok).toBe(true);
		expect(getPublicCopyOverrides('home').tr).toMatchObject({
			h1: 'Test ana başlık',
			lead: 'Test açıklama',
			problemItems: [{ title: 'Test problem' }]
		});

		expect(resetPublicCopyOverride('home', 'tr').ok).toBe(true);
		expect(getPublicCopyOverrides('home').tr).toEqual({});
	});

	it('normalizes owner-added locale codes', () => {
		expect(normalizePublicLocaleCode('pt_br')).toBe('pt-BR');
		expect(normalizePublicLocaleCode('not-a-locale')).toBeNull();
	});

	it('keeps saved copy private until it is published', () => {
		const locale = 'fr';
		const added = addPublicLocale({ code: locale, name: 'Français' });
		expect(added.ok).toBe(true);

		const form = new FormData();
		form.set('title', 'Titre de test');
		const saved = savePublicCopyOverride('home', locale, form);
		expect(saved.ok).toBe(true);
		expect(getPublicCopyOverridesForLocale(locale).home).toBeUndefined();
		expect(getPublicCopyOverridesForLocale(locale, { includeDrafts: true }).home).toMatchObject({
			title: 'Titre de test'
		});

		const published = publishPublicCopyOverride('home', locale);
		expect(published.ok).toBe(true);
		expect(getPublicCopyOverridesForLocale(locale).home).toMatchObject({
			title: 'Titre de test'
		});
	});

	it('rejects unknown pages and unregistered locales', () => {
		expect(savePublicCopyOverride('missing', 'tr', new FormData()).ok).toBe(false);
		expect(resetPublicCopyOverride('home', 'zz').ok).toBe(false);
	});
});
