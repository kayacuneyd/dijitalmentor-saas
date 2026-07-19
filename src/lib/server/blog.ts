import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { LOCALES } from '$lib/i18n';
import {
	blogDocSchema,
	blogDocText,
	emptyBlogDoc,
	parseBlogDoc,
	sectionsToBlogDoc,
	type BlogDoc
} from '$lib/blog/content';
import { blogPosts as seedPosts } from '$lib/public/blog';
import { db } from '$lib/server/db';
import { blogPosts, blogPostTranslations } from '$lib/server/db/schema';
import { MAX_MEDIA_BYTES, prepareStoredMedia, r2Client, r2Config } from '$lib/server/media';
import { listPublicLocales, normalizePublicLocaleCode } from '$lib/server/publicLocales';

export const BLOG_STATUSES = ['draft', 'published', 'archived'] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export type PublicBlogPost = {
	id: string;
	slug: string;
	status: BlogStatus;
	date: string;
	updatedDate: string;
	readingMinutes: number;
	authorName: string;
	coverImageUrl: string | null;
	coverAlt: Record<string, string>;
	title: Record<string, string>;
	description: Record<string, string>;
	category: Record<string, string>;
	seoTitle: Record<string, string>;
	seoDescription: Record<string, string>;
	body: Record<string, BlogDoc>;
};

export type BlogLocaleCompleteness = {
	locale: string;
	complete: boolean;
	missing: string[];
};

type BlogPostRow = typeof blogPosts.$inferSelect;
type BlogTranslationRow = typeof blogPostTranslations.$inferSelect;

const slugSchema = z
	.string()
	.trim()
	.min(3)
	.max(90)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const saveSchema = z.object({
	id: z.string().trim().optional(),
	slug: slugSchema,
	status: z.enum(BLOG_STATUSES),
	coverImageUrl: z.string().trim().max(700).optional(),
	readingMinutes: z.coerce.number().int().min(1).max(30),
	authorName: z.string().trim().min(2).max(120),
	publishedAt: z.string().trim().optional(),
	translations: z.record(
		z.string().refine((value) => Boolean(normalizePublicLocaleCode(value))),
		z.object({
			title: z.string().trim().max(140),
			description: z.string().trim().max(280),
			category: z.string().trim().max(60),
			seoTitle: z.string().trim().max(160).optional(),
			seoDescription: z.string().trim().max(280).optional(),
			coverAlt: z.string().trim().max(220).optional(),
			body: blogDocSchema
		})
	)
});

const importSectionSchema = z.object({
	heading: z.string().trim().min(2).max(160),
	body: z.string().trim().min(20).max(8000)
});

const importTranslationSchema = z.object({
	title: z.string().trim().min(3).max(140),
	description: z.string().trim().min(20).max(280),
	category: z.string().trim().min(2).max(60),
	seoTitle: z.string().trim().max(160).optional(),
	seoDescription: z.string().trim().max(280).optional(),
	body: blogDocSchema.optional(),
	sections: z.array(importSectionSchema).min(1).max(40).optional()
});

const importSchema = z.object({
	slug: slugSchema,
	status: z.enum(BLOG_STATUSES).default('draft'),
	date: z.string().trim().optional(),
	publishedAt: z.string().trim().optional(),
	readingMinutes: z.coerce.number().int().min(1).max(30).default(4),
	authorName: z.string().trim().min(2).max(120).default('saaskaya Editorial'),
	coverImageUrl: z.string().trim().max(700).optional(),
	coverAlt: z.string().trim().max(220).optional(),
	translations: z.record(z.string(), importTranslationSchema)
});

export type BlogSaveInput = {
	id?: unknown;
	slug: unknown;
	status: unknown;
	coverImageUrl?: unknown;
	readingMinutes: unknown;
	authorName: unknown;
	publishedAt?: unknown;
	translations: Record<
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
};
export type BlogSaveResult =
	{ ok: true; post: PublicBlogPost } | { ok: false; message: string; field?: string };
export type BlogImportResult =
	| { ok: true; post: PublicBlogPost; updatedExisting: boolean }
	| { ok: false; message: string; field?: string; issues?: string[] };

let seeded = false;

function isoDate(value: Date | null): string {
	return (value ?? new Date()).toISOString().slice(0, 10);
}

function blogLocaleCodes(includeDrafts = true): string[] {
	const configured = listPublicLocales({ includeDrafts }).map((locale) => locale.code);
	return [...new Set([...LOCALES, ...configured])];
}

