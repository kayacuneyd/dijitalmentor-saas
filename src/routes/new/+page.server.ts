import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Generation costs tokens — sign-in required (abuse gate, idea.md §6.1). */
export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	return {};
};
