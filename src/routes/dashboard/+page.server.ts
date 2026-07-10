import { error, fail, redirect } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import {
	billingConfigured,
	createDomainCheckoutSession,
	hasActiveSiteSubscription,
	PRO_SITE_PRICE_EUR_MONTHLY,
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
	customerDomainGate,
	getReservation,
	listReservationsByUser,
	paymentMode,
	reportBankTransfer,
	type PaymentMethod
} from '$lib/server/reservations';
import { getSetting } from '$lib/server/config';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (!locals.user) redirect(303, '/login');
	const reservations = listReservationsByUser(locals.user.id);
	const sites = listSitesByOwner(locals.user.id).map((site) => ({
		...site,
		plan: siteSubscriptionState(site.id, locals.user!.id),
		canExport: locals.user!.isAdmin || hasActiveSiteSubscription(site.id, locals.user!.id),
		liveUrl: `${url.protocol}//${site.publicHandle ?? site.id}.${url.host}`,
		previewUrl: `/preview/${site.id}?locale=${site.defaultLocale}&source=persisted`,
		domain: getDomainForSite(site.id),
		messageCount: countSubmissions(site.id),
		reservation: reservations.find(
			(r) => r.siteId === site.id && r.status !== 'cancelled' && r.status !== 'active'
		)
	}));
	const subscription = subscriptionState(locals.user.id);
	return {
		user: locals.user,
		sites,
		subscription,
		subscribed: subscription.state !== 'free',
		billingConfigured: billingConfigured(),
		porkbunConfigured: porkbunConfigured(),
		proSitePriceEur: PRO_SITE_PRICE_EUR_MONTHLY,
		payment: {
			mode: paymentMode(),
			iban: getSetting('BANK_IBAN') ?? '',
			accountHolder: getSetting('BANK_ACCOUNT_HOLDER') ?? ''
		}
	};
};

function requireManageableSite(user: App.Locals['user'], siteId: string) {
	const meta = getSiteMeta(siteId);
	if (!meta) error(404, `Unknown site "${siteId}"`);
	if (!canManageSite(user, meta.ownerUserId)) {
		error(403, 'This site belongs to another account.');
	}
	return meta;
}

/** Custom domains are a paid feature (constitution §5: only ever after payment). */
function requirePaidDomainAccess(user: NonNullable<App.Locals['user']>, siteId: string) {
	if (!hasActiveSiteSubscription(siteId, user.id) && !user.isAdmin) {
		error(402, 'Custom domains need an active Pro subscription for this site.');
	}
}

