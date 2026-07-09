import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { generateSite } from '$lib/server/ai/generate';
import { AIInvalidOutputError, AIUnavailableError, QuotaExceededError } from '$lib/server/ai/llm';
import { assertWithinQuota, recordUsage, tenantIdForUser } from '$lib/server/ai/usage';
import { saveDraft } from '$lib/server/db/repo';
import { recordError } from '$lib/server/error-log';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	description: z.string().trim().min(30, 'Describe yourself in at least a few sentences.')
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

	try {
		// One generation = 1 generation credit (plan-tier limit; admins bypass credits).
		assertWithinQuota(tenantId, {
			kind: 'generation',
			ownerUserId: locals.user.id,
			isAdmin: locals.user.isAdmin
		});
		const { site, usage } = await generateSite({
			description: body.data.description,
			id,
			tenantId
		});
		recordUsage(tenantId, usage, 'generation');
		saveDraft(site, { ownerUserId: locals.user.id });
		return json({ ok: true, id, usage });
	} catch (error) {
		if (error instanceof QuotaExceededError) {
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
			return json(
				{ ok: false, message: `${error.message} Reference: ${errorId}`, errorId },
				{ status: 422 }
			);
		}
		throw error;
	}
};
