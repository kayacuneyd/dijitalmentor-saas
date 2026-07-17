import { describe, expect, it } from 'vitest';
import { assertSafeSvg } from './branding';

describe('platform branding SVG validation', () => {
	it('accepts the supplied logo shape', () => {
		expect(assertSafeSvg(new TextEncoder().encode('<svg viewBox="0 0 10 10"><path /></svg>'))).toContain(
			'<svg'
		);
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
