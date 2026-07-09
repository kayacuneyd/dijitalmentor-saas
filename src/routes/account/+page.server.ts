import { redirect } from '@sveltejs/kit';
import { billingConfigured, subscriptionState } from '$lib/server/billing';
import { listSitesByOwner } from '$lib/server/db/repo';
import { countSubmissions } from '$lib/server/db/contact';
import { getDomainForSite } from '$lib/server/domains';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	const sites = listSitesByOwner(locals.user.id).map((site) => ({
		...site,
		domain: getDomainForSite(site.id),
		messageCount: countSubmissions(site.id)
	}));
	return {
		user: locals.user,
		subscription: subscriptionState(locals.user.id),
		billingConfigured: billingConfigured(),
		sites,
		totals: {
			sites: sites.length,
			published: sites.filter((site) => site.publishedVersion).length,
			messages: sites.reduce((sum, site) => sum + site.messageCount, 0)
		}
	};
};
