import { PENDING_COOKIE, getPendingByToken } from '$lib/server/onboarding/session';
import { psychKitBySlug } from '$lib/kits';
import type { PageServerLoad } from './$types';

/**
 * Anonymous-reachable (Hostinger Horizons roadmap Phase 2): the guided Q&A can be
 * answered without an account. The sign-in gate (idea.md §6.1's abuse gate) now
 * lives at `/api/onboarding/finish`, the moment actual AI generation is about to be
 * spent, instead of here at page load.
 */
export const load: PageServerLoad = ({ locals, cookies, url }) => {
	const pending = getPendingByToken(cookies.get(PENDING_COOKIE));
	const selectedKit = psychKitBySlug(url.searchParams.get('kit'));
	return {
		user: locals.user,
		pending,
		selectedKit: selectedKit
			? {
					slug: selectedKit.slug,
					label: selectedKit.label,
					audience: selectedKit.audience,
					outcome: selectedKit.outcome
				}
			: null
	};
};
