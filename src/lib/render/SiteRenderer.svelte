<script lang="ts">
	import { env } from '$env/dynamic/public';
	import type { Locale, Page, Site } from '$lib/schema/site';
	import { blockFor } from '$lib/blocks/registry';
	import { setRenderContext, type RenderContext } from './context';
	import { themeStyle } from './theme';
	import SiteHeader from './SiteHeader.svelte';

	// Self-hosted tenant preset fonts (src/lib/presets/index.ts): Playfair Display
	// + Inter (law), Lora + Open Sans (psych), Poppins + Roboto (dental). Loaded
	// here — not the root layout — so the SaaS shell never pays for tenant weights,
	// and published tenant sites never call Google Fonts (no third-party request
	// for a visitor of a customer's site). Only weights actually rendered by a
	// given theme trigger a woff2 fetch (@font-face is lazily resolved per glyph).
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
		/** Maps a page slug to a URL — preview and published site route differently. */
		hrefFor?: (pageSlug: string) => string;
		/** When given, the header shows a locale switcher. */
		localeHrefFor?: (locale: Locale) => string;
		/** 'public' = live tenant site (forms active); 'preview' = editor/preview (forms inert). */
		mode?: RenderContext['mode'];
		contactState?: RenderContext['contactState'];
	} = $props();

	// getters keep the context live across prop updates without remounting
	setRenderContext({
		get mode() {
			return mode;
		},
		get contactState() {
			return contactState;
		},
		get integrations() {
			return site.settings.integrations ?? [];
		}
	});

	const appHost = env.PUBLIC_APP_HOST || 'localhost:5173';
	const integrations = $derived(site.settings.integrations ?? []);
</script>

<div
	class="site-root bg-base-100 text-base-content min-h-screen overflow-x-hidden"
	style={themeStyle(site.theme)}
>
	<SiteHeader {site} {locale} activeSlug={page.slug} {hrefFor} {localeHrefFor} />

	<main>
		{#each page.sections as section, i (`${section.id}-${i}`)}
			{@const Block = blockFor(section)}
			<Block
				sectionId={section.id}
				{locale}
				props={section.props}
				content={section.content[locale]}
				{integrations}
			/>
		{/each}
	</main>

	{#if site.settings.poweredByBadge}
		<div class="bg-neutral text-neutral-content py-3 text-center text-xs">
			<a href="//{appHost}" target="_blank" rel="noopener" class="hover:underline">
				Powered by <span class="font-semibold">saaskaya</span>
			</a>
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
</style>
