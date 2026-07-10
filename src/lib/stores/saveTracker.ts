/**
 * Tracks whether the latest edit generation has actually reached the server.
 * `save()` in the draft store captures `beginSave()` before it starts a PUT; if
 * another edit lands while that PUT is in flight, `completeSave()` reports 'stale'
 * instead of 'saved' so the caller knows to save again rather than trusting a
 * response that raced past a newer edit.
 */
export class SaveTracker {
	#gen = 0;
	#savedGen = 0;

	/** Call on every draft mutation. */
	markEdited(): void {
		this.#gen++;
	}

	/** Call when the server already has the latest draft (e.g. an AI-applied edit). */
	markReplaced(): void {
		this.#savedGen = this.#gen;
	}

	/** Call right before starting a save PUT; pass the result to completeSave(). */
	beginSave(): number {
		return this.#gen;
	}

	/** Call after a save PUT resolves successfully. */
	completeSave(genAtStart: number): 'saved' | 'stale' {
		if (genAtStart === this.#gen) {
			this.#savedGen = genAtStart;
			return 'saved';
		}
		return 'stale';
	}

	get flushed(): boolean {
		return this.#gen === this.#savedGen;
	}
}
