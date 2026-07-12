<script lang="ts">
	/**
	 * Native Svelte port of docs/animation/Saaskaya Flow Animation.dc.html — same
	 * palette, keyframes, and demo content (a real Turkish lawyer's onboarding),
	 * just re-implemented without the proprietary dc-runtime. Timers only run
	 * while the stage is on-screen and the tab is active, and respect
	 * prefers-reduced-motion (static Scene 1 with the full text, no timers).
	 */
	type Props = {
		/** Exactly 5 labels, one per scene, in the caller's locale. */
		sceneLabels: [string, string, string, string, string];
		loopCaption?: string;
		reducedMotionCaption?: string;
	};

	let {
		sceneLabels,
		loopCaption = '~20s loop · auto-play',
		reducedMotionCaption = 'respects prefers-reduced-motion'
	}: Props = $props();

	const FULL_TEXT =
		"Ben Av. Zeynep Demir. İstanbul'da 12 yıldır aile hukuku ve arabuluculuk yapıyorum. Türkçe, İngilizce, Almanca danışmanlık veriyorum.";

	const SCHEMA_BLOCKS = [
		{ title: 'Hero', meta: 'headline · CTA · locale switcher', tag: 'hero.v1', delay: '0.1s' },
		{
			title: 'Services',
			meta: '4 items · Aile · Boşanma · Arabuluculuk · Vesayet',
			tag: 'grid.v2',
			delay: '0.5s'
		},
		{ title: 'About', meta: 'bio · timeline · references', tag: 'prose.v1', delay: '0.9s' },
		{ title: 'Contact', meta: 'form · map · calendar', tag: 'form.v1', delay: '1.3s' }
	];

	const PROGRESS_STEPS = [
		{ mark: '✓', label: 'reading intake', color: '#2f6f6a', delay: '0.2s' },
		{ mark: '✓', label: 'picking preset · law', color: '#2f6f6a', delay: '0.7s' },
		{ mark: '✓', label: 'drafting pages', color: '#2f6f6a', delay: '1.2s' },
		{ mark: '↳', label: 'writing TR / EN / DE', color: '#b8532f', delay: '1.7s' }
	];

	const EDIT_STATES = [
		{
			locale: 'TR',
			headline: 'Aile hukukunda güvenilir eller.',
			sub: 'İstanbul · 12 yıl deneyim',
			body: '12 yıldır ailelere hukuki destek sunuyorum. Empatiyle, netlikle.',
			preset: 0
		},
		{
			locale: 'EN',
			headline: 'A steady hand in family law.',
			sub: 'Istanbul · 12 years',
			body: 'Twelve years supporting families through legal transitions. Clear, humane.',
			preset: 0
		},
		{
			locale: 'DE',
			headline: 'Verlässlich im Familienrecht.',
			sub: 'Istanbul · 12 Jahre',
			body: 'Zwölf Jahre lang begleite ich Familien durch rechtliche Übergänge.',
			preset: 1
		},
		{
			locale: 'DE',
			headline: 'Verlässlich im Familienrecht.',
			sub: 'Istanbul · 12 Jahre',
			body: 'Zwölf Jahre lang begleite ich Familien durch rechtliche Übergänge.',
			preset: 2
		}
	];

	const PRESET_COLORS = ['#1e3a5f', '#2f6f6a', '#0e7490'];
	const PRESET_NAMES = ['law', 'psych', 'dental'];
	const CONFETTI_COLORS = ['#b8532f', '#1e3a5f', '#2f6f6a', '#0e7490', '#171614'];

	function makeConfetti() {
		return Array.from({ length: 22 }, (_, i) => {
			const angle = (i / 22) * Math.PI * 2;
			const dist = 180 + Math.random() * 160;
			return {
				x: (48 + (Math.random() - 0.5) * 6).toFixed(1) + '%',
				size: (4 + Math.random() * 5).toFixed(1) + 'px',
				color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
				dx: (Math.cos(angle) * dist).toFixed(0) + 'px',
				dy: (Math.sin(angle) * dist - 40).toFixed(0) + 'px',
				r: (Math.random() * 720 - 360).toFixed(0) + 'deg',
				delay: (Math.random() * 0.6).toFixed(2) + 's'
			};
		});
	}

	/* Scenes are composed at a fixed design width and scaled uniformly to the
	   container, so fixed-px scene elements never clip or overlap at any width. */
	const DESIGN_WIDTH = 720;

	let stageEl: HTMLDivElement | undefined = $state();
	let stageWidth = $state(0);
	let reduced = $state(false);
	let visible = $state(false);
	let scene = $state(0);
	let typed = $state('');
	let editIdx = $state(0);
	let confetti = $state<ReturnType<typeof makeConfetti>>([]);

	const stageScale = $derived(stageWidth > 0 ? stageWidth / DESIGN_WIDTH : 1);

	const editState = $derived(EDIT_STATES[editIdx]);
	const heroColor = $derived(PRESET_COLORS[editState.preset]);
	const typedText = $derived(reduced ? FULL_TEXT : typed);

	const presets = $derived(
		PRESET_NAMES.map((name, i) => ({
			name,
			color: PRESET_COLORS[i],
			border: i === editState.preset ? '#171614' : 'transparent',
			opacity: i === editState.preset ? 1 : 0.55
		}))
	);

	const locales = $derived(
		(['TR', 'EN', 'DE'] as const).map((code) => ({
			code,
			bg: code === editState.locale ? '#171614' : 'transparent',
			fg: code === editState.locale ? '#fbfaf7' : '#4a4640',
			border: code === editState.locale ? '#171614' : 'rgba(0,0,0,.12)'
		}))
	);

	$effect(() => {
		reduced =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	});

	$effect(() => {
		if (!stageEl || reduced) return;
		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
		});
		observer.observe(stageEl);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (reduced || !visible || typeof document === 'undefined') return;
		if (document.hidden) return;

		const sceneTimer = setInterval(() => {
			scene = (scene + 1) % 5;
			typed = '';
			if (scene === 4) confetti = makeConfetti();
		}, 4000);

		const typeTimer = setInterval(() => {
			if (scene !== 0) return;
			if (typed.length < FULL_TEXT.length) typed = FULL_TEXT.slice(0, typed.length + 1);
		}, 45);

		const editTimer = setInterval(() => {
			editIdx = (editIdx + 1) % EDIT_STATES.length;
		}, 1000);

		return () => {
			clearInterval(sceneTimer);
			clearInterval(typeTimer);
			clearInterval(editTimer);
		};
	});
