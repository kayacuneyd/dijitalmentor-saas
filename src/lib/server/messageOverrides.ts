import { and, eq } from 'drizzle-orm';
import { isLocale, type Locale } from '$lib/i18n';
import { isCatalogKey, listCatalogEntries, type CatalogEntry } from '$lib/i18n/catalog/registry';
import { db } from '$lib/server/db';
import { messageOverrides } from '$lib/server/db/schema';

/** One filtered query per request — no cache, same convention as
 *  `src/lib/server/config.ts`'s `getSetting()`. An owner edit is live on the
 *  very next request; SQLite is fast enough at this table's expected size. */
export function getMessageOverrides(locale: Locale): Record<string, string> {
	const rows = db.select().from(messageOverrides).where(eq(messageOverrides.locale, locale)).all();
	return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export type CatalogAdminEntry = CatalogEntry & {
	overrideByLocale: Partial<Record<Locale, string>>;
};

export function listMessageOverrideEntries(): CatalogAdminEntry[] {
	const rows = db.select().from(messageOverrides).all();
	const overrides = new Map<string, string>();
	for (const row of rows) {
		if (isLocale(row.locale)) overrides.set(`${row.key}:${row.locale}`, row.value);
	}
	return listCatalogEntries().map((entry) => {
		const overrideByLocale: Partial<Record<Locale, string>> = {};
		for (const locale of ['en', 'tr', 'de'] as const) {
			const value = overrides.get(`${entry.key}:${locale}`);
			if (value !== undefined) overrideByLocale[locale] = value;
		}
		return { ...entry, overrideByLocale };
	});
}

/** Rejects any `key` not present in the code catalog — the panel can only ever
 *  change the value of a string the code already defines, never invent new
 *  keys/structure/layout (project non-goal: no free-form content builder). */
export function saveMessageOverride(key: string, locale: string, value: string) {
	if (!isCatalogKey(key)) return { ok: false as const, message: 'Unknown key.' };
	if (!isLocale(locale)) return { ok: false as const, message: 'Unknown locale.' };
	const trimmed = value.trim();
	if (!trimmed) return resetMessageOverride(key, locale);
	db.insert(messageOverrides)
		.values({ key, locale, value: trimmed, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: [messageOverrides.key, messageOverrides.locale],
			set: { value: trimmed, updatedAt: new Date() }
		})
		.run();
	return { ok: true as const, key, locale };
}

export function resetMessageOverride(key: string, locale: string) {
	if (!isCatalogKey(key)) return { ok: false as const, message: 'Unknown key.' };
	if (!isLocale(locale)) return { ok: false as const, message: 'Unknown locale.' };
	db.delete(messageOverrides)
		.where(and(eq(messageOverrides.key, key), eq(messageOverrides.locale, locale)))
		.run();
	return { ok: true as const, key, locale };
}
