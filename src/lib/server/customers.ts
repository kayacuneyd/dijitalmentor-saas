import { desc, eq, isNotNull, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '$lib/server/db';
import { adminActions, aiGateLog, aiUsage, siteChatMessages, siteVersions, sites, users } from '$lib/server/db/schema';
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
	fullName: string | null;
	profession: string | null;
	city: string | null;
	locale: string | null;
	betaProfileCompletedAt: Date | null;
	lastSiteCreatedAt: Date | null;
	lastPublishedAt: Date | null;
	lastAiEditAt: Date | null;
	sites: (SiteMeta & {
		siteName: string;
		domain: string | null;
		plan: SiteSubscriptionState;
		chatCount: number;
		lastChatAt: Date | null;
		lastGateDecision: string | null;
	})[];
	submissions: ReturnType<typeof listSubmissionsForOwner>;
	actions: AdminActionRow[];
	tickets: SupportTicket[];
};

export function getCustomerDetail(userId: string): CustomerDetail | null {
	const user = db.select().from(users).where(eq(users.id, userId)).get();
	if (!user) return null;

	// Login activity from existing data
	const ownedSites = listSitesByOwner(userId);
	const siteIds = ownedSites.map((s) => s.id);
	const lastSiteCreatedAt =
		ownedSites.length > 0
			? ownedSites.reduce(
					(latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
					ownedSites[0].updatedAt
				)
			: null;
	const lastPublishedAt =
		siteIds.length > 0
			? db
					.select({ createdAt: siteVersions.createdAt })
					.from(siteVersions)
					.where(eq(siteVersions.siteId, siteIds[0]))
					.orderBy(desc(siteVersions.version))
					.limit(1)
					.get()?.createdAt ?? null
			: null;
	// Get max version across all user sites
	let maxPub: Date | null = null;
	for (const sid of siteIds) {
		const row = db
			.select({ createdAt: siteVersions.createdAt })
			.from(siteVersions)
			.where(eq(siteVersions.siteId, sid))
			.orderBy(desc(siteVersions.version))
			.limit(1)
			.get();
		if (row && (!maxPub || row.createdAt > maxPub)) maxPub = row.createdAt;
	}
	const lastAiEditAt =
		siteIds.length > 0
			? db
					.select({ createdAt: aiGateLog.createdAt })
					.from(aiGateLog)
					.where(eq(aiGateLog.siteId, siteIds[0]))
					.orderBy(desc(aiGateLog.createdAt))
					.limit(1)
					.get()?.createdAt ?? null
			: null;

	const sitesList = ownedSites.map((site) => {
		const chatCount = db
			.select({ n: sql<number>`count(*)` })
			.from(siteChatMessages)
			.where(eq(siteChatMessages.siteId, site.id))
			.get()?.n ?? 0;
		const lastChat = db
			.select({ createdAt: siteChatMessages.createdAt })
			.from(siteChatMessages)
			.where(eq(siteChatMessages.siteId, site.id))
			.orderBy(desc(siteChatMessages.createdAt))
			.limit(1)
			.get()?.createdAt ?? null;
		const lastGate = db
			.select({ decision: aiGateLog.decision })
			.from(aiGateLog)
			.where(eq(aiGateLog.siteId, site.id))
			.orderBy(desc(aiGateLog.createdAt))
			.limit(1)
			.get()?.decision ?? null;
		return {
			...site,
			plan: siteSubscriptionState(site.id, userId),
			domain: getDomainForSite(site.id),
			chatCount,
			lastChatAt: lastChat,
			lastGateDecision: lastGate
		};
	});

	return {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		hasStripeCustomer: Boolean(user.stripeCustomerId),
		fullName: user.fullName ?? null,
		profession: user.profession ?? null,
		city: user.city ?? null,
		locale: user.locale ?? null,
		betaProfileCompletedAt: user.betaProfileCompletedAt ?? null,
		lastSiteCreatedAt,
		lastPublishedAt: maxPub,
		lastAiEditAt,
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
