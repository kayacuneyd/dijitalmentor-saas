import { error, json } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { hasActiveSiteSubscription } from '$lib/server/billing';
import { getDraft, getSiteMeta } from '$lib/server/db/repo';
import { listSubmissions } from '$lib/server/db/contact';
import type { RequestHandler } from './$types';

/** Full export: Pro site entitlement, grace window, or admin/operator support. */
export const GET: RequestHandler = ({ params, locals }) => {
	const meta = getSiteMeta(params.siteId);
	if (!meta) error(404, `Unknown site "${params.siteId}"`);
	if (!locals.user || !canManageSite(locals.user, meta.ownerUserId)) {
		return json(
			{ ok: false, message: 'Sign in as the site owner to export.' },
			{ status: locals.user ? 403 : 401 }
		);
	}
	if (!locals.user.isAdmin && !hasActiveSiteSubscription(params.siteId, locals.user.id)) {
		return json(
			{ ok: false, message: 'Full site export is available for Pro sites.' },
			{ status: 402 }
		);
	}
	const site = getDraft(params.siteId);
	return new Response(
		JSON.stringify({ site, contactSubmissions: listSubmissions(params.siteId) }, null, 2),
		{
			headers: {
				'content-type': 'application/json',
				'content-disposition': `attachment; filename="saaskaya-${params.siteId}.json"`
			}
		}
	);
};
