<script lang="ts">
	import FlowAnimation from '$lib/ui/FlowAnimation.svelte';

	let { data } = $props();

	const sceneLabels = ['Anlat', 'AI üretir', 'Canlı önizleme', 'Düzenle', 'Yayınla'] as [
		string,
		string,
		string,
		string,
		string
	];
</script>

<svelte:head>
	<title>story stage · dev</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="story-stage">
	<header>
		<div class="mark">s</div>
		<div class="word">saaskaya</div>
		<p class="claim">Pratiğini anlat, çok dilli siten dakikalar içinde yayında.</p>
		<div class="eyebrow">AI · TR · EN · DE</div>
	</header>

	<main>
		<FlowAnimation {sceneLabels} loopCaption="" reducedMotionCaption="" />
	</main>

	<footer>
		<div class="rule"></div>
		<div class="footer-row">
			<div class="url">saaskaya.com</div>
			<div class="qr">{@html data.qrSvg}</div>
		</div>
	</footer>
</div>

<style>
	.story-stage {
		width: 1080px;
		height: 1920px;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, #ece7dd 0%, #e3ddcf 100%);
		color: #171614;
		overflow: hidden;
	}

	header {
		flex: 0 0 auto;
		padding: 110px 90px 40px;
		text-align: left;
	}

	.mark {
		display: inline-grid;
		place-items: center;
		width: 96px;
		height: 96px;
		border-radius: 24px;
		background: #171614;
		color: #f3ecdd;
		font-family: var(--font-display);
		font-size: 56px;
		font-weight: 800;
	}

	.word {
		margin-top: 28px;
		font-family: var(--font-display);
		font-size: 84px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.claim {
		margin: 24px 0 0;
		max-width: 860px;
		font-size: 44px;
		line-height: 1.35;
		color: rgb(23 22 20 / 0.72);
	}

	.eyebrow {
		margin-top: 28px;
		font-family: var(--font-mono);
		font-size: 26px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: rgb(23 22 20 / 0.45);
	}

	main {
		flex: 1 1 auto;
		display: flex;
		align-items: center;
		padding: 0 50px;
	}

	main :global(> *) {
		width: 100%;
	}

	footer {
		flex: 0 0 auto;
		padding: 40px 90px 110px;
	}

	.rule {
		height: 10px;
		width: 220px;
		border-radius: 999px;
		background: #d9a441;
	}

	.footer-row {
		margin-top: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 40px;
	}

	.url {
		font-family: var(--font-mono);
		font-size: 52px;
		font-weight: 600;
		letter-spacing: 0.04em;
	}

	.qr {
		width: 210px;
		height: 210px;
		overflow: hidden;
		border-radius: 18px;
		border: 6px solid #171614;
		background: #fff;
	}

	.qr :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
