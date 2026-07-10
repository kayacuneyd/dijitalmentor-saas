import { requireAdmin } from '$lib/server/auth';
import { globalMonthlyBudgetMicrousd, globalMonthlySpendMicrousd } from '$lib/server/ai/usage';
import {
	aiSpendTrend,
	mrrEur,
	recentSignups,
	signupTrend,
	subscriberCounts
} from '$lib/server/revenue';
import { computeAlerts } from '$lib/server/alerts';
import { listActivityFeed } from '$lib/server/activity';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {
		mrr: mrrEur(),
		subscribers: subscriberCounts(),
		aiSpend: {
			usedUsd: globalMonthlySpendMicrousd() / 1_000_000,
			budgetUsd: globalMonthlyBudgetMicrousd() / 1_000_000
		},
		signupTrend: signupTrend(6),
		aiSpendTrend: aiSpendTrend(6),
		recentSignups: recentSignups(5),
		alerts: computeAlerts(),
		activity: listActivityFeed(80)
			.filter((item) => {
				if (item.kind !== 'error') return true;
				const summary = item.summary.toLowerCase();
				const route = item.detail?.toLowerCase() ?? '';
				if (summary.includes('not found:')) return false;
				if (summary.includes('cannot find module')) return false;
				return ![
					'/favicon.ico',
					'/favicon.png',
					'/ads.txt',
					'/app-ads.txt',
					'/sellers.json'
				].includes(route);
			})
			.slice(0, 12)
	};
};
