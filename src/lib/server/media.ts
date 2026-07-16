import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { desc, eq, sql } from 'drizzle-orm';
import sharp from 'sharp';
import { getSetting } from '$lib/server/config';
import { db } from '$lib/server/db';
import { mediaAssets } from '$lib/server/db/schema';
import { planTierForUser } from '$lib/server/plan';

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
export const FREE_SITE_MEDIA_BYTES = 20 * 1024 * 1024;
export const PRO_SITE_MEDIA_BYTES = 500 * 1024 * 1024;

export function siteMediaLimit(ownerUserId?: string | null): number {
	const plan = ownerUserId ? planTierForUser(ownerUserId) : 'free';
	const key =
		plan === 'premium'
			? 'MEDIA_LIMIT_PREMIUM_MB'
			: plan === 'pro'
				? 'MEDIA_LIMIT_PRO_MB'
				: 'MEDIA_LIMIT_FREE_MB';
	const configured = Number(getSetting(key));
	if (Number.isFinite(configured) && configured > 0) return Math.round(configured * 1024 * 1024);
	return plan === 'premium'
		? 2048 * 1024 * 1024
		: plan === 'pro'
			? PRO_SITE_MEDIA_BYTES
			: FREE_SITE_MEDIA_BYTES;
}

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
type StoredImage = { bytes: Uint8Array; mimeType: ImageMime; extension: string };

export function r2Config() {
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

export function r2Client(config: ReturnType<typeof r2Config>) {
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

export function imageExtension(mime: ImageMime): string {
	return IMAGE_TYPES[mime].extension;
}

export async function prepareStoredImage(
	bytes: Uint8Array,
	mimeType: ImageMime
): Promise<StoredImage> {
	if (mimeType === 'image/gif') {
		return { bytes, mimeType, extension: imageExtension(mimeType) };
	}
	const output = await sharp(bytes, { animated: false })
		.rotate()
		.resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 82, effort: 4 })
		.toBuffer();
	return { bytes: new Uint8Array(output), mimeType: 'image/webp', extension: 'webp' };
}

export function siteMediaUsage(siteId: string): number {
	const result = db
		.select({ total: sql<number>`coalesce(sum(${mediaAssets.sizeBytes}), 0)` })
		.from(mediaAssets)
		.where(eq(mediaAssets.siteId, siteId))
		.get();
	return Number(result?.total ?? 0);
}

/** Best-effort R2 cleanup (e.g. after a site is deleted). Never throws — DB rows are
 *  the source of truth and are always gone by the time this runs; a stray orphaned
 *  object in R2 is an acceptable outcome, a thrown error here is not. */
export async function deleteMediaObjects(objectKeys: string[]): Promise<void> {
	if (objectKeys.length === 0) return;
	let config: ReturnType<typeof r2Config>;
	try {
		config = r2Config();
	} catch {
		return; // R2 unconfigured — nothing to clean up remotely
	}
	const s3 = r2Client(config);
	await Promise.all(
		objectKeys.map((key) =>
			s3.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key })).catch(() => undefined)
		)
	);
}

export async function deleteMediaAsset(input: { id: string; siteId: string; ownerUserId: string }) {
	const asset = db.select().from(mediaAssets).where(eq(mediaAssets.id, input.id)).get();
	if (!asset || asset.siteId !== input.siteId || asset.ownerUserId !== input.ownerUserId)
		return false;
	db.delete(mediaAssets).where(eq(mediaAssets.id, input.id)).run();
	await deleteMediaObjects([asset.objectKey]);
	return true;
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
	const stored = await prepareStoredImage(input.bytes, mimeType);
	const config = r2Config();
	const id = randomUUID();
	const objectKey = `sites/${input.siteId}/${id}.${stored.extension}`;
	const url = `${config.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;

	await r2Client(config).send(
		new PutObjectCommand({
			Bucket: config.bucket,
			Key: objectKey,
			Body: stored.bytes,
			ContentType: stored.mimeType,
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
			fileName: input.fileName.slice(0, 255) || `image.${stored.extension}`,
			mimeType: stored.mimeType,
			sizeBytes: stored.bytes.byteLength,
			createdAt: new Date()
		};
		db.insert(mediaAssets).values(asset).run();
		return asset;
	} catch (error) {
		await r2Client(config)
			.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey }))
			.catch(() => undefined);
		throw error;
	}
}
