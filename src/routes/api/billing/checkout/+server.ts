import { json, redirect } from '@sveltejs/kit';
import { BillingNotConfiguredError, createCheckoutSession } from '$lib/server/billing';
import type { RequestHandler } from './$types';

/** Dashboard "Upgrade" → Stripe Checkout (subscription). */
export const POST: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		return json({ ok: false, message: 'Sign in first.' }, { status: 401 });
	}
	let checkoutUrl: string;
	try {
		checkoutUrl = await createCheckoutSession({
			userId: locals.user.id,
			email: locals.user.email,
			origin: url.origin
		});
	} catch (error) {
		if (error instanceof BillingNotConfiguredError) {
			return json({ ok: false, message: error.message }, { status: 503 });
		}
		throw error;
	}
	redirect(303, checkoutUrl);
};
