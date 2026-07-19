import { and, eq, like } from 'drizzle-orm';
import { LOCALES, type Locale } from '$lib/i18n';
import {
	isLocale,
	isPublicCopyPage,
	getPathValue,
	publicCopyFields,
	publicCopyPages,
	setPathValue,
	type PublicCopyPage
} from '$lib/publicCopy';
import { db } from '$lib/server/db';
import { marketingPageCopy, messageOverrides, publicCopyDrafts } from '$lib/server/db/schema';
import { listPublicLocales, normalizePublicLocaleCode } from '$lib/server/publicLocales';

function isRegisteredPublicLocale(locale: string): boolean {
	return Boolean(
		normalizePublicLocaleCode(locale) &&
		listPublicLocales({ includeDrafts: true }).some((item) => item.code === locale)
	);
}

type CopyOverride = Record<string, unknown>;
type CopyRows = Record<Locale, CopyOverride>;

const emptyRows = (): CopyRows => ({ en: {}, tr: {}, de: {} });

export function getPublicCopyOverrides(page: PublicCopyPage): CopyRows {
	const rows = db.select().from(marketingPageCopy).where(eq(marketingPageCopy.page, page)).all();
	const copy = emptyRows();
	for (const row of rows) {
		if (isLocale(row.locale) && row.value && typeof row.value === 'object') {
			copy[row.locale] = row.value as CopyOverride;
		}
	}
	const flatRows = db
		.select()
		.from(messageOverrides)
		.where(like(messageOverrides.key, `marketing.${page}.%`))
		.all();
	for (const row of flatRows) {
		if (!isLocale(row.locale)) continue;
		const path = row.key.slice(`marketing.${page}.`.length);
		if (path) setPathValue(copy[row.locale], path, row.value);
	}
	return copy;
}

export function getPublicCopyOverridesForLocale(
	locale: string,
	options: { includeDrafts?: boolean } = {}
): Record<string, CopyOverride> {
	const result: Record<string, CopyOverride> = {};
	const publishedRows = db
		.select()
		.from(messageOverrides)
		.where(like(messageOverrides.key, 'marketing.%'))
		.all();
	const applyRows = (rows: { key: string; locale: string; value: string }[]) => {
		for (const row of rows) {
			if (row.locale !== locale) continue;
			const [, page, ...parts] = row.key.split('.');
			if (!page || parts.length === 0) continue;
			result[page] ??= {};
			setPathValue(result[page], parts.join('.'), row.value);
		}
	};
	applyRows(publishedRows);
	if (options.includeDrafts) {
		applyRows(db.select().from(publicCopyDrafts).all());
	}
	return result;
}

export function listPublicCopyAdminRows() {
	const publishedRows = db
		.select()
		.from(messageOverrides)
		.where(like(messageOverrides.key, 'marketing.%'))
		.all();
	const draftRows = db.select().from(publicCopyDrafts).all();
	const published = new Map<string, CopyOverride>();
	const drafts = new Map<string, CopyOverride>();
	for (const row of publishedRows) {
		const [, page, ...parts] = row.key.split('.');
		if (!page || !isPublicCopyPage(page) || parts.length === 0) continue;
		const key = `${page}:${row.locale}`;
		const value = published.get(key) ?? {};
		setPathValue(value, parts.join('.'), row.value);
		published.set(key, value);
	}
	for (const row of draftRows) {
		const [, page, ...parts] = row.key.split('.');
		if (!page || !isPublicCopyPage(page) || parts.length === 0) continue;
		const key = `${page}:${row.locale}`;
		const value = drafts.get(key) ?? {};
		setPathValue(value, parts.join('.'), row.value);
		drafts.set(key, value);
	}
	return publicCopyPages.map((page) => ({
		...page,
		fields: publicCopyFields[page.key],
		locales: listPublicLocales({ includeDrafts: true }).map(({ code: locale }) => {
			const key = `${page.key}:${locale}`;
			return {
				locale,
				published: published.get(key) ?? {},
				draft: drafts.get(key) ?? {}
			};
		})
	}));
}

export function savePublicCopyOverride(page: string, locale: string, form: FormData) {
	if (!isPublicCopyPage(page)) return { ok: false as const, message: 'Unknown page.' };
	if (!isRegisteredPublicLocale(locale)) return { ok: false as const, message: 'Unknown locale.' };

	const fields = publicCopyFields[page];
	const value: CopyOverride = {};
	for (const field of fields) {
		const raw = String(form.get(field.path) ?? '').trim();
		if (raw) setPathValue(value, field.path, raw);
	}

	db.delete(publicCopyDrafts)
		.where(
			and(eq(publicCopyDrafts.locale, locale), like(publicCopyDrafts.key, `marketing.${page}.%`))
		)
		.run();
	for (const field of fields) {
		const text = getPathValue(value, field.path);
		if (!text) continue;
		db.insert(publicCopyDrafts)
			.values({
				key: `marketing.${page}.${field.path}`,
				locale,
				value: text,
				updatedAt: new Date()
			})
			.run();
	}
	return { ok: true as const, page, locale };
}

export function publishPublicCopyOverride(page: string, locale: string) {
	if (!isPublicCopyPage(page)) return { ok: false as const, message: 'Unknown page.' };
	if (!isRegisteredPublicLocale(locale)) return { ok: false as const, message: 'Unknown locale.' };
	const drafts = db
		.select()
		.from(publicCopyDrafts)
		.where(
			and(eq(publicCopyDrafts.locale, locale), like(publicCopyDrafts.key, `marketing.${page}.%`))
		)
		.all();
	if (drafts.length === 0) return { ok: false as const, message: 'Save a draft first.' };
	db.transaction(() => {
		db.delete(messageOverrides)
			.where(
				and(eq(messageOverrides.locale, locale), like(messageOverrides.key, `marketing.${page}.%`))
			)
			.run();
		for (const row of drafts) {
			db.insert(messageOverrides)
				.values({ key: row.key, locale, value: row.value, updatedAt: new Date() })
				.run();
		}
	});
	return { ok: true as const, page, locale };
}

export function publicLocaleCompleteness(locale: string) {
	const published = getPublicCopyOverridesForLocale(locale);
	const missing: string[] = [];
	for (const page of publicCopyPages) {
		for (const field of publicCopyFields[page.key]) {
			if (!getPathValue(published[page.key], field.path).trim()) {
				missing.push(`${page.key}.${field.path}`);
			}
		}
	}
	return { complete: missing.length === 0, missing };
}

export function resetPublicCopyOverride(page: string, locale: string) {
	if (!isPublicCopyPage(page)) return { ok: false as const, message: 'Unknown page.' };
	if (!isRegisteredPublicLocale(locale)) return { ok: false as const, message: 'Unknown locale.' };
	db.delete(messageOverrides)
		.where(
			and(eq(messageOverrides.locale, locale), like(messageOverrides.key, `marketing.${page}.%`))
		)
		.run();
	db.delete(publicCopyDrafts)
		.where(
			and(eq(publicCopyDrafts.locale, locale), like(publicCopyDrafts.key, `marketing.${page}.%`))
		)
		.run();
	return { ok: true as const, page, locale };
}
