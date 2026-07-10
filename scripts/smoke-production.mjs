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

		for (const path of [
			'/en',
			'/en/pricing',
			'/en/templates',
			'/en/about',
			'/en/contact',
			'/en/blog',
			'/en/blog/ai-assisted-website-building',
			'/en/login',
			'/en/beta'
		]) {
			const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
			if (response?.status() !== 200) {
				failures.push(`${viewport.name} ${path}: expected 200, got ${response?.status()}`);
			}
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			if (overflow > 1)
				failures.push(`${viewport.name} ${path}: horizontal overflow ${overflow}px`);
			await page.locator('img').evaluateAll((images) => {
				for (const image of images) image.scrollIntoView({ block: 'center', inline: 'center' });
			});
			await page.waitForLoadState('networkidle');
			await page.locator('img').evaluateAll((images) =>
				Promise.all(
					images.map(
						(image) =>
							new Promise((resolve) => {
								if (image.complete) {
									resolve(undefined);
									return;
								}
								image.addEventListener('load', () => resolve(undefined), { once: true });
								image.addEventListener('error', () => resolve(undefined), { once: true });
							})
					)
				)
			);
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
		['/', 307],
		['/dashboard', 303],
		// Phase 2 guided onboarding is intentionally anonymous-reachable; the auth gate
		// now lives at /api/onboarding/finish, right before spending an AI generation.
		['/new', 307],
		['/beta', 307],
		['/profile/start', 307],
		['/pricing', 307],
		['/templates', 307],
		['/about', 307],
		['/contact', 307],
		['/blog', 307],
		['/blog/ai-assisted-website-building', 307],
		['/legal/privacy', 307],
		['/legal/terms', 307],
		['/legal/kvkk', 307],
		['/legal/acceptable-use', 307],
		['/legal/refund', 307],
		['/legal/disclaimer', 307],
		['/en', 200],
		['/tr', 200],
		['/de', 200],
		['/en/new', 200],
		['/tr/new', 200],
		['/de/new', 200],
		['/en/beta', 200],
		['/tr/beta', 200],
		['/de/beta', 200],
		['/en/profile/start', 303],
		['/tr/profile/start', 303],
		['/de/profile/start', 303],
		['/en/pricing', 200],
		['/tr/pricing', 200],
		['/de/pricing', 200],
		['/en/templates', 200],
		['/tr/templates', 200],
		['/de/templates', 200],
		['/en/about', 200],
		['/tr/about', 200],
		['/de/about', 200],
		['/en/contact', 200],
		['/tr/contact', 200],
		['/de/contact', 200],
		['/en/blog', 200],
		['/tr/blog', 200],
		['/de/blog', 200],
		['/en/blog/ai-assisted-website-building', 200],
		['/tr/blog/ai-assisted-website-building', 200],
		['/de/blog/ai-assisted-website-building', 200],
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
