import { error, redirect } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { getOrSeedDraft, getSiteMeta } from '$lib/server/db/repo';
import { localeSchema } from '$lib/schema/site';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url, locals }) => {
	// The draft comes from the repo, which guarantees it is Zod-valid (constitution §2).
	const site = getOrSeedDraft(params.siteId);
	if (!site) error(404, `Unknown site "${params.siteId}"`);
	// Drafts are private to their owner; the public surface is the published site (M4).
	const meta = getSiteMeta(params.siteId);
	if (!canManageSite(locals.user, meta?.ownerUserId)) {
		if (!locals.user) redirect(303, '/login');
		error(403, 'This draft belongs to another account.');
	}

	const slug = params.page ?? site.pages[0].slug;
	const page = site.pages.find((p) => p.slug === slug);
	if (!page) error(404, `Unknown page "${slug}"`);

	const requested = localeSchema.safeParse(url.searchParams.get('locale'));
	const locale =
		requested.success && site.locales.includes(requested.data)
			? requested.data
			: site.defaultLocale;

	return { site, page, locale };
};
