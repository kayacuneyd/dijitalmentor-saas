import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { getSetting } from '$lib/server/config';
import type { Locale } from '$lib/i18n';
import { serverTranslator } from '$lib/server/messageOverrides';

/**
 * Transactional mail (PLAN §7 / beta-launch spec). One `sendEmail()` seam, three
 * back-ends chosen by the `EMAIL_PROVIDER` setting so the operator can switch live:
 *   - `smtp`   → Hostinger (or any) SMTP via nodemailer (closed-beta default);
 *   - `resend` → Resend REST API over plain fetch (no SDK), the migration target;
 *   - unset/`dev` → nothing is sent, magic links fall back to the dev echo.
 * Degrades gracefully: a missing/failed transport never throws to callers — auth
 * still logs+echoes the link, contact submissions are still stored in the DB.
 */

export type EmailResult = { sent: boolean; error?: string };

const fromAddress = () =>
	getSetting('EMAIL_FROM') ?? getSetting('SMTP_USER') ?? 'saaskaya <onboarding@resend.dev>';

async function sendViaSMTP(input: {
	to: string;
	subject: string;
	text: string;
}): Promise<EmailResult> {
	const host = getSetting('SMTP_HOST');
	const user = getSetting('SMTP_USER');
	const pass = getSetting('SMTP_PASS');
	if (!host || !user || !pass) return { sent: false, error: 'SMTP is not fully configured' };
	// getSetting returns undefined (not '') when unset → default the port before Number().
	const port = Number(getSetting('SMTP_PORT') ?? '465');
	try {
		const transporter = nodemailer.createTransport({
			host,
			port,
			secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
			auth: { user, pass }
		});
		await transporter.sendMail({
			from: fromAddress(),
			to: input.to,
			subject: input.subject,
			text: input.text
		});
		return { sent: true };
	} catch (error) {
		return { sent: false, error: `SMTP: ${String(error)}` };
	}
}

async function sendViaResend(input: {
	to: string;
	subject: string;
	text: string;
}): Promise<EmailResult> {
	const apiKey = getSetting('RESEND_API_KEY');
	if (!apiKey) return { sent: false, error: 'RESEND_API_KEY not configured' };
	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
			body: JSON.stringify({
				from: fromAddress(),
				to: [input.to],
				subject: input.subject,
				text: input.text
			})
		});
		if (!res.ok) return { sent: false, error: `Resend ${res.status}: ${await res.text()}` };
		return { sent: true };
	} catch (error) {
		return { sent: false, error: String(error) };
	}
}

export async function sendEmail(input: {
	to: string;
	subject: string;
	text: string;
}): Promise<EmailResult> {
	// Back-compat: if no provider is chosen but a Resend key exists, use Resend
	// (older deployments only set RESEND_API_KEY, never EMAIL_PROVIDER).
	const provider =
		getSetting('EMAIL_PROVIDER') ?? (getSetting('RESEND_API_KEY') ? 'resend' : 'dev');
	switch (provider) {
		case 'smtp':
			return sendViaSMTP(input);
		case 'resend':
			return sendViaResend(input);
		default:
			return { sent: false, error: 'no email provider configured' };
	}
}

/** Magic-link delivery; the dev echo stays available until real email is configured. */
export async function sendMagicLink(
	email: string,
	link: string,
	locale: Locale
): Promise<{ devEchoLink?: string }> {
	const t = serverTranslator(locale);
	const result = await sendEmail({
		to: email,
		subject: t('email.magicLink.subject'),
		text: t('email.magicLink.body', { link })
	});
	if (result.sent) return {};
	// Dev echo: only available when no real provider is configured (dev mode).
	// When a real provider (Resend/SMTP) is configured, a failed delivery must
	// not expose the token through the dev echo fallback.
	const provider = getSetting('EMAIL_PROVIDER');
	const hasRealProvider = provider && provider !== 'dev';
	if (!hasRealProvider && env.AUTH_DEV_ECHO_LINK === '1' && env.NODE_ENV !== 'production') {
		console.log(
			`[auth] development magic link for ${email}: ${link} (email not sent: ${result.error})`
		);
		return { devEchoLink: link };
	}
	console.error(`[auth] magic-link delivery failed for ${email}: ${result.error}`);
	return {};
}

/** Closed-beta invitation. The recipient requests a fresh, short-lived magic link on arrival. */
export function sendBetaInvitation(
	email: string,
	loginUrl: string,
	locale: Locale
): Promise<EmailResult> {
	const t = serverTranslator(locale);
	return sendEmail({
		to: email,
		subject: t('email.betaInvitation.subject'),
		text: t('email.betaInvitation.body', { loginUrl })
	});
}

/** New-contact notification to the site owner's contact address. */
export async function sendContactNotification(input: {
	to: string;
	siteName: string;
	name: string;
	email: string;
	message: string;
	locale: Locale;
}): Promise<EmailResult> {
	const t = serverTranslator(input.locale);
	return sendEmail({
		to: input.to,
		subject: t('email.contactNotification.subject', { siteName: input.siteName }),
		text: t('email.contactNotification.body', {
			name: input.name,
			email: input.email,
			message: input.message,
			siteName: input.siteName
		})
	});
}
