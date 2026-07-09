/**
 * Host → internal-path resolution (PLAN §5: tenant by Host header).
 * Pure so it can be unit-tested; `src/hooks.ts` wires it into SvelteKit's reroute.
 *
 * - `<key>.<appHost>/...` → `/_site/<key>/...` (subdomain preview; `*.localhost` works in dev)
 * - any other host        → `/_site/<hostname>/...`, but ONLY when appHost is explicitly
 *   configured — otherwise an unset PUBLIC_APP_HOST would swallow every prod request.
 */
export function resolveHostReroute(url: URL, appHost: string | undefined): string | undefined {
	const hostname = url.hostname;
	const app = appHost || 'localhost';
	if (hostname === app || hostname === 'localhost' || hostname === '127.0.0.1') return undefined;
	if (url.pathname.startsWith('/_site/')) return undefined; // already internal

	const path = url.pathname === '/' ? '' : url.pathname;
	if (hostname.endsWith(`.${app}`)) {
		const sub = hostname.slice(0, -(app.length + 1));
		if (sub && !sub.includes('.')) return `/_site/${sub}${path}`;
	}
	// custom-domain lookup (data exists from M5 on) — only with explicit config
	if (appHost) return `/_site/${hostname}${path}`;
	return undefined;
}
