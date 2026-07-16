import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { gateMessage } from '$lib/server/ai/gatekeeper';
import { chatEdit } from '$lib/server/ai/patch';
import { RISK_LEVELS } from '$lib/server/ai/schemas';
import {
	AIInvalidOutputError,
	AIUnavailableError,
	QuotaExceededError,
	configuredAgentProvider,
	configuredModel,
	type TokenUsage
} from '$lib/server/ai/llm';
import { assertWithinQuota, recordUsage } from '$lib/server/ai/usage';
import { canManageSite } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { aiGateLog } from '$lib/server/db/schema';
import { getOrSeedDraft, getSiteMeta, saveDraft } from '$lib/server/db/repo';
import { appendChatMessage } from '$lib/server/chatLog';
import { appendToMemory, getSiteMemory, memoryPrompt } from '$lib/server/ai/memory';
import type { RequestHandler } from './$types';

/**
 * Two-layer chat (gatekeeper spec, revised 2026-07-08).
 * Stage 1 `{message, history?}`: Haiku gate classifies/distills → kinds
 *   redirect | reply | help (0 Layer-2 tokens), applied (low risk, auto), or
 *   proposal (medium/high risk — client shows the approval card).
 * Stage 2 `{message, approvedPrompt, riskLevel}`: stateless confirm → Layer 2.
 * `{message, force: true}`: user overrides an off-topic verdict — straight to Layer 2.
 * Every Layer-2 call costs 1 edit credit; gate calls are free (tokens backstop only).
 */

const bodySchema = z.object({
	message: z.string().trim().min(1).max(2000),
	history: z
		.array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().trim().max(2000) }))
		.max(12)
		.optional(),
	approvedPrompt: z.string().trim().min(1).max(4000).optional(),
	riskLevel: z.enum(RISK_LEVELS).optional(),
	force: z.boolean().optional()
});

const lightModel = () => configuredModel(configuredAgentProvider(), 'light');
const heavyModel = () => configuredModel(configuredAgentProvider(), 'heavy');
const totalTokens = (usage: TokenUsage) => usage.inputTokens + usage.outputTokens;

