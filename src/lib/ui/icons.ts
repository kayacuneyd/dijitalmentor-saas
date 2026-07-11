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
	mail: (size = 16) =>
		stroke('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', size),
	message: (size = 16) =>
		stroke('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>', size),
	minus: (size = 16) => stroke('<path d="M5 12h14"/>', size),
	plus: (size = 16) => stroke('<path d="M12 5v14M5 12h14"/>', size),
	x: (size = 16) => stroke('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', size)
};
