import { error, fail, redirect } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import {
	billingConfigured,
	billingProvider,
	createDomainCheckoutSession,
	hasActiveSiteSubscription,
	PRO_SITE_PRICE_EUR_MONTHLY,
	PRO_SITE_PRICE_EUR_YEARLY,
	siteSubscriptionDetails,
	siteSubscriptionState,
	subscriptionState
} from '$lib/server/billing';
import { countSubmissions } from '$lib/server/db/contact';
import { siteQualityCheck } from '$lib/quality/siteQuality';
import {
	getDraft,
	getSiteMeta,
	listSitesByOwner,
	publishDraft,
	setSiteIdentity,
	unpublishSite,
	validatePublicHandle
} from '$lib/server/db/repo';
import { deleteSiteCascade } from '$lib/server/siteDeletion';
import {
	attachSiteDomain,
	checkDomainAvailability,
	createARecord,
	detachSiteDomain,
	dnsPointsHere,
	getDomainForSite,
	normalizeDomain,
	porkbunConfigured,
	provisionDomain,
	registerDomain,
	validateDomain
} from '$lib/server/domains';
import {
	cancelReservation,
	createReservation,
	consumeDomainCredit,
	customerDomainGate,
	domainSetupLabel,
	getReservation,
	listReservationsByUser,
	paymentMode,
	reportBankTransfer,
	unusedDomainCreditForSite,
	type PaymentMethod
} from '$lib/server/reservations';
import { getSetting } from '$lib/server/config';
import { assertCanPublishFreeSite, SiteQuotaError } from '$lib/server/siteQuota';
import { serverTranslator } from '$lib/server/messageOverrides';
import { getEurTryRate, shouldShowTry, tryAmounts } from '$lib/server/exchangeRates';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, request }) => {
	if (!locals.user) redirect(303, '/login');
	const showTry = shouldShowTry(locals.locale, request.headers);
	const tryEstimate = tryAmounts(showTry ? await getEurTryRate() : null);
	const reservations = listReservationsByUser(locals.user.id);
	const sites = listSitesByOwner(locals.user.id).map((site) => {
		const reservation = reservations.find((r) => r.siteId === site.id && r.status !== 'cancelled');
		return {
			...site,
			plan: siteSubscriptionState(site.id, locals.user!.id),
			planDetails: siteSubscriptionDetails(site.id, locals.user!.id),
			canExport: locals.user!.isAdmin || hasActiveSiteSubscription(site.id, locals.user!.id),
			liveUrl: `${url.protocol}//${site.publicHandle ?? site.id}.${url.host}`,
			previewUrl: `/preview/${site.id}?locale=${site.defaultLocale}&source=persisted`,
			domain: getDomainForSite(site.id),
			hasDomainCredit: Boolean(unusedDomainCreditForSite(locals.user!.id, site.id)),
			messageCount: countSubmissions(site.id),
			reservation,
			domainSetupLabel: reservation ? domainSetupLabel(reservation) : null
		};
	});
	const subscription = subscriptionState(locals.user.id);
	return {
		user: locals.user,
		sites,
		subscription,
		subscribed: subscription.state !== 'free',
		billingConfigured: billingConfigured(),
		porkbunConfigured: porkbunConfigured(),
		proSitePriceEur: PRO_SITE_PRICE_EUR_MONTHLY,
		proSiteYearlyPriceEur: PRO_SITE_PRICE_EUR_YEARLY,
		tryEstimate,
		payment: {
			mode: paymentMode(),
			iban: getSetting('BANK_IBAN') ?? '',
			accountHolder: getSetting('BANK_ACCOUNT_HOLDER') ?? ''
		}
	};
};

function requireManageableSite(
	user: App.Locals['user'],
	siteId: string,
	t: ReturnType<typeof serverTranslator>
) {
	const meta = getSiteMeta(siteId);
	if (!meta) error(404, t('dashboard.actions.siteNotFound'));
	if (!canManageSite(user, meta.ownerUserId)) {
		error(403, t('dashboard.actions.siteBelongsToAnotherAccount'));
	}
	return meta;
}

/** Custom domains are a paid feature (constitution §5: only ever after payment). */
function requirePaidDomainAccess(
	user: NonNullable<App.Locals['user']>,
	siteId: string,
	t: ReturnType<typeof serverTranslator>
) {
	if (!hasActiveSiteSubscription(siteId, user.id) && !user.isAdmin) {
		error(402, t('dashboard.actions.domainNeedsProSubscription'));
	}
}

