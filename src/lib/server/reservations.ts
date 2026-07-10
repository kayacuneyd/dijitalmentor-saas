import { randomUUID } from 'node:crypto';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { domainReservations } from '$lib/server/db/schema';
import { getSetting } from '$lib/server/config';
import {
	attachSiteDomain,
	checkDomainAvailability,
	createARecord,
	normalizeDomain,
	porkbunConfigured,
	provisionDomain,
	registerDomain,
	validateDomain
} from '$lib/server/domains';

/**
 * Domain reservations + hybrid payment (beta-launch spec). A reservation is the
 * pending-payment record; the actual domain pipeline in `domains.ts` runs ONLY
 * after payment is confirmed (operator for bank transfer, Stripe webhook for
 * card) — constitution §5. Fulfillment is decoupled from the confirm request
 * because it's a 120s+, partially-irreversible external sequence: `confirmPayment`
 * just flips status to `paid`; `fulfillReservation` is an idempotent, retryable
 * status machine invoked by the admin panel and the daily cron.
 */

export type PaymentMethod = 'bank_transfer' | 'stripe';
export type ReservationStatus =
	'pending' | 'manual_review' | 'paid' | 'registering' | 'active' | 'failed' | 'cancelled';

export type Reservation = typeof domainReservations.$inferSelect;

const LIVE_STATUSES: ReservationStatus[] = [
	'pending',
	'manual_review',
	'paid',
	'registering',
	'active'
];

export function domainPriceEur(): string {
	return getSetting('DOMAIN_PRICE_EUR') || '15';
}
export function domainPriceTry(): string {
	return getSetting('DOMAIN_PRICE_TRY') || '500';
}

export type PaymentMode = 'disabled' | 'bank_only' | 'hybrid' | 'stripe_only';
export function paymentMode(): PaymentMode {
	const mode = getSetting('PAYMENT_MODE');
	return mode === 'disabled' || mode === 'hybrid' || mode === 'stripe_only' ? mode : 'bank_only';
}

export function getReservation(id: string): Reservation | undefined {
	return db.select().from(domainReservations).where(eq(domainReservations.id, id)).get();
}

export function listReservationsByUser(userId: string): Reservation[] {
	return db
		.select()
		.from(domainReservations)
		.where(eq(domainReservations.userId, userId))
		.orderBy(desc(domainReservations.createdAt))
		.all();
}

export function listPendingReservations(): Reservation[] {
	return db
		.select()
		.from(domainReservations)
		.where(
			inArray(domainReservations.status, [
				'pending',
				'manual_review',
				'paid',
				'registering',
				'failed'
			])
		)
		.orderBy(desc(domainReservations.createdAt))
		.all();
}

export type CreateReservationResult =
	| { ok: true; reservation: Reservation }
	| { ok: false; reason: 'invalid-domain' | 'domain-taken' | 'bad-method' };

export function createReservation(input: {
	userId: string;
	siteId: string;
	domain: string;
	paymentMethod: PaymentMethod;
	initialStatus?: 'pending' | 'manual_review';
	operatorNotes?: string | null;
}): CreateReservationResult {
	const domain = normalizeDomain(input.domain);
	if (!validateDomain(domain)) return { ok: false, reason: 'invalid-domain' };
	if (input.paymentMethod !== 'bank_transfer' && input.paymentMethod !== 'stripe') {
		return { ok: false, reason: 'bad-method' };
	}
	// The partial unique index enforces one live reservation per domain, but check
	// first for a friendly error instead of a raw constraint failure.
	const existing = db
		.select({ status: domainReservations.status })
		.from(domainReservations)
		.where(eq(domainReservations.domain, domain))
		.all();
	if (existing.some((r) => LIVE_STATUSES.includes(r.status as ReservationStatus))) {
		return { ok: false, reason: 'domain-taken' };
	}
	const now = new Date();
	const reservation = {
		id: `res-${randomUUID().slice(0, 8)}`,
		userId: input.userId,
		siteId: input.siteId,
		domain,
		status: input.initialStatus ?? ('pending' as const),
		paymentMethod: input.paymentMethod,
		priceEur: domainPriceEur(),
		priceTry: domainPriceTry(),
		operatorNotes: input.operatorNotes ?? null,
		createdAt: now,
		paidAt: null,
		registeredAt: null,
		updatedAt: now
	};
	try {
		db.insert(domainReservations).values(reservation).run();
	} catch {
		return { ok: false, reason: 'domain-taken' };
	}
	return { ok: true, reservation };
}

export type CustomerDomainGateResult =
	| { status: 'available' }
	| { status: 'unavailable'; note: string }
	| { status: 'manual_review'; note: string };

function domainTld(domain: string): string {
	const labels = domain.split('.');
	if (labels.length >= 3 && labels.at(-2) === 'com' && labels.at(-1) === 'tr') return 'com.tr';
	return labels.at(-1) ?? '';
}

function configuredTlds(key: string, fallback: string[]): Set<string> {
	return new Set(
		(getSetting(key) ?? fallback.join(','))
			.split(',')
			.map((item) => item.trim().toLowerCase())
			.filter(Boolean)
	);
}

