<script lang="ts">
	import { env } from '$env/dynamic/public';
	import type { Locale, Page, Site } from '$lib/schema/site';
	import { blockFor } from '$lib/blocks/registry';
	import { setRenderContext, type RenderContext } from './context';
	import { themeStyle } from './theme';
	import SiteHeader from './SiteHeader.svelte';

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
		}
	});

	const appHost = env.PUBLIC_APP_HOST || 'localhost:5173';
</script>

<div
	class="site-root bg-base-100 text-base-content min-h-screen overflow-x-hidden"
	style={themeStyle(site.theme)}
>
	<SiteHeader {site} {locale} activeSlug={page.slug} {hrefFor} {localeHrefFor} />

	<main>
		{#each page.sections as section (section.id)}
			{@const Block = blockFor(section)}
			<Block
				sectionId={section.id}
				{locale}
				props={section.props}
				content={section.content[locale]}
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
