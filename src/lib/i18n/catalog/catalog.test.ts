import { describe, expect, it } from 'vitest';
import { CATALOG_FLAT } from './index';

const LOCALES = ['en', 'tr', 'de'] as const;

describe('translation catalog — structural parity', () => {
	it('has an identical key set across en/tr/de', () => {
		const enKeys = new Set(Object.keys(CATALOG_FLAT.en));
		for (const locale of LOCALES) {
			const keys = new Set(Object.keys(CATALOG_FLAT[locale]));
			const missing = [...enKeys].filter((key) => !keys.has(key));
			const extra = [...keys].filter((key) => !enKeys.has(key));
			expect({ locale, missing, extra }).toEqual({ locale, missing: [], extra: [] });
		}
	});

	it('has identical {placeholder} interpolation tokens per key across locales', () => {
		const placeholders = (value: string) =>
			[...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
		const mismatches: string[] = [];
		for (const key of Object.keys(CATALOG_FLAT.en)) {
			const enTokens = placeholders(CATALOG_FLAT.en[key]);
			for (const locale of LOCALES) {
				const value = CATALOG_FLAT[locale][key];
				if (value === undefined) continue; // already caught by the key-set test above
				if (JSON.stringify(placeholders(value)) !== JSON.stringify(enTokens)) {
					mismatches.push(`${locale}:${key}`);
				}
			}
		}
		expect(mismatches).toEqual([]);
	});

	it('never ships an empty string unless the English default is also empty', () => {
		// Reproduces the exact regression class that once shipped a blank locale entry
		// and silently fell back to the raw base-language string mid-session
		// (docs/PROGRESS.md — the onboarding `otherProfession` bug).
		const empty: string[] = [];
		for (const key of Object.keys(CATALOG_FLAT.en)) {
			if (CATALOG_FLAT.en[key].length === 0) continue;
			for (const locale of LOCALES) {
				if (locale === 'en') continue;
				if ((CATALOG_FLAT[locale][key] ?? '').length === 0) empty.push(`${locale}:${key}`);
			}
		}
		expect(empty).toEqual([]);
	});
});
