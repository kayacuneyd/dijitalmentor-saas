<script lang="ts">
	import { page } from '$app/state';
	import LegalShell from '$lib/ui/LegalShell.svelte';
	import type { Locale } from '$lib/i18n';

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? 'tr');

	const titles: Record<Locale, string> = {
		tr: 'KVKK Aydınlatma ve Açık Rıza Metni',
		en: 'KVKK Disclosure and Explicit Consent Notice',
		de: 'KVKK-Informations- und Einwilligungserklärung'
	};
</script>

<LegalShell title={titles[locale]}>
	{#if locale === 'en'}
		<p class="sk-callout">
			<strong>Legal basis:</strong> Turkish Law No. 6698 on the Protection of Personal Data
			("KVKK"), Art. 10 (disclosure) and Art. 5/2 (explicit consent). This text is Turkish law —
			there is no equivalent German or EU statute with the same article numbers; it supplements
			the <a href="/legal/privacy">Privacy Policy</a>.
		</p>

		<h2>1. Data Controller</h2>
		<p>
			The organization operating the saaskaya platform is the "data controller" under KVKK.
			Contact: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>.
		</p>

		<h2>2. Disclosure Obligation (KVKK Art. 10)</h2>
		<p>
			This text is prepared to inform you about the processing of your personal data. The data
			processed, purposes, legal bases, recipients, and your rights are explained below.
		</p>

		<h2>3. Personal Data Processed</h2>
		<ul>
			<li><strong>Identity/matching:</strong> email address</li>
			<li><strong>Contact:</strong> magic link, contact-form messages</li>
			<li><strong>Transaction security:</strong> IP, session cookie, browser information</li>
			<li>
				<strong>Financial:</strong> payment provider customer ID, subscription status (no card data)
			</li>
			<li><strong>Service content:</strong> the description given to the AI, generated site content</li>
		</ul>

		<h2>4. Purposes of Processing</h2>
		<ul>
			<li>Account creation and authentication</li>
			<li>AI site generation and chat-driven editing</li>
			<li>Subscription, payment, and domain management</li>
			<li>Security and abuse prevention</li>
			<li>Fulfilling legal obligations (logs, invoicing)</li>
		</ul>

		<h2>5. Legal Bases (KVKK Art. 5/2)</h2>
		<ul>
			<li><strong>Performance of a contract:</strong> data required for the subscription and site publishing</li>
			<li><strong>Legal obligation:</strong> log retention, legal requests</li>
			<li><strong>Legitimate interest:</strong> security, rate-limiting, abuse prevention</li>
			<li><strong>Explicit consent:</strong> beta invitation, marketing (obtained separately)</li>
		</ul>

		<h2>6. Data Transfer</h2>
		<p>Your personal data may be transferred to the following third parties:</p>
		<ul>
			<li>
				<strong>AI providers (DeepSeek, Anthropic):</strong> your site description and chat text —
				transfer abroad with appropriate safeguards under KVKK Art. 9
			</li>
			<li>
				<strong>Creem:</strong> handles checkout, tax/invoicing, and payment processing as
				Merchant of Record/payment facilitator for subscription/digital-product payments
			</li>
			<li>
				<strong>Stripe:</strong> payment processing where used as a transition/fallback payment
				provider
			</li>
			<li><strong>Cloudflare R2:</strong> image storage</li>
			<li><strong>Resend/SMTP provider:</strong> transactional email</li>
			<li><strong>Domain registrar (Porkbun/NameSilo):</strong> domain owner information for WHOIS</li>
		</ul>

		<h2>7. Explicit Consent Statement</h2>
		<p>
			By accepting a beta invitation and creating an account, you give your <strong>explicit
			consent</strong> to the processing and transfer to third parties of your personal data for
			the purposes stated above. You can withdraw this consent at any time by writing to
			<a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>; withdrawing consent may
			require deleting your account.
		</p>

		<h2>8. Your Rights (KVKK Art. 11)</h2>
		<ul>
			<li>Learn whether your personal data is being processed</li>
			<li>Request information if it is</li>
			<li>Query the purpose of processing and whether it's used accordingly</li>
			<li>Request correction of incomplete/incorrect data</li>
			<li>Request deletion or destruction</li>
			<li>Request that third parties it was shared with are informed</li>
			<li>Object to results of automated analysis</li>
		</ul>
		<p>
			Requests must be made in writing to <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>;
			they are answered within 30 days.
		</p>

		<h2>9. Data Retention Periods</h2>
		<ul>
			<li>Account data: for as long as the account is active + 30 days after a deletion request</li>
			<li>Logs: 90 days</li>
			<li>Backups: 14-day rolling window</li>
		</ul>

		<h2>10. Children's Data</h2>
		<p>
			We do not knowingly process the data of people under 18. The service is not offered with
			parental consent either — saaskaya is intended for adult professionals.
		</p>

		<h2>11. Contact and Requests</h2>
		<p>
			Contact the data controller at: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
		</p>
	{:else if locale === 'de'}
		<p class="sk-callout">
			<strong>Rechtsgrundlage:</strong> türkisches Gesetz Nr. 6698 zum Schutz personenbezogener
			Daten („KVKK"), Art. 10 (Informationspflicht) und Art. 5/2 (ausdrückliche Einwilligung).
			Dieser Text bezieht sich auf türkisches Recht — es gibt keine deutsche oder EU-Vorschrift mit
			denselben Artikelnummern; er ergänzt die <a href="/legal/privacy">Datenschutzerklärung</a>.
		</p>

		<h2>1. Verantwortlicher</h2>
		<p>
			Die Organisation, die die saaskaya-Plattform betreibt, ist im Sinne des KVKK der
			„Verantwortliche". Kontakt: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>.
		</p>

		<h2>2. Informationspflicht (KVKK Art. 10)</h2>
		<p>
			Dieser Text dient dazu, dich über die Verarbeitung deiner personenbezogenen Daten zu
			informieren. Die verarbeiteten Daten, Zwecke, Rechtsgrundlagen, Empfänger und deine Rechte
			werden im Folgenden erläutert.
		</p>

		<h2>3. Verarbeitete personenbezogene Daten</h2>
		<ul>
			<li><strong>Identität/Zuordnung:</strong> E-Mail-Adresse</li>
			<li><strong>Kontakt:</strong> Magic-Link, Kontaktformular-Nachrichten</li>
			<li><strong>Transaktionssicherheit:</strong> IP, Sitzungscookie, Browserinformationen</li>
			<li>
				<strong>Finanziell:</strong> Kunden-ID des Zahlungsanbieters, Abo-Status (keine Kartendaten)
			</li>
			<li><strong>Diensteinhalt:</strong> die der KI gegebene Beschreibung, generierte Website-Inhalte</li>
		</ul>

		<h2>4. Zwecke der Verarbeitung</h2>
		<ul>
			<li>Kontoerstellung und Authentifizierung</li>
			<li>KI-Website-Generierung und Chat-Bearbeitung</li>
			<li>Abo-, Zahlungs- und Domain-Verwaltung</li>
			<li>Sicherheit und Missbrauchsprävention</li>
			<li>Erfüllung rechtlicher Verpflichtungen (Protokolle, Rechnungsstellung)</li>
		</ul>

		<h2>5. Rechtsgrundlagen (KVKK Art. 5/2)</h2>
		<ul>
			<li><strong>Vertragserfüllung:</strong> für Abo und Website-Veröffentlichung erforderliche Daten</li>
			<li><strong>Rechtliche Verpflichtung:</strong> Protokollspeicherung, behördliche Anfragen</li>
			<li><strong>Berechtigtes Interesse:</strong> Sicherheit, Ratenbegrenzung, Missbrauchsprävention</li>
			<li><strong>Ausdrückliche Einwilligung:</strong> Beta-Einladung, Marketing (separat eingeholt)</li>
		</ul>

		<h2>6. Datenübermittlung</h2>
		<p>Deine personenbezogenen Daten können an folgende Dritte übermittelt werden:</p>
		<ul>
			<li>
				<strong>KI-Anbieter (DeepSeek, Anthropic):</strong> deine Website-Beschreibung und
				Chat-Texte — Übermittlung ins Ausland mit angemessenen Garantien gemäß KVKK Art. 9
			</li>
			<li>
				<strong>Creem:</strong> übernimmt als Merchant of Record/Zahlungsdienstleister für
				Abo-/Digitalprodukt-Zahlungen Checkout, Steuer/Rechnungsstellung und Zahlungsabwicklung
			</li>
			<li>
				<strong>Stripe:</strong> Zahlungsabwicklung, sofern als Übergangs-/Fallback-Zahlungsanbieter verwendet
			</li>
			<li><strong>Cloudflare R2:</strong> Bildspeicherung</li>
			<li><strong>Resend/SMTP-Anbieter:</strong> transaktionale E-Mails</li>
			<li><strong>Domain-Registrar (Porkbun/NameSilo):</strong> Angaben zum Domain-Inhaber für WHOIS</li>
		</ul>

		<h2>7. Einwilligungserklärung</h2>
		<p>
			Mit der Annahme einer Beta-Einladung und der Kontoerstellung erteilst du deine
			<strong>ausdrückliche Einwilligung</strong> zur Verarbeitung und Weitergabe deiner
			personenbezogenen Daten an Dritte für die oben genannten Zwecke. Du kannst diese Einwilligung
			jederzeit widerrufen, indem du an <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			schreibst; ein Widerruf kann die Löschung deines Kontos erforderlich machen.
		</p>

		<h2>8. Deine Rechte (KVKK Art. 11)</h2>
		<ul>
			<li>Erfahren, ob deine personenbezogenen Daten verarbeitet werden</li>
			<li>Falls ja, Auskunft verlangen</li>
			<li>Den Verarbeitungszweck und dessen zweckgemäße Einhaltung hinterfragen</li>
			<li>Berichtigung unvollständiger/fehlerhafter Daten verlangen</li>
			<li>Löschung oder Vernichtung verlangen</li>
			<li>Verlangen, dass Dritte, an die deine Daten weitergegeben wurden, informiert werden</li>
			<li>Ergebnissen automatisierter Analysen widersprechen</li>
		</ul>
		<p>
			Anfragen müssen schriftlich an <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			gerichtet werden; sie werden innerhalb von 30 Tagen beantwortet.
		</p>

		<h2>9. Speicherfristen</h2>
		<ul>
			<li>Kontodaten: solange das Konto aktiv ist + 30 Tage nach einer Löschanfrage</li>
			<li>Protokolle: 90 Tage</li>
			<li>Backups: rollierendes 14-Tage-Fenster</li>
		</ul>

		<h2>10. Daten von Kindern</h2>
		<p>
			Wir verarbeiten wissentlich keine Daten von Personen unter 18 Jahren. Der Dienst wird auch
			nicht mit elterlicher Zustimmung angeboten — saaskaya richtet sich an erwachsene
			Fachpersonen.
		</p>

		<h2>11. Kontakt und Anfragen</h2>
		<p>
			Kontakt zum Verantwortlichen: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
		</p>
	{:else}
		<p class="sk-callout">
			<strong>Yasal dayanak:</strong> 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") md. 10 (aydınlatma)
			ve md. 5/2 (açık rıza). Bu metin, gizlilik politikasının tamamlayıcısıdır.
		</p>

		<h2>1. Veri Sorumlusu</h2>
		<p>
			saaskaya platformunu işleten kuruluş, KVKK anlamında "veri sorumlusu"dur. İletişim:
			<a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>.
		</p>

		<h2>2. Aydınlatma Yükümlülüğü (KVKK md. 10)</h2>
		<p>
			Bu metin, kişisel verilerinizin işlenmesine ilişkin sizi aydınlatmak amacıyla hazırlanmıştır.
			İşlenen veriler, amaçlar, hukuki dayanaklar, alıcılar ve haklarınız aşağıda açıklanmıştır.
		</p>

		<h2>3. İşlenen Kişisel Veriler</h2>
		<ul>
			<li><strong>Kimlik/eşleştirme:</strong> e-posta adresi</li>
			<li><strong>İletişim:</strong> magic link, iletişim formu mesajları</li>
			<li><strong>İşlem güvenliği:</strong> IP, oturum çerezi, tarayıcı bilgisi</li>
			<li>
				<strong>Finansal:</strong> ödeme sağlayıcısı müşteri kimliği, abonelik durumu (kart verisi yok)
			</li>
			<li><strong>Hizmet içeriği:</strong> AI'a verilen açıklama, üretilen site içeriği</li>
		</ul>

		<h2>4. İşleme Amaçları</h2>
		<ul>
			<li>Hesap oluşturma ve kimlik doğrulama</li>
			<li>AI site üretimi ve sohbet düzenleme</li>
			<li>Abonelik, ödeme ve domain yönetimi</li>
			<li>Güvenlik ve kötüye kullanım önleme</li>
			<li>Yasal yükümlülüklerin ifası (log, fatura)</li>
		</ul>

		<h2>5. Hukuki Dayanaklar (KVKK md. 5/2)</h2>
		<ul>
			<li><strong>Sözleşmenin ifası:</strong> abonelik ve site yayını için gerekli veriler</li>
			<li><strong>Yasal yükümlülük:</strong> log saklama, yasal talepler</li>
			<li><strong>Meşru menfaat:</strong> güvenlik, rate-limit, kötüye kullanım önleme</li>
			<li><strong>Açık rıza:</strong> beta daveti, pazarlama (ayrı onay)</li>
		</ul>

		<h2>6. Veri Aktarımı</h2>
		<p>Kişisel verileriniz aşağıdaki üçüncü taraflara aktarılabilir:</p>
		<ul>
			<li>
				<strong>AI sağlayıcılar (DeepSeek, Anthropic):</strong> site açıklama ve sohbet metni — yurt dışına
				aktarım KVKK md. 9 kapsamında uygun güvence ile
			</li>
			<li>
				<strong>Creem:</strong> abonelik/dijital ürün ödemelerinde Merchant of Record/ödeme satıcısı olarak
				checkout, vergi/fatura ve ödeme işleme
			</li>
			<li>
				<strong>Stripe:</strong> geçiş/fallback ödeme sağlayıcısı olarak kullanıldığı durumlarda ödeme işleme
			</li>
			<li><strong>Cloudflare R2:</strong> görsel depolama</li>
			<li><strong>Resend/SMTP sağlayıcı:</strong> transactional e-posta</li>
			<li><strong>Domain kayıtçı (Porkbun/NameSilo):</strong> WHOIS için domain sahibi bilgisi</li>
		</ul>

		<h2>7. Açık Rıza Beyanı</h2>
		<p>
			Beta daveti kabul ederek ve hesap oluşturarak, kişisel verilerinizin yukarıda belirtilen amaçlar
			kapsamında işlenmesine ve üçüncü taraflara aktarılmasına <strong>açık rıza</strong>
			vermiş olursunuz. Bu rızayı istediğiniz zaman
			<a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a> adresine yazarak geri çekebilirsiniz;
			rızanın geri çekilmesi hesabınızın silinmesini gerektirebilir.
		</p>

		<h2>8. Haklarınız (KVKK md. 11)</h2>
		<ul>
			<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
			<li>İşlenmişse bilgi talep etme</li>
			<li>İşlenme amacını ve uygunluğunu sorgulama</li>
			<li>Eksik/yanlış verilerin düzeltilmesini isteme</li>
			<li>Silinmesini veya yok edilmesini isteme</li>
			<li>Aktarıldığı üçüncü kişilerin bilgilendirilmesini isteme</li>
			<li>Otomatik analiz sonuçlarına itiraz etme</li>
		</ul>
		<p>
			Başvurular <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a> adresine yazılı olarak yapılır;
			30 gün içinde yanıtlanır.
		</p>

		<h2>9. Veri Saklama Süreleri</h2>
		<ul>
			<li>Hesap verileri: hesap aktif olduğu sürece + silme talebinden sonra 30 gün</li>
			<li>Loglar: 90 gün</li>
			<li>Yedekler: 14 günlük rolling pencere</li>
		</ul>

		<h2>10. Çocuk Verisi</h2>
		<p>
			18 yaş altı kişilerin verisi bilerek işlenmez. Ebeveyn onayı ile de hizmet sunulmaz — saaskaya
			yetişkin profesyonellere yöneliktir.
		</p>

		<h2>11. İletişim ve Başvuru</h2>
		<p>
			Veri sorumlusu ile iletişim: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
		</p>
	{/if}
</LegalShell>
