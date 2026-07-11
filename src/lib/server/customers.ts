import { desc, eq, isNotNull, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '$lib/server/db';
import { adminActions, aiUsage, sites, users } from '$lib/server/db/schema';
import {
	siteSubscriptionState,
	subscriptionState,
	type SiteSubscriptionState,
	type SubscriptionState
} from '$lib/server/billing';
import {
	creditLimits,
	getMonthlyUsage,
	tenantIdForUser,
	tenantMonthlyBudgetMicrousd,
	type MonthlyUsage
} from '$lib/server/ai/usage';
import { listSitesByOwner, type SiteMeta } from '$lib/server/db/repo';
import { getDomainForSite } from '$lib/server/domains';
import { listSubmissionsForOwner } from '$lib/server/db/contact';
import { listTicketsForUser, type SupportTicket } from '$lib/server/support';

/**
 * Admin-only reads for /admin/customers — deliberately separate from anything
 * `canManageSite`-gated. Super admins can also manage customer drafts through
 * the shared site guard for support and quality-control work.
 */

const currentMonth = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

const clampUsage = (usage: MonthlyUsage): MonthlyUsage => ({
	...usage,
	editCount: Math.max(0, usage.editCount),
	generationCount: Math.max(0, usage.generationCount),
	estimatedCostMicrousd: Math.max(0, usage.estimatedCostMicrousd)
});

export type CustomerSummary = {
	id: string;
	email: string;
	createdAt: Date;
	subscription: SubscriptionState;
	siteCount: number;
	proSiteCount: number;
	usage: MonthlyUsage;
	limits: { edit: number; generation: number };
	budgetUsd: number;
};

/** Every real customer (seeds never write into `users`, so none to exclude). */
export function listCustomers(): CustomerSummary[] {
	const rows = db.select().from(users).orderBy(desc(users.createdAt)).all();

	const siteCounts = db
		.select({ ownerUserId: sites.ownerUserId, n: sql<number>`count(*)` })
		.from(sites)
		.where(isNotNull(sites.ownerUserId))
		.groupBy(sites.ownerUserId)
		.all();
	const countByOwner = new Map(siteCounts.map((r) => [r.ownerUserId, r.n]));

	// One query for this month's usage across every tenant, matched back below —
	// avoids an N+1 join through `sites` (a user's multiple sites share ONE
	// ai_usage row keyed by their account tenant id, so joining through sites
	// would fan that row out once per site).
	const usageRows = db.select().from(aiUsage).where(eq(aiUsage.month, currentMonth())).all();
	const usageByTenant = new Map(usageRows.map((r) => [r.tenantId, r]));

	return rows.map((u) => {
		const usageRow = usageByTenant.get(tenantIdForUser(u.id));
		const ownedSites = listSitesByOwner(u.id);
		return {
			id: u.id,
			email: u.email,
			createdAt: u.createdAt,
			subscription: subscriptionState(u.id),
			siteCount: countByOwner.get(u.id) ?? 0,
			proSiteCount: ownedSites.filter(
				(site) => siteSubscriptionState(site.id, u.id).state !== 'free'
			).length,
			usage: clampUsage({
				inputTokens: usageRow?.inputTokens ?? 0,
				outputTokens: usageRow?.outputTokens ?? 0,
				editCount: usageRow?.editCount ?? 0,
				generationCount: usageRow?.generationCount ?? 0,
				estimatedCostMicrousd: usageRow?.estimatedCostMicrousd ?? 0
			}),
			limits: creditLimits(u.id),
			budgetUsd: tenantMonthlyBudgetMicrousd(u.id) / 1_000_000
		};
	});
}

export type AdminActionRow = {
	id: string;
	adminEmail: string;
	action: string;
	detail: string;
	createdAt: Date;
};

export type CustomerDetail = CustomerSummary & {
	/** True if a live Stripe subscription exists — overriding here won't cancel it. */
	hasStripeCustomer: boolean;
	sites: (SiteMeta & { siteName: string; domain: string | null; plan: SiteSubscriptionState })[];
	submissions: ReturnType<typeof listSubmissionsForOwner>;
	actions: AdminActionRow[];
	tickets: SupportTicket[];
};

export function getCustomerDetail(userId: string): CustomerDetail | null {
	const user = db.select().from(users).where(eq(users.id, userId)).get();
	if (!user) return null;
	const sitesList = listSitesByOwner(userId).map((site) => ({
		...site,
		plan: siteSubscriptionState(site.id, userId),
		domain: getDomainForSite(site.id)
	}));
	return {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		hasStripeCustomer: Boolean(user.stripeCustomerId),
		subscription: subscriptionState(userId),
		siteCount: sitesList.length,
		proSiteCount: sitesList.filter((site) => site.plan.state !== 'free').length,
		usage: clampUsage(getMonthlyUsage(tenantIdForUser(userId))),
		limits: creditLimits(userId),
		budgetUsd: tenantMonthlyBudgetMicrousd(userId) / 1_000_000,
		sites: sitesList,
		submissions: listSubmissionsForOwner(userId),
		actions: listAdminActions(userId),
		tickets: listTicketsForUser(userId)
	};
}

export function logAdminAction(
	adminEmail: string,
	targetUserId: string,
	action: string,
	detail: string
): void {
	db.insert(adminActions)
		.values({
			id: `aa-${randomUUID().slice(0, 8)}`,
			adminEmail,
			targetUserId,
			action,
			detail,
			createdAt: new Date()
		})
		.run();
}

export function listAdminActions(targetUserId: string): AdminActionRow[] {
	return db
		.select()
		.from(adminActions)
		.where(eq(adminActions.targetUserId, targetUserId))
		.orderBy(desc(adminActions.createdAt))
		.all();
}
