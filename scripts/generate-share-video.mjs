#!/usr/bin/env node
/**
 * Produce the story-share starter assets from the /dev/story-stage page
 * (1080×1920 branded frame around the hero FlowAnimation):
 *   - saaskaya-story.mp4  (~20s, H.264 + yuv420p + faststart, silent*)
 *   - saaskaya-story-1/3/5.png  (scene stills as starter images)
 *
 * Requires the dev server (npm run dev -- --port 5183) and system ffmpeg.
 * Upload the results through /admin/share — this script is a one-time
 * producer, not a runtime dependency.
 *
 * (*) Instagram accepts silent MP4s. If a target app ever rejects a silent
 * stream, re-encode with a null audio track:
 *   ffmpeg -i in.mp4 -f lavfi -i anullsrc=r=44100:cl=stereo -shortest \
 *     -c:v copy -c:a aac out.mp4
 *
 *   node scripts/generate-share-video.mjs [--base http://localhost:5183] [--out dir]
 */
import { execFileSync } from 'node:child_process';
import { mkdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
	if (process.argv[i]?.startsWith('--')) args.set(process.argv[i].slice(2), process.argv[i + 1]);
}
const base = args.get('base') || 'http://localhost:5183';
const outDir = args.get('out') || 'data/share-video';
const executablePath =
	process.env.CHROMIUM_PATH || '/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const SIZE = { width: 1080, height: 1920 };

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });

try {
	// --- pass 1: record one full 5×4s scene loop ---
	console.log('recording…');
	const recCtx = await browser.newContext({
		viewport: SIZE,
		recordVideo: { dir: outDir, size: SIZE }
	});
	const recPage = await recCtx.newPage();
	await recPage.goto(`${base}/dev/story-stage`, { waitUntil: 'networkidle' });
	await recPage.waitForTimeout(21_500);
	const video = recPage.video();
	await recCtx.close();
	const webmPath = await video.path();

	const mp4Path = join(outDir, 'saaskaya-story.mp4');
	console.log('transcoding to H.264…');
	execFileSync(
		'ffmpeg',
		[
			'-y',
			'-i',
			webmPath,
			'-ss',
			'1',
			'-t',
			'20',
			'-vf',
			'fps=30',
			'-c:v',
			'libx264',
			'-pix_fmt',
			'yuv420p',
			'-profile:v',
			'high',
			'-crf',
			'20',
			'-movflags',
			'+faststart',
			'-an',
			mp4Path
		],
		{ stdio: ['ignore', 'ignore', 'inherit'] }
	);
	await rename(webmPath, join(outDir, 'saaskaya-story.webm'));

	// --- pass 2: scene stills as starter images ---
	const page = await browser.newPage({ viewport: SIZE });
	await page.goto(`${base}/dev/story-stage`, { waitUntil: 'networkidle' });
	for (const scene of ['01', '03', '05']) {
		await page
			.locator('.scene-chrome-label span', { hasText: `${scene} / 05` })
			.waitFor({ timeout: 25_000 });
		await page.waitForTimeout(1_500);
		const still = join(outDir, `saaskaya-story-${Number(scene)}.png`);
		await page.screenshot({ path: still });
		console.log(`still: ${still}`);
	}
	await page.close();

	const probe = execFileSync('ffprobe', [
		'-v',
		'error',
		'-select_streams',
		'v:0',
		'-show_entries',
		'stream=codec_name,width,height,pix_fmt,duration',
		'-of',
		'default=noprint_wrappers=1',
		mp4Path
	]).toString();
	console.log(`\n${mp4Path}\n${probe}`);
	console.log('done — upload the MP4 + PNGs via /admin/share');
} finally {
	await browser.close();
}
