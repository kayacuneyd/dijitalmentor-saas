<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { DEFAULT_LAYOUT, DEFAULT_SECTION_STYLE, type Locale, type Page, type Site } from '$lib/schema/site';
	import { blockFor } from '$lib/blocks/registry';
	import { setRenderContext, type RenderContext } from './context';
	import { themeStyle } from './theme';
	import SiteHeader from './SiteHeader.svelte';

	// Self-hosted tenant preset fonts
	import '@fontsource/playfair-display/latin.css';
	import '@fontsource/playfair-display/latin-ext.css';
	import '@fontsource/lora/latin.css';
	import '@fontsource/lora/latin-ext.css';
	import '@fontsource/poppins/latin.css';
	import '@fontsource/poppins/latin-ext.css';
	import '@fontsource/open-sans/latin.css';
	import '@fontsource/open-sans/latin-ext.css';
	import '@fontsource/roboto/latin.css';
	import '@fontsource/roboto/latin-ext.css';
	import '@fontsource/inter/latin.css';
	import '@fontsource/inter/latin-ext.css';

	let {
		site,
		page,
		locale,
		hrefFor = () => '#',
		localeHrefFor,
		mode = 'preview',
		contactState = 'idle'
	}: {
		site: Site;
		page: Page;
		locale: Locale;
		hrefFor?: (pageSlug: string) => string;
		localeHrefFor?: (locale: Locale) => string;
		mode?: RenderContext['mode'];
		contactState?: RenderContext['contactState'];
	} = $props();

	setRenderContext({
		get mode() { return mode; },
		get contactState() { return contactState; },
		get integrations() { return site.settings.integrations ?? []; }
	});

	const appHost = env.PUBLIC_APP_HOST || 'localhost:5173';

	const layout = $derived(site.layout ?? DEFAULT_LAYOUT);
	const containerClass = $derived(
		layout.container.width === 'narrow' ? 'max-w-4xl' :
		layout.container.width === 'full' ? 'max-w-none' :
		'max-w-6xl'
	);
	const spacingClass = $derived(
		layout.sectionSpacing === 'tight' ? 'space-y-6' :
		layout.sectionSpacing === 'loose' ? 'space-y-20' :
		'space-y-12'
	);

	const integrations = $derived(site.settings.integrations ?? []);
	const isMobileHidden = (section: Page['sections'][number]) =>
		!!((section.props as Record<string, unknown>).hideOnMobile);
	const sectionStyle = (section: Page['sections'][number]) => {
		const style = { ...DEFAULT_SECTION_STYLE, ...section.style };
		return [
			`--sk-section-layout:${style.layout}`,
			style.backgroundColor ? `--sk-section-bg:${style.backgroundColor}` : '',
			`--sk-section-py:${style.paddingY}`,
			`--sk-section-my:${style.marginY}`,
			`--sk-section-min-height:${style.minHeight}`,
			`--sk-section-content:${style.contentWidth}`
		].filter(Boolean).join(';');
	};

	// Cookie consent — only relevant in public mode with analytics or consent setting
	const hasAnalytics = $derived(!!(site.settings.analytics?.ga4Id || site.settings.analytics?.metaPixelId));
	const needsConsent = $derived(mode === 'public' && (hasAnalytics || site.settings.cookieConsent));
	let consentGiven = $state(false);

	function acceptCookies() {
		consentGiven = true;
	}

	// Inject analytics scripts after consent via $effect
	$effect(() => {
		if (mode !== 'public' || !consentGiven) return;
		const ga4Id = site.settings.analytics?.ga4Id;
		const pixelId = site.settings.analytics?.metaPixelId;
		if (!ga4Id && !pixelId) return;

		if (ga4Id && !document.querySelector('script[src*="googletagmanager"]')) {
			const s1 = document.createElement('script');
			s1.async = true;
			s1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
			document.head.appendChild(s1);
			const inline1 = document.createElement('script');
			inline1.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4Id}')`;
			document.head.appendChild(inline1);
		}
		if (pixelId && !document.querySelector('script[src*="fbevents.js"]')) {
			const s2 = document.createElement('script');
			s2.async = true;
			s2.src = 'https://connect.facebook.net/en_US/fbevents.js';
			document.head.appendChild(s2);
			const inline2 = document.createElement('script');
			inline2.textContent = `fbq('init','${pixelId}');fbq('track','PageView')`;
			document.head.appendChild(inline2);
		}
	});
