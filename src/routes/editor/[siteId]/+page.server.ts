import { error, redirect } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { getOrSeedDraft, getSiteMeta } from '$lib/server/db/repo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals }) => {
	// Audit fix: editing always needs a session (autosave/chat/publish are 401
	// for anonymous users anyway — redirect up front instead of failing saves).
	if (!locals.user) redirect(303, '/login');
	const site = getOrSeedDraft(params.siteId);
	if (!site) error(404, `Unknown site "${params.siteId}"`);
	const meta = getSiteMeta(params.siteId);
	if (!canManageSite(locals.user, meta?.ownerUserId)) {
		error(403, 'This site belongs to another account.');
	}
	return { site, publishedVersion: meta?.publishedVersion ?? null, user: locals.user };
};
