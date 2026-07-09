import { error, fail, redirect } from '@sveltejs/kit';
import { canManageSite } from '$lib/server/auth';
import {
	billingConfigured,
	createDomainCheckoutSession,
	hasActiveSubscription,
	subscriptionState
} from '$lib/server/billing';
import { countSubmissions } from '$lib/server/db/contact';
import { getSiteMeta, listSitesByOwner, publishDraft, unpublishSite } from '$lib/server/db/repo';
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
	domainPriceEur,
	domainPriceTry,
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
		liveUrl: `${url.protocol}//${site.id}.${url.host}`,
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
		payment: {
			mode: paymentMode(),
			priceEur: domainPriceEur(),
			priceTry: domainPriceTry(),
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
function requirePaidDomainAccess(user: NonNullable<App.Locals['user']>) {
	if (!hasActiveSubscription(user.id) && !user.isAdmin) {
		error(402, 'Custom domains need an active subscription.');
	}
}

export const actions: Actions = {
	publish: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const siteId = String((await request.formData()).get('siteId') ?? '');
		requireManageableSite(locals.user, siteId);
		const version = publishDraft(siteId);
		if (version === null) return fail(404, { message: 'Site not found.' });
		return { published: siteId, version };
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
			return fail(400, { domainMessage: 'That does not look like a valid domain.', siteId });
		}
		const result = createReservation({
			userId: locals.user.id,
			siteId,
			domain,
			paymentMethod: method
		});
		if (!result.ok) {
			const msg =
				result.reason === 'domain-taken'
					? 'That domain is already reserved.'
					: 'Could not reserve that domain.';
			return fail(result.reason === 'domain-taken' ? 409 : 400, { domainMessage: msg, siteId });
		}
		return { reserved: result.reservation.domain, siteId };
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
	attachDomain: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/login');
		const form = await request.formData();
		const siteId = String(form.get('siteId') ?? '');
		const domain = normalizeDomain(String(form.get('domain') ?? ''));
		const meta = requireManageableSite(locals.user, siteId);
		requirePaidDomainAccess(locals.user);
		if (!validateDomain(domain)) {
			return fail(400, { domainMessage: 'That does not look like a valid domain.', siteId });
		}
		const dns = await dnsPointsHere(domain);
		if (!dns.ok) {
			return fail(400, {
				domainMessage: `DNS does not point here yet (A record → ${dns.resolved?.join(', ') || 'none'}). Point it at the server IP first.`,
				siteId
			});
		}
		const attached = attachSiteDomain(siteId, domain, meta.ownerUserId);
		if (!attached.ok && attached.reason === 'domain-taken') {
			return fail(409, {
				domainMessage: 'That domain is already attached to another site.',
				siteId
			});
		}
		if (!attached.ok) return fail(404, { domainMessage: 'Site not found.', siteId });
		const provision = await provisionDomain(domain);
		return {
			domainAttached: domain,
			siteId,
			provision: provision.ran
				? provision.ok
					? 'TLS + vhost provisioned.'
					: `Provisioning failed: ${provision.output?.slice(0, 300)}`
				: 'Saved. Auto-provisioning is off (DOMAIN_PROVISION setting).'
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
		requirePaidDomainAccess(locals.user);
		if (!validateDomain(domain)) {
			return fail(400, { domainMessage: 'That does not look like a valid domain.', siteId });
		}
		try {
			const availability = await checkDomainAvailability(domain);
			if (!availability.available) {
				return fail(409, { domainMessage: `${domain} is not available.`, siteId });
			}
			// Registration only ever happens after payment (constitution §5) —
			// requirePaidDomainAccess above is that gate.
			await registerDomain(domain);
			await createARecord(domain);
		} catch (err) {
			return fail(502, { domainMessage: (err as Error).message, siteId });
		}
		const attached = attachSiteDomain(siteId, domain, meta.ownerUserId);
		if (!attached.ok && attached.reason === 'domain-taken') {
			return fail(409, {
				domainMessage: 'That domain is already attached to another site.',
				siteId
			});
		}
		if (!attached.ok) return fail(404, { domainMessage: 'Site not found.', siteId });
		const provision = await provisionDomain(domain);
		return {
			domainAttached: domain,
			siteId,
			provision: provision.ran
				? provision.ok
					? 'Registered, DNS set, TLS provisioned.'
					: `Registered; provisioning failed: ${provision.output?.slice(0, 300)}`
				: 'Registered and saved. Auto-provisioning is off.'
		};
	}
};
