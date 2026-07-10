import { isActionFailure, isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { createInquiry, getInquiryDetail, validateInquiry } from '$lib/server/inquiries';
import { actions, load } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

function seedInquiry() {
	const parsed = validateInquiry({
		source: 'contact',
		name: 'Detail Visitor',
		email: `detail-${Date.now()}-${Math.random()}@example.com`,
		category: 'billing',
		message: 'I have a billing question before joining the paid plan.',
		website: ''
	});
	if (!parsed.ok) throw new Error('expected valid inquiry');
	return createInquiry(parsed.data);
}

function formRequest(data: Record<string, string>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(data)) form.set(key, value);
	return new Request('http://localhost/admin/inbox/test', { method: 'POST', body: form });
}

describe('GET /admin/inbox/[inquiryId] (load)', () => {
	it('guards admin access and 404s unknown inquiries', () => {
		try {
			load({ params: { inquiryId: 'whatever' }, locals: { user: null } } as never);
			throw new Error('expected redirect');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
		}
		try {
			load({ params: { inquiryId: 'whatever' }, locals: { user: nonAdmin } } as never);
			throw new Error('expected 403');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(403);
		}
		try {
			load({ params: { inquiryId: 'missing' }, locals: { user: admin } } as never);
			throw new Error('expected 404');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(404);
		}
	});

	it('returns detail, stores admin replies, and updates status', async () => {
		const inquiry = seedInquiry();
		const result = load({
			params: { inquiryId: inquiry.id },
			locals: { user: admin }
		} as never) as { inquiry: { id: string; messages: unknown[] } };
		expect(result.inquiry.id).toBe(inquiry.id);
		expect(result.inquiry.messages).toHaveLength(1);

		await actions.reply({
			request: formRequest({ body: 'Thanks for writing. I will follow up by email.' }),
			params: { inquiryId: inquiry.id },
			locals: { user: admin }
		} as never);
		expect(getInquiryDetail(inquiry.id)?.status).toBe('pending');
		expect(getInquiryDetail(inquiry.id)?.messages).toHaveLength(2);

		await actions.setStatus({
			request: formRequest({ status: 'resolved' }),
			params: { inquiryId: inquiry.id },
			locals: { user: admin }
		} as never);
		expect(getInquiryDetail(inquiry.id)?.status).toBe('resolved');
	});

	it('rejects empty replies and invalid statuses', async () => {
		const inquiry = seedInquiry();
		const empty = await actions.reply({
			request: formRequest({ body: '' }),
			params: { inquiryId: inquiry.id },
			locals: { user: admin }
		} as never);
		expect(isActionFailure(empty)).toBe(true);

		const invalidStatus = await actions.setStatus({
			request: formRequest({ status: 'not-real' }),
			params: { inquiryId: inquiry.id },
			locals: { user: admin }
		} as never);
		expect(isActionFailure(invalidStatus)).toBe(true);
	});
});
