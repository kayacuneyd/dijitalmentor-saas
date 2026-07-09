<script lang="ts">
	const blocks = ['Hero', 'Services', 'About', 'Contact'];
	const deviceBars = [84, 62, 76, 48];
</script>

<div class="product-flow" aria-hidden="true">
	<div class="flow-grid">
		<section class="chat-panel">
			<div class="panel-top">
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="message user">I need a trustworthy site for my clinic.</div>
			<div class="message ai">Building a multilingual site...</div>
			<div class="typing">
				<span></span>
				<span></span>
				<span></span>
			</div>
		</section>

		<section class="schema-panel">
			<div class="schema-title">Site schema</div>
			<div class="block-stack">
				{#each blocks as block, index (block)}
					<div class="schema-block" style:--i={index}>
						<span class="block-dot"></span>
						<span>{block}</span>
					</div>
				{/each}
			</div>
		</section>

		<section class="preview-panel">
			<div class="device desktop">
				<div class="device-top"></div>
				<div class="hero-strip"></div>
				<div class="device-grid">
					{#each deviceBars as width, index (index)}
						<span style:--w={`${width}%`}></span>
					{/each}
				</div>
			</div>
			<div class="device mobile">
				<div class="device-top"></div>
				<div class="hero-strip"></div>
				<div class="mobile-lines">
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
		</section>

		<section class="publish-panel">
			<div class="domain-line">klinik-yilmaz.de</div>
			<div class="live-pill">Live</div>
		</section>
	</div>
</div>

<style>
	.product-flow {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background:
			linear-gradient(120deg, rgb(14 116 144 / 0.18), transparent 34%),
			linear-gradient(245deg, rgb(245 158 11 / 0.16), transparent 38%),
			linear-gradient(0deg, rgb(255 255 255 / 0.92), rgb(255 255 255 / 0.74));
	}

	.product-flow::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgb(15 23 42 / 0.06) 1px, transparent 1px),
			linear-gradient(90deg, rgb(15 23 42 / 0.06) 1px, transparent 1px);
		background-size: 44px 44px;
		mask-image: linear-gradient(to bottom, black 0%, transparent 82%);
	}

	.flow-grid {
		position: absolute;
		inset: 8% max(1rem, 6vw) auto;
		min-height: 68%;
	}

	.chat-panel,
	.schema-panel,
	.preview-panel,
	.publish-panel {
		position: absolute;
		border: 1px solid rgb(15 23 42 / 0.12);
		background: rgb(255 255 255 / 0.78);
		box-shadow: 0 24px 80px rgb(15 23 42 / 0.13);
		backdrop-filter: blur(14px);
	}

	.chat-panel {
		top: 4%;
		left: 0;
		width: min(24rem, 36vw);
		border-radius: 1rem;
		padding: 1rem;
		animation: panel-float 8s ease-in-out infinite;
	}

	.panel-top {
		display: flex;
		gap: 0.35rem;
		margin-bottom: 0.9rem;
	}

	.panel-top span {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 999px;
		background: rgb(15 23 42 / 0.18);
	}

	.message {
		width: fit-content;
		max-width: 86%;
		border-radius: 0.9rem;
		padding: 0.65rem 0.75rem;
		font-size: clamp(0.72rem, 1.1vw, 0.92rem);
		line-height: 1.25;
	}

	.user {
		margin-left: auto;
		background: #0f766e;
		color: white;
	}

	.ai {
		margin-top: 0.65rem;
		background: #f3f4f6;
		color: #111827;
	}

	.typing {
		display: flex;
		width: fit-content;
		gap: 0.25rem;
		margin-top: 0.65rem;
		border-radius: 999px;
		background: #f3f4f6;
		padding: 0.45rem 0.6rem;
	}

	.typing span {
		width: 0.32rem;
		height: 0.32rem;
		border-radius: 999px;
		background: #0f766e;
		animation: typing 1.2s ease-in-out infinite;
	}

	.typing span:nth-child(2) {
		animation-delay: 0.16s;
	}

	.typing span:nth-child(3) {
		animation-delay: 0.32s;
	}

	.schema-panel {
		top: 24%;
		left: 29%;
		width: min(18rem, 27vw);
		border-radius: 1.2rem;
		padding: 1rem;
		animation: panel-float 8s ease-in-out infinite 0.6s;
	}

	.schema-title {
		margin-bottom: 0.75rem;
		color: rgb(15 23 42 / 0.62);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.block-stack {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.schema-block {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: 0.8rem;
		background: white;
		padding: 0.55rem 0.65rem;
		color: #111827;
		font-size: 0.82rem;
		font-weight: 700;
		box-shadow: 0 8px 22px rgb(15 23 42 / 0.08);
		animation: block-build 4.8s ease-in-out infinite;
		animation-delay: calc(var(--i) * 0.22s);
	}

	.block-dot {
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 999px;
		background: #f59e0b;
	}

	.preview-panel {
		top: 5%;
		right: 0;
		width: min(34rem, 46vw);
		height: min(25rem, 46vw);
		border-radius: 1.6rem;
		padding: 1.1rem;
		animation: panel-float 8s ease-in-out infinite 1.1s;
	}

	.device {
		position: absolute;
		border: 1px solid rgb(15 23 42 / 0.12);
		background: white;
		box-shadow: 0 18px 42px rgb(15 23 42 / 0.12);
	}

	.desktop {
		inset: 1.1rem 1.1rem auto;
		height: 70%;
		border-radius: 1.1rem;
		overflow: hidden;
	}

	.mobile {
		right: 1.7rem;
		bottom: 1.1rem;
		width: 24%;
		height: 48%;
		border-radius: 1.1rem;
		overflow: hidden;
	}

	.device-top {
		height: 13%;
		background: #e5e7eb;
	}

	.hero-strip {
		height: 28%;
		margin: 4%;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, #0f766e, #14b8a6);
		animation: color-shift 5.6s ease-in-out infinite;
	}

	.device-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.55rem;
		padding: 0 4% 4%;
	}

	.device-grid span,
	.mobile-lines span {
		display: block;
		width: var(--w, 70%);
		height: 0.55rem;
		border-radius: 999px;
		background: #d1d5db;
	}

	.mobile-lines {
		display: flex;
		flex-direction: column;
		gap: 0.42rem;
		padding: 0 12%;
	}

	.mobile-lines span:nth-child(2) {
		width: 78%;
	}

	.mobile-lines span:nth-child(3) {
		width: 52%;
	}

	.publish-panel {
		right: 8%;
		bottom: 8%;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		border-radius: 999px;
		padding: 0.65rem 0.75rem 0.65rem 1rem;
		animation: publish-pop 4.8s ease-in-out infinite;
	}

	.domain-line {
		color: #111827;
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;
		font-size: clamp(0.68rem, 1vw, 0.86rem);
		font-weight: 700;
	}

	.live-pill {
		border-radius: 999px;
		background: #16a34a;
		padding: 0.3rem 0.55rem;
		color: white;
		font-size: 0.68rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	@keyframes panel-float {
		0%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		50% {
			transform: translate3d(0, -0.7rem, 0);
		}
	}

	@keyframes typing {
		0%,
		100% {
			opacity: 0.3;
			transform: translateY(0);
		}
		50% {
			opacity: 1;
			transform: translateY(-0.18rem);
		}
	}

	@keyframes block-build {
		0%,
		14% {
			opacity: 0.4;
			transform: translateX(-0.35rem);
		}
		30%,
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes color-shift {
		0%,
		100% {
			background: linear-gradient(135deg, #0f766e, #14b8a6);
		}
		50% {
			background: linear-gradient(135deg, #be123c, #f59e0b);
		}
	}

	@keyframes publish-pop {
		0%,
		45% {
			opacity: 0;
			transform: translateY(0.5rem) scale(0.96);
		}
		60%,
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (max-width: 760px) {
		.flow-grid {
			inset: 9% 1rem auto;
		}

		.chat-panel {
			top: 1%;
			left: 0;
			width: 72%;
		}

		.schema-panel {
			top: 28%;
			left: 9%;
			width: 56%;
		}

		.preview-panel {
			top: 14%;
			right: -20%;
			width: 76%;
			height: 48%;
		}

		.publish-panel {
			right: 0;
			bottom: 4%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.product-flow *,
		.product-flow *::before,
		.product-flow *::after {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
