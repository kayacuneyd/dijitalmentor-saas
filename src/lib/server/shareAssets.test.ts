import { describe, expect, it } from 'vitest';
import { db } from '$lib/server/db';
import { shareAssets } from '$lib/server/db/schema';
import {
	MAX_SHARE_IMAGE_BYTES,
	MAX_SHARE_VIDEO_BYTES,
	deleteShareAsset,
	listActiveShareAssets,
	listShareAssets,
	moveShareAsset,
	parseCaption,
	saveShareAssetCaption,
	setShareAssetActive,
	validateShareAsset
} from '$lib/server/shareAssets';

function pngBytes(size = 16): Uint8Array {
	const bytes = new Uint8Array(size);
	bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
	return bytes;
}

function mp4Bytes(brand = 'isom', size = 32): Uint8Array {
	const bytes = new Uint8Array(size);
	bytes.set([0x00, 0x00, 0x00, 0x18]); // box size
	bytes.set(
		[...'ftyp'].map((c) => c.charCodeAt(0)),
		4
	);
	bytes.set(
		[...brand].map((c) => c.charCodeAt(0)),
		8
	);
	return bytes;
}

function insertRow(id: string, sortOrder: number, active = true) {
	db.insert(shareAssets)
		.values({
			id,
			kind: 'image',
			objectKey: `share/${id}.png`,
			url: `https://cdn.example.com/share/${id}.png`,
			fileName: `${id}.png`,
			mimeType: 'image/png',
			sizeBytes: 100,
			sortOrder,
			active,
			createdAt: new Date()
		})
		.run();
}

describe('validateShareAsset', () => {
	it('accepts a valid PNG as image', () => {
		expect(validateShareAsset(pngBytes(), 'image/png')).toEqual({
			kind: 'image',
			mime: 'image/png',
			ext: 'png'
		});
	});

	it('accepts a valid MP4 (isom/mp42 brands) as video', () => {
		expect(validateShareAsset(mp4Bytes('isom'), 'video/mp4').kind).toBe('video');
		expect(validateShareAsset(mp4Bytes('mp42'), 'video/mp4').ext).toBe('mp4');
	});

	it('rejects a spoofed mp4 without ftyp box', () => {
		expect(() => validateShareAsset(pngBytes(), 'video/mp4')).toThrow(/valid MP4/);
	});

	it('rejects a spoofed image', () => {
		expect(() => validateShareAsset(mp4Bytes(), 'image/png')).toThrow(/valid JPEG/);
	});

	it('rejects unknown mime types', () => {
		expect(() => validateShareAsset(pngBytes(), 'video/webm')).toThrow(/valid JPEG/);
	});

	it('enforces the video and image size caps', () => {
		expect(() =>
			validateShareAsset(mp4Bytes('isom', MAX_SHARE_VIDEO_BYTES + 1), 'video/mp4')
		).toThrow(/60 MB/);
		expect(() => validateShareAsset(pngBytes(MAX_SHARE_IMAGE_BYTES + 1), 'image/png')).toThrow(
			/8 MB/
		);
	});
});

describe('parseCaption', () => {
	it('parses localized JSON and tolerates garbage', () => {
		expect(parseCaption('{"tr":"merhaba"}')).toEqual({ tr: 'merhaba' });
		expect(parseCaption(null)).toEqual({});
		expect(parseCaption('not-json')).toEqual({});
		expect(parseCaption('42')).toEqual({});
	});
});

describe('share asset library operations', () => {
	it('orders, toggles, reorders, captions, and deletes', async () => {
		insertRow('sa-1', 0);
		insertRow('sa-2', 1);
		insertRow('sa-3', 2, false);

		expect(listShareAssets().map((row) => row.id)).toEqual(['sa-1', 'sa-2', 'sa-3']);
		expect(listActiveShareAssets().map((row) => row.id)).toEqual(['sa-1', 'sa-2']);

		setShareAssetActive('sa-3', true);
		expect(listActiveShareAssets()).toHaveLength(3);

		moveShareAsset('sa-2', 'up');
		expect(listShareAssets().map((row) => row.id)).toEqual(['sa-2', 'sa-1', 'sa-3']);
		// edges are no-ops
		moveShareAsset('sa-2', 'up');
		moveShareAsset('sa-3', 'down');
		expect(listShareAssets().map((row) => row.id)).toEqual(['sa-2', 'sa-1', 'sa-3']);

		saveShareAssetCaption('sa-1', { tr: 'başlık', en: '  ' });
		expect(parseCaption(listShareAssets()[1].caption)).toEqual({ tr: 'başlık' });
		saveShareAssetCaption('sa-1', {});
		expect(listShareAssets()[1].caption).toBeNull();

		await deleteShareAsset('sa-2'); // R2 unconfigured in tests → cleanup is a no-op
		expect(listShareAssets().map((row) => row.id)).toEqual(['sa-1', 'sa-3']);
		await deleteShareAsset('missing'); // unknown id is a no-op
		expect(listShareAssets()).toHaveLength(2);
	});
});
