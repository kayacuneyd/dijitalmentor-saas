import { error, fail } from '@sveltejs/kit';
import { LOCALES, type Locale } from '$lib/i18n';
import { parseBlogDoc } from '$lib/blog/content';
import { getBlogPostById, saveBlogPost } from '$lib/server/blog';
import { requireAdmin } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
	requireAdmin(locals);
	const post = getBlogPostById(params.postId);
	if (!post) error(404, 'Blog post not found');
	return { post };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const translations = {} as Record<
			Locale,
			{
				title: unknown;
				description: unknown;
				category: unknown;
				seoTitle?: unknown;
				seoDescription?: unknown;
				body: unknown;
			}
		>;
		for (const locale of LOCALES) {
			translations[locale] = {
				title: String(form.get(`title_${locale}`) ?? ''),
				description: String(form.get(`description_${locale}`) ?? ''),
				category: String(form.get(`category_${locale}`) ?? ''),
				seoTitle: String(form.get(`seoTitle_${locale}`) ?? ''),
				seoDescription: String(form.get(`seoDescription_${locale}`) ?? ''),
				body: parseBlogDoc(String(form.get(`body_${locale}`) ?? ''))
			};
		}
		const result = saveBlogPost({
			id: params.postId,
			slug: String(form.get('slug') ?? ''),
			status: String(form.get('status') ?? ''),
			coverImageUrl: String(form.get('coverImageUrl') ?? ''),
			coverAlt: String(form.get('coverAlt') ?? ''),
			readingMinutes: String(form.get('readingMinutes') ?? ''),
			authorName: String(form.get('authorName') ?? ''),
			publishedAt: String(form.get('publishedAt') ?? ''),
			translations
		});
		if (!result.ok) return fail(400, { message: result.message, field: result.field });
		return { saved: true, postId: result.post.id };
	}
};
