import { json } from '@sveltejs/kit';
import { handleCreemEvent, verifyCreemSignature } from '$lib/server/billing';
import { getSetting } from '$lib/server/config';
import type { RequestHandler } from './$types';

/** Creem → us. Raw-body HMAC verification; unsigned/forged requests are rejected. */
export const POST: RequestHandler = async ({ request }) => {
	const secret = getSetting('CREEM_WEBHOOK_SECRET');
	if (!secret) {
		return json({ ok: false, message: 'Creem webhook not configured.' }, { status: 503 });
	}
	const rawBody = await request.text();
	if (!verifyCreemSignature(rawBody, request.headers.get('creem-signature'), secret)) {
		return json({ ok: false, message: 'Invalid signature.' }, { status: 400 });
	}
	let event: Parameters<typeof handleCreemEvent>[0];
	try {
		event = JSON.parse(rawBody);
	} catch {
		return json({ ok: false, message: 'Body must be JSON.' }, { status: 400 });
	}
	const outcome = handleCreemEvent(event);
	console.log(`[billing] creem webhook: ${outcome}`);
	return json({ ok: true });
};
