import { getContext, setContext } from 'svelte';
import type { Locale } from '$lib/i18n';
import { t as translate, type CatalogKey } from './catalog';

const CONTEXT_KEY = Symbol('i18n-translate');

export type Translator = (key: CatalogKey, vars?: Record<string, string | number>) => string;

/** Called once, in the root `+layout.svelte`, with getters for the current
 *  request's locale/DB overrides (not the values themselves) — `setContext` only
 *  runs during component init, so the returned translator re-reads through the
 *  getters on every call to stay correct after a cookie-locale switch triggers
 *  `invalidateAll()` and `data` updates. Every component below can then call
 *  `getTranslate()` instead of importing the catalog/locale separately. */
export function setTranslateContext(
	getLocale: () => Locale,
	getOverrides: () => Record<string, string> | undefined
): void {
	const translator: Translator = (key, vars) => translate(key, getLocale(), vars, getOverrides());
	setContext(CONTEXT_KEY, translator);
}

export function getTranslate(): Translator {
	const translator = getContext<Translator | undefined>(CONTEXT_KEY);
	if (!translator) {
		throw new Error(
			'getTranslate() called outside the i18n context — is root +layout.svelte missing setTranslateContext()?'
		);
	}
	return translator;
}
