import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { renderSVG } from 'uqr';
import { SITE_ORIGIN } from '$lib/seo';
import type { PageServerLoad } from './$types';

/** Dev-only 1080×1920 stage recorded by scripts/generate-share-video.mjs. */
export const load: PageServerLoad = () => {
	if (!dev) error(404, 'Not found');
	return { qrSvg: renderSVG(`${SITE_ORIGIN}/share`, { border: 1 }) };
};
