import { describe, expect, it } from 'vitest';
import {
	addSubmission,
	countSubmissions,
	listSubmissions,
	listSubmissionsForOwner
} from './contact';
import { getOrSeedDraft, saveDraft } from './repo';
import { getOrCreateUser } from '../auth';

describe('contact submissions', () => {
	it('stores, lists (newest first) and counts per site', () => {
		expect(countSubmissions('site-contact-test')).toBe(0);
		addSubmission({
			siteId: 'site-contact-test',
			name: 'Ayşe',
			email: 'ayse@example.com',
			message: 'Randevu almak istiyorum.',
			locale: 'tr'
		});
		addSubmission({
			siteId: 'site-contact-test',
			name: 'Max',
			email: 'max@example.com',
			message: 'Ich hätte gern einen Termin.',
			locale: 'de'
		});
		addSubmission({
			siteId: 'other-site',
			name: 'X',
			email: 'x@example.com',
			message: 'other',
			locale: 'en'
		});

		expect(countSubmissions('site-contact-test')).toBe(2);
		const list = listSubmissions('site-contact-test');
		expect(list).toHaveLength(2);
		expect(list.map((m) => m.name)).toContain('Ayşe');
		expect(list.every((m) => m.siteId === 'site-contact-test')).toBe(true);
	});
});

describe("listSubmissionsForOwner (admin customer detail: aggregate across all of one owner's sites)", () => {
	it("aggregates messages across 2+ sites of one owner, excludes another owner's", () => {
		const owner = getOrCreateUser('submissions-owner@example.com');
		const stranger = getOrCreateUser('submissions-stranger@example.com');

		const siteA = structuredClone(getOrSeedDraft('seed-psych')!);
		siteA.id = 'site-owner-a';
		siteA.tenantId = 'tenant-owner-a';
		saveDraft(siteA, { ownerUserId: owner.id });

		const siteB = structuredClone(getOrSeedDraft('seed-law')!);
		siteB.id = 'site-owner-b';
		siteB.tenantId = 'tenant-owner-b';
		saveDraft(siteB, { ownerUserId: owner.id });

		const siteC = structuredClone(getOrSeedDraft('seed-dental')!);
		siteC.id = 'site-stranger-c';
		siteC.tenantId = 'tenant-stranger-c';
		saveDraft(siteC, { ownerUserId: stranger.id });

		addSubmission({
			siteId: 'site-owner-a',
			name: 'From A',
			email: 'a@example.com',
			message: 'msg a',
			locale: 'tr'
		});
		addSubmission({
			siteId: 'site-owner-b',
			name: 'From B',
			email: 'b@example.com',
			message: 'msg b',
			locale: 'tr'
		});
		addSubmission({
			siteId: 'site-stranger-c',
			name: 'From C',
			email: 'c@example.com',
			message: 'msg c',
			locale: 'tr'
		});

		const ownerMessages = listSubmissionsForOwner(owner.id);
		expect(ownerMessages.map((m) => m.name).sort()).toEqual(['From A', 'From B']);
		expect(ownerMessages.every((m) => m.siteId !== 'site-stranger-c')).toBe(true);

		const strangerMessages = listSubmissionsForOwner(stranger.id);
		expect(strangerMessages.map((m) => m.name)).toEqual(['From C']);
	});
});
