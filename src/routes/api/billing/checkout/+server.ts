import { json, redirect } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { BillingNotConfiguredError, createCheckoutSession } from '$lib/server/billing';
import { getSiteMeta } from '$lib/server/db/repo';
import type { RequestHandler } from './$types';

/** Dashboard site card "Upgrade" → provider checkout for that specific site. */
export const POST: RequestHandler = async ({ request, locals, url }) => {
	if (!locals.user) {
		return json({ ok: false, message: 'Sign in first.' }, { status: 401 });
	}
	const form = await request.formData();
	const siteId = String(form.get('siteId') ?? '');
	const meta = getSiteMeta(siteId);
	if (!meta) return json({ ok: false, message: 'Site not found.' }, { status: 404 });
	if (!canManageSite(locals.user, meta.ownerUserId)) {
		return json({ ok: false, message: 'This site belongs to another account.' }, { status: 403 });
	}
	let checkoutUrl: string;
	try {
		checkoutUrl = await createCheckoutSession({
			userId: locals.user.id,
			email: locals.user.email,
			origin: url.origin,
			siteId
		});
	} catch (error) {
		if (error instanceof BillingNotConfiguredError) {
			return json({ ok: false, message: error.message }, { status: 503 });
		}
		throw error;
	}
	redirect(303, checkoutUrl);
};
