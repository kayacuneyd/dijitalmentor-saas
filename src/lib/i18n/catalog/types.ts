/** A translation catalog is an arbitrarily nested object whose leaves are strings. */
export type DeepStringRecord = { [key: string]: string | DeepStringRecord };

/** Same tree shape as `T`, but every string leaf is widened to `string` — lets
 *  `tr`/`de` catalogs be checked against the shape of the reference `en` catalog
 *  without being forced to reuse its literal English text. */
export type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

/** Every dot-path to a string leaf in `T`, e.g. `'common.save'`. Used to keep
 *  `t()` calls typo-checked at compile time instead of failing silently at runtime. */
export type Paths<T> = {
	[K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];
