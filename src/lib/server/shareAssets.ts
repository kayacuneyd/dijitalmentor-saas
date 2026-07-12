import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { shareAssets } from '$lib/server/db/schema';
import { imageExtension, r2Client, r2Config, validateImage } from '$lib/server/media';
import type { Locale } from '$lib/i18n';

export const MAX_SHARE_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_SHARE_VIDEO_BYTES = 60 * 1024 * 1024;

export type ShareAssetRow = typeof shareAssets.$inferSelect;
export type ShareCaption = Partial<Record<Locale, string>>;

/** MP4 "ftyp" box: bytes 4–7 spell ftyp; major brand at 8–11 must be a common MP4 brand. */
const MP4_BRANDS = new Set([
	'isom',
	'iso2',
	'iso4',
	'iso5',
	'iso6',
	'mp41',
	'mp42',
	'avc1',
	'M4V ',
	'M4A '
]);

function isMp4(bytes: Uint8Array): boolean {
	if (bytes.length < 12) return false;
	const ftyp = String.fromCharCode(...bytes.slice(4, 8));
	if (ftyp !== 'ftyp') return false;
	const brand = String.fromCharCode(...bytes.slice(8, 12));
	return MP4_BRANDS.has(brand);
}

export function validateShareAsset(
	bytes: Uint8Array,
	mimeType: string
): { kind: 'image' | 'video'; mime: string; ext: string } {
	const lower = mimeType.toLowerCase();
	if (lower === 'video/mp4') {
		if (!isMp4(bytes)) throw new Error('Upload a valid MP4 video.');
		if (bytes.byteLength > MAX_SHARE_VIDEO_BYTES) {
			throw new Error('Upload a video of 60 MB or smaller.');
		}
		return { kind: 'video', mime: 'video/mp4', ext: 'mp4' };
	}
	const imageMime = validateImage(bytes, lower);
	if (bytes.byteLength > MAX_SHARE_IMAGE_BYTES) {
		throw new Error('Upload an image of 8 MB or smaller.');
	}
	return { kind: 'image', mime: imageMime, ext: imageExtension(imageMime) };
}

export function parseCaption(raw: string | null): ShareCaption {
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw);
		return typeof parsed === 'object' && parsed !== null ? (parsed as ShareCaption) : {};
	} catch {
		return {};
	}
}

export function listShareAssets(): ShareAssetRow[] {
	return db.select().from(shareAssets).orderBy(asc(shareAssets.sortOrder)).all();
}

export function listActiveShareAssets(): ShareAssetRow[] {
	return db
		.select()
		.from(shareAssets)
		.where(eq(shareAssets.active, true))
		.orderBy(asc(shareAssets.sortOrder))
		.all();
}

export function getShareAsset(id: string): ShareAssetRow | undefined {
	return db.select().from(shareAssets).where(eq(shareAssets.id, id)).get();
}

export async function uploadShareAsset(input: {
	fileName: string;
	mimeType: string;
	bytes: Uint8Array;
	caption?: ShareCaption;
}): Promise<ShareAssetRow> {
	const { kind, mime, ext } = validateShareAsset(input.bytes, input.mimeType);
	const config = r2Config();
	const id = randomUUID();
	const objectKey = `share/${id}.${ext}`;
	const url = `${config.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;

	await r2Client(config).send(
		new PutObjectCommand({
			Bucket: config.bucket,
			Key: objectKey,
			Body: input.bytes,
			ContentType: mime,
			CacheControl: 'public, max-age=31536000, immutable'
		})
	);

	try {
		const maxOrder = listShareAssets().reduce((max, row) => Math.max(max, row.sortOrder), -1);
		const asset: ShareAssetRow = {
			id,
			kind,
			objectKey,
			url,
			fileName: input.fileName.slice(0, 255) || `story.${ext}`,
			mimeType: mime,
			sizeBytes: input.bytes.byteLength,
			width: null,
			height: null,
			sortOrder: maxOrder + 1,
			active: true,
			caption: input.caption ? JSON.stringify(input.caption) : null,
			createdAt: new Date()
		};
		db.insert(shareAssets).values(asset).run();
		return asset;
	} catch (error) {
		await r2Client(config)
			.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey }))
			.catch(() => undefined);
		throw error;
	}
}

export function setShareAssetActive(id: string, active: boolean): void {
	db.update(shareAssets).set({ active }).where(eq(shareAssets.id, id)).run();
}

/** Swap sort_order with the neighbor above/below; no-op at the edges. */
export function moveShareAsset(id: string, direction: 'up' | 'down'): void {
	const rows = listShareAssets();
	const index = rows.findIndex((row) => row.id === id);
	if (index === -1) return;
	const neighborIndex = direction === 'up' ? index - 1 : index + 1;
	const neighbor = rows[neighborIndex];
	if (!neighbor) return;
	const current = rows[index];
	db.update(shareAssets)
		.set({ sortOrder: neighbor.sortOrder })
		.where(eq(shareAssets.id, current.id))
		.run();
	db.update(shareAssets)
		.set({ sortOrder: current.sortOrder })
		.where(eq(shareAssets.id, neighbor.id))
		.run();
}

export function saveShareAssetCaption(id: string, caption: ShareCaption): void {
	const trimmed = Object.fromEntries(
		Object.entries(caption).filter(([, value]) => typeof value === 'string' && value.trim() !== '')
	);
	db.update(shareAssets)
		.set({ caption: Object.keys(trimmed).length ? JSON.stringify(trimmed) : null })
		.where(eq(shareAssets.id, id))
		.run();
}

export async function deleteShareAsset(id: string): Promise<void> {
	const row = getShareAsset(id);
	if (!row) return;
	db.delete(shareAssets).where(eq(shareAssets.id, id)).run();
	// Best-effort R2 cleanup — DB row is the source of truth (same policy as media.ts).
	const { deleteMediaObjects } = await import('$lib/server/media');
	await deleteMediaObjects([row.objectKey]);
}
