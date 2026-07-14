import { PENDING_COOKIE, getPendingByToken } from '$lib/server/onboarding/session';
import { kitBySlug } from '$lib/kits';
import { SUPPORTED_NICHES } from '$lib/onboarding/support';
import { betaModeOn } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

const supportedNiches = new Set<string>(SUPPORTED_NICHES);

function campaignSource(url: URL): string | null {
	const parts = [
		url.searchParams.get('utm_source'),
		url.searchParams.get('utm_campaign'),
		url.searchParams.get('profession')
	]
		.map((value) => value?.trim())
		.filter(Boolean);
	return parts.length > 0 ? parts.join(':').slice(0, 120) : null;
}

/**
 * Anonymous-reachable (Hostinger Horizons roadmap Phase 2): the guided Q&A can be
 * answered without an account. The sign-in gate (idea.md §6.1's abuse gate) now
 * lives at `/api/onboarding/finish`, the moment actual AI generation is about to be
 * spent, instead of here at page load.
 */
export const load: PageServerLoad = ({ locals, cookies, url }) => {
	const pending = getPendingByToken(cookies.get(PENDING_COOKIE));
	const selectedKit = kitBySlug(url.searchParams.get('kit'));
	const profession = url.searchParams.get('profession')?.trim().toLowerCase() ?? '';
	const preselectedNiche = supportedNiches.has(profession) ? profession : null;
	return {
		user: locals.user,
		authHref: betaModeOn() && !locals.user ? '/beta' : '/login',
		pending,
		preselectedNiche,
		campaignSource: campaignSource(url),
		selectedKit: selectedKit
			? {
					slug: selectedKit.slug,
					label: selectedKit.label,
					profession: selectedKit.profession,
					category: selectedKit.category,
					audience: selectedKit.audience,
					outcome: selectedKit.outcome,
					featureKits: selectedKit.featureKits,
					promptRecipes: selectedKit.promptRecipes
				}
			: null
	};
};
