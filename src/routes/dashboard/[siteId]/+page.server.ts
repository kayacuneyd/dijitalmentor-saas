import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { actions as dashboardActions, load as loadDashboard } from '../+page.server';

export const actions = {
	...(dashboardActions as unknown as Actions),
	deleteSite: async (event) => {
		const result = await dashboardActions.deleteSite(event as never);
		if (result && 'deleted' in result) redirect(303, '/dashboard');
		return result;
	}
} satisfies Actions;

export const load: PageServerLoad = async (event) => {
	const dashboard = (await loadDashboard(event as never)) as
		| {
				sites: Array<{ id: string; [key: string]: any }>;
				billingConfigured: boolean;
				[key: string]: unknown;
		  }
		| undefined;
	if (!dashboard) error(500, 'Dashboard data unavailable');
	const site = dashboard.sites.find(
		(candidate: { id: string }) => candidate.id === event.params.siteId
	);

	if (!site) error(404, 'Site not found');

	return {
		...dashboard,
		billingConfigured: dashboard.billingConfigured,
		site
	};
};
