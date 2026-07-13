import { error, redirect } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import { getOrSeedDraft, getSiteMeta } from '$lib/server/db/repo';
import { hasEditorOpenedEvent, recordOnboardingEvent } from '$lib/server/onboarding/telemetry';
import { listChatMessages } from '$lib/server/chatLog';
import { publicSitePath } from '$lib/siteUrls';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals, url }) => {
	// Audit fix: editing always needs a session (autosave/chat/publish are 401
	// for anonymous users anyway — redirect up front instead of failing saves).
	if (!locals.user) redirect(303, '/login');
	const site = getOrSeedDraft(params.siteId);
	if (!site) error(404, `Unknown site "${params.siteId}"`);
	const meta = getSiteMeta(params.siteId);
	if (!canManageSite(locals.user, meta?.ownerUserId)) {
		error(403, 'This site belongs to another account.');
	}
	const onboardingPendingId = url.searchParams.get('onboarding');
	if (onboardingPendingId && !hasEditorOpenedEvent(params.siteId)) {
		recordOnboardingEvent({
			event: 'editor_opened',
			pendingId: onboardingPendingId,
			userId: locals.user.id,
			siteId: params.siteId,
			route: '/editor/[siteId]'
		});
	}
	return {
		site,
		publishedVersion: meta?.publishedVersion ?? null,
		publicHandle: meta?.publicHandle ?? site.id,
		appOrigin: `${url.protocol}//`,
		appHost: url.host,
		liveUrl: `${url.protocol}//${meta?.publicHandle ?? site.id}.${url.host}${publicSitePath(
			site,
			site.defaultLocale,
			site.pages[0].slug
		)}`,
		user: locals.user,
		chatHistory: listChatMessages(params.siteId)
	};
};
