import { json, redirect } from '@sveltejs/kit';
import { BillingNotConfiguredError, createAiTopupCheckoutSession } from '$lib/server/billing';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) return json({ ok: false, message: 'Sign in first.' }, { status: 401 });
	try {
		const checkoutUrl = await createAiTopupCheckoutSession({
			userId: locals.user.id,
			email: locals.user.email,
			origin: url.origin
		});
		redirect(303, checkoutUrl);
	} catch (cause) {
		if (cause instanceof BillingNotConfiguredError) {
			return json({ ok: false, message: cause.message }, { status: 503 });
		}
		throw cause;
	}
};

/** A browser navigation belongs on the account surface; this endpoint only starts
 * checkout and must not expose a raw JSON error as a customer-facing page. */
export const GET: RequestHandler = () => redirect(303, '/account/topup');