export const actions: Actions = {
	publish: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const siteId = String((await request.formData()).get('siteId') ?? '');
		const meta = requireManageableSite(locals.user, siteId, t);
		try {
			assertCanPublishFreeSite(locals.user, meta);
		} catch (err) {
			if (err instanceof SiteQuotaError) {
				return fail(err.status, { message: err.message, siteId });
			}
			throw err;
		}
		if (!meta.publishedVersion) {
			return fail(400, {
				message: t('dashboard.actions.firstPublishOnlyFromEditor'),
				siteId
			});
		}
		const handle = validatePublicHandle(meta.publicHandle ?? '');
		if (!handle.ok) {
			return fail(400, {
				message: t('dashboard.actions.completeIdentityFirst'),
				siteId
			});
		}
		const draft = getDraft(siteId);
		if (!draft) return fail(404, { message: t('dashboard.actions.siteNotFound'), siteId });
		const quality = siteQualityCheck(draft);
		if (!quality.canPublish) {
			return fail(422, {
				message: quality.blockers[0]?.message ?? t('dashboard.actions.qualityBlockers'),
				siteId
			});
		}
		const version = publishDraft(siteId);
		if (version === null) return fail(404, { message: t('dashboard.actions.siteNotFound') });
		return { published: siteId, version };
	},
	updateIdentity: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		requireManageableSite(locals.user, siteId, t);
		const result = setSiteIdentity({
			siteId,
			siteName: String(form.get('siteName') ?? ''),
			publicHandle: String(form.get('publicHandle') ?? ''),
			contactEmail: String(form.get('contactEmail') ?? '')
		});
		if (!result.ok) {
			return fail(result.reason === 'not-found' ? 404 : 400, {
				identityMessage: result.message,
				siteId
			});
		}
		return {
			identitySaved: siteId,
			identityMessage: t('dashboard.actions.identitySaved', {
				name: result.site.settings.siteName,
				handle: result.publicHandle
			})
		};
	},
	// --- domain reservation + hybrid payment (beta-launch spec) ---------------
	reserveDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const domain = normalizeDomain(String(form.get('domain') ?? ''));
		const requestedMethod = String(form.get('paymentMethod') ?? 'bank_transfer') as PaymentMethod;
		requireManageableSite(locals.user, siteId, t);
		const credit = unusedDomainCreditForSite(locals.user.id, siteId);
		if (paymentMode() === 'disabled' && !credit) {
			return fail(503, {
				domainMessage: t('dashboard.actions.domainPurchaseClosed'),
				siteId
			});
		}
		if (!validateDomain(domain)) {
			return fail(400, {
				domainMessage: t('dashboard.actions.invalidDomain'),
				siteId
			});
		}
		const gate = await customerDomainGate(domain);
		if (gate.status === 'unavailable') {
			return fail(409, {
				domainMessage: t('dashboard.actions.domainUnavailable'),
				siteId
			});
		}
		const method: PaymentMethod =
			credit && gate.status === 'available'
				? 'included'
				: requestedMethod === 'stripe' && billingProvider() === 'creem'
					? 'creem'
					: requestedMethod;
		const result = createReservation({
			userId: locals.user.id,
			siteId,
			domain,
			paymentMethod: method,
			initialStatus:
				gate.status === 'manual_review'
					? 'manual_review'
					: method === 'included'
						? 'paid'
						: 'pending',
			operatorNotes: gate.status === 'manual_review' ? gate.note : null
		});
		if (!result.ok) {
			const msg =
				result.reason === 'domain-taken'
					? t('dashboard.actions.domainAlreadyReserved')
					: t('dashboard.actions.domainReserveFailed');
			return fail(result.reason === 'domain-taken' ? 409 : 400, { domainMessage: msg, siteId });
		}
		if (method === 'included' && credit) {
			const consumed = consumeDomainCredit({
				creditId: credit.id,
				userId: locals.user.id,
				siteId,
				reservationId: result.reservation.id,
				domain
			});
			if (!consumed) {
				return fail(409, {
					domainMessage: t('dashboard.actions.domainCreditFailed'),
					siteId
				});
			}
		}
		return {
			reserved: result.reservation.domain,
			siteId,
			domainMessage:
				gate.status === 'manual_review'
					? t('dashboard.actions.manualReviewMessage')
					: method === 'included'
						? t('dashboard.actions.domainCreditUsedMessage')
						: t('dashboard.actions.domainAvailableMessage')
		};
	},
	reportTransfer: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const reservationId = String((await request.formData()).get('reservationId') ?? '');
		reportBankTransfer(reservationId, locals.user.id);
		return { transferReported: reservationId };
	},
	cancelReservation: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const reservationId = String((await request.formData()).get('reservationId') ?? '');
		cancelReservation(reservationId, locals.user.id);
		return { reservationCancelled: reservationId };
	},
	payDomainStripe: async ({ request, locals, url }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const reservationId = String((await request.formData()).get('reservationId') ?? '');
		const reservation = getReservation(reservationId);
		if (!reservation || reservation.userId !== locals.user.id) {
			return fail(404, { message: t('dashboard.actions.reservationNotFound') });
		}
		let checkoutUrl: string;
		try {
			checkoutUrl = await createDomainCheckoutSession({
				userId: locals.user.id,
				email: locals.user.email,
				origin: url.origin,
				domain: reservation.domain,
				reservationId
			});
		} catch (err) {
			return fail(503, { message: (err as Error).message });
		}
		redirect(303, checkoutUrl); // outside try: SvelteKit redirects by throwing
	},
	unpublish: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const siteId = String((await request.formData()).get('siteId') ?? '');
		requireManageableSite(locals.user, siteId, t);
		unpublishSite(siteId);
		return { unpublished: siteId };
	},
	deleteSite: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const confirmName = String(form.get('confirmName') ?? '');
		requireManageableSite(locals.user, siteId, t);
		const draft = getDraft(siteId);
		const expectedName = draft?.settings.siteName ?? '';
		if (!expectedName || confirmName !== expectedName) {
			return fail(400, { deleteMessage: t('dashboard.actions.deleteNameMismatch'), siteId });
		}
		const result = await deleteSiteCascade(siteId);
		if (!result.ok) {
			const message =
				result.reason === 'reservation-in-progress'
					? t('dashboard.actions.deleteReservationInProgress')
					: t('dashboard.actions.siteNotFound');
			return fail(409, { deleteMessage: message, siteId });
		}
		return { deleted: expectedName };
	},
	attachDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const domain = normalizeDomain(String(form.get('domain') ?? ''));
		const meta = requireManageableSite(locals.user, siteId, t);
		requirePaidDomainAccess(locals.user, siteId, t);
		if (!validateDomain(domain)) {
			return fail(400, {
				domainMessage: t('dashboard.actions.invalidDomain'),
				siteId
			});
		}
		const dns = await dnsPointsHere(domain);
		if (!dns.ok) {
			return fail(400, {
				domainMessage: t('dashboard.actions.dnsNotPointed'),
				siteId
			});
		}
		const attached = attachSiteDomain(siteId, domain, meta.ownerUserId);
		if (!attached.ok && attached.reason === 'domain-taken') {
			return fail(409, {
				domainMessage: t('dashboard.actions.domainAlreadyAttached'),
				siteId
			});
		}
		if (!attached.ok)
			return fail(404, { domainMessage: t('dashboard.actions.siteNotFound'), siteId });
		const provision = await provisionDomain(domain);
		if (provision.ran && !provision.ok) {
			console.error(`[domains] provisioning failed for ${domain}: ${provision.output}`);
		}
		return {
			domainAttached: domain,
			siteId,
			provision: provision.ran
				? provision.ok
					? t('dashboard.actions.attachSslReady')
					: t('dashboard.actions.attachPendingReview')
				: t('dashboard.actions.attachQueued')
		};
	},
	detachDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const siteId = String((await request.formData()).get('siteId') ?? '');
		requireManageableSite(locals.user, siteId, t);
		detachSiteDomain(siteId);
		return { domainDetached: siteId };
	},
	registerDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const domain = normalizeDomain(String(form.get('domain') ?? ''));
		const meta = requireManageableSite(locals.user, siteId, t);
		requirePaidDomainAccess(locals.user, siteId, t);
		if (!validateDomain(domain)) {
			return fail(400, {
				domainMessage: t('dashboard.actions.invalidDomain'),
				siteId
			});
		}
		try {
			const availability = await checkDomainAvailability(domain);
			if (!availability.available) {
				return fail(409, {
					domainMessage: t('dashboard.actions.domainUnavailable'),
					siteId
				});
			}
			// Registration only ever happens after payment (constitution §5) —
			// requirePaidDomainAccess above is that gate.
			await registerDomain(domain);
			await createARecord(domain);
		} catch (err) {
			console.error(`[domains] direct registration failed for ${domain}:`, err);
			return fail(502, {
				domainMessage: t('dashboard.actions.registerManualReview'),
				siteId
			});
		}
		const attached = attachSiteDomain(siteId, domain, meta.ownerUserId);
		if (!attached.ok && attached.reason === 'domain-taken') {
			return fail(409, {
				domainMessage: t('dashboard.actions.domainAlreadyAttached'),
				siteId
			});
		}
		if (!attached.ok)
			return fail(404, { domainMessage: t('dashboard.actions.siteNotFound'), siteId });
		const provision = await provisionDomain(domain);
		if (provision.ran && !provision.ok) {
			console.error(`[domains] provisioning failed for ${domain}: ${provision.output}`);
		}
		return {
			domainAttached: domain,
			siteId,
			provision: provision.ran
				? provision.ok
					? t('dashboard.actions.registerSslReady')
					: t('dashboard.actions.registerPendingReview')
				: t('dashboard.actions.registerQueued')
		};
	}
};
