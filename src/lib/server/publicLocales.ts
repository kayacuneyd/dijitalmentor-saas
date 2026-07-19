import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { publicLocales } from '$lib/server/db/schema';

const localeCodeSchema = z
	.string()
	.trim()
	.regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'Use a language code such as fr or pt-BR.');

export type PublicLocaleRow = typeof publicLocales.$inferSelect;

const CORE_PUBLIC_LOCALES = [
	{ code: 'en', name: 'English', sortOrder: 0 },
	{ code: 'tr', name: 'Türkçe', sortOrder: 1 },
	{ code: 'de', name: 'Deutsch', sortOrder: 2 }
] as const;

function ensureCorePublicLocales(): void {
	const now = new Date();
	for (const locale of CORE_PUBLIC_LOCALES) {
		db.insert(publicLocales)
			.values({ ...locale, active: true, createdAt: now, updatedAt: now })
			.onConflictDoNothing({ target: publicLocales.code })
			.run();
	}
}

export function normalizePublicLocaleCode(value: string): string | null {
	const raw = value.trim().replace('_', '-');
	const [language, region] = raw.split('-');
	const normalized = region
		? `${language?.toLowerCase()}-${region.toUpperCase()}`
		: language?.toLowerCase();
	const parsed = localeCodeSchema.safeParse(normalized);
	return parsed.success ? parsed.data : null;
}

export function listPublicLocales(options: { includeDrafts?: boolean } = {}): PublicLocaleRow[] {
	ensureCorePublicLocales();
	const rows = db
		.select()
		.from(publicLocales)
		.orderBy(asc(publicLocales.sortOrder), asc(publicLocales.name))
		.all();
	return options.includeDrafts ? rows : rows.filter((row) => row.active);
}

export function isActivePublicLocale(code: string): boolean {
	return Boolean(
		db
			.select({ active: publicLocales.active })
			.from(publicLocales)
			.where(eq(publicLocales.code, code))
			.get()?.active
	);
}

export function addPublicLocale(input: { code: string; name: string }) {
	const code = normalizePublicLocaleCode(input.code);
	const name = input.name.trim().slice(0, 80);
	if (!code) return { ok: false as const, message: 'Enter a valid locale code.' };
	if (!name) return { ok: false as const, message: 'Language name is required.' };
	const existing = db.select().from(publicLocales).where(eq(publicLocales.code, code)).get();
	if (existing) return { ok: false as const, message: 'This language already exists.' };
	const sortOrder = listPublicLocales({ includeDrafts: true }).length;
	db.insert(publicLocales)
		.values({ code, name, active: false, sortOrder, createdAt: new Date(), updatedAt: new Date() })
		.run();
	return { ok: true as const, code };
}

export function setPublicLocaleActive(code: string, active: boolean) {
	const existing = db.select().from(publicLocales).where(eq(publicLocales.code, code)).get();
	if (!existing) return { ok: false as const, message: 'Language not found.' };
	if (['en', 'tr', 'de'].includes(code) && !active) {
		return { ok: false as const, message: 'Core languages cannot be disabled.' };
	}
	db.update(publicLocales)
		.set({ active, updatedAt: new Date() })
		.where(eq(publicLocales.code, code))
		.run();
	return { ok: true as const, code, active };
}
