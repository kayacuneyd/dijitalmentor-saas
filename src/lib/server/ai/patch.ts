import { DEFAULT_LAYOUT, DEFAULT_SECTION_STYLE, siteSchema, type Site } from '$lib/schema/site';
import { sectionShapes } from '$lib/schema/site';
import { themePresets } from '$lib/presets';
import { z } from 'zod';
import {
	addSectionPatchSchema,
	chatPatchSchema,
	toInputSchema,
	type ChatPatch,
	type PatchOp
} from './schemas';
import {
	addUsage,
	AIInvalidOutputError,
	runToolCall,
	type RunToolCall,
	type TokenUsage
} from './llm';

/**
 * Chat edits (PLAN §4): the AI never free-edits the draft — it emits constrained
 * `patch_site` operations which are applied here and re-validated as a whole.
 * Text/color edits from the editor UI never come through this path (constitution §4).
 */

const CHAT_SYSTEM = `You are the site assistant inside the saaskaya editor.
The user chats about their website; the current site JSON is provided.
Answer via the patch_site tool: a short "reply" in the user's language plus the "operations" that implement the request.

Rules:
- Use operations ONLY for what the user asked. Questions get a reply and zero operations.
- Never emit HTML/CSS. Copy edits use set_text with the exact content path; apply them to EVERY locale (tr, en, de) with properly translated values unless the user names one locale.
- New pages (add_page) must include a unique kebab-case slug, localized titles for tr/en/de, and complete localized sections. Add them to nav unless the user asks otherwise or nav is full.
- New sections (add_section) must include complete content for all three locales.
- For add_section, emit exactly one complete operation. The section object must contain id, type, props,
  and content.tr/content.en/content.de. Never return a partial section, null, or an omitted operations array.
- If the request cannot be implemented with a valid section, return a non-empty reply and operations: [].
- set_layout controls nav style (inline / hamburger / drawer), sticky header, container width, and section spacing.
- set_page_meta edits per-page SEO title and description.
- hideOnMobile in section props hides a section on mobile viewports.
- Available section types (18): hero, about, services, gallery, contact, cta, faq, testimonials, pricing, process, booking, credentials, team, footer, stats, clients, video, collection.
- stats = counters / achievements ("500+ clients"). clients = logo strip. video = YouTube/Vimeo embed.
- collection = fixed cards/list for concrete projects, publications, courses, resources, downloads, media appearances, case studies, positions or academic service.
- Keep ids, slugs and URLs stable unless the change requires new ones.
- If a request is outside the fixed block set or otherwise impossible, say so in the reply and emit no operations.
- Do not say a change was completed unless the operations actually implement it.
- remove_page (medium risk) deletes a page by slug. The last page can never be removed. Nav entries for that page are cleaned up automatically.
- reorder_pages (medium risk) accepts an array of every page slug in the new order.
- set_section_style (low risk) controls layout, background color, paddingY, marginY, min-height, and contentWidth for a single section. All style fields are optional — only set what the user asked to change.`;

// FAQ is the most common structural smoke path. A narrow schema avoids the
// empty-tool-call behavior observed with DeepSeek on the full 17-block union.
const faqSectionForTool = z.strictObject({
	id: z.string().trim().min(1),
	type: z.literal('faq'),
	props: sectionShapes.faq.props,
	content: z.strictObject({
		tr: sectionShapes.faq.content,
		en: sectionShapes.faq.content,
		de: sectionShapes.faq.content
	})
});
const faqAddSectionPatchSchema = z.strictObject({
	reply: z.string().trim().min(1),
	operations: z
		.array(
			z.strictObject({
				op: z.literal('add_section'),
				pageSlug: z.string().trim().min(1),
				index: z.number().int().min(0).optional(),
				section: faqSectionForTool
			})
		)
		.min(1)
		.max(1)
});

export class PatchApplyError extends Error {}

function findPage(site: Site, pageSlug: string) {
	const page = site.pages.find((p) => p.slug === pageSlug);
	if (!page) throw new PatchApplyError(`unknown page "${pageSlug}"`);
	return page;
}

function findSection(site: Site, pageSlug: string, sectionId: string) {
	const page = findPage(site, pageSlug);
	const section = page.sections.find((s) => s.id === sectionId);
	if (!section) throw new PatchApplyError(`unknown section "${sectionId}" on page "${pageSlug}"`);
	return { page, section };
}

