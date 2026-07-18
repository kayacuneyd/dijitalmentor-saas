<script lang="ts">
	import MarketingSection from '$lib/ui/MarketingSection.svelte';
	import FlowbiteButton from '$lib/ui/primitives/FlowbiteButton.svelte';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { uiIcons } from '$lib/ui/icons';
	import { mergeCopy } from '$lib/publicCopy';
	import { withLocale, type Locale } from '$lib/i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	const baseCopy = $derived(
		{
			en: {
				title: 'Profession website kits · saaskaya',
				description:
					'Website starting points for professional groups such as psychologists, lawyers, dietitians, dentists, academics, and consultants.',
				create: 'Create site',
				pills: ['Profession kits', `${data.kits.length} starting points`, 'TR · EN · DE ready'],
				h1: 'Start from a profession-aware kit, not a blank page.',
				lead: 'Choose a starting point close to your work. saaskaya prepares the first site structure, text direction, and language setup so you can review and edit faster.',
				primary: 'Describe your work',
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
				note: 'These kits are starting points, not rigid templates. You can edit the text, services, pages, languages, and publishing path after the first site appears.'
			},
			tr: {
				title: 'Meslek site kitleri · saaskaya',
				description:
					'Psikolog, avukat, diyetisyen, diş hekimi, akademisyen ve danışmanlar için mesleğe yakın web sitesi başlangıçları.',
				create: 'Site oluştur',
				pills: ['Meslek kitleri', `${data.kits.length} başlangıç`, 'TR · EN · DE hazır'],
				h1: 'Boş sayfadan değil, mesleğe uygun bir kitten başla.',
				lead: 'Psikolog, avukat, diyetisyen ve diğer uzmanlar için işine yakın bir başlangıç seç. saaskaya ilk site yapısını, metin yönünü ve dil hazırlığını çıkarır; sen hızlıca inceler ve düzenlersin.',
				primary: 'Mesleğini anlat',
				pricing: 'Fiyatlandırma',
				profession: 'Meslek',
				audience: 'Hedef kullanım',
				outcome: 'Sonuç',
				features: 'Hazır parçalar',
				prompts: 'Yönlendirme',
				structure: 'Yapı',
				sections: 'bölüm',
				languages: 'Diller',
				quality: 'Kalite',
				blockers: 'engel',
				warnings: 'uyarı',
				startStyle: 'Bu stile yakın başla',
				note: 'Bu kitler kalıba sıkıştırmak için değil, boş sayfadan kurtarmak için var. İlk site göründükten sonra metni, hizmetleri, sayfaları, dilleri ve yayınlama yolunu düzenleyebilirsin.'
			},
			de: {
				title: 'Berufs-Website-Kits · saaskaya',
				description:
					'Website-Startpunkte für Berufsgruppen wie Psychologie, Recht, Ernährung, Zahnmedizin, Wissenschaft und Beratung.',
				create: 'Website erstellen',
				pills: ['Berufs-Kits', `${data.kits.length} Startpunkte`, 'TR · EN · DE bereit'],
				h1: 'Starte mit einem berufsnahen Kit, nicht mit einer leeren Seite.',
				lead: 'Wähle einen Startpunkt, der zu deiner Arbeit passt. saaskaya bereitet Struktur, Textrichtung und Sprachen vor, damit du schneller prüfen und bearbeiten kannst.',
				primary: 'Angebot beschreiben',
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
				note: 'Diese Kits sind Startpunkte, keine starren Vorlagen. Texte, Leistungen, Seiten, Sprachen und Veröffentlichung lassen sich danach anpassen.'
			}
		}[locale]
	);
	const copy = $derived(mergeCopy(baseCopy, data.copyOverrides?.[locale]));

	const swatches = ['#2f6f6a', '#264f73', '#3f7d5a', '#315f72', '#7a5267', '#4d6864'];
</script>

<SeoHead
	{locale}
	path="/templates"
	title={copy.title}
	description={copy.description}
	jsonLd={[
		organizationJsonLd(data.platformBranding?.logoUrl),
		webSiteJsonLd(locale, data.platformBranding?.logoUrl),
		softwareJsonLd(locale, copy.description)
	]}
/>

<PublicShell
	{locale}
	currentPath="/templates"
	userEmail={data.user?.email ?? null}
	label="saaskaya.com / templates"
>
	<MarketingSection class="flex flex-col gap-8 py-10 sm:py-14">
		<header class="flex flex-col items-start gap-5">
			<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{copy.pills[0]}</div>
			<div class="flex flex-wrap gap-2">
				{#each copy.pills.slice(1) as pill (pill)}
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
				<FlowbiteButton href={l('/new')} variant="primary" size="lg"
					>{copy.primary}{@html uiIcons.arrowRight(16)}</FlowbiteButton
				>
				<FlowbiteButton href={l('/pricing')} variant="secondary" size="lg"
					>{copy.pricing}</FlowbiteButton
				>
			</div>
		</header>

		<section class="template-showcase" aria-label={copy.title}>
			{#each data.kits as kit, i (kit.slug)}
				<article class="sk-card template-card flex min-h-full flex-col overflow-hidden">
					{#if kit.hasImage}
						<img
							src="/templates/{kit.slug}.jpg"
							alt="{kit.label} — {kit.headline}"
							loading="eager"
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
							class="size-10 shrink-0 rounded"
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

						<FlowbiteButton
							href={l(`/new?kit=${kit.slug}`)}
							variant="secondary"
							size="sm"
							class="w-fit"
						>
							{copy.startStyle}
						</FlowbiteButton>
					</div>
				</article>
			{/each}
		</section>

		<section class="sk-soft p-5 text-sm leading-6 text-[var(--sk-muted)]">
			{copy.note}
		</section>
	</MarketingSection>
</PublicShell>

<style>
	.template-showcase {
		display: grid;
		grid-auto-columns: minmax(18.5rem, 74vw);
		grid-auto-flow: column;
		gap: 1rem;
		margin-inline: -1.25rem;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		padding: 0.25rem 1.25rem 1rem;
		scroll-padding-inline: 1.25rem;
		scroll-snap-type: x mandatory;
	}

	.template-card {
		scroll-snap-align: start;
		transition:
			transform 0.18s ease,
			box-shadow 0.18s ease,
			border-color 0.18s ease;
	}

	.template-card:hover,
	.template-card:focus-within {
		border-color: rgb(23 22 20 / 0.24);
		box-shadow: 0 18px 34px -28px rgb(23 22 20 / 0.42);
		transform: translateY(-2px);
	}

	@media (min-width: 768px) {
		.template-showcase {
			grid-auto-columns: minmax(26rem, 48%);
			margin-inline: 0;
			padding-inline: 0;
			scroll-padding-inline: 0;
		}
	}

	@media (min-width: 1180px) {
		.template-showcase {
			grid-auto-columns: minmax(30rem, calc((100% - 1rem) / 2));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.template-card {
			transition: none;
		}

		.template-card:hover,
		.template-card:focus-within {
			transform: none;
		}
	}
</style>
