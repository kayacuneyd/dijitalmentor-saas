import {
	createHash,
	randomBytes,
	randomInt,
	randomUUID,
	scryptSync,
	timingSafeEqual
} from 'node:crypto';
import { and, desc, eq, lt } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	ownerEmailCodes,
	ownerLoginEvents,
	ownerSessions,
	ownerTrustedDevices
} from '$lib/server/db/schema';
import { sendEmail } from '$lib/server/email';
import { normalizeEmail, rateLimit } from '$lib/server/auth';

export const OWNER_SESSION_COOKIE = 'sk_owner_session';
export const OWNER_DEVICE_COOKIE = 'sk_owner_device';

const OWNER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const OWNER_DEVICE_TTL_SECONDS = 180 * 24 * 60 * 60;
const OWNER_EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
const OWNER_CODE_MAX_ATTEMPTS = 5;

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');

export type OwnerRequestFingerprint = {
	ipPrefixHash: string | null;
	userAgentHash: string | null;
};

export type OwnerPasswordResult =
	| { ok: true; status: 'signed-in'; sessionToken: string; deviceToken: string }
	| { ok: true; status: 'code-sent'; deviceToken: string; emailSent: boolean }
	| { ok: false; reason: 'not-configured' | 'invalid' | 'rate-limited' | 'email-failed' };

export type OwnerCodeResult =
	| { ok: true; sessionToken: string }
	| { ok: false; reason: 'not-configured' | 'invalid' | 'rate-limited' };

export function ownerSlug(): string | null {
	const raw = process.env.OWNER_LOGIN_PATH?.trim();
	if (!raw) return null;
	const cleaned = raw.replace(/^\/+/, '').replace(/\/+$/, '');
	if (!cleaned) return null;
	if (cleaned.startsWith('owner/')) return cleaned.slice('owner/'.length);
	return cleaned;
}

export function ownerEmail(): string | null {
	const explicit = process.env.OWNER_EMAIL?.trim();
	if (explicit) return normalizeEmail(explicit);
	const firstAdmin = (process.env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((email) => email.trim())
		.find(Boolean);
	return firstAdmin ? normalizeEmail(firstAdmin) : null;
}

export function ownerLoginConfigured(): boolean {
	return Boolean(ownerSlug() && ownerEmail() && process.env.OWNER_PASSWORD_HASH?.trim());
}

export function ownerRouteMatches(secret: string | undefined): boolean {
	const slug = ownerSlug();
	return Boolean(slug && secret === slug);
}

export function requestFingerprint(input: {
	request: Request;
	getClientAddress: () => string;
}): OwnerRequestFingerprint {
	const forwarded = input.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
	const ip = forwarded || input.request.headers.get('cf-connecting-ip') || input.getClientAddress();
	const ua = input.request.headers.get('user-agent') ?? '';
	return {
		ipPrefixHash: ip ? sha256(ipPrefix(ip)) : null,
		userAgentHash: ua ? sha256(ua.slice(0, 500)) : null
	};
}

function ipPrefix(ip: string): string {
	if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':');
	return ip.split('.').slice(0, 3).join('.');
}

function safeEqual(a: Buffer, b: Buffer): boolean {
	return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyOwnerPassword(password: string): boolean {
	const stored = process.env.OWNER_PASSWORD_HASH?.trim();
	if (!stored) return false;
	const parts = stored.split(':');
	if (parts.length !== 7 || parts[0] !== 'scrypt' || parts[1] !== 'v1') return false;
	const [, , nRaw, rRaw, pRaw, saltB64, hashB64] = parts;
	const N = Number(nRaw);
	const r = Number(rRaw);
	const p = Number(pRaw);
	if (!Number.isSafeInteger(N) || !Number.isSafeInteger(r) || !Number.isSafeInteger(p))
		return false;
	try {
		const salt = Buffer.from(saltB64, 'base64url');
		const expected = Buffer.from(hashB64, 'base64url');
		const actual = scryptSync(password, salt, expected.length, {
			N,
			r,
			p,
			maxmem: 64 * 1024 * 1024
		});
		return safeEqual(actual, expected);
	} catch {
		return false;
	}
}

export function ownerDeviceToken(cookies: Cookies): string {
	const existing = cookies.get(OWNER_DEVICE_COOKIE);
	return existing && existing.length >= 32 ? existing : newToken();
}

export function setOwnerDeviceCookie(cookies: Cookies, token: string): void {
	cookies.set(OWNER_DEVICE_COOKIE, token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: OWNER_DEVICE_TTL_SECONDS
	});
}

