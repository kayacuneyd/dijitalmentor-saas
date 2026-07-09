import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_GATEKEEPER_MODEL, gateMessage, siteOutline } from './gatekeeper';
import { gateSchema } from './schemas';
import { AIInvalidOutputError, type ToolCallResult } from './llm';
import { seedSites } from '$lib/seed';

const site = () => structuredClone(seedSites.psych);

const asResult = (input: unknown): ToolCallResult => ({
	input,
	toolUseId: 'toolu_gate',
	assistantContent: [],
	usage: { inputTokens: 30, outputTokens: 20 }
});

describe('gateSchema', () => {
	it('accepts a complete edit verdict', () => {
		const parsed = gateSchema.safeParse({
			intent: 'edit',
			reply: 'Başlığı güncelliyorum.',
			distilledPrompt: 'Ana sayfa hero başlığını "Hoş geldiniz" yap (tüm dillerde).',
			riskLevel: 'low'
		});
		expect(parsed.success).toBe(true);
	});

	it.each(['question', 'off_topic', 'help_request'] as const)(
		'accepts %s with a reply and no edit fields',
		(intent) => {
			expect(gateSchema.safeParse({ intent, reply: 'Cevap.' }).success).toBe(true);
		}
	);

	it('rejects an edit without distilledPrompt or riskLevel', () => {
		expect(
			gateSchema.safeParse({ intent: 'edit', reply: 'Tamam.', riskLevel: 'low' }).success
		).toBe(false);
		expect(
			gateSchema.safeParse({ intent: 'edit', reply: 'Tamam.', distilledPrompt: 'X yap.' }).success
		).toBe(false);
	});

	it('rejects unknown intents and risk levels', () => {
		expect(gateSchema.safeParse({ intent: 'spam', reply: 'x' }).success).toBe(false);
		expect(
			gateSchema.safeParse({
				intent: 'edit',
				reply: 'x',
				distilledPrompt: 'y',
				riskLevel: 'extreme'
			}).success
		).toBe(false);
	});
});

describe('siteOutline', () => {
	it('summarizes structure without leaking full content JSON', () => {
		const outline = siteOutline(site());
		expect(outline).toContain('home');
		expect(outline).toContain('hero');
		// tiny vs the full draft — the whole point of the gate's cheap input
		expect(outline.length).toBeLessThan(JSON.stringify(site()).length / 10);
	});
});

describe('gateMessage', () => {
	it('runs on the gatekeeper model with the outline, not the site JSON', async () => {
		const run = vi.fn(async (req) => {
			expect(req.model).toBe(DEFAULT_GATEKEEPER_MODEL);
			expect(req.tool.name).toBe('gate_message');
			const text = String((req.messages[0] as { content: string }).content);
			expect(text).not.toContain('"sections"'); // no raw draft JSON
			expect(text).toContain('User message:');
			return asResult({ intent: 'off_topic', reply: 'Bu konuda yardımcı olamam.' });
		});
		const { gate, usage } = await gateMessage(
			{ site: site(), message: 'bugün maç kaçta?' },
			{ run }
		);
		expect(gate.intent).toBe('off_topic');
		expect(usage).toEqual({ inputTokens: 30, outputTokens: 20 });
		expect(run).toHaveBeenCalledTimes(1);
	});

	it('folds recent history into the gate input', async () => {
		const run = vi.fn(async (req) => {
			expect(String((req.messages[0] as { content: string }).content)).toContain(
				'assistant: Rengi değiştirdim.'
			);
			return asResult({ intent: 'question', reply: 'Üç sayfan var.' });
		});
		const { gate } = await gateMessage(
			{
				site: site(),
				message: 'kaç sayfam var?',
				history: [
					{ role: 'user', text: 'rengi değiştir' },
					{ role: 'assistant', text: 'Rengi değiştirdim.' }
				]
			},
			{ run }
		);
		expect(gate.intent).toBe('question');
	});

	it('repairs once on invalid output and sums usage', async () => {
		const run = vi
			.fn()
			.mockResolvedValueOnce(asResult({ intent: 'edit', reply: 'eksik' })) // no distilledPrompt
			.mockResolvedValueOnce(
				asResult({
					intent: 'edit',
					reply: 'Tamam.',
					distilledPrompt: 'Hero başlığını değiştir.',
					riskLevel: 'low'
				})
			);
		const { gate, usage } = await gateMessage(
			{ site: site(), message: 'başlığı değiştir' },
			{ run }
		);
		expect(run).toHaveBeenCalledTimes(2);
		expect(gate.intent).toBe('edit');
		expect(usage).toEqual({ inputTokens: 60, outputTokens: 40 });
	});

	it('throws AIInvalidOutputError when the repair also fails', async () => {
		const run = vi.fn().mockResolvedValue(asResult({ intent: 'edit', reply: 'hâlâ eksik' }));
		await expect(
			gateMessage({ site: site(), message: 'başlığı değiştir' }, { run })
		).rejects.toBeInstanceOf(AIInvalidOutputError);
		expect(run).toHaveBeenCalledTimes(2);
	});
});
