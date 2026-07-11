import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { classify } from '$lib/server/assistant/kb';
import { rateLimit } from '$lib/server/auth';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	message: z.string().trim().min(1).max(1200),
	currentPath: z.string().trim().max(240).optional(),
	locale: z.enum(['tr', 'en', 'de']).default('tr')
});

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	if (!rateLimit(`assistant-route:${getClientAddress()}`, 24, 60_000)) {
		return json(
			{ ok: false, message: 'Too many assistant messages. Try again shortly.' },
			{ status: 429 }
		);
	}

	let rawBody: unknown;
	try {
		rawBody = await request.json();
	} catch {
		return json({ ok: false, message: 'Invalid request.' }, { status: 400 });
	}
	const body = bodySchema.safeParse(rawBody);
	if (!body.success) {
		return json({ ok: false, message: body.error.issues[0].message }, { status: 400 });
	}

	const routed = classify(body.data.message, body.data.locale, Boolean(locals.user));
	return json({
		ok: true,
		action: routed.action,
		reply: routed.reply,
		href: routed.href,
		prefill: routed.prefill
	});
};
