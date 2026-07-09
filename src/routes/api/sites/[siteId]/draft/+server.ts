import { error, json } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { getOrSeedDraft, getSiteMeta, saveDraft } from '$lib/server/db/repo';
import { siteSchema } from '$lib/schema/site';
import type { RequestHandler } from './$types';

// Audit fix (2026-07-07): every draft mutation/read requires a signed-in user
// (anonymous editing of ownerless demos allowed token burn + vandalism), and PUT
// no longer accepts unknown ids (it was a signup-free site-creation channel).
function deny(locals: App.Locals): Response {
	return json(
		{ ok: false, message: 'Sign in as the site owner to edit this draft.' },
		{ status: locals.user ? 403 : 401 }
	);
}

export const GET: RequestHandler = ({ params, locals }) => {
	if (!locals.user) return deny(locals);
	const site = getOrSeedDraft(params.siteId);
	if (!site) error(404, `Unknown site "${params.siteId}"`);
	const meta = getSiteMeta(params.siteId);
	if (!canManageSite(locals.user, meta?.ownerUserId)) return deny(locals);
	return json(site);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) return deny(locals);
	let meta = getSiteMeta(params.siteId);
	if (!meta && getOrSeedDraft(params.siteId)) meta = getSiteMeta(params.siteId); // known seeds only
	if (!meta) error(404, `Unknown site "${params.siteId}"`); // PUT never creates sites
	if (!canManageSite(locals.user, meta.ownerUserId)) return deny(locals);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		error(400, 'Body must be JSON');
	}

	// The contract at the boundary (constitution §2): invalid drafts are never stored.
	const parsed = siteSchema.safeParse(body);
	if (!parsed.success) {
		return json({ ok: false, issues: parsed.error.issues }, { status: 400 });
	}
	if (parsed.data.id !== params.siteId) {
		return json({ ok: false, issues: [{ message: 'site id mismatch' }] }, { status: 400 });
	}

	saveDraft(parsed.data);
	return json({ ok: true });
};
