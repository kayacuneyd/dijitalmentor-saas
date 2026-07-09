import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { desc, eq, sql } from 'drizzle-orm';
import { getSetting } from '$lib/server/config';
import { db } from '$lib/server/db';
import { mediaAssets } from '$lib/server/db/schema';

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
export const MAX_SITE_MEDIA_BYTES = 100 * 1024 * 1024;

const IMAGE_TYPES = {
	'image/jpeg': { extension: 'jpg', matches: (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8 },
	'image/png': {
		extension: 'png',
		matches: (b: Uint8Array) =>
			b[0] === 0x89 &&
			b[1] === 0x50 &&
			b[2] === 0x4e &&
			b[3] === 0x47 &&
			b[4] === 0x0d &&
			b[5] === 0x0a &&
			b[6] === 0x1a &&
			b[7] === 0x0a
	},
	'image/gif': {
		extension: 'gif',
		matches: (b: Uint8Array) =>
			String.fromCharCode(...b.slice(0, 6)) === 'GIF87a' ||
			String.fromCharCode(...b.slice(0, 6)) === 'GIF89a'
	},
	'image/webp': {
		extension: 'webp',
		matches: (b: Uint8Array) =>
			String.fromCharCode(...b.slice(0, 4)) === 'RIFF' &&
			String.fromCharCode(...b.slice(8, 12)) === 'WEBP'
	}
} as const;

type ImageMime = keyof typeof IMAGE_TYPES;

function r2Config() {
	const endpoint = getSetting('R2_ENDPOINT');
	const accessKeyId = getSetting('R2_ACCESS_KEY_ID');
	const secretAccessKey = getSetting('R2_SECRET_ACCESS_KEY');
	const bucket = getSetting('R2_BUCKET') || 'saaskaya-media';
	const publicBaseUrl = getSetting('R2_PUBLIC_BASE_URL') || 'https://cdn.saaskaya.com';
	if (!endpoint || !accessKeyId || !secretAccessKey) {
		throw new Error('R2 media storage is not configured.');
	}
	return { endpoint, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

function client(config: ReturnType<typeof r2Config>) {
	return new S3Client({
		region: 'auto',
		endpoint: config.endpoint,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey
		}
	});
}

export function validateImage(bytes: Uint8Array, mimeType: string): ImageMime {
	const type = mimeType.toLowerCase() as ImageMime;
	const definition = IMAGE_TYPES[type];
	if (!definition || !definition.matches(bytes)) {
		throw new Error('Upload a valid JPEG, PNG, GIF, or WebP image.');
	}
	return type;
}

export function siteMediaUsage(siteId: string): number {
	const result = db
		.select({ total: sql<number>`coalesce(sum(${mediaAssets.sizeBytes}), 0)` })
		.from(mediaAssets)
		.where(eq(mediaAssets.siteId, siteId))
		.get();
	return Number(result?.total ?? 0);
}

export function listMedia(siteId: string) {
	return db
		.select()
		.from(mediaAssets)
		.where(eq(mediaAssets.siteId, siteId))
		.orderBy(desc(mediaAssets.createdAt))
		.all();
}

export async function uploadMedia(input: {
	siteId: string;
	ownerUserId: string;
	fileName: string;
	mimeType: string;
	bytes: Uint8Array;
}) {
	const mimeType = validateImage(input.bytes, input.mimeType);
	const config = r2Config();
	const id = randomUUID();
	const objectKey = `sites/${input.siteId}/${id}.${IMAGE_TYPES[mimeType].extension}`;
	const url = `${config.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;

	await client(config).send(
		new PutObjectCommand({
			Bucket: config.bucket,
			Key: objectKey,
			Body: input.bytes,
			ContentType: mimeType,
			CacheControl: 'public, max-age=31536000, immutable'
		})
	);

	try {
		const asset = {
			id,
			siteId: input.siteId,
			ownerUserId: input.ownerUserId,
			objectKey,
			url,
			fileName: input.fileName.slice(0, 255) || `image.${IMAGE_TYPES[mimeType].extension}`,
			mimeType,
			sizeBytes: input.bytes.byteLength,
			createdAt: new Date()
		};
		db.insert(mediaAssets).values(asset).run();
		return asset;
	} catch (error) {
		await client(config)
			.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey }))
			.catch(() => undefined);
		throw error;
	}
}
