import { PENDING_COOKIE, getPendingByToken } from '$lib/server/onboarding/session';
import type { PageServerLoad } from './$types';

/**
 * Anonymous-reachable (Hostinger Horizons roadmap Phase 2): the guided Q&A can be
 * answered without an account. The sign-in gate (idea.md §6.1's abuse gate) now
 * lives at `/api/onboarding/finish`, the moment actual AI generation is about to be
 * spent, instead of here at page load.
 */
export const load: PageServerLoad = ({ locals, cookies }) => {
	const pending = getPendingByToken(cookies.get(PENDING_COOKIE));
	return { user: locals.user, pending };
};
