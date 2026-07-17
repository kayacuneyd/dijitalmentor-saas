#!/usr/bin/env node
/**
 * Rasterize static/logo.svg into the PWA icon set (static/icons/) using the
 * playwright-core chromium already installed for the verify skill — no sharp/
 * resvg dependency. Run once and commit the PNGs; rerun after brand changes.
 *
 *   node scripts/generate-pwa-icons.mjs
 */
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'static', 'icons');
const executablePath =
	process.env.CHROMIUM_PATH || '/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

const svg = await readFile(join(root, 'static', 'logo.svg'), 'utf8');
const svgData = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

/** Transparent-background targets keep the SVG's own rounded rect; full-bleed
 *  targets paint the brand ink to the edges (maskable safe zone / iOS mask). */
const targets = [
	{ file: 'icon-192.png', size: 192, fullBleed: false, glyphScale: 1 },
	{ file: 'icon-512.png', size: 512, fullBleed: false, glyphScale: 1 },
	{ file: 'maskable-512.png', size: 512, fullBleed: true, glyphScale: 0.8 },
	{ file: 'apple-touch-icon.png', size: 180, fullBleed: true, glyphScale: 0.86 }
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
try {
	for (const { file, size, fullBleed, glyphScale } of targets) {
		const page = await browser.newPage({ viewport: { width: size, height: size } });
		const glyph = Math.round(size * glyphScale);
		await page.setContent(
			`<body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;` +
				`background:${fullBleed ? '#171614' : 'transparent'}">` +
				`<img src="${svgData}" width="${glyph}" height="${glyph}" style="display:block"></body>`
		);
		await page.waitForTimeout(150);
		await page.screenshot({
			path: join(outDir, file),
			omitBackground: !fullBleed
		});
		await page.close();
		console.log(`${file} (${size}x${size}${fullBleed ? ', full-bleed' : ''})`);
	}
} finally {
	await browser.close();
}
console.log(`icons written to ${outDir}`);
