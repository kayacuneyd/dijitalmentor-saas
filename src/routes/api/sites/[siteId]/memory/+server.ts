import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { canManageSite } from '$lib/server/auth';
import { getSiteMeta } from '$lib/server/db/repo';
import { getSiteMemory, updateSiteMemory } from '$lib/server/ai/memory';
import type { RequestHandler } from './$types';

/** Owner-only: read or replace the AI memory for this site. */
export const GET: RequestHandler = async ({ params, locals }) => {
	const meta = getSiteMeta(params.siteId);
	if (!meta) error(404, `Unknown site "${params.siteId}"`);
	if (!locals.user || !canManageSite(locals.user, meta.ownerUserId)) {
		return json({ ok: false, message: 'Site owner only.' }, { status: locals.user ? 403 : 401 });
	}
	const memory = getSiteMemory(params.siteId);
	return json({
		ok: true,
		memory: memory
			? { content: memory.content, version: memory.version, updatedAt: memory.updatedAt }
			: null
	});
};

const putSchema = z.object({ content: z.string().max(10000) });

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const meta = getSiteMeta(params.siteId);
	if (!meta) error(404, `Unknown site "${params.siteId}"`);
	if (!locals.user || !canManageSite(locals.user, meta.ownerUserId)) {
		return json({ ok: false, message: 'Site owner only.' }, { status: locals.user ? 403 : 401 });
	}
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return json({ ok: false, message: 'Body must be JSON' }, { status: 400 });
	}
	const body = putSchema.safeParse(raw);
	if (!body.success) {
		return json({ ok: false, message: 'Content (max 10000 chars) required.' }, { status: 400 });
	}
	updateSiteMemory(params.siteId, body.data.content);
	return json({ ok: true });
};
