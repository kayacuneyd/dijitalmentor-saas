import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { siteAiMemory } from '$lib/server/db/schema';
import { visibleQuestions, type OnboardingAnswers, type Question } from '$lib/onboarding/questions';
import type { Site } from '$lib/schema/site';

/**
 * Per-site AI memory — a single Markdown document the AI reads before every chat
 * turn and appends notes to after successful edits. Keeps the AI consistent across
 * sessions without re-sending the full site JSON each time.
 *
 * Memory is auto-compacted at 10+ lines via the gatekeeper model (cheap summarization)
 * and is owner-readable/editable from the dashboard.
 */

const MAX_LINES = 10;

export type SiteMemory = {
	siteId: string;
	content: string;
	version: number;
	updatedAt: Date;
};

export function getSiteMemory(siteId: string): SiteMemory | null {
	const row = db.select().from(siteAiMemory).where(eq(siteAiMemory.siteId, siteId)).get();
	if (!row) return null;
	return row as SiteMemory;
}

/**
 * Returns the memory content as a prompt-ready string. If the site has no memory
 * yet, returns an empty string — the AI is told to treat this as a fresh start.
 */
export function memoryPrompt(siteId: string): string {
	const memory = getSiteMemory(siteId);
	if (!memory?.content) return '';
	return `## Site memory (design decisions and user preferences the AI must follow)\n\n${memory.content}`;
}

/**
 * Append a note to the memory. If the memory exceeds MAX_LINES, the entire
 * document is replaced with a compacted summary via the gatekeeper model.
 * The note is a single line (Markdown bullet or plain); the caller decides the
 * format — for AI-triggered notes this is a bullet describing what was done.
 */
export async function appendToMemory(
	siteId: string,
	note: string,
	deps: { compactWithAI?: (content: string) => Promise<string> } = {}
): Promise<void> {
	const now = Date.now();
	const existing = getSiteMemory(siteId);
	const timestamp = new Date(now).toISOString().slice(0, 16).replace('T', ' ');

	const line = `- ${timestamp}: ${note}`;
	let content: string;
	let version: number;

	if (existing) {
		const currentLines = existing.content.split('\n').filter((l) => l.trim() !== '');
		const newLines = [...currentLines, line];
		if (newLines.length > MAX_LINES && deps.compactWithAI) {
			// Compact: summarize the old lines + new line into a compact document.
			const toCompact = newLines.join('\n');
			content = await deps.compactWithAI(toCompact);
		} else {
			content = newLines.join('\n');
		}
		version = existing.version + 1;
	} else {
		content = line;
		version = 1;
	}

	db.insert(siteAiMemory)
		.values({
			siteId,
			content,
			version,
			updatedAt: new Date(now)
		})
		.onConflictDoUpdate({
			target: siteAiMemory.siteId,
			set: { content, version, updatedAt: new Date(now) }
		})
		.run();
}

/**
 * Owner-facing update — replaces the entire memory content. Called from the
 * dashboard when the owner manually edits the memory text.
 */
export function updateSiteMemory(siteId: string, content: string): void {
	const existing = getSiteMemory(siteId);
	const version = existing ? existing.version + 1 : 1;
	db.insert(siteAiMemory)
		.values({ siteId, content, version, updatedAt: new Date() })
		.onConflictDoUpdate({
			target: siteAiMemory.siteId,
			set: { content, version, updatedAt: new Date() }
		})
		.run();
}

/** Cascade-delete when a site is removed. */
export function deleteSiteMemory(siteId: string): void {
	db.delete(siteAiMemory).where(eq(siteAiMemory.siteId, siteId)).run();
}

/**
 * Compact a markdown memory document into a shorter summary using the
 * gatekeeper model. The prompt instructs the AI to retain all important
 * design decisions and user preferences while removing redundant or
 * superseded details.
 */
export const COMPACT_SYSTEM = `You are a document summarizer for a website builder AI.
Given a list of change notes for a specific website, produce a compact (≤10 lines)
Markdown summary that a future AI will read to maintain consistency.

Rules:
- Keep all non-obvious user preferences: color choices, layout requests, tone/style,
  font preferences, specific content the user explicitly asked for.
- Remove "the user asked why X" or questions — only keep what WAS DONE.
- Remove redundant entries: if the user first asked for red then changed to blue,
  keep only the final state (blue).
- Group related changes on one line (e.g. "colors adjusted, fonts updated").
- Write in the same language as the original notes (Turkish or English).
- Output ONLY the compacted Markdown — no preamble, no explanation.`;

/** Used only in tests; the real chat endpoint provides its own LLM call. */
export async function compactMemory(content: string): Promise<string> {
	// In production, this is called with a real AI provider. The memory module
	// itself does not import llm.ts to avoid a circular dependency — the chat
	// endpoint passes `compactWithAI` as a dependency.
	return content;
}

/**
 * Create the initial site memory from onboarding Q&A answers. Only captures
 * text-based answers that carry design intent (profession, niche, audience,
 * services, tone, description) — choice answers like contact method are
 * skipped since they're already encoded in the Site schema.
 */
export function seedMemoryFromOnboarding(
	siteId: string,
	answers: OnboardingAnswers,
	site: Site
): void {
	const keysToCapture = new Set([
		'profession',
		'otherProfession',
		'niche',
		'audience',
		'services',
		'tone',
		'description',
		'businessName'
	]);

	const pairs = visibleQuestions(answers)
		.filter((q) => keysToCapture.has(q.id))
		.map((q): string | null => {
			const value = answers[q.id];
			if (value == null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) return null;
			return `**${q.prompt}** ${formatOnboardingValue(q, value)}`;
		})
		.filter(Boolean) as string[];

	if (pairs.length === 0) return;

	const header = [
		`Site "${site.settings.siteName}" — ${site.defaultLocale.toUpperCase()} default, locales ${site.locales.join(', ')}`,
		`Generated: ${new Date().toISOString().slice(0, 10)}`,
		'',
		'## Onboarding answers',
		...pairs,
		'',
		'## Changes',
	].join('\n');

	const now = Date.now();
	db.insert(siteAiMemory)
		.values({ siteId, content: header, version: 1, updatedAt: new Date(now) })
		.run();
}

function formatOnboardingValue(q: Question, value: unknown): string {
	if (q.kind === 'choice' && typeof value === 'string') {
		return q.options?.find((o) => o.value === value)?.label ?? value;
	}
	if (q.kind === 'multi_choice' && Array.isArray(value)) {
		return value.map((v) => q.options?.find((o) => o.value === v)?.label ?? String(v)).join(', ');
	}
	if (q.kind === 'list_text' && Array.isArray(value)) {
		return value.join(', ');
	}
	return String(value);
}