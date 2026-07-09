import { getContext, setContext } from 'svelte';

/**
 * Render context shared with blocks (currently only Contact needs it):
 * whether the site is being served publicly (forms live) or previewed (forms inert),
 * and the result of the last contact-form submission on this page.
 */
export type RenderContext = {
	mode: 'preview' | 'public';
	contactState: 'idle' | 'sent' | 'error';
};

const KEY = 'saaskaya:render';

export const setRenderContext = (ctx: RenderContext) => setContext(KEY, ctx);
export const getRenderContext = (): RenderContext =>
	getContext<RenderContext | undefined>(KEY) ?? { mode: 'preview', contactState: 'idle' };
