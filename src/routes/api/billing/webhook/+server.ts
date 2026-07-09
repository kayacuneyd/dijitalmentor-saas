import { json } from '@sveltejs/kit';
import { getSetting } from '$lib/server/config';
import { handleStripeEvent, verifyStripeSignature } from '$lib/server/billing';
import type { RequestHandler } from './$types';

/** Stripe → us. Raw-body HMAC verification; unsigned/forged requests are rejected. */
export const POST: RequestHandler = async ({ request }) => {
	const secret = getSetting('STRIPE_WEBHOOK_SECRET');
	if (!secret) {
		return json({ ok: false, message: 'Webhook not configured.' }, { status: 503 });
	}
	const rawBody = await request.text();
	if (!verifyStripeSignature(rawBody, request.headers.get('stripe-signature'), secret)) {
		return json({ ok: false, message: 'Invalid signature.' }, { status: 400 });
	}
	let event: Parameters<typeof handleStripeEvent>[0];
	try {
		event = JSON.parse(rawBody); // audit fix: a signed-but-malformed body must 400, not crash
	} catch {
		return json({ ok: false, message: 'Body must be JSON.' }, { status: 400 });
	}
	const outcome = handleStripeEvent(event);
	console.log(`[billing] webhook: ${outcome}`);
	return json({ ok: true });
};
