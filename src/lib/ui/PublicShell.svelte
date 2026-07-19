<script lang="ts">
	import AppCanvasShell from '$lib/ui/AppCanvasShell.svelte';
	import PublicFooter from '$lib/ui/PublicFooter.svelte';
	import PublicHeader from '$lib/ui/PublicHeader.svelte';
	import ScrollToTop from '$lib/ui/ScrollToTop.svelte';
	import SiteAssistantDock from '$lib/ui/SiteAssistantDock.svelte';
	import type { Locale } from '$lib/i18n';

	let {
		children,
		locale,
		currentPath = '/',
		userEmail = null,
		label = 'saaskaya.com',
		max = 'max-w-[92rem]',
		contentClass = 'px-0 py-0'
	}: {
		children: import('svelte').Snippet;
		locale: Locale;
		currentPath?: string;
		userEmail?: string | null;
		label?: string;
		max?: string;
		contentClass?: string;
	} = $props();
</script>

<AppCanvasShell {label} {max} {contentClass} flush chrome={false}>
	<div class="flex min-h-full flex-col">
		<PublicHeader {locale} {currentPath} {userEmail} />
		<div class="min-w-0 flex-1">
			{@render children()}
		</div>
	</div>
</AppCanvasShell>
<PublicFooter {locale} />
<SiteAssistantDock {locale} {currentPath} userEmail={userEmail ?? ''} />
<ScrollToTop />
