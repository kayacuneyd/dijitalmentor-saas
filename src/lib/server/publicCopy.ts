import { and, eq } from 'drizzle-orm';
import { LOCALES, type Locale } from '$lib/i18n';
import {
	isLocale,
	isPublicCopyPage,
	publicCopyFields,
	publicCopyPages,
	setPathValue,
	type PublicCopyPage
} from '$lib/publicCopy';
import { db } from '$lib/server/db';
import { marketingPageCopy } from '$lib/server/db/schema';

type CopyOverride = Record<string, unknown>;
type CopyRows = Record<Locale, CopyOverride>;

const emptyRows = (): CopyRows => ({ en: {}, tr: {}, de: {} });

export function getPublicCopyOverrides(page: PublicCopyPage): CopyRows {
	const rows = db
		.select()
		.from(marketingPageCopy)
		.where(eq(marketingPageCopy.page, page))
		.all();
	const copy = emptyRows();
	for (const row of rows) {
		if (isLocale(row.locale) && row.value && typeof row.value === 'object') {
			copy[row.locale] = row.value as CopyOverride;
		}
	}
	return copy;
}

export function listPublicCopyAdminRows() {
	const stored = db.select().from(marketingPageCopy).all();
	const lookup = new Map<string, CopyOverride>();
	for (const row of stored) {
		if (!isPublicCopyPage(row.page) || !isLocale(row.locale)) continue;
		lookup.set(`${row.page}:${row.locale}`, (row.value ?? {}) as CopyOverride);
	}
	return publicCopyPages.map((page) => ({
		...page,
		fields: publicCopyFields[page.key],
		locales: LOCALES.map((locale) => ({
			locale,
			value: lookup.get(`${page.key}:${locale}`) ?? {}
		}))
	}));
}

export function savePublicCopyOverride(page: string, locale: string, form: FormData) {
	if (!isPublicCopyPage(page)) return { ok: false as const, message: 'Unknown page.' };
	if (!isLocale(locale)) return { ok: false as const, message: 'Unknown locale.' };

	const fields = publicCopyFields[page];
	const value: CopyOverride = {};
	for (const field of fields) {
		const raw = String(form.get(field.path) ?? '').trim();
		if (raw) setPathValue(value, field.path, raw);
	}

	db.insert(marketingPageCopy)
		.values({ page, locale, value, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: [marketingPageCopy.page, marketingPageCopy.locale],
			set: { value, updatedAt: new Date() }
		})
		.run();
	return { ok: true as const, page, locale };
}

export function resetPublicCopyOverride(page: string, locale: string) {
	if (!isPublicCopyPage(page)) return { ok: false as const, message: 'Unknown page.' };
	if (!isLocale(locale)) return { ok: false as const, message: 'Unknown locale.' };
	db.delete(marketingPageCopy)
		.where(and(eq(marketingPageCopy.page, page), eq(marketingPageCopy.locale, locale)))
		.run();
	return { ok: true as const, page, locale };
}
