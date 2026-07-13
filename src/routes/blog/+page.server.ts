import { listBlogPosts } from '$lib/server/blog';
import { getPublicCopyOverrides } from '$lib/server/publicCopy';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { posts: listBlogPosts(), copyOverrides: getPublicCopyOverrides('blog') };
};
