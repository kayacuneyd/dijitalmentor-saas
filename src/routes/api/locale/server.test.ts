import { describe, expect, it } from 'vitest';
import { getOrCreateUser, getSessionUser, createSession } from '$lib/server/auth';
import { POST } from './+server';

function fakeCookies() {
	const store = new Map<string, string>();
	return {
		set: (name: string, value: string) => store.set(name, value),
		get: (name: string) => store.get(name)
	};
}

async function call(body: unknown, locals: { user: { id: string; email: string } | null }) {
	const cookies = fakeCookies();
	const res = await POST({
		request: new Request('http://localhost/api/locale', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		cookies,
		locals
	} as unknown as Parameters<typeof POST>[0]);
	return { res, cookies };
}

describe('POST /api/locale', () => {
	it('sets the cookie for anonymous visitors and returns ok', async () => {
		const { res, cookies } = await call({ locale: 'de' }, { user: null });
		expect(res.status).toBe(200);
		expect((await res.json()).locale).toBe('de');
		expect(cookies.get('sk_locale')).toBe('de');
	});

	it('also persists the preference on the signed-in user', async () => {
		const user = getOrCreateUser(`locale-test-${Date.now()}@example.com`);
		const token = createSession(user.id);
		expect(getSessionUser(token)?.locale).toBeNull();

		const { res } = await call({ locale: 'tr' }, { user: { id: user.id, email: user.email } });
		expect(res.status).toBe(200);
		expect(getSessionUser(token)?.locale).toBe('tr');
	});

	it('rejects an unknown locale', async () => {
		const { res } = await call({ locale: 'fr' }, { user: null });
		expect(res.status).toBe(400);
	});
});
