import type { Reroute } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { resolveAppReroute } from '$lib/reroute';

export const reroute: Reroute = ({ url }) => resolveAppReroute(url, env.PUBLIC_APP_HOST);
