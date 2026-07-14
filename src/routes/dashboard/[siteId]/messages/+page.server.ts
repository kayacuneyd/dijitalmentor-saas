import { error, redirect } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { listSubmissions } from '$lib/server/db/contact';
import { getDraft, getSiteMeta } from '$lib/server/db/repo';
import { serverTranslator } from '$lib/server/messageOverrides';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals }) => {
	if (!locals.user) redirect(303, '/login');
	const t = serverTranslator(locals.locale);
	const meta = getSiteMeta(params.siteId);
	if (!meta) error(404, t('dashboard.actions.siteNotFound'));
	if (!canManageSite(locals.user, meta.ownerUserId)) {
		error(403, t('dashboard.actions.siteBelongsToAnotherAccount'));
	}
	const site = getDraft(params.siteId);
	return {
		siteId: params.siteId,
		siteName: site?.settings.siteName ?? params.siteId,
		submissions: listSubmissions(params.siteId)
	};
};
