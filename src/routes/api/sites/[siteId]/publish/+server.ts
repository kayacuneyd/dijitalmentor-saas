import { json } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import {
	getOrSeedDraft,
	getSiteMeta,
	publishDraft,
	saveDraft,
	unpublishSite,
	validatePublicHandle
} from '$lib/server/db/repo';
import { siteSchema } from '$lib/schema/site';
import { siteQualityCheck } from '$lib/quality/siteQuality';
import { assertCanPublishFreeSite, SiteQuotaError } from '$lib/server/siteQuota';
import type { RequestHandler } from './$types';

function guard(locals: App.Locals, siteId: string): Response | null {
	// Audit fix: publishing always requires a signed-in user (anonymous could
	// flip ownerless demos on/off); any signed-in user may still demo the seeds.
	if (!locals.user) {
		return json({ ok: false, message: 'Sign in to publish.' }, { status: 401 });
	}
	getOrSeedDraft(siteId); // seeds publish fine even on a fresh DB
	const meta = getSiteMeta(siteId);
	if (!meta) return json({ ok: false, message: `Unknown site "${siteId}"` }, { status: 404 });
	if (!canManageSite(locals.user, meta.ownerUserId)) {
		return json({ ok: false, message: 'Sign in as the site owner to publish.' }, { status: 403 });
	}
	return null;
}

/**
 * Draft → new immutable published snapshot (M4). Accepts an optional `{draft}` body —
 * the editor sends the exact snapshot it just flushed as a belt-and-braces guarantee
 * against publishing a version older than what the user last saw (the client-side
 * save/publish race this closes is in `DraftStore`/`saveTracker.ts`). The body is
 * validated the same way the draft PUT endpoint validates it (constitution §2: invalid
 * drafts are never stored) before being persisted and then snapshotted.
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
	const denied = guard(locals, params.siteId);
	if (denied) return denied;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		body = null;
	}
	if (body && typeof body === 'object' && 'draft' in body) {
		const parsed = siteSchema.safeParse((body as { draft: unknown }).draft);
		if (!parsed.success) {
			return json({ ok: false, issues: parsed.error.issues }, { status: 400 });
		}
		if (parsed.data.id !== params.siteId) {
			return json({ ok: false, issues: [{ message: 'site id mismatch' }] }, { status: 400 });
		}
		saveDraft(parsed.data);
	}
	const meta = getSiteMeta(params.siteId);
	const handle = validatePublicHandle(meta?.publicHandle ?? '');
	if (!handle.ok || (!meta?.publishedVersion && handle.ok && handle.handle === params.siteId)) {
		return json(
			{
				ok: false,
				message: 'Complete the site name and public subdomain before publishing.'
			},
			{ status: 422 }
		);
	}
	try {
		assertCanPublishFreeSite(locals.user!, meta!);
	} catch (err) {
		if (err instanceof SiteQuotaError) {
			return json({ ok: false, code: err.code, message: err.message }, { status: err.status });
		}
		throw err;
	}

	const draft = getOrSeedDraft(params.siteId);
	if (!draft) {
		return json({ ok: false, message: 'Nothing to publish.' }, { status: 404 });
	}
	const quality = siteQualityCheck(draft);
	if (!quality.canPublish) {
		return json(
			{
				ok: false,
				message: 'Publish blocked by quality checks.',
				quality
			},
			{ status: 422 }
		);
	}
	const version = publishDraft(params.siteId);
	if (version === null) {
		return json({ ok: false, message: 'Nothing to publish.' }, { status: 404 });
	}
	return json({ ok: true, version, quality });
};

/** Take the site offline (draft is kept). */
export const DELETE: RequestHandler = ({ params, locals }) => {
	const denied = guard(locals, params.siteId);
	if (denied) return denied;
	unpublishSite(params.siteId);
	return json({ ok: true });
};
