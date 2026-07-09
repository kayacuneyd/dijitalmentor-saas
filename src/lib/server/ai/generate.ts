import type Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';
import { LOCALES, siteSchema, type Locale, type Site } from '$lib/schema/site';
import {
	extractTranslatable,
	generatedSiteSchema,
	toInputSchema,
	translationSchemaFor,
	type GeneratedSite,
	type TranslatablePayload
} from './schemas';
import {
	addUsage,
	AIInvalidOutputError,
	runToolCall,
	type RunToolCall,
	type TokenUsage
} from './llm';

/**
 * Self-description → Zod-valid Site JSON (PLAN §4).
 * 1) `create_site` tool call generates the default locale.
 * 2) `translate_site` fills the other locales from the localizable slice.
 * 3) Assembly merges + re-syncs media refs; `siteSchema.parse` is the final gate.
 * Each tool call gets at most ONE schema-repair round-trip.
 */

const MEDIA_KEYS = new Set(['url', 'imageUrl', 'photoUrl', 'href']);

const PLACEHOLDER_IMAGES = `Available placeholder images (use ONLY these paths, matching the chosen preset):
- law: /seed/law/hero.svg, /seed/law/office.svg, /seed/law/elif.svg, /seed/law/mert.svg
- psych: /seed/psych/portrait.svg
- dental: /seed/dental/hero.svg, /seed/dental/praxis.svg, /seed/dental/g1.svg, /seed/dental/g2.svg, /seed/dental/g3.svg`;

const GENERATE_SYSTEM = `You write complete small-business websites for saaskaya, a website-as-a-service.
You NEVER write HTML or CSS — you only fill the create_site tool's JSON schema.

Rules:
- Write all copy in ONE language: the language of the user's self-description. Set defaultLocale accordingly (tr, en or de).
- Pick the niche preset that fits best (law, psych or dental) and a matching professional theme (colors as hex).
- Structure: one "home" page with 5–8 sections in a sensible order (hero first, footer last; usually about, services, faq and contact in between). A second page only if the description clearly needs it — every page must appear in nav.
- Copy must be concrete and grounded in the description — real service names, real tone, no lorem ipsum, no invented certifications or medical/legal claims.
- contact section: if no email is given, use info@<business-name>.example. Include phone/address only if provided.
- ${PLACEHOLDER_IMAGES}
- Omit images entirely (no gallery, background "plain" or "gradient") if none of the placeholders fit.
- Section ids: kebab-case, unique, like "hero-1", "services-1".`;

const TRANSLATE_SYSTEM = `You are a professional website translator.
Re-emit the given payload once per requested target language via the translate_site tool.
- Translate ONLY human-readable text. Keep the structure, order, ids, types, slugs, URLs, email addresses, phone numbers and brand/person names EXACTLY as given.
- Keep item counts identical — never add, drop or reorder anything.
- Match the tone of the source; use natural, idiomatic phrasing.`;

export class StructureMismatchError extends Error {}

type Deps = { run: RunToolCall };

async function callWithRepair<S extends z.ZodType>(
	deps: Deps,
	req: {
		system: string;
		userText: string;
		tool: { name: string; description: string; schema: S };
		maxTokens?: number;
	}
): Promise<{ data: z.infer<S>; usage: TokenUsage }> {
	const tool = {
		name: req.tool.name,
		description: req.tool.description,
		inputSchema: toInputSchema(req.tool.schema)
	};
	const messages: Anthropic.MessageParam[] = [{ role: 'user', content: req.userText }];

	const first = await deps.run({
		system: req.system,
		messages,
		tool,
		maxTokens: req.maxTokens,
		tier: 'light'
	});
	let usage = first.usage;
	const parsed = req.tool.schema.safeParse(first.input);
	if (parsed.success) return { data: parsed.data, usage };

	// One repair round-trip (constitution §2): send the validation issues back.
	messages.push(
		{ role: 'assistant', content: first.assistantContent },
		{
			role: 'user',
			content: [
				{
					type: 'tool_result',
					tool_use_id: first.toolUseId,
					is_error: true,
					content: `The JSON failed schema validation:\n${JSON.stringify(parsed.error.issues.slice(0, 20), null, 2)}\nCall ${req.tool.name} again with complete, corrected JSON. Fix every issue; change nothing else.`
				}
			]
		}
	);
	const second = await deps.run({
		system: req.system,
		messages,
		tool,
		maxTokens: req.maxTokens,
		tier: 'light'
	});
	usage = addUsage(usage, second.usage);
	const repaired = req.tool.schema.safeParse(second.input);
	if (repaired.success) return { data: repaired.data, usage };

	throw new AIInvalidOutputError(
		'The AI produced an invalid site even after one repair attempt — please try again.',
		repaired.error.issues
	);
}

