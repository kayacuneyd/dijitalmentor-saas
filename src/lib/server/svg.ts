export const MAX_SVG_BYTES = 1024 * 1024;

export class SvgValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SvgValidationError';
	}
}

/**
 * Validates uploaded SVG markup before it can be served from the public media bucket.
 * SVG stays vector-native, but active content, nested documents and remote resources
 * are deliberately excluded.
 */
export function assertSafeSvg(bytes: Uint8Array): string {
	if (bytes.byteLength > MAX_SVG_BYTES) {
		throw new SvgValidationError('SVG must be 1 MB or smaller.');
	}

	const svg = new TextDecoder()
		.decode(bytes)
		.replace(/^\uFEFF/, '')
		.trim();

	if (!/^<svg(?:\s|>)/i.test(svg) || !/<\/svg>\s*$/i.test(svg)) {
		throw new SvgValidationError('Upload a valid SVG image.');
	}

	if (
		/<\s*!\s*(?:doctype|entity)\b/i.test(svg) ||
		/<\s*(?:script|foreignObject|iframe|object|embed|audio|video|canvas)\b/i.test(svg) ||
		/\bon[a-z]+\s*=/i.test(svg) ||
		/(?:javascript|vbscript)\s*:/i.test(svg) ||
		/\bdata\s*:/i.test(svg) ||
		/@import|expression\s*\(/i.test(svg) ||
		/\b(?:href|xlink:href)\s*=\s*["']\s*(?!#)[^"']+/i.test(svg) ||
		/url\s*\(\s*["']?\s*(?!#)/i.test(svg)
	) {
		throw new SvgValidationError('This SVG contains unsupported or unsafe content.');
	}

	return svg;
}
