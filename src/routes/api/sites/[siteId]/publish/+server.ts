import { json } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { getOrSeedDraft, getSiteMeta, publishDraft, unpublishSite } from '$lib/server/db/repo';
import type { RequestHandler } from './$types';

function guard(locals: App.Locals, siteId: string): Response | null {
	// Audit fix: publishing always requires a signed-in user (anonymous could
	// flip ownerless demos on/off); any signed-in user may still demo the seeds.
	if (!locals.user) {
		return json({ ok: false, message: 'Sign in to publish.' }, { status: 401 });
	}
	getOrSeedDraft(siteId); // seeds publish fine even on a fresh DB
	const meta = getSiteMeta(siteId);
	if (!meta) return json({ ok: false, message: `Unknown site "${siteId}"` }, { status: 404 });
	if (!canManageSite(locals.user, meta.ownerUserId)) {
		return json({ ok: false, message: 'Sign in as the site owner to publish.' }, { status: 403 });
	}
	return null;
}

/** Draft → new immutable published snapshot (M4). */
export const POST: RequestHandler = ({ params, locals }) => {
	const denied = guard(locals, params.siteId);
	if (denied) return denied;
	const version = publishDraft(params.siteId);
	if (version === null) {
		return json({ ok: false, message: 'Nothing to publish.' }, { status: 404 });
	}
	return json({ ok: true, version });
};

/** Take the site offline (draft is kept). */
export const DELETE: RequestHandler = ({ params, locals }) => {
	const denied = guard(locals, params.siteId);
	if (denied) return denied;
	unpublishSite(params.siteId);
	return json({ ok: true });
};