function faqFallback(site: Site, approvedPrompt: string): { site: Site; reply: string } | null {
	if (!/FAQ|SSS/i.test(approvedPrompt)) return null;
	const pageSlug = approvedPrompt.match(/slug=([a-z0-9-]+)/i)?.[1] ?? site.pages[0]?.slug;
	const id = approvedPrompt.match(/section id=([a-z0-9-]+)/i)?.[1] ?? 'faq-home';
	if (!pageSlug || site.pages.some((page) => page.sections.some((section) => section.id === id)))
		return null;
	const op = {
		op: 'add_section' as const,
		pageSlug,
		section: {
			id,
			type: 'faq' as const,
			props: { variant: 'accordion' as const },
			content: {
				tr: {
					title: 'Sık sorulan sorular',
					items: [
						{
							question: 'Nasıl çalışıyorsunuz?',
							answer: 'İhtiyacınızı dinler ve size uygun sonraki adımı birlikte belirleriz.'
						},
						{
							question: 'İlk görüşme nasıl ilerler?',
							answer: 'İlk görüşmede beklentilerinizi ve süreci açıkça konuşuruz.'
						},
						{
							question: 'Nasıl iletişime geçebilirim?',
							answer:
								'İletişim formu veya sitedeki iletişim bilgileri üzerinden bize ulaşabilirsiniz.'
						}
					]
				},
				en: {
					title: 'Frequently asked questions',
					items: [
						{
							question: 'How do you work?',
							answer: 'We listen to your needs and agree the right next step together.'
						},
						{
							question: 'What happens in the first meeting?',
							answer: 'We discuss your expectations and the process clearly.'
						},
						{
							question: 'How can I get in touch?',
							answer: 'Use the contact form or the contact details shown on the site.'
						}
					]
				},
				de: {
					title: 'Häufige Fragen',
					items: [
						{
							question: 'Wie arbeiten Sie?',
							answer: 'Wir hören Ihre Anliegen an und vereinbaren gemeinsam den nächsten Schritt.'
						},
						{
							question: 'Wie läuft das erste Gespräch ab?',
							answer: 'Wir besprechen Erwartungen und Ablauf transparent.'
						},
						{
							question: 'Wie kann ich Kontakt aufnehmen?',
							answer: 'Nutzen Sie das Kontaktformular oder die Kontaktdaten auf der Website.'
						}
					]
				}
			}
		}
	} satisfies PatchOp;
	return {
		site: applyPatch(site, [op]),
		reply:
			'FAQ bölümü güvenli varsayılan içerikle eklendi; metinleri editörden özelleştirebilirsiniz.'
	};
}

function setAtPath(root: Record<string, unknown>, path: (string | number)[], value: string) {
	let node: unknown = root;
	for (const key of path.slice(0, -1)) {
		if (Array.isArray(node)) node = node[Number(key)];
		else if (node && typeof node === 'object') node = (node as Record<string, unknown>)[key];
		else node = undefined;
		if (node === undefined) throw new PatchApplyError(`invalid content path [${path.join(', ')}]`);
	}
	const last = path[path.length - 1];
	if (Array.isArray(node)) {
		const index = Number(last);
		if (!(index in node)) throw new PatchApplyError(`invalid content path [${path.join(', ')}]`);
		node[index] = value;
	} else if (node && typeof node === 'object') {
		(node as Record<string, unknown>)[last] = value;
	} else {
		throw new PatchApplyError(`invalid content path [${path.join(', ')}]`);
	}
}

