import type { IntegrationType } from '$lib/kits/integrations';
import { getContext, setContext } from 'svelte';

/**
 * A single integration entry as stored in Site.settings.integrations.
 * Mirrors the Zod schema shape but is a plain object at runtime.
 */
export type Integration = {
	type: IntegrationType;
	enabled: boolean;
	url?: string;
	phone?: string;
	label?: { tr?: string; en?: string; de?: string };
};

/**
 * Render context shared with blocks:
 * whether the site is being served publicly (forms live) or previewed (forms inert),
 * the result of the last contact-form submission on this page,
 * and the active integration list from site settings.
 */
export type RenderContext = {
	mode: 'preview' | 'public';
	contactState: 'idle' | 'sent' | 'error';
	integrations: Integration[];
};

const KEY = 'saaskaya:render';

export const setRenderContext = (ctx: RenderContext) => setContext(KEY, ctx);
export const getRenderContext = (): RenderContext =>
	getContext<RenderContext | undefined>(KEY) ?? { mode: 'preview', contactState: 'idle', integrations: [] };

/**
 * Returns the first integration of the requested type that is enabled.
 */
export function getSiteIntegration(
	integrations: Integration[],
	type: IntegrationType
): Integration | undefined {
	return integrations.find((i) => i.type === type && i.enabled);
}