export function setOwnerSessionCookie(cookies: Cookies, token: string): void {
	cookies.set(OWNER_SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: OWNER_SESSION_TTL_MS / 1000
	});
}

export function clearOwnerSessionCookie(cookies: Cookies): void {
	cookies.delete(OWNER_SESSION_COOKIE, { path: '/' });
}

export function destroyOwnerSession(token: string | undefined): void {
	if (!token) return;
	db.delete(ownerSessions)
		.where(eq(ownerSessions.tokenHash, sha256(token)))
		.run();
}

export function getOwnerSessionUser(
	token: string | undefined
): { id: string; email: string } | null {
	if (!token) return null;
	const now = new Date();
	const row = db
		.select()
		.from(ownerSessions)
		.where(eq(ownerSessions.tokenHash, sha256(token)))
		.get();
	if (!row || row.expiresAt.getTime() < Date.now()) return null;
	db.delete(ownerSessions).where(lt(ownerSessions.expiresAt, now)).run();
	return { id: `owner-${sha256(row.email).slice(0, 10)}`, email: row.email };
}

function createOwnerSession(
	email: string,
	deviceHash: string,
	fingerprint: OwnerRequestFingerprint
): string {
	const token = newToken();
	db.insert(ownerSessions)
		.values({
			tokenHash: sha256(token),
			email,
			deviceHash,
			ipPrefixHash: fingerprint.ipPrefixHash,
			userAgentHash: fingerprint.userAgentHash,
			createdAt: new Date(),
			expiresAt: new Date(Date.now() + OWNER_SESSION_TTL_MS)
		})
		.run();
	db.delete(ownerSessions).where(lt(ownerSessions.expiresAt, new Date())).run();
	return token;
}

function trustedDevice(
	email: string,
	deviceHash: string,
	fingerprint: OwnerRequestFingerprint
): boolean {
	const row = db
		.select()
		.from(ownerTrustedDevices)
		.where(
			and(eq(ownerTrustedDevices.email, email), eq(ownerTrustedDevices.deviceHash, deviceHash))
		)
		.get();
	if (!row) return false;
	if (row.ipPrefixHash !== fingerprint.ipPrefixHash) return false;
	if (row.userAgentHash !== fingerprint.userAgentHash) return false;
	db.update(ownerTrustedDevices)
		.set({ lastSeenAt: new Date() })
		.where(eq(ownerTrustedDevices.deviceHash, deviceHash))
		.run();
	return true;
}

function trustDevice(
	email: string,
	deviceHash: string,
	fingerprint: OwnerRequestFingerprint
): void {
	const now = new Date();
	db.insert(ownerTrustedDevices)
		.values({
			deviceHash,
			email,
			ipPrefixHash: fingerprint.ipPrefixHash,
			userAgentHash: fingerprint.userAgentHash,
			createdAt: now,
			lastSeenAt: now
		})
		.onConflictDoUpdate({
			target: ownerTrustedDevices.deviceHash,
			set: {
				email,
				ipPrefixHash: fingerprint.ipPrefixHash,
				userAgentHash: fingerprint.userAgentHash,
				lastSeenAt: now
			}
		})
		.run();
}

function logOwnerEvent(
	event: string,
	email: string | null,
	fingerprint: OwnerRequestFingerprint
): void {
	db.insert(ownerLoginEvents)
		.values({
			id: `ole-${randomUUID().slice(0, 10)}`,
			email,
			event,
			ipPrefixHash: fingerprint.ipPrefixHash,
			userAgentHash: fingerprint.userAgentHash,
			createdAt: new Date()
		})
		.run();
}

function hashCode(email: string, deviceHash: string, code: string): string {
	return sha256(`${email}:${deviceHash}:${code}`);
}

