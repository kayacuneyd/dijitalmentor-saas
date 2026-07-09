#!/usr/bin/env node
/**
 * Read-only production smoke test. It never signs in, mutates tenant data, sends
 * email, spends AI credits, uploads media, or exercises payment/domain APIs.
 */
import { chromium } from 'playwright-core';

const baseUrl = process.env.SMOKE_BASE_URL || 'https://saaskaya.com';
const executablePath =
	process.env.CHROMIUM_PATH || '/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';

const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const failures = [];

try {
	for (const viewport of [
		{ name: 'mobile', width: 375, height: 812 },
		{ name: 'desktop', width: 1365, height: 900 }
	]) {
		const context = await browser.newContext({
			viewport: { width: viewport.width, height: viewport.height }
		});
		const page = await context.newPage();
		const consoleErrors = [];
		page.on('console', (message) => {
			if (message.type() === 'error') consoleErrors.push(message.text());
		});
		page.on('pageerror', (error) => consoleErrors.push(error.message));

		for (const path of ['/', '/login']) {
			const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
			if (response?.status() !== 200) {
				failures.push(`${viewport.name} ${path}: expected 200, got ${response?.status()}`);
			}
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			if (overflow > 1)
				failures.push(`${viewport.name} ${path}: horizontal overflow ${overflow}px`);
			const brokenImages = await page
				.locator('img')
				.evaluateAll((images) =>
					images
						.filter((image) => !image.complete || image.naturalWidth === 0)
						.map((image) => image.getAttribute('src') || '(missing src)')
				);
			if (brokenImages.length > 0) {
				failures.push(`${viewport.name} ${path}: broken images ${brokenImages.join(', ')}`);
			}
		}

		if (consoleErrors.length > 0) {
			failures.push(`${viewport.name}: console errors: ${consoleErrors.join(' | ')}`);
		}
		await context.close();
	}

	const request = await browser.newContext();
	for (const [path, expected] of [
		['/api/health', 200],
		['/sitemap.xml', 200],
		['/dashboard', 303],
		['/new', 303],
		['/does-not-exist', 404]
	]) {
		const response = await request.request.get(`${baseUrl}${path}`, { maxRedirects: 0 });
		if (response.status() !== expected) {
			failures.push(`${path}: expected ${expected}, got ${response.status()}`);
		}
	}
	await request.close();
} finally {
	await browser.close();
}

if (failures.length > 0) {
	console.error(`production smoke failed:\n- ${failures.join('\n- ')}`);
	process.exit(1);
}

console.log(`production smoke passed: ${baseUrl} (mobile + desktop, public read-only surface)`);
