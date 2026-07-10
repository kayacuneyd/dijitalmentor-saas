import { error, fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import {
	INQUIRY_STATUSES,
	InquiryClosedError,
	addInquiryMessage,
	getInquiryDetail,
	sendInquiryReply,
	setInquiryStatus,
	type InquiryStatus
} from '$lib/server/inquiries';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
	requireAdmin(locals);
	const inquiry = getInquiryDetail(params.inquiryId);
	if (!inquiry) error(404, 'Unknown inquiry.');
	return { inquiry };
};

export const actions: Actions = {
	reply: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const inquiry = getInquiryDetail(params.inquiryId);
		if (!inquiry) error(404, 'Unknown inquiry.');
		const body = String((await request.formData()).get('body') ?? '').trim();
		if (body.length < 2) return fail(400, { message: 'Message cannot be empty.' });
		if (body.length > 4000) return fail(400, { message: 'Reply is too long.' });
		try {
			addInquiryMessage({
				inquiryId: inquiry.id,
				authorKind: 'admin',
				authorEmail: locals.user!.email,
				body
			});
		} catch (e) {
			if (e instanceof InquiryClosedError) return fail(400, { message: e.message });
			throw e;
		}
		await sendInquiryReply({ inquiry, body });
		return { replied: true };
	},
	setStatus: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const inquiry = getInquiryDetail(params.inquiryId);
		if (!inquiry) error(404, 'Unknown inquiry.');
		const status = String((await request.formData()).get('status') ?? '');
		if (!INQUIRY_STATUSES.includes(status as InquiryStatus)) {
			return fail(400, { message: 'Invalid status.' });
		}
		setInquiryStatus(inquiry.id, status as InquiryStatus);
		return { statusSet: status };
	}
};
