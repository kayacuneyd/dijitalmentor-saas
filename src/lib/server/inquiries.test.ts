import { describe, expect, it } from 'vitest';
import {
	InquiryClosedError,
	addInquiryMessage,
	createInquiry,
	getInquiryDetail,
	listInquiries,
	setInquiryStatus,
	validateInquiry
} from './inquiries';

describe('public inquiries', () => {
	it('validates public inquiry input and rejects honeypot submissions', () => {
		const invalidEmail = validateInquiry({
			source: 'contact',
			name: 'Ada',
			email: 'not email',
			category: 'support',
			message: 'This message is long enough to be accepted.',
			website: ''
		});
		expect(invalidEmail.ok).toBe(false);
		if (!invalidEmail.ok) expect(invalidEmail.field).toBe('email');

		const bot = validateInquiry({
			source: 'chat',
			name: 'Ada',
			email: 'ada@example.com',
			category: 'support',
			message: 'This message is long enough to be accepted.',
			website: 'https://spam.example'
		});
		expect(bot.ok).toBe(false);
		if (!bot.ok) expect(bot.field).toBe('website');
	});

	it('creates an inquiry with first visitor message and normalized email', () => {
		const parsed = validateInquiry({
			source: 'contact',
			name: 'Ada Lovelace',
			email: 'ADA@EXAMPLE.COM',
			category: 'beta_access',
			message: 'I would like to join the beta for my consulting practice.',
			website: ''
		});
		expect(parsed.ok).toBe(true);
		if (!parsed.ok) throw new Error('expected valid inquiry');
		const inquiry = createInquiry(parsed.data);
		expect(inquiry.email).toBe('ada@example.com');
		expect(inquiry.status).toBe('open');
		expect(inquiry.lastMessageBy).toBe('visitor');

		const detail = getInquiryDetail(inquiry.id);
		expect(detail?.messages).toHaveLength(1);
		expect(detail?.messages[0].body).toContain('join the beta');
	});

	it('accepts assistant-widget inquiries and filters them by source', () => {
		const parsed = validateInquiry({
			source: 'assistant',
			name: 'Widget Visitor',
			email: 'widget@example.com',
			category: 'support',
			message: 'I asked the assistant for help and it opened this support form.',
			website: ''
		});
		expect(parsed.ok).toBe(true);
		if (!parsed.ok) throw new Error('expected valid assistant inquiry');
		const inquiry = createInquiry(parsed.data);
		expect(inquiry.source).toBe('assistant');
		expect(listInquiries({ source: 'assistant' }).some((row) => row.id === inquiry.id)).toBe(true);
		expect(listInquiries({ source: 'contact' }).some((row) => row.id === inquiry.id)).toBe(false);
	});

	it('lists by source/status and tracks admin replies', () => {
		const parsed = validateInquiry({
			source: 'chat',
			name: 'Grace Hopper',
			email: 'grace@example.com',
			category: 'support',
			message: 'I have a support question about publishing my website.',
			website: ''
		});
		if (!parsed.ok) throw new Error('expected valid inquiry');
		const inquiry = createInquiry(parsed.data);
		expect(listInquiries({ source: 'chat' }).some((row) => row.id === inquiry.id)).toBe(true);
		expect(listInquiries({ status: 'open' }).some((row) => row.id === inquiry.id)).toBe(true);

		addInquiryMessage({
			inquiryId: inquiry.id,
			authorKind: 'admin',
			authorEmail: 'admin@saaskaya.com',
			body: 'Thanks, I will check this.'
		});
		const replied = getInquiryDetail(inquiry.id);
		expect(replied?.status).toBe('pending');
		expect(replied?.lastMessageBy).toBe('admin');
		expect(replied?.messages).toHaveLength(2);

		setInquiryStatus(inquiry.id, 'closed');
		expect(() =>
			addInquiryMessage({
				inquiryId: inquiry.id,
				authorKind: 'visitor',
				authorEmail: 'grace@example.com',
				body: 'One more thing.'
			})
		).toThrow(InquiryClosedError);
	});
});
