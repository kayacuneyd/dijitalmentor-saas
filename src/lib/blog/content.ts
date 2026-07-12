import { z } from 'zod';

export const textMarkSchema = z.object({
	type: z.enum(['bold', 'italic', 'underline', 'link']),
	attrs: z
		.object({
			href: z.string().trim().max(500).optional(),
			target: z.string().trim().max(40).optional(),
			rel: z.string().trim().max(120).optional()
		})
		.optional()
});

export type BlogTextMark = z.infer<typeof textMarkSchema>;

export type BlogContentNode = {
	type:
		| 'doc'
		| 'paragraph'
		| 'heading'
		| 'text'
		| 'bulletList'
		| 'orderedList'
		| 'listItem'
		| 'blockquote'
		| 'hardBreak'
		| 'image';
	text?: string;
	attrs?: {
		level?: number;
		src?: string;
		alt?: string;
		title?: string;
	};
	marks?: BlogTextMark[];
	content?: BlogContentNode[];
};

export type BlogDoc = {
	type: 'doc';
	content?: BlogContentNode[];
};

const nodeSchema: z.ZodType<BlogContentNode> = z.lazy(() =>
	z.object({
		type: z.enum([
			'doc',
			'paragraph',
			'heading',
			'text',
			'bulletList',
			'orderedList',
			'listItem',
			'blockquote',
			'hardBreak',
			'image'
		]),
		text: z.string().max(8000).optional(),
		attrs: z
			.object({
				level: z.number().int().min(1).max(3).optional(),
				src: z.string().trim().max(700).optional(),
				alt: z.string().trim().max(220).optional(),
				title: z.string().trim().max(220).optional()
			})
			.optional(),
		marks: z.array(textMarkSchema).max(6).optional(),
		content: z.array(nodeSchema).max(80).optional()
	})
);

export const blogDocSchema: z.ZodType<BlogDoc> = z.object({
	type: z.literal('doc'),
	content: z.array(nodeSchema).max(120).optional()
});

export function emptyBlogDoc(): BlogDoc {
	return {
		type: 'doc',
		content: [{ type: 'paragraph' }]
	};
}

export function sectionsToBlogDoc(sections: { heading: string; body: string }[]): BlogDoc {
	return {
		type: 'doc',
		content: sections.flatMap((section) => [
			{
				type: 'heading' as const,
				attrs: { level: 2 },
				content: [{ type: 'text' as const, text: section.heading }]
			},
			{
				type: 'paragraph' as const,
				content: [{ type: 'text' as const, text: section.body }]
			}
		])
	};
}

export function parseBlogDoc(value: unknown): BlogDoc {
	if (typeof value === 'string') {
		try {
			return blogDocSchema.parse(JSON.parse(value));
		} catch {
			return emptyBlogDoc();
		}
	}
	const parsed = blogDocSchema.safeParse(value);
	return parsed.success ? parsed.data : emptyBlogDoc();
}

export function blogDocText(doc: BlogDoc): string {
	const parts: string[] = [];
	const walk = (node: BlogContentNode) => {
		if (node.type === 'text' && node.text) parts.push(node.text);
		node.content?.forEach(walk);
	};
	doc.content?.forEach(walk);
	return parts.join(' ').replace(/\s+/g, ' ').trim();
}
