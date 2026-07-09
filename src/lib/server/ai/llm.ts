import Anthropic from '@anthropic-ai/sdk';
import { getSetting } from '$lib/server/config';

export const DEFAULT_MODEL = 'claude-opus-4-8';
export const DEFAULT_LIGHT_MODEL = 'claude-sonnet-5';
export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
export const DEFAULT_DEEPSEEK_LIGHT_MODEL = 'deepseek-v4-flash';
export const DEFAULT_DEEPSEEK_HEAVY_MODEL = 'deepseek-v4-pro';

export type AIProvider = 'anthropic' | 'deepseek' | 'groq';
export type ModelTier = 'light' | 'heavy';

export class AIUnavailableError extends Error {}
export class AIInvalidOutputError extends Error {
	constructor(
		message: string,
		public issues?: unknown
	) {
		super(message);
	}
}
export class QuotaExceededError extends Error {}

export type TokenUsage = {
	inputTokens: number;
	outputTokens: number;
	estimatedCostMicrousd?: number;
};

export type ToolCallRequest = {
	system: string;
	messages: Anthropic.MessageParam[];
	tool: { name: string; description: string; inputSchema: Record<string, unknown> };
	maxTokens?: number;
	model?: string;
	provider?: AIProvider;
	tier?: ModelTier;
};

export type ToolCallResult = {
	input: unknown;
	toolUseId: string;
	assistantContent: Anthropic.ContentBlock[];
	usage: TokenUsage;
};

export type RunToolCall = (req: ToolCallRequest) => Promise<ToolCallResult>;

export function configuredGatekeeperProvider(): AIProvider {
	const value = getSetting('GATEKEEPER_PROVIDER');
	return value === 'anthropic' ? 'anthropic' : 'groq';
}

export function configuredAgentProvider(): AIProvider {
	const value = getSetting('AI_PROVIDER');
	return value === 'anthropic' ? 'anthropic' : 'deepseek';
}

export function configuredModel(provider: AIProvider, tier: ModelTier = 'heavy'): string {
	if (provider === 'groq') return getSetting('GROQ_MODEL') || DEFAULT_GROQ_MODEL;
	if (provider === 'deepseek') {
		return tier === 'light'
			? getSetting('DEEPSEEK_MODEL_LIGHT') || DEFAULT_DEEPSEEK_LIGHT_MODEL
			: getSetting('DEEPSEEK_MODEL_HEAVY') || DEFAULT_DEEPSEEK_HEAVY_MODEL;
	}
	return tier === 'light'
		? getSetting('AI_MODEL_LIGHT') || DEFAULT_LIGHT_MODEL
		: getSetting('AI_MODEL') || DEFAULT_MODEL;
}

const PRICES_PER_MILLION: Record<string, { input: number; output: number }> = {
	'deepseek-v4-flash': { input: 0.14, output: 0.28 },
	'deepseek-v4-pro': { input: 0.435, output: 0.87 },
	'claude-haiku-4-5': { input: 1, output: 5 },
	'claude-sonnet-5': { input: 2, output: 10 },
	'claude-opus-4-8': { input: 5, output: 25 }
};

export function estimateCostMicrousd(
	provider: AIProvider,
	model: string,
	inputTokens: number,
	outputTokens: number
): number {
	if (provider === 'groq') return 0; // beta uses Groq's free gatekeeper tier
	const price = PRICES_PER_MILLION[model];
	if (!price) return 0;
	// USD/token × 1e6 micro-USD/USD cancels the "per million" denominator.
	return Math.ceil(inputTokens * price.input + outputTokens * price.output - 1e-9);
}

const clients = new Map<string, Anthropic>();

function anthropicCompatibleClient(provider: 'anthropic' | 'deepseek'): Anthropic {
	const apiKey =
		provider === 'deepseek' ? getSetting('DEEPSEEK_API_KEY') : getSetting('ANTHROPIC_API_KEY');
	if (!apiKey) {
		throw new AIUnavailableError(
			`${provider === 'deepseek' ? 'DeepSeek' : 'Anthropic'} is not configured (missing API key).`
		);
	}
	const cacheKey = `${provider}:${apiKey}`;
	let client = clients.get(cacheKey);
	if (!client) {
		client = new Anthropic({
			apiKey,
			...(provider === 'deepseek'
				? {
						baseURL: 'https://api.deepseek.com/anthropic',
						// Explicit timeout bypasses the Anthropic SDK's max-token heuristic.
						// DeepSeek's Anthropic-compatible SSE stream is not parser-compatible.
						timeout: 5 * 60_000
					}
				: {})
		});
		clients.set(cacheKey, client);
	}
	return client;
}

