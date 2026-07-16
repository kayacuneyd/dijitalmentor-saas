import { and, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { siteSubscriptions, users } from '$lib/server/db/schema';

export type PlanTier = 'free' | 'pro' | 'premium';

/** Purely local entitlement read; payment status is still finalized by billing webhooks. */
export function planTierForUser(userId: string): PlanTier {
	const row = db
		.select({ plan: users.plan, subscriptionStatus: users.subscriptionStatus })
		.from(users)
		.where(eq(users.id, userId))
		.get();
	if (row?.plan === 'premium') return 'premium';
	const activeSite = db
		.select({ id: siteSubscriptions.siteId })
		.from(siteSubscriptions)
		.where(
			and(
				eq(siteSubscriptions.userId, userId),
				inArray(siteSubscriptions.status, ['active', 'trialing'])
			)
		)
		.get();
	if (
		row?.plan === 'pro' ||
		Boolean(activeSite) ||
		row?.subscriptionStatus === 'active' ||
		row?.subscriptionStatus === 'trialing'
	) {
		return 'pro';
	}
	return 'free';
}
