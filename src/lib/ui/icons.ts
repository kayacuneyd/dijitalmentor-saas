const stroke = (inner: string, size = 16, label?: string) =>
	`<svg ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const uiIcons = {
	arrowLeft: (size = 16) => stroke('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>', size),
	arrowRight: (size = 16) => stroke('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', size),
	external: (size = 16) =>
		stroke(
			'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
			size
		),
	home: (size = 16) =>
		stroke('<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>', size),
	lock: (size = 16) =>
		stroke(
			'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
			size
		),
	mail: (size = 16) =>
		stroke('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', size),
	menu: (size = 16) => stroke('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>', size),
	message: (size = 16) =>
		stroke('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>', size),
	user: (size = 16) =>
		stroke('<circle cx="12" cy="8" r="3.25"/><path d="M5 20a7 7 0 0 1 14 0"/>', size),
	settings: (size = 16) =>
		stroke(
			'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 1.5-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.1v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.5-1.5.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H7v-2.1h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.5-1.5.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.1v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.5 1.5-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V13h-.2a1.7 1.7 0 0 0-1.6 1z"/>',
			size
		),
	edit: (size = 16) =>
		stroke('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>', size),
	minus: (size = 16) => stroke('<path d="M5 12h14"/>', size),
	plus: (size = 16) => stroke('<path d="M12 5v14M5 12h14"/>', size),
	x: (size = 16) => stroke('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', size)
};
