<script lang="ts">
	import './layout.css';
	import { dev } from '$app/environment';
	import { setTranslateContext } from '$lib/i18n/context';

	// Self-hosted (no Google Fonts CDN request from a SaaS page — no third-party
	// tracking beacon, no render-blocking cross-origin fetch). Tenant-theme fonts
	// (Playfair/Lora/Poppins/Open Sans/Roboto/Inter) are self-hosted separately in
	// SiteRenderer.svelte so SaaS pages never pay for weights only tenant sites use.
	import '@fontsource/nunito/latin.css';
	import '@fontsource/nunito/latin-ext.css';
	import '@fontsource/nunito/latin-800.css';
	import '@fontsource/nunito/latin-ext-800.css';
	import '@fontsource/ibm-plex-mono/latin.css';
	import '@fontsource/ibm-plex-mono/latin-ext.css';

	let { data, children } = $props();

	setTranslateContext(
		() => data.locale,
		() => data.messageOverrides
	);

	// PWA is SaaS-app-only: tenant origins (*.saaskaya.com, custom domains) share
	// this layout via Host rerouting and must never install the saaskaya app —
	// SvelteKit's automatic registration is disabled in vite.config.ts and this
	// manual registration is host-gated (as are the manifest link and endpoint).
	$effect(() => {
		if (dev || data.isTenantHost || !('serviceWorker' in navigator)) return;
		navigator.serviceWorker.register('/service-worker.js');
	});
</script>

<svelte:head>
	<link rel="icon" href={data.platformBranding?.iconUrl ?? '/logo.svg'} type={data.platformBranding?.iconMime ?? 'image/svg+xml'} />
	<link rel="apple-touch-icon" href={data.platformBranding?.iconUrl ?? '/logo.svg'} />
	{#if !data.isTenantHost}
		<link rel="manifest" href="/manifest.webmanifest" />
		<meta name="theme-color" content="#ece7dd" />
		{#if data.googleSiteVerification}
			<meta name="google-site-verification" content={data.googleSiteVerification} />
		{/if}
		{#if data.gaMeasurementId}
			<script
				async
				src={`https://www.googletagmanager.com/gtag/js?id=${data.gaMeasurementId}`}
			></script>
			{@html `<script>
				window.dataLayer = window.dataLayer || [];
				function gtag(){dataLayer.push(arguments);}
				gtag('js', new Date());
				gtag('config', '${data.gaMeasurementId}');
			</script>`}
		{/if}
	{/if}
</svelte:head>
{@render children()}
