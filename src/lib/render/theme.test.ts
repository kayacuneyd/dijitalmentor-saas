import { describe, expect, it } from 'vitest';
import { contrastColor, darken, themeStyle } from './theme';
import { themePresets } from '$lib/presets';

describe('contrastColor', () => {
	it('puts white text on dark backgrounds and dark text on light ones', () => {
		expect(contrastColor('#1e3a5f')).toBe('#ffffff'); // law navy
		expect(contrastColor('#ffffff')).toBe('#1f2937');
		expect(contrastColor('#9ec5ab')).toBe('#1f2937'); // psych light green
		expect(contrastColor('#fff')).toBe('#1f2937'); // 3-digit form
	});
});

describe('darken', () => {
	it('scales channels down and keeps a valid hex', () => {
		expect(darken('#ffffff', 0.04)).toMatch(/^#[0-9a-f]{6}$/);
		expect(darken('#ffffff', 0)).toBe('#ffffff');
		expect(darken('#000000', 0.5)).toBe('#000000');
	});
});

describe('themeStyle', () => {
	it.each(Object.entries(themePresets))('emits all DaisyUI vars for the %s preset', (_n, theme) => {
		const style = themeStyle(theme);
		for (const v of [
			'--color-primary',
			'--color-primary-content',
			'--color-secondary',
			'--color-accent',
			'--color-base-100',
			'--color-base-200',
			'--color-base-content',
			'--radius-box',
			'--font-heading',
			'--font-body'
		]) {
			expect(style).toContain(v);
		}
		expect(style).toContain(theme.colors.primary);
		expect(style).toContain(theme.fonts.heading);
	});
});