function logGate(row: {
	siteId: string;
	tenantId: string;
	intent: string;
	riskLevel?: string | null;
	decision: string;
	gateTokens?: number;
	agentTokens?: number;
	model?: string | null;
	provider?: string | null;
	fallbackUsed?: boolean;
}): void {
	db.insert(aiGateLog)
		.values({
			id: crypto.randomUUID(),
			siteId: row.siteId,
			tenantId: row.tenantId,
			intent: row.intent,
			riskLevel: row.riskLevel ?? null,
			decision: row.decision,
			gateTokens: row.gateTokens ?? 0,
			agentTokens: row.agentTokens ?? 0,
			model: row.model ?? null,
			provider: row.provider ?? null,
			fallbackUsed: row.fallbackUsed ?? false
		})
		.run();
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const site = getOrSeedDraft(params.siteId);
	if (!site) error(404, `Unknown site "${params.siteId}"`);
	const meta = getSiteMeta(params.siteId);
	// Audit fix (M6): anonymous users can never chat (token burn on ownerless demos).
	if (!locals.user || !canManageSite(locals.user, meta?.ownerUserId)) {
		return json(
			{ ok: false, message: 'Sign in as the site owner to edit this site.' },
			{ status: locals.user ? 403 : 401 }
		);
	}

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return json({ ok: false, message: 'Body must be JSON' }, { status: 400 });
	}
	const body = bodySchema.safeParse(raw);
	if (!body.success) {
		return json(
			{ ok: false, message: 'A non-empty message (max 2000 chars) is required.' },
			{ status: 400 }
		);
	}

	const tenantId = site.tenantId;
	const quotaOpts = { ownerUserId: meta?.ownerUserId, isAdmin: locals.user.isAdmin };
	const base = { siteId: site.id, tenantId };
	const memory = memoryPrompt(site.id);

	// Persist the user's turn once per incoming message — a confirm/force resend
	// carries the exact same `message` as its stage-1 send, so persisting those too
	// would duplicate it in the transcript.
	if (!body.data.approvedPrompt && !body.data.force) {
		appendChatMessage({ siteId: site.id, role: 'user', kind: 'chat', body: body.data.message });
	}

	// One Layer-2 run = the only thing that mutates the draft or spends a credit.
	const runAgent = async (opts: {
		approvedPrompt?: string;
		riskLevel?: string;
		decision: string;
		gateTokens?: number;
	}) => {
		assertWithinQuota(tenantId, { kind: 'edit', ...quotaOpts });
		const model = opts.riskLevel === 'low' ? lightModel() : heavyModel();
		const result = await chatEdit({
			site,
			message: body.data.message,
			approvedPrompt: opts.approvedPrompt,
			model,
			memory
		});
		recordUsage(tenantId, result.usage, 'edit');
		saveDraft(result.site);
		logGate({
			...base,
			intent: 'edit',
			riskLevel: opts.riskLevel ?? null,
			decision: opts.decision,
			gateTokens: opts.gateTokens,
			agentTokens: totalTokens(result.usage),
			model: result.model ?? model ?? heavyModel(),
			provider: result.provider ?? configuredAgentProvider(),
			fallbackUsed: result.fallbackUsed
		});
		appendChatMessage({ siteId: site.id, role: 'assistant', kind: 'applied', body: result.reply });
		// Append a memory note so the AI remembers this decision across sessions.
		appendToMemory(site.id, `${opts.decision === 'auto_applied' ? 'Auto-applied' : 'Applied'}: ${result.reply.slice(0, 200)}`).catch((e) => console.error('[memory] append failed:', e));
		return json({ ok: true, kind: 'applied', reply: result.reply, site: result.site });
	};

	try {
		// Stage 2: stateless confirm — the card the user approved comes back verbatim.
		if (body.data.approvedPrompt) {
			return await runAgent({
				approvedPrompt: body.data.approvedPrompt,
				riskLevel: body.data.riskLevel ?? 'medium',
				decision: 'approved'
			});
		}
		// Force: user insists after an off-topic redirect — costs a credit, logged.
		if (body.data.force) {
			return await runAgent({ decision: 'forced' });
		}

		// Stage 1: the gate. Its failure must never block editing — invalid gate
		// output degrades to the pre-gate single-layer path.
		assertWithinQuota(tenantId, quotaOpts); // token backstop; gate spends no credit
		let gate, gateUsage, gateProvider, gateModel, gateFallbackUsed;
		try {
			({
				gate,
				usage: gateUsage,
				provider: gateProvider,
				model: gateModel,
				fallbackUsed: gateFallbackUsed
			} = await gateMessage({
				site,
				message: body.data.message,
				history: body.data.history,
				memory
			}));
		} catch (err) {
			if (err instanceof AIInvalidOutputError) {
				return await runAgent({ decision: 'fallback' });
			}
			throw err;
		}
		recordUsage(tenantId, gateUsage);
		const gateTokens = totalTokens(gateUsage);
		const gateMeta = {
			provider: gateProvider,
			model: gateModel,
			fallbackUsed: gateFallbackUsed
		};

		if (gate.intent === 'off_topic') {
			logGate({ ...base, intent: gate.intent, decision: 'redirected', gateTokens, ...gateMeta });
			appendChatMessage({ siteId: site.id, role: 'assistant', kind: 'redirect', body: gate.reply });
			return json({ ok: true, kind: 'redirect', reply: gate.reply });
		}
		if (gate.intent === 'question') {
			logGate({ ...base, intent: gate.intent, decision: 'answered', gateTokens, ...gateMeta });
			appendChatMessage({ siteId: site.id, role: 'assistant', kind: 'reply', body: gate.reply });
			return json({ ok: true, kind: 'reply', reply: gate.reply });
		}
		if (gate.intent === 'help_request') {
			logGate({ ...base, intent: gate.intent, decision: 'help', gateTokens, ...gateMeta });
			appendChatMessage({ siteId: site.id, role: 'assistant', kind: 'help', body: gate.reply });
			return json({ ok: true, kind: 'help', reply: gate.reply });
		}

		// intent === 'edit' — fail fast on spent credits BEFORE proposing/applying.
		assertWithinQuota(tenantId, { kind: 'edit', ...quotaOpts });
		if (gate.riskLevel === 'low') {
			return await runAgent({
				approvedPrompt: gate.distilledPrompt,
				riskLevel: 'low',
				decision: 'auto_applied',
				gateTokens,
				...gateMeta
			});
		}
		logGate({
			...base,
			intent: 'edit',
			riskLevel: gate.riskLevel,
			decision: 'proposed',
			gateTokens,
			...gateMeta
		});
		return json({
			ok: true,
			kind: 'proposal',
			proposal: {
				distilledPrompt: gate.distilledPrompt,
				riskLevel: gate.riskLevel,
				reply: gate.reply
			}
		});
	} catch (err) {
		if (err instanceof QuotaExceededError) {
			return json({ ok: false, message: err.message }, { status: 429 });
		}
		if (err instanceof AIUnavailableError) {
			return json({ ok: false, message: err.message }, { status: 503 });
		}
		if (err instanceof AIInvalidOutputError) {
			return json({ ok: false, message: err.message }, { status: 422 });
		}
		throw err;
	}
};
