import { error, json } from '@sveltejs/kit';
import { canManageSite, rateLimit } from '$lib/server/auth';
import { getOrSeedDraft, getSiteMeta } from '$lib/server/db/repo';
import {
	listMedia,
	MAX_MEDIA_BYTES,
	MAX_SITE_MEDIA_BYTES,
	siteMediaUsage,
	uploadMedia
} from '$lib/server/media';
import type { RequestHandler } from './$types';

function guard(locals: App.Locals, siteId: string): Response | null {
	if (!locals.user) {
		return json({ ok: false, message: 'Sign in to manage media.' }, { status: 401 });
	}
	getOrSeedDraft(siteId);
	const meta = getSiteMeta(siteId);
	if (!meta) error(404, `Unknown site "${siteId}"`);
	if (!canManageSite(locals.user, meta.ownerUserId)) {
		return json({ ok: false, message: 'This site belongs to another account.' }, { status: 403 });
	}
	return null;
}

export const GET: RequestHandler = ({ params, locals }) => {
	const denied = guard(locals, params.siteId);
	if (denied) return denied;
	return json({ ok: true, assets: listMedia(params.siteId) });
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const denied = guard(locals, params.siteId);
	if (denied) return denied;
	if (!locals.user) error(401);
	if (!rateLimit(`media:${locals.user.id}`, 20, 60_000)) {
		return json({ ok: false, message: 'Too many uploads. Try again shortly.' }, { status: 429 });
	}

	const contentLength = Number(request.headers.get('content-length') || 0);
	if (contentLength > MAX_MEDIA_BYTES + 1024 * 1024) {
		return json({ ok: false, message: 'Image must be 8 MB or smaller.' }, { status: 413 });
	}

	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File) || file.size === 0) {
		return json({ ok: false, message: 'Choose an image to upload.' }, { status: 400 });
	}
	if (file.size > MAX_MEDIA_BYTES) {
		return json({ ok: false, message: 'Image must be 8 MB or smaller.' }, { status: 413 });
	}
	if (siteMediaUsage(params.siteId) + file.size > MAX_SITE_MEDIA_BYTES) {
		return json(
			{ ok: false, message: 'This site has reached its 100 MB media limit.' },
			{ status: 413 }
		);
	}

	try {
		const asset = await uploadMedia({
			siteId: params.siteId,
			ownerUserId: locals.user.id,
			fileName: file.name,
			mimeType: file.type,
			bytes: new Uint8Array(await file.arrayBuffer())
		});
		return json({ ok: true, asset }, { status: 201 });
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Upload failed.';
		const clientError = message.startsWith('Upload a valid');
		console.error('[media] upload failed', { siteId: params.siteId, message });
		return json(
			{ ok: false, message: clientError ? message : 'Media storage is unavailable.' },
			{ status: clientError ? 400 : 503 }
		);
	}
};
