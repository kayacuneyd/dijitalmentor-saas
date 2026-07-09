import { describe, expect, it } from 'vitest';
import { addSubmission, countSubmissions, listSubmissions } from './contact';

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
