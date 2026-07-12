import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/domains', async (importActual) => {
	const actual = await importActual<typeof import('$lib/server/domains')>();
	return {
		...actual, // keep real normalizeDomain / validateDomain
		porkbunConfigured: vi.fn(() => true),
		checkDomainAvailability: vi.fn(async () => ({ available: true })),
		registerDomain: vi.fn(async () => {}),
		updateNameservers: vi.fn(async () => {}),
		provisionDomain: vi.fn(async () => ({ ran: false })),
		attachSiteDomain: vi.fn(() => ({ ok: true, hostname: 'x' }))
	};
});

vi.mock('$lib/server/cloudflare', () => ({
	cloudflareConfigured: vi.fn(() => true),
	defaultEmailLocalPart: vi.fn(() => 'info'),
	createOrGetZone: vi.fn(async () => ({
		id: 'zone-1',
		name: 'example.com',
		status: 'pending',
		nameServers: ['ada.ns.cloudflare.com', 'bob.ns.cloudflare.com']
	})),
	getZoneNameservers: vi.fn(async () => ['ada.ns.cloudflare.com', 'bob.ns.cloudflare.com']),
	createOrUpdateDnsRecord: vi.fn(async () => ({ id: 'dns-1' })),
	enableEmailRoutingDns: vi.fn(async () => {}),
	createDestinationAddress: vi.fn(async (email: string) => ({
		id: 'addr-1',
		email,
		verified: null
	})),
	createEmailRoutingRule: vi.fn(async () => ({ id: 'rule-1' })),
	getEmailRoutingStatus: vi.fn(async () => 'enabled')
}));

import * as cloudflare from '$lib/server/cloudflare';
import * as domains from '$lib/server/domains';
import { getOrCreateUser } from '$lib/server/auth';
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

let seq = 0;
const freshDomain = () => `res-test-${seq++}.example`;
const base = () => ({
	userId: getOrCreateUser(`reservation-${seq}@example.com`).id,
	siteId: 's-res'
});

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
	vi.clearAllMocks();
	clearSetting('PAYMENT_MODE');
	clearSetting('SERVER_IP');
});

