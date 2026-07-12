import { error } from '@sveltejs/kit';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getShareAsset } from '$lib/server/shareAssets';
import { r2Client, r2Config } from '$lib/server/media';
import type { RequestHandler } from './$types';

/**
 * Same-origin stream of a share asset. The /share page fetches bytes from here
 * (instead of the CDN origin) so the Web Share `fetch() → blob → File` flow
 * needs no R2 CORS configuration; <img>/<video> previews keep using the CDN.
 */
export const GET: RequestHandler = async ({ params }) => {
	const asset = getShareAsset(params.id);
	if (!asset || !asset.active) error(404, 'Not found');

	let config: ReturnType<typeof r2Config>;
	try {
		config = r2Config();
	} catch {
		error(503, 'Media storage is not configured.');
	}

	const object = await r2Client(config)
		.send(new GetObjectCommand({ Bucket: config.bucket, Key: asset.objectKey }))
		.catch(() => null);
	if (!object?.Body) error(404, 'Not found');

	return new Response(object.Body.transformToWebStream(), {
		headers: {
			'content-type': asset.mimeType,
			...(object.ContentLength ? { 'content-length': String(object.ContentLength) } : {}),
			'cache-control': 'public, max-age=3600',
			'content-disposition': `inline; filename="${asset.fileName.replace(/[^\w.\- ]/g, '')}"`
		}
	});
};
