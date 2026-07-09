import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import { getSetting } from '$lib/server/config';

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
	link: string
): Promise<{ devEchoLink?: string }> {
	const result = await sendEmail({
		to: email,
		subject: 'Your saaskaya sign-in link',
		text: `Sign in to saaskaya:\n\n${link}\n\nThe link is valid for 15 minutes and can be used once.`
	});
	if (result.sent) return {};
	if (env.AUTH_DEV_ECHO_LINK === '1' && env.NODE_ENV !== 'production') {
		console.log(
			`[auth] development magic link for ${email}: ${link} (email not sent: ${result.error})`
		);
		return { devEchoLink: link };
	}
	console.error(`[auth] magic-link delivery failed for ${email}: ${result.error}`);
	return {};
}

/** Closed-beta invitation. The recipient requests a fresh, short-lived magic link on arrival. */
export function sendBetaInvitation(email: string, loginUrl: string): Promise<EmailResult> {
	return sendEmail({
		to: email,
		subject: "You're invited to the saaskaya beta",
		text: `You've been invited to the saaskaya closed beta.\n\nOpen your invitation:\n${loginUrl}\n\nUse this email address to request your secure, one-time sign-in link.`
	});
}

/** New-contact notification to the site owner's contact address. */
export async function sendContactNotification(input: {
	to: string;
	siteName: string;
	name: string;
	email: string;
	message: string;
}): Promise<EmailResult> {
	return sendEmail({
		to: input.to,
		subject: `New message via ${input.siteName}`,
		text: `From: ${input.name} <${input.email}>\n\n${input.message}\n\n— sent from your ${input.siteName} contact form (saaskaya)`
	});
}
