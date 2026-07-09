import { statfsSync, statSync, readdirSync } from 'node:fs';
import { gte, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { aiGateLog, customDomains, sites, users } from '$lib/server/db/schema';
import { hasActiveSubscription } from '$lib/server/billing';
import { detachSiteDomain } from '$lib/server/domains';
import { sendEmail } from '$lib/server/email';

/**
 * Ops (M6): health checks, operator status card, and the daily policy sweep
 * that enforces docs/POLICY.md (custom domains come off once the grace window
 * has passed — the site itself stays published on its subdomain).
 */

export function healthCheck(): { ok: boolean; checks: Record<string, string> } {
	const checks: Record<string, string> = {};
	let ok = true;
	try {
		db.run(sql`SELECT 1`);
		checks.db = 'ok';
	} catch (error) {
		checks.db = `fail: ${String(error).slice(0, 100)}`;
		ok = false;
	}
	try {
		const fs = statfsSync('/');
		const freePct = Math.round(((fs.bavail * 100) / fs.blocks) * 10) / 10;
		checks.disk = freePct < 10 ? `low: ${freePct}% free` : `ok (${freePct}% free)`;
		if (freePct < 5) ok = false;
	} catch {
		checks.disk = 'unknown';
	}
	return { ok, checks };
}

export type OpsStatus = {
	dbSizeBytes: number | null;
	diskFreePct: number | null;
	lastBackup: string | null;
	uptimeSeconds: number;
	counts: { sites: number; users: number };
};

export function opsStatus(): OpsStatus {
	let dbSizeBytes: number | null = null;
	try {
		dbSizeBytes = statSync(env.DATABASE_URL ?? 'local.db').size;
	} catch {
		/* :memory: in tests */
	}
	let diskFreePct: number | null = null;
	try {
		const fs = statfsSync('/');
		diskFreePct = Math.round(((fs.bavail * 100) / fs.blocks) * 10) / 10;
	} catch {
		/* unsupported platform */
	}
	let lastBackup: string | null = null;
	try {
		const files = readdirSync('/var/backups/saaskaya')
			.filter((f) => f.endsWith('.gz'))
			.sort();
		lastBackup = files.at(-1) ?? null;
	} catch {
		/* no backups yet */
	}
	const siteCount =
		db
			.select({ n: sql<number>`count(*)` })
			.from(sites)
			.get()?.n ?? 0;
	const userCount =
		db
			.select({ n: sql<number>`count(*)` })
			.from(users)
			.get()?.n ?? 0;
	return {
		dbSizeBytes,
		diskFreePct,
		lastBackup,
		uptimeSeconds: Math.round(process.uptime()),
		counts: { sites: siteCount, users: userCount }
	};
}

export type GateStats = {
	/** L2 calls avoided this month: redirected + answered + help + cancelled proposals. */
	blocked: number;
	/** L2 calls that ran: auto_applied + approved + forced + fallback. */
	agentRuns: number;
	proposed: number;
	approved: number;
	byDecision: Record<string, number>;
	gateTokens: number;
	agentTokens: number;
};

/** Gatekeeper telemetry for the current month — the admin Ops card's cost view. */
export function gateStats(): GateStats {
	const monthStart = new Date();
	monthStart.setUTCDate(1);
	monthStart.setUTCHours(0, 0, 0, 0);
	const rows = db
		.select({
			decision: aiGateLog.decision,
			n: sql<number>`count(*)`,
			gateTokens: sql<number>`coalesce(sum(${aiGateLog.gateTokens}), 0)`,
			agentTokens: sql<number>`coalesce(sum(${aiGateLog.agentTokens}), 0)`
		})
		.from(aiGateLog)
		.where(gte(aiGateLog.createdAt, monthStart))
		.groupBy(aiGateLog.decision)
		.all();
	const byDecision: Record<string, number> = {};
	let gateTokens = 0;
	let agentTokens = 0;
	for (const row of rows) {
		byDecision[row.decision] = row.n;
		gateTokens += row.gateTokens;
		agentTokens += row.agentTokens;
	}
	const count = (d: string) => byDecision[d] ?? 0;
	const proposed = count('proposed');
	const approved = count('approved');
	return {
		blocked:
			count('redirected') + count('answered') + count('help') + Math.max(0, proposed - approved),
		agentRuns: count('auto_applied') + approved + count('forced') + count('fallback'),
		proposed,
		approved,
		byDecision,
		gateTokens,
		agentTokens
	};
}

/**
 * Daily policy sweep: detach custom domains whose owner's paid access has fully
 * lapsed (grace included). Best-effort courtesy email; the sweep never throws.
 */
export async function sweepExpiredCustomDomains(): Promise<
	{ siteId: string; domain: string; ownerUserId: string }[]
> {
	const rows = db
		.select({
			siteId: customDomains.siteId,
			ownerUserId: customDomains.ownerUserId,
			domain: customDomains.hostname
		})
		.from(customDomains)
		.all();

	const swept: { siteId: string; domain: string; ownerUserId: string }[] = [];
	for (const row of rows) {
		if (!row.ownerUserId) continue; // seeds/demos never carry paid features
		if (hasActiveSubscription(row.ownerUserId)) continue;
		detachSiteDomain(row.siteId);
		swept.push({ siteId: row.siteId, domain: row.domain, ownerUserId: row.ownerUserId });
		const owner = db
			.select()
			.from(users)
			.where(sql`${users.id} = ${row.ownerUserId}`)
			.get();
		if (owner) {
			await sendEmail({
				to: owner.email,
				subject: `Custom domain removed: ${row.domain}`,
				text: `Your saaskaya subscription (incl. the grace period) has ended, so the custom domain ${row.domain} was detached per our cancellation policy.\n\nYour site stays published on its saaskaya subdomain, and you can export your data from the dashboard at any time. Re-subscribe to reattach the domain.`
			});
		}
	}
	return swept;
}
