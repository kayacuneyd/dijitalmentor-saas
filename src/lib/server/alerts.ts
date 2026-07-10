import { globalMonthlyBudgetMicrousd, globalMonthlySpendMicrousd } from '$lib/server/ai/usage';
import { unresolvedErrorCount } from '$lib/server/error-log';
import { healthCheck } from '$lib/server/ops';
import { listCustomers } from '$lib/server/customers';
import { unresolvedTicketCount } from '$lib/server/support';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type Alert = {
	severity: AlertSeverity;
	summary: string;
	detail?: string;
};

const THREE_DAYS_MS = 3 * 86_400_000;

/** Threshold-based operator alerts — same 80%/100% split as `account/+page.svelte`'s spendTone. */
export function computeAlerts(): Alert[] {
	const alerts: Alert[] = [];

	const health = healthCheck();
	if (!health.ok) {
		alerts.push({
			severity: 'critical',
			summary: 'System health check failing',
			detail: Object.entries(health.checks)
				.filter(([, v]) => !v.startsWith('ok'))
				.map(([k, v]) => `${k}: ${v}`)
				.join(', ')
		});
	}

	const budget = globalMonthlyBudgetMicrousd();
	const spend = globalMonthlySpendMicrousd();
	if (budget > 0) {
		const ratio = spend / budget;
		if (ratio >= 1) {
			alerts.push({
				severity: 'critical',
				summary: 'Global AI budget exhausted this month',
				detail: `$${(spend / 1_000_000).toFixed(2)} / $${(budget / 1_000_000).toFixed(2)}`
			});
		} else if (ratio >= 0.8) {
			alerts.push({
				severity: 'warning',
				summary: 'Global AI budget nearly exhausted',
				detail: `$${(spend / 1_000_000).toFixed(2)} / $${(budget / 1_000_000).toFixed(2)}`
			});
		}
	}

	const unresolved = unresolvedErrorCount();
	if (unresolved > 0) {
		alerts.push({
			severity: 'warning',
			summary: `${unresolved} unresolved application error(s)`
		});
	}

	const openTickets = unresolvedTicketCount();
	if (openTickets > 0) {
		alerts.push({
			severity: 'info',
			summary: `${openTickets} open support ticket(s) awaiting a reply`
		});
	}

	const customers = listCustomers();
	const nearCap = customers
		.map((c) => {
			const editRatio = c.limits.edit > 0 ? c.usage.editCount / c.limits.edit : 0;
			const genRatio = c.limits.generation > 0 ? c.usage.generationCount / c.limits.generation : 0;
			const budgetRatio =
				c.budgetUsd > 0 ? c.usage.estimatedCostMicrousd / 1_000_000 / c.budgetUsd : 0;
			return { customer: c, ratio: Math.max(editRatio, genRatio, budgetRatio) };
		})
		.filter((x) => x.ratio >= 0.8)
		.sort((a, b) => b.ratio - a.ratio)
		.slice(0, 10);
	for (const { customer, ratio } of nearCap) {
		alerts.push({
			severity: ratio >= 1 ? 'critical' : 'warning',
			summary: `${customer.email} is near this month's usage cap`,
			detail: `${Math.round(ratio * 100)}% of edit/generation/budget limit`
		});
	}

	const now = Date.now();
	for (const customer of customers) {
		if (customer.subscription.state !== 'grace') continue;
		const msLeft = customer.subscription.until.getTime() - now;
		if (msLeft > 0 && msLeft <= THREE_DAYS_MS) {
			alerts.push({
				severity: 'info',
				summary: `${customer.email}'s grace window ends soon`,
				detail: `ends ${customer.subscription.until.toLocaleDateString()}`
			});
		}
	}

	return alerts;
}
