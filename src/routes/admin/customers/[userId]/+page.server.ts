import { error, fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { overrideSubscription } from '$lib/server/billing';
import { grantAiTopUp, tenantIdForUser } from '$lib/server/ai/usage';
import { getCustomerDetail, logAdminAction } from '$lib/server/customers';
import { detachSiteDomain, getDomainForSite } from '$lib/server/domains';
import { unpublishSite } from '$lib/server/db/repo';
import { sendEmail } from '$lib/server/email';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals }) => {
	requireAdmin(locals);
	const customer = getCustomerDetail(params.userId);
	if (!customer) error(404, 'Unknown customer.');
	return { customer };
};

export const actions: Actions = {
	overrideSubscription: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const next = String((await request.formData()).get('next') ?? '');
		if (next !== 'active' && next !== 'free') {
			return fail(400, { message: 'Invalid target plan state.' });
		}
		overrideSubscription(params.userId, next);
		logAdminAction(
			locals.user!.email,
			params.userId,
			'subscription_override',
			`manually set to ${next === 'active' ? 'Pro (comp)' : 'Free'}`
		);
		return { overridden: next };
	},

	topUp: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const edits = Number(form.get('edits') ?? 0) || 0;
		const generations = Number(form.get('generations') ?? 0) || 0;
		const usdWaived = Number(form.get('usdWaived') ?? 0) || 0;
		const reason = String(form.get('reason') ?? '').trim();
		if (!reason) return fail(400, { message: 'A reason is required.' });
		if (edits <= 0 && generations <= 0 && usdWaived <= 0) {
			return fail(400, { message: 'Enter at least one positive amount to grant.' });
		}
		grantAiTopUp(tenantIdForUser(params.userId), { edits, generations, usdWaived });
		logAdminAction(
			locals.user!.email,
			params.userId,
			'ai_topup',
			`+${edits} edits, +${generations} generations, $${usdWaived.toFixed(2)} waived — ${reason}`
		);
		return { toppedUp: true };
	},

	detachDomain: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const siteId = String((await request.formData()).get('siteId') ?? '');
		const domain = getDomainForSite(siteId);
		if (!domain || !detachSiteDomain(siteId)) {
			return fail(404, { message: 'No domain to detach on that site.' });
		}
		logAdminAction(locals.user!.email, params.userId, 'domain_detach', `${domain} on ${siteId}`);
		const customer = getCustomerDetail(params.userId);
		if (customer) {
			// Best-effort, same as the automated sweep — never fails the admin action.
			await sendEmail({
				to: customer.email,
				subject: `Custom domain removed: ${domain}`,
				text: `Our support team detached the custom domain ${domain} from your saaskaya site.\n\nYour site stays published on its saaskaya subdomain. Contact support if you have questions.`
			});
		}
		return { domainDetached: siteId };
	},

	unpublish: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const siteId = String((await request.formData()).get('siteId') ?? '');
		if (!siteId) return fail(400, { message: 'Missing siteId.' });
		unpublishSite(siteId);
		logAdminAction(locals.user!.email, params.userId, 'unpublish', siteId);
		const customer = getCustomerDetail(params.userId);
		if (customer) {
			await sendEmail({
				to: customer.email,
				subject: `Site unpublished: ${siteId}`,
				text: `Our support team unpublished your site (${siteId}). It's no longer publicly reachable, but your draft is unchanged and you can republish it from the dashboard. Contact support if you have questions.`
			});
		}
		return { unpublished: siteId };
	}
};