</script>

<div
	class="site-root bg-base-100 text-base-content min-h-screen overflow-x-hidden"
	style={themeStyle(site.theme)}
>
	<SiteHeader {site} {locale} activeSlug={page.slug} {hrefFor} {localeHrefFor} {layout} />

	<main class="{containerClass} mx-auto w-full {spacingClass}">
		{#each page.sections as section, i (`${section.id}-${i}`)}
			{@const Block = blockFor(section)}
			<div
				class="section-frame"
				class:bg-custom={Boolean(section.style?.backgroundColor)}
				style={sectionStyle(section)}
				class:hidden-mobile={isMobileHidden(section)}
			>
				<Block
					sectionId={section.id}
					{locale}
					props={section.props}
					content={section.content[locale]}
					{integrations}
				/>
			</div>
		{/each}
	</main>

	{#if site.settings.poweredByBadge}
		<div class="bg-neutral text-neutral-content py-3 text-center text-xs">
			<a href="//{appHost}" target="_blank" rel="noopener" class="hover:underline">
				Powered by <span class="font-semibold">saaskaya</span>
			</a>
		</div>
	{/if}

	{#if needsConsent && !consentGiven}
		<div class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-base-300 bg-base-100 p-4 shadow-2xl sm:left-auto">
			<p class="mb-3 text-sm">Bu site, deneyiminizi iyileştirmek için çerez kullanır. Siteyi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.</p>
			<div class="flex gap-2">
				<button onclick={acceptCookies} class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-content hover:opacity-90">Kabul Et</button>
				<button onclick={acceptCookies} class="rounded-lg border border-base-300 px-4 py-2 text-sm hover:bg-base-200">Sadece Gerekli</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.site-root {
		font-family: var(--font-body);
	}
	.site-root :global(:is(h1, h2, h3, h4)) {
		font-family: var(--font-heading);
	}
	.site-root :global(section) {
		scroll-margin-top: 5rem;
	}
	.section-frame {
		--sk-section-bg: transparent;
	}
	.section-frame :global(section) {
		--sk-section-py: 5rem;
		--sk-section-my: 0;
		--sk-section-min-height: auto;
		padding-block: var(--sk-section-py, 5rem) !important;
		min-height: var(--sk-section-min-height, auto);
		margin-block: var(--sk-section-my, none);
	}
	.section-frame.bg-custom :global(section) {
		background-color: var(--sk-section-bg) !important;
	}
	.section-frame :global(section) > :global(.mx-auto) {
		max-width: var(--sk-section-content, wide);
	}
	.section-frame[style*='--sk-section-py:compact'] :global(section) { --sk-section-py: 3rem; }
	.section-frame[style*='--sk-section-py:spacious'] :global(section) { --sk-section-py: 7rem; }
	.section-frame[style*='--sk-section-my:compact'] :global(section) { --sk-section-my: 1rem; }
	.section-frame[style*='--sk-section-my:standard'] :global(section) { --sk-section-my: 3rem; }
	.section-frame[style*='--sk-section-my:spacious'] :global(section) { --sk-section-my: 6rem; }
	.section-frame[style*='--sk-section-min-height:compact'] :global(section) { --sk-section-min-height: 18rem; }
	.section-frame[style*='--sk-section-min-height:standard'] :global(section) { --sk-section-min-height: 28rem; }
	.section-frame[style*='--sk-section-min-height:tall'] :global(section) { --sk-section-min-height: 42rem; }
	.section-frame[style*='--sk-section-content:narrow'] :global(section) > :global(.mx-auto) { max-width: 48rem; }
	.section-frame[style*='--sk-section-content:wide'] :global(section) > :global(.mx-auto) { max-width: 72rem; }
	.section-frame[style*='--sk-section-content:full'] :global(section) > :global(.mx-auto) { max-width: none; }
	.section-frame[style*='--sk-section-layout:boxed'] :global(section) { margin-inline: 1rem; border-radius: var(--radius-box); }
	.hidden-mobile {
		@media (max-width: 767px) {
			display: none !important;
		}
	}
</style>
