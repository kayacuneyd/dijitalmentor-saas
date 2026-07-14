import type { Locale } from '$lib/i18n';
import { en, type CatalogShape } from './en';
import { tr } from './tr';
import { de } from './de';
import type { DeepStringRecord, Paths } from './types';

export type { CatalogShape } from './en';
export type CatalogKey = Paths<CatalogShape>;

function flatten(node: DeepStringRecord, prefix = ''): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [key, value] of Object.entries(node)) {
		const path = prefix ? `${prefix}.${key}` : key;
		if (typeof value === 'string') out[path] = value;
		else Object.assign(out, flatten(value, path));
	}
	return out;
}

export const CATALOG: Record<Locale, DeepStringRecord> = { en, tr, de };

export const CATALOG_FLAT: Record<Locale, Record<string, string>> = {
	en: flatten(en),
	tr: flatten(tr),
	de: flatten(de)
};

/** Looks up `key` for `locale`, preferring a non-empty DB override, then the
 *  locale's catalog entry, then the English default. Never throws — an
 *  owner-panel typo or a key that genuinely doesn't exist yet must never 500 a
 *  page; it logs and falls back to the raw key instead. */
export function t(
	key: CatalogKey,
	locale: Locale,
	vars?: Record<string, string | number>,
	overrides?: Record<string, string>
): string {
	const override = overrides?.[key];
	const raw =
		override && override.length > 0
			? override
			: (CATALOG_FLAT[locale][key] ?? CATALOG_FLAT.en[key]);
	if (raw === undefined) {
		console.warn(`[i18n] missing catalog key: ${key}`);
		return key;
	}
	if (!vars) return raw;
	return raw.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}
