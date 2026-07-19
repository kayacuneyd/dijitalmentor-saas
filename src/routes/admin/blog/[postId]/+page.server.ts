import { error, fail } from '@sveltejs/kit';
import { parseBlogDoc } from '$lib/blog/content';
import { getBlogPostById, saveBlogPost, uploadBlogCover } from '$lib/server/blog';
import { requireAdmin } from '$lib/server/auth';
import { listPublicLocales } from '$lib/server/publicLocales';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
	requireAdmin(locals);
	const post = getBlogPostById(params.postId);
	if (!post) error(404, 'Blog post not found');
	return { post, locales: listPublicLocales({ includeDrafts: true }) };
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const translations = {} as Record<
			string,
			{
				title: unknown;
				description: unknown;
				category: unknown;
				seoTitle?: unknown;
				seoDescription?: unknown;
				coverAlt?: unknown;
				body: unknown;
			}
		>;
		for (const { code: locale } of listPublicLocales({ includeDrafts: true })) {
			translations[locale] = {
				title: String(form.get(`title_${locale}`) ?? ''),
				description: String(form.get(`description_${locale}`) ?? ''),
				category: String(form.get(`category_${locale}`) ?? ''),
				seoTitle: String(form.get(`seoTitle_${locale}`) ?? ''),
				seoDescription: String(form.get(`seoDescription_${locale}`) ?? ''),
				coverAlt: String(form.get(`coverAlt_${locale}`) ?? ''),
				body: parseBlogDoc(String(form.get(`body_${locale}`) ?? ''))
			};
		}
		const result = saveBlogPost({
			id: params.postId,
			slug: String(form.get('slug') ?? ''),
			status: String(form.get('status') ?? ''),
			coverImageUrl: String(form.get('coverImageUrl') ?? ''),
			readingMinutes: String(form.get('readingMinutes') ?? ''),
			authorName: String(form.get('authorName') ?? ''),
			publishedAt: String(form.get('publishedAt') ?? ''),
			translations
		});
		if (!result.ok) return fail(400, { message: result.message, field: result.field });
		return { saved: true, postId: result.post.id };
	},
	uploadCover: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const upload = form.get('cover');
		if (!(upload instanceof File) || upload.size === 0) {
			return fail(400, { message: 'Choose a cover image.' });
		}
		try {
			const result = await uploadBlogCover({
				postId: params.postId,
				fileName: upload.name,
				mimeType: upload.type,
				bytes: new Uint8Array(await upload.arrayBuffer())
			});
			return { coverUploaded: result.url };
		} catch (cause) {
			return fail(400, {
				message: cause instanceof Error ? cause.message : 'Cover upload failed.'
			});
		}
	}
};
