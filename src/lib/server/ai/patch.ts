import { siteSchema, type Site } from '$lib/schema/site';
import { themePresets } from '$lib/presets';
import { chatPatchSchema, toInputSchema, type ChatPatch, type PatchOp } from './schemas';
import { AIInvalidOutputError, runToolCall, type RunToolCall, type TokenUsage } from './llm';

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
- Keep ids, slugs and URLs stable unless the change requires new ones.
- If a request is outside the fixed block set or otherwise impossible, say so in the reply and emit no operations.
- Do not say a change was completed unless the operations actually implement it.`;

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
): Promise<{ site: Site; reply: string; usage: TokenUsage }> {
	const tool = {
		name: 'patch_site',
		description: 'Reply to the user and emit the operations that implement the request.',
		inputSchema: toInputSchema(chatPatchSchema)
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
		const parsed = chatPatchSchema.safeParse(raw);
		if (!parsed.success) {
			return {
				error: `patch_site input failed validation: ${JSON.stringify(parsed.error.issues.slice(0, 10))}`
			};
		}
		try {
			const patch: ChatPatch = parsed.data;
			return { site: applyPatch(input.site, patch.operations), reply: patch.reply };
		} catch (error) {
			return { error: `operations could not be applied: ${(error as Error).message}` };
		}
	};

	const result = tryApply(first.input);
	if (!('error' in result)) return { ...result, usage };

	// One repair round-trip with the concrete failure.
	const second = await attempt(
		`Your previous patch_site call failed (${result.error}). Call patch_site again with corrected operations.`
	);
	usage = {
		inputTokens: usage.inputTokens + second.usage.inputTokens,
		outputTokens: usage.outputTokens + second.usage.outputTokens
	};
	const repaired = tryApply(second.input);
	if (!('error' in repaired)) return { ...repaired, usage };

	throw new AIInvalidOutputError(
		'The AI could not produce a valid edit for that request — try rephrasing it.',
		repaired.error
	);
}