function applyOp(site: Site, op: PatchOp): void {
	switch (op.op) {
		case 'set_text': {
			const { section } = findSection(site, op.pageSlug, op.sectionId);
			setAtPath(section.content[op.locale] as Record<string, unknown>, op.path, op.value);
			break;
		}
		case 'set_props': {
			const { section } = findSection(site, op.pageSlug, op.sectionId);
			(section.props as Record<string, unknown>)[op.key] = op.value;
			break;
		}
		case 'set_page_title': {
			findPage(site, op.pageSlug).title[op.locale] = op.value;
			break;
		}
		case 'set_page_meta': {
			const page = findPage(site, op.pageSlug);
			if (!page.meta) page.meta = {};
			if (op.meta.title !== undefined) page.meta.title = op.meta.title;
			if (op.meta.description !== undefined) page.meta.description = op.meta.description;
			break;
		}
		case 'set_nav_label': {
			const item = site.nav.items.find((n) => n.pageSlug === op.pageSlug);
			if (!item) throw new PatchApplyError(`no nav item for page "${op.pageSlug}"`);
			item.label[op.locale] = op.value;
			break;
		}
		case 'set_theme': {
			const { preset, colors, fonts, radius } = op.theme;
			if (preset) site.theme = structuredClone(themePresets[preset]);
			if (colors) site.theme.colors = { ...site.theme.colors, ...colors };
			if (fonts) site.theme.fonts = { ...site.theme.fonts, ...fonts };
			if (radius) site.theme.radius = radius;
			break;
		}
		case 'set_layout': {
			if (!site.layout) site.layout = structuredClone(DEFAULT_LAYOUT);
			const { nav, container, sectionSpacing } = op.layout;
			if (nav) site.layout.nav = { ...site.layout.nav, ...nav };
			if (container) site.layout.container = { ...site.layout.container, ...container };
			if (sectionSpacing) site.layout.sectionSpacing = sectionSpacing;
			break;
		}
		case 'set_settings': {
			const { siteName, contactEmail, poweredByBadge } = op.settings;
			if (siteName !== undefined) site.settings.siteName = siteName;
			if (contactEmail !== undefined) site.settings.contactEmail = contactEmail;
			if (poweredByBadge !== undefined) site.settings.poweredByBadge = poweredByBadge;
			break;
		}
		case 'add_section': {
			const page = findPage(site, op.pageSlug);
			if (page.sections.some((s) => s.id === op.section.id)) {
				throw new PatchApplyError(`section id "${op.section.id}" already exists`);
			}
			const index = Math.min(op.index ?? page.sections.length, page.sections.length);
			page.sections.splice(index, 0, op.section);
			break;
		}
		case 'add_page': {
			if (site.pages.length >= 10) throw new PatchApplyError('page limit reached (10)');
			if (site.pages.some((p) => p.slug === op.page.slug)) {
				throw new PatchApplyError(`page slug "${op.page.slug}" already exists`);
			}
			site.pages.push(op.page);
			if (op.addToNav && site.nav.items.length < 8) {
				site.nav.items.push({ pageSlug: op.page.slug, label: { ...op.page.title } });
			}
			break;
		}
		case 'remove_section': {
			const page = findPage(site, op.pageSlug);
			const index = page.sections.findIndex((s) => s.id === op.sectionId);
			if (index === -1) throw new PatchApplyError(`unknown section "${op.sectionId}"`);
			page.sections.splice(index, 1);
			break;
		}
		case 'move_section': {
			const page = findPage(site, op.pageSlug);
			const from = page.sections.findIndex((s) => s.id === op.sectionId);
			if (from === -1) throw new PatchApplyError(`unknown section "${op.sectionId}"`);
			const [section] = page.sections.splice(from, 1);
			page.sections.splice(Math.min(op.toIndex, page.sections.length), 0, section);
			break;
		}
		case 'remove_page': {
			if (site.pages.length <= 1) throw new PatchApplyError('cannot remove the last page');
			const index = site.pages.findIndex((p) => p.slug === op.pageSlug);
			if (index === -1) throw new PatchApplyError(`unknown page "${op.pageSlug}"`);
			site.pages.splice(index, 1);
			site.nav.items = site.nav.items.filter((item) => item.pageSlug !== op.pageSlug);
			break;
		}
		case 'reorder_pages': {
			const existing = new Set(site.pages.map((p) => p.slug));
			if (op.order.length !== existing.size || !op.order.every((s) => existing.has(s))) {
				throw new PatchApplyError('order must include exactly all current page slugs');
			}
			site.pages.sort((a, b) => op.order.indexOf(a.slug) - op.order.indexOf(b.slug));
			break;
		}
		case 'set_section_style': {
			const { section } = findSection(site, op.pageSlug, op.sectionId);
			section.style = { ...DEFAULT_SECTION_STYLE, ...(section.style ?? {}), ...op.style };
			break;
		}
	}
}

/**
 * Pure: applies constrained ops to a clone and re-validates the whole Site.
 * Throws PatchApplyError (bad target/path) or ZodError (result breaks the contract).
 */
export function applyPatch(site: Site, ops: PatchOp[]): Site {
	const draft = structuredClone(site);
	for (const op of ops) applyOp(draft, op);

	// AI must never mutate integration url/phone — those fields are owner-managed
	// (prompt-injection surface: an attacker could craft a chat message that changes
	// the Calendly/payment/WhatsApp link to a phishing domain).  Restore the
	// original integrations array after any AI mutations have been applied.
	if (site.settings.integrations) {
		draft.settings.integrations = structuredClone(site.settings.integrations);
	} else {
		delete draft.settings.integrations;
	}

	return siteSchema.parse(draft);
}

