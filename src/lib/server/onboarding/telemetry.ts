import { desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { onboardingEvents } from '$lib/server/db/schema';

export const ONBOARDING_EVENTS = [
	'started',
	'answer_saved',
	'completed',
	'generation_started',
	'generation_succeeded',
	'generation_failed',
	'editor_opened'
] as const;

export type OnboardingEventName = (typeof ONBOARDING_EVENTS)[number];

export type RecordOnboardingEventInput = {
	event: OnboardingEventName;
	pendingId?: string | null;
	userId?: string | null;
	siteId?: string | null;
	route?: string | null;
	source?: string | null;
	durationMs?: number | null;
	errorId?: string | null;
};

export function recordOnboardingEvent(input: RecordOnboardingEventInput): void {
	db.insert(onboardingEvents)
		.values({
			id: `onb-${crypto.randomUUID().slice(0, 10)}`,
			pendingId: input.pendingId ?? null,
			userId: input.userId ?? null,
			siteId: input.siteId ?? null,
			event: input.event,
			route: input.route ?? null,
			source: input.source ?? null,
			durationMs: input.durationMs ?? null,
			errorId: input.errorId ?? null,
			createdAt: new Date()
		})
		.run();
}

export function listRecentOnboardingEvents(limit = 30) {
	return db
		.select()
		.from(onboardingEvents)
		.orderBy(desc(onboardingEvents.createdAt))
		.limit(Math.min(Math.max(limit, 1), 100))
		.all();
}

export function onboardingFunnelSummary() {
	const rows = db
		.select({ event: onboardingEvents.event, n: sql<number>`count(*)` })
		.from(onboardingEvents)
		.groupBy(onboardingEvents.event)
		.all();
	const byEvent = Object.fromEntries(rows.map((row) => [row.event, row.n])) as Record<
		string,
		number
	>;
	const starts = byEvent.started ?? 0;
	const generated = byEvent.generation_succeeded ?? 0;
	return {
		byEvent,
		starts,
		generated,
		previewReachPct: starts > 0 ? Math.round((generated / starts) * 1000) / 10 : null
	};
}

export function hasEditorOpenedEvent(siteId: string): boolean {
	return db
		.select()
		.from(onboardingEvents)
		.where(eq(onboardingEvents.siteId, siteId))
		.all()
		.some((event) => event.event === 'editor_opened');
}
