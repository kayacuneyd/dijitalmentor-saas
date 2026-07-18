import { redirect } from '@sveltejs/kit';
import { aiTopupConfigured, billingProvider } from '$lib/server/billing';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	return { configured: aiTopupConfigured(), provider: billingProvider() };
};
