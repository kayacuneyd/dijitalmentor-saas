import { isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { createInquiry, validateInquiry } from '$lib/server/inquiries';
import { recordOnboardingEvent } from '$lib/server/onboarding/telemetry';
import { load } from './+page.server';

const admin = { id: 'admin-1', email: 'admin@saaskaya.com', isAdmin: true };
const nonAdmin = { id: 'user-1', email: 'user@example.com', isAdmin: false };

describe('GET /admin/gtm (load)', () => {
	it('redirects signed-out visitors and 403s non-admins', () => {
		try {
			load({ locals: { user: null } } as never);
			throw new Error('expected redirect');
		} catch (e) {
			expect(isRedirect(e)).toBe(true);
		}
		try {
			load({ locals: { user: nonAdmin } } as never);
			throw new Error('expected 403');
		} catch (e) {
			expect(isHttpError(e)).toBe(true);
			if (isHttpError(e)) expect(e.status).toBe(403);
		}
	});

	it('returns campaign funnel and lead triage summaries', () => {
		recordOnboardingEvent({
			event: 'started',
			pendingId: 'gtm-source',
			source: 'linkedin:gtm-30:psych'
		});
		recordOnboardingEvent({
			event: 'generation_succeeded',
			pendingId: 'gtm-source',
			source: 'linkedin:gtm-30:psych'
		});
		const parsed = validateInquiry({
			source: 'contact',
			name: 'Dr. Ada',
			email: `gtm-${crypto.randomUUID()}@example.com`,
			category: 'beta_access',
			message:
				'Psikolog olarak bu hafta canlıya çıkacak bir web sitesi ve .com domain istiyorum. Pro yıllık olabilir.',
			website: ''
		});
		if (!parsed.ok) throw new Error('expected valid inquiry');
		createInquiry(parsed.data);

		const result = load({ locals: { user: admin } } as never) as {
			sourceRows: { source: string; starts: number; generated: number }[];
			triaged: { triage: { category: string } }[];
		};

		expect(result.sourceRows.some((row) => row.source === 'linkedin:gtm-30:psych')).toBe(true);
		expect(
			result.sourceRows.find((row) => row.source === 'linkedin:gtm-30:psych')?.generated
		).toBeGreaterThanOrEqual(1);
		expect(result.triaged.some((item) => item.triage.category === 'hot_lead')).toBe(true);
	});
});
