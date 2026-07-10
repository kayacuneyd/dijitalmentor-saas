import { describe, expect, it } from 'vitest';
import { getInquiryDetail } from '$lib/server/inquiries';
import { POST } from './+server';

let ipCounter = 0;
function nextIp() {
	ipCounter += 1;
	return `172.16.10.${ipCounter}`;
}

async function call(body: unknown, ip = nextIp()) {
	const res = await POST({
		request: new Request('http://localhost/api/inquiries', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		locals: { user: null },
		getClientAddress: () => ip
	} as unknown as Parameters<typeof POST>[0]);
	return res;
}

describe('POST /api/inquiries', () => {
	it('stores a valid chat inquiry without an account', async () => {
		const res = await call({
			source: 'chat',
			name: 'Public Visitor',
			email: 'visitor@example.com',
			category: 'other',
			message: 'I want to understand whether saaskaya is right for my practice.',
			website: ''
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.ok).toBe(true);
		const detail = getInquiryDetail(data.id);
		expect(detail?.source).toBe('chat');
		expect(detail?.userId).toBeNull();
	});

	it('rejects invalid bodies and rate limits repeated submissions', async () => {
		const invalid = await call({
			source: 'chat',
			name: 'A',
			email: 'bad',
			category: 'support',
			message: 'short',
			website: ''
		});
		expect(invalid.status).toBe(400);

		const ip = nextIp();
		let last: Response | undefined;
		for (let i = 0; i < 7; i += 1) {
			last = await call(
				{
					source: 'chat',
					name: `Visitor ${i}`,
					email: `rate-${i}@example.com`,
					category: 'support',
					message: 'This is a long enough support message for rate limit testing.',
					website: ''
				},
				ip
			);
		}
		expect(last?.status).toBe(429);
	});
});
