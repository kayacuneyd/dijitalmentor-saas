import { describe, expect, it } from 'vitest';
import {
	canManageSite,
	consumeLoginToken,
	createLoginToken,
	createSession,
	destroySession,
	getOrCreateUser,
	getSessionUser,
	rateLimit
} from './auth';

describe('magic-link tokens', () => {
	it('round-trips and is single-use', () => {
		const token = createLoginToken('User@Example.COM ');
		expect(consumeLoginToken(token)).toBe('user@example.com');
		expect(consumeLoginToken(token)).toBeNull(); // second use fails
	});

	it('rejects unknown tokens', () => {
		expect(consumeLoginToken('not-a-real-token')).toBeNull();
	});
});

describe('users + sessions', () => {
	it('first login creates the user, second reuses it', () => {
		const a = getOrCreateUser('kaya@example.com');
		const b = getOrCreateUser('KAYA@example.com');
		expect(b.id).toBe(a.id);
	});

	it('session round-trips and can be revoked', () => {
		const user = getOrCreateUser('session-test@example.com');
		const token = createSession(user.id);
		expect(getSessionUser(token)?.email).toBe('session-test@example.com');
		destroySession(token);
		expect(getSessionUser(token)).toBeNull();
		expect(getSessionUser(undefined)).toBeNull();
	});
});

describe('canManageSite', () => {
	const user = { id: 'user-1', email: 'a@b.co' };
	it('ownerless (seed) sites are open; owned sites are owner-only', () => {
		expect(canManageSite(null, null)).toBe(true);
		expect(canManageSite(user, null)).toBe(true);
		expect(canManageSite(user, 'user-1')).toBe(true);
		expect(canManageSite(user, 'user-2')).toBe(false);
		expect(canManageSite(null, 'user-2')).toBe(false);
	});
});

describe('rateLimit', () => {
	it('allows max hits per window, then blocks', () => {
		const key = `test:${Math.random()}`;
		for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 60_000)).toBe(true);
		expect(rateLimit(key, 5, 60_000)).toBe(false);
	});
});
