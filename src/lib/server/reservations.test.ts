import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/domains', async (importActual) => {
	const actual = await importActual<typeof import('$lib/server/domains')>();
	return {
		...actual, // keep real normalizeDomain / validateDomain
		porkbunConfigured: vi.fn(() => true),
		checkDomainAvailability: vi.fn(async () => ({ available: true })),
		registerDomain: vi.fn(async () => {}),
		createARecord: vi.fn(async () => {}),
		provisionDomain: vi.fn(async () => ({ ran: false })),
		attachSiteDomain: vi.fn(() => ({ ok: true, hostname: 'x' }))
	};
});

import * as domains from '$lib/server/domains';
import {
	cancelReservation,
	confirmPayment,
	createReservation,
	fulfillReservation,
	getReservation,
	paymentMode,
	reportBankTransfer,
	rejectPayment
} from './reservations';
import { clearSetting, setSetting } from './config';

const base = { userId: 'u-res', siteId: 's-res' };
let seq = 0;
const freshDomain = () => `res-test-${seq++}.example`;

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
	vi.clearAllMocks();
	clearSetting('PAYMENT_MODE');
});

describe('domain reservations', () => {
	it('supports explicitly disabling new-domain payments for closed beta', () => {
		setSetting('PAYMENT_MODE', 'disabled');
		expect(paymentMode()).toBe('disabled');
	});

	it('rejects an invalid domain and a bad payment method', () => {
		expect(
			createReservation({ ...base, domain: 'not a domain', paymentMethod: 'bank_transfer' })
		).toEqual({ ok: false, reason: 'invalid-domain' });
		expect(
			createReservation({ ...base, domain: freshDomain(), paymentMethod: 'paypal' as never })
		).toEqual({ ok: false, reason: 'bad-method' });
	});

	it('walks the bank-transfer lifecycle create→report→confirm→fulfill→active', async () => {
		const domain = freshDomain();
		const created = createReservation({ ...base, domain, paymentMethod: 'bank_transfer' });
		expect(created.ok).toBe(true);
		if (!created.ok) return;
		const id = created.reservation.id;
		expect(created.reservation.status).toBe('pending');

		expect(reportBankTransfer(id, base.userId)).toBe(true);
		expect(getReservation(id)?.operatorNotes).toContain('user reported bank transfer');

		expect(confirmPayment(id)).toBe(true);
		expect(getReservation(id)?.status).toBe('paid');

		const result = await fulfillReservation(id);
		expect(result).toEqual({ ok: true, status: 'active' });
		expect(getReservation(id)?.status).toBe('active');
		expect(domains.registerDomain).toHaveBeenCalledWith(domain);
		expect(domains.attachSiteDomain).toHaveBeenCalled();
	});

	it('report never confirms payment itself (constitution §5)', () => {
		const created = createReservation({
			...base,
			domain: freshDomain(),
			paymentMethod: 'bank_transfer'
		});
		if (!created.ok) throw new Error('expected ok');
		reportBankTransfer(created.reservation.id, base.userId);
		expect(getReservation(created.reservation.id)?.status).toBe('pending'); // still pending
	});

	it('one live reservation per domain; a cancelled one does not block a retry', () => {
		const domain = freshDomain();
		const first = createReservation({ ...base, domain, paymentMethod: 'bank_transfer' });
		expect(first.ok).toBe(true);
		const second = createReservation({ ...base, domain, paymentMethod: 'bank_transfer' });
		expect(second).toEqual({ ok: false, reason: 'domain-taken' });

		if (first.ok) cancelReservation(first.reservation.id, base.userId);
		const third = createReservation({ ...base, domain, paymentMethod: 'bank_transfer' });
		expect(third.ok).toBe(true); // cancelled row freed the domain
	});

	it('fulfillment is idempotent and guards on status', async () => {
		const created = createReservation({
			...base,
			domain: freshDomain(),
			paymentMethod: 'bank_transfer'
		});
		if (!created.ok) throw new Error('expected ok');
		const id = created.reservation.id;
		// still pending → skipped, no external calls
		const skipped = await fulfillReservation(id);
		expect(skipped.ok).toBe(false);
		expect(skipped.status).toBe('skipped');
		expect(domains.registerDomain).not.toHaveBeenCalled();

		confirmPayment(id);
		await fulfillReservation(id);
		const again = await fulfillReservation(id); // already active
		expect(again).toEqual({ ok: true, status: 'active' });
		expect(domains.registerDomain).toHaveBeenCalledTimes(1); // not re-registered
	});

	it('a failed fulfillment lands on failed and is retryable', async () => {
		vi.mocked(domains.checkDomainAvailability).mockResolvedValueOnce({ available: false });
		const created = createReservation({
			...base,
			domain: freshDomain(),
			paymentMethod: 'bank_transfer'
		});
		if (!created.ok) throw new Error('expected ok');
		const id = created.reservation.id;
		confirmPayment(id);

		const failed = await fulfillReservation(id);
		expect(failed.ok).toBe(false);
		expect(failed.status).toBe('failed');
		expect(getReservation(id)?.status).toBe('failed');

		// availability now returns true (default mock) → retry succeeds
		const retried = await fulfillReservation(id);
		expect(retried).toEqual({ ok: true, status: 'active' });
	});

	it('skips fulfillment when the domain provider is not configured', async () => {
		vi.mocked(domains.porkbunConfigured).mockReturnValueOnce(false);
		const created = createReservation({ ...base, domain: freshDomain(), paymentMethod: 'stripe' });
		if (!created.ok) throw new Error('expected ok');
		confirmPayment(created.reservation.id);
		const result = await fulfillReservation(created.reservation.id);
		expect(result.status).toBe('skipped');
	});

	it('reject cancels the reservation with a note', () => {
		const created = createReservation({
			...base,
			domain: freshDomain(),
			paymentMethod: 'bank_transfer'
		});
		if (!created.ok) throw new Error('expected ok');
		expect(rejectPayment(created.reservation.id, 'no proof')).toBe(true);
		const row = getReservation(created.reservation.id);
		expect(row?.status).toBe('cancelled');
		expect(row?.operatorNotes).toContain('no proof');
	});
});
