import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { blogCompleteness, listBlogPosts } from '$lib/server/blog';
import {
	listPublicCopyAdminRows,
	publicLocaleCompleteness,
	publishPublicCopyOverride,
	resetPublicCopyOverride,
	savePublicCopyOverride
} from '$lib/server/publicCopy';
import {
	addPublicLocale,
	listPublicLocales,
	setPublicLocaleActive
} from '$lib/server/publicLocales';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {
		pages: listPublicCopyAdminRows(),
		locales: listPublicLocales({ includeDrafts: true }).map((locale) => ({
			...locale,
			...publicLocaleCompleteness(locale.code)
		}))
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
	publish: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const result = publishPublicCopyOverride(
			String(form.get('page') ?? ''),
			String(form.get('locale') ?? '')
		);
		if (!result.ok) return fail(400, { message: result.message });
		return { published: `${result.page}:${result.locale}` };
	},
	addLocale: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const result = addPublicLocale({
			code: String(form.get('code') ?? ''),
			name: String(form.get('name') ?? '')
		});
		if (!result.ok) return fail(400, { message: result.message });
		return { localeAdded: result.code };
	},
	toggleLocale: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const code = String(form.get('code') ?? '');
		const active = String(form.get('active') ?? '') === '1';
		if (active) {
			const completeness = publicLocaleCompleteness(code);
			if (!completeness.complete) {
				return fail(400, {
					message: `Complete ${completeness.missing.length} required fields before publishing this language.`
				});
			}
			const incompletePosts = listBlogPosts({ includeDrafts: true }).filter((post) => {
				if (post.status !== 'published') return false;
				const language = blogCompleteness(post).find((item) => item.locale === code);
				return !language?.complete;
			});
			if (incompletePosts.length > 0) {
				return fail(400, {
					message: `Complete this language in ${incompletePosts.length} blog post(s) before publishing it.`
				});
			}
		}
		const result = setPublicLocaleActive(code, active);
		if (!result.ok) return fail(400, { message: result.message });
		return { localeToggled: result.code };
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
