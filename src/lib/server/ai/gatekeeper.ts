import type { Site } from '$lib/schema/site';
import { getSetting } from '$lib/server/config';
import { gateObjectSchema, gateSchema, toInputSchema, type GateResult } from './schemas';
import {
	AIInvalidOutputError,
	DEFAULT_DEEPSEEK_LIGHT_MODEL,
	addUsage,
	configuredGatekeeperProvider,
	configuredModel,
	runToolCall,
	type RunToolCall,
	type TokenUsage
} from './llm';

/**
 * Layer 1 gatekeeper (spec 2026-07-08, revised): a cheap forced tool call that
 * classifies intent, distills edit requests and rates their risk BEFORE the
 * expensive patch agent runs. It only ever produces display/routing data —
 * site mutations stay behind the Layer-2 `patch_site` pipeline, so this layer
 * adds no new safety surface (constitution §2 untouched: still Claude tool-use).
 */

export const DEFAULT_GATEKEEPER_MODEL = DEFAULT_DEEPSEEK_LIGHT_MODEL;

export type ChatTurn = { role: 'user' | 'assistant'; text: string };

/** Compact structure summary — the gate never needs (or gets) the full site JSON. */
export function siteOutline(site: Site): string {
	const pages = site.pages
		.map((page) => {
			const title = page.title[site.defaultLocale] ?? Object.values(page.title)[0] ?? '';
			return `- ${page.slug} "${title}": ${page.sections.map((s) => s.type).join(', ')}`;
		})
		.join('\n');
	return [
		`Site "${site.settings.siteName}" — locales: ${site.locales.join(', ')} (default ${site.defaultLocale}), theme preset "${site.theme.preset}".`,
		'Pages and their section types:',
		pages
	].join('\n');
}

const GATE_SYSTEM = `You are the triage gate of the saaskaya website editor chat.
You receive a compact outline of the user's website plus their latest chat message.
You NEVER change the site yourself — you only classify and distill via the gate_message tool.

Classify the message as exactly one intent:
- "edit": the user wants a concrete change to their website. Distill WHAT should change into
  "distilledPrompt" (clear, self-contained instructions in the user's language) and rate the risk:
  low = copy/text tweaks or section style changes (layout, padding, margin, background); medium = theme, colors, fonts, props, nav labels or settings;
  high = adding/removing/moving sections, adding/removing/reordering pages, or broad multi-section redesigns.
  "reply" is a one-line summary of what you understood.
- "question": the user asks something you can answer from the outline or general product knowledge
  (saaskaya builds multilingual sites from a fixed block set; text/color edits are free in the
  editor tabs; publishing is a separate button). Put the full answer in "reply".
- "off_topic": unrelated to their website or saaskaya. "reply" politely redirects and names what
  you CAN help with (colors, copy, sections, pages, theme).
- "help_request": the user asks for a human, has a billing/account complaint, or is stuck beyond
  chat edits. "reply" acknowledges and points to the contact/help option.

Rules:
- Always answer in the user's language (Turkish, English or German).
- When one message contains several concrete changes, keep them ALL in distilledPrompt as a
  numbered list and rate the risk of the riskiest one.
- Never invent pages or sections that are not in the outline.

Examples:
- "başlığı 'Hoş geldiniz' yap" → edit, low, distilledPrompt: "Ana sayfadaki hero başlığını 'Hoş geldiniz' olarak değiştir (tüm dillerde çevirisiyle)."
- "make the whole site warmer and add a pricing FAQ" → edit, high, distilledPrompt: "1. Change the theme colors to a warmer palette. 2. Add an FAQ section about pricing to the home page (all three locales)."
- "sitemde hangi sayfalar var?" → question, reply lists the pages from the outline.
- "bugün dolar kuru kaç?" → off_topic.
- "bir insanla görüşmek istiyorum, faturamda sorun var" → help_request.`;

export async function gateMessage(
	input: { site: Site; message: string; history?: ChatTurn[]; memory?: string },
	deps: { run: RunToolCall } = { run: runToolCall }
): Promise<{
	gate: GateResult;
	usage: TokenUsage;
	provider?: string;
	model?: string;
	fallbackUsed?: boolean;
}> {
	const tool = {
		name: 'gate_message',
		description: 'Classify the user message and, for edits, distill the request and its risk.',
		inputSchema: toInputSchema(gateObjectSchema)
	};
	const history = (input.history ?? [])
		.slice(-6)
		.map((turn) => `${turn.role}: ${turn.text}`)
		.join('\n');
	const userText = [
		input.memory
			? `Design memory (user preferences & prior decisions — ALWAYS respect these):\n${input.memory}`
			: '',
		siteOutline(input.site),
		history ? `Recent conversation:\n${history}` : '',
		`User message:\n${input.message}`
	]
		.filter(Boolean)
		.join('\n\n');

	const attempt = (extraHint?: string) =>
		deps.run({
			system: GATE_SYSTEM,
			messages: [{ role: 'user', content: extraHint ? `${userText}\n\n${extraHint}` : userText }],
			tool,
			maxTokens: 1000,
			provider: configuredGatekeeperProvider(),
			model:
				getSetting('GATEKEEPER_MODEL') || configuredModel(configuredGatekeeperProvider(), 'light')
		});

	const first = await attempt();
	const parsed = gateSchema.safeParse(first.input);
	if (parsed.success) {
		return {
			gate: parsed.data,
			usage: first.usage,
			provider: first.provider,
			model: first.model,
			fallbackUsed: first.fallbackUsed ?? false
		};
	}

	// One repair round-trip with the concrete validation failure (same budget as Layer 2).
	const second = await attempt(
		`Your previous gate_message call failed validation: ${JSON.stringify(parsed.error.issues.slice(0, 5))}. Call gate_message again with corrected input.`
	);
	const repaired = gateSchema.safeParse(second.input);
	if (repaired.success) {
		return {
			gate: repaired.data,
			usage: addUsage(first.usage, second.usage),
			provider: second.provider ?? first.provider,
			model: second.model ?? first.model,
			fallbackUsed: (first.fallbackUsed ?? false) || (second.fallbackUsed ?? false)
		};
	}
	throw new AIInvalidOutputError('The gatekeeper produced invalid output.', repaired.error.issues);
}
