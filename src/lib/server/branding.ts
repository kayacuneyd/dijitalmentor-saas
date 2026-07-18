import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { appSettings } from '$lib/server/db/schema';
import { prepareStoredImage, r2Client, r2Config, validateImage } from '$lib/server/media';
import { assertSafeSvg as validateSvg } from '$lib/server/svg';

const LOGO_URL_KEY = 'PLATFORM_LOGO_URL';
const LOGO_OBJECT_KEY = 'PLATFORM_LOGO_OBJECT_KEY';
const ICON_URL_KEY = 'PLATFORM_ICON_URL';
const ICON_OBJECT_KEY = 'PLATFORM_ICON_OBJECT_KEY';
const ICON_MIME_KEY = 'PLATFORM_ICON_MIME';
const MASCOT_URL_KEY = 'PLATFORM_MASCOT_URL';
const MASCOT_OBJECT_KEY = 'PLATFORM_MASCOT_OBJECT_KEY';
const BRAND_VERSION_KEY = 'PLATFORM_BRAND_VERSION';
const BRAND_NAME_KEY = 'PLATFORM_BRAND_NAME';
const SHOW_WORDMARK_KEY = 'PLATFORM_SHOW_WORDMARK';

export const DEFAULT_LOGO_URL = '/do-more-with-less-download-free-ebook.svg';
export const DEFAULT_ICON_URL = '/logo.svg';
export const DEFAULT_MASCOT_URL = '/mascot-bee.svg';

export type BrandAssetTarget = 'logo' | 'icon' | 'mascot';

const BRAND_ASSET_SETTINGS: Record<
	BrandAssetTarget,
	{ urlKey: string; objectKey: string; defaultUrl: string }
> = {
	logo: { urlKey: LOGO_URL_KEY, objectKey: LOGO_OBJECT_KEY, defaultUrl: DEFAULT_LOGO_URL },
	icon: { urlKey: ICON_URL_KEY, objectKey: ICON_OBJECT_KEY, defaultUrl: DEFAULT_ICON_URL },
	mascot: {
		urlKey: MASCOT_URL_KEY,
		objectKey: MASCOT_OBJECT_KEY,
		defaultUrl: DEFAULT_MASCOT_URL
	}
};

export type PlatformBranding = {
	logoUrl: string;
	iconUrl: string;
	iconMime: string;
	mascotUrl: string;
	brandName: string;
	showWordmark: boolean;
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
		iconUrl: versionedUrl(readSetting(ICON_URL_KEY) || DEFAULT_ICON_URL, safeVersion),
		iconMime: readSetting(ICON_MIME_KEY) || 'image/svg+xml',
		mascotUrl: versionedUrl(readSetting(MASCOT_URL_KEY) || DEFAULT_MASCOT_URL, safeVersion),
		brandName: readSetting(BRAND_NAME_KEY) || 'saaskaya',
		showWordmark: readSetting(SHOW_WORDMARK_KEY) !== '0',
		version: safeVersion
	};
}

export function saveBrandingPreferences(input: {
	brandName: string;
	showWordmark: boolean;
}): PlatformBranding {
	const brandName = input.brandName.trim().slice(0, 80);
	if (!brandName) throw new Error('Brand name is required.');
	setSetting(BRAND_NAME_KEY, brandName);
	setSetting(SHOW_WORDMARK_KEY, input.showWordmark ? '1' : '0');
	setSetting(BRAND_VERSION_KEY, String(getPlatformBranding().version + 1));
	return getPlatformBranding();
}

function setSetting(key: string, value: string): void {
	db.insert(appSettings)
		.values({ key, value, updatedAt: new Date() })
		.onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } })
		.run();
}

function safeFileName(fileName: string): string {
	return (
		fileName
			.toLowerCase()
			.replace(/[^a-z0-9._-]+/g, '-')
			.slice(-80) || 'logo'
	);
}

export function assertSafeSvg(bytes: Uint8Array): string {
	return validateSvg(bytes);
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
	target: BrandAssetTarget;
	fileName: string;
	mimeType: string;
	bytes: Uint8Array;
}): Promise<PlatformBranding> {
	const stored = await storeBrandAsset(input);
	const settings = BRAND_ASSET_SETTINGS[input.target];
	const oldObjectKey = readSetting(settings.objectKey);
	const nextVersion = getPlatformBranding().version + 1;
	setSetting(settings.urlKey, stored.url);
	setSetting(settings.objectKey, stored.objectKey);
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

export function resetPlatformBranding(target: BrandAssetTarget): PlatformBranding {
	const settings = BRAND_ASSET_SETTINGS[target];
	setSetting(settings.urlKey, settings.defaultUrl);
	setSetting(settings.objectKey, '');
	if (target === 'icon') setSetting(ICON_MIME_KEY, 'image/svg+xml');
	setSetting(BRAND_VERSION_KEY, String(getPlatformBranding().version + 1));
	return getPlatformBranding();
}

export function isBrandAssetTarget(value: string): value is BrandAssetTarget {
	return value === 'logo' || value === 'icon' || value === 'mascot';
}
