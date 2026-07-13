import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { classifyOnboardingAnswer } from '$lib/server/ai/onboardingGuard';
import { AIInvalidOutputError, AIUnavailableError } from '$lib/server/ai/llm';
import { rateLimit } from '$lib/server/auth';
import { recordError } from '$lib/server/error-log';
import { localizeQuestion } from '$lib/i18n/onboarding';
import { nextQuestion, questionById, type Question } from '$lib/onboarding/questions';
import {
	PENDING_COOKIE,
	createOrGetPending,
	markCompleted,
	savePendingAnswer
} from '$lib/server/onboarding/session';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	questionId: z.string().trim().min(1),
	value: z.unknown(),
	source: z.string().trim().max(120).optional()
});

/**
 * The free-text escape hatch ("kendi cümlelerimle anlatmak istiyorum") is not part
 * of the fixed sequential script — it's a standalone alternate submission that
 * reuses this same endpoint's pending/cookie/rate-limit plumbing, so it also
 * benefits from the deferred-auth handoff. Deliberately unguarded, matching the
 * unguarded behavior the current free-text `/new` flow already ships.
 */
const RAW_DESCRIPTION_QUESTION = {
	id: 'rawDescription',
	kind: 'open_text' as const,
	prompt: 'Kendi cümlelerinle anlat.',
	required: false,
	guarded: false,
	schema: z.string().trim().min(30).max(4000)
};

/**
 * A misclassifying guard must never trap a visitor on the same question forever: after
 * this many consecutive rejections for one question in one session, stop calling the
 * guard and accept the answer as-is — same fail-open philosophy as an unavailable guard.
 */
const MAX_GUARD_REJECTIONS = 3;

/** Joins a validated answer value into guard-classifiable text, or null if there's nothing to guard. */
function guardableText(value: unknown): string | null {
	if (typeof value === 'string') return value.trim() || null;
	if (Array.isArray(value)) {
		const joined = value
			.map((item) => String(item).trim())
			.filter(Boolean)
			.join(', ');
		return joined || null;
	}
	return null;
}

function validationError(issue: z.core.$ZodIssue | undefined) {
	if (!issue) return { code: 'validation_invalid', message: 'Invalid answer.' };
	if (issue.code === 'too_big') {
		const maximum = 'maximum' in issue ? issue.maximum : undefined;
		return {
			code: 'validation_too_long',
			message:
				typeof maximum === 'number'
					? `This answer can be at most ${maximum} characters.`
					: 'This answer is too long.'
		};
	}
	if (issue.code === 'too_small') {
		return { code: 'validation_required', message: 'This answer is required.' };
	}
	if (issue.code === 'invalid_format') {
		return { code: 'validation_format', message: issue.message || 'Invalid format.' };
	}
	return { code: 'validation_invalid', message: issue.message || 'Invalid answer.' };
}

/**
 * Guided onboarding Q&A (anonymous-reachable): validates one answer against its
 * question's own schema, runs the Groq on-topic guard for `guarded` questions, and
 * upserts the answer into the pending record. The guard fails OPEN — an unavailable
 * or unrepairable classifier never blocks this fixed, required step; rate limiting
 * is the abuse backstop instead.
 */
export const POST: RequestHandler = async ({ request, cookies, getClientAddress, locals }) => {
	const ip = getClientAddress();
	if (!rateLimit(`onboarding-answer:${ip}`, 60, 60_000)) {
		return json(
			{ ok: false, message: 'Too many requests — wait a moment and try again.' },
			{ status: 429 }
		);
	}

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return json({ ok: false, message: 'Body must be JSON' }, { status: 400 });
	}
	const body = bodySchema.safeParse(raw);
	if (!body.success) {
		return json({ ok: false, message: body.error.issues[0].message }, { status: 400 });
	}

	const question =
		body.data.questionId === RAW_DESCRIPTION_QUESTION.id
			? RAW_DESCRIPTION_QUESTION
			: questionById(body.data.questionId);
	if (!question) {
		return json({ ok: false, message: 'Unknown question.' }, { status: 400 });
	}

	const parsedValue = question.schema.safeParse(body.data.value);
	if (!parsedValue.success) {
		const err = validationError(parsedValue.error.issues[0]);
		return json(
			{ ok: false, code: err.code, message: err.message },
			{ status: 400 }
		);
	}

	// Only a brand-new pending session is throttled here — resuming an existing one
	// (the common "refresh the page" case) never counts against this bucket.
	const isNewSession = !cookies.get(PENDING_COOKIE);
	if (isNewSession && !rateLimit(`onboarding-start:${ip}`, 10, 60 * 60_000)) {
		return json(
			{ ok: false, message: 'Too many onboarding sessions from this address.' },
			{ status: 429 }
		);
	}

	const guardText = question.guarded ? guardableText(parsedValue.data) : null;
	if (guardText) {
		if (!rateLimit(`onboarding-guard:${ip}`, 20, 60_000)) {
			return json(
				{ ok: false, message: 'Too many requests — wait a moment and try again.' },
				{ status: 429 }
			);
		}
		try {
			const localizedPrompt = localizeQuestion(question as Question, locals.locale).prompt;
			const { result } = await classifyOnboardingAnswer({
				questionPrompt: localizedPrompt,
				answer: guardText,
				locale: locals.locale
			});
			if (!result.onTopic) {
				const sessionKey = cookies.get(PENDING_COOKIE) ?? ip;
				const withinCap = rateLimit(
					`onboarding-guard-reject:${sessionKey}:${question.id}`,
					MAX_GUARD_REJECTIONS - 1,
					30 * 60_000
				);
				if (withinCap) {
					return json({ ok: false, kind: 'off_topic', message: result.reply }, { status: 400 });
				}
				recordError(new Error('Onboarding guard rejection cap exceeded — answer auto-accepted'), {
					source: 'onboarding-guard',
					route: '/api/onboarding/answer',
					method: 'POST'
				});
			}
		} catch (err) {
			// Fail open: the fixed onboarding backbone must never depend on Groq
			// uptime. Rate limiting above is the abuse backstop during an outage.
			if (err instanceof AIUnavailableError || err instanceof AIInvalidOutputError) {
				recordError(err, {
					source: 'onboarding-guard',
					route: '/api/onboarding/answer',
					method: 'POST'
				});
			} else {
				throw err;
			}
		}
	}

	createOrGetPending(cookies);
	const updated = savePendingAnswer(cookies, question.id, parsedValue.data, body.data.source);
	// The escape hatch is a standalone complete submission, independent of the
	// fixed script's own sequencing.
	const isRawEscapeHatch = question.id === RAW_DESCRIPTION_QUESTION.id;
	const next = isRawEscapeHatch ? undefined : nextQuestion(updated.answers);
	if (isRawEscapeHatch || !next) markCompleted(updated.id);

	return json({ ok: true, nextQuestionId: next?.id ?? null, done: isRawEscapeHatch || !next });
};
