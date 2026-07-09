import { describe, expect, it } from 'vitest';
import {
	getOrSeedDraft,
	getPublished,
	publishDraft,
	resolvePublishedByKey,
	saveDraft,
	unpublishSite
} from './repo';
import { attachSiteDomain } from '$lib/server/domains';
import { seedSites } from '$lib/seed';

describe('publish snapshots', () => {
	it('publishes the draft as v1 and keeps the snapshot immutable under draft edits', () => {
		getOrSeedDraft('seed-law');
		expect(getPublished('seed-law')).toBeNull(); // draft-only until published

		expect(publishDraft('seed-law')).toBe(1);
		const published = getPublished('seed-law');
		expect(published?.settings.siteName).toBe('Aksoy Hukuk Bürosu');

		// edit the draft — the published snapshot must not move
		const draft = structuredClone(getOrSeedDraft('seed-law')!);
		draft.settings.siteName = 'Yeni İsim';
		saveDraft(draft);
		expect(getPublished('seed-law')?.settings.siteName).toBe('Aksoy Hukuk Bürosu');

		// republish picks up the edit as v2
		expect(publishDraft('seed-law')).toBe(2);
		expect(getPublished('seed-law')?.settings.siteName).toBe('Yeni İsim');
	});

	it('unpublish takes the site offline but keeps the draft', () => {
		getOrSeedDraft('seed-psych');
		publishDraft('seed-psych');
		expect(getPublished('seed-psych')).not.toBeNull();
		unpublishSite('seed-psych');
		expect(getPublished('seed-psych')).toBeNull();
		expect(getOrSeedDraft('seed-psych')).not.toBeNull();
	});

	it('publishing an unknown site returns null', () => {
		expect(publishDraft('ghost-site')).toBeNull();
	});
});

describe('resolvePublishedByKey', () => {
	it('resolves by site id and by canonical custom domain', () => {
		const draft = structuredClone(seedSites.dental);
		saveDraft(draft);
		attachSiteDomain('seed-dental', 'praxis-yilmaz.example', null);
		publishDraft('seed-dental');

		expect(resolvePublishedByKey('seed-dental')?.id).toBe('seed-dental');
		expect(resolvePublishedByKey('praxis-yilmaz.example')?.id).toBe('seed-dental');
		expect(resolvePublishedByKey('unknown-key')).toBeNull();
	});
});
