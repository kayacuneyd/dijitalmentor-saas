import { redirect } from '@sveltejs/kit';
import { createDraftBlogPost, listBlogPosts } from '$lib/server/blog';
import { requireAdmin } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return { posts: listBlogPosts({ includeDrafts: true }) };
};

export const actions: Actions = {
	create: async ({ locals }) => {
		requireAdmin(locals);
		const post = createDraftBlogPost();
		redirect(303, `/admin/blog/${post.id}`);
	}
};
