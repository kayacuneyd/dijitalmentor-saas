import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	adminActions,
	domainReservations,
	errorEvents,
	supportTicketMessages,
	supportTickets,
	users
} from '$lib/server/db/schema';
import { recentBillingEvents } from '$lib/server/billing';
import { listRecentOnboardingEvents } from '$lib/server/onboarding/telemetry';

/**
 * Eight heterogeneous sources, normalized and merged in JS (not a SQL UNION —
 * trivial cost at solo-operator scale, and it means the feed needs zero
 * changes as new event kinds are added to any one source).
 */
export type ActivityKind =
	| 'admin_action'
	| 'error'
	| 'site_generated'
	| 'signup'
	| 'domain_paid'
	| 'subscription_activated'
	| 'ticket_created'
	| 'ticket_reply';

export type ActivityItem = {
	kind: ActivityKind;
	at: Date;
	summary: string;
	detail?: string;
	userId?: string | null;
};

export function listActivityFeed(limit = 50): ActivityItem[] {
	const items: ActivityItem[] = [];

	for (const row of db
		.select()
		.from(adminActions)
		.orderBy(desc(adminActions.createdAt))
		.limit(limit)
		.all()) {
		items.push({
			kind: 'admin_action',
			at: row.createdAt,
			summary: `${row.adminEmail} · ${row.action}`,
			detail: row.detail,
			userId: row.targetUserId
		});
	}

	for (const row of db
		.select()
		.from(errorEvents)
		.orderBy(desc(errorEvents.createdAt))
		.limit(limit)
		.all()) {
		items.push({
			kind: 'error',
			at: row.createdAt,
			summary: `${row.errorName}: ${row.message}`,
			detail: row.route ?? undefined,
			userId: row.userId
		});
	}

	for (const row of listRecentOnboardingEvents(limit)) {
		if (row.event !== 'generation_succeeded') continue;
		items.push({
			kind: 'site_generated',
			at: row.createdAt,
			summary: 'New site generated',
			userId: row.userId
		});
	}

	for (const row of db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).all()) {
		items.push({
			kind: 'signup',
			at: row.createdAt,
			summary: `New signup: ${row.email}`,
			userId: row.id
		});
	}

	for (const row of db
		.select()
		.from(domainReservations)
		.orderBy(desc(domainReservations.createdAt))
		.limit(limit)
		.all()) {
		if (!row.paidAt) continue;
		items.push({
			kind: 'domain_paid',
			at: row.paidAt,
			summary: `Domain paid: ${row.domain}`,
			userId: row.userId
		});
	}

	for (const row of recentBillingEvents(limit)) {
		items.push({
			kind: 'subscription_activated',
			at: row.createdAt,
			summary: 'Subscription activated',
			userId: row.userId
		});
	}

	for (const row of db
		.select()
		.from(supportTickets)
		.orderBy(desc(supportTickets.createdAt))
		.limit(limit)
		.all()) {
		items.push({
			kind: 'ticket_created',
			at: row.createdAt,
			summary: `New ticket: ${row.subject}`,
			userId: row.userId
		});
	}

	// Only admin replies — the first message on every ticket is the customer's
	// opening message, already covered by `ticket_created` above.
	for (const row of db
		.select()
		.from(supportTicketMessages)
		.where(eq(supportTicketMessages.authorKind, 'admin'))
		.orderBy(desc(supportTicketMessages.createdAt))
		.limit(limit)
		.all()) {
		items.push({
			kind: 'ticket_reply',
			at: row.createdAt,
			summary: `Support replied to a ticket (${row.ticketId})`
		});
	}

	items.sort((a, b) => b.at.getTime() - a.at.getTime());
	return items.slice(0, limit);
}
