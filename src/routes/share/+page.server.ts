import { error } from '@sveltejs/kit';
import { renderSVG } from 'uqr';
import { getSetting } from '$lib/server/config';
import { absoluteUrl } from '$lib/seo';
import { listActiveShareAssets, parseCaption } from '$lib/server/shareAssets';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (getSetting('SHARE_PAGE_ENABLED') !== '1') error(404, 'Not found');
	const assets = listActiveShareAssets();
	if (assets.length === 0) error(404, 'Not found');
	const pageUrl = absoluteUrl(locals.locale, '/share');
	return {
		assets: assets.map((asset) => ({
			id: asset.id,
			kind: asset.kind,
			url: asset.url,
			fileName: asset.fileName,
			mimeType: asset.mimeType,
			caption: parseCaption(asset.caption)
		})),
		pageUrl,
		qrSvg: renderSVG(pageUrl, { border: 1 })
	};
};
