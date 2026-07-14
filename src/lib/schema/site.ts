import { z } from 'zod';
import { INTEGRATION_TYPES, type IntegrationType, validateIntegrationTarget } from '$lib/kits/integrations';
import { LOCALES } from '$lib/i18n';

// Tenant-published-site languages currently mirror the app's own UI languages
// (`$lib/i18n`'s LOCALES) — re-exported here rather than redeclared so the two
// never drift when a new language is added. If tenant-site languages ever need
// to diverge from the app's UI languages, give them their own SITE_LOCALES here
// instead of re-widening this re-export.
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

export const sectionShapes = {
	hero: {
		props: z.strictObject({
			variant: z.enum(['centered', 'split']).default('centered'),
			background: z.enum(['plain', 'gradient', 'image']).default('plain'),
			imageUrl: imageRef.optional(),
			ctaHref: href.optional()
		}),
		content: z.strictObject({ headline: nonEmpty, subheadline: z.string().optional(), ctaLabel: z.string().optional() })
	},
	about: {
		props: z.strictObject({ variant: z.enum(['text', 'text-image']).default('text'), imageUrl: imageRef.optional() }),
		content: z.strictObject({ title: nonEmpty, body: nonEmpty, imageAlt: z.string().optional() })
	},
	services: {
		props: z.strictObject({ variant: z.enum(['grid', 'list']).default('grid'), columns: z.number().int().min(2).max(4).optional() }),
		content: z.strictObject({
			title: nonEmpty, intro: z.string().optional(),
			items: z.array(z.strictObject({ name: nonEmpty, description: nonEmpty, price: z.string().optional() })).min(1).max(12)
		})
	},
	gallery: {
		props: z.strictObject({ variant: z.enum(['grid', 'carousel']).default('grid') }),
		content: z.strictObject({ title: z.string().optional(), images: z.array(z.strictObject({ url: imageRef, alt: nonEmpty })).min(1).max(24) })
	},
	contact: {
		props: z.strictObject({ variant: z.enum(['form', 'split']).default('form'), email: z.email(), phone: z.string().optional(), address: z.string().optional() }),
		content: z.strictObject({ title: nonEmpty, description: z.string().optional(), submitLabel: z.string().optional() })
	},
	cta: {
		props: z.strictObject({ variant: z.enum(['banner', 'boxed']).default('banner'), href }),
		content: z.strictObject({ title: nonEmpty, subtitle: z.string().optional(), buttonLabel: nonEmpty })
	},
	faq: {
		props: z.strictObject({ variant: z.enum(['accordion', 'list']).default('accordion') }),
		content: z.strictObject({ title: z.string().optional(), items: z.array(z.strictObject({ question: nonEmpty, answer: nonEmpty })).min(1).max(20) })
	},
	testimonials: {
		props: z.strictObject({ variant: z.enum(['grid', 'carousel']).default('grid'), columns: z.number().int().min(2).max(4).optional() }),
		content: z.strictObject({
			title: nonEmpty, intro: z.string().optional(),
			items: z.array(z.strictObject({ quote: nonEmpty, name: nonEmpty, role: z.string().optional(), avatarUrl: imageRef.optional(), rating: z.number().int().min(1).max(5).optional() })).min(1).max(12)
		})
	},
	pricing: {
		props: z.strictObject({ variant: z.enum(['table', 'cards']).default('cards'), currency: z.enum(['₺', '€', '$']).default('₺') }),
		content: z.strictObject({
			title: nonEmpty, intro: z.string().optional(),
			items: z.array(z.strictObject({ name: nonEmpty, price: nonEmpty, description: z.string().optional(), features: z.array(nonEmpty).max(8).optional(), highlighted: z.boolean().default(false) })).min(1).max(6)
		})
	},
	process: {
		props: z.strictObject({ variant: z.enum(['vertical', 'horizontal']).default('vertical') }),
		content: z.strictObject({
			title: nonEmpty, intro: z.string().optional(),
			steps: z.array(z.strictObject({ label: nonEmpty, description: nonEmpty, icon: z.string().optional() })).min(1).max(8)
		})
	},
	booking: {
		props: z.strictObject({ variant: z.enum(['inline', 'banner']).default('inline'), href }),
		content: z.strictObject({ title: nonEmpty, subtitle: z.string().optional(), buttonLabel: nonEmpty, note: z.string().optional() })
	},
	credentials: {
		props: z.strictObject({ variant: z.enum(['grid', 'list']).default('grid') }),
		content: z.strictObject({
			title: nonEmpty, intro: z.string().optional(),
			items: z.array(z.strictObject({ name: nonEmpty, issuer: z.string().optional(), year: z.string().optional(), iconUrl: imageRef.optional() })).min(1).max(12)
		})
	},
	team: {
		props: z.strictObject({ variant: z.enum(['grid', 'cards']).default('grid') }),
		content: z.strictObject({ title: z.string().optional(), members: z.array(z.strictObject({ name: nonEmpty, role: nonEmpty, bio: z.string().optional(), photoUrl: imageRef.optional() })).min(1).max(12) })
	},
	footer: {
		props: z.strictObject({ variant: z.enum(['simple', 'columns']).default('simple') }),
		content: z.strictObject({ text: nonEmpty, links: z.array(z.strictObject({ label: nonEmpty, href })).max(8).optional() })
	}
} as const;

