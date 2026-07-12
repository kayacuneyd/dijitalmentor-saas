import { requireAdmin } from '$lib/server/auth';
import { listTriagedInquiries } from '$lib/server/inquiries';
import { weeklyOnboardingGtmSummary } from '$lib/server/onboarding/telemetry';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	const funnel = weeklyOnboardingGtmSummary();
	const sourceRows = Object.entries(funnel.bySource)
		.map(([source, events]) => {
			const starts = events.started ?? 0;
			const completed = events.completed ?? 0;
			const generated = events.generation_succeeded ?? 0;
			const editorOpened = events.editor_opened ?? 0;
			return {
				source,
				starts,
				completed,
				generated,
				editorOpened,
				completionPct: starts > 0 ? Math.round((completed / starts) * 1000) / 10 : null,
				previewPct: starts > 0 ? Math.round((generated / starts) * 1000) / 10 : null,
				editorOpenPct: starts > 0 ? Math.round((editorOpened / starts) * 1000) / 10 : null
			};
		})
		.sort((a, b) => b.starts - a.starts);

	const triaged = listTriagedInquiries({
		limit: 30,
		categories: ['hot_lead', 'beta_candidate', 'compliance_sensitive']
	}).map((item) => ({
		inquiry: item.inquiry,
		message: item.message,
		triage: item.triage
	}));

	const categoryCounts = triaged.reduce<Record<string, number>>((acc, item) => {
		acc[item.triage.category] = (acc[item.triage.category] ?? 0) + 1;
		return acc;
	}, {});

	return {
		funnel,
		sourceRows,
		triaged,
		categoryCounts
	};
};
