import { describe, expect, it } from 'vitest';
import { GET, POST } from './+server';

const SITE_ID = 'seed-law';
const user = { id: 'media-test-user', email: 'media@example.com', isAdmin: false };

describe('site media API', () => {
	it('requires a signed-in user', async () => {
		const response = await POST({
			params: { siteId: SITE_ID },
			locals: { user: null },
			request: new Request(`http://localhost/api/sites/${SITE_ID}/media`, {
				method: 'POST',
				body: new FormData()
			})
		} as never);
		expect(response.status).toBe(401);
	});

	it('rejects spoofed images before storage', async () => {
		const form = new FormData();
		form.set('file', new File(['not a png'], 'fake.png', { type: 'image/png' }));
		const response = await POST({
			params: { siteId: SITE_ID },
			locals: { user },
			request: new Request(`http://localhost/api/sites/${SITE_ID}/media`, {
				method: 'POST',
				body: form
			})
		} as never);
		expect(response.status).toBe(400);
		await expect(response.json()).resolves.toMatchObject({
			ok: false,
			message: expect.stringMatching(/valid JPEG/)
		});
	});

	it('lists media for a manageable site', async () => {
		const response = await GET({
			params: { siteId: SITE_ID },
			locals: { user }
		} as never);
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toMatchObject({ ok: true, assets: [] });
	});
});
