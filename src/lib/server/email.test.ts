import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock is hoisted above imports; define the spies via vi.hoisted so the
// factory can reference them without a TDZ error.
const { sendMail, createTransport } = vi.hoisted(() => {
	const sendMail = vi.fn();
	return { sendMail, createTransport: vi.fn(() => ({ sendMail })) };
});
vi.mock('nodemailer', () => ({ default: { createTransport } }));

import { sendBetaInvitation, sendEmail, sendMagicLink } from './email';
import { clearSetting, setSetting } from './config';

const KEYS = [
	'EMAIL_PROVIDER',
	'SMTP_HOST',
	'SMTP_PORT',
	'SMTP_USER',
	'SMTP_PASS',
	'RESEND_API_KEY',
	'EMAIL_FROM'
];
const clearAll = () => KEYS.forEach(clearSetting);

const msg = { to: 'a@b.com', subject: 'Hi', text: 'Body' };

beforeEach(() => {
	vi.clearAllMocks();
	clearAll();
});
afterEach(clearAll);

describe('sendEmail provider seam', () => {
	it('defaults to dev (no send) when no provider and no Resend key', async () => {
		const result = await sendEmail(msg);
		expect(result.sent).toBe(false);
		expect(sendMail).not.toHaveBeenCalled();
	});

	it('SMTP: defaults the port to 465 (not NaN) when SMTP_PORT is unset', async () => {
		setSetting('EMAIL_PROVIDER', 'smtp');
		setSetting('SMTP_HOST', 'smtp.hostinger.com');
		setSetting('SMTP_USER', 'noreply@saaskaya.digitaltamam.com');
		setSetting('SMTP_PASS', 'secret');
		const result = await sendEmail(msg);
		expect(result.sent).toBe(true);
		expect(createTransport).toHaveBeenCalledWith(
			expect.objectContaining({ host: 'smtp.hostinger.com', port: 465, secure: true })
		);
		expect(sendMail).toHaveBeenCalledWith(
			expect.objectContaining({ to: 'a@b.com', from: 'noreply@saaskaya.digitaltamam.com' })
		);
	});

	it('SMTP: port 587 uses STARTTLS (secure=false)', async () => {
		setSetting('EMAIL_PROVIDER', 'smtp');
		setSetting('SMTP_HOST', 'smtp.hostinger.com');
		setSetting('SMTP_PORT', '587');
		setSetting('SMTP_USER', 'u');
		setSetting('SMTP_PASS', 'p');
		await sendEmail(msg);
		expect(createTransport).toHaveBeenCalledWith(
			expect.objectContaining({ port: 587, secure: false })
		);
	});

	it('SMTP: reports not-configured without crashing when creds are missing', async () => {
		setSetting('EMAIL_PROVIDER', 'smtp');
		const result = await sendEmail(msg);
		expect(result.sent).toBe(false);
		expect(createTransport).not.toHaveBeenCalled();
	});

	it('Resend: posts to the Resend API over fetch', async () => {
		setSetting('EMAIL_PROVIDER', 'resend');
		setSetting('RESEND_API_KEY', 're_test');
		const fetchMock = vi.fn(
			async (_input: string | URL | Request, _init?: RequestInit) =>
				new Response('{}', { status: 200 })
		);
		vi.stubGlobal('fetch', fetchMock);
		const result = await sendEmail(msg);
		expect(result.sent).toBe(true);
		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.resend.com/emails',
			expect.objectContaining({ method: 'POST' })
		);
		vi.unstubAllGlobals();
	});

	it('back-compat: a lone RESEND_API_KEY (no EMAIL_PROVIDER) still uses Resend', async () => {
		setSetting('RESEND_API_KEY', 're_test');
		const fetchMock = vi.fn(
			async (_input: string | URL | Request, _init?: RequestInit) =>
				new Response('{}', { status: 200 })
		);
		vi.stubGlobal('fetch', fetchMock);
		const result = await sendEmail(msg);
		expect(result.sent).toBe(true);
		expect(createTransport).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});

	it('does not leak a failed production magic-link token to logs', async () => {
		setSetting('EMAIL_PROVIDER', 'resend');
		setSetting('RESEND_API_KEY', 're_test');
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => new Response('provider rejected request', { status: 403 }))
		);
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
		const link = 'https://saaskaya.com/login/verify?token=secret-token';

		const result = await sendMagicLink('person@example.com', link);

		expect(result).toEqual({});
		expect(error).toHaveBeenCalledWith(expect.stringContaining('delivery failed'));
		expect(error.mock.calls.flat().join(' ')).not.toContain('secret-token');
		expect(log.mock.calls.flat().join(' ')).not.toContain('secret-token');
		vi.unstubAllGlobals();
	});

	it('sends a beta invitation through the configured provider', async () => {
		setSetting('EMAIL_PROVIDER', 'resend');
		setSetting('RESEND_API_KEY', 're_test');
		const fetchMock = vi.fn(
			async (_input: string | URL | Request, _init?: RequestInit) =>
				new Response('{}', { status: 200 })
		);
		vi.stubGlobal('fetch', fetchMock);

		const result = await sendBetaInvitation(
			'invitee@example.com',
			'https://saaskaya.com/login?email=invitee%40example.com'
		);

		expect(result.sent).toBe(true);
		const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
		expect(request.to).toEqual(['invitee@example.com']);
		expect(request.text).toContain('https://saaskaya.com/login?email=');
		vi.unstubAllGlobals();
	});
});
