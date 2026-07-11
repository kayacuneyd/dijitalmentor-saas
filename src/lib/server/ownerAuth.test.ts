import { randomBytes, scryptSync } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '$lib/server/db';
import {
	ownerEmailCodes,
	ownerLoginEvents,
	ownerSessions,
	ownerTrustedDevices
} from '$lib/server/db/schema';
import {
	getOwnerSessionUser,
	ownerLoginConfigured,
	ownerRouteMatches,
	startOwnerPasswordLogin,
	verifyOwnerEmailCode,
	verifyOwnerPassword,
	type OwnerRequestFingerprint
} from './ownerAuth';

const sentEmails: { to: string; subject: string; text: string }[] = [];

vi.mock('$lib/server/email', () => ({
	sendEmail: vi.fn(async (input: { to: string; subject: string; text: string }) => {
		sentEmails.push(input);
		return { sent: true };
	})
}));

function passwordHash(password: string): string {
	const N = 16384;
	const r = 8;
	const p = 1;
	const salt = randomBytes(16);
	const hash = scryptSync(password, salt, 64, { N, r, p, maxmem: 64 * 1024 * 1024 });
	return `scrypt:v1:${N}:${r}:${p}:${salt.toString('base64url')}:${hash.toString('base64url')}`;
}

const fingerprint: OwnerRequestFingerprint = {
	ipPrefixHash: 'ip-hash',
	userAgentHash: 'ua-hash'
};

beforeEach(() => {
	vi.stubEnv('OWNER_LOGIN_PATH', 'private-owner-slug');
	vi.stubEnv('OWNER_EMAIL', 'OWNER@Example.com');
	vi.stubEnv('OWNER_PASSWORD_HASH', passwordHash('correct horse battery staple'));
	sentEmails.length = 0;
	db.delete(ownerEmailCodes).run();
	db.delete(ownerLoginEvents).run();
	db.delete(ownerSessions).run();
	db.delete(ownerTrustedDevices).run();
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('owner login config + password verification', () => {
	it('matches the private route slug and verifies only the scrypt password hash', () => {
		expect(ownerLoginConfigured()).toBe(true);
		expect(ownerRouteMatches('private-owner-slug')).toBe(true);
		expect(ownerRouteMatches('wrong')).toBe(false);
		expect(verifyOwnerPassword('correct horse battery staple')).toBe(true);
		expect(verifyOwnerPassword('wrong password')).toBe(false);
	});
});

describe('owner login risk flow', () => {
	it('requires email code for a new device, then trusts the device for matching IP/user-agent', async () => {
		const first = await startOwnerPasswordLogin({
			password: 'correct horse battery staple',
			deviceToken: 'device-token-1',
			fingerprint,
			rateLimitKey: `first-${Math.random()}`
		});
		expect(first).toMatchObject({ ok: true, status: 'code-sent' });
		expect(sentEmails).toHaveLength(1);
		const code = sentEmails[0].text.match(/\b\d{6}\b/)?.[0];
		expect(code).toBeTruthy();

		const codeResult = verifyOwnerEmailCode({
			code: code!,
			deviceToken: 'device-token-1',
			fingerprint,
			rateLimitKey: `code-${Math.random()}`
		});
		expect(codeResult.ok).toBe(true);
		if (!codeResult.ok) throw new Error('expected owner code success');
		expect(getOwnerSessionUser(codeResult.sessionToken)?.email).toBe('owner@example.com');

		const second = await startOwnerPasswordLogin({
			password: 'correct horse battery staple',
			deviceToken: 'device-token-1',
			fingerprint,
			rateLimitKey: `second-${Math.random()}`
		});
		expect(second).toMatchObject({ ok: true, status: 'signed-in' });
		expect(sentEmails).toHaveLength(1);
	});

	it('does not trust the same device when the IP prefix changes', async () => {
		const first = await startOwnerPasswordLogin({
			password: 'correct horse battery staple',
			deviceToken: 'device-token-2',
			fingerprint,
			rateLimitKey: `ip-first-${Math.random()}`
		});
		expect(first).toMatchObject({ ok: true, status: 'code-sent' });
		const code = sentEmails[0].text.match(/\b\d{6}\b/)?.[0];
		const verified = verifyOwnerEmailCode({
			code: code!,
			deviceToken: 'device-token-2',
			fingerprint,
			rateLimitKey: `ip-code-${Math.random()}`
		});
		expect(verified.ok).toBe(true);

		const changed = await startOwnerPasswordLogin({
			password: 'correct horse battery staple',
			deviceToken: 'device-token-2',
			fingerprint: { ...fingerprint, ipPrefixHash: 'different-ip-hash' },
			rateLimitKey: `ip-second-${Math.random()}`
		});
		expect(changed).toMatchObject({ ok: true, status: 'code-sent' });
		expect(sentEmails).toHaveLength(2);
	});
});