export async function customerDomainGate(domain: string): Promise<CustomerDomainGateResult> {
	const normalized = normalizeDomain(domain);
	if (!validateDomain(normalized)) return { status: 'unavailable', note: 'invalid syntax' };
	const existing = db
		.select({ status: domainReservations.status })
		.from(domainReservations)
		.where(eq(domainReservations.domain, normalized))
		.all();
	if (existing.some((r) => LIVE_STATUSES.includes(r.status as ReservationStatus))) {
		return { status: 'unavailable', note: 'live reservation/domain conflict' };
	}
	const tld = domainTld(normalized);
	const allowed = configuredTlds('DOMAIN_AUTO_TLDS', ['com', 'net', 'org', 'de', 'com.tr']);
	const manual = configuredTlds('DOMAIN_MANUAL_REVIEW_TLDS', []);
	if (manual.has(tld) || !allowed.has(tld)) {
		return { status: 'manual_review', note: `tld ${tld || '(unknown)'} requires manual review` };
	}
	if (!porkbunConfigured()) {
		return { status: 'manual_review', note: 'domain provider is not configured' };
	}
	try {
		const availability = await checkDomainAvailability(normalized);
		return availability.available
			? { status: 'available' }
			: { status: 'unavailable', note: 'provider reports unavailable' };
	} catch (error) {
		return {
			status: 'manual_review',
			note: `provider availability check failed: ${String(error)}`
		};
	}
}

function appendNote(id: string, note: string): void {
	const row = getReservation(id);
	if (!row) return;
	const stamped = `[${new Date().toISOString()}] ${note}`;
	db.update(domainReservations)
		.set({
			operatorNotes: row.operatorNotes ? `${row.operatorNotes}\n${stamped}` : stamped,
			updatedAt: new Date()
		})
		.where(eq(domainReservations.id, id))
		.run();
}

/** User self-report — a note only. Never confirms payment (constitution §5). */
export function reportBankTransfer(id: string, userId: string): boolean {
	const row = getReservation(id);
	if (!row || row.userId !== userId) return false;
	appendNote(id, 'user reported bank transfer made');
	return true;
}

/** Operator confirms money received → status paid (fast; fulfillment runs separately). */
export function confirmPayment(id: string): boolean {
	const row = getReservation(id);
	if (!row) return false;
	if (row.status === 'active' || row.status === 'registering') return true; // already moving
	db.update(domainReservations)
		.set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
		.where(eq(domainReservations.id, id))
		.run();
	appendNote(id, 'payment confirmed');
	return true;
}

export function rejectPayment(id: string, reason?: string): boolean {
	const row = getReservation(id);
	if (!row) return false;
	db.update(domainReservations)
		.set({ status: 'cancelled', updatedAt: new Date() })
		.where(eq(domainReservations.id, id))
		.run();
	appendNote(id, `rejected${reason ? `: ${reason}` : ''}`);
	return true;
}

export function cancelReservation(id: string, userId: string): boolean {
	const row = getReservation(id);
	if (!row || row.userId !== userId) return false;
	if (row.status === 'active' || row.status === 'registering') return false; // too late
	db.update(domainReservations)
		.set({ status: 'cancelled', updatedAt: new Date() })
		.where(eq(domainReservations.id, id))
		.run();
	return true;
}

export type FulfillResult =
	{ ok: true; status: 'active' } | { ok: false; status: 'failed' | 'skipped'; error: string };

/**
 * Register + point + provision + attach — idempotent and retryable.
 * Preconditions: status must be `paid` or `failed` (retry). Re-checks availability
 * before spending money. On any external failure the reservation lands on `failed`
 * (with a note) and can be retried; it never throws to the caller.
 */
export async function fulfillReservation(id: string): Promise<FulfillResult> {
	const row = getReservation(id);
	if (!row) return { ok: false, status: 'failed', error: 'reservation not found' };
	if (row.status === 'active') return { ok: true, status: 'active' };
	if (row.status !== 'paid' && row.status !== 'failed') {
		return { ok: false, status: 'skipped', error: `status is ${row.status}, expected paid/failed` };
	}
	if (!porkbunConfigured()) {
		return { ok: false, status: 'skipped', error: 'domain provider (Porkbun) not configured' };
	}

	db.update(domainReservations)
		.set({ status: 'registering', updatedAt: new Date() })
		.where(eq(domainReservations.id, id))
		.run();

	const fail = (error: string): FulfillResult => {
		db.update(domainReservations)
			.set({ status: 'failed', updatedAt: new Date() })
			.where(eq(domainReservations.id, id))
			.run();
		appendNote(id, `fulfillment failed: ${error}`);
		return { ok: false, status: 'failed', error };
	};

	try {
		const availability = await checkDomainAvailability(row.domain);
		if (!availability.available) return fail(`${row.domain} no longer available`);
		await registerDomain(row.domain);
		await createARecord(row.domain);
		const provision = await provisionDomain(row.domain);
		if (provision.ran && provision.ok === false) {
			return fail(`provisioning failed: ${provision.output?.slice(0, 200)}`);
		}
		const attached = attachSiteDomain(row.siteId, row.domain, row.userId);
		if (!attached.ok) return fail(`attach failed: ${attached.reason}`);
	} catch (error) {
		return fail(String(error));
	}

	db.update(domainReservations)
		.set({ status: 'active', registeredAt: new Date(), updatedAt: new Date() })
		.where(eq(domainReservations.id, id))
		.run();
	appendNote(id, 'fulfilled: domain registered and attached');
	return { ok: true, status: 'active' };
}

/** Daily cron: attempt fulfillment for every paid/failed reservation. Best-effort. */
export async function fulfillPendingReservations(): Promise<
	{ id: string; domain: string; status: string }[]
> {
	const rows = db
		.select()
		.from(domainReservations)
		.where(inArray(domainReservations.status, ['paid', 'failed']))
		.all();
	const results: { id: string; domain: string; status: string }[] = [];
	for (const row of rows) {
		const result = await fulfillReservation(row.id);
		results.push({ id: row.id, domain: row.domain, status: result.status });
	}
	return results;
}
