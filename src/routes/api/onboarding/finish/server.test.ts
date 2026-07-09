import { describe, expect, it } from 'vitest';
import { POST } from './+server';
import { POST as answerPOST } from '../answer/+server';
import { PENDING_COOKIE, getPendingByToken } from '$lib/server/onboarding/session';

function makeCookieJar(initial: Record<string, string> = {}) {
	const store: Record<string, string> = { ...initial };
	return {
		get: (name: string) => store[name],
		set: (name: string, value: string) => {
			store[name] = value;
		},
		delete: (name: string) => {
			delete store[name];
		},
		store
	};
}

let ipCounter = 0;
function nextIp() {
	ipCounter += 1;
	return `10.1.0.${ipCounter}`;
}

async function answer(
	questionId: string,
	value: unknown,
	cookies: ReturnType<typeof makeCookieJar>,
	ip: string
) {
	return answerPOST({
		request: new Request('http://localhost/api/onboarding/answer', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ questionId, value })
		}),
		cookies,
		getClientAddress: () => ip
	} as unknown as Parameters<typeof answerPOST>[0]);
}

function finish(
	cookies: ReturnType<typeof makeCookieJar>,
	locals: { user: { id: string; email: string } | null }
) {
	return POST({
		request: new Request('http://localhost/api/onboarding/finish', { method: 'POST' }),
		cookies,
		locals
	} as unknown as Parameters<typeof POST>[0]);
}

const user = { id: 'u-onboarding-finish', email: 'finish-test@example.com' };

const FULL_ANSWERS: [string, unknown][] = [
	['niche', 'psych'],
	['businessName', 'Ada Terapi'],
	['city', 'Kadıköy'],
	['audience', 'Genç yetişkinler'],
	['differentiator', 'Online seçenek'],
	['tone', 'warm'],
	['languages', ['tr']],
	['contactMethod', 'email'],
	['contactEmail', 'ada@example.com'],
	['booking', 'online_booking'],
	['services', ['Bireysel terapi']],
	['credentials', ''],
	['media', 'use_placeholders'],
	['domainPreference', ''],
	['anythingElse', '']
];

describe('POST /api/onboarding/finish', () => {
	it('rejects an anonymous caller — the abuse gate lives here now', async () => {
		const res = await finish(makeCookieJar(), { user: null });
		expect(res.status).toBe(401);
	});

	it('returns 404 when there is no pending record for this cookie', async () => {
		const res = await finish(makeCookieJar(), { user });
		expect(res.status).toBe(404);
	});

	it('rejects finishing before the required questions are all answered', async () => {
		const ip = nextIp();
		let cookies = makeCookieJar();
		await answer('niche', 'psych', cookies, ip);
		const res = await finish(cookies, { user });
		expect(res.status).toBe(400);
	});

	it('composes a description and consumes the pending record once complete', async () => {
		const ip = nextIp();
		let cookies = makeCookieJar();
		for (const [questionId, value] of FULL_ANSWERS) {
			await answer(questionId, value, cookies, ip);
		}
		const res = await finish(cookies, { user });
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.ok).toBe(true);
		expect(typeof data.description).toBe('string');
		expect(data.description.length).toBeGreaterThanOrEqual(30);
		expect(data.description).toContain('Ada Terapi');

		const pending = getPendingByToken(cookies.store[PENDING_COOKIE]);
		expect(pending?.status).toBe('consumed');
		expect(pending?.linkedUserId).toBe(user.id);
	});

	it('accepts the raw escape-hatch description verbatim, bypassing the structured gate', async () => {
		const ip = nextIp();
		const cookies = makeCookieJar();
		await answer(
			'rawDescription',
			'Ben Av. Zeynep Demir. İstanbul’da 12 yıldır aile hukuku ve boşanma davalarına bakıyorum.',
			cookies,
			ip
		);
		const res = await finish(cookies, { user });
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.description).toBe(
			'Ben Av. Zeynep Demir. İstanbul’da 12 yıldır aile hukuku ve boşanma davalarına bakıyorum.'
		);
	});

	it('rejects finishing a pending record already claimed by a different account', async () => {
		const ip = nextIp();
		const cookies = makeCookieJar();
		for (const [questionId, value] of FULL_ANSWERS) {
			await answer(questionId, value, cookies, ip);
		}
		await finish(cookies, { user }); // claims + consumes it for `user`

		// A second finish attempt from a different account, same (stale) cookie.
		const res = await finish(cookies, { user: { id: 'someone-else', email: 'x@example.com' } });
		expect(res.status).toBe(403);
	});
});
