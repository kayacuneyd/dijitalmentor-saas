import type { Reroute } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { resolveHostReroute } from '$lib/hostRouting';

export const reroute: Reroute = ({ url }) => resolveHostReroute(url, env.PUBLIC_APP_HOST);
