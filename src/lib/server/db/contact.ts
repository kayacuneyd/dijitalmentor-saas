import { desc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from './index';
import { contactSubmissions } from './schema';
import type { Locale } from '$lib/schema/site';

/** Contact-form submissions from published sites (PLAN §7): always stored, email is best-effort. */

export function addSubmission(input: {
	siteId: string;
	name: string;
	email: string;
	message: string;
	locale: Locale;
}) {
	const id = `msg-${randomUUID().slice(0, 8)}`;
	db.insert(contactSubmissions)
		.values({ id, ...input, createdAt: new Date() })
		.run();
	return id;
}

export function listSubmissions(siteId: string) {
	return db
		.select()
		.from(contactSubmissions)
		.where(eq(contactSubmissions.siteId, siteId))
		.orderBy(desc(contactSubmissions.createdAt))
		.all();
}

export function countSubmissions(siteId: string): number {
	const row = db
		.select({ n: sql<number>`count(*)` })
		.from(contactSubmissions)
		.where(eq(contactSubmissions.siteId, siteId))
		.get();
	return row?.n ?? 0;
}
