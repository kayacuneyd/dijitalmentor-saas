import { isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { createInquiry, validateInquiry, type InquirySource } from '$lib/server/inquiries';
import { load } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

function url(query = '') {
	return new URL(`http://localhost/admin/inbox${query}`);
}

function seedInquiry(source: InquirySource = 'contact') {
	const parsed = validateInquiry({
		source,
		name: 'Inbox Visitor',
		email: `inbox-${Date.now()}-${Math.random()}@example.com`,
		category: 'support',
		message: 'I need help understanding the beta and support options.',
		website: ''
	});
	if (!parsed.ok) throw new Error('expected valid inquiry');
	return createInquiry(parsed.data);
}

describe('GET /admin/inbox (load)', () => {
	it('redirects signed-out visitors and 403s non-admins', () => {
		try {
			load({ locals: { user: null }, url: url() } as never);
			throw new Error('expected redirect');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
		}
		try {
			load({ locals: { user: nonAdmin }, url: url() } as never);
			throw new Error('expected 403');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(403);
		}
	});

	it('returns public inquiries and filters by source/status', () => {
		const contact = seedInquiry('contact');
		const chat = seedInquiry('chat');
		const assistant = seedInquiry('assistant');
		const all = load({ locals: { user: admin }, url: url() } as never) as {
			inquiries: { id: string }[];
			status: string;
			source: string;
		};
		expect(all.inquiries.some((row) => row.id === contact.id)).toBe(true);
		expect(all.inquiries.some((row) => row.id === chat.id)).toBe(true);

		const chatOnly = load({
			locals: { user: admin },
			url: url('?source=chat&status=open')
		} as never) as { inquiries: { id: string }[]; status: string; source: string };
		expect(chatOnly.source).toBe('chat');
		expect(chatOnly.status).toBe('open');
		expect(chatOnly.inquiries.some((row) => row.id === chat.id)).toBe(true);
		expect(chatOnly.inquiries.some((row) => row.id === contact.id)).toBe(false);

		const assistantOnly = load({
			locals: { user: admin },
			url: url('?source=assistant')
		} as never) as { inquiries: { id: string }[]; source: string };
		expect(assistantOnly.source).toBe('assistant');
		expect(assistantOnly.inquiries.some((row) => row.id === assistant.id)).toBe(true);
		expect(assistantOnly.inquiries.some((row) => row.id === chat.id)).toBe(false);
	});
});
