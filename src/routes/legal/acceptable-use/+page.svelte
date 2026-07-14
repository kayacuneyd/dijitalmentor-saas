<script lang="ts">
	import { page } from '$app/state';
	import type { Locale } from '$lib/i18n';
	import LegalShell from '$lib/ui/LegalShell.svelte';

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? 'tr');
	const titles: Record<Locale, string> = {
		en: 'Acceptable Use',
		tr: 'Kabul Edilebilir Kullanım',
		de: 'Zulässige Nutzung'
	};
</script>

<LegalShell title={titles[locale]}>
	{#if locale === 'en'}
		<p class="sk-callout">
			<strong>Relationship:</strong> This policy supplements the
			<a href="/legal/terms">Terms of Use</a>. Violations may result in suspension.
		</p>
		<h2>1. General principles</h2>
		<p>
			You must use saaskaya lawfully, in line with these Terms and professional ethics. The service
			is intended for professional practices, not as a general-purpose website builder.
		</p>
		<h2>2. Prohibited content</h2>
		<p>
			Do not publish, upload, or submit to AI content that is unlawful, abusive or defamatory,
			infringes intellectual property, is deceptive, spam/phishing/malware, sexually explicit or
			disturbing, or makes misleading claims requiring regulated professional authority.
		</p>
		<h2>3. Professional advertising rules</h2>
		<p>
			Psychologists, lawyers, dentists, and other regulated professionals remain responsible for
			complying with applicable advertising and professional rules. Do not promise treatment, legal
			outcomes, guaranteed results, or use misleading titles or comparisons. See the <a
				href="/legal/disclaimer">professional disclaimer</a
			>.
		</p>
		<h2>4. Prohibited conduct</h2>
		<p>
			Do not exploit AI credits with automation, bypass limits, access another account or site,
			reverse engineer, scrape, overload the platform, obtain keys or internal data, or create
			accounts to evade limits.
		</p>
		<h2>5. AI use</h2>
		<p>
			Do not enter personal or sensitive client data. Review AI output before publishing; it is a
			draft, not professional advice, and may not be used to create unlawful or harmful content.
		</p>
		<h2>6. Media and domains</h2>
		<p>
			Upload only media you own or are entitled to use. Do not upload client imagery without
			explicit consent. Do not use domains for spam, phishing, malicious activity, or infringement.
		</p>
		<h2>7. Reports and enforcement</h2>
		<p>
			Report suspected violations to <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>.
			We may remove content, warn, suspend, or terminate accounts; serious security or criminal
			abuse may be acted on immediately.
		</p>
		<h2>8. Copyright complaints</h2>
		<p>
			Copyright notices should identify the protected work, allegedly infringing URL, contact
			details, a good-faith statement, and signature.
		</p>
	{:else if locale === 'de'}
		<p class="sk-callout">
			<strong>Bezug:</strong> Diese Richtlinie ergänzt die
			<a href="/legal/terms">Nutzungsbedingungen</a>. Verstöße können zur Sperrung führen.
		</p>
		<h2>1. Allgemeine Grundsätze</h2>
		<p>
			Du musst saaskaya rechtmäßig sowie im Einklang mit diesen Bedingungen und der Berufsethik
			nutzen. Der Dienst ist für professionelle Praxen gedacht, nicht als allgemeiner
			Website-Baukasten.
		</p>
		<h2>2. Verbotene Inhalte</h2>
		<p>
			Du darfst keine rechtswidrigen, beleidigenden oder verleumderischen, schutzrechtsverletzenden,
			irreführenden, Spam-/Phishing-/Malware-, sexuellen oder verstörenden Inhalte veröffentlichen,
			hochladen oder an die KI übergeben. Ebenso verboten sind irreführende Aussagen, die eine
			regulierte Berufsberechtigung voraussetzen.
		</p>
		<h2>3. Berufs- und Werberegeln</h2>
		<p>
			Psycholog:innen, Anwält:innen, Zahnärzt:innen und andere regulierte Berufe sind selbst für
			geltende Werbe- und Berufsregeln verantwortlich. Versprich keine Behandlung, keinen
			Rechtsausgang und keinen garantierten Erfolg und verwende keine irreführenden Titel oder
			Vergleiche. Siehe den <a href="/legal/disclaimer">Haftungsausschluss</a>.
		</p>
		<h2>4. Verbotenes Verhalten</h2>
		<p>
			Untersagt sind die automatisierte Ausnutzung von KI-Credits, das Umgehen von Limits,
			unbefugter Zugriff auf Konten oder Websites, Reverse Engineering, Scraping, Überlastung der
			Plattform, das Erlangen von Schlüsseln oder internen Daten sowie Mehrfachkonten zur
			Limitumgehung.
		</p>
		<h2>5. KI-Nutzung</h2>
		<p>
			Gib keine persönlichen oder sensiblen Klientendaten ein. Prüfe KI-Ausgaben vor der
			Veröffentlichung; sie sind Entwürfe, keine professionelle Beratung, und dürfen nicht für
			rechtswidrige oder schädliche Inhalte verwendet werden.
		</p>
		<h2>6. Medien und Domains</h2>
		<p>
			Lade nur Medien hoch, die dir gehören oder für die du Nutzungsrechte hast. Lade keine
			Klientenbilder ohne ausdrückliche Einwilligung hoch. Domains dürfen nicht für Spam, Phishing,
			schädliche Aktivitäten oder Rechtsverletzungen genutzt werden.
		</p>
		<h2>7. Meldungen und Maßnahmen</h2>
		<p>
			Melde vermutete Verstöße an <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>. Wir
			können Inhalte entfernen, verwarnen, Konten sperren oder kündigen; schwere Sicherheits- oder
			Straftaten können sofort behandelt werden.
		</p>
		<h2>8. Urheberrechtsbeschwerden</h2>
		<p>
			Eine Beschwerde muss das geschützte Werk, die mutmaßlich verletzende URL, Kontaktdaten, eine
			Gutglaubenserklärung und eine Unterschrift enthalten.
		</p>
	{:else}
		<p class="sk-callout">
			<strong>Bağlantı:</strong> Bu metin, <a href="/legal/terms">Kullanım Şartları</a>'nın ekidir.
			İhlal, hesabın askıya alınmasına neden olabilir.
		</p>

		<h2>1. Genel İlkeler</h2>
		<p>
			saaskaya'yı yasalara, bu Şartlara ve profesyonel etiğe uygun şekilde kullanmalısınız. Hizmet,
			profesyonel pratikler için niş odaklıdır; genel amaçlı web sitesi kurucu değildir.
		</p>

		<h2>2. Yasak İçerik</h2>
		<p>Aşağıdaki içerikleri yayınlamak, yüklemek veya AI'a girmek yasaktır:</p>
		<ul>
			<li>Yasalara aykırı (suç teşvik, terör, çocuk istismarı, nefret söylemi)</li>
			<li>Hakaret, iftira, kişilik haklarına saldırı</li>
			<li>Telif hakkı, marka veya ticari sırrı ihlal eden içerik</li>
			<li>Yanıltıcı veya sahte (sahte kimlik, sahte unvan, sahte başarı iddiası)</li>
			<li>Spam, phishing, kötü amaçlı yazılım</li>
			<li>Şiddet, cinsel içerik veya rahatsız edici materyal</li>
			<li>Profesyonel yetki gerektiren (tıbbi teşhis, hukuki tavsiye) yanıltıcı iddialar</li>
		</ul>

		<h2>3. Sağlık ve Hukuk Reklam Yönetmelikleri</h2>
		<p>
			<strong>Psikologlar için:</strong> Sağlık Hizmetleri Reklam Yönetmeliği uyarınca, tıbbi sonuç iddiası
			(örn. "%100 iyileşme", "garantili tedavi") yasaktır. Site içeriğinizde tedavi garantisi, kesin teşhis
			veya diğer meslektaşları küçümseyici ifadeler kullanmayın.
		</p>
		<p>
			<strong>Avukatlar için:</strong> Türkiye Barolar Birliği ticari reklam yönetmeliği uyarınca, avukatlık
			hizmetlerinin reklamı sınırlıdır. Başarı garantisi, rakip avukatlarla karşılaştırma veya yanıltıcı
			unvan kullanmayın.
		</p>
		<p>
			<strong>Diş hekimleri için:</strong> Sağlık Bakanlığı reklam yönetmeliği uyarınca, tıbbi müdahale
			sonuçları, "ağrısız/garantili" iddiaları ve hasta öncesi-sonrası görselleri yasaktır.
		</p>
		<p>
			Detaylı sorumluluk reddi için <a href="/legal/disclaimer"
				>profesyonel sorumluluk reddi sayfasına</a
			> bakın.
		</p>

		<h2>4. Yasak Davranışlar</h2>
		<ul>
			<li>AI kredilerini otomatik script/bot ile sömürme</li>
			<li>Rate-limit veya kota bypass denemesi</li>
			<li>Başka kullanıcıların hesabına/siteye yetkisiz erişim</li>
			<li>Tersine mühendislik, scraping, otomatik veri toplama</li>
			<li>Platforma zarar verecek yük (DDoS, büyük dosya bombardımanı)</li>
			<li>API anahtarlarını veya iç sistem verilerini ele geçirme</li>
			<li>Birden fazla hesap açarak limit aşma</li>
		</ul>

		<h2>5. AI Kullanımı</h2>
		<ul>
			<li>AI'a kişisel veya hassas veri (hasta/danışan bilgisi) girmeyin</li>
			<li>AI çıktısını yayınlamadan önce gözden geçirin</li>
			<li>AI çıktısı bir tavsiye değildir; profesyonel karar sizin</li>
			<li>AI'ı yasalara aykırı veya zararlı içerik üretmek için kullanmayın</li>
		</ul>

		<h2>6. Medya Yükleme</h2>
		<ul>
			<li>Yalnızca size ait veya kullanma hakkınız olan görselleri yükleyin</li>
			<li>Telif hakkı ihlali görseleri yüklemeyin</li>
			<li>Hasta/danışan görselerini açık onay olmadan yüklemeyin</li>
			<li>Medya kotaları plan limitleriyle sınırlıdır</li>
		</ul>

		<h2>7. Domain Kullanımı</h2>
		<ul>
			<li>Domain, tescil sonrası size aittir; başkasının markasını ihlal etmeyin</li>
			<li>Domain'i spam, phishing veya kötü amaçlı kullanmayın</li>
			<li>Domain yenileme sizin sorumluluğunuzda (aboneliğe dahil değil)</li>
		</ul>

		<h2>8. İhlal Bildirimi</h2>
		<p>
			İhlal tespit ederseniz: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>.
			Operatör, ihlali 7 gün içinde değerlendirir ve gerekirse içeriği kaldırır/hesabı askıya alır.
		</p>

		<h2>9. Yaptırımlar</h2>
		<ul>
			<li>İlk ihlal: uyarı + içeriğin kaldırılması</li>
			<li>Tekrarlayan ihlal: hesap askıya alma</li>
			<li>Ağır ihlal (suç, çocuk istismarı, güvenlik): derhal fesih + yasal işlem</li>
		</ul>

		<h2>10. DMCA / Telif Şikayeti</h2>
		<p>
			Telif ihlali şikayeti için <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			adresine yazın. Geçerli bir DMCA bildirimi: (1) ihlal edilen eser, (2) ihlal eden URL, (3) iletişim
			bilgileri, (4) iyi niyet beyanı, (5) imza içermelidir.
		</p>
	{/if}
</LegalShell>
