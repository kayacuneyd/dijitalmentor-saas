<script lang="ts">
	import { withLocale, type Locale } from '$lib/i18n';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { mergeCopy } from '$lib/publicCopy';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);

	const baseCopy = $derived(
		{
			en: {
				title: 'About saaskaya · Simple multilingual websites for professionals',
				description:
					'saaskaya helps professionals and small service businesses prepare, edit, and publish multilingual websites without juggling copywriting, translation, and technical setup.',
				kicker: 'About',
				h1: 'Simple, multilingual websites for professionals.',
				lead: 'saaskaya is built for people who need a clear online presence but do not want to spend weeks on copy, translation, domain setup, and scattered tools.',
				primary: 'Start beta',
				secondary: 'See pricing',
				pills: ['Kornwestheim, Germany', 'TR · EN · DE', 'Closed beta'],
				sections: [
					[
						'Who it is for',
						'Psychologists, lawyers, consultants, therapists, academics, and small service businesses that need a professional site clients can understand quickly.'
					],
					[
						'What it helps with',
						'You describe your work, review the first version, edit the text, and publish on a subdomain or your own domain when it is ready.'
					],
					[
						'Why it stays predictable',
						'The site is built from controlled sections. AI helps with content, but it does not get to rewrite the website code or break the structure.'
					]
				],
				trustTitle: 'Built with clear responsibility',
				trustBody:
					'saaskaya is operated from Kornwestheim by Cüneyt Kaya. The launch focus is intentionally narrow: professional profiles, multilingual websites, predictable publishing, and practical support.'
			},
			tr: {
				title: 'saaskaya hakkında · Uzmanlar için sade çok dilli web siteleri',
				description:
					'saaskaya uzmanların metin, çeviri ve teknik kurulumla boğuşmadan çok dilli web sitesi hazırlamasına ve yayına almasına yardımcı olur.',
				kicker: 'Hakkımızda',
				h1: 'Uzmanlar için sade, çok dilli web siteleri.',
				lead: 'saaskaya; metin, çeviri, domain ve teknik kurulumla haftalar kaybetmeden güven veren bir web sitesi hazırlamak isteyen uzmanlar için geliştirildi.',
				primary: 'Betaya başla',
				secondary: 'Fiyatı gör',
				pills: ['Kornwestheim, Almanya', 'TR · EN · DE', 'Kapalı beta'],
				sections: [
					[
						'Kimler için',
						'Psikologlar, avukatlar, danışmanlar, terapistler, akademisyenler ve müşterilerin hızlıca anlayabileceği profesyonel bir siteye ihtiyaç duyan küçük hizmet işletmeleri.'
					],
					[
						'Ne işe yarar',
						'Mesleğini anlatırsın, ilk siteyi incelersin, metni düzenlersin ve hazır olduğunda alt alan adında ya da kendi domaininde yayına alırsın.'
					],
					[
						'Neden öngörülebilir kalır',
						'Site kontrollü bölümlerden oluşur. AI içerik hazırlamaya yardım eder; site kodunu baştan yazıp yapıyı bozacak alana girmez.'
					]
				],
				trustTitle: 'Sorumluluğu belli bir ürün',
				trustBody:
					'saaskaya Kornwestheim merkezli olarak Cüneyt Kaya tarafından yürütülür. İlk odak bilinçli olarak dar tutulur: uzman profilleri, çok dilli web siteleri, öngörülebilir yayınlama ve pratik destek.'
			},
			de: {
				title: 'Über saaskaya · Einfache mehrsprachige Websites für Fachleute',
				description:
					'saaskaya hilft Fachleuten, mehrsprachige Websites vorzubereiten, zu bearbeiten und zu veröffentlichen, ohne sich in Text, Übersetzung und Technik zu verlieren.',
				kicker: 'Über uns',
				h1: 'Einfache, mehrsprachige Websites für Fachleute.',
				lead: 'saaskaya ist für Menschen gebaut, die eine klare Online-Präsenz brauchen, aber keine Wochen mit Texten, Übersetzungen, Domains und verstreuten Tools verbringen möchten.',
				primary: 'Beta starten',
				secondary: 'Preise ansehen',
				pills: ['Kornwestheim, Deutschland', 'TR · EN · DE', 'Geschlossene Beta'],
				sections: [
					[
						'Für wen',
						'Psychologen, Anwälte, Berater, Therapeuten, Akademiker und kleine Dienstleister, die eine professionelle und schnell verständliche Website brauchen.'
					],
					[
						'Wobei es hilft',
						'Du beschreibst dein Angebot, prüfst die erste Version, bearbeitest die Texte und veröffentlichst auf Subdomain oder eigener Domain.'
					],
					[
						'Warum es berechenbar bleibt',
						'Die Website besteht aus kontrollierten Abschnitten. AI hilft bei Inhalten, schreibt aber nicht den Website-Code um.'
					]
				],
				trustTitle: 'Mit klarer Verantwortung gebaut',
				trustBody:
					'saaskaya wird von Cüneyt Kaya aus Kornwestheim betrieben. Der Start ist bewusst fokussiert: berufliche Profile, mehrsprachige Websites, berechenbares Publishing und praktische Unterstützung.'
			}
		}[locale]
	);
	const copy = $derived(mergeCopy(baseCopy, data.copyOverrides?.[locale]));
</script>

<SeoHead
	{locale}
	path="/about"
	title={copy.title}
	description={copy.description}
	jsonLd={[organizationJsonLd(), webSiteJsonLd(locale), softwareJsonLd(locale, copy.description)]}
/>

<PublicShell
	{locale}
	currentPath="/about"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / about"
>
	<MarketingSection as="section" class="flex flex-col gap-10 py-10 sm:py-14">
		<div class="max-w-3xl">
			<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.kicker}</div>
			<h1 class="sk-display mt-4 text-4xl leading-tight sm:text-[46px]">{copy.h1}</h1>
			<p class="mt-4 text-[17px] leading-8 text-[var(--sk-muted)]">{copy.lead}</p>
			<div class="mt-5 flex flex-wrap gap-2">
				{#each copy.pills as pill (pill)}
					<StatusPill>{pill}</StatusPill>
				{/each}
			</div>
			<div class="mt-7 flex flex-wrap gap-3">
				<a href={l('/beta')} class="sk-btn sk-btn-primary sk-btn-lg">{copy.primary}</a>
				<a href={l('/pricing')} class="sk-btn sk-btn-secondary sk-btn-lg">{copy.secondary}</a>
			</div>
		</div>

		<div class="grid gap-4 lg:grid-cols-3">
			{#each copy.sections as [title, body] (title)}
				<article class="sk-card p-5">
					<h2 class="text-lg font-semibold">{title}</h2>
					<p class="mt-3 text-sm leading-7 text-[var(--sk-muted)]">{body}</p>
				</article>
			{/each}
		</div>

		<section class="sk-soft max-w-4xl p-5">
			<h2 class="text-lg font-semibold">{copy.trustTitle}</h2>
			<p class="mt-3 text-sm leading-7 text-[var(--sk-muted)]">{copy.trustBody}</p>
		</section>
	</MarketingSection>
</PublicShell>