describe('domain reservations', () => {
	it('supports explicitly disabling new-domain payments for closed beta', () => {
		setSetting('PAYMENT_MODE', 'disabled');
		expect(paymentMode()).toBe('disabled');
	});

	it('rejects an invalid domain and a bad payment method', () => {
		expect(
			createReservation({ ...base(), domain: 'not a domain', paymentMethod: 'bank_transfer' })
		).toEqual({ ok: false, reason: 'invalid-domain' });
		expect(
			createReservation({ ...base(), domain: freshDomain(), paymentMethod: 'paypal' as never })
		).toEqual({ ok: false, reason: 'bad-method' });
	});

	it('walks the bank-transfer lifecycle create→report→confirm→fulfill→active', async () => {
		setSetting('SERVER_IP', '203.0.113.10');
		const owner = base();
		const domain = freshDomain();
		const created = createReservation({ ...owner, domain, paymentMethod: 'bank_transfer' });
		expect(created.ok).toBe(true);
		if (!created.ok) return;
		const id = created.reservation.id;
		expect(created.reservation.status).toBe('pending');

		expect(reportBankTransfer(id, owner.userId)).toBe(true);
		expect(getReservation(id)?.operatorNotes).toContain('user reported bank transfer');

		expect(confirmPayment(id)).toBe(true);
		expect(getReservation(id)?.status).toBe('paid');

		const result = await fulfillReservation(id);
		expect(result).toEqual({ ok: true, status: 'active' });
		expect(getReservation(id)?.status).toBe('active');
		expect(domains.registerDomain).toHaveBeenCalledWith(domain);
		expect(domains.updateNameservers).toHaveBeenCalledWith(domain, [
			'ada.ns.cloudflare.com',
			'bob.ns.cloudflare.com'
		]);
		expect(cloudflare.createOrUpdateDnsRecord).toHaveBeenCalledWith({
			zoneId: 'zone-1',
			name: domain,
			type: 'A',
			content: '203.0.113.10',
			proxied: false
		});
		expect(cloudflare.createEmailRoutingRule).toHaveBeenCalledWith({
			zoneId: 'zone-1',
			domain,
			localPart: 'info',
			destinationEmail: expect.stringContaining('@example.com')
		});
		expect(domains.attachSiteDomain).toHaveBeenCalled();
	});

	it('report never confirms payment itself (constitution §5)', () => {
		const created = createReservation({
			...base(),
			domain: freshDomain(),
			paymentMethod: 'bank_transfer'
		});
		if (!created.ok) throw new Error('expected ok');
		reportBankTransfer(created.reservation.id, created.reservation.userId);
		expect(getReservation(created.reservation.id)?.status).toBe('pending'); // still pending
	});

	it('one live reservation per domain; a cancelled one does not block a retry', () => {
		const owner = base();
		const domain = freshDomain();
		const first = createReservation({ ...owner, domain, paymentMethod: 'bank_transfer' });
		expect(first.ok).toBe(true);
		const second = createReservation({ ...owner, domain, paymentMethod: 'bank_transfer' });
		expect(second).toEqual({ ok: false, reason: 'domain-taken' });

		if (first.ok) cancelReservation(first.reservation.id, owner.userId);
		const third = createReservation({ ...owner, domain, paymentMethod: 'bank_transfer' });
		expect(third.ok).toBe(true); // cancelled row freed the domain
	});

	it('fulfillment is idempotent and guards on status', async () => {
		setSetting('SERVER_IP', '203.0.113.10');
		const created = createReservation({
			...base(),
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
		setSetting('SERVER_IP', '203.0.113.10');
		vi.mocked(domains.checkDomainAvailability).mockResolvedValueOnce({ available: false });
		const created = createReservation({
			...base(),
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

	it('does not re-register a domain when retrying after a post-registration failure', async () => {
		setSetting('SERVER_IP', '203.0.113.10');
		vi.mocked(cloudflare.createOrUpdateDnsRecord).mockRejectedValueOnce(new Error('dns failed'));
		const created = createReservation({
			...base(),
			domain: freshDomain(),
			paymentMethod: 'bank_transfer'
		});
		if (!created.ok) throw new Error('expected ok');
		confirmPayment(created.reservation.id);

		const failed = await fulfillReservation(created.reservation.id);
		expect(failed.status).toBe('failed');
		expect(getReservation(created.reservation.id)?.registeredAt).toBeInstanceOf(Date);

		const retried = await fulfillReservation(created.reservation.id);
		expect(retried).toEqual({ ok: true, status: 'active' });
		expect(domains.registerDomain).toHaveBeenCalledTimes(1);
	});

	it('skips fulfillment when the domain provider is not configured', async () => {
		vi.mocked(domains.porkbunConfigured).mockReturnValueOnce(false);
		const created = createReservation({
			...base(),
			domain: freshDomain(),
			paymentMethod: 'stripe'
		});
		if (!created.ok) throw new Error('expected ok');
		confirmPayment(created.reservation.id);
		const result = await fulfillReservation(created.reservation.id);
		expect(result.status).toBe('skipped');
	});

	it('skips fulfillment when Cloudflare is not configured', async () => {
		vi.mocked(cloudflare.cloudflareConfigured).mockReturnValueOnce(false);
		const created = createReservation({
			...base(),
			domain: freshDomain(),
			paymentMethod: 'stripe'
		});
		if (!created.ok) throw new Error('expected ok');
		confirmPayment(created.reservation.id);
		const result = await fulfillReservation(created.reservation.id);
		expect(result.status).toBe('skipped');
	});

	it('reject cancels the reservation with a note', () => {
		const created = createReservation({
			...base(),
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
