import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Web app manifest for the SaaS app only. Tenant hosts never reach this route
 * (host rerouting sends them to /_site/**), but the guard makes the intent
 * explicit and testable — a tenant site must not become installable as
 * "saaskaya".
 */
export const GET: RequestHandler = ({ locals }) => {
	if (locals.isTenantHost) error(404, 'Not found');
	return json(
		{
			name: 'saaskaya',
			short_name: 'saaskaya',
			description: 'AI website platform — describe your practice, publish a multilingual site.',
			id: '/',
			start_url: '/?source=pwa',
			scope: '/',
			display: 'standalone',
			background_color: '#ece7dd',
			theme_color: '#ece7dd',
			icons: [
				{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
				{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
				{ src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
			]
		},
		{ headers: { 'content-type': 'application/manifest+json' } }
	);
};