const localizedSection = <T extends SectionType, P extends z.ZodType, C extends z.ZodType>(
	type: T, shape: { props: P; content: C }
) => z.strictObject({ id: nonEmpty, type: z.literal(type), props: shape.props, content: localized(shape.content) });

export const SECTION_TYPES = [
	'hero', 'about', 'services', 'gallery', 'contact', 'cta', 'faq',
	'testimonials', 'pricing', 'process', 'booking', 'credentials',
	'team', 'footer'
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
	localizedSection('footer', sectionShapes.footer)
]);
export type Section = z.infer<typeof sectionSchema>;
export type SectionProps<T extends SectionType> = Extract<Section, { type: T }>['props'];
export type SectionContent<T extends SectionType> = Extract<Section, { type: T }>['content']['tr'];

export const pageSchema = z.strictObject({ slug, title: localized(nonEmpty), sections: z.array(sectionSchema).min(1).max(12) });
export type Page = z.infer<typeof pageSchema>;

export const themeSchema = z.strictObject({
	preset: z.enum(['law', 'psych', 'dental']),
	colors: z.strictObject({ primary: hexColor, secondary: hexColor, accent: hexColor, neutral: hexColor.optional(), base: hexColor.optional() }),
	fonts: z.strictObject({ heading: nonEmpty, body: nonEmpty }),
	radius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md')
});
export type Theme = z.infer<typeof themeSchema>;

export const navSchema = z.strictObject({ items: z.array(z.strictObject({ pageSlug: slug, label: localized(nonEmpty) })).min(1).max(8) });
export type Nav = z.infer<typeof navSchema>;

const integrationEntrySchema = z.strictObject({
	type: z.enum(INTEGRATION_TYPES),
	enabled: z.boolean(),
	url: z.string().url().optional(),
	phone: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
	label: localized(nonEmpty).optional()
}).superRefine((entry, ctx) => {
	validateIntegrationTarget(entry as { type: IntegrationType; enabled: boolean; phone?: string; url?: string }, ctx);
});

export const siteSettingsSchema = z.strictObject({
	siteName: nonEmpty, contactEmail: z.email().optional(), poweredByBadge: z.boolean().default(true),
	seo: z.strictObject({ description: localized(nonEmpty) }).optional(),
	integrations: z.array(integrationEntrySchema).max(8).optional()
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const siteSchema = z.strictObject({
	id: nonEmpty, tenantId: nonEmpty,
	domain: z.string().regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, 'hostname').optional(),
	defaultLocale: localeSchema, locales: z.array(localeSchema).min(1).max(LOCALES.length),
	theme: themeSchema, nav: navSchema, pages: z.array(pageSchema).min(1).max(10), settings: siteSettingsSchema
}).superRefine((site, ctx) => {
	if (!site.locales.includes(site.defaultLocale)) ctx.addIssue({ code: 'custom', path: ['defaultLocale'], message: `defaultLocale "${site.defaultLocale}" must be listed in locales` });
	if (new Set(site.locales).size !== site.locales.length) ctx.addIssue({ code: 'custom', path: ['locales'], message: 'locales must be unique' });
	const slugs = site.pages.map((p) => p.slug);
	if (new Set(slugs).size !== slugs.length) ctx.addIssue({ code: 'custom', path: ['pages'], message: 'page slugs must be unique' });
	for (const [i, item] of site.nav.items.entries())
		if (!slugs.includes(item.pageSlug)) ctx.addIssue({ code: 'custom', path: ['nav', 'items', i, 'pageSlug'], message: `nav item points to unknown page "${item.pageSlug}"` });
	// Validate integration entries per type (domain allowlist, field consistency)
	const integrations = site.settings.integrations ?? [];
	for (const [i, entry] of integrations.entries()) {
		validateIntegrationTarget(entry as { type: IntegrationType; enabled: boolean; phone?: string; url?: string }, {
			addIssue: (arg) => ctx.addIssue({ ...arg, path: ['settings', 'integrations', i, ...arg.path] })
		});
	}
	// Integration type uniqueness
	const types = integrations.map((e) => e.type);
	if (new Set(types).size !== types.length) {
		ctx.addIssue({ code: 'custom', path: ['settings', 'integrations'], message: 'integration types must be unique' });
	}
});
export type Site = z.infer<typeof siteSchema>;