export const actions: Actions = {
	publish: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const siteId = String((await request.formData()).get('siteId') ?? '');
		const meta = requireManageableSite(locals.user, siteId);
		if (!meta.publishedVersion) {
			return fail(400, {
				message:
					'İlk yayın yalnızca editörden yapılır. Böylece son taslak kaydedilip aynı gövdeyle yayınlanır.',
				siteId
			});
		}
		const handle = validatePublicHandle(meta.publicHandle ?? '');
		if (!handle.ok) {
			return fail(400, {
				message: 'Yayına almadan önce site adı ve public subdomain adımını tamamla.',
				siteId
			});
		}
		const draft = getDraft(siteId);
		if (!draft) return fail(404, { message: 'Site not found.', siteId });
		const quality = siteQualityCheck(draft);
		if (!quality.canPublish) {
			return fail(422, {
				message: quality.blockers[0]?.message ?? 'Yayın için kalite engelleri var.',
				siteId
			});
		}
		const version = publishDraft(siteId);
		if (version === null) return fail(404, { message: 'Site not found.' });
		return { published: siteId, version };
	},
	updateIdentity: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		requireManageableSite(locals.user, siteId);
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
			identityMessage: `${result.site.settings.siteName} için subdomain kaydedildi: ${result.publicHandle}.saaskaya.com`
		};
	},
	// --- domain reservation + hybrid payment (beta-launch spec) ---------------
	reserveDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		if (paymentMode() === 'disabled') {
			return fail(503, {
				domainMessage: 'Yeni domain satın alma kapalı beta süresince kullanılamıyor.'
			});
		}
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const domain = normalizeDomain(String(form.get('domain') ?? ''));
		const method = String(form.get('paymentMethod') ?? 'bank_transfer') as PaymentMethod;
		requireManageableSite(locals.user, siteId);
		if (!validateDomain(domain)) {
			return fail(400, {
				domainMessage: 'Bu geçerli bir domain adresine benzemiyor — örn. kendisiteniz.com',
				siteId
			});
		}
		const gate = await customerDomainGate(domain);
		if (gate.status === 'unavailable') {
			return fail(409, {
				domainMessage: 'Bu domain uygun değil. Başka bir ad dene.',
				siteId
			});
		}
		const result = createReservation({
			userId: locals.user.id,
			siteId,
			domain,
			paymentMethod: method,
			initialStatus: gate.status === 'manual_review' ? 'manual_review' : 'pending',
			operatorNotes: gate.status === 'manual_review' ? gate.note : null
		});
		if (!result.ok) {
			const msg =
				result.reason === 'domain-taken'
					? 'Bu domain zaten rezerve edilmiş.'
					: 'Domain rezerve edilemedi — adı kontrol edip tekrar dene.';
			return fail(result.reason === 'domain-taken' ? 409 : 400, { domainMessage: msg, siteId });
		}
		return {
			reserved: result.reservation.domain,
			siteId,
			domainMessage:
				gate.status === 'manual_review'
					? 'Bu domain manuel inceleme gerektiriyor. Sizinle iletişime geçeceğiz.'
					: 'Bu domain uygun. Bu site için Pro adımına devam edebilirsin.'
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
		const reservationId = String((await request.formData()).get('reservationId') ?? '');
		const reservation = getReservation(reservationId);
		if (!reservation || reservation.userId !== locals.user.id) {
			return fail(404, { message: 'Reservation not found.' });
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
		const siteId = String((await request.formData()).get('siteId') ?? '');
		requireManageableSite(locals.user, siteId);
		unpublishSite(siteId);
		return { unpublished: siteId };
	},
	deleteSite: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const confirmName = String(form.get('confirmName') ?? '');
		requireManageableSite(locals.user, siteId);
		const draft = getDraft(siteId);
		const expectedName = draft?.settings.siteName ?? '';
		if (!expectedName || confirmName !== expectedName) {
			return fail(400, { deleteMessage: 'Site adı eşleşmedi — silme iptal edildi.', siteId });
		}
		const result = await deleteSiteCascade(siteId);
		if (!result.ok) {
			const message =
				result.reason === 'reservation-in-progress'
					? 'Bu sitede devam eden bir domain rezervasyonu/kaydı var — önce onu çöz.'
					: 'Site bulunamadı.';
			return fail(409, { deleteMessage: message, siteId });
		}
		return { deleted: expectedName };
	},
	attachDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const domain = normalizeDomain(String(form.get('domain') ?? ''));
		const meta = requireManageableSite(locals.user, siteId);
		requirePaidDomainAccess(locals.user, siteId);
		if (!validateDomain(domain)) {
			return fail(400, {
				domainMessage: 'Bu geçerli bir domain adresine benzemiyor — örn. kendisiteniz.com',
				siteId
			});
		}
		const dns = await dnsPointsHere(domain);
		if (!dns.ok) {
			return fail(400, {
				domainMessage:
					'Domainin henüz bize yönlenmemiş. Domain sağlayıcının panelinden A kaydını sunucu IP adresimize yönlendirip tekrar dene.',
				siteId
			});
		}
		const attached = attachSiteDomain(siteId, domain, meta.ownerUserId);
		if (!attached.ok && attached.reason === 'domain-taken') {
			return fail(409, {
				domainMessage: 'Bu domain zaten başka bir siteye bağlı.',
				siteId
			});
		}
		if (!attached.ok) return fail(404, { domainMessage: 'Site bulunamadı.', siteId });
		const provision = await provisionDomain(domain);
		if (provision.ran && !provision.ok) {
			console.error(`[domains] provisioning failed for ${domain}: ${provision.output}`);
		}
		return {
			domainAttached: domain,
			siteId,
			provision: provision.ran
				? provision.ok
					? 'Güvenlik sertifikası hazırlandı — siten birkaç dakika içinde bu adreste açılır.'
					: 'Domain kaydedildi ancak kurulum tamamlanamadı — ekibimiz durumu inceliyor, bir işlem yapman gerekmiyor.'
				: 'Domain kaydedildi — kurulum ekibimiz tarafından tamamlanacak.'
		};
	},
	detachDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const siteId = String((await request.formData()).get('siteId') ?? '');
		requireManageableSite(locals.user, siteId);
		detachSiteDomain(siteId);
		return { domainDetached: siteId };
	},
	registerDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const domain = normalizeDomain(String(form.get('domain') ?? ''));
		const meta = requireManageableSite(locals.user, siteId);
		requirePaidDomainAccess(locals.user, siteId);
		if (!validateDomain(domain)) {
			return fail(400, {
				domainMessage: 'Bu geçerli bir domain adresine benzemiyor — örn. kendisiteniz.com',
				siteId
			});
		}
		try {
			const availability = await checkDomainAvailability(domain);
			if (!availability.available) {
				return fail(409, {
					domainMessage: 'Bu domain uygun değil. Başka bir ad dene.',
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
				domainMessage:
					'Domain kontrolü sırasında manuel inceleme gerektiren bir durum oluştu. Sizinle iletişime geçeceğiz.',
				siteId
			});
		}
		const attached = attachSiteDomain(siteId, domain, meta.ownerUserId);
		if (!attached.ok && attached.reason === 'domain-taken') {
			return fail(409, {
				domainMessage: 'Bu domain zaten başka bir siteye bağlı.',
				siteId
			});
		}
		if (!attached.ok) return fail(404, { domainMessage: 'Site bulunamadı.', siteId });
		const provision = await provisionDomain(domain);
		if (provision.ran && !provision.ok) {
			console.error(`[domains] provisioning failed for ${domain}: ${provision.output}`);
		}
		return {
			domainAttached: domain,
			siteId,
			provision: provision.ran
				? provision.ok
					? 'Domain tescil edildi ve siten bağlandı — birkaç dakika içinde bu adreste açılır.'
					: 'Domain tescil edildi ancak kurulum tamamlanamadı — ekibimiz durumu inceliyor, bir işlem yapman gerekmiyor.'
				: 'Domain tescil edildi — kurulum ekibimiz tarafından tamamlanacak.'
		};
	}
};
