import { describe, expect, it } from 'vitest';
import {
	assertSafeSvg,
	DEFAULT_LOGO_URL,
	DEFAULT_MASCOT_URL,
	isBrandAssetTarget
} from './branding';

describe('platform branding SVG validation', () => {
	it('keeps the full supplied composition as logo and the bee as mascot', () => {
		expect(DEFAULT_LOGO_URL).toBe('/do-more-with-less-download-free-ebook.svg');
		expect(DEFAULT_MASCOT_URL).toBe('/mascot-bee.svg');
		expect(['logo', 'icon', 'mascot'].every(isBrandAssetTarget)).toBe(true);
		expect(isBrandAssetTarget('banner')).toBe(false);
	});
	it('accepts the supplied logo shape', () => {
		expect(
			assertSafeSvg(new TextEncoder().encode('<svg viewBox="0 0 10 10"><path /></svg>'))
		).toContain('<svg');
	});

	it('rejects executable and external SVG content', () => {
		for (const svg of [
			'<svg><script>alert(1)</script></svg>',
			'<svg onload="alert(1)"></svg>',
			'<svg><image href="javascript:alert(1)" /></svg>',
			'<svg><foreignObject /></svg>'
		]) {
			expect(() => assertSafeSvg(new TextEncoder().encode(svg))).toThrow(/unsafe|unsupported/i);
		}
	});

	it('rejects oversized SVG files', () => {
		expect(() => assertSafeSvg(new Uint8Array(1_048_577))).toThrow(/1 MB/i);
	});
});
