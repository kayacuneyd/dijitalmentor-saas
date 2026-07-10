import { requireAdmin } from '$lib/server/auth';
import {
	INQUIRY_SOURCES,
	INQUIRY_STATUSES,
	listInquiries,
	type InquirySource,
	type InquiryStatus
} from '$lib/server/inquiries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	requireAdmin(locals);
	const statusParam = url.searchParams.get('status');
	const sourceParam = url.searchParams.get('source');
	const status = INQUIRY_STATUSES.includes(statusParam as InquiryStatus)
		? (statusParam as InquiryStatus)
		: undefined;
	const source = INQUIRY_SOURCES.includes(sourceParam as InquirySource)
		? (sourceParam as InquirySource)
		: undefined;
	return {
		inquiries: listInquiries({ status, source }),
		status: status ?? 'all',
		source: source ?? 'all'
	};
};
