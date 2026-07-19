/* Client-only scroll-reveal: the hidden state is added here (never in SSR markup),
   so no-JS and reduced-motion visitors always see the content immediately. */
export function reveal(node: HTMLElement, options?: { threshold?: number }) {
	if (
		typeof IntersectionObserver === 'undefined' ||
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	) {
		return;
	}
	node.classList.add('sk-reveal');
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.classList.add('sk-reveal--visible');
				observer.disconnect();
			}
		},
		{ threshold: options?.threshold ?? 0.35 }
	);
	observer.observe(node);
	return {
		destroy() {
			observer.disconnect();
		}
	};
}
