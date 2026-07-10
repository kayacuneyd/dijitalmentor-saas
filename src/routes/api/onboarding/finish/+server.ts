import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { psychKitBySlug, type PsychKitSlug } from '$lib/kits';
import { nextQuestion } from '$lib/onboarding/questions';
import {
	isUnsupportedNicheAnswer,
	manualReviewMessage,
	needsManualReview
} from '$lib/onboarding/support';
import { composeDescription } from '$lib/server/onboarding/compose';
import {
	PENDING_COOKIE,
	consumePending,
	getPendingByToken,
	linkPendingToUser
} from '$lib/server/onboarding/session';
import { recordOnboardingEvent } from '$lib/server/onboarding/telemetry';
import type { RequestHandler } from './$types';

const bodySchema = z
	.object({
		kitSlug: z.string().trim().min(1).optional()
	})
	.optional();

/**
 * The abuse gate (idea.md §6.1) lives here now, not at `/new`'s page load: this is
 * the moment actual AI generation is about to be spent. Composes the collected
 * answers into a `description` string and returns it — the client still POSTs that
 * to the UNCHANGED `/api/sites` itself, exactly as the plain-textarea flow does today.
 */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	if (!locals.user) {
		return json({ ok: false, message: 'Sign in to finish creating your site.' }, { status: 401 });
	}

	let rawBody: unknown = undefined;
	if (request.headers.get('content-type')?.includes('application/json')) {
		try {
			rawBody = await request.json();
		} catch {
			return json({ ok: false, message: 'Body must be JSON' }, { status: 400 });
		}
	}
	const body = bodySchema.safeParse(rawBody);
	if (!body.success) {
		return json({ ok: false, message: body.error.issues[0].message }, { status: 400 });
	}
	const kitSlug = body.data?.kitSlug;
	if (kitSlug && !psychKitBySlug(kitSlug)) {
		return json({ ok: false, message: 'Unknown kit.' }, { status: 400 });
	}

	let pending = getPendingByToken(cookies.get(PENDING_COOKIE));
	if (!pending) {
		return json(
			{ ok: false, message: 'No onboarding answers found — start again from /new.' },
			{ status: 404 }
		);
	}
	if (!pending.linkedUserId) {
		pending = linkPendingToUser({ cookies, userId: locals.user.id }) ?? pending;
	}
	if (pending.linkedUserId && pending.linkedUserId !== locals.user.id) {
		return json(
			{ ok: false, message: 'These answers belong to a different account.' },
			{
				status: 403
			}
		);
	}

	const rawDescription = pending.answers.rawDescription;
	const hasRaw = typeof rawDescription === 'string' && rawDescription.trim().length >= 30;
	if (isUnsupportedNicheAnswer(pending.answers)) {
		return json({ ok: false, message: manualReviewMessage }, { status: 409 });
	}
	if (hasRaw && needsManualReview(rawDescription)) {
		return json({ ok: false, message: manualReviewMessage }, { status: 409 });
	}
	if (!hasRaw && nextQuestion(pending.answers)) {
		return json(
			{ ok: false, message: 'Please finish answering the questions first.' },
			{ status: 400 }
		);
	}

	const description = composeDescription(pending.answers, { kitSlug: kitSlug as PsychKitSlug });
	if (description.trim().length < 30) {
		return json(
			{ ok: false, message: 'Please add a bit more detail before finishing.' },
			{ status: 400 }
		);
	}

	consumePending(pending.id);
	recordOnboardingEvent({
		event: 'completed',
		pendingId: pending.id,
		userId: locals.user.id,
		route: '/api/onboarding/finish'
	});
	return json({ ok: true, description, pendingId: pending.id });
};
