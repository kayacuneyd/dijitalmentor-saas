import { z } from 'zod';
import {
	localeSchema,
	pageSchema,
	sectionSchema,
	sectionShapes,
	themeSchema,
	SECTION_TYPES,
	type Locale
} from '$lib/schema/site';

/**
 * AI-facing schemas, all derived from the one contract (`$lib/schema/site`).
 * Generation is single-locale (the chosen default); EN/DE are filled by the
 * translate step and merged in `generate.ts`. Every tool input is validated
 * with `safeParse` before it is used anywhere (constitution §2).
 */

const nonEmpty = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'kebab-case slug');
const localized = <S extends z.ZodType>(shape: S) =>
	z.strictObject({ tr: shape, en: shape, de: shape });

/** A section as the AI generates it: one locale's content, no per-locale record. */
const genSection = <
	T extends (typeof SECTION_TYPES)[number],
	P extends z.ZodType,
	C extends z.ZodType
>(
	type: T,
	shape: { props: P; content: C }
) =>
	z.strictObject({
		id: nonEmpty.describe('unique kebab-case section id, e.g. "hero-1"'),
		type: z.literal(type),
		props: shape.props,
		content: shape.content
	});

/** All 17 section types the AI can generate. Must stay in sync with SECTION_TYPES. */
export const genSectionSchema = z.discriminatedUnion('type', [
	genSection('hero', sectionShapes.hero),
	genSection('about', sectionShapes.about),
	genSection('services', sectionShapes.services),
	genSection('gallery', sectionShapes.gallery),
	genSection('contact', sectionShapes.contact),
	genSection('cta', sectionShapes.cta),
	genSection('faq', sectionShapes.faq),
	genSection('testimonials', sectionShapes.testimonials),
	genSection('pricing', sectionShapes.pricing),
	genSection('process', sectionShapes.process),
	genSection('booking', sectionShapes.booking),
	genSection('credentials', sectionShapes.credentials),
	genSection('team', sectionShapes.team),
	genSection('footer', sectionShapes.footer),
	genSection('stats', sectionShapes.stats),
	genSection('clients', sectionShapes.clients),
	genSection('video', sectionShapes.video)
]);

const patchSection = <
	T extends (typeof SECTION_TYPES)[number],
	P extends z.ZodType,
	C extends z.ZodType
>(
	type: T,
	shape: { props: P; content: C }
) =>
	z.strictObject({
		id: nonEmpty,
		type: z.literal(type),
		props: shape.props,
		content: localized(shape.content)
	});

const patchSectionSchema = z.discriminatedUnion('type', [
	patchSection('hero', sectionShapes.hero),
	patchSection('about', sectionShapes.about),
	patchSection('services', sectionShapes.services),
	patchSection('gallery', sectionShapes.gallery),
	patchSection('contact', sectionShapes.contact),
	patchSection('cta', sectionShapes.cta),
	patchSection('faq', sectionShapes.faq),
	patchSection('testimonials', sectionShapes.testimonials),
	patchSection('pricing', sectionShapes.pricing),
	patchSection('process', sectionShapes.process),
	patchSection('booking', sectionShapes.booking),
	patchSection('credentials', sectionShapes.credentials),
	patchSection('team', sectionShapes.team),
	patchSection('footer', sectionShapes.footer),
	patchSection('stats', sectionShapes.stats),
	patchSection('clients', sectionShapes.clients),
	patchSection('video', sectionShapes.video)
]);

const patchPageSchema = z.strictObject({
	slug,
	title: localized(nonEmpty),
	sections: z.array(patchSectionSchema).min(1).max(12),
	meta: z.strictObject({
		title: nonEmpty.max(70).optional(),
		description: nonEmpty.max(200).optional()
	}).optional()
});

// Drift guard: the generated schema MUST have exactly the same count as SECTION_TYPES.
if (genSectionSchema.options.length !== SECTION_TYPES.length) {
	throw new Error(
		`genSectionSchema has ${genSectionSchema.options.length} types but SECTION_TYPES has ${SECTION_TYPES.length}. Add the new block to genSectionSchema.`
	);
}

export const genPageSchema = z.strictObject({
	slug,
	title: nonEmpty,
	sections: z.array(genSectionSchema).min(1).max(12)
});

