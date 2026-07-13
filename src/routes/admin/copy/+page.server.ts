import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import {
	listPublicCopyAdminRows,
	resetPublicCopyOverride,
	savePublicCopyOverride
} from '$lib/server/publicCopy';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {
		pages: listPublicCopyAdminRows()
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const page = String(form.get('page') ?? '');
		const locale = String(form.get('locale') ?? '');
		const result = savePublicCopyOverride(page, locale, form);
		if (!result.ok) return fail(400, { message: result.message });
		return { saved: `${result.page}:${result.locale}` };
	},
	reset: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const page = String(form.get('page') ?? '');
		const locale = String(form.get('locale') ?? '');
		const result = resetPublicCopyOverride(page, locale);
		if (!result.ok) return fail(400, { message: result.message });
		return { reset: `${result.page}:${result.locale}` };
	}
};
