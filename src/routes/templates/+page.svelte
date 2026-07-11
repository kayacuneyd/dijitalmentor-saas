<script lang="ts">
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { uiIcons } from '$lib/ui/icons';
	import { withLocale, type Locale } from '$lib/i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	const copy = $derived(
		{
			en: {
				title: 'Profession website kits · saaskaya',
				description:
					'Controlled saaskaya website kits for professional groups, with feature kits and prompt recipes that steer AI generation without leaving the fixed block set.',
				create: 'Create site',
				back: 'saaskaya',
				pills: [
					'Profession kits',
					`${data.kits.length} controlled starts`,
					'Feature + prompt recipes'
				],
				h1: 'Start from a profession-aware kit, not a blank page.',
				lead: 'Each kit uses the existing fixed block set, passes the Zod schema, and gives AI a smaller, sharper brief. Feature kits and prompt recipes help customers add what they need with less token spend.',
				primary: 'Describe your practice',
				pricing: 'Pricing',
				profession: 'Profession',
				audience: 'Best for',
				outcome: 'Outcome',
				features: 'Feature kits',
				prompts: 'Prompt recipe',
				structure: 'Structure',
				sections: 'sections',
				languages: 'Languages',
				quality: 'Quality',
				blockers: 'blockers',
				warnings: 'warnings',
				startStyle: 'Start close to this style',
				note: 'This catalog is not a free-form template marketplace. Kits are controlled product surfaces: they steer onboarding, AI generation and add-ons while staying inside the saaskaya schema.'
			},
			tr: {
				title: 'Meslek site kitleri · saaskaya',
				description:
					'Meslek grupları için kontrollü saaskaya site kitleri; feature kitler ve hazır prompt tarifleriyle AI üretimini sabit blok setinde tutar.',
				create: 'Site oluştur',
				back: 'saaskaya',
				pills: [
					'Meslek kitleri',
					`${data.kits.length} kontrollü başlangıç`,
					'Feature + prompt tarifleri'
				],
				h1: 'Boş sayfadan değil, mesleğe uygun bir kitten başla.',
				lead: 'Her kit mevcut sabit blok setiyle hazırlanır, Zod şemasından geçer ve AI’ye daha küçük, daha net bir brief verir. Feature kitler ve hazır promptlar müşterinin istediği siteye daha az token harcayarak yaklaşmasını sağlar.',
				primary: 'Pratiğini anlat',
				pricing: 'Fiyatlandırma',
				profession: 'Meslek',
				audience: 'Hedef kullanım',
				outcome: 'Sonuç',
				features: 'Feature kitler',
				prompts: 'Prompt tarifi',
				structure: 'Yapı',
				sections: 'bölüm',
				languages: 'Diller',
				quality: 'Kalite',
				blockers: 'engel',
				warnings: 'uyarı',
				startStyle: 'Bu stile yakın başla',
				note: 'Bu katalog serbest template marketi değil. Kitler; onboarding, AI üretimi ve eklenecek özellikleri saaskaya şeması içinde tutan kontrollü ürün yüzeyleridir.'
			},
			de: {
				title: 'Berufs-Website-Kits · saaskaya',
				description:
					'Kontrollierte saaskaya Website-Kits für Berufsgruppen mit Feature- und Prompt-Rezepten.',
				create: 'Website erstellen',
				back: 'saaskaya',
				pills: [
					'Berufs-Kits',
					`${data.kits.length} kontrollierte Starts`,
					'Feature + Prompt-Rezepte'
				],
				h1: 'Starte mit einem berufsnahen Kit, nicht mit einer leeren Seite.',
				lead: 'Jedes Kit nutzt das feste Block-Set, besteht die Zod-Struktur und gibt AI ein kleineres, schärferes Briefing. Feature- und Prompt-Kits reduzieren Aufwand und Token-Verbrauch.',
				primary: 'Praxis beschreiben',
				pricing: 'Preise',
				profession: 'Beruf',
				audience: 'Geeignet für',
				outcome: 'Ergebnis',
				features: 'Feature-Kits',
				prompts: 'Prompt-Rezept',
				structure: 'Struktur',
				sections: 'Abschnitte',
				languages: 'Sprachen',
				quality: 'Qualität',
				blockers: 'Blocker',
				warnings: 'Warnungen',
				startStyle: 'Nah an diesem Stil starten',
				note: 'Dieser Katalog ist kein freier Template-Marktplatz. Kits bleiben kontrollierte Produktflächen innerhalb des saaskaya-Schemas.'
			}
		}[locale]
	);

	const swatches = ['#2f6f6a', '#264f73', '#3f7d5a', '#315f72', '#7a5267', '#4d6864'];
</script>

<SeoHead
	{locale}
	path="/templates"
	title={copy.title}
	description={copy.description}
	jsonLd={[organizationJsonLd(), webSiteJsonLd(locale), softwareJsonLd(locale, copy.description)]}
/>

<PublicShell
	{locale}
	currentPath="/templates"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / templates"
