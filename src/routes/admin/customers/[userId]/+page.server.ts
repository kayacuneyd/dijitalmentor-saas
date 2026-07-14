import { error, fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { overrideSubscription } from '$lib/server/billing';
import { grantAiTopUp, tenantIdForUser } from '$lib/server/ai/usage';
import { getCustomerDetail, logAdminAction } from '$lib/server/customers';
import { detachSiteDomain, getDomainForSite } from '$lib/server/domains';
import { getDraft, getOrSeedDraft, publishDraft, unpublishSite } from '$lib/server/db/repo';
import { deleteSiteCascade } from '$lib/server/siteDeletion';
import { siteQualityCheck } from '$lib/quality/siteQuality';
import { sendEmail } from '$lib/server/email';
import { serverTranslator } from '$lib/server/messageOverrides';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals }) => {
	requireAdmin(locals);
	const customer = getCustomerDetail(params.userId);
	if (!customer) error(404, serverTranslator(locals.locale)('admin.customer.unknown'));
	return { customer };
};

export const actions: Actions = {
	overrideSubscription: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const next = String((await request.formData()).get('next') ?? '');
		if (next !== 'active' && next !== 'free') {
			return fail(400, { message: t('admin.customer.invalidPlan') });
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
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const edits = Number(form.get('edits') ?? 0) || 0;
		const generations = Number(form.get('generations') ?? 0) || 0;
		const usdWaived = Number(form.get('usdWaived') ?? 0) || 0;
		const reason = String(form.get('reason') ?? '').trim();
		if (!reason) return fail(400, { message: t('admin.customer.reasonRequired') });
		if (edits <= 0 && generations <= 0 && usdWaived <= 0) {
			return fail(400, { message: t('admin.customer.positiveAmount') });
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
		const t = serverTranslator(locals.locale);
		const siteId = String((await request.formData()).get('siteId') ?? '');
		const domain = getDomainForSite(siteId);
		if (!domain || !detachSiteDomain(siteId)) {
			return fail(404, { message: t('admin.customer.noDomain') });
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

	publish: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const siteId = String((await request.formData()).get('siteId') ?? '');
		if (!siteId) return fail(400, { message: t('admin.customer.missingSite') });
		const draft = getOrSeedDraft(siteId);
		if (!draft) return fail(404, { message: t('admin.customer.siteNotFound') });
		// Admins don't bypass quality — same gate the owner's own publish goes through.
		const quality = siteQualityCheck(draft);
		if (!quality.canPublish) {
			return fail(422, {
				message: t('admin.customer.publishBlocked', {
					reason: quality.blockers[0]?.message ?? 'unknown issue'
				})
			});
		}
		const version = publishDraft(siteId);
		if (version === null) return fail(404, { message: t('admin.customer.siteNotFound') });
		logAdminAction(locals.user!.email, params.userId, 'publish', `${siteId} → v${version}`);
		const customer = getCustomerDetail(params.userId);
		if (customer) {
			await sendEmail({
				to: customer.email,
				subject: `Site published: ${siteId}`,
				text: `Our support team published your site (${siteId}) on your behalf. Contact support if you have questions.`
			});
		}
		return { published: siteId };
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
	},

	deleteSite: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const siteId = String((await request.formData()).get('siteId') ?? '');
		if (!siteId) return fail(400, { message: 'Missing siteId.' });
		const siteName = getDraft(siteId)?.settings.siteName ?? siteId;
		const result = await deleteSiteCascade(siteId);
		if (!result.ok) {
			const message =
				result.reason === 'reservation-in-progress'
					? 'Bu sitede devam eden bir domain rezervasyonu/kaydı var — önce onu çöz.'
					: 'Site bulunamadı.';
			return fail(409, { message });
		}
		logAdminAction(locals.user!.email, params.userId, 'site_delete', `${siteName} (${siteId})`);
		const customer = getCustomerDetail(params.userId);
		if (customer) {
			await sendEmail({
				to: customer.email,
				subject: `Site deleted: ${siteName}`,
				text: `Our support team permanently deleted your site "${siteName}" (${siteId}) at your request, or as part of account cleanup. This cannot be undone. Contact support if you have questions.`
			});
		}
		return { siteDeleted: siteName };
	}
};
