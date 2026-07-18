import type { Theme } from '$lib/schema/site';

/**
 * The 3 niche theme presets (constitution: max 3 at launch — law · psych · dental).
 * Presets are the canonical starting themes: seeds embed them, the AI picks one and
 * may only tweak colors/fonts/radius within the Theme schema.
 */
export const themePresets: Record<Theme['preset'], Theme> = {
	law: {
		preset: 'law',
		colors: { primary: '#1e3a5f', secondary: '#b08d57', accent: '#27548a' },
		fonts: { heading: 'Playfair Display', body: 'Inter' },
		radius: 'sm',
		heroTitleSize: 'standard'
	},
	psych: {
		preset: 'psych',
		colors: { primary: '#2f6f6a', secondary: '#9ec5ab', accent: '#e8998d' },
		fonts: { heading: 'Lora', body: 'Open Sans' },
		radius: 'lg',
		heroTitleSize: 'standard'
	},
	dental: {
		preset: 'dental',
		colors: { primary: '#0e7490', secondary: '#38bdf8', accent: '#f59e0b' },
		fonts: { heading: 'Poppins', body: 'Roboto' },
		radius: 'md',
		heroTitleSize: 'standard'
	}
};
