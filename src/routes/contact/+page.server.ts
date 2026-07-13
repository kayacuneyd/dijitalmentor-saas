import { fail } from '@sveltejs/kit';
import { rateLimit } from '$lib/server/auth';
import { createInquiry, notifyNewInquiry, validateInquiry } from '$lib/server/inquiries';
import { getPublicCopyOverrides } from '$lib/server/publicCopy';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	locale: locals.locale,
	userEmail: locals.user?.email ?? '',
	copyOverrides: getPublicCopyOverrides('contact')
});

export const actions: Actions = {
	default: async ({ request, locals, getClientAddress }) => {
		if (!rateLimit(`inquiry-contact-ip:${getClientAddress()}`, 6, 60_000)) {
			return fail(429, { message: 'Too many messages. Please wait a minute and try again.' });
		}
		const form = await request.formData();
		const validation = validateInquiry({
			source: 'contact',
			name: form.get('name'),
			email: form.get('email'),
			category: form.get('category'),
			message: form.get('message'),
			website: form.get('website'),
			userId: locals.user?.id
		});
		if (!validation.ok) {
			return fail(400, {
				message: validation.message,
				field: validation.field,
				values: {
					name: String(form.get('name') ?? ''),
					email: String(form.get('email') ?? ''),
					category: String(form.get('category') ?? 'other'),
					message: String(form.get('message') ?? '')
				}
			});
		}
		if (!rateLimit(`inquiry-contact-email:${validation.data.email}`, 4, 3_600_000)) {
			return fail(429, { message: 'Too many messages from this email. Please try again later.' });
		}
		const inquiry = createInquiry(validation.data);
		await notifyNewInquiry(inquiry, validation.data.message);
		return { sent: true, id: inquiry.id };
	}
};