function emptyLocalized<T>(factory: () => T): Record<string, T> {
	return Object.fromEntries(blogLocaleCodes().map((locale) => [locale, factory()]));
}

function shapePost(row: BlogPostRow, translations: BlogTranslationRow[]): PublicBlogPost {
	const byLocale = new Map(translations.map((translation) => [translation.locale, translation]));
	const title = emptyLocalized(() => '');
	const description = emptyLocalized(() => '');
	const category = emptyLocalized(() => '');
	const seoTitle = emptyLocalized(() => '');
	const seoDescription = emptyLocalized(() => '');
	const coverAlt = emptyLocalized(() => '');
	const body = emptyLocalized(emptyBlogDoc);

	for (const [locale, translation] of byLocale) {
		title[locale] = translation.title;
		description[locale] = translation.description;
		category[locale] = translation.category;
		seoTitle[locale] = translation.seoTitle || translation.title;
		seoDescription[locale] = translation.seoDescription || translation.description;
		coverAlt[locale] = translation.coverAlt || row.coverAlt || translation.title;
		body[locale] = parseBlogDoc(translation.body);
	}

	return {
		id: row.id,
		slug: row.slug,
		status: row.status as BlogStatus,
		date: isoDate(row.publishedAt ?? row.createdAt),
		updatedDate: isoDate(row.updatedAt),
		readingMinutes: row.readingMinutes,
		authorName: row.authorName,
		coverImageUrl: row.coverImageUrl,
		coverAlt,
		title,
		description,
		category,
		seoTitle,
		seoDescription,
		body
	};
}

function translationsFor(postIds: string[]): BlogTranslationRow[] {
	if (postIds.length === 0) return [];
	return db
		.select()
		.from(blogPostTranslations)
		.all()
		.filter((translation) => postIds.includes(translation.postId));
}

export function blogCompleteness(post: PublicBlogPost): BlogLocaleCompleteness[] {
	return blogLocaleCodes().map((locale) => {
		const missing: string[] = [];
		if (!post.title[locale]?.trim()) missing.push('title');
		if (!post.description[locale]?.trim()) missing.push('description');
		if (!post.category[locale]?.trim()) missing.push('category');
		if (blogDocText(post.body[locale]).length < 20) missing.push('body');
		return { locale, complete: missing.length === 0, missing };
	});
}

function validatePublishedInput(input: z.infer<typeof saveSchema>): string[] {
	if (input.status !== 'published') return [];
	const issues: string[] = [];
	for (const locale of blogLocaleCodes(false)) {
		const translation = input.translations[locale];
		if (!translation?.title?.trim()) issues.push(`${locale}: title is required`);
		if (!translation?.description?.trim()) issues.push(`${locale}: description is required`);
		if (!translation?.category?.trim()) issues.push(`${locale}: category is required`);
		if (!translation || blogDocText(translation.body).length < 20) {
			issues.push(`${locale}: body must contain at least 20 characters`);
		}
	}
	return issues;
}

export function ensureBlogSeeded(): void {
	if (seeded) return;
	seeded = true;

	const now = new Date();
	for (const seed of seedPosts) {
		const existing = db.select().from(blogPosts).where(eq(blogPosts.slug, seed.slug)).get();
		if (existing) continue;
		const id = `bp-${randomUUID().slice(0, 10)}`;
		const publishedAt = new Date(`${seed.date}T12:00:00.000Z`);
		db.insert(blogPosts)
			.values({
				id,
				slug: seed.slug,
				status: 'published',
				readingMinutes: seed.readingMinutes,
				authorName: 'saaskaya Editorial',
				publishedAt,
				createdAt: publishedAt,
				updatedAt: now
			})
			.run();
		for (const locale of LOCALES) {
			db.insert(blogPostTranslations)
				.values({
					postId: id,
					locale,
					title: seed.title[locale],
					description: seed.description[locale],
					category: seed.category[locale],
					seoTitle: seed.title[locale],
					seoDescription: seed.description[locale],
					body: sectionsToBlogDoc(seed.sections[locale])
				})
				.run();
		}
	}
}

export function listBlogPosts(options: { includeDrafts?: boolean } = {}): PublicBlogPost[] {
	ensureBlogSeeded();
	const rows = options.includeDrafts
		? db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt)).all()
		: db
				.select()
				.from(blogPosts)
				.where(eq(blogPosts.status, 'published'))
				.orderBy(desc(blogPosts.publishedAt))
				.all();
	const translations = translationsFor(rows.map((row) => row.id));
	return rows.map((row) =>
		shapePost(
			row,
			translations.filter((translation) => translation.postId === row.id)
		)
	);
}