>
	<MarketingSection class="flex flex-col gap-8 py-10 sm:py-14">
		<header class="flex flex-col items-start gap-5">
			<a
				href={l('/')}
				class="sk-link inline-flex items-center gap-1.5 text-sm text-[var(--sk-faint)]"
				>{@html uiIcons.arrowLeft(14)}{copy.back}</a
			>
			<BrandMark href={l('/')} />
			<div class="flex flex-wrap gap-2">
				{#each copy.pills as pill (pill)}
					<StatusPill>{pill}</StatusPill>
				{/each}
			</div>
			<div>
				<h1 class="sk-display max-w-3xl text-4xl leading-tight sm:text-[44px]">
					{copy.h1}
				</h1>
				<p class="mt-4 max-w-2xl text-[16px] leading-7 text-[var(--sk-muted)]">
					{copy.lead}
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<a href={l('/new')} class="sk-btn sk-btn-primary sk-btn-lg"
					>{copy.primary}{@html uiIcons.arrowRight(16)}</a
				>
				<a href={l('/pricing')} class="sk-btn sk-btn-secondary sk-btn-lg">{copy.pricing}</a>
			</div>
		</header>

		<section class="grid gap-4 lg:grid-cols-2">
			{#each data.kits as kit, i (kit.slug)}
				<article class="sk-card flex min-h-full flex-col overflow-hidden">
					{#if kit.hasImage}
						<img
							src="/templates/{kit.slug}.jpg"
							alt="{kit.label} — {kit.headline}"
							loading="lazy"
							width="1280"
							height="860"
							class="aspect-3/2 w-full border-b border-[var(--sk-line)] object-cover object-top"
						/>
					{:else}
						<div
							class="flex aspect-3/2 w-full flex-col justify-between border-b border-[var(--sk-line)] p-5"
							style:background={`linear-gradient(135deg, ${swatches[i % swatches.length]}22, #fbfaf4)`}
						>
							<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{kit.category}</div>
							<div>
								<div class="text-2xl font-semibold text-[var(--sk-ink)]">{kit.profession}</div>
								<p class="mt-2 max-w-sm text-sm leading-6 text-[var(--sk-muted)]">
									{kit.headline}
								</p>
							</div>
						</div>
					{/if}
					<div class="flex items-start justify-between gap-4 p-5 pb-0">
						<div>
							<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{kit.slug}</div>
							<h2 class="mt-1 text-xl font-semibold text-[var(--sk-ink)]">{kit.label}</h2>
							<p class="mt-1 text-xs text-[var(--sk-faint)]">
								{copy.profession}: {kit.profession}
							</p>
						</div>
						<span
							class="size-10 shrink-0 rounded-2xl"
							style:background={swatches[i % swatches.length]}
							aria-hidden="true"
						></span>
					</div>

					<div class="flex flex-1 flex-col gap-4 p-5">
						<div>
							<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.audience}</div>
							<p class="mt-1 text-sm leading-6 text-[var(--sk-muted)]">{kit.audience}</p>
						</div>
						<div>
							<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.outcome}</div>
							<p class="mt-1 text-sm leading-6 text-[var(--sk-muted)]">{kit.outcome}</p>
						</div>

						<div class="flex flex-wrap gap-2">
							{#each kit.sections as section (section.type)}
								<span class="sk-pill text-[11px]">{section.label}</span>
							{/each}
						</div>
						<div>
							<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.features}</div>
							<div class="mt-2 flex flex-wrap gap-2">
								{#each kit.featureKits as feature (feature)}
									<span class="sk-pill text-[11px]">{feature}</span>
								{/each}
							</div>
						</div>
						{#if kit.promptRecipes[0]}
							<div class="rounded-[10px] border border-[var(--sk-line)] bg-white/60 p-3">
								<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.prompts}</div>
								<p class="mt-1 text-sm font-medium text-[var(--sk-ink)]">
									{kit.promptRecipes[0].title}
								</p>
								<p class="mt-1 text-xs leading-5 text-[var(--sk-muted)]">
									{kit.promptRecipes[0].prompt}
								</p>
							</div>
						{/if}

						<div
							class="mt-auto grid gap-2 border-t border-[var(--sk-line)] pt-4 text-xs text-[var(--sk-muted)] sm:grid-cols-3"
						>
							<div>
								<div class="sk-mono text-[10px] text-[var(--sk-faint)]">{copy.structure}</div>
								<div>{kit.sectionCount} {copy.sections}</div>
							</div>
							<div>
								<div class="sk-mono text-[10px] text-[var(--sk-faint)]">{copy.languages}</div>
								<div>{kit.locales.map((locale) => locale.toUpperCase()).join(' · ')}</div>
							</div>
							<div>
								<div class="sk-mono text-[10px] text-[var(--sk-faint)]">{copy.quality}</div>
								<div>
									{kit.quality.blockerCount}
									{copy.blockers} · {kit.quality.warningCount}
									{copy.warnings}
								</div>
							</div>
						</div>

						<a href={l(`/new?kit=${kit.slug}`)} class="sk-btn sk-btn-secondary sk-btn-sm w-fit">
							{copy.startStyle}
						</a>
					</div>
				</article>
			{/each}
		</section>

		<section class="sk-soft p-5 text-sm leading-6 text-[var(--sk-muted)]">
			{copy.note}
		</section>
	</MarketingSection>
</PublicShell>
