import { describe, expect, it } from 'vitest';
import { validateImage } from './media';

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
});
