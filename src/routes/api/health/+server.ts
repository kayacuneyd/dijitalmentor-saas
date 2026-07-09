import { json } from '@sveltejs/kit';
import { healthCheck } from '$lib/server/ops';
import type { RequestHandler } from './$types';

/** For uptime monitors and scripts/monitor.sh — no auth, no secrets, coarse info only. */
export const GET: RequestHandler = () => {
	const health = healthCheck();
	return json(health, { status: health.ok ? 200 : 503 });
};
