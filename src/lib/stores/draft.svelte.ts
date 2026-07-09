import type { Locale, Site } from '$lib/schema/site';

export type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error';

const AUTOSAVE_DEBOUNCE_MS = 800;

/**
 * Editor draft store (Svelte runes). Holds the working `Site` draft plus the editor's
 * ephemeral UI state (edit locale, current page). Every mutation goes through `update()`,
 * which notifies the preview bridge (postMessage) and schedules a debounced autosave.
 * Text/color edits are direct writes to the draft — no AI involved (constitution §4).
 */
export class DraftStore {
	site = $state<Site>()!;
	status = $state<SaveStatus>('saved');
	/** Locale whose content is being edited (not persisted). */
	editLocale = $state<Locale>()!;
	/** Page shown in the preview iframe and the Content tab (not persisted). */
	currentSlug = $state<string>()!;

	#saveTimer: ReturnType<typeof setTimeout> | undefined;
	#listeners = new Set<(site: Site) => void>();

	constructor(initial: Site) {
		this.site = initial;
		this.editLocale = initial.defaultLocale;
		this.currentSlug = initial.pages[0].slug;
	}

	get currentPage() {
		return this.site.pages.find((p) => p.slug === this.currentSlug) ?? this.site.pages[0];
	}

	/** Apply a mutation to the draft, notify the preview, and schedule autosave. */
	update(mutate: (site: Site) => void) {
		mutate(this.site);
		this.status = 'dirty';
		for (const listener of this.#listeners) listener(this.site);
		clearTimeout(this.#saveTimer);
		this.#saveTimer = setTimeout(() => void this.save(), AUTOSAVE_DEBOUNCE_MS);
	}

	/** Subscribe to draft changes (the editor uses this to postMessage into the iframe). */
	onChange(listener: (site: Site) => void): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	/** Replace the whole draft with a server-persisted version (AI chat edits). */
	replace(site: Site) {
		clearTimeout(this.#saveTimer);
		this.site = site;
		if (!site.pages.some((p) => p.slug === this.currentSlug)) {
			this.currentSlug = site.pages[0].slug;
		}
		this.status = 'saved'; // the server already saved it
		for (const listener of this.#listeners) listener(this.site);
	}

	async save() {
		clearTimeout(this.#saveTimer);
		this.status = 'saving';
		try {
			const res = await fetch(`/api/sites/${this.site.id}/draft`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(this.site)
			});
			this.status = res.ok ? 'saved' : 'error';
		} catch {
			this.status = 'error';
		}
	}
}
