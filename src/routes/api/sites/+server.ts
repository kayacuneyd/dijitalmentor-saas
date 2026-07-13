import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { generateSite } from '$lib/server/ai/generate';
import { AIInvalidOutputError, AIUnavailableError, QuotaExceededError } from '$lib/server/ai/llm';
import { assertWithinQuota, recordUsage, tenantIdForUser } from '$lib/server/ai/usage';
import { saveDraft } from '$lib/server/db/repo';
import { recordError } from '$lib/server/error-log';
import { recordOnboardingEvent } from '$lib/server/onboarding/telemetry';
import { getPendingById, setGeneratedSiteId } from '$lib/server/onboarding/session';
import { seedChatFromOnboarding } from '$lib/server/chatLog';
import { assertCanCreateFreePreviewSite, SiteQuotaError } from '$lib/server/siteQuota';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	description: z.string().trim().min(30, 'Describe yourself in at least a few sentences.'),
	onboardingPendingId: z.string().trim().min(1).optional()
});

/** Self-description → generated draft → editor (the M3 first slice entry point). */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ ok: false, message: 'Sign in to generate a site.' }, { status: 401 });
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
	const id = `site-${crypto.randomUUID().slice(0, 8)}`;
	// Quota is per account, not per site — otherwise regenerating resets the budget.
	const tenantId = tenantIdForUser(locals.user.id);
	const startedAt = Date.now();
	const onboardingPendingId = body.data.onboardingPendingId;
	if (onboardingPendingId) {
		recordOnboardingEvent({
			event: 'generation_started',
			pendingId: onboardingPendingId,
			userId: locals.user.id,
			siteId: id,
			route: '/api/sites'
		});
	}

	try {
		assertCanCreateFreePreviewSite(locals.user);
		// Free-tier site creation is slot-based, so deleting a draft frees the slot.
		// The AI token/$ backstops still apply, but historical generation_count no
		// longer blocks a user who removed an unused preview site.
		assertWithinQuota(tenantId, {
			ownerUserId: locals.user.id,
			isAdmin: locals.user.isAdmin
		});
		const { site, usage } = await generateSite({
			description: body.data.description,
			id,
			tenantId
		});
		recordUsage(tenantId, usage);
		saveDraft(site, { ownerUserId: locals.user.id });
		if (onboardingPendingId) {
			// Best-effort: fixes the generatedSiteId back-reference (unset at finish —
			// the site doesn't exist yet there) and seeds the editor chat with the
			// onboarding Q&A so the conversation visibly continues in the editor.
			try {
				const pending = getPendingById(onboardingPendingId);
				if (pending) {
					setGeneratedSiteId(onboardingPendingId, id);
					seedChatFromOnboarding(id, pending.answers);
				}
			} catch (seedErr) {
				console.error('[onboarding] chat seed failed:', seedErr);
			}
			recordOnboardingEvent({
				event: 'generation_succeeded',
				pendingId: onboardingPendingId,
				userId: locals.user.id,
				siteId: id,
				route: '/api/sites',
				durationMs: Date.now() - startedAt
			});
		}
		return json({ ok: true, id, usage });
	} catch (error) {
		if (error instanceof QuotaExceededError) {
			if (onboardingPendingId) {
				recordOnboardingEvent({
					event: 'generation_failed',
					pendingId: onboardingPendingId,
					userId: locals.user.id,
					siteId: id,
					route: '/api/sites',
					durationMs: Date.now() - startedAt
				});
			}
			return json({ ok: false, message: error.message }, { status: 429 });
		}
		if (error instanceof AIUnavailableError) {
			const errorId = recordError(error, {
				source: 'site-generation',
				route: '/api/sites',
				method: 'POST',
				status: 503,
				userId: locals.user.id,
				siteId: id
			});
			if (onboardingPendingId) {
				recordOnboardingEvent({
					event: 'generation_failed',
					pendingId: onboardingPendingId,
					userId: locals.user.id,
					siteId: id,
					route: '/api/sites',
					durationMs: Date.now() - startedAt,
					errorId
				});
			}
			return json(
				{ ok: false, message: `${error.message} Reference: ${errorId}`, errorId },
				{ status: 503 }
			);
		}
		if (error instanceof AIInvalidOutputError) {
			const errorId = recordError(error, {
				source: 'site-generation',
				route: '/api/sites',
				method: 'POST',
				status: 422,
				userId: locals.user.id,
				siteId: id
			});
			if (onboardingPendingId) {
				recordOnboardingEvent({
					event: 'generation_failed',
					pendingId: onboardingPendingId,
					userId: locals.user.id,
					siteId: id,
					route: '/api/sites',
					durationMs: Date.now() - startedAt,
					errorId
				});
			}
			return json(
				{ ok: false, message: `${error.message} Reference: ${errorId}`, errorId },
				{ status: 422 }
			);
		}
		if (error instanceof SiteQuotaError) {
			if (onboardingPendingId) {
				recordOnboardingEvent({
					event: 'generation_failed',
					pendingId: onboardingPendingId,
					userId: locals.user.id,
					siteId: id,
					route: '/api/sites',
					durationMs: Date.now() - startedAt
				});
			}
			return json(
				{ ok: false, code: error.code, message: error.message },
				{ status: error.status }
			);
		}
		const errorId = recordError(error, {
			source: 'site-generation',
			route: '/api/sites',
			method: 'POST',
			status: 500,
			userId: locals.user.id,
			siteId: id
		});
		if (onboardingPendingId) {
			recordOnboardingEvent({
				event: 'generation_failed',
				pendingId: onboardingPendingId,
				userId: locals.user.id,
				siteId: id,
				route: '/api/sites',
				durationMs: Date.now() - startedAt,
				errorId
			});
		}
		return json(
			{
				ok: false,
				message:
					'Site generation failed before the editor could open. Your answers are saved; please try again shortly.',
				errorId
			},
			{ status: 500 }
		);
	}
};