async function sendOwnerCode(
	email: string,
	deviceHash: string,
	fingerprint: OwnerRequestFingerprint
): Promise<boolean> {
	const code = String(randomInt(100000, 1000000));
	const now = new Date();
	db.delete(ownerEmailCodes).where(lt(ownerEmailCodes.expiresAt, now)).run();
	db.insert(ownerEmailCodes)
		.values({
			id: `olc-${randomUUID().slice(0, 10)}`,
			email,
			deviceHash,
			codeHash: hashCode(email, deviceHash, code),
			ipPrefixHash: fingerprint.ipPrefixHash,
			userAgentHash: fingerprint.userAgentHash,
			attempts: 0,
			createdAt: now,
			expiresAt: new Date(Date.now() + OWNER_EMAIL_CODE_TTL_MS)
		})
		.run();
	const result = await sendEmail({
		to: email,
		subject: 'saaskaya owner login code',
		text: `Your saaskaya owner login code is ${code}.\n\nIt expires in 10 minutes. If you did not request it, change OWNER_PASSWORD_HASH and review owner_login_events.`
	});
	return result.sent;
}

export async function startOwnerPasswordLogin(input: {
	password: string;
	deviceToken: string;
	fingerprint: OwnerRequestFingerprint;
	rateLimitKey: string;
}): Promise<OwnerPasswordResult> {
	const email = ownerEmail();
	if (!ownerLoginConfigured() || !email) return { ok: false, reason: 'not-configured' };
	if (!rateLimit(`owner-login:${input.rateLimitKey}`, 5, 15 * 60_000)) {
		logOwnerEvent('rate_limited', email, input.fingerprint);
		return { ok: false, reason: 'rate-limited' };
	}
	if (!verifyOwnerPassword(input.password)) {
		logOwnerEvent('password_failed', email, input.fingerprint);
		return { ok: false, reason: 'invalid' };
	}
	const deviceHash = sha256(input.deviceToken);
	if (trustedDevice(email, deviceHash, input.fingerprint)) {
		logOwnerEvent('password_trusted_success', email, input.fingerprint);
		return {
			ok: true,
			status: 'signed-in',
			sessionToken: createOwnerSession(email, deviceHash, input.fingerprint),
			deviceToken: input.deviceToken
		};
	}
	const emailSent = await sendOwnerCode(email, deviceHash, input.fingerprint);
	logOwnerEvent(emailSent ? 'code_sent' : 'code_send_failed', email, input.fingerprint);
	if (!emailSent) return { ok: false, reason: 'email-failed' };
	return { ok: true, status: 'code-sent', deviceToken: input.deviceToken, emailSent };
}

export function verifyOwnerEmailCode(input: {
	code: string;
	deviceToken: string | undefined;
	fingerprint: OwnerRequestFingerprint;
	rateLimitKey: string;
}): OwnerCodeResult {
	const email = ownerEmail();
	if (!ownerLoginConfigured() || !email || !input.deviceToken) {
		return { ok: false, reason: 'not-configured' };
	}
	if (!rateLimit(`owner-code:${input.rateLimitKey}`, 8, 15 * 60_000)) {
		logOwnerEvent('code_rate_limited', email, input.fingerprint);
		return { ok: false, reason: 'rate-limited' };
	}
	const deviceHash = sha256(input.deviceToken);
	const row = db
		.select()
		.from(ownerEmailCodes)
		.where(and(eq(ownerEmailCodes.email, email), eq(ownerEmailCodes.deviceHash, deviceHash)))
		.orderBy(desc(ownerEmailCodes.createdAt))
		.get();
	if (!row || row.expiresAt.getTime() < Date.now() || row.attempts >= OWNER_CODE_MAX_ATTEMPTS) {
		logOwnerEvent('code_failed', email, input.fingerprint);
		return { ok: false, reason: 'invalid' };
	}
	db.update(ownerEmailCodes)
		.set({ attempts: row.attempts + 1 })
		.where(eq(ownerEmailCodes.id, row.id))
		.run();
	if (row.codeHash !== hashCode(email, deviceHash, input.code.trim())) {
		logOwnerEvent('code_failed', email, input.fingerprint);
		return { ok: false, reason: 'invalid' };
	}
	db.delete(ownerEmailCodes).where(eq(ownerEmailCodes.id, row.id)).run();
	trustDevice(email, deviceHash, input.fingerprint);
	logOwnerEvent('code_success', email, input.fingerprint);
	return { ok: true, sessionToken: createOwnerSession(email, deviceHash, input.fingerprint) };
}
