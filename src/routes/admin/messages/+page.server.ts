import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import {
	listMessageOverrideEntries,
	resetMessageOverride,
	saveMessageOverride
} from '$lib/server/messageOverrides';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {
		entries: listMessageOverrideEntries()
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const key = String(form.get('key') ?? '');
		const locale = String(form.get('locale') ?? '');
		const value = String(form.get('value') ?? '');
		const result = saveMessageOverride(key, locale, value);
		if (!result.ok) return fail(400, { message: result.message });
		return { saved: `${result.key}:${result.locale}` };
	},
	reset: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const key = String(form.get('key') ?? '');
		const locale = String(form.get('locale') ?? '');
		const result = resetMessageOverride(key, locale);
		if (!result.ok) return fail(400, { message: result.message });
		return { reset: `${result.key}:${result.locale}` };
	}
};
