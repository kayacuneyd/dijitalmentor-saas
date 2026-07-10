import { error } from '@sveltejs/kit';
import { getBlogPost } from '$lib/public/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const post = getBlogPost(params.slug);
	if (!post) error(404, 'Blog post not found');
	return { post };
};
