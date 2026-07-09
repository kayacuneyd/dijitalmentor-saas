import { beforeEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';

vi.mock('$lib/server/ai/gatekeeper', () => ({ gateMessage: vi.fn() }));
vi.mock('$lib/server/ai/patch', () => ({ chatEdit: vi.fn() }));

import { POST } from './+server';
import { gateMessage } from '$lib/server/ai/gatekeeper';
import { chatEdit } from '$lib/server/ai/patch';
import { AIInvalidOutputError } from '$lib/server/ai/llm';
import { getMonthlyUsage } from '$lib/server/ai/usage';
import { clearSetting, setSetting } from '$lib/server/config';
import { db } from '$lib/server/db';
import { aiGateLog } from '$lib/server/db/schema';
import { getOrSeedDraft } from '$lib/server/db/repo';

const SITE_ID = 'seed-psych';
const user = { id: 'u-chat-test', email: 'chat-test@example.com', isAdmin: false };

const gateMock = vi.mocked(gateMessage);
const editMock = vi.mocked(chatEdit);
const gateUsage = { inputTokens: 10, outputTokens: 5 };

function call(body: unknown, locals: { user: typeof user | null } = { user }) {
	return POST({
		params: { siteId: SITE_ID },
		request: new Request(`http://localhost/api/sites/${SITE_ID}/chat`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		locals
	} as unknown as Parameters<typeof POST>[0]);
}

const tenantId = () => getOrSeedDraft(SITE_ID)!.tenantId;
const editCount = () => getMonthlyUsage(tenantId()).editCount;
const decisions = () =>
	db
		.select({ decision: aiGateLog.decision })
		.from(aiGateLog)
		.where(eq(aiGateLog.siteId, SITE_ID))
		.all()
		.map((r) => r.decision);

beforeEach(() => {
	vi.clearAllMocks();
	editMock.mockImplementation(async ({ site }) => ({
		site,
		reply: 'Yaptım.',
		usage: { inputTokens: 100, outputTokens: 50 }
	}));
});

describe('two-layer chat endpoint', () => {
	it('rejects anonymous users before any AI call', async () => {
		const res = await call({ message: 'merhaba' }, { user: null });
		expect(res.status).toBe(401);
		expect(gateMock).not.toHaveBeenCalled();
		expect(editMock).not.toHaveBeenCalled();
	});

	it('off-topic → redirect, zero Layer-2 calls, zero credits', async () => {
		gateMock.mockResolvedValue({
			gate: { intent: 'off_topic', reply: 'Bu konu sitenle ilgili değil.' },
			usage: gateUsage
		});
		const before = editCount();
		const res = await call({ message: 'dolar kuru kaç?' });
		const data = await res.json();
		expect(data).toMatchObject({ ok: true, kind: 'redirect' });
		expect(editMock).not.toHaveBeenCalled();
		expect(editCount()).toBe(before);
		expect(decisions()).toContain('redirected');
	});

	it('question → gate answers directly, zero Layer-2 calls', async () => {
		gateMock.mockResolvedValue({
			gate: { intent: 'question', reply: 'Üç sayfan var.' },
			usage: gateUsage
		});
		const data = await (await call({ message: 'kaç sayfam var?' })).json();
		expect(data).toMatchObject({ ok: true, kind: 'reply', reply: 'Üç sayfan var.' });
		expect(editMock).not.toHaveBeenCalled();
	});

	it('low-risk edit → auto-applies on the light model and spends 1 credit', async () => {
		gateMock.mockResolvedValue({
			gate: {
				intent: 'edit',
				reply: 'Başlığı değiştiriyorum.',
				distilledPrompt: 'Hero başlığını "Merhaba" yap.',
				riskLevel: 'low'
			},
			usage: gateUsage
		});
		const before = editCount();
		const data = await (await call({ message: 'başlığı Merhaba yap' })).json();
		expect(data).toMatchObject({ ok: true, kind: 'applied', reply: 'Yaptım.' });
		expect(data.site.id).toBe(SITE_ID);
		expect(editMock).toHaveBeenCalledWith(
			expect.objectContaining({
				model: 'deepseek-v4-flash',
				approvedPrompt: 'Hero başlığını "Merhaba" yap.'
			})
		);
		expect(editCount()).toBe(before + 1);
		expect(decisions()).toContain('auto_applied');
	});

	it('medium/high-risk edit → proposal only, no Layer-2 call yet', async () => {
		gateMock.mockResolvedValue({
			gate: {
				intent: 'edit',
				reply: 'Tema değişecek.',
				distilledPrompt: 'Tema renklerini sıcak tonlara çevir.',
				riskLevel: 'high'
			},
			usage: gateUsage
		});
		const before = editCount();
		const data = await (await call({ message: 'siteyi sıcak tonlara geçir' })).json();
		expect(data).toMatchObject({
			ok: true,
			kind: 'proposal',
			proposal: { riskLevel: 'high', distilledPrompt: 'Tema renklerini sıcak tonlara çevir.' }
		});
		expect(editMock).not.toHaveBeenCalled();
		expect(editCount()).toBe(before);
		expect(decisions()).toContain('proposed');
	});

	it('confirm (approvedPrompt) skips the gate and runs the heavy model', async () => {
		const before = editCount();
		const data = await (
			await call({
				message: 'siteyi sıcak tonlara geçir',
				approvedPrompt: 'Tema renklerini sıcak tonlara çevir.',
				riskLevel: 'high'
			})
		).json();
		expect(data).toMatchObject({ ok: true, kind: 'applied' });
		expect(gateMock).not.toHaveBeenCalled();
		expect(editMock).toHaveBeenCalledWith(
			expect.objectContaining({
				approvedPrompt: 'Tema renklerini sıcak tonlara çevir.',
				model: 'deepseek-v4-pro'
			})
		);
		expect(editCount()).toBe(before + 1);
		expect(decisions()).toContain('approved');
	});

	it('force skips the gate entirely (off-topic override, still costs a credit)', async () => {
		const before = editCount();
		const data = await (await call({ message: 'bunu yine de yap', force: true })).json();
		expect(data).toMatchObject({ ok: true, kind: 'applied' });
		expect(gateMock).not.toHaveBeenCalled();
		expect(editMock).toHaveBeenCalledWith(expect.objectContaining({ approvedPrompt: undefined }));
		expect(editCount()).toBe(before + 1);
		expect(decisions()).toContain('forced');
	});

	it('degrades to the single-layer path when the gate output is invalid', async () => {
		gateMock.mockRejectedValue(new AIInvalidOutputError('gate broke'));
		const data = await (await call({ message: 'başlığı düzelt' })).json();
		expect(data).toMatchObject({ ok: true, kind: 'applied' });
		expect(editMock).toHaveBeenCalledTimes(1);
		expect(decisions()).toContain('fallback');
	});

	it('returns 429 once the plan edit credits are spent', async () => {
		setSetting('AI_EDITS_FREE', String(editCount()));
		try {
			const res = await call({
				message: 'x',
				approvedPrompt: 'Bir şey değiştir.',
				riskLevel: 'medium'
			});
			expect(res.status).toBe(429);
			expect(editMock).not.toHaveBeenCalled();
		} finally {
			clearSetting('AI_EDITS_FREE');
		}
	});
});