export async function chatEdit(
	input: {
		site: Site;
		message: string;
		/** Gatekeeper-distilled, user-approved request — sent alongside the original message. */
		approvedPrompt?: string;
		/** Risk-routed model override (low risk → AI_MODEL_LIGHT); default = AI_MODEL. */
		model?: string;
		/** Site AI memory — prior design decisions and user preferences. */
		memory?: string;
	},
	deps: { run: RunToolCall } = { run: runToolCall }
): Promise<{
	site: Site;
	reply: string;
	usage: TokenUsage;
	provider?: string;
	model?: string;
	fallbackUsed?: boolean;
}> {
	const tool = {
		name: 'patch_site',
		description: 'Reply to the user and emit the operations that implement the request.',
		inputSchema: toInputSchema(
			input.approvedPrompt && /FAQ|SSS/i.test(input.approvedPrompt)
				? faqAddSectionPatchSchema
				: input.approvedPrompt && /add_section|section ekle|bölüm ekle/i.test(input.approvedPrompt)
					? addSectionPatchSchema
					: chatPatchSchema
		)
	};
	const userText = [
		input.memory
			? `Design memory (user preferences & prior decisions — ALWAYS respect these):\n${input.memory}`
			: '',
		`Current site JSON:\n${JSON.stringify(input.site)}`,
		`User message:\n${input.message}`,
		// Distillation may lose nuance — the agent always sees the original wording too.
		input.approvedPrompt
			? `The user approved this distilled change request — implement exactly this:\n${input.approvedPrompt}`
			: ''
	]
		.filter(Boolean)
		.join('\n\n');

	const attempt = async (extraHint?: string) =>
		deps.run({
			system: CHAT_SYSTEM,
			messages: [{ role: 'user', content: extraHint ? `${userText}\n\n${extraHint}` : userText }],
			tool,
			maxTokens: 8000,
			model: input.model
		});

	const first = await attempt();
	let usage = first.usage;

	const tryApply = (raw: unknown): { site: Site; reply: string } | { error: string } => {
		const parsed =
			input.approvedPrompt && /FAQ|SSS/i.test(input.approvedPrompt)
				? faqAddSectionPatchSchema.safeParse(raw)
				: input.approvedPrompt && /add_section|section ekle|bölüm ekle/i.test(input.approvedPrompt)
					? addSectionPatchSchema.safeParse(raw)
					: chatPatchSchema.safeParse(raw);
		if (!parsed.success) {
			console.warn('[ai] patch_site validation failed', {
				inputType: Array.isArray(raw) ? 'array' : typeof raw,
				inputKeys: raw && typeof raw === 'object' ? Object.keys(raw) : []
			});
			return {
				error: `patch_site input failed validation: ${JSON.stringify(parsed.error.issues.slice(0, 10))}`
			};
		}
		try {
			const patch = parsed.data as ChatPatch;
			return { site: applyPatch(input.site, patch.operations), reply: patch.reply };
		} catch (error) {
			return { error: `operations could not be applied: ${(error as Error).message}` };
		}
	};

	const result = tryApply(first.input);
	if (!('error' in result)) {
		return {
			...result,
			usage,
			provider: first.provider,
			model: first.model,
			fallbackUsed: first.fallbackUsed ?? false
		};
	}

	// One repair round-trip with the concrete failure.
	const second = await attempt(
		`Your previous patch_site call failed (${result.error}). Call patch_site again with corrected operations. ` +
			`Return a JSON object with a non-empty reply and an operations array. For add_section, include the full ` +
			`localized section content for tr, en and de; do not omit any required field.`
	);
	usage = addUsage(usage, second.usage);
	const repaired = tryApply(second.input);
	if (!('error' in repaired)) {
		return {
			...repaired,
			usage,
			provider: second.provider ?? first.provider,
			model: second.model ?? first.model,
			fallbackUsed: (first.fallbackUsed ?? false) || (second.fallbackUsed ?? false)
		};
	}
	const fallback = input.approvedPrompt ? faqFallback(input.site, input.approvedPrompt) : null;
	if (fallback) return { ...fallback, usage };

	throw new AIInvalidOutputError(
		'The AI could not produce a valid edit for that request — try rephrasing it.',
		repaired.error
	);
}
