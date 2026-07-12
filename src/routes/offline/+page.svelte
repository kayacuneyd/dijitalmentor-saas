<!-- Served by the service worker as the navigation fallback at ANY url depth,
     where the app's relative asset paths (CSS/JS chunks) don't resolve — so this
     page must be fully self-contained: inline styles only, no hydration-dependent
     behavior (the link retriggers a navigation, which retries the network). -->
<svelte:head>
	<title>Offline · saaskaya</title>
	<meta name="robots" content="noindex" />
	<style>
		.sk-offline {
			min-height: 100svh;
			display: grid;
			place-items: center;
			padding: 1.5rem;
			background: #ece7dd;
			font-family: ui-sans-serif, system-ui, sans-serif;
		}
		.sk-offline-card {
			max-width: 24rem;
			width: 100%;
			border: 1px solid rgb(23 22 20 / 0.1);
			border-radius: 14px;
			background: #fbfaf7;
			padding: 1.5rem;
			color: #171614;
		}
		.sk-offline-mark {
			display: inline-grid;
			place-items: center;
			width: 2.25rem;
			height: 2.25rem;
			border-radius: 10px;
			background: #171614;
			color: #f3ecdd;
			font-weight: 800;
			font-size: 1.1rem;
		}
		.sk-offline h1 {
			margin: 1rem 0 0.25rem;
			font-size: 1.15rem;
			font-weight: 700;
		}
		.sk-offline p {
			margin: 0;
			font-size: 0.9rem;
			line-height: 1.6;
			color: rgb(23 22 20 / 0.62);
		}
		.sk-offline a {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			margin-top: 1.25rem;
			min-height: 2.75rem;
			padding: 0.5rem 1.25rem;
			border-radius: 9px;
			background: #171614;
			color: #f3ecdd;
			font-size: 0.9rem;
			font-weight: 500;
			text-decoration: none;
		}
	</style>
</svelte:head>

<main class="sk-offline">
	<div class="sk-offline-card">
		<span class="sk-offline-mark">s</span>
		<h1>İnternet bağlantısı yok</h1>
		<p>You appear to be offline. · Du scheinst offline zu sein.</p>
		<a href="/">Tekrar dene · Retry</a>
	</div>
</main>