async function runAnthropicCompatible(
	req: ToolCallRequest,
	provider: 'anthropic' | 'deepseek',
	model: string
): Promise<ToolCallResult> {
	const client = anthropicCompatibleClient(provider);
	try {
		const message = await client.messages.create({
			model,
			max_tokens: req.maxTokens ?? 16000,
			system:
				provider === 'anthropic'
					? [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }]
					: req.system,
			messages: req.messages,
			tools: [
				{
					name: req.tool.name,
					description: req.tool.description,
					input_schema: req.tool.inputSchema as Anthropic.Tool['input_schema']
				}
			],
			tool_choice: { type: 'tool', name: req.tool.name },
			...(provider === 'deepseek' ? { thinking: { type: 'disabled' as const } } : {})
		});
		const block = message.content.find((item) => item.type === 'tool_use');
		if (!block) throw new AIInvalidOutputError('The model returned no tool call.');
		return {
			input: block.input,
			toolUseId: block.id,
			assistantContent: message.content,
			usage: {
				inputTokens: message.usage.input_tokens,
				outputTokens: message.usage.output_tokens,
				estimatedCostMicrousd: estimateCostMicrousd(
					provider,
					model,
					message.usage.input_tokens,
					message.usage.output_tokens
				)
			}
		};
	} catch (error) {
		if (error instanceof AIInvalidOutputError) throw error;
		if (error instanceof Anthropic.APIError) {
			if (error.status === 401 || error.status === 403) {
				throw new AIUnavailableError(
					`${provider === 'deepseek' ? 'DeepSeek' : 'Anthropic'} API key is invalid or unauthorized — check /admin/settings.`,
					{ cause: error }
				);
			}
			if (error.status === 402) {
				throw new AIUnavailableError('DeepSeek balance is exhausted.', { cause: error });
			}
			if (error.status === 429 || (error.status ?? 0) >= 500) {
				throw new AIUnavailableError('The AI is busy right now — retry shortly.', {
					cause: error
				});
			}
			if (error.status === 400 || error.status === 422) {
				throw new AIUnavailableError(
					'The AI provider rejected the structured request — check provider/model settings.',
					{ cause: error }
				);
			}
		}
		throw error;
	}
}

type GroqResponse = {
	choices?: {
		message?: {
			tool_calls?: { id?: string; function?: { name?: string; arguments?: string } }[];
		};
	}[];
	usage?: { prompt_tokens?: number; completion_tokens?: number };
	error?: { message?: string };
};

function groqMessages(messages: Anthropic.MessageParam[]) {
	return messages.map((message) => {
		if (typeof message.content !== 'string') {
			throw new AIUnavailableError('Groq gatekeeper only accepts text conversation turns.');
		}
		return { role: message.role, content: message.content };
	});
}

async function runGroq(req: ToolCallRequest, model: string): Promise<ToolCallResult> {
	const apiKey = getSetting('GROQ_API_KEY');
	if (!apiKey) throw new AIUnavailableError('Groq is not configured (missing API key).');
	let response: Response;
	try {
		response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				authorization: `Bearer ${apiKey}`,
				'content-type': 'application/json',
				'user-agent': 'saaskaya/1.0'
			},
			body: JSON.stringify({
				model,
				temperature: 0,
				max_completion_tokens: req.maxTokens ?? 1000,
				messages: [{ role: 'system', content: req.system }, ...groqMessages(req.messages)],
				tools: [
					{
						type: 'function',
						function: {
							name: req.tool.name,
							description: req.tool.description,
							parameters: req.tool.inputSchema
						}
					}
				],
				tool_choice: { type: 'function', function: { name: req.tool.name } }
			}),
			signal: AbortSignal.timeout(60_000)
		});
	} catch (error) {
		throw new AIUnavailableError('Groq is unavailable — retry shortly.', { cause: error });
	}
	const payload = (await response.json()) as GroqResponse;
	if (!response.ok) {
		const auth = response.status === 401 || response.status === 403;
		throw new AIUnavailableError(
			auth
				? 'Groq API key is invalid or unauthorized — check /admin/settings.'
				: payload.error?.message || 'Groq is unavailable — retry shortly.'
		);
	}
	const call = payload.choices?.[0]?.message?.tool_calls?.find(
		(item) => item.function?.name === req.tool.name
	);
	if (!call?.function?.arguments) {
		throw new AIInvalidOutputError('The gatekeeper returned no tool call.');
	}
	let input: unknown;
	try {
		input = JSON.parse(call.function.arguments);
	} catch {
		throw new AIInvalidOutputError('The gatekeeper returned invalid tool JSON.');
	}
	return {
		input,
		toolUseId: call.id || crypto.randomUUID(),
		assistantContent: [],
		usage: {
			inputTokens: payload.usage?.prompt_tokens ?? 0,
			outputTokens: payload.usage?.completion_tokens ?? 0,
			estimatedCostMicrousd: 0
		}
	};
}

export const runToolCall: RunToolCall = async (req) => {
	const provider = req.provider || configuredAgentProvider();
	const model = req.model || configuredModel(provider, req.tier);
	if (provider === 'groq') return runGroq(req, model);
	return runAnthropicCompatible(req, provider, model);
};

export const addUsage = (a: TokenUsage, b: TokenUsage): TokenUsage => {
	const estimatedCostMicrousd = (a.estimatedCostMicrousd ?? 0) + (b.estimatedCostMicrousd ?? 0);
	return {
		inputTokens: a.inputTokens + b.inputTokens,
		outputTokens: a.outputTokens + b.outputTokens,
		...(estimatedCostMicrousd > 0 ? { estimatedCostMicrousd } : {})
	};
};
