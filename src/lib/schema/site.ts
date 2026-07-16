import { z } from 'zod';
import {
	INTEGRATION_TYPES,
	type IntegrationType,
	validateIntegrationTarget
} from '$lib/kits/integrations';
import { LOCALES } from '$lib/i18n';

export { LOCALES };
export const localeSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof localeSchema>;

const localized = <S extends z.ZodType>(shape: S) =>
	z.strictObject({ tr: shape, en: shape, de: shape });

const nonEmpty = z.string().trim().min(1);
const hexColor = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'hex color like #1a2b3c');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'kebab-case slug');
const imageRef = z.union([z.url(), z.string().regex(/^\/[\w\-./]+$/)]);
const href = z.union([z.url(), z.string().regex(/^[/#][\w\-./#]*$/)]);

const hideOnMobile = z.boolean().optional();

/** Language-neutral, schema-safe controls shared by every rendered section. */
export const sectionStyleSchema = z.strictObject({
	layout: z.enum(['full', 'boxed']).default('full'),
	backgroundColor: hexColor.optional(),
	paddingY: z.enum(['compact', 'standard', 'spacious']).default('standard'),
	marginY: z.enum(['none', 'compact', 'standard', 'spacious']).default('none'),
	minHeight: z.enum(['auto', 'compact', 'standard', 'tall']).default('auto'),
	contentWidth: z.enum(['narrow', 'wide', 'full']).default('wide')
});
export type SectionStyle = z.infer<typeof sectionStyleSchema>;
export const DEFAULT_SECTION_STYLE: SectionStyle = {
	layout: 'full',
	paddingY: 'standard',
	marginY: 'none',
	minHeight: 'auto',
	contentWidth: 'wide'
};

export const sectionShapes = {
	hero: {
		props: z.strictObject({
			variant: z.enum(['centered', 'split']).default('centered'),
			background: z.enum(['plain', 'gradient', 'image']).default('plain'),
			imageUrl: imageRef.optional(),
			ctaHref: href.optional(),
			hideOnMobile
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
			imageUrl: imageRef.optional(),
			hideOnMobile
		}),
		content: z.strictObject({ title: nonEmpty, body: nonEmpty, imageAlt: z.string().optional() })
	},
	services: {
		props: z.strictObject({
			variant: z.enum(['grid', 'list']).default('grid'),
			columns: z.number().int().min(2).max(4).optional(),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			items: z
				.array(
					z.strictObject({ name: nonEmpty, description: nonEmpty, price: z.string().optional() })
				)
				.min(1)
				.max(12)
		})
	},
	gallery: {
		props: z.strictObject({
			variant: z.enum(['grid', 'carousel']).default('grid'),
			hideOnMobile
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
			address: z.string().optional(),
			fields: z.array(z.enum(['name', 'email', 'phone', 'message'])).optional(),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			description: z.string().optional(),
			submitLabel: z.string().optional(),
			successMessage: z.string().optional()
		})
	},
	cta: {
		props: z.strictObject({
			variant: z.enum(['banner', 'boxed']).default('banner'),
			href,
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			subtitle: z.string().optional(),
			buttonLabel: nonEmpty
		})
	},
	faq: {
		props: z.strictObject({
			variant: z.enum(['accordion', 'list']).default('accordion'),
			hideOnMobile
		}),
		content: z.strictObject({
			title: z.string().optional(),
			items: z
				.array(z.strictObject({ question: nonEmpty, answer: nonEmpty }))
				.min(1)
				.max(20)
		})
	},
	testimonials: {
		props: z.strictObject({
			variant: z.enum(['grid', 'carousel']).default('grid'),
			columns: z.number().int().min(2).max(4).optional(),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			items: z
				.array(
					z.strictObject({
						quote: nonEmpty,
						name: nonEmpty,
						role: z.string().optional(),
						avatarUrl: imageRef.optional(),
						rating: z.number().int().min(1).max(5).optional()
					})
				)
				.min(1)
				.max(12)
		})
	},
	pricing: {
		props: z.strictObject({
			variant: z.enum(['table', 'cards']).default('cards'),
			currency: z.enum(['₺', '€', '$']).default('₺'),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			items: z
				.array(
					z.strictObject({
						name: nonEmpty,
						price: nonEmpty,
						description: z.string().optional(),
						features: z.array(nonEmpty).max(8).optional(),
						highlighted: z.boolean().default(false)
					})
				)
				.min(1)
				.max(6)
		})
	},
	process: {
		props: z.strictObject({
			variant: z.enum(['vertical', 'horizontal']).default('vertical'),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			steps: z
				.array(
					z.strictObject({ label: nonEmpty, description: nonEmpty, icon: z.string().optional() })
				)
				.min(1)
				.max(8)
		})
	},
	booking: {
		props: z.strictObject({
			variant: z.enum(['inline', 'banner']).default('inline'),
			href,
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			subtitle: z.string().optional(),
			buttonLabel: nonEmpty,
			note: z.string().optional()
		})
	},
	credentials: {
		props: z.strictObject({
			variant: z.enum(['grid', 'list']).default('grid'),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			items: z
				.array(
					z.strictObject({
						name: nonEmpty,
						issuer: z.string().optional(),
						year: z.string().optional(),
						iconUrl: imageRef.optional()
					})
				)
				.min(1)
				.max(12)
		})
	},
	team: {
		props: z.strictObject({
			variant: z.enum(['grid', 'cards']).default('grid'),
			hideOnMobile
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
			variant: z.enum(['simple', 'columns']).default('simple'),
			hideOnMobile
		}),
		content: z.strictObject({
			text: nonEmpty,
			links: z
				.array(z.strictObject({ label: nonEmpty, href }))
				.max(8)
				.optional()
		})
	},
	stats: {
		props: z.strictObject({
			variant: z.enum(['grid', 'inline']).default('grid'),
			columns: z.number().int().min(2).max(4).default(4),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			items: z
				.array(
					z.strictObject({
						value: nonEmpty,
						label: nonEmpty,
						icon: z.string().optional()
					})
				)
				.min(1)
				.max(8)
		})
	},
	clients: {
		props: z.strictObject({
			variant: z.enum(['grid', 'carousel']).default('grid'),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			logos: z
				.array(z.strictObject({ url: imageRef, alt: nonEmpty }))
				.min(2)
				.max(12)
		})
	},
	video: {
		props: z.strictObject({
			variant: z.enum(['embed', 'background']).default('embed'),
			url: z
				.string()
				.url()
				.refine(
					(u) => /youtube|vimeo|youtu\.be/.test(u),
					'URL must be a YouTube or Vimeo link'
				),
			aspectRatio: z.enum(['16/9', '4/3', '1/1']).default('16/9'),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			caption: z.string().optional()
		})
	},
	collection: {
		props: z.strictObject({
			variant: z.enum(['cards', 'list']).default('cards'),
			kind: z.enum([
				'projects',
				'resources',
				'publications',
				'courses',
				'media-appearances',
				'downloads',
				'case-studies',
				'positions',
				'academic-service'
			]).default('resources'),
			hideOnMobile
		}),
		content: z.strictObject({
			title: nonEmpty,
			intro: z.string().optional(),
			items: z.array(z.strictObject({
				title: nonEmpty,
				description: z.string().optional(),
				href: href.optional(),
				meta: z.string().optional(),
				imageUrl: imageRef.optional(),
				imageAlt: z.string().optional()
			})).min(1).max(12)
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
		// Optional on input so hand-authored seeds and older drafts remain valid;
		// the editor and renderer fill DEFAULT_SECTION_STYLE at the boundary.
		style: sectionStyleSchema.optional(),
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
	'testimonials',
	'pricing',
	'process',
	'booking',
	'credentials',
	'team',
	'footer',
	'stats',
	'clients',
	'video',
	'collection'
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
	localizedSection('testimonials', sectionShapes.testimonials),
	localizedSection('pricing', sectionShapes.pricing),
	localizedSection('process', sectionShapes.process),
	localizedSection('booking', sectionShapes.booking),
	localizedSection('credentials', sectionShapes.credentials),
	localizedSection('team', sectionShapes.team),
	localizedSection('footer', sectionShapes.footer),
	localizedSection('stats', sectionShapes.stats),
	localizedSection('clients', sectionShapes.clients),
	localizedSection('video', sectionShapes.video),
	localizedSection('collection', sectionShapes.collection)
]);
export type Section = z.infer<typeof sectionSchema>;
export type SectionProps<T extends SectionType> = Extract<Section, { type: T }>['props'];
export type SectionContent<T extends SectionType> = Extract<Section, { type: T }>['content']['tr'];

export const pageSchema = z.strictObject({
	slug,
	title: localized(nonEmpty),
	sections: z.array(sectionSchema).min(1).max(12),
	meta: z.strictObject({
		title: nonEmpty.max(70).optional(),
		description: nonEmpty.max(200).optional()
	}).optional()
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

export const layoutSchema = z.strictObject({
	nav: z.strictObject({
		variant: z.enum(['inline', 'hamburger', 'drawer']).default('inline'),
		mobileBreakpoint: z.enum(['sm', 'md', 'lg']).default('lg'),
		sticky: z.boolean().default(true)
	}),
	container: z.strictObject({
		width: z.enum(['narrow', 'wide', 'full']).default('wide')
	}),
	sectionSpacing: z.enum(['tight', 'normal', 'loose']).default('normal')
});
export type Layout = z.infer<typeof layoutSchema>;
export const DEFAULT_LAYOUT: Layout = {
	nav: { variant: 'inline', mobileBreakpoint: 'lg', sticky: true },
	container: { width: 'full' },
	sectionSpacing: 'normal'
};

export const navSchema = z.strictObject({
	items: z
		.array(z.strictObject({ pageSlug: slug, label: localized(nonEmpty) }))
		.min(1)
		.max(8)
});
export type Nav = z.infer<typeof navSchema>;

const integrationEntrySchema = z
	.strictObject({
		type: z.enum(INTEGRATION_TYPES),
		enabled: z.boolean(),
		url: z.string().url().optional(),
		phone: z
			.string()
			.regex(/^\+[1-9]\d{6,14}$/)
			.optional(),
		label: localized(nonEmpty).optional()
	})
	.superRefine((entry, ctx) => {
		validateIntegrationTarget(
			entry as { type: IntegrationType; enabled: boolean; phone?: string; url?: string },
			ctx
		);
	});

export const siteSettingsSchema = z.strictObject({
	siteName: nonEmpty,
	profession: z.string().trim().min(1).max(80).optional(),
	riskProfile: z.enum(['general', 'health', 'legal', 'property']).optional(),
	primaryOutcome: z.string().trim().min(1).max(240).optional(),
	primaryCta: localized(nonEmpty).optional(),
	contactEmail: z.email().optional(),
	poweredByBadge: z.boolean().default(true),
	seo: z.strictObject({
		description: localized(nonEmpty).optional(),
		ogImage: imageRef.optional(),
		twitterCard: z.enum(['summary', 'summary_large_image']).optional()
	}).optional(),
	integrations: z.array(integrationEntrySchema).max(8).optional(),
	favicon: imageRef.optional(),
	logo: z.strictObject({
		light: imageRef.optional(),
		dark: imageRef.optional()
	}).optional(),
	analytics: z.strictObject({
		ga4Id: z.string().regex(/^G-[A-Z0-9]{10,}$/).optional(),
		metaPixelId: z.string().regex(/^\d{15,16}$/).optional()
	}).optional(),
	cookieConsent: z.boolean().optional()
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const siteSchema = z
	.strictObject({
		id: nonEmpty,
		tenantId: nonEmpty,
		domain: z
			.string()
			.regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, 'hostname')
			.optional(),
		defaultLocale: localeSchema,
		locales: z.array(localeSchema).min(1).max(LOCALES.length),
		theme: themeSchema,
		layout: layoutSchema.optional(),
		nav: navSchema,
		pages: z.array(pageSchema).min(1).max(10),
		settings: siteSettingsSchema
	})
	.superRefine((site, ctx) => {
		if (!site.locales.includes(site.defaultLocale))
			ctx.addIssue({
				code: 'custom',
				path: ['defaultLocale'],
				message: `defaultLocale "${site.defaultLocale}" must be listed in locales`
			});
		if (new Set(site.locales).size !== site.locales.length)
			ctx.addIssue({ code: 'custom', path: ['locales'], message: 'locales must be unique' });
		const slugs = site.pages.map((p) => p.slug);
		if (new Set(slugs).size !== slugs.length)
			ctx.addIssue({ code: 'custom', path: ['pages'], message: 'page slugs must be unique' });
		for (const [i, item] of site.nav.items.entries())
			if (!slugs.includes(item.pageSlug))
				ctx.addIssue({
					code: 'custom',
					path: ['nav', 'items', i, 'pageSlug'],
					message: `nav item points to unknown page "${item.pageSlug}"`
				});
		const integrations = site.settings.integrations ?? [];
		for (const [i, entry] of integrations.entries()) {
			validateIntegrationTarget(
				entry as { type: IntegrationType; enabled: boolean; phone?: string; url?: string },
				{
					addIssue: (arg) =>
						ctx.addIssue({ ...arg, path: ['settings', 'integrations', i, ...arg.path] })
				}
			);
		}
		const types = integrations.map((e) => e.type);
		if (new Set(types).size !== types.length) {
			ctx.addIssue({
				code: 'custom',
				path: ['settings', 'integrations'],
				message: 'integration types must be unique'
			});
		}
	});
export type Site = z.infer<typeof siteSchema>;
