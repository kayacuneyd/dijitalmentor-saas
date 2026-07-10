import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { computeAlerts } from './alerts';
import { getOrCreateUser } from './auth';
import { clearSetting, setSetting } from './config';
import { db } from './db';
import { aiUsage, users } from './db/schema';
import { recordError } from './error-log';
import { tenantIdForUser } from './ai/usage';

function setBilling(userId: string, status: string | null, endsAt: Date | null) {
	db.update(users)
		.set({ subscriptionStatus: status, subscriptionEndsAt: endsAt })
		.where(eq(users.id, userId))
		.run();
}

const currentMonth = () => new Date().toISOString().slice(0, 7);

describe('computeAlerts', () => {
	it('raises a warning then critical alert as global AI spend crosses 80%/100% of budget', () => {
		setSetting('AI_GLOBAL_MONTHLY_BUDGET_USD', '1');
		try {
			db.insert(aiUsage)
				.values({
					tenantId: 'tenant-alerts-global-test',
					month: currentMonth(),
					inputTokens: 0,
					outputTokens: 0,
					estimatedCostMicrousd: 850_000 // $0.85 of $1 = 85%
				})
				.onConflictDoUpdate({
					target: [aiUsage.tenantId, aiUsage.month],
					set: { estimatedCostMicrousd: 850_000 }
				})
				.run();
			let alerts = computeAlerts();
			expect(
				alerts.some((a) => a.severity === 'warning' && a.summary.includes('nearly exhausted'))
			).toBe(true);

			db.update(aiUsage)
				.set({ estimatedCostMicrousd: 1_200_000 })
				.where(eq(aiUsage.tenantId, 'tenant-alerts-global-test'))
				.run();
			alerts = computeAlerts();
			expect(alerts.some((a) => a.severity === 'critical' && a.summary.includes('exhausted'))).toBe(
				true
			);
		} finally {
			clearSetting('AI_GLOBAL_MONTHLY_BUDGET_USD');
		}
	});

	it('surfaces unresolved application errors', () => {
		const before = computeAlerts().find((a) => a.summary.includes('unresolved application error'));
		recordError(new Error('alerts-test-error'), { source: 'alerts-test' });
		const after = computeAlerts().find((a) => a.summary.includes('unresolved application error'));
		expect(after).toBeTruthy();
		expect(after?.severity).toBe('warning');
		if (before) expect(after?.summary).not.toBe(before.summary); // count went up
	});

	it('flags a customer near their monthly edit/generation cap', () => {
		const user = getOrCreateUser(`alerts-nearcap-${Date.now()}@example.com`);
		setSetting('AI_EDITS_FREE', '10');
		try {
			db.insert(aiUsage)
				.values({
					tenantId: tenantIdForUser(user.id),
					month: currentMonth(),
					inputTokens: 0,
					outputTokens: 0,
					editCount: 9 // 90% of 10
				})
				.onConflictDoUpdate({
					target: [aiUsage.tenantId, aiUsage.month],
					set: { editCount: 9 }
				})
				.run();
			const alerts = computeAlerts();
			expect(alerts.some((a) => a.summary.includes(user.email))).toBe(true);
		} finally {
			clearSetting('AI_EDITS_FREE');
		}
	});

	it('flags a customer whose grace window ends within 3 days, but not one ending later', () => {
		const soonUser = getOrCreateUser(`alerts-grace-soon-${Date.now()}@example.com`);
		// canceled 29 days ago with the default 30-day grace → ends tomorrow
		setBilling(soonUser.id, 'canceled', new Date(Date.now() - 29 * 86_400_000));

		const laterUser = getOrCreateUser(`alerts-grace-later-${Date.now()}@example.com`);
		// canceled 1 day ago → ends in ~29 days, not soon
		setBilling(laterUser.id, 'canceled', new Date(Date.now() - 1 * 86_400_000));

		const alerts = computeAlerts();
		expect(alerts.some((a) => a.summary.includes(soonUser.email))).toBe(true);
		expect(alerts.some((a) => a.summary.includes(laterUser.email))).toBe(false);
	});
});
