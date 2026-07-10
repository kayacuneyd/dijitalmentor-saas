/**
 * Minimalist stroke icons for the editor UI (sidebar tabs, viewport switcher,
 * checklist). Hand-drawn to match the landing page's icon convention
 * (`viewBox 0 0 24 24`, `stroke-width 1.8`, round caps/joins) and the inline-SVG
 * pattern already established in `$lib/ui/flags.ts` — rendered via `{@html}`.
 */

const stroke = (inner: string, size = 16) =>
	`<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export type EditorTab = 'Chat' | 'Content' | 'Theme' | 'Pages' | 'Languages' | 'Settings';

export const tabIcons: Record<EditorTab, string> = {
	Chat: stroke('<path d="M4 5h16v10H8l-4 4V5Z"/>'),
	Content: stroke('<path d="M4 6h16M4 12h16M4 18h10"/>'),
	Theme: stroke('<path d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3Z"/>'),
	Pages: stroke(
		'<path d="M7 3h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>'
	),
	Languages: stroke(
		'<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>'
	),
	Settings: stroke(
		'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.3 7.3 0 0 0-2-1.2L14 3h-4l-.5 2.6a7.3 7.3 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L10 21h4l.5-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z"/>'
	)
};

export type Viewport = 'mobile' | 'tablet' | 'desktop';

export const viewportIcons: Record<Viewport, string> = {
	mobile: stroke('<rect x="8" y="2" width="8" height="20" rx="1.5"/><path d="M11 18h2"/>', 15),
	tablet: stroke('<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M11 18h2"/>', 15),
	desktop: stroke(
		'<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
		15
	)
};

export const checkCircleIcon = (size = 14) =>
	`<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="#2f6f6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 5-5.5"/></svg>`;

export const emptyCircleIcon = (size = 14) =>
	`<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/></svg>`;
