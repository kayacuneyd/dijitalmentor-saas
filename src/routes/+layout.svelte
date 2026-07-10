<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

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

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
