import { randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { siteChatMessages } from '$lib/server/db/schema';
import { visibleQuestions, type OnboardingAnswers, type Question } from '$lib/onboarding/questions';

/**
 * The editor's persistent AI chat transcript, per site. Seeded once from the /new
 * onboarding answers (`seedChatFromOnboarding`) so the editor conversation visibly
 * continues from where the guided Q&A left off; every later turn is appended by
 * `/api/sites/[siteId]/chat`.
 */

export type ChatRole = 'user' | 'assistant';
export type ChatMessageRow = {
	id: string;
	siteId: string;
	role: ChatRole;
	kind: string | null;
	body: string;
	createdAt: Date;
};

export function appendChatMessage(input: {
	siteId: string;
	role: ChatRole;
	kind?: string | null;
	body: string;
}): void {
	db.insert(siteChatMessages)
		.values({
			id: randomUUID(),
			siteId: input.siteId,
			role: input.role,
			kind: input.kind ?? null,
			body: input.body,
			createdAt: new Date()
		})
		.run();
}

export function listChatMessages(siteId: string, limit = 200): ChatMessageRow[] {
	return db
		.select()
		.from(siteChatMessages)
		.where(eq(siteChatMessages.siteId, siteId))
		.orderBy(asc(siteChatMessages.createdAt))
		.limit(limit)
		.all() as ChatMessageRow[];
}

export function deleteChatMessages(siteId: string): void {
	db.delete(siteChatMessages).where(eq(siteChatMessages.siteId, siteId)).run();
}

/** Mirrors /new's client-side `formatAnswer`; returns null for empty/skipped answers
 *  so the seeded transcript only replays what the user actually said. */
function formatAnswerForSeed(q: Question, value: unknown): string | null {
	if (q.kind === 'choice') {
		if (value == null || value === '') return null;
		return q.options?.find((o) => o.value === value)?.label ?? String(value);
	}
	if (q.kind === 'multi_choice') {
		const values = Array.isArray(value) ? value : [];
		if (values.length === 0) return null;
		return values.map((v) => q.options?.find((o) => o.value === v)?.label ?? String(v)).join(', ');
	}
	if (q.kind === 'list_text') {
		const values = Array.isArray(value) ? value : [];
		if (values.length === 0) return null;
		return values.join(', ');
	}
	const text = String(value ?? '').trim();
	return text || null;
}

export function seedChatFromOnboarding(siteId: string, answers: OnboardingAnswers): void {
	const pairs = visibleQuestions(answers)
		.map((q) => ({ q, text: formatAnswerForSeed(q, answers[q.id]) }))
		.filter((entry): entry is { q: Question; text: string } => entry.text !== null);
	if (pairs.length === 0) return;

	for (const { q, text } of pairs) {
		appendChatMessage({ siteId, role: 'assistant', kind: 'onboarding_seed', body: q.prompt });
		appendChatMessage({ siteId, role: 'user', kind: 'onboarding_seed', body: text });
	}
	appendChatMessage({
		siteId,
		role: 'assistant',
		kind: 'onboarding_seed',
		body: 'Siten bu cevaplardan üretildi — buradan düzenlemeye devam edebiliriz. Ne değiştirmek istersin?'
	});
}
