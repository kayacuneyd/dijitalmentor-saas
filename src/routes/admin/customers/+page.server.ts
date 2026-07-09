import { requireAdmin } from '$lib/server/auth';
import { listCustomers } from '$lib/server/customers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return { customers: listCustomers() };
};
