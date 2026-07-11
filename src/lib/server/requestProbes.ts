import { createHash } from 'node:crypto';
import { desc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { requestProbeStats } from '$lib/server/db/schema';

export type RequestProbePattern =
	| 'wordpress'
	| 'secret-scan'
	| 'landing-probe'
	| 'random-short-path'
	| 'asset-miss'
	| 'unknown-404';

export type RequestProbeContext = {
	pathname: string;
	status?: number;
	userAgent?: string | null;
	clientAddress?: string | null;
};

function hashFingerprint(value: string | null | undefined): string | null {
	const normalized = value?.trim();
	if (!normalized) return null;
	return createHash('sha256').update(normalized.slice(0, 500)).digest('hex').slice(0, 16);
}

function clientPrefix(value: string | null | undefined): string | null {
	const first = value?.split(',')[0]?.trim();
	if (!first) return null;
	if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(first)) return first.split('.').slice(0, 3).join('.');
	if (first.includes(':')) return first.split(':').slice(0, 4).join(':');
	return first.slice(0, 24);
}

export function classifyRequestProbe(pathname: string): RequestProbePattern {
	const path = pathname.toLowerCase();
	if (
		path.includes('/.env') ||
		path.includes('/.git') ||
		path.includes('phpinfo.php') ||
		path.includes('config.php') ||
		path.includes('/backup')
	) {
		return 'secret-scan';
	}
	if (
		path.includes('wp-admin') ||
		path.includes('wp-login.php') ||
		path.includes('xmlrpc.php') ||
		path.includes('wlwmanifest.xml') ||
		path.includes('wp-includes') ||
		path.includes('/wordpress/') ||
		path.includes('/wp/')
	) {
		return 'wordpress';
	}
	if (path === '/favicon.ico' || path === '/favicon.png' || path.includes('apple-touch-icon')) {
		return 'asset-miss';
	}
	if (path === '/lander' || path.startsWith('/lander/')) return 'landing-probe';
	if (/^\/[a-z0-9]{6,12}\/?$/i.test(pathname)) return 'random-short-path';
	return 'unknown-404';
}

export function recordRequestProbe(context: RequestProbeContext): void {
	const now = new Date();
	const pattern = classifyRequestProbe(context.pathname);
	db.insert(requestProbeStats)
		.values({
			pattern,
			samplePath: context.pathname.slice(0, 300) || '/',
			status: context.status ?? 404,
			count: 1,
			firstSeenAt: now,
			lastSeenAt: now,
			lastUserAgentHash: hashFingerprint(context.userAgent),
			lastIpPrefixHash: hashFingerprint(clientPrefix(context.clientAddress))
		})
		.onConflictDoUpdate({
			target: requestProbeStats.pattern,
			set: {
				samplePath: context.pathname.slice(0, 300) || '/',
				status: context.status ?? 404,
				count: sql`${requestProbeStats.count} + 1`,
				lastSeenAt: now,
				lastUserAgentHash: hashFingerprint(context.userAgent),
				lastIpPrefixHash: hashFingerprint(clientPrefix(context.clientAddress))
			}
		})
		.run();
}

export function listRequestProbes(limit = 12) {
	return db
		.select()
		.from(requestProbeStats)
		.orderBy(desc(requestProbeStats.lastSeenAt))
		.limit(Math.min(Math.max(limit, 1), 50))
		.all();
}
