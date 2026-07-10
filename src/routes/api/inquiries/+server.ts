import { json } from '@sveltejs/kit';
import { rateLimit } from '$lib/server/auth';
import { createInquiry, notifyNewInquiry, validateInquiry } from '$lib/server/inquiries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	if (!rateLimit(`inquiry-api-ip:${getClientAddress()}`, 6, 60_000)) {
		return json(
			{ ok: false, message: 'Too many messages. Please wait a minute and try again.' },
			{ status: 429 }
		);
	}
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, message: 'Invalid request.' }, { status: 400 });
	}
	const value = typeof body === 'object' && body ? (body as Record<string, unknown>) : {};
	const validation = validateInquiry({
		source: value.source,
		name: value.name,
		email: value.email,
		category: value.category,
		message: value.message,
		website: value.website,
		userId: locals.user?.id
	});
	if (!validation.ok)
		return json(
			{ ok: false, message: validation.message, field: validation.field },
			{ status: 400 }
		);
	if (!rateLimit(`inquiry-api-email:${validation.data.email}`, 4, 3_600_000)) {
		return json(
			{ ok: false, message: 'Too many messages from this email. Please try again later.' },
			{ status: 429 }
		);
	}
	const inquiry = createInquiry(validation.data);
	await notifyNewInquiry(inquiry, validation.data.message);
	return json({ ok: true, id: inquiry.id });
};
