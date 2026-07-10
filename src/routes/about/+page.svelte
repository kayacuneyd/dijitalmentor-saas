<script lang="ts">
	import { withLocale, type Locale } from '$lib/i18n';
	import { organizationJsonLd, softwareJsonLd, webSiteJsonLd } from '$lib/seo';
	import MessageBubble from '$lib/ui/MessageBubble.svelte';
	import PublicShell from '$lib/ui/PublicShell.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import StatusPill from '$lib/ui/StatusPill.svelte';

	let { data } = $props();
	const locale: Locale = $derived(data.locale);
	const l = (path: string) => withLocale(locale, path);

	const copy = $derived(
		{
			en: {
				title: 'About saaskaya · AI-assisted websites for professionals',
				description:
					'saaskaya helps professionals and small businesses launch multilingual websites with safe AI, controlled components, and a real publishing workflow.',
				kicker: 'About',
				h1: 'A safer way for professionals to launch a multilingual website.',
				lead: 'saaskaya is built for people who need a clear, trustworthy online presence without becoming web designers or managing scattered tools.',
				primary: 'Start beta',
				secondary: 'See pricing',
				pills: ['Kornwestheim, Germany', 'TR · EN · DE', 'Closed beta'],
				sections: [
					[
						'Who it is for',
						'Psychologists, lawyers, consultants, therapists, academics, and small service businesses that need a professional site clients can understand quickly.'
					],
					[
						'What the platform does',
						'You describe your practice, choose a controlled starting structure, review a live preview, edit by chat or direct text changes, and publish on a subdomain or custom domain.'
					],
					[
						'Why it is not just an AI wrapper',
						'AI does not write arbitrary website code. saaskaya keeps output inside validated structured data, fixed components, preview, publishing, backups, and support workflows.'
					]
				],
				trustTitle: 'Built with operator accountability',
				trustBody:
					'saaskaya is operated from Kornwestheim by Cüneyt Kaya. The product is intentionally narrow at launch: professionals, multilingual sites, controlled AI output, and practical support.'
			},
			tr: {
				title: 'saaskaya hakkında · Uzmanlar için AI destekli web siteleri',
				description:
					'saaskaya uzmanlara ve küçük işletmelere güvenli AI, kontrollü bileşenler ve gerçek yayınlama akışıyla çok dilli web sitesi kurma imkanı verir.',
				kicker: 'Hakkımızda',
				h1: 'Uzmanların çok dilli web sitesini daha güvenli biçimde yayına alması için.',
				lead: 'saaskaya, web tasarımcıya dönüşmeden veya dağınık araçları yönetmeden güvenilir bir online varlık isteyen kişiler için geliştirilir.',
				primary: 'Betaya başla',
				secondary: 'Fiyatı gör',
				pills: ['Kornwestheim, Almanya', 'TR · EN · DE', 'Kapalı beta'],
				sections: [
					[
						'Kimler için',
						'Psikologlar, avukatlar, danışmanlar, terapistler, akademisyenler ve müşterilerin hızlıca anlayabileceği profesyonel bir siteye ihtiyaç duyan küçük hizmet işletmeleri.'
					],
					[
						'Platform ne yapar',
						'Pratiğinizi anlatır, kontrollü bir başlangıç yapısı seçer, canlı önizlemeyi inceler, sohbetle veya doğrudan metin düzenleyerek yayına alırsınız.'
					],
					[
						'Neden sadece AI wrapper değil',
						'AI serbest web kodu yazmaz. saaskaya çıktıyı doğrulanmış yapısal veri, sabit bileşenler, önizleme, yayınlama, yedek ve destek akışları içinde tutar.'
					]
				],
				trustTitle: 'Operatör sorumluluğuyla inşa edildi',
				trustBody:
					'saaskaya Kornwestheim merkezli olarak Cüneyt Kaya tarafından yürütülür. Ürün lansmanda bilinçli olarak dar tutulur: uzmanlar, çok dilli siteler, kontrollü AI çıktısı ve pratik destek.'
			},
			de: {
				title: 'Über saaskaya · AI-gestützte Websites für Fachleute',
				description:
					'saaskaya hilft Fachleuten und kleinen Unternehmen, mehrsprachige Websites mit sicherer AI, kontrollierten Komponenten und Publishing-Workflow zu starten.',
				kicker: 'Über uns',
				h1: 'Ein sichererer Weg für Fachleute, eine mehrsprachige Website zu starten.',
				lead: 'saaskaya ist für Menschen gebaut, die eine klare, vertrauenswürdige Online-Präsenz brauchen, ohne Webdesign lernen oder viele Tools verwalten zu müssen.',
				primary: 'Beta starten',
				secondary: 'Preise ansehen',
				pills: ['Kornwestheim, Deutschland', 'TR · EN · DE', 'Geschlossene Beta'],
				sections: [
					[
						'Für wen',
						'Psychologen, Anwälte, Berater, Therapeuten, Akademiker und kleine Dienstleister, die eine professionelle und schnell verständliche Website brauchen.'
					],
					[
						'Was die Plattform macht',
						'Du beschreibst deine Praxis, wählst eine kontrollierte Startstruktur, prüfst die Live-Vorschau, bearbeitest per Chat oder direkt und veröffentlichst auf Subdomain oder eigener Domain.'
					],
					[
						'Warum es nicht nur ein AI-Wrapper ist',
						'AI schreibt keinen beliebigen Website-Code. saaskaya hält Ausgaben in validierter Struktur, festen Komponenten, Vorschau, Publishing, Backups und Support-Workflows.'
					]
				],
				trustTitle: 'Mit operativer Verantwortung gebaut',
				trustBody:
					'saaskaya wird von Cüneyt Kaya aus Kornwestheim betrieben. Das Produkt ist zum Launch bewusst fokussiert: Fachleute, mehrsprachige Websites, kontrollierte AI-Ausgaben und praktische Unterstützung.'
			}
		}[locale]
	);
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
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-10 sm:py-14">
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
	</section>
	<MessageBubble {locale} userEmail={data.user?.email ?? ''} />
</PublicShell>
