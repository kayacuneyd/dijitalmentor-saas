import type { DeepStringRecord, Widen } from './types';

/** Reference catalog. Every other locale file is checked against this file's
 *  key shape via `satisfies CatalogShape` — adding a key here without a matching
 *  `tr`/`de` entry is a compile error, not a silent runtime fallback. */
export const en = {
	common: {
		save: 'Save',
		cancel: 'Cancel',
		delete: 'Delete',
		edit: 'Edit',
		back: 'Back',
		loading: 'Loading…',
		error: 'Something went wrong.'
	}
} satisfies DeepStringRecord;

export type CatalogShape = Widen<typeof en>;
