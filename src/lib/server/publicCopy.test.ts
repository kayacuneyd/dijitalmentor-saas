import { describe, expect, it } from 'vitest';
import { db } from '$lib/server/db';
import { marketingPageCopy } from '$lib/server/db/schema';
import {
	getPublicCopyOverrides,
	resetPublicCopyOverride,
	savePublicCopyOverride
} from '$lib/server/publicCopy';
import { and, eq } from 'drizzle-orm';

describe('public copy overrides', () => {
	it('saves, reads and resets page-locale overrides', () => {
		db.delete(marketingPageCopy)
			.where(and(eq(marketingPageCopy.page, 'home'), eq(marketingPageCopy.locale, 'tr')))
			.run();

		const form = new FormData();
		form.set('h1', 'Test ana başlık');
		form.set('lead', 'Test açıklama');
		form.set('problemItems.0.title', 'Test problem');

		const saved = savePublicCopyOverride('home', 'tr', form);
		expect(saved.ok).toBe(true);
		expect(getPublicCopyOverrides('home').tr).toMatchObject({
			h1: 'Test ana başlık',
			lead: 'Test açıklama',
			problemItems: [{ title: 'Test problem' }]
		});

		const reset = resetPublicCopyOverride('home', 'tr');
		expect(reset.ok).toBe(true);
		expect(getPublicCopyOverrides('home').tr).toEqual({});
	});

	it('rejects unknown pages and locales', () => {
		expect(savePublicCopyOverride('missing', 'tr', new FormData()).ok).toBe(false);
		expect(resetPublicCopyOverride('home', 'fr').ok).toBe(false);
	});
});
