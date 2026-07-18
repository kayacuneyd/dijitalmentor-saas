<script lang="ts">
	import { page } from '$app/state';
	import { withLocale, type Locale } from '$lib/i18n';

	let { locale }: { locale: Locale } = $props();
	const l = (path: string) => withLocale(locale, path);
	const iconUrl = $derived(page.data.platformBranding?.iconUrl ?? '/logo.svg');
	const brandName = $derived(page.data.platformBranding?.brandName ?? 'saaskaya');
	const showWordmark = $derived(page.data.platformBranding?.showWordmark ?? true);

	const copy = $derived(
		{
			en: {
				product: 'Product',
				company: 'Company',
				legal: 'Legal',
				account: 'Account',
				home: 'Home',
				pricing: 'Pricing',
				templates: 'Templates',
				start: 'Start / Beta',
				about: 'About',
				blog: 'Blog',
				contact: 'Contact',
				privacy: 'Privacy',
				terms: 'Terms',
				kvkk: 'KVKK',
				refund: 'Refund',
				disclaimer: 'Disclaimer',
				acceptable: 'Acceptable Use',
				login: 'Login',
				dashboard: 'Dashboard',
				tagline: 'AI-assisted websites for professionals, built from safe structured data.',
				location: 'Operated from Kornwestheim, Germany.'
			},
			tr: {
				product: 'Ürün',
				company: 'Şirket',
				legal: 'Yasal',
				account: 'Hesap',
				home: 'Ana sayfa',
				pricing: 'Fiyatlandırma',
				templates: 'Kitler',
				start: 'Başla / Beta',
				about: 'Hakkımızda',
				blog: 'Blog',
				contact: 'İletişim',
				privacy: 'Gizlilik',
				terms: 'Şartlar',
				kvkk: 'KVKK',
				refund: 'İade',
				disclaimer: 'Sorumluluk reddi',
				acceptable: 'Kabul Edilebilir Kullanım',
				login: 'Giriş',
				dashboard: 'Dashboard',
				tagline: 'Uzmanlar için güvenli yapısal veriden üretilen AI destekli web siteleri.',
				location: 'Kornwestheim, Almanya merkezli yürütülür.'
			},
			de: {
				product: 'Produkt',
				company: 'Unternehmen',
				legal: 'Rechtliches',
				account: 'Konto',
				home: 'Start',
				pricing: 'Preise',
				templates: 'Kits',
				start: 'Start / Beta',
				about: 'Über uns',
				blog: 'Blog',
				contact: 'Kontakt',
				privacy: 'Datenschutz',
				terms: 'Bedingungen',
				kvkk: 'KVKK',
				refund: 'Erstattung',
				disclaimer: 'Haftungsausschluss',
				acceptable: 'Zulässige Nutzung',
				login: 'Login',
				dashboard: 'Dashboard',
				tagline: 'AI-gestützte Websites für Profis, aus sicherer strukturierter Datenbasis.',
				location: 'Betrieben aus Kornwestheim, Deutschland.'
			}
		}[locale]
	);

	const columns = $derived([
		{
			title: copy.product,
			links: [
				[copy.home, '/'],
				[copy.pricing, '/pricing'],
				[copy.templates, '/templates'],
				[copy.start, '/beta']
			]
		},
		{
			title: copy.company,
			links: [
				[copy.about, '/about'],
				[copy.blog, '/blog'],
				[copy.contact, '/contact']
			]
		},
		{
			title: copy.legal,
			links: [
				[copy.privacy, '/legal/privacy'],
				[copy.terms, '/legal/terms'],
				[copy.kvkk, '/legal/kvkk'],
				[copy.refund, '/legal/refund'],
				[copy.disclaimer, '/legal/disclaimer'],
				[copy.acceptable, '/legal/acceptable-use']
			]
		},
		{
			title: copy.account,
			links: [
				[copy.login, '/login'],
				[copy.dashboard, '/dashboard']
			]
		}
	]);
</script>

<footer class="border-t border-[var(--sk-line)] bg-[rgb(251_250_247/.82)]">
	<div class="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_2.8fr]">
		<div>
			<div class="flex items-center gap-3">
				<img src={iconUrl} alt="saaskaya" class="size-10 rounded-[9px] object-contain" />
				{#if showWordmark}<span class="text-lg font-semibold tracking-[-0.02em]">{brandName}</span
					>{/if}
			</div>
			<p class="mt-3 max-w-xs text-sm leading-6 text-[var(--sk-muted)]">{copy.tagline}</p>
			<p class="mt-2 text-xs text-[var(--sk-faint)]">{copy.location}</p>
		</div>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each columns as column (column.title)}
				<div>
					<h2 class="sk-mono text-[10.5px] text-[var(--sk-faint)]">{column.title}</h2>
					<ul class="mt-3 space-y-1">
						{#each column.links as [label, href] (`${column.title}-${href}`)}
							<li>
								<a
									href={href === '/dashboard' ? href : l(href)}
									class="inline-flex min-h-8 items-center py-1 text-sm text-[var(--sk-muted)] hover:text-[var(--sk-ink)]"
								>
									{label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
	<div
		class="border-t border-[var(--sk-line)] px-4 pt-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-center text-xs text-[var(--sk-muted)]"
	>
		Built & developed in Kornwestheim by
		<a class="sk-link text-[var(--sk-ink)]" href="https://kayacuneyt.com" rel="noopener noreferrer"
			>Cüneyt Kaya</a
		>
		with love
	</div>
</footer>