export function getBlogPostBySlug(slug: string, options: { includeDrafts?: boolean } = {}) {
	ensureBlogSeeded();
	const conditions = [eq(blogPosts.slug, slug)];
	if (!options.includeDrafts) conditions.push(eq(blogPosts.status, 'published'));
	const row = db
		.select()
		.from(blogPosts)
		.where(and(...(conditions as [ReturnType<typeof eq>, ...ReturnType<typeof eq>[]])))
		.get();
	if (!row) return null;
	const translations = db
		.select()
		.from(blogPostTranslations)
		.where(eq(blogPostTranslations.postId, row.id))
		.all();
	return shapePost(row, translations);
}

export function getBlogPostById(id: string) {
	ensureBlogSeeded();
	const row = db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
	if (!row) return null;
	const translations = db
		.select()
		.from(blogPostTranslations)
		.where(eq(blogPostTranslations.postId, row.id))
		.all();
	return shapePost(row, translations);
}

export function createDraftBlogPost(): PublicBlogPost {
	ensureBlogSeeded();
	const now = new Date();
	const id = `bp-${randomUUID().slice(0, 10)}`;
	const slug = `draft-${randomUUID().slice(0, 6)}`;
	db.insert(blogPosts)
		.values({
			id,
			slug,
			status: 'draft',
			readingMinutes: 3,
			authorName: 'saaskaya Editorial',
			createdAt: now,
			updatedAt: now
		})
		.run();
	for (const locale of blogLocaleCodes()) {
		db.insert(blogPostTranslations)
			.values({
				postId: id,
				locale,
				title: 'Untitled post',
				description: 'Write a short summary for this blog post before publishing.',
				category: 'Product',
				seoTitle: '',
				seoDescription: '',
				body: emptyBlogDoc()
			})
			.run();
	}
	const post = getBlogPostById(id);
	if (!post) throw new Error('Draft blog post could not be created.');
	return post;
}

export function saveBlogPost(input: BlogSaveInput): BlogSaveResult {
	const parsed = saveSchema.safeParse(input);
	if (!parsed.success) {
		const issue = parsed.error.issues[0];
		return {
			ok: false,
			field: typeof issue?.path[0] === 'string' ? issue.path[0] : undefined,
			message: issue?.message ?? 'Please check the blog post fields.'
		};
	}

	const publishIssues = validatePublishedInput(parsed.data);
	if (publishIssues.length > 0) {
		return {
			ok: false,
			field: 'status',
			message: `Published posts require every active public language. ${publishIssues.join('; ')}`
		};
	}

	ensureBlogSeeded();
	const current = parsed.data.id ? getBlogPostById(parsed.data.id) : null;
	if (parsed.data.id && !current) return { ok: false, message: 'Blog post not found.' };
	const slugOwner = getBlogPostBySlug(parsed.data.slug, { includeDrafts: true });
	if (slugOwner && slugOwner.id !== parsed.data.id) {
		return { ok: false, field: 'slug', message: 'This slug is already used by another post.' };
	}

	const now = new Date();
	const id = parsed.data.id || `bp-${randomUUID().slice(0, 10)}`;
	const publishedAt =
		parsed.data.status === 'published'
			? parsed.data.publishedAt
				? new Date(`${parsed.data.publishedAt}T12:00:00.000Z`)
				: current?.date
					? new Date(`${current.date}T12:00:00.000Z`)
					: now
			: parsed.data.publishedAt
				? new Date(`${parsed.data.publishedAt}T12:00:00.000Z`)
				: null;

	const postValues = {
		id,
		slug: parsed.data.slug,
		status: parsed.data.status,
		coverImageUrl: parsed.data.coverImageUrl || null,
		readingMinutes: parsed.data.readingMinutes,
		authorName: parsed.data.authorName,
		publishedAt,
		createdAt: current ? undefined : now,
		updatedAt: now
	};

	if (current) {
		db.update(blogPosts)
			.set({
				slug: postValues.slug,
				status: postValues.status,
				coverImageUrl: postValues.coverImageUrl,
				readingMinutes: postValues.readingMinutes,
				authorName: postValues.authorName,
				publishedAt: postValues.publishedAt,
				updatedAt: postValues.updatedAt
			})
			.where(eq(blogPosts.id, id))
			.run();
	} else {
		db.insert(blogPosts)
			.values({
				...postValues,
				createdAt: now
			})
			.run();
	}

	for (const locale of Object.keys(parsed.data.translations)) {
		const translation = parsed.data.translations[locale];
		db.insert(blogPostTranslations)
			.values({
				postId: id,
				locale,
				title: translation.title,
				description: translation.description,
				category: translation.category,
				seoTitle: translation.seoTitle || null,
				seoDescription: translation.seoDescription || null,
				coverAlt: translation.coverAlt || null,
				body: translation.body
			})
			.onConflictDoUpdate({
				target: [blogPostTranslations.postId, blogPostTranslations.locale],
				set: {
					title: translation.title,
					description: translation.description,
					category: translation.category,
					seoTitle: translation.seoTitle || null,
					seoDescription: translation.seoDescription || null,
					coverAlt: translation.coverAlt || null,
					body: translation.body
				}
			})
			.run();
	}

	const post = getBlogPostById(id);
	if (!post) return { ok: false, message: 'Blog post could not be saved.' };
	return { ok: true, post };
}

