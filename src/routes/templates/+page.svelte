<script lang="ts">
	import BrandMark from '$lib/ui/BrandMark.svelte';
	import MessageBubble from '$lib/ui/MessageBubble.svelte';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';
	import { withLocale, type Locale } from '$lib/i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);
	const copy = $derived(
		{
			en: {
				title: 'Psychologist website kits · saaskaya',
				description:
					'Six controlled saaskaya website kits for psychologists and therapists: individual therapy, modern clinic, online therapy, child-family, couples therapy, and trauma-informed support.',
				create: 'Create site',
				back: '← saaskaya',
				pills: ['Psychologist kits', `${data.kits.length} controlled starts`, 'TR · EN · DE'],
				h1: 'Start from a safe professional structure, not a blank page.',
				lead: 'Each kit uses the existing fixed block set, passes the Zod schema, and is checked for psychology-practice safety and ethics. AI still does not write code; kits steer the first draft as controlled references.',
				primary: 'Describe your practice → see your site',
				pricing: 'Pricing',
				audience: 'Best for',
				outcome: 'Outcome',
				structure: 'Structure',
				sections: 'sections',
				languages: 'Languages',
				quality: 'Quality',
				blockers: 'blockers',
				warnings: 'warnings',
				startStyle: 'Start close to this style',
				note: 'This catalog is not a free-form template marketplace. Kits are professional references that safely steer onboarding and AI generation.'
			},
			tr: {
				title: 'Psikolog site kitleri · saaskaya',
				description:
					'Psikolog ve terapistler için 6 kontrollü saaskaya site kiti: bireysel terapi, modern klinik, online terapi, çocuk-aile, çift terapisi ve travma duyarlı destek.',
				create: 'Site oluştur',
				back: '← saaskaya',
				pills: ['Psikolog kitleri', `${data.kits.length} kontrollü başlangıç`, 'TR · EN · DE'],
				h1: 'Boş sayfadan değil, güvenli bir profesyonel yapıdan başla.',
				lead: 'Her kit mevcut sabit blok setiyle hazırlanır, Zod şemasından geçer ve psikolog pratiği için güvenlik/etik kalite kontrolleriyle doğrulanır. AI yine kod yazmaz; bu kitler ilk taslağı yönlendiren kontrollü referanslardır.',
				primary: 'Pratiğini anlat → siteni gör',
				pricing: 'Fiyatlandırma',
				audience: 'Hedef kullanım',
				outcome: 'Sonuç',
				structure: 'Yapı',
				sections: 'bölüm',
				languages: 'Diller',
				quality: 'Kalite',
				blockers: 'engel',
				warnings: 'uyarı',
				startStyle: 'Bu stile yakın başla',
				note: 'Bu katalog serbest template marketi değil. Kitler, onboarding ve AI üretimini güvenli biçimde yönlendiren profesyonel referanslardır.'
			},
			de: {
				title: 'Psychologen-Website-Kits · saaskaya',
				description: 'Sechs kontrollierte saaskaya Website-Kits für Psychologen und Therapeuten.',
				create: 'Website erstellen',
				back: '← saaskaya',
				pills: ['Psychologen-Kits', `${data.kits.length} kontrollierte Starts`, 'TR · EN · DE'],
				h1: 'Starte mit einer sicheren professionellen Struktur, nicht mit einer leeren Seite.',
				lead: 'Jedes Kit nutzt das feste Block-Set, besteht die Zod-Struktur und wird für psychologische Praxis-Sicherheit geprüft. AI schreibt weiterhin keinen Code; Kits steuern den ersten Entwurf als kontrollierte Referenzen.',
				primary: 'Praxis beschreiben → Website sehen',
				pricing: 'Preise',
				audience: 'Geeignet für',
				outcome: 'Ergebnis',
				structure: 'Struktur',
				sections: 'Abschnitte',
				languages: 'Sprachen',
				quality: 'Qualität',
				blockers: 'Blocker',
				warnings: 'Warnungen',
				startStyle: 'Nah an diesem Stil starten',
				note: 'Dieser Katalog ist kein freier Template-Marktplatz. Kits sind professionelle Referenzen, die Onboarding und AI-Generierung sicher steuern.'
			}
		}[locale]
	);

	const swatches = ['#2f6f6a', '#264f73', '#3f5f8f', '#5f6f52', '#6f4e5f', '#4d6864'];
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
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-10 sm:py-14">
		<header class="flex flex-col items-start gap-5">
			<a href={l('/')} class="sk-link text-sm text-[var(--sk-faint)]">{copy.back}</a>
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
				<a href={l('/new')} class="sk-btn sk-btn-primary sk-btn-lg">{copy.primary}</a>
				<a href={l('/pricing')} class="sk-btn sk-btn-secondary sk-btn-lg">{copy.pricing}</a>
			</div>
		</header>

		<section class="grid gap-4 lg:grid-cols-2">
			{#each data.kits as kit, i (kit.slug)}
				<article class="sk-card flex min-h-full flex-col overflow-hidden">
					<img
						src="/templates/{kit.slug}.jpg"
						alt="{kit.label} — {kit.headline}"
						loading="lazy"
						width="1280"
						height="860"
						class="aspect-3/2 w-full border-b border-[var(--sk-line)] object-cover object-top"
					/>
					<div class="flex items-start justify-between gap-4 p-5 pb-0">
						<div>
							<div class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{kit.slug}</div>
							<h2 class="mt-1 text-xl font-semibold text-[var(--sk-ink)]">{kit.label}</h2>
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
	</div>
	<MessageBubble {locale} userEmail={data.user?.email ?? ''} />
</PublicShell>
