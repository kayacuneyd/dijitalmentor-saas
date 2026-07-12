import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { LOCALES, type Locale } from '$lib/i18n';
import {
	blogDocSchema,
	emptyBlogDoc,
	parseBlogDoc,
	sectionsToBlogDoc,
	type BlogDoc
} from '$lib/blog/content';
import { blogPosts as seedPosts } from '$lib/public/blog';
import { db } from '$lib/server/db';
import { blogPosts, blogPostTranslations } from '$lib/server/db/schema';

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
	coverAlt: string | null;
	title: Record<Locale, string>;
	description: Record<Locale, string>;
	category: Record<Locale, string>;
	seoTitle: Record<Locale, string>;
	seoDescription: Record<Locale, string>;
	body: Record<Locale, BlogDoc>;
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
	coverAlt: z.string().trim().max(220).optional(),
	readingMinutes: z.coerce.number().int().min(1).max(30),
	authorName: z.string().trim().min(2).max(120),
	publishedAt: z.string().trim().optional(),
	translations: z.record(
		z.enum(LOCALES),
		z.object({
			title: z.string().trim().min(3).max(140),
			description: z.string().trim().min(20).max(280),
			category: z.string().trim().min(2).max(60),
			seoTitle: z.string().trim().max(160).optional(),
			seoDescription: z.string().trim().max(280).optional(),
			body: blogDocSchema
		})
	)
});

export type BlogSaveInput = {
	id?: unknown;
	slug: unknown;
	status: unknown;
	coverImageUrl?: unknown;
	coverAlt?: unknown;
	readingMinutes: unknown;
	authorName: unknown;
	publishedAt?: unknown;
	translations: Record<
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
};
export type BlogSaveResult =
	{ ok: true; post: PublicBlogPost } | { ok: false; message: string; field?: string };

let seeded = false;

function isoDate(value: Date | null): string {
	return (value ?? new Date()).toISOString().slice(0, 10);
}

function emptyLocalized<T>(factory: () => T): Record<Locale, T> {
	return Object.fromEntries(LOCALES.map((locale) => [locale, factory()])) as Record<Locale, T>;
}

function shapePost(row: BlogPostRow, translations: BlogTranslationRow[]): PublicBlogPost {
	const byLocale = new Map(translations.map((translation) => [translation.locale, translation]));
	const title = emptyLocalized(() => '');
	const description = emptyLocalized(() => '');
	const category = emptyLocalized(() => '');
	const seoTitle = emptyLocalized(() => '');
	const seoDescription = emptyLocalized(() => '');
	const body = emptyLocalized(emptyBlogDoc);

	for (const locale of LOCALES) {
		const translation = byLocale.get(locale);
		if (!translation) continue;
		title[locale] = translation.title;
		description[locale] = translation.description;
		category[locale] = translation.category;
		seoTitle[locale] = translation.seoTitle || translation.title;
		seoDescription[locale] = translation.seoDescription || translation.description;
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
		coverAlt: row.coverAlt,
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
				authorName: 'Cüneyt Kaya',
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
			authorName: 'Cüneyt Kaya',
			createdAt: now,
			updatedAt: now
		})
		.run();
	for (const locale of LOCALES) {
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
		coverAlt: parsed.data.coverAlt || null,
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
				coverAlt: postValues.coverAlt,
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

	for (const locale of LOCALES) {
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
					body: translation.body
				}
			})
			.run();
	}

	const post = getBlogPostById(id);
	if (!post) return { ok: false, message: 'Blog post could not be saved.' };
	return { ok: true, post };
}