function importBody(translation: z.infer<typeof importTranslationSchema>): BlogDoc {
	if (translation.body) return translation.body;
	if (translation.sections) return sectionsToBlogDoc(translation.sections);
	return emptyBlogDoc();
}

export function importBlogPostJson(
	rawJson: string,
	options: { updateExisting?: boolean } = {}
): BlogImportResult {
	let raw: unknown;
	try {
		raw = JSON.parse(rawJson);
	} catch {
		return { ok: false, message: 'The uploaded file is not valid JSON.' };
	}

	const parsed = importSchema.safeParse(raw);
	if (!parsed.success) {
		return {
			ok: false,
			message: 'The JSON file does not match the blog import format.',
			issues: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
		};
	}

	const existing = getBlogPostBySlug(parsed.data.slug, { includeDrafts: true });
	if (existing && !options.updateExisting) {
		return {
			ok: false,
			field: 'slug',
			message: `A blog post with slug "${parsed.data.slug}" already exists. Enable update existing to overwrite it.`
		};
	}

	const translations = {} as BlogSaveInput['translations'];
	for (const locale of Object.keys(parsed.data.translations)) {
		const translation = parsed.data.translations[locale];
		translations[locale] = {
			title: translation.title,
			description: translation.description,
			category: translation.category,
			seoTitle: translation.seoTitle ?? '',
			seoDescription: translation.seoDescription ?? '',
			coverAlt: parsed.data.coverAlt ?? '',
			body: importBody(translation)
		};
	}

	const result = saveBlogPost({
		id: existing?.id,
		slug: parsed.data.slug,
		status: parsed.data.status,
		coverImageUrl: parsed.data.coverImageUrl ?? '',
		readingMinutes: parsed.data.readingMinutes,
		authorName: parsed.data.authorName,
		publishedAt: parsed.data.publishedAt ?? parsed.data.date ?? '',
		translations
	});
	if (!result.ok) return result;
	return { ok: true, post: result.post, updatedExisting: Boolean(existing) };
}

export async function uploadBlogCover(input: {
	postId: string;
	fileName: string;
	mimeType: string;
	bytes: Uint8Array;
}) {
	if (input.bytes.byteLength > MAX_MEDIA_BYTES)
		throw new Error('Cover image must be 8 MB or smaller.');
	const current = db.select().from(blogPosts).where(eq(blogPosts.id, input.postId)).get();
	if (!current) throw new Error('Blog post not found.');
	const stored = await prepareStoredMedia(input.bytes, input.mimeType, input.fileName);
	const config = r2Config();
	const objectKey = `blog/${input.postId}/${randomUUID()}.${stored.extension}`;
	const url = `${config.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
	await r2Client(config).send(
		new PutObjectCommand({
			Bucket: config.bucket,
			Key: objectKey,
			Body: stored.bytes,
			ContentType: stored.mimeType,
			CacheControl: 'public, max-age=31536000, immutable'
		})
	);
	db.update(blogPosts)
		.set({ coverImageUrl: url, coverObjectKey: objectKey, updatedAt: new Date() })
		.where(eq(blogPosts.id, input.postId))
		.run();
	if (current.coverObjectKey && current.coverObjectKey !== objectKey) {
		await r2Client(config)
			.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: current.coverObjectKey }))
			.catch(() => undefined);
	}
	return { url, objectKey };
}
