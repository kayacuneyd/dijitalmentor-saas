import { z } from 'zod';

/**
 * The Zod `Site` schema — THE contract (constitution §1).
 * Shared by the AI generator, the editor, and the renderer; all TS types are inferred from here.
 *
 * Shape rules:
 * - `props`   = language-neutral layout knobs (variant, layout, background, …).
 * - `content` = per-locale text + media refs. Every locale key (tr/en/de) is required;
 *   the translate step fills non-default locales and keeps media URLs in sync.
 * - All objects are strict: unknown keys are rejected, so malformed AI output cannot slip through.
 */

export const LOCALES = ['tr', 'en', 'de'] as const;
export const localeSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof localeSchema>;

/** Per-locale record of a content shape — all locales required. */
const localized = <S extends z.ZodType>(shape: S) =>
	z.strictObject({ tr: shape, en: shape, de: shape });

const nonEmpty = z.string().trim().min(1);
const hexColor = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'hex color like #1a2b3c');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'kebab-case slug');
/** Absolute URL or root-relative path (seed/media assets). */
const imageRef = z.union([z.url(), z.string().regex(/^\/[\w\-./]+$/)]);
/** Link target: internal path, anchor, or absolute URL. Locale prefixes are added by the renderer. */
const href = z.union([z.url(), z.string().regex(/^[/#][\w\-./#]*$/)]);

// ---------------------------------------------------------------------------
// Sections — the fixed block set (constitution §3). One entry per block type.
// Props and one-locale content schemas are defined separately so the AI layer
// can derive a single-locale generation schema from the same shapes.
// ---------------------------------------------------------------------------

/**
 * Per-type props (language-neutral) + one-locale content shapes.
 * The single source for both the localized `Site` contract and the AI
 * generation/translation schemas (`src/lib/server/ai/`).
 */
export const sectionShapes = {
	hero: {
		props: z.strictObject({
			variant: z.enum(['centered', 'split']).default('centered'),
			background: z.enum(['plain', 'gradient', 'image']).default('plain'),
			imageUrl: imageRef.optional(),
			ctaHref: href.optional()
		}),
		content: z.strictObject({
			headline: nonEmpty,
			subheadline: z.string().optional(),
			ctaLabel: z.string().optional()
		})
	},
	about: {
		props: z.strictObject({
			variant: z.enum(['text', 'text-image']).default('text'),
			imageUrl: imageRef.optional()
		}),
		content: z.strictObject({
			title: nonEmpty,
			body: nonEmpty,
			imageAlt: z.string().optional()
		})
	},
	services: {
		props: z.strictObject({
			variant: z.enum(['grid', 'list']).default('grid'),
			columns: z.number().int().min(2).max(4).optional()
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			items: z
				.array(
					z.strictObject({
						name: nonEmpty,
						description: nonEmpty,
						price: z.string().optional()
					})
				)
				.min(1)
				.max(12)
		})
	},
	gallery: {
		props: z.strictObject({
			variant: z.enum(['grid', 'carousel']).default('grid')
		}),
		content: z.strictObject({
			title: z.string().optional(),
			images: z
				.array(z.strictObject({ url: imageRef, alt: nonEmpty }))
				.min(1)
				.max(24)
		})
	},
	contact: {
		props: z.strictObject({
			variant: z.enum(['form', 'split']).default('form'),
			email: z.email(),
			phone: z.string().optional(),
			address: z.string().optional()
		}),
		content: z.strictObject({
			title: nonEmpty,
			description: z.string().optional(),
			submitLabel: z.string().optional()
		})
	},
	cta: {
		props: z.strictObject({
			variant: z.enum(['banner', 'boxed']).default('banner'),
			href
		}),
		content: z.strictObject({
			title: nonEmpty,
			subtitle: z.string().optional(),
			buttonLabel: nonEmpty
		})
	},
	faq: {
		props: z.strictObject({
			variant: z.enum(['accordion', 'list']).default('accordion')
		}),
		content: z.strictObject({
			title: z.string().optional(),
			items: z
				.array(z.strictObject({ question: nonEmpty, answer: nonEmpty }))
				.min(1)
				.max(20)
		})
	},
	team: {
		props: z.strictObject({
			variant: z.enum(['grid', 'cards']).default('grid')
		}),
		content: z.strictObject({
			title: z.string().optional(),
			members: z
				.array(
					z.strictObject({
						name: nonEmpty,
						role: nonEmpty,
						bio: z.string().optional(),
						photoUrl: imageRef.optional()
					})
				)
				.min(1)
				.max(12)
		})
	},
	footer: {
		props: z.strictObject({
			variant: z.enum(['simple', 'columns']).default('simple')
		}),
		content: z.strictObject({
			text: nonEmpty,
			links: z
				.array(z.strictObject({ label: nonEmpty, href }))
				.max(8)
				.optional()
		})
	}
} as const;

const localizedSection = <T extends SectionType, P extends z.ZodType, C extends z.ZodType>(
	type: T,
	shape: { props: P; content: C }
) =>
	z.strictObject({
		id: nonEmpty,
		type: z.literal(type),
		props: shape.props,
		content: localized(shape.content)
	});

export const SECTION_TYPES = [
	'hero',
	'about',
	'services',
	'gallery',
	'contact',
	'cta',
	'faq',
	'team',
	'footer'
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const sectionSchema = z.discriminatedUnion('type', [
	localizedSection('hero', sectionShapes.hero),
	localizedSection('about', sectionShapes.about),
	localizedSection('services', sectionShapes.services),
	localizedSection('gallery', sectionShapes.gallery),
	localizedSection('contact', sectionShapes.contact),
	localizedSection('cta', sectionShapes.cta),
	localizedSection('faq', sectionShapes.faq),
	localizedSection('team', sectionShapes.team),
	localizedSection('footer', sectionShapes.footer)
]);
export type Section = z.infer<typeof sectionSchema>;

/** Language-neutral props for a given section type — what a block component receives. */
export type SectionProps<T extends SectionType> = Extract<Section, { type: T }>['props'];
/** One locale's content shape for a given section type (all locales share it). */
export type SectionContent<T extends SectionType> = Extract<Section, { type: T }>['content']['tr'];

// ---------------------------------------------------------------------------
// Page / theme / nav / settings / site
// ---------------------------------------------------------------------------

export const pageSchema = z.strictObject({
	slug,
	title: localized(nonEmpty),
	sections: z.array(sectionSchema).min(1).max(12)
});
export type Page = z.infer<typeof pageSchema>;

export const themeSchema = z.strictObject({
	preset: z.enum(['law', 'psych', 'dental']),
	colors: z.strictObject({
		primary: hexColor,
		secondary: hexColor,
		accent: hexColor,
		neutral: hexColor.optional(),
		base: hexColor.optional()
	}),
	fonts: z.strictObject({ heading: nonEmpty, body: nonEmpty }),
	radius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md')
});
export type Theme = z.infer<typeof themeSchema>;

export const navSchema = z.strictObject({
	items: z
		.array(z.strictObject({ pageSlug: slug, label: localized(nonEmpty) }))
		.min(1)
		.max(8)
});
export type Nav = z.infer<typeof navSchema>;

export const siteSettingsSchema = z.strictObject({
	siteName: nonEmpty,
	contactEmail: z.email().optional(),
	poweredByBadge: z.boolean().default(true),
	seo: z.strictObject({ description: localized(nonEmpty) }).optional()
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const siteSchema = z
	.strictObject({
		id: nonEmpty,
		tenantId: nonEmpty,
		/** Absent until a real domain is registered (M5); dev/preview use localhost/subdomains. */
		domain: z
			.string()
			.regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, 'hostname')
			.optional(),
		defaultLocale: localeSchema,
		locales: z.array(localeSchema).min(1).max(LOCALES.length),
		theme: themeSchema,
		nav: navSchema,
		pages: z.array(pageSchema).min(1).max(10),
		settings: siteSettingsSchema
	})
	.superRefine((site, ctx) => {
		if (!site.locales.includes(site.defaultLocale)) {
			ctx.addIssue({
				code: 'custom',
				path: ['defaultLocale'],
				message: `defaultLocale "${site.defaultLocale}" must be listed in locales`
			});
		}
		if (new Set(site.locales).size !== site.locales.length) {
			ctx.addIssue({ code: 'custom', path: ['locales'], message: 'locales must be unique' });
		}
		const slugs = site.pages.map((p) => p.slug);
		if (new Set(slugs).size !== slugs.length) {
			ctx.addIssue({ code: 'custom', path: ['pages'], message: 'page slugs must be unique' });
		}
		for (const [i, item] of site.nav.items.entries()) {
			if (!slugs.includes(item.pageSlug)) {
				ctx.addIssue({
					code: 'custom',
					path: ['nav', 'items', i, 'pageSlug'],
					message: `nav item points to unknown page "${item.pageSlug}"`
				});
			}
		}
	});
export type Site = z.infer<typeof siteSchema>;
