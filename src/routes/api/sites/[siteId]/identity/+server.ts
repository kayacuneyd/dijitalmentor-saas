import { json } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { getSiteMeta, setSiteIdentity } from '$lib/server/db/repo';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json(
			{ ok: false, message: 'Sign in as the site owner to edit this site.' },
			{ status: 401 }
		);
	}
	const meta = getSiteMeta(params.siteId);
	if (!meta) return json({ ok: false, message: 'Site not found.' }, { status: 404 });
	if (!canManageSite(locals.user, meta.ownerUserId)) {
		return json(
			{ ok: false, message: 'Sign in as the site owner to edit this site.' },
			{ status: 403 }
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, message: 'Body must be JSON.' }, { status: 400 });
	}
	const input = body as {
		siteName?: unknown;
		publicHandle?: unknown;
		contactEmail?: unknown;
	};
	const result = setSiteIdentity({
		siteId: params.siteId,
		siteName: String(input.siteName ?? ''),
		publicHandle: String(input.publicHandle ?? ''),
		contactEmail: String(input.contactEmail ?? '')
	});
	if (!result.ok) {
		return json({ ok: false, reason: result.reason, message: result.message }, { status: 400 });
	}
	return json({
		ok: true,
		site: result.site,
		publicHandle: result.publicHandle,
		message: `${result.site.settings.siteName} için subdomain kaydedildi: ${result.publicHandle}.saaskaya.com`
	});
};
