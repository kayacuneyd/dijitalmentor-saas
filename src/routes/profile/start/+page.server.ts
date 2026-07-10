import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { getUserProfile, updateBetaProfile } from '$lib/server/auth';
import { withLocale } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

const profileSchema = z.object({
	fullName: z.string().trim().min(2).max(100),
	profession: z.string().trim().min(2).max(80),
	city: z.string().trim().min(2).max(80)
});

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, withLocale(locals.locale, '/beta'));
	const profile = getUserProfile(locals.user.id);
	if (profile?.betaProfileCompletedAt) redirect(303, withLocale(locals.locale, '/new'));
	return { locale: locals.locale, profile };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(303, withLocale(locals.locale, '/beta'));
		const form = await request.formData();
		const parsed = profileSchema.safeParse({
			fullName: String(form.get('fullName') ?? ''),
			profession: String(form.get('profession') ?? ''),
			city: String(form.get('city') ?? '')
		});
		if (!parsed.success) {
			return fail(400, { message: 'Please complete all fields.' });
		}
		updateBetaProfile({ userId: locals.user.id, ...parsed.data });
		redirect(303, withLocale(locals.locale, '/new'));
	}
};
