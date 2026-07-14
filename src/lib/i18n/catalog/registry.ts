import { LOCALES, type Locale } from '$lib/i18n';
import { CATALOG_FLAT, type CatalogKey } from './index';

export type CatalogEntry = {
	key: CatalogKey;
	namespace: string;
	label: string;
	kind: 'text' | 'textarea';
	textByLocale: Record<Locale, string>;
};

function labelFor(key: string): string {
	const last = key.split('.').at(-1) ?? key;
	const spaced = last.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** The full editable-key list, derived mechanically from the `en` catalog — there
 *  is no separate hand-maintained field list to keep in sync (see `publicCopyFields`
 *  in `$lib/publicCopy` for the pattern this deliberately avoids repeating). */
export function listCatalogEntries(): CatalogEntry[] {
	return Object.keys(CATALOG_FLAT.en)
		.sort()
		.map((key) => {
			const textByLocale = Object.fromEntries(
				LOCALES.map((locale) => [locale, CATALOG_FLAT[locale][key]])
			) as Record<Locale, string>;
			return {
				key: key as CatalogKey,
				namespace: key.split('.')[0],
				label: labelFor(key),
				kind: textByLocale.en.length > 60 ? 'textarea' : 'text',
				textByLocale
			};
		});
}

export function isCatalogKey(value: string): value is CatalogKey {
	return value in CATALOG_FLAT.en;
}
