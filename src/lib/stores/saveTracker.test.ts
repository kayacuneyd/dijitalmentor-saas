import { describe, expect, it } from 'vitest';
import { SaveTracker } from './saveTracker';

describe('SaveTracker', () => {
	it('starts flushed (nothing edited yet)', () => {
		const t = new SaveTracker();
		expect(t.flushed).toBe(true);
	});

	it('is unflushed after an edit, and flushed again once that save completes', () => {
		const t = new SaveTracker();
		t.markEdited();
		expect(t.flushed).toBe(false);
		const gen = t.beginSave();
		expect(t.completeSave(gen)).toBe('saved');
		expect(t.flushed).toBe(true);
	});

	it('reports stale when an edit lands while a save is in flight', () => {
		const t = new SaveTracker();
		t.markEdited();
		const gen = t.beginSave(); // save PUT starts, captures gen 1
		t.markEdited(); // user types again before the PUT resolves — gen 2
		expect(t.completeSave(gen)).toBe('stale');
		expect(t.flushed).toBe(false); // the newer edit still hasn't been saved
	});

	it('a second save after a stale result converges to flushed', () => {
		const t = new SaveTracker();
		t.markEdited();
		const gen1 = t.beginSave();
		t.markEdited();
		expect(t.completeSave(gen1)).toBe('stale');

		const gen2 = t.beginSave();
		expect(t.completeSave(gen2)).toBe('saved');
		expect(t.flushed).toBe(true);
	});

	it('markReplaced() marks the current generation as saved (server already has it)', () => {
		const t = new SaveTracker();
		t.markEdited();
		t.markEdited();
		expect(t.flushed).toBe(false);
		t.markReplaced();
		expect(t.flushed).toBe(true);
	});
});
