import { listBlogPosts } from '$lib/server/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { posts: listBlogPosts() };
};