/** Recursively copy media/link refs from the default-locale content into a translation. */
export function syncMediaRefs(base: unknown, translated: unknown): unknown {
	if (Array.isArray(base) && Array.isArray(translated)) {
		return translated.map((item, i) => (i < base.length ? syncMediaRefs(base[i], item) : item));
	}
	if (base && translated && typeof base === 'object' && typeof translated === 'object') {
		const out: Record<string, unknown> = { ...(translated as Record<string, unknown>) };
		for (const [key, value] of Object.entries(base as Record<string, unknown>)) {
			if (MEDIA_KEYS.has(key)) out[key] = value;
			else if (key in out) out[key] = syncMediaRefs(value, out[key]);
		}
		return out;
	}
	return translated;
}

/** Merge the generated default locale + translations into a full, validated Site. */
export function assembleSite(
	gen: GeneratedSite,
	translations: Partial<Record<Locale, TranslatablePayload>>,
	ids: { id: string; tenantId: string }
): Site {
	const targets = LOCALES.filter((l) => l !== gen.defaultLocale);

	const packFor = (locale: Locale) => {
		const pack = translations[locale];
		if (!pack) throw new StructureMismatchError(`missing translation for "${locale}"`);
		return pack;
	};

	const localizeText = (
		genValue: string,
		pick: (pack: TranslatablePayload) => string | undefined
	) => {
		const record = { tr: genValue, en: genValue, de: genValue };
		for (const locale of targets) {
			const value = pick(packFor(locale));
			if (!value) throw new StructureMismatchError('translation is missing a text value');
			record[locale] = value;
		}
		return record;
	};

	const pages = gen.pages.map((page) => ({
		slug: page.slug,
		title: localizeText(page.title, (p) => p.pages.find((x) => x.slug === page.slug)?.title),
		sections: page.sections.map((section) => {
			const content = { tr: section.content, en: section.content, de: section.content } as Record<
				Locale,
				unknown
			>;
			for (const locale of targets) {
				const tPage = packFor(locale).pages.find((x) => x.slug === page.slug);
				const tSection = tPage?.sections.find((s) => s.id === section.id);
				if (!tSection || tSection.type !== section.type) {
					throw new StructureMismatchError(
						`translation for "${locale}" lost section "${section.id}"`
					);
				}
				content[locale] = syncMediaRefs(section.content, tSection.content);
			}
			return { id: section.id, type: section.type, props: section.props, content };
		})
	}));

	const nav = {
		items: gen.nav.map((item) => ({
			pageSlug: item.pageSlug,
			label: localizeText(
				item.label,
				(p) => p.navLabels.find((n) => n.pageSlug === item.pageSlug)?.label
			)
		}))
	};

	const seo = gen.settings.seoDescription
		? { description: localizeText(gen.settings.seoDescription, (p) => p.seoDescription) }
		: undefined;

	// The final gate: nothing invalid ever reaches the DB or the renderer.
	return siteSchema.parse({
		id: ids.id,
		tenantId: ids.tenantId,
		defaultLocale: gen.defaultLocale,
		locales: [...LOCALES],
		theme: gen.theme,
		nav,
		pages,
		settings: {
			siteName: gen.settings.siteName,
			...(gen.settings.contactEmail ? { contactEmail: gen.settings.contactEmail } : {}),
			poweredByBadge: true,
			...(seo ? { seo } : {})
		}
	});
}

export async function generateSite(
	input: { description: string; id: string; tenantId: string },
	deps: Deps = { run: runToolCall }
): Promise<{ site: Site; usage: TokenUsage }> {
	// Step 1 — generate the default locale.
	const gen = await callWithRepair(deps, {
		system: GENERATE_SYSTEM,
		userText: `Self-description from the user:\n\n${input.description}`,
		tool: {
			name: 'create_site',
			description: 'Create the complete website (single language) for this self-description.',
			schema: generatedSiteSchema
		},
		maxTokens: 16000
	});
	let usage = gen.usage;

	// Step 2 — translate the localizable slice into the remaining locales.
	const targets = LOCALES.filter((l) => l !== gen.data.defaultLocale);
	const payload = extractTranslatable(gen.data);
	const translated = await callWithRepair(deps, {
		system: TRANSLATE_SYSTEM,
		userText: `Source language: ${gen.data.defaultLocale}. Target languages: ${targets.join(', ')}.\n\nPayload:\n${JSON.stringify(payload, null, 2)}`,
		tool: {
			name: 'translate_site',
			description: 'Return the payload translated once per target language.',
			schema: translationSchemaFor(targets)
		},
		maxTokens: 32000
	});
	usage = addUsage(usage, translated.usage);

	// Step 3 — merge and validate. A structure mismatch is an invalid output, not a crash.
	try {
		const site = assembleSite(gen.data, translated.data, {
			id: input.id,
			tenantId: input.tenantId
		});
		return { site, usage };
	} catch (error) {
		if (error instanceof StructureMismatchError) {
			throw new AIInvalidOutputError(
				`The AI translation did not match the site structure (${error.message}) — please try again.`
			);
		}
		throw error;
	}
}
