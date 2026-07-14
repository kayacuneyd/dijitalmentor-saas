import { fail, redirect } from '@sveltejs/kit';
import { rateLimit } from '$lib/server/auth';
import { getSetting } from '$lib/server/config';
import { sendEmail } from '$lib/server/email';
import { serverTranslator } from '$lib/server/messageOverrides';
import { createTicket, listTicketsForUser, type TicketCategory } from '$lib/server/support';
import type { Actions, PageServerLoad } from './$types';

const CATEGORIES: TicketCategory[] = ['general', 'billing', 'technical', 'human_review'];

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	return { tickets: listTicketsForUser(locals.user.id) };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		if (!rateLimit(`ticket-create:${locals.user.id}`, 5, 3_600_000)) {
			return fail(429, { message: t('account.support.tooManyTickets') });
		}
		const form = await request.formData();
		const subject = String(form.get('subject') ?? '').trim();
		const body = String(form.get('body') ?? '').trim();
		const categoryInput = String(form.get('category') ?? 'general');
		const category = CATEGORIES.includes(categoryInput as TicketCategory)
			? (categoryInput as TicketCategory)
			: 'general';
		if (!subject || !body) {
			return fail(400, { message: t('account.support.subjectBodyRequired') });
		}
		const ticket = createTicket({
			userId: locals.user.id,
			subject,
			body,
			authorEmail: locals.user.email,
			category
		});
		const alertEmail = getSetting('ALERT_EMAIL');
		if (alertEmail) {
			await sendEmail({
				to: alertEmail,
				subject: `New support ticket: ${subject}`,
				text: `${locals.user.email} opened a ${category} ticket (${ticket.id}):\n\n${body}\n\n/admin/support/${ticket.id}`
			});
		}
		redirect(303, `/account/support/${ticket.id}`);
	}
};
