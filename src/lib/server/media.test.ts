import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { prepareStoredImage, prepareStoredMedia, validateImage } from './media';

describe('media image validation', () => {
	it('accepts bytes matching the declared image type', () => {
		expect(validateImage(Uint8Array.from([0xff, 0xd8, 0xff]), 'image/jpeg')).toBe('image/jpeg');
		expect(
			validateImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'image/png')
		).toBe('image/png');
	});

	it('rejects spoofed and unsupported files', () => {
		expect(() => validateImage(new TextEncoder().encode('<svg></svg>'), 'image/png')).toThrow(
			/valid JPEG/
		);
		expect(() => validateImage(Uint8Array.from([0xff, 0xd8]), 'image/svg+xml')).toThrow(
			/valid JPEG/
		);
	});

	it('preserves safe SVG uploads and rejects active content', async () => {
		const safeSvg = new TextEncoder().encode(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>'
		);
		const stored = await prepareStoredMedia(safeSvg, '', 'mark.svg');
		expect(stored.mimeType).toBe('image/svg+xml');
		expect(stored.extension).toBe('svg');
		expect(new TextDecoder().decode(stored.bytes)).toContain('<path');

		await expect(
			prepareStoredMedia(
				new TextEncoder().encode('<svg><script>alert(1)</script></svg>'),
				'image/svg+xml',
				'unsafe.svg'
			)
		).rejects.toThrow(/unsafe content/);
		await expect(
			prepareStoredMedia(
				new TextEncoder().encode('<svg><image href="https://example.com/x.png"/></svg>'),
				'image/svg+xml',
				'remote.svg'
			)
		).rejects.toThrow(/unsafe content/);
	});

	it('stores raster uploads as WebP except GIF', async () => {
		const png = Uint8Array.from(
			await sharp({
				create: { width: 1, height: 1, channels: 3, background: '#ffffff' }
			})
				.png()
				.toBuffer()
		);
		const stored = await prepareStoredImage(png, 'image/png');
		expect(stored.mimeType).toBe('image/webp');
		expect(stored.extension).toBe('webp');
		expect(stored.bytes.byteLength).toBeGreaterThan(0);

		const gif = Uint8Array.from(Buffer.from('GIF89a'));
		const storedGif = await prepareStoredImage(gif, 'image/gif');
		expect(storedGif.mimeType).toBe('image/gif');
		expect(storedGif.bytes).toBe(gif);
	});
});
