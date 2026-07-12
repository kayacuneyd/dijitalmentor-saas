export type ShareOutcome = 'shared' | 'fallback' | 'cancelled';

/**
 * One-tap story share: copies the page URL to the clipboard (so the user can
 * paste it as an Instagram Link sticker) and hands the file to the native
 * share sheet. Returns 'fallback' when file sharing is unavailable — common
 * inside Instagram/WhatsApp in-app webviews — so callers can show download
 * instructions instead.
 */
export async function shareStory(input: {
	file: File;
	url?: string;
	text?: string;
}): Promise<ShareOutcome> {
	if (typeof navigator === 'undefined') return 'fallback';
	if (input.url) {
		await navigator.clipboard?.writeText(input.url).catch(() => undefined);
	}
	if (!navigator.share || !navigator.canShare?.({ files: [input.file] })) return 'fallback';
	try {
		await navigator.share({ files: [input.file], ...(input.text ? { text: input.text } : {}) });
		return 'shared';
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
		return 'fallback';
	}
}

/** Feature-detect file sharing without touching the network. */
export function canShareFiles(): boolean {
	if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false;
	try {
		return navigator.canShare({
			files: [new File([new Uint8Array(4)], 'probe.png', { type: 'image/png' })]
		});
	} catch {
		return false;
	}
}
