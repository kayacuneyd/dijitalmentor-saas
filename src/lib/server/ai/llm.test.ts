import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSetting, setSetting } from '$lib/server/config';
import {
	AIProviderRejectedRequestError,
	AIUnavailableError,
	configuredGatekeeperFallbackProvider,
	configuredAgentProvider,
	configuredGatekeeperProvider,
	configuredModel,
	estimateCostMicrousd,
	runToolCall
} from './llm';

afterEach(() => {
	for (const key of [
		'AI_PROVIDER',
		'GATEKEEPER_PROVIDER',
		'GATEKEEPER_FALLBACK_PROVIDER',
		'GROQ_API_KEY',
		'GROQ_MODEL',
		'DEEPSEEK_MODEL_LIGHT',
		'DEEPSEEK_MODEL_HEAVY'
	]) {
		clearSetting(key);
	}
	vi.unstubAllGlobals();
});

describe('LLM provider routing', () => {
	it('marks provider structured-request rejection as an unavailable subtype', () => {
		const error = new AIProviderRejectedRequestError('rejected');
		expect(error).toBeInstanceOf(AIProviderRejectedRequestError);
		expect(error).toBeInstanceOf(AIUnavailableError);
	});

	it('uses the low-cost beta providers and models by default', () => {
		expect(configuredGatekeeperProvider()).toBe('groq');
		expect(configuredAgentProvider()).toBe('deepseek');
		expect(configuredModel('groq', 'light')).toBe('llama-3.3-70b-versatile');
		expect(configuredModel('deepseek', 'light')).toBe('deepseek-v4-flash');
		expect(configuredModel('deepseek', 'heavy')).toBe('deepseek-v4-pro');
	});

	it('only enables a distinct configured gatekeeper fallback provider', () => {
		setSetting('GATEKEEPER_FALLBACK_PROVIDER', 'deepseek');
		expect(configuredGatekeeperFallbackProvider()).toBe('deepseek');
		setSetting('GATEKEEPER_PROVIDER', 'anthropic');
		setSetting('GATEKEEPER_FALLBACK_PROVIDER', 'anthropic');
		expect(configuredGatekeeperFallbackProvider()).toBeUndefined();
	});

	it('estimates provider spend in integer micro-USD', () => {
		expect(estimateCostMicrousd('groq', 'llama-3.3-70b-versatile', 10_000, 1_000)).toBe(0);
		expect(estimateCostMicrousd('deepseek', 'deepseek-v4-flash', 10_000, 1_000)).toBe(1680);
		expect(estimateCostMicrousd('deepseek', 'deepseek-v4-pro', 10_000, 1_000)).toBe(5220);
	});

	it('parses a forced Groq function call', async () => {
		setSetting('GROQ_API_KEY', 'gsk_test');
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify({
						choices: [
							{
								message: {
									tool_calls: [
										{
											id: 'call-1',
											function: {
												name: 'gate_message',
												arguments: JSON.stringify({ intent: 'off_topic', reply: 'Hayır.' })
											}
										}
									]
								}
							}
						],
						usage: { prompt_tokens: 120, completion_tokens: 20 }
					}),
					{ status: 200, headers: { 'content-type': 'application/json' } }
				)
			)
		);

		const result = await runToolCall({
			provider: 'groq',
			system: 'Classify.',
			messages: [{ role: 'user', content: 'hello' }],
			tool: {
				name: 'gate_message',
				description: 'Classify',
				inputSchema: { type: 'object', properties: {} }
			}
		});
		expect(result.input).toEqual({ intent: 'off_topic', reply: 'Hayır.' });
		expect(result.usage).toEqual({
			inputTokens: 120,
			outputTokens: 20,
			estimatedCostMicrousd: 0
		});
		expect(fetch).toHaveBeenCalledWith(
			'https://api.groq.com/openai/v1/chat/completions',
			expect.objectContaining({
				headers: expect.objectContaining({ 'user-agent': 'saaskaya/1.0' })
			})
		);
	});
});
