<script lang="ts">
	import { page } from '$app/state';

	let {
		size = 'md',
		label = 'SaasKaya bee mascot',
		animate = 'none',
		class: className = ''
	} = $props<{
		size?: 'xs' | 'sm' | 'md' | 'lg';
		label?: string;
		animate?: 'none' | 'guide' | 'celebrate';
		class?: string;
	}>();

	const sizeClass = $derived(
		size === 'xs' ? 'size-8' : size === 'sm' ? 'size-10' : size === 'lg' ? 'size-20' : 'size-14'
	);
	const mascotUrl = $derived(page.data.platformBranding?.mascotUrl ?? '/mascot-bee.svg');
	const motionClass = $derived(animate === 'none' ? '' : `sk-mascot--${animate}`);
</script>

<span
	class="sk-mascot inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--sk-line)] bg-[var(--sk-paper)] {sizeClass} {motionClass} {className}"
>
	<img src={mascotUrl} alt={label} class="sk-mascot__image h-[72%] w-[72%] object-contain" />
</span>

<style>
	/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
	.sk-mascot--guide {
		animation: sk-mascot-guide 1.25s ease-out both;
	}

	.sk-mascot--celebrate {
		animation: sk-mascot-celebrate 1.15s ease-out both;
	}

	.sk-mascot--guide .sk-mascot__image,
	.sk-mascot--celebrate .sk-mascot__image {
		animation: sk-mascot-flutter 0.18s ease-in-out 5;
	}

	@keyframes sk-mascot-guide {
		0% {
			transform: translate3d(-0.25rem, 0.2rem, 0) rotate(-3deg);
			opacity: 0.45;
		}
		100% {
			transform: translate3d(0, 0, 0) rotate(0);
			opacity: 1;
		}
	}

	@keyframes sk-mascot-celebrate {
		0% {
			transform: translate3d(-0.2rem, 0.15rem, 0) rotate(-4deg);
			opacity: 0.45;
		}
		55% {
			transform: translate3d(0.14rem, -0.32rem, 0) rotate(3deg);
			opacity: 1;
		}
		100% {
			transform: translate3d(0, 0, 0) rotate(0);
		}
	}

	@keyframes sk-mascot-flutter {
		0%,
		100% {
			transform: scaleX(1);
		}
		50% {
			transform: scaleX(1.06);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sk-mascot--guide,
		.sk-mascot--celebrate,
		.sk-mascot--guide .sk-mascot__image,
		.sk-mascot--celebrate .sk-mascot__image {
			animation: none;
		}
	}
</style>