/** What the AI fills for a brand-new site — ids/tenancy/locale fan-out are ours. */
export const generatedSiteSchema = z.strictObject({
	defaultLocale: localeSchema.describe('language of the user description and of all copy below'),
	theme: themeSchema,
	nav: z
		.array(z.strictObject({ pageSlug: slug, label: nonEmpty }))
		.min(1)
		.max(8),
	pages: z.array(genPageSchema).min(1).max(5),
	settings: z.strictObject({
		siteName: nonEmpty,
		contactEmail: z.email().optional(),
		seoDescription: nonEmpty.max(200).optional()
	})
});
export type GeneratedSite = z.infer<typeof generatedSiteSchema>;

// ---------------------------------------------------------------------------
// Translation — the localizable slice of a generated site, re-emitted per target locale.
// ---------------------------------------------------------------------------

/** All 17 content shapes — must stay in sync with SECTION_TYPES. */
const translatableContentShapes = z.union([
	sectionShapes.hero.content,
	sectionShapes.about.content,
	sectionShapes.services.content,
	sectionShapes.gallery.content,
	sectionShapes.contact.content,
	sectionShapes.cta.content,
	sectionShapes.faq.content,
	sectionShapes.testimonials.content,
	sectionShapes.pricing.content,
	sectionShapes.process.content,
	sectionShapes.booking.content,
	sectionShapes.credentials.content,
	sectionShapes.team.content,
	sectionShapes.footer.content,
	sectionShapes.stats.content,
	sectionShapes.clients.content,
	sectionShapes.video.content
]);

export const translatablePayloadSchema = z.strictObject({
	pages: z.array(
		z.strictObject({
			slug,
			title: nonEmpty,
			sections: z.array(
				z.strictObject({
					id: nonEmpty,
					type: z.enum(SECTION_TYPES),
					content: translatableContentShapes
				})
			)
		})
	),
	navLabels: z.array(z.strictObject({ pageSlug: slug, label: nonEmpty })),
	seoDescription: nonEmpty.max(200).optional()
});
export type TranslatablePayload = z.infer<typeof translatablePayloadSchema>;

/** Extract the localizable slice of a generated site (input for the translate step). */
export function extractTranslatable(gen: GeneratedSite): TranslatablePayload {
	return translatablePayloadSchema.parse({
		pages: gen.pages.map((page) => ({
			slug: page.slug,
			title: page.title,
			sections: page.sections.map((s) => ({ id: s.id, type: s.type, content: s.content }))
		})),
		navLabels: gen.nav.map((item) => ({ pageSlug: item.pageSlug, label: item.label })),
		...(gen.settings.seoDescription ? { seoDescription: gen.settings.seoDescription } : {})
	});
}

/** Tool input for the translate step: one payload per target locale. */
export function translationSchemaFor(targets: Locale[]) {
	return z.strictObject(
		Object.fromEntries(targets.map((t) => [t, translatablePayloadSchema])) as Record<
			Locale,
			typeof translatablePayloadSchema
		>
	);
}

// ---------------------------------------------------------------------------
// Chat patch — the constrained edit surface (constitution §2: AI never free-edits).
// ---------------------------------------------------------------------------

const target = { pageSlug: slug, sectionId: nonEmpty };

const layoutPatchShape = {
	nav: z
		.strictObject({
			variant: z.enum(['inline', 'hamburger', 'drawer']).optional(),
			mobileBreakpoint: z.enum(['sm', 'md', 'lg']).optional(),
			sticky: z.boolean().optional()
		})
		.optional(),
	container: z
		.strictObject({
			width: z.enum(['narrow', 'wide', 'full']).optional()
		})
		.optional(),
	sectionSpacing: z.enum(['tight', 'normal', 'loose']).optional()
};

