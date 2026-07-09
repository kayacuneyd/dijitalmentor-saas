import { json } from '@sveltejs/kit';
import { nextQuestion } from '$lib/onboarding/questions';
import { composeDescription } from '$lib/server/onboarding/compose';
import {
	PENDING_COOKIE,
	consumePending,
	getPendingByToken,
	linkPendingToUser
} from '$lib/server/onboarding/session';
import type { RequestHandler } from './$types';

/**
 * The abuse gate (idea.md §6.1) lives here now, not at `/new`'s page load: this is
 * the moment actual AI generation is about to be spent. Composes the collected
 * answers into a `description` string and returns it — the client still POSTs that
 * to the UNCHANGED `/api/sites` itself, exactly as the plain-textarea flow does today.
 */
export const POST: RequestHandler = async ({ cookies, locals }) => {
	if (!locals.user) {
		return json({ ok: false, message: 'Sign in to finish creating your site.' }, { status: 401 });
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
	if (!hasRaw && nextQuestion(pending.answers)) {
		return json(
			{ ok: false, message: 'Please finish answering the questions first.' },
			{ status: 400 }
		);
	}

	const description = composeDescription(pending.answers);
	if (description.trim().length < 30) {
		return json(
			{ ok: false, message: 'Please add a bit more detail before finishing.' },
			{ status: 400 }
		);
	}

	consumePending(pending.id);
	return json({ ok: true, description });
};
