/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

/**
 * Minimal, dynamic-SSR-safe service worker (SaaS host only — registration is
 * host-gated in +layout.svelte; SvelteKit auto-registration is disabled in
 * vite.config.ts).
 *
 * Strategy:
 * - Precache the content-hashed build assets + small static files + /offline.
 * - Navigations are ALWAYS network-first with /offline as the only fallback —
 *   SSR HTML and /api responses are never cached, so a deploy can't be poisoned
 *   by stale pages.
 * - No skipWaiting(): activating mid-session would delete the cache a running
 *   old page still resolves against; the new worker takes over when tabs close.
 */
import { build, files, version } from '$service-worker';

const worker = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `sk-${version}`;

// Skip the heavy marketing/seed media — they are page content, not app shell.
const HEAVY_PREFIXES = ['/seed/', '/examples/', '/templates/'];
const ASSETS = [
	...build,
	...files.filter((f) => !HEAVY_PREFIXES.some((p) => f.startsWith(p)) && f !== '/og.jpg'),
	'/offline'
];

worker.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
			)
			.then(() => worker.clients.claim())
	);
});

worker.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== location.origin) return;

	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request).catch(async () => (await caches.match('/offline')) ?? Response.error())
		);
		return;
	}

	if (ASSETS.includes(url.pathname)) {
		event.respondWith(caches.match(url.pathname).then((cached) => cached ?? fetch(request)));
	}
	// Everything else (API calls, uncached media) goes straight to the network.
});
