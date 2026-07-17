import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { appSettings } from '$lib/server/db/schema';
import { prepareStoredImage, r2Client, r2Config, validateImage } from '$lib/server/media';

const LOGO_URL_KEY = 'PLATFORM_LOGO_URL';
const LOGO_OBJECT_KEY = 'PLATFORM_LOGO_OBJECT_KEY';
const ICON_URL_KEY = 'PLATFORM_ICON_URL';
const ICON_OBJECT_KEY = 'PLATFORM_ICON_OBJECT_KEY';
const ICON_MIME_KEY = 'PLATFORM_ICON_MIME';
const BRAND_VERSION_KEY = 'PLATFORM_BRAND_VERSION';

export const DEFAULT_LOGO_URL = '/logo.svg';

export type PlatformBranding = {
	logoUrl: string;
	iconUrl: string;
	iconMime: string;
	version: number;
};

function versionedUrl(url: string, version: number): string {
	return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

function readSetting(key: string): string | undefined {
	return db.select().from(appSettings).where(eq(appSettings.key, key)).get()?.value;
}

// Keep this resolver deliberately small: branding is read on every SSR request and
// falls back to the committed logo when storage has not been configured yet.
export function getPlatformBranding(): PlatformBranding {
	const version = Number(readSetting(BRAND_VERSION_KEY) ?? 1);
	const safeVersion = Number.isFinite(version) && version > 0 ? version : 1;
	return {
		logoUrl: versionedUrl(readSetting(LOGO_URL_KEY) || DEFAULT_LOGO_URL, safeVersion),
		iconUrl: versionedUrl(readSetting(ICON_URL_KEY) || DEFAULT_LOGO_URL, safeVersion),
		iconMime: readSetting(ICON_MIME_KEY) || 'image/svg+xml',
		version: safeVersion
	};
}

function setSetting(key: string, value: string): void {
	db.insert(appSettings)
		.values({ key, value, updatedAt: new Date() })
		.onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } })
		.run();
}

function safeFileName(fileName: string): string {
	return fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-80) || 'logo';
}

export function assertSafeSvg(bytes: Uint8Array): string {
	if (bytes.byteLength > 1_048_576) throw new Error('SVG must be 1 MB or smaller.');
	const svg = new TextDecoder().decode(bytes).replace(/^\uFEFF/, '').trim();
	if (!/^<svg(?:\s|>)/i.test(svg) || !/<\/svg>\s*$/i.test(svg)) {
		throw new Error('Upload a valid SVG logo.');
	}
	if (
		/<\s*(script|foreignObject|iframe|object|embed)\b/i.test(svg) ||
		/\bon[a-z]+\s*=|javascript\s*:|data\s*:\s*text\/html|url\s*\(\s*https?:|@import/i.test(svg)
	) {
		throw new Error('This SVG contains unsupported or unsafe content.');
	}
	return svg;
}

async function storeBrandAsset(input: { fileName: string; mimeType: string; bytes: Uint8Array }) {
	let bytes = input.bytes;
	let mimeType = input.mimeType.toLowerCase();
	let extension = safeFileName(input.fileName).split('.').pop() || 'bin';

	if (mimeType === 'image/svg+xml' || extension === 'svg') {
		bytes = new TextEncoder().encode(assertSafeSvg(bytes));
		mimeType = 'image/svg+xml';
		extension = 'svg';
	} else {
		const validMime = validateImage(bytes, mimeType);
		const stored = await prepareStoredImage(bytes, validMime);
		bytes = stored.bytes;
		mimeType = stored.mimeType;
		extension = stored.extension;
	}

	if (bytes.byteLength > 8 * 1024 * 1024) throw new Error('Logo must be 8 MB or smaller.');
	const config = r2Config();
	const objectKey = `branding/${randomUUID()}-${safeFileName(input.fileName)}.${extension}`;
	const url = `${config.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
	await r2Client(config).send(
		new PutObjectCommand({
			Bucket: config.bucket,
			Key: objectKey,
			Body: bytes,
			ContentType: mimeType,
			CacheControl: 'public, max-age=31536000, immutable'
		})
	);
	return { objectKey, url, mimeType };
}

export async function uploadPlatformBranding(input: {
	target: 'logo' | 'icon';
	fileName: string;
	mimeType: string;
	bytes: Uint8Array;
}): Promise<PlatformBranding> {
	const stored = await storeBrandAsset(input);
	const urlKey = input.target === 'logo' ? LOGO_URL_KEY : ICON_URL_KEY;
	const objectKeyKey = input.target === 'logo' ? LOGO_OBJECT_KEY : ICON_OBJECT_KEY;
	const oldObjectKey = readSetting(objectKeyKey);
	const nextVersion = getPlatformBranding().version + 1;
	setSetting(urlKey, stored.url);
	setSetting(objectKeyKey, stored.objectKey);
	if (input.target === 'icon') setSetting(ICON_MIME_KEY, stored.mimeType);
	setSetting(BRAND_VERSION_KEY, String(nextVersion));

	if (oldObjectKey && oldObjectKey !== stored.objectKey) {
		try {
			const config = r2Config();
			await r2Client(config).send(
				new DeleteObjectCommand({ Bucket: config.bucket, Key: oldObjectKey })
			);
		} catch {
			// The DB points at the new asset; an orphaned old object is safe to clean up later.
		}
	}
	return getPlatformBranding();
}

export function resetPlatformBranding(target: 'logo' | 'icon'): PlatformBranding {
	const urlKey = target === 'logo' ? LOGO_URL_KEY : ICON_URL_KEY;
	const objectKeyKey = target === 'logo' ? LOGO_OBJECT_KEY : ICON_OBJECT_KEY;
	setSetting(urlKey, DEFAULT_LOGO_URL);
	setSetting(objectKeyKey, '');
	if (target === 'icon') setSetting(ICON_MIME_KEY, 'image/svg+xml');
	setSetting(BRAND_VERSION_KEY, String(getPlatformBranding().version + 1));
	return getPlatformBranding();
}
