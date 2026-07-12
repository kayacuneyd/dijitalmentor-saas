import { randomBytes, scryptSync } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '$lib/server/db';
import {
	ownerEmailCodes,
	ownerLoginEvents,
	ownerSessions,
	ownerTrustedDevices
} from '$lib/server/db/schema';
import { OWNER_DEVICE_COOKIE } from '$lib/server/ownerAuth';
import { actions } from './+page.server';

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

function request(data: Record<string, string>) {
	return new Request('https://saaskaya.com/owner/private-owner-slug', {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'vitest-owner' },
		body: new URLSearchParams(data)
	});
}

function cookies(initial: Record<string, string> = {}) {
	const jar = new Map(Object.entries(initial));
	return {
		get: (name: string) => jar.get(name),
		set: (name: string, value: string) => jar.set(name, value),
		delete: (name: string) => jar.delete(name),
		jar
	};
}

beforeEach(() => {
	vi.stubEnv('OWNER_LOGIN_PATH', 'private-owner-slug');
	vi.stubEnv('OWNER_EMAIL', 'owner@example.com');
	vi.stubEnv('OWNER_PASSWORD_HASH', passwordHash('correct password'));
	sentEmails.length = 0;
	db.delete(ownerEmailCodes).run();
	db.delete(ownerLoginEvents).run();
	db.delete(ownerSessions).run();
	db.delete(ownerTrustedDevices).run();
});

describe('owner route actions', () => {
	it('accepts a valid email code using the hidden device token when the device cookie is missing', async () => {
		const loginCookies = cookies();
		const login = (await actions.login({
			request: request({ password: 'correct password' }),
			params: { secret: 'private-owner-slug' },
			cookies: loginCookies,
			getClientAddress: () => '203.0.113.42'
		} as never)) as { needsCode: boolean; deviceToken: string };
		const code = sentEmails[0].text.match(/\b\d{6}\b/)?.[0];

		expect(login.needsCode).toBe(true);
		expect(login.deviceToken).toBeTruthy();
		expect(loginCookies.jar.has(OWNER_DEVICE_COOKIE)).toBe(true);
		expect(code).toBeTruthy();

		const verifyCookies = cookies();
		await expect(
			actions.verifyCode({
				request: request({ code: code!, deviceToken: login.deviceToken }),
				params: { secret: 'private-owner-slug' },
				cookies: verifyCookies,
				getClientAddress: () => '203.0.113.42'
			} as never)
		).rejects.toMatchObject({ status: 303, location: '/admin' });

		expect(verifyCookies.jar.has(OWNER_DEVICE_COOKIE)).toBe(true);
		expect(db.select().from(ownerSessions).all()).toHaveLength(1);
	});

	it('accepts a valid email code when the browser autofill inserts spaces', async () => {
		const login = (await actions.login({
			request: request({ password: 'correct password' }),
			params: { secret: 'private-owner-slug' },
			cookies: cookies(),
			getClientAddress: () => '203.0.113.42'
		} as never)) as { needsCode: boolean; deviceToken: string };
		const code = sentEmails[0].text.match(/\b\d{6}\b/)?.[0];
		const spacedCode = code!.split('').join(' ');

		expect(login.needsCode).toBe(true);

		await expect(
			actions.verifyCode({
				request: request({ code: spacedCode, deviceToken: login.deviceToken }),
				params: { secret: 'private-owner-slug' },
				cookies: cookies(),
				getClientAddress: () => '203.0.113.42'
			} as never)
		).rejects.toMatchObject({ status: 303, location: '/admin' });

		expect(db.select().from(ownerSessions).all()).toHaveLength(1);
	});
});
