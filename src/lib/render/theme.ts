import type { Theme } from '$lib/schema/site';

/**
 * Maps the `theme` part of the Site contract onto DaisyUI 5 CSS variables.
 * Applied as an inline `style` on the site root so each tenant site carries its
 * own theme without any per-tenant CSS (conventions: DaisyUI tokens + CSS vars only).
 */

const RADIUS: Record<Theme['radius'], { box: string; field: string; selector: string }> = {
	none: { box: '0', field: '0', selector: '0' },
	sm: { box: '0.25rem', field: '0.25rem', selector: '0.25rem' },
	md: { box: '0.5rem', field: '0.375rem', selector: '0.5rem' },
	lg: { box: '1rem', field: '0.5rem', selector: '1rem' },
	full: { box: '2rem', field: '9999px', selector: '9999px' }
};

/** Relative luminance of a hex color (#abc or #aabbcc), 0 = black, 1 = white. */
export function luminance(hex: string): number {
	let h = hex.replace('#', '');
	if (h.length === 3) h = [...h].map((c) => c + c).join('');
	const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
	const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Readable text color (near-black or white) for a given background. */
export function contrastColor(hex: string): string {
	return luminance(hex) > 0.42 ? '#1f2937' : '#ffffff';
}

/** Darken a hex color by a 0–1 amount (used to derive base-200/300 from base-100). */
export function darken(hex: string, amount: number): string {
	let h = hex.replace('#', '');
	if (h.length === 3) h = [...h].map((c) => c + c).join('');
	const channel = (i: number) =>
		Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - amount))
			.toString(16)
			.padStart(2, '0');
	return `#${channel(0)}${channel(2)}${channel(4)}`;
}

/** Inline style string carrying all DaisyUI variables + font vars for a Theme. */
export function themeStyle(theme: Theme): string {
	const { colors, fonts, radius } = theme;
	const base = colors.base ?? '#ffffff';
	const neutral = colors.neutral ?? '#1f2937';
	const r = RADIUS[radius];
	const heroTitleSizes = {
		compact: { left: '3rem', centered: '3.75rem' },
		standard: { left: '3.75rem', centered: '4.75rem' },
		large: { left: '4.5rem', centered: '5.5rem' }
	} as const;
	const hero = heroTitleSizes[theme.heroTitleSize ?? 'standard'];
	const vars: Record<string, string> = {
		'--color-primary': colors.primary,
		'--color-primary-content': contrastColor(colors.primary),
		'--color-secondary': colors.secondary,
		'--color-secondary-content': contrastColor(colors.secondary),
		'--color-accent': colors.accent,
		'--color-accent-content': contrastColor(colors.accent),
		'--color-neutral': neutral,
		'--color-neutral-content': contrastColor(neutral),
		'--color-base-100': base,
		'--color-base-200': darken(base, 0.04),
		'--color-base-300': darken(base, 0.09),
		'--color-base-content': contrastColor(base),
		'--radius-box': r.box,
		'--radius-field': r.field,
		'--radius-selector': r.selector,
		'--font-heading': `'${fonts.heading}', serif`,
		'--font-body': `'${fonts.body}', sans-serif`,
		'--hero-title-left-max': hero.left,
		'--hero-title-centered-max': hero.centered
	};
	return Object.entries(vars)
		.map(([k, v]) => `${k}: ${v}`)
		.join('; ');
}
