import { afterEach, describe, expect, it } from 'vitest';
import { clearSetting, setSetting } from '$lib/server/config';
import { POST } from './+server';

afterEach(() => {
	clearSetting('BETA_MODE');
});

function request(message: string, user: { id: string; email: string } | null = null) {
	return POST({
		request: new Request('http://localhost/api/assistant/route', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ message, locale: 'tr', currentPath: '/tr' })
		}),
		locals: { user },
		getClientAddress: () => `127.0.0.${Math.floor(Math.random() * 200) + 1}`
	} as never) as Promise<Response>;
}

describe('assistant route endpoint', () => {
	it('routes profession briefs to guided onboarding without raw prefill', async () => {
		const res = await request('Ben diyetisyenim, online danışmanlık için site istiyorum');
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.action).toBe('start_onboarding');
		expect(data.href).toBe('/new');
		expect(data.prefill).toBeUndefined();
	});

	it('routes pricing and domain questions to pricing/domain replies', async () => {
		const pricing = await (await request('Fiyat nedir?')).json();
		const domain = await (await request('Domain ve hosting dahil mi?')).json();

		expect(pricing.action).toBe('show_pricing');
		expect(pricing.href).toBe('/pricing');
		expect(domain.action).toBe('show_domain_info');
		expect(domain.href).toBe('/pricing');
	});

	it('answers general product questions with the answer action', async () => {
		const res = await request('saaskaya nedir?');
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.action).toBe('answer');
		expect(typeof data.reply).toBe('string');
		expect(data.reply.length).toBeGreaterThan(20);
		expect(data.href).toBeUndefined();
		expect(data.prefill).toBeUndefined();
	});

	it('requires login for edit intent when signed out, dashboard when signed in', async () => {
		const signedOut = await (await request('Sitemdeki hakkımda yazısını düzenle')).json();
		const signedIn = await (
			await request('Sitemdeki hakkımda yazısını düzenle', {
				id: 'user-1',
				email: 'user@example.com'
			})
		).json();

		expect(signedOut.action).toBe('login_required');
		expect(signedOut.href).toBe('/login');
		expect(signedIn.action).toBe('open_dashboard');
		expect(signedIn.href).toBe('/dashboard');
	});

	it('uses beta access as the auth target while closed beta is enabled', async () => {
		setSetting('BETA_MODE', '1');
		const signedOut = await (await request('Sitemdeki hakkımda yazısını düzenle')).json();

		expect(signedOut.action).toBe('login_required');
		expect(signedOut.href).toBe('/beta');
	});
});
