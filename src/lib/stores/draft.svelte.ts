import type { Locale, Site } from '$lib/schema/site';
import { SaveTracker } from './saveTracker';

export type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error';

const AUTOSAVE_DEBOUNCE_MS = 800;
const FLUSH_MAX_ATTEMPTS = 5;

/**
 * Editor draft store (Svelte runes). Holds the working `Site` draft plus the editor's
 * ephemeral UI state (edit locale, current page). Every mutation goes through `update()`,
 * which notifies the preview bridge (postMessage) and schedules a debounced autosave.
 * Text/color edits are direct writes to the draft — no AI involved (constitution §4).
 *
 * `#tracker` guards against a race where an edit lands while a save PUT is already in
 * flight: without it, the in-flight save's success handler would stomp status back to
 * 'saved' even though the newest edit was never sent, so `publish()` would snapshot a
 * stale draft. `save()` only reports 'saved' when the generation it started with is
 * still the latest; otherwise it leaves the store 'dirty' so the pending debounce (or
 * a `flush()` caller) sends the newer edit.
 */
export class DraftStore {
	site = $state<Site>()!;
	status = $state<SaveStatus>('saved');
	lastSaveError = $state<string | null>(null);
	/** Locale whose content is being edited (not persisted). */
	editLocale = $state<Locale>()!;
	/** Page shown in the preview iframe and the Content tab (not persisted). */
	currentSlug = $state<string>()!;

	#saveTimer: ReturnType<typeof setTimeout> | undefined;
	#listeners = new Set<(site: Site) => void>();
	#tracker = new SaveTracker();
	#inflight: Promise<boolean> | null = null;

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
		this.lastSaveError = null;
		this.#tracker.markEdited();
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
		this.#tracker.markReplaced();
		this.status = 'saved'; // the server already saved it
		this.lastSaveError = null;
		for (const listener of this.#listeners) listener(this.site);
	}

	/** PUT the current draft. Serializes concurrent calls so an older body can never
	 *  land after a newer one. Returns whether the PUT succeeded (not whether the
	 *  saved data is now fully up to date — check `status === 'saved'` for that, or
	 *  use `flush()` when you need a guarantee). */
	async save(): Promise<boolean> {
		while (this.#inflight) await this.#inflight;
		if (this.#tracker.flushed) {
			clearTimeout(this.#saveTimer);
			if (this.status !== 'saving') this.status = 'saved';
			return true;
		}
		const run = this.#doSave();
		this.#inflight = run;
		try {
			return await run;
		} finally {
			this.#inflight = null;
		}
	}

	async #doSave(): Promise<boolean> {
		clearTimeout(this.#saveTimer);
		this.status = 'saving';
		const gen = this.#tracker.beginSave();
		try {
			const res = await fetch(`/api/sites/${this.site.id}/draft`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(this.site)
			});
			if (!res.ok) {
				this.status = 'error';
				this.lastSaveError = await saveErrorMessage(res);
				return false;
			}
			this.lastSaveError = null;
			this.status = this.#tracker.completeSave(gen) === 'saved' ? 'saved' : 'dirty';
			if (this.status === 'dirty') {
				this.#saveTimer = setTimeout(() => void this.save(), AUTOSAVE_DEBOUNCE_MS);
			}
			return true;
		} catch {
			this.status = 'error';
			this.lastSaveError = 'Taslak kaydedilemedi. Bağlantıyı kontrol edip tekrar dene.';
			return false;
		}
	}

	/** Save repeatedly until the tracker confirms the server has the latest draft, or a
	 *  save fails. Use before publish — a plain `save()` can resolve 'true' while a
	 *  newer edit is still unsent. */
	async flush(): Promise<boolean> {
		for (let attempt = 0; attempt < FLUSH_MAX_ATTEMPTS; attempt++) {
			if (this.#tracker.flushed) return true;
			const ok = await this.save();
			if (!ok) return false;
		}
		return this.#tracker.flushed;
	}
}

async function saveErrorMessage(response: Response): Promise<string> {
	try {
		const body = await response.json();
		const issue = Array.isArray(body.issues) ? body.issues[0] : null;
		return issue?.message
			? `Taslak kaydedilemedi: ${issue.message}`
			: body.message
				? `Taslak kaydedilemedi: ${body.message}`
				: `Taslak kaydedilemedi (${response.status}).`;
	} catch {
		return `Taslak kaydedilemedi (${response.status}).`;
	}
}
