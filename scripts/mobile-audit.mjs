#!/usr/bin/env node
/**
 * Read-only mobile UX audit for the local dev server (see docs: mobile roadmap).
 * For each route × viewport it reports: HTTP status, horizontal overflow, console
 * errors, the widest overflowing elements, inputs under 16px (iOS zoom triggers),
 * and interactive elements with sub-44×40px hit areas. Screenshots + report.json
 * go to --out (default: <tmpdir>/saaskaya-mobile-audit).
 *
 * Usage: node scripts/mobile-audit.mjs [--base http://127.0.0.1:5183]
 *   [--routes /en,/en/pricing] [--viewports 375x812,390x844] [--out dir]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
	if (process.argv[i]?.startsWith('--')) args.set(process.argv[i].slice(2), process.argv[i + 1]);
}

const baseUrl = args.get('base') || process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5183';
const outDir = args.get('out') || join(tmpdir(), 'saaskaya-mobile-audit');
const executablePath =
	process.env.CHROMIUM_PATH || '/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

const routes = (
	args.get('routes') ||
	[
		'/en',
		'/en/pricing',
		'/en/templates',
		'/en/about',
		'/en/blog',
		'/en/contact',
		'/en/login',
		'/en/beta',
		'/en/new',
		'/editor/seed-law',
		'/preview/seed-law',
		'/dashboard',
		'/admin'
	].join(',')
)
	.split(',')
	.map((route) => route.trim())
	.filter(Boolean);

const viewports = (args.get('viewports') || '375x812,390x844')
	.split(',')
	.map((pair) => {
		const [width, height] = pair.trim().split('x').map(Number);
		return { width, height };
	})
	.filter((viewport) => viewport.width > 0 && viewport.height > 0);

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const report = [];
let hardFailures = 0;

const auditInPage = () => {
	const viewportWidth = document.documentElement.clientWidth;
	const overflow = document.documentElement.scrollWidth - viewportWidth;

	const visible = (el) => {
		const rect = el.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return false;
		const style = getComputedStyle(el);
		return style.visibility !== 'hidden' && style.display !== 'none';
	};
	const describe = (el) => {
		const cls =
			typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 4) : [];
		const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
		return `<${el.tagName.toLowerCase()}${cls.length ? ' .' + cls.join('.') : ''}>${text ? ` "${text}"` : ''}`;
	};

	const wideElements = [...document.querySelectorAll('body *')]
		.map((el) => ({ el, rect: el.getBoundingClientRect() }))
		.filter(({ el, rect }) => rect.right > viewportWidth + 1 && visible(el))
		.sort((a, b) => b.rect.right - a.rect.right)
		.slice(0, 5)
		.map(({ el, rect }) => `${describe(el)} right=${Math.round(rect.right)}px`);

	const smallFontInputs = [...document.querySelectorAll('input, textarea, select')]
		.filter((el) => visible(el) && el.type !== 'hidden')
		.map((el) => ({ el, size: parseFloat(getComputedStyle(el).fontSize) }))
		.filter(({ size }) => size < 16)
		.map(({ el, size }) => `${describe(el)} ${size}px`);

	const smallHitAreas = [
		...document.querySelectorAll('a, button, input, select, textarea, summary, [role="button"]')
	]
		.filter((el) => visible(el) && el.type !== 'hidden')
		.map((el) => ({ el, rect: el.getBoundingClientRect() }))
		.filter(({ rect }) => rect.width < 44 || rect.height < 40)
		.slice(0, 10)
		.map(
			({ el, rect }) => `${describe(el)} ${Math.round(rect.width)}×${Math.round(rect.height)}px`
		);

	return { overflow, wideElements, smallFontInputs, smallHitAreas };
};

try {
	for (const viewport of viewports) {
		const context = await browser.newContext({ viewport });
		const page = await context.newPage();
		const consoleErrors = [];
		page.on('console', (message) => {
			if (message.type() === 'error') consoleErrors.push(message.text());
		});
		page.on('pageerror', (error) => consoleErrors.push(error.message));

		for (const route of routes) {
			consoleErrors.length = 0;
			const entry = { route, viewport: `${viewport.width}x${viewport.height}` };
			try {
				const response = await page.goto(`${baseUrl}${route}`, {
					waitUntil: 'networkidle',
					timeout: 30_000
				});
				entry.status = response?.status();
				entry.finalUrl = page.url().replace(baseUrl, '') || '/';
				await page.waitForTimeout(400);
				Object.assign(entry, await page.evaluate(auditInPage));
				entry.consoleErrors = [...consoleErrors];
				const slug = `${route.replaceAll('/', '_') || '_root'}-${viewport.width}`;
				await page.screenshot({ path: join(outDir, `${slug}.png`), fullPage: true });
			} catch (error) {
				entry.error = error.message.split('\n')[0];
			}
			if (entry.error || entry.overflow > 1 || entry.consoleErrors?.length) hardFailures += 1;
			report.push(entry);

			const flags = [
				entry.error ? `ERROR ${entry.error}` : null,
				entry.overflow > 1 ? `overflow ${entry.overflow}px` : null,
				entry.consoleErrors?.length ? `${entry.consoleErrors.length} console error(s)` : null,
				entry.smallFontInputs?.length ? `${entry.smallFontInputs.length} input(s) <16px` : null,
				entry.smallHitAreas?.length ? `${entry.smallHitAreas.length} small hit area(s)` : null
			].filter(Boolean);
			console.log(
				`${entry.viewport} ${route} [${entry.status ?? '—'}${
					entry.finalUrl && entry.finalUrl !== route ? ` → ${entry.finalUrl}` : ''
				}] ${flags.length ? flags.join(' · ') : 'clean'}`
			);
			for (const line of entry.wideElements ?? []) console.log(`    wide: ${line}`);
			for (const line of entry.consoleErrors ?? []) console.log(`    console: ${line}`);
		}
		await context.close();
	}
} finally {
	await browser.close();
}

await writeFile(join(outDir, 'report.json'), JSON.stringify(report, null, '\t'));
console.log(`\nreport + screenshots: ${outDir}`);
if (hardFailures > 0) {
	console.error(`mobile audit: ${hardFailures} page(s) with overflow/console errors`);
	process.exit(1);
}
console.log('mobile audit: no overflow or console errors');
