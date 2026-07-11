import { desc, eq, isNull, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { errorEvents } from '$lib/server/db/schema';

const redact = (value: string): string =>
	value
		.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
		.replace(/\b(?:sk|re|gsk|cfat)_[A-Za-z0-9_-]{12,}\b/g, '[redacted]')
		.slice(0, 6000);

export type ErrorContext = {
	source: string;
	route?: string;
	method?: string;
	status?: number;
	userId?: string | null;
	siteId?: string | null;
};

export function shouldRecordError(context: Pick<ErrorContext, 'status'>): boolean {
	// SvelteKit routes ordinary 404 misses through handleError. Public internet scanners
	// probe WordPress/.env/landing-page paths constantly, so storing 404s hides real incidents.
	return context.status !== 404;
}

export function recordError(error: unknown, context: ErrorContext): string {
	const id = `err-${crypto.randomUUID().slice(0, 8)}`;
	const normalized = error instanceof Error ? error : new Error(String(error));
	const row = {
		id,
		level: 'error',
		source: context.source,
		route: context.route ?? null,
		method: context.method ?? null,
		status: context.status ?? 500,
		userId: context.userId ?? null,
		siteId: context.siteId ?? null,
		errorName: normalized.name || 'Error',
		message: redact(normalized.message || 'Unknown error'),
		stack: normalized.stack ? redact(normalized.stack) : null,
		createdAt: new Date()
	};
	try {
		db.insert(errorEvents).values(row).run();
	} catch (logError) {
		console.error('[error-log] failed to persist', logError);
	}
	console.error(
		JSON.stringify({
			event: 'application_error',
			errorId: id,
			...context,
			errorName: row.errorName,
			message: row.message
		})
	);
	return id;
}

export function listRecentErrors(limit = 30) {
	return db
		.select()
		.from(errorEvents)
		.where(ne(errorEvents.status, 404))
		.orderBy(desc(errorEvents.createdAt))
		.limit(Math.min(Math.max(limit, 1), 100))
		.all();
}

export function unresolvedErrorCount(): number {
	return db
		.select()
		.from(errorEvents)
		.where(isNull(errorEvents.resolvedAt))
		.all()
		.filter((event) => event.status !== 404).length;
}

export function resolveError(id: string): boolean {
	return (
		db.update(errorEvents).set({ resolvedAt: new Date() }).where(eq(errorEvents.id, id)).run()
			.changes > 0
	);
}