</script>

<div
	bind:this={stageEl}
	bind:clientWidth={stageWidth}
	data-testid="flow-animation-stage"
	class="flow-viewport"
	style:aspect-ratio="16 / 9"
>
	<div
		class="flow-stage"
		style:width="{DESIGN_WIDTH}px"
		style:aspect-ratio="16 / 9"
		style:transform="scale({stageScale})"
	>
		<!-- scene chrome: label + progress dots -->
		<div class="scene-chrome-label">
			<span class="dot"></span>
			<span>0{scene + 1} / 05 · {sceneLabels[scene]}</span>
		</div>
		<div class="scene-dots">
			{#each sceneLabels as _, i (i)}
				<span class="dot-bar" class:active={i === scene}></span>
			{/each}
		</div>

		{#if scene === 0}
			<!-- ============ SCENE 1: Describe yourself ============ -->
			<div class="scene sk-anim">
				<div class="grid-wrap">
					<div class="grid-plane sk-anim"></div>
				</div>
				<div class="describe-card">
					<div class="describe-card-head">
						<div class="mono-label">tell saaskaya about you</div>
						<div class="dots-row">
							<span class="chrome-dot"></span>
							<span class="chrome-dot"></span>
							<span class="chrome-dot"></span>
						</div>
					</div>
					<div class="typed-text">
						{typedText}<span class="cursor sk-anim"></span>
					</div>
					<div class="describe-card-foot">
						<div class="mono-label">TR · EN · DE</div>
						<button type="button" class="generate-btn sk-anim">
							Generate my site
							<svg
								viewBox="0 0 24 24"
								width="14"
								height="14"
								fill="none"
								stroke="currentColor"
								stroke-width="1.9"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M5 12h14" />
								<path d="m12 5 7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		{:else if scene === 1}
			<!-- ============ SCENE 2: AI generates ============ -->
			<div class="scene sk-anim scene2-grid">
				<div class="chat-col">
					<div class="bubble bubble-user sk-anim" style="animation-delay: .1s">
						Ben Av. Zeynep Demir. İstanbul'da 12 yıldır aile hukuku ve arabuluculuk yapıyorum.
					</div>
					<div class="bubble bubble-ai sk-anim" style="animation-delay: .7s">
						Anladım. Sana <em class="ai-preset-name">law</em> preset'iyle üç dilli bir site hazırlıyorum.
						Hizmetler, Hakkımda, İletişim.
					</div>
					<div class="bubble bubble-user narrow sk-anim" style="animation-delay: 1.3s">
						Referanslar bölümü de ekle.
					</div>
				</div>
				<div class="schema-col">
					<div class="mono-label" style="margin-bottom: 4px;">site schema · validated json</div>
					{#each SCHEMA_BLOCKS as b (b.title)}
						<div class="schema-block sk-anim" style="animation-delay: {b.delay}">
							<div class="schema-block-text">
								<div class="schema-block-title">{b.title}</div>
								<div class="schema-block-meta">{b.meta}</div>
							</div>
							<div class="schema-block-tag">{b.tag}</div>
						</div>
					{/each}
					<div class="progress-list">
						{#each PROGRESS_STEPS as p (p.label)}
							<div class="progress-row sk-anim" style="animation-delay: {p.delay}">
								<span style="color: {p.color};">{p.mark}</span>
								<span>{p.label}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else if scene === 2}
			<!-- ============ SCENE 3: Live preview (3 devices) ============ -->
			<div class="scene sk-anim scene3-devices">
				<div class="device device-mobile">
					<div class="device-screen">
						<div class="device-hero"></div>
						<div class="device-body">
							<div class="bar w-60 h-6 dark"></div>
							<div class="bar h-4"></div>
							<div class="bar w-80 h-4"></div>
							<div class="bar w-50 h-4"></div>
							<div class="block-placeholder"></div>
						</div>
					</div>
				</div>

				<div class="device device-desktop">
					<div class="device-screen desktop-screen">
						<div class="browser-chrome">
							<span class="chrome-dot" style="background:#d97070;"></span>
							<span class="chrome-dot" style="background:#e6c168;"></span>
							<span class="chrome-dot" style="background:#7dbf7a;"></span>
							<span class="browser-url">demirhukuk.av.tr</span>
						</div>
						<div class="desktop-hero">
							<div class="desktop-hero-title">Aile hukukunda<br />güvenilir eller.</div>
							<div class="desktop-hero-nav">
								<span>Hizmetler</span><span>Hakkımda</span><span>İletişim</span>
							</div>
						</div>
						<div class="desktop-body">
							<div class="bar w-40 h-6 dark"></div>
							<div class="bar h-4"></div>
							<div class="bar w-88 h-4"></div>
							<div class="bar w-76 h-4"></div>
							<div class="desktop-grid">
								<div class="block-placeholder"></div>
								<div class="block-placeholder"></div>
								<div class="block-placeholder"></div>
							</div>
						</div>
						<div class="scan-light sk-anim"></div>
					</div>
				</div>

				<div class="device device-tablet">
					<div class="device-screen">
						<div class="device-hero tablet-hero"></div>
						<div class="device-body">
							<div class="bar w-55 h-6 dark"></div>
							<div class="bar h-4"></div>
							<div class="bar w-82 h-4"></div>
							<div class="tablet-grid">
								<div class="block-placeholder tall"></div>
								<div class="block-placeholder tall"></div>
							</div>
						</div>
					</div>
				</div>

				<div class="viewport-labels">
					<span>375</span><span class="accent">desktop</span><span>768</span>
				</div>
			</div>
		{:else if scene === 3}
			<!-- ============ SCENE 4: Edit ============ -->
			<div class="scene sk-anim scene4-grid">
				<div class="editor-sidebar">
					<div class="mono-label">editor</div>
					<div class="sidebar-nav">
						<div class="sidebar-item">Chat</div>
						<div class="sidebar-item">Content</div>
						<div class="sidebar-item active">Theme</div>
					</div>
					<div class="sidebar-section">
						<div class="mono-label small">PRESET</div>
						<div class="preset-row">
							{#each presets as p (p.name)}
								<div class="preset-item" style="opacity: {p.opacity};">
									<span
										class="preset-swatch"
										style="background: {p.color}; border-color: {p.border};"
									></span>
									<span class="preset-name">{p.name}</span>
								</div>
							{/each}
						</div>
					</div>
					<div class="sidebar-section">
						<div class="mono-label small">LOCALE</div>
						<div class="locale-row">
							{#each locales as l (l.code)}
								<span
									class="locale-pill"
									style="background: {l.bg}; color: {l.fg}; border-color: {l.border};"
								>
									{l.code}
								</span>
							{/each}
						</div>
					</div>
				</div>

				<div class="editor-preview">
					<div
						class="editor-preview-hero"
						style="background: linear-gradient(120deg, {heroColor}, {heroColor}dd);"
					>
						<div class="editor-preview-headline">{editState.headline}</div>
						<div class="editor-preview-sub">{editState.sub}</div>
					</div>
					<div class="editor-preview-body">
						<div class="mono-label">EDITING · body copy</div>
						<div class="editor-preview-text">
							{editState.body}<span class="cursor cursor-sm sk-anim"></span>
						</div>
						<div class="editor-preview-bars">
							<div class="bar w-40 h-6"></div>
							<div class="bar w-30 h-6"></div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- ============ SCENE 5: Publish ============ -->
			<div class="scene sk-anim publish-scene">
				<div class="confetti-layer">
					{#each confetti as c, i (i)}
						<span
							class="confetti-piece sk-anim"
							style="left: {c.x}; width: {c.size}; height: {c.size}; background: {c.color};
							--dx: {c.dx}; --dy: {c.dy}; --r: {c.r}; animation-delay: {c.delay};"
						></span>
					{/each}
				</div>

				<div class="publish-card sk-anim">
					<div class="publish-card-top">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#2f6f6a"
							stroke-width="2"
						>
							<rect x="4" y="10" width="16" height="11" rx="2" />
							<path d="M8 10V7a4 4 0 0 1 8 0v3" />
						</svg>
						<div class="publish-url">https://<span>demirhukuk.av.tr</span></div>
						<span class="live-pill"><span class="live-dot"></span>Live</span>
					</div>
					<div class="publish-title">Yayında.</div>
					<div class="publish-meta">
						<span>TLS ✓</span><span>Caddy ✓</span><span>TR · EN · DE</span>
					</div>
					<div class="publish-badge">powered by saaskaya</div>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if loopCaption || reducedMotionCaption}
	<div class="flow-footer">
		<span>{loopCaption}</span>
		<span>{reducedMotionCaption}</span>
	</div>
{/if}

<style>
	@keyframes sk-blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}
	@keyframes sk-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(184, 83, 47, 0.45);
		}
		50% {
			box-shadow: 0 0 0 14px rgba(184, 83, 47, 0);
		}
	}
	@keyframes sk-grid-move {
		from {
			transform: translateZ(-400px) translateY(0);
		}
		to {
			transform: translateZ(-400px) translateY(120px);
		}
	}
	@keyframes sk-scan {
		0% {
			transform: translateX(-120%) skewX(-18deg);
		}
		100% {
			transform: translateX(220%) skewX(-18deg);
		}
	}
	@keyframes sk-cursor-blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}
	@keyframes sk-bubble-in {
		from {
			opacity: 0;
			transform: translateZ(-80px) translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateZ(0) translateY(0);
		}
	}
	@keyframes sk-block-drop {
		from {
			opacity: 0;
			transform: translateY(-30px) rotateX(40deg);
		}
		to {
			opacity: 1;
			transform: translateY(0) rotateX(0);
		}
	}
	@keyframes sk-confetti {
		0% {
			transform: translate(0, 0) rotate(0);
			opacity: 1;
		}
		100% {
			transform: translate(var(--dx), var(--dy)) rotate(var(--r));
			opacity: 0;
		}
	}
	@keyframes sk-scene-in {
		from {
			opacity: 0;
			transform: translateZ(-60px);
		}
		to {
			opacity: 1;
			transform: translateZ(0);
		}
	}
	@keyframes sk-domain-zoom {
		0% {
			transform: scale(0.9) translateZ(-40px);
		}
		50% {
			transform: scale(1.05) translateZ(40px);
		}
		100% {
			transform: scale(1) translateZ(0);
		}
	}
	@keyframes sk-progress-pop {
		from {
			opacity: 0;
			transform: translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sk-anim {
			animation: none !important;
		}
	}

	/* Frame: real size in layout; never scales, so radius/border/shadow stay crisp. */
	.flow-viewport {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 20px;
		background: linear-gradient(180deg, #f2ede3 0%, #e6dfd1 100%);
		border: 1px solid rgba(0, 0, 0, 0.09);
		box-shadow: 0 40px 60px -40px rgba(30, 20, 10, 0.35);
	}

	/* Stage: fixed design width, scaled uniformly to fill the frame. */
	.flow-stage {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: top left;
		perspective: 1200px;
		perspective-origin: 50% 45%;
	}

	.scene-chrome-label {
		position: absolute;
		top: 16px;
		left: 20px;
		z-index: 40;
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #6b6459;
	}
	.scene-chrome-label .dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #b8532f;
	}
	.scene-dots {
		position: absolute;
		top: 16px;
		right: 20px;
		z-index: 40;
		display: flex;
		gap: 6px;
	}
	.dot-bar {
		width: 22px;
		height: 3px;
		border-radius: 2px;
		background: rgba(23, 22, 20, 0.15);
	}
	.dot-bar.active {
		background: #b8532f;
	}

	.scene {
		position: absolute;
		inset: 0;
		transform-style: preserve-3d;
		animation: sk-scene-in 0.8s ease-out both;
	}
	.mono-label {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #8a8377;
	}
	.mono-label.small {
		font-size: 10px;
	}
	.chrome-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #e6dfd1;
	}
	.cursor {
		display: inline-block;
		width: 2px;
		height: 22px;
		background: #b8532f;
		vertical-align: -3px;
		margin-left: 2px;
		animation: sk-cursor-blink 1s steps(1) infinite;
	}
	.cursor-sm {
		height: 18px;
	}

	/* Scene 1 */
	.grid-wrap {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	.grid-plane {
		position: absolute;
		left: 50%;
		top: 100%;
		width: 2400px;
		height: 1800px;
		margin-left: -1200px;
		transform-origin: 50% 0%;
		transform: translateZ(-400px) rotateX(64deg);
		background-image:
			linear-gradient(rgba(184, 83, 47, 0.18) 1px, transparent 1px),
			linear-gradient(90deg, rgba(184, 83, 47, 0.18) 1px, transparent 1px);
		background-size: 80px 80px;
		animation: sk-grid-move 4s linear infinite;
		mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 75%);
	}
	.describe-card {
		position: absolute;
		left: 50%;
		top: 46%;
		transform: translate(-50%, -50%);
		width: min(640px, 78%);
		background: var(--sk-card);
		border: 1px solid rgba(0, 0, 0, 0.09);
		border-radius: 14px;
		box-shadow: 0 24px 40px -32px rgba(30, 20, 10, 0.6);
		padding: 22px 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.describe-card-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.dots-row {
		display: flex;
		gap: 5px;
	}
	.typed-text {
		min-height: 96px;
		font-family: var(--font-display);
		font-size: 22px;
		line-height: 1.35;
		color: var(--sk-ink);
	}
	.describe-card-foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 12px;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}
	.generate-btn {
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 500;
		background: #b8532f;
		color: var(--sk-card);
		border: none;
		border-radius: 10px;
		padding: 10px 18px;
		cursor: pointer;
		animation: sk-pulse 1.8s ease-out infinite;
	}

	/* Scene 2 */
	.scene2-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		padding: 60px 56px 36px;
	}
	.chat-col {
		display: flex;
		flex-direction: column;
		gap: 12px;
		justify-content: center;
		transform: rotateY(6deg);
		transform-origin: right center;
	}
	.bubble {
		max-width: 82%;
		padding: 10px 14px;
		font-size: 13px;
		line-height: 1.4;
		animation: sk-bubble-in 0.5s ease-out both;
	}
	.bubble-user {
		align-self: flex-end;
		max-width: 78%;
		background: var(--sk-ink);
		color: var(--sk-card);
		border-radius: 14px 14px 4px 14px;
	}
	.bubble-user.narrow {
		max-width: 62%;
	}
	.bubble-ai {
		align-self: flex-start;
		background: var(--sk-card);
		border: 1px solid rgba(0, 0, 0, 0.09);
		border-radius: 14px 14px 14px 4px;
		color: #2a2620;
	}
	.ai-preset-name {
		color: #1e3a5f;
		font-family: var(--font-display);
		font-style: normal;
		font-size: 14px;
	}
	.schema-col {
		position: relative;
		transform: rotateY(-8deg) rotateX(4deg);
		transform-origin: left center;
		display: flex;
		flex-direction: column;
		gap: 10px;
		justify-content: center;
	}
	.schema-block {
		background: var(--sk-card);
		border: 1px solid rgba(0, 0, 0, 0.09);
		border-radius: 12px;
		padding: 12px 14px;
		box-shadow: 0 24px 40px -32px rgba(30, 20, 10, 0.5);
		display: flex;
		justify-content: space-between;
		align-items: center;
		animation: sk-block-drop 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
	}
	.schema-block-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.schema-block-title {
		font-family: var(--font-display);
		font-size: 18px;
	}
	.schema-block-meta {
		font-family: var(--font-mono);
		font-size: 10px;
		color: #8a8377;
	}
	.schema-block-tag {
		font-family: var(--font-mono);
		font-size: 10px;
		color: #1e3a5f;
	}
	.progress-list {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-family: var(--font-mono);
		font-size: 11px;
		color: #4a4640;
	}
	.progress-row {
		display: flex;
		gap: 8px;
		animation: sk-progress-pop 0.4s ease-out both;
	}

	/* Scene 3 */
	.scene3-devices {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 28px;
		padding: 40px;
	}
	.device {
		background: var(--sk-ink);
		box-shadow: 0 30px 40px -20px rgba(30, 20, 10, 0.5);
	}
	.device-mobile {
		transform: rotateY(28deg) translateZ(-60px);
		transform-origin: right center;
		width: 130px;
		height: 260px;
		border-radius: 22px;
		padding: 8px;
	}
	.device-desktop {
		position: relative;
		transform: translateZ(60px);
		width: 460px;
		height: 300px;
		border-radius: 12px;
		padding: 8px 8px 22px;
		box-shadow: 0 40px 60px -20px rgba(30, 20, 10, 0.6);
		overflow: hidden;
	}
	.device-tablet {
		transform: rotateY(-28deg) translateZ(-60px);
		transform-origin: left center;
		width: 200px;
		height: 260px;
		border-radius: 14px;
		padding: 8px;
	}
	.device-screen {
		width: 100%;
		height: 100%;
		background: var(--sk-card);
		border-radius: 16px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.device-tablet .device-screen {
		border-radius: 8px;
	}
	.device-hero {
		height: 44px;
		background: linear-gradient(120deg, #1e3a5f, #3a5a80);
	}
	.tablet-hero {
		height: 52px;
	}
	.device-body {
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.bar {
		height: 4px;
		background: #e6dfd1;
		border-radius: 2px;
	}
	.bar.dark {
		background: var(--sk-ink);
		border-radius: 3px;
	}
	.bar.w-30 {
		width: 30%;
	}
	.bar.w-40 {
		width: 40%;
	}
	.bar.w-50 {
		width: 50%;
	}
	.bar.w-55 {
		width: 55%;
	}
	.bar.w-60 {
		width: 60%;
	}
	.bar.w-76 {
		width: 76%;
	}
	.bar.w-80 {
		width: 80%;
	}
	.bar.w-82 {
		width: 82%;
	}
	.bar.w-88 {
		width: 88%;
	}
	.bar.h-6 {
		height: 6px;
	}
	.block-placeholder {
		height: 30px;
		background: #f2ede3;
		border-radius: 4px;
		margin-top: 6px;
	}
	.block-placeholder.tall {
		height: 40px;
		margin-top: 0;
	}
	.desktop-screen {
		border-radius: 6px;
		position: relative;
	}
	.browser-chrome {
		height: 20px;
		background: #f2ede3;
		display: flex;
		align-items: center;
		padding: 0 8px;
		gap: 5px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}
	.browser-url {
		margin-left: 12px;
		font-family: var(--font-mono);
		font-size: 9px;
		color: #8a8377;
	}
	.desktop-hero {
		height: 90px;
		background: linear-gradient(120deg, #1e3a5f, #3a5a80);
		position: relative;
		padding: 18px 22px;
		color: var(--sk-card);
	}
	.desktop-hero-title {
		font-family: var(--font-display);
		font-size: 20px;
		line-height: 1.1;
	}
	.desktop-hero-nav {
		position: absolute;
		top: 14px;
		right: 22px;
		display: flex;
		gap: 12px;
		font-family: var(--font-sans);
		font-size: 9px;
		opacity: 0.9;
	}
	.desktop-body {
		flex: 1;
		padding: 14px 22px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.desktop-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 6px;
		margin-top: 8px;
	}
	.desktop-grid .block-placeholder {
		height: 34px;
		margin-top: 0;
	}
	.tablet-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
		margin-top: 6px;
	}
	.scan-light {
		position: absolute;
		top: 0;
		left: 0;
		width: 30%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
		animation: sk-scan 3.2s ease-in-out infinite;
		pointer-events: none;
	}
	.viewport-labels {
		position: absolute;
		bottom: 24px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		gap: 44px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.12em;
		color: #8a8377;
		text-transform: uppercase;
	}
	.viewport-labels .accent {
		color: #b8532f;
	}

	/* Scene 4 */
	.scene4-grid {
		padding: 56px 48px 36px;
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 20px;
	}
	.editor-sidebar {
		transform: translateX(-6px) rotateY(8deg);
		transform-origin: right center;
		background: var(--sk-card);
		border: 1px solid rgba(0, 0, 0, 0.09);
		border-radius: 12px;
		padding: 16px 14px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		box-shadow: 0 24px 40px -32px rgba(30, 20, 10, 0.5);
	}
	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.sidebar-item {
		padding: 8px 10px;
		border-radius: 8px;
		font-size: 12px;
		color: #4a4640;
	}
	.sidebar-item.active {
		background: var(--sk-stone);
		font-weight: 500;
		color: var(--sk-ink);
	}
	.sidebar-section {
		border-top: 1px solid rgba(0, 0, 0, 0.06);
		padding-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.preset-row {
		display: flex;
		gap: 8px;
	}
	.preset-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.preset-swatch {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		border: 2px solid transparent;
	}
	.preset-name {
		font-family: var(--font-mono);
		font-size: 9px;
		color: #6b6459;
	}
	.locale-row {
		display: flex;
		gap: 6px;
	}
	.locale-pill {
		padding: 4px 8px;
		border-radius: 6px;
		font-family: var(--font-mono);
		font-size: 10px;
		border: 1px solid transparent;
	}
	.editor-preview {
		background: var(--sk-card);
		border: 1px solid rgba(0, 0, 0, 0.09);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 24px 40px -32px rgba(30, 20, 10, 0.5);
		display: flex;
		flex-direction: column;
	}
	.editor-preview-hero {
		height: 80px;
		padding: 16px 20px;
		color: var(--sk-card);
		display: flex;
		flex-direction: column;
		justify-content: center;
		transition: background 0.5s ease;
	}
	.editor-preview-headline {
		font-family: var(--font-display);
		font-size: 22px;
		line-height: 1;
	}
	.editor-preview-sub {
		font-family: var(--font-sans);
		font-size: 11px;
		opacity: 0.85;
		margin-top: 4px;
	}
	.editor-preview-body {
		padding: 18px 22px;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.editor-preview-text {
		font-family: var(--font-display);
		font-size: 18px;
		line-height: 1.35;
		color: var(--sk-ink);
	}
	.editor-preview-bars {
		display: flex;
		gap: 8px;
		margin-top: 8px;
	}

	/* Scene 5 */
	.publish-scene {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.confetti-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.confetti-piece {
		position: absolute;
		top: 52%;
		border-radius: 2px;
		animation: sk-confetti 2s ease-out forwards;
	}
	.publish-card {
		position: relative;
		background: var(--sk-card);
		border: 1px solid rgba(0, 0, 0, 0.09);
		border-radius: 16px;
		padding: 28px 34px;
		box-shadow: 0 40px 60px -30px rgba(30, 20, 10, 0.55);
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 420px;
		animation: sk-domain-zoom 1.6s cubic-bezier(0.3, 0.9, 0.3, 1.1) both;
	}
	.publish-card-top {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.publish-url {
		font-family: var(--font-mono);
		font-size: 12px;
		color: #4a4640;
		letter-spacing: 0.04em;
	}
	.publish-url span {
		color: var(--sk-ink);
		font-weight: 500;
	}
	.live-pill {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: 999px;
		background: #e6f4ec;
		color: #2f6f6a;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.live-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #2f6f6a;
		box-shadow: 0 0 8px #2f6f6a;
	}
	.publish-title {
		font-family: var(--font-display);
		font-size: 34px;
		line-height: 1.05;
		color: var(--sk-ink);
	}
	.publish-meta {
		display: flex;
		gap: 20px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		color: #6b6459;
		text-transform: uppercase;
		padding-top: 12px;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}
	.publish-badge {
		position: absolute;
		bottom: -14px;
		right: 18px;
		background: var(--sk-ink);
		color: var(--sk-card);
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		padding: 5px 10px;
		border-radius: 6px;
	}

	.flow-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 11px;
		color: #8a8377;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-top: 12px;
	}
</style>
