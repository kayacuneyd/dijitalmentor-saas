import { fail, redirect } from '@sveltejs/kit';
import {
	blogCompleteness,
	createDraftBlogPost,
	importBlogPostJson,
	listBlogPosts
} from '$lib/server/blog';
import { requireAdmin } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {
		posts: listBlogPosts({ includeDrafts: true }).map((post) => ({
			...post,
			completeness: blogCompleteness(post)
		}))
	};
};

export const actions: Actions = {
	create: async ({ locals }) => {
		requireAdmin(locals);
		const post = createDraftBlogPost();
		redirect(303, `/admin/blog/${post.id}`);
	},
	importJson: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const upload = form.get('blogJson');
		const updateExisting = form.get('updateExisting') === 'on';
		if (!(upload instanceof File) || upload.size === 0) {
			return fail(400, { importError: 'Choose a JSON file to import.', importIssues: [] });
		}
		if (upload.size > 512 * 1024) {
			return fail(400, {
				importError: 'JSON import file must be smaller than 512 KB.',
				importIssues: []
			});
		}
		const result = importBlogPostJson(await upload.text(), { updateExisting });
		if (!result.ok) {
			return fail(400, {
				importError: result.message,
				importIssues: result.issues ?? []
			});
		}
		return {
			imported: result.post.slug,
			importedPostId: result.post.id,
			updatedExisting: result.updatedExisting
		};
	}
};