export const patchOpSchema = z.discriminatedUnion('op', [
	z.strictObject({
		op: z.literal('set_text'),
		...target,
		locale: localeSchema,
		path: z
			.array(z.union([z.string(), z.number().int().min(0)]))
			.min(1)
			.max(4)
			.describe('path inside the section content, e.g. ["headline"] or ["items", 0, "name"]'),
		value: z.string()
	}),
	z.strictObject({
		op: z.literal('set_props'),
		...target,
		key: nonEmpty,
		value: z.union([z.string(), z.number(), z.boolean()])
	}),
	z.strictObject({
		op: z.literal('set_page_title'),
		pageSlug: slug,
		locale: localeSchema,
		value: nonEmpty
	}),
	z.strictObject({
		op: z.literal('set_page_meta'),
		pageSlug: slug,
		meta: z.strictObject({
			title: nonEmpty.max(70).optional(),
			description: nonEmpty.max(200).optional()
		})
	}),
	z.strictObject({
		op: z.literal('set_nav_label'),
		pageSlug: slug,
		locale: localeSchema,
		value: nonEmpty
	}),
	z.strictObject({
		op: z.literal('set_theme'),
		theme: z.strictObject({
			preset: themeSchema.shape.preset.optional(),
			colors: themeSchema.shape.colors.partial().optional(),
			fonts: themeSchema.shape.fonts.partial().optional(),
			radius: themeSchema.shape.radius.optional()
		})
	}),
	z.strictObject({
		op: z.literal('set_layout'),
		layout: z.strictObject(layoutPatchShape)
	}),
	z.strictObject({
		op: z.literal('set_settings'),
		settings: z.strictObject({
			siteName: nonEmpty.optional(),
			contactEmail: z.email().optional(),
			poweredByBadge: z.boolean().optional()
		})
	}),
	z.strictObject({
		op: z.literal('add_section'),
		pageSlug: slug,
		index: z.number().int().min(0).optional(),
		section: patchSectionSchema
	}),
	z.strictObject({
		op: z.literal('add_page'),
		page: patchPageSchema.describe(
			'complete new page with localized title and valid localized sections'
		),
		addToNav: z.boolean().default(true).describe('whether to add the page to the main navigation')
	}),
	z.strictObject({ op: z.literal('remove_section'), ...target }),
	z.strictObject({ op: z.literal('move_section'), ...target, toIndex: z.number().int().min(0) })
]);
export type PatchOp = z.infer<typeof patchOpSchema>;

/** Tool input for chat edits: a short reply plus zero-or-more constrained operations. */
export const chatPatchSchema = z.strictObject({
	reply: nonEmpty.describe("short answer to the user, in the user's language"),
	operations: z.array(patchOpSchema).max(20)
});
export type ChatPatch = z.infer<typeof chatPatchSchema>;

// ---------------------------------------------------------------------------
// Gatekeeper (Layer 1) — cheap intent triage before the expensive patch agent.
// Never mutates the site; its output is display/routing data only.
// ---------------------------------------------------------------------------

export const GATE_INTENTS = ['edit', 'question', 'off_topic', 'help_request'] as const;
export const RISK_LEVELS = ['low', 'medium', 'high'] as const;

/** Plain object shape — used for the tool input_schema (refinements are not JSON-schema-able). */
export const gateObjectSchema = z.strictObject({
	intent: z.enum(GATE_INTENTS),
	reply: nonEmpty.describe(
		"short answer in the user's language: the answer itself (question), a polite redirect (off_topic), a hand-off note (help_request), or a one-line summary (edit)"
	),
	distilledPrompt: z
		.string()
		.trim()
		.min(1)
		.optional()
		.describe('edit only: the concrete change request, distilled into clear instructions'),
	riskLevel: z
		.enum(RISK_LEVELS)
		.optional()
		.describe(
			'edit only: low = copy tweaks; medium = theme/props/nav changes; high = adding/removing sections or pages, full redesigns'
		)
});

export const gateSchema = gateObjectSchema.superRefine((gate, ctx) => {
	if (gate.intent === 'edit' && (!gate.distilledPrompt || !gate.riskLevel)) {
		ctx.addIssue({
			code: 'custom',
			message: 'intent "edit" requires distilledPrompt and riskLevel'
		});
	}
});
export type GateResult = z.infer<typeof gateSchema>;

// ---------------------------------------------------------------------------
// Guided onboarding topic-guard — binary on-topic classification only.
// ---------------------------------------------------------------------------

export const onboardingGuardObjectSchema = z.strictObject({
	onTopic: z.boolean(),
	reply: z
		.string()
		.trim()
		.max(300)
		.optional()
		.describe(
			'required when onTopic=false: a same-language message that declines and restates the exact question the visitor still needs to answer'
		)
});

export const onboardingGuardSchema = onboardingGuardObjectSchema.superRefine((result, ctx) => {
	if (!result.onTopic && !result.reply) {
		ctx.addIssue({ code: 'custom', message: 'onTopic=false requires a reply' });
	}
});
export type OnboardingGuardResult = z.infer<typeof onboardingGuardSchema>;

/** JSON schema for a tool definition (Claude tool-use input_schema). */
export function toInputSchema(schema: z.ZodType): Record<string, unknown> {
	return z.toJSONSchema(schema, { target: 'draft-2020-12', reused: 'inline' }) as Record<
		string,
		unknown
	>;
}
