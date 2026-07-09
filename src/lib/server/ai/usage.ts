import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { aiUsage } from '$lib/server/db/schema';
import { getSetting } from '$lib/server/config';
import { subscriptionState } from '$lib/server/billing';
import { QuotaExceededError, type TokenUsage } from './llm';

/**
 * AI budget accounting (gatekeeper spec, revised): plans are enforced in
 * CREDITS — one Layer-2 chat call = 1 edit, one site generation = 1 generation.
 * Gate calls and gate-answered questions are free. The raw token limit stays
 * only as an abuse backstop (huge sites / pathological loops).
 */

function intSetting(key: string, fallback: number): number {
	const parsed = Number(getSetting(key));
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Monthly per-tenant token backstop (input + output). Operator-overridable setting. */
export function monthlyTokenLimit(): number {
	return intSetting('AI_MONTHLY_TOKEN_LIMIT', 500_000);
}

export type CreditKind = 'edit' | 'generation';

/** Plan-tier credit limits (Free vs Pro; Premium arrives with Phase 2). */
export function creditLimits(ownerUserId?: string | null): { edit: number; generation: number } {
	const pro = ownerUserId ? subscriptionState(ownerUserId).state !== 'free' : false;
	return pro
		? { edit: intSetting('AI_EDITS_PRO', 50), generation: intSetting('AI_GENERATIONS_PRO', 5) }
		: { edit: intSetting('AI_EDITS_FREE', 10), generation: intSetting('AI_GENERATIONS_FREE', 1) };
}

/** The one place the `tenant-<userId>` id format is constructed. */
export function tenantIdForUser(userId: string): string {
	return `tenant-${userId}`;
}

/**
 * Real per-tenant monthly dollar cap — a safety net alongside the credit-count
 * limits above (which stay the customer-facing promise on /pricing). Guards
 * against actual $ cost drifting from the assumptions those counts were sized on
 * (provider price changes, unusually large sites/edits).
 */
export function tenantMonthlyBudgetMicrousd(ownerUserId?: string | null): number {
	const pro = ownerUserId ? subscriptionState(ownerUserId).state !== 'free' : false;
	const key = pro ? 'AI_BUDGET_PRO_USD' : 'AI_BUDGET_FREE_USD';
	const fallback = pro ? 4 : 1;
	const configured = Number(getSetting(key) || fallback);
	const usd = Number.isFinite(configured) && configured > 0 ? configured : fallback;
	return Math.round(usd * 1_000_000);
}

const currentMonth = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

export type MonthlyUsage = TokenUsage & {
	editCount: number;
	generationCount: number;
	estimatedCostMicrousd: number;
};

export function getMonthlyUsage(tenantId: string): MonthlyUsage {
	const row = db
		.select()
		.from(aiUsage)
		.where(and(eq(aiUsage.tenantId, tenantId), eq(aiUsage.month, currentMonth())))
		.get();
	return {
		inputTokens: row?.inputTokens ?? 0,
		outputTokens: row?.outputTokens ?? 0,
		editCount: row?.editCount ?? 0,
		generationCount: row?.generationCount ?? 0,
		estimatedCostMicrousd: row?.estimatedCostMicrousd ?? 0
	};
}

export function globalMonthlySpendMicrousd(): number {
	const result = db
		.select({
			total: sql<number>`coalesce(sum(${aiUsage.estimatedCostMicrousd}), 0)`
		})
		.from(aiUsage)
		.where(eq(aiUsage.month, currentMonth()))
		.get();
	return Number(result?.total ?? 0);
}

export function globalMonthlyBudgetMicrousd(): number {
	const configured = Number(getSetting('AI_GLOBAL_MONTHLY_BUDGET_USD') || 5);
	const usd = Number.isFinite(configured) && configured > 0 ? configured : 5;
	return Math.round(usd * 1_000_000);
}

export function recordUsage(tenantId: string, usage: TokenUsage, credit?: CreditKind): void {
	const editInc = credit === 'edit' ? 1 : 0;
	const generationInc = credit === 'generation' ? 1 : 0;
	db.insert(aiUsage)
		.values({
			tenantId,
			month: currentMonth(),
			inputTokens: usage.inputTokens,
			outputTokens: usage.outputTokens,
			editCount: editInc,
			generationCount: generationInc,
			estimatedCostMicrousd: usage.estimatedCostMicrousd ?? 0
		})
		.onConflictDoUpdate({
			target: [aiUsage.tenantId, aiUsage.month],
			set: {
				inputTokens: sql`${aiUsage.inputTokens} + ${usage.inputTokens}`,
				outputTokens: sql`${aiUsage.outputTokens} + ${usage.outputTokens}`,
				editCount: sql`${aiUsage.editCount} + ${editInc}`,
				generationCount: sql`${aiUsage.generationCount} + ${generationInc}`,
				estimatedCostMicrousd: sql`${aiUsage.estimatedCostMicrousd} + ${usage.estimatedCostMicrousd ?? 0}`
			}
		})
		.run();
}

export type TopUpGrant = { edits?: number; generations?: number; usdWaived?: number };

/**
 * Admin support gesture (/admin/customers): waives counted usage for the
 * current month via a signed-delta update — the same PK/upsert idiom as
 * `recordUsage`. Counters may go negative; every enforcement check above is a
 * `used >= limit` comparison, so a negative count simply reads as banked
 * headroom (no clamping needed for enforcement, only when *displaying* a
 * used-count, e.g. `Math.max(0, ...)`).
 */
export function grantAiTopUp(tenantId: string, grant: TopUpGrant): void {
	const edits = grant.edits ?? 0;
	const generations = grant.generations ?? 0;
	const microusd = Math.round((grant.usdWaived ?? 0) * 1_000_000);
	db.insert(aiUsage)
		.values({
			tenantId,
			month: currentMonth(),
			inputTokens: 0,
			outputTokens: 0,
			editCount: -edits,
			generationCount: -generations,
			estimatedCostMicrousd: -microusd
		})
		.onConflictDoUpdate({
			target: [aiUsage.tenantId, aiUsage.month],
			set: {
				editCount: sql`${aiUsage.editCount} - ${edits}`,
				generationCount: sql`${aiUsage.generationCount} - ${generations}`,
				estimatedCostMicrousd: sql`${aiUsage.estimatedCostMicrousd} - ${microusd}`
			}
		})
		.run();
}

/**
 * Gate every Layer-2 AI call. `kind` checks the plan's credit limit for the
 * site owner; the token backstop always applies. Admins bypass credit limits
 * (operator smoke tests must not burn plan quota) but not the backstop.
 */
export function assertWithinQuota(
	tenantId: string,
	opts: { kind?: CreditKind; ownerUserId?: string | null; isAdmin?: boolean } = {}
): void {
	const usage = getMonthlyUsage(tenantId);
	if (globalMonthlySpendMicrousd() >= globalMonthlyBudgetMicrousd()) {
		throw new QuotaExceededError(
			'The beta AI budget is used up for this month. Direct editor changes remain available.'
		);
	}
	if (usage.inputTokens + usage.outputTokens >= monthlyTokenLimit()) {
		throw new QuotaExceededError(
			'Monthly AI budget is used up for this site — it resets next month.'
		);
	}
	// Real-dollar backstop (not bypassed by isAdmin, same as the token backstop
	// above — admin smoke tests still spend real provider money).
	const tenantCapMicrousd = tenantMonthlyBudgetMicrousd(opts.ownerUserId);
	if (usage.estimatedCostMicrousd >= tenantCapMicrousd) {
		throw new QuotaExceededError(
			`This site's monthly AI $ cap ($${(tenantCapMicrousd / 1_000_000).toFixed(2)}) is reached — it resets next month. Direct text/color edits in the editor stay free.`
		);
	}
	if (!opts.kind || opts.isAdmin) return;
	const limits = creditLimits(opts.ownerUserId);
	const used = opts.kind === 'edit' ? usage.editCount : usage.generationCount;
	if (used >= limits[opts.kind]) {
		throw new QuotaExceededError(
			opts.kind === 'edit'
				? `Monthly AI edit limit reached (${limits.edit}) — it resets next month. Direct text/color edits in the editor stay free.`
				: `Monthly site generation limit reached (${limits.generation}) — it resets next month.`
		);
	}
}
