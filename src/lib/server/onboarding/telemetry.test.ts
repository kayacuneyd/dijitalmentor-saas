import { describe, expect, it } from 'vitest';
import {
	hasEditorOpenedEvent,
	listRecentOnboardingEvents,
	onboardingFunnelSummary,
	recordOnboardingEvent,
	weeklyOnboardingGtmSummary
} from './telemetry';

describe('onboarding telemetry', () => {
	it('records privacy-safe funnel events without raw answers', () => {
		recordOnboardingEvent({
			event: 'started',
			pendingId: 'pending-telemetry',
			route: '/new',
			source: 'test'
		});
		recordOnboardingEvent({
			event: 'generation_succeeded',
			pendingId: 'pending-telemetry',
			userId: 'user-telemetry',
			siteId: 'site-telemetry',
			route: '/api/sites',
			durationMs: 1234
		});

		const rows = listRecentOnboardingEvents(10).filter(
			(row) => row.pendingId === 'pending-telemetry'
		);
		expect(rows.map((row) => row.event).sort()).toEqual(['generation_succeeded', 'started']);
		expect(JSON.stringify(rows)).not.toContain('Genç yetişkinler');
		expect(rows.find((row) => row.event === 'generation_succeeded')?.durationMs).toBe(1234);
	});

	it('summarizes preview reach from started and generation_succeeded events', () => {
		recordOnboardingEvent({ event: 'started', pendingId: 'pending-summary-a' });
		recordOnboardingEvent({ event: 'started', pendingId: 'pending-summary-b' });
		recordOnboardingEvent({
			event: 'generation_succeeded',
			pendingId: 'pending-summary-a',
			siteId: 'site-summary-a'
		});

		const summary = onboardingFunnelSummary();
		expect(summary.starts).toBeGreaterThanOrEqual(2);
		expect(summary.generated).toBeGreaterThanOrEqual(1);
		expect(summary.previewReachPct).not.toBeNull();
	});

	it('summarizes campaign sources for GTM reporting', () => {
		recordOnboardingEvent({
			event: 'started',
			pendingId: 'pending-source-a',
			source: 'linkedin:gtm-30:psych'
		});
		recordOnboardingEvent({
			event: 'completed',
			pendingId: 'pending-source-a',
			source: 'linkedin:gtm-30:psych'
		});
		recordOnboardingEvent({
			event: 'editor_opened',
			pendingId: 'pending-source-a',
			siteId: 'site-source-a',
			source: 'linkedin:gtm-30:psych'
		});

		const summary = weeklyOnboardingGtmSummary();
		expect(summary.bySource['linkedin:gtm-30:psych'].started).toBeGreaterThanOrEqual(1);
		expect(summary.bySource['linkedin:gtm-30:psych'].completed).toBeGreaterThanOrEqual(1);
		expect(summary.editorOpenPct).not.toBeNull();
	});

	it('detects whether a site already recorded editor_opened', () => {
		expect(hasEditorOpenedEvent('site-editor-opened')).toBe(false);
		recordOnboardingEvent({
			event: 'editor_opened',
			pendingId: 'pending-editor-opened',
			siteId: 'site-editor-opened'
		});
		expect(hasEditorOpenedEvent('site-editor-opened')).toBe(true);
	});
});
