<script lang="ts">
	import { page } from '$app/state';
	import LegalShell from '$lib/ui/LegalShell.svelte';
	import ManagedDocument from '$lib/ui/ManagedDocument.svelte';
	import type { Locale } from '$lib/i18n';

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? 'tr');

	const titles: Record<Locale, string> = {
		tr: 'Gizlilik Politikası',
		en: 'Privacy Policy',
		de: 'Datenschutzerklärung'
	};
	const title = $derived(String(page.data.publicCopy?.privacy?.title ?? titles[locale]));
	const managedBody = $derived(String(page.data.publicCopy?.privacy?.body ?? '').trim());
</script>

<LegalShell {title}>
	{#if managedBody}<ManagedDocument text={managedBody} />{:else}
		{#if locale === 'en'}
			<p class="sk-callout">
				<strong>Beta notice:</strong> saaskaya is currently in closed beta. This policy applies to beta
				participants and may be updated before the paid public launch.
			</p>

			<h2>1. Who Processes Your Data</h2>
			<p>
				saaskaya ("we", "the platform") is an AI-assisted website platform. This privacy policy
				applies to the platform itself, run at saaskaya.com — not to the sites our customers
				publish. Privacy policies for customer sites are the site owner's responsibility.
			</p>

			<h2>2. Personal Data We Process</h2>
			<h3>Account data</h3>
			<ul>
				<li>Email address (for sign-in and contact)</li>
				<li>Subscription status (Pro/Premium, billing period end)</li>
				<li>Payment provider customer ID (we never store card details)</li>
				<li>Site keys and ownership relationship</li>
			</ul>
			<h3>Site content</h3>
			<ul>
				<li>The professional description and chat messages you give the AI</li>
				<li>Generated site content (text, image references, theme)</li>
				<li>Messages from your contact form (collected on your own site)</li>
			</ul>
			<h3>Technical data</h3>
			<ul>
				<li>IP address (for abuse prevention and rate-limiting)</li>
				<li>Browser type, session cookie</li>
				<li>System logs (debugging, security events)</li>
			</ul>

			<h2>3. Purposes of Processing</h2>
			<ul>
				<li>Account creation and authentication (magic link)</li>
				<li>AI site generation and chat-driven editing</li>
				<li>Subscription and payment management</li>
				<li>Domain registration and configuration</li>
				<li>Security, abuse prevention, and legal obligations</li>
			</ul>

			<h2>4. Legal Basis (KVKK Art. 5/2)</h2>
			<ul>
				<li>Performance of a contract (subscription, site publishing)</li>
				<li>Legal obligation (invoicing, log retention)</li>
				<li>Legitimate interest (security, abuse prevention)</li>
				<li>Explicit consent (beta invitation, marketing — obtained separately)</li>
			</ul>

			<h2>5. Data Retention</h2>
			<ul>
				<li>
					Account and site data: for as long as the account is active + 30 days after a deletion
					request
				</li>
				<li>Contact-form messages: until the site owner deletes them</li>
				<li>Logs: 90 days</li>
				<li>Backups: 14-day rolling window (deleted data survives in backups for a while)</li>
			</ul>

			<h2>6. Sharing With Third Parties</h2>
			<ul>
				<li>
					<strong>AI providers:</strong> your site description and chat messages are sent to DeepSeek/Anthropic
					for processing (KVKK/GDPR-compliant transfer)
				</li>
				<li>
					<strong>Creem:</strong> handles checkout, tax/invoicing, and payment processing as Merchant
					of Record/payment facilitator for subscriptions and digital-product payments. Card data is never
					stored on saaskaya servers.
				</li>
				<li>
					<strong>Stripe:</strong> may be used for payment processing in legacy/transition flows where
					Stripe is the active payment provider. Card data is never stored on saaskaya servers.
				</li>
				<li><strong>Cloudflare R2:</strong> images you upload</li>
				<li><strong>Resend/SMTP:</strong> transactional email (magic link, notifications)</li>
				<li>
					<strong>Domain registrars (Porkbun/NameSilo):</strong> WHOIS data for domain registration
				</li>
			</ul>
			<p>
				Your data is only processed for the purposes listed here; it is not sold to third parties
				for marketing purposes.
			</p>

			<h2>7. Your Rights (KVKK Art. 11)</h2>
			<ul>
				<li>Learn whether your data is being processed</li>
				<li>Request information about it if it is</li>
				<li>Learn the purpose of processing and whether it's used accordingly</li>
				<li>Request correction of incomplete/incorrect data</li>
				<li>Request deletion or destruction</li>
				<li>Request that third parties it was shared with are informed</li>
				<li>Object to a result produced solely by automated analysis that is to your detriment</li>
			</ul>
			<p>
				To exercise these rights, email <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a
				>. Requests are answered within 30 days.
			</p>

			<h2>8. Cookies</h2>
			<ul>
				<li><strong>Session cookie (sk_session):</strong> keeps you signed in, 7 days</li>
				<li>Analytics cookies: none currently (separate consent will be obtained if added)</li>
				<li>Marketing cookies: none</li>
			</ul>

			<h2>9. Data Security</h2>
			<ul>
				<li>Data is stored in a SQLite database on the operator's root-only server</li>
				<li>HTTPS/TLS is enforced (HTTP auto-redirects)</li>
				<li>API keys are stored in plaintext in the DB, but the server is physically protected</li>
				<li>Nightly backups are taken; an off-site copy is optional</li>
			</ul>

			<h2>10. Children</h2>
			<p>
				saaskaya is not directed at people under 18. We do not knowingly process children's data.
			</p>

			<h2>11. Changes</h2>
			<p>
				This policy may be updated. Significant changes are announced by email. Continued use means
				acceptance of the updated policy.
			</p>

			<h2>12. Contact</h2>
			<p>
				Questions and requests: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			</p>

			<p class="sk-callout">
				<strong>Legal review:</strong> this text is an operational draft. Professional legal/accounting
				sign-off for Germany, Turkey, and target sales countries should be obtained before the paid public
				launch.
			</p>
		{:else if locale === 'de'}
			<p class="sk-callout">
				<strong>Beta-Hinweis:</strong> saaskaya befindet sich derzeit in der geschlossenen Beta. Diese
				Richtlinie gilt für Beta-Teilnehmer und kann vor dem kostenpflichtigen öffentlichen Start aktualisiert
				werden.
			</p>

			<h2>1. Wer verarbeitet deine Daten</h2>
			<p>
				saaskaya („wir", „die Plattform") ist eine KI-gestützte Website-Plattform. Diese
				Datenschutzerklärung gilt für die unter saaskaya.com betriebene Plattform selbst — nicht für
				die von unseren Kund:innen veröffentlichten Websites. Die Datenschutzerklärungen der
				Kunden-Websites liegen in der Verantwortung der jeweiligen Website-Inhaber:innen.
			</p>

			<h2>2. Verarbeitete personenbezogene Daten</h2>
			<h3>Kontodaten</h3>
			<ul>
				<li>E-Mail-Adresse (für Anmeldung und Kontakt)</li>
				<li>Abo-Status (Pro/Premium, Ende der Abrechnungsperiode)</li>
				<li>Kunden-ID des Zahlungsanbieters (Kartendaten werden bei uns nicht gespeichert)</li>
				<li>Website-Schlüssel und Eigentumsverhältnis</li>
			</ul>
			<h3>Website-Inhalte</h3>
			<ul>
				<li>Die berufliche Beschreibung und Chat-Nachrichten, die du der KI gibst</li>
				<li>Generierte Website-Inhalte (Text, Bildreferenzen, Theme)</li>
				<li>Nachrichten aus deinem Kontaktformular (auf deiner eigenen Website erfasst)</li>
			</ul>
			<h3>Technische Daten</h3>
			<ul>
				<li>IP-Adresse (zur Missbrauchsprävention und Ratenbegrenzung)</li>
				<li>Browsertyp, Sitzungscookie</li>
				<li>Systemprotokolle (Fehlerbehebung, Sicherheitsereignisse)</li>
			</ul>

			<h2>3. Zwecke der Verarbeitung</h2>
			<ul>
				<li>Kontoerstellung und Authentifizierung (Magic-Link)</li>
				<li>KI-Website-Generierung und Chat-Bearbeitung</li>
				<li>Abo- und Zahlungsverwaltung</li>
				<li>Domain-Registrierung und -Konfiguration</li>
				<li>Sicherheit, Missbrauchsprävention und rechtliche Verpflichtungen</li>
			</ul>

			<h2>4. Rechtsgrundlage (KVKK Art. 5/2)</h2>
			<ul>
				<li>Vertragserfüllung (Abo, Website-Veröffentlichung)</li>
				<li>Rechtliche Verpflichtung (Rechnungsstellung, Protokollspeicherung)</li>
				<li>Berechtigtes Interesse (Sicherheit, Missbrauchsprävention)</li>
				<li>Ausdrückliche Einwilligung (Beta-Einladung, Marketing — separat eingeholt)</li>
			</ul>

			<h2>5. Speicherdauer</h2>
			<ul>
				<li>
					Konto- und Website-Daten: solange das Konto aktiv ist + 30 Tage nach einer Löschanfrage
				</li>
				<li>Kontaktformular-Nachrichten: bis der Website-Inhaber sie löscht</li>
				<li>Protokolle: 90 Tage</li>
				<li>
					Backups: rollierendes 14-Tage-Fenster (gelöschte Daten bleiben eine Zeit lang in Backups
					erhalten)
				</li>
			</ul>

			<h2>6. Weitergabe an Dritte</h2>
			<ul>
				<li>
					<strong>KI-Anbieter:</strong> Deine Website-Beschreibung und Chat-Nachrichten werden zur Verarbeitung
					an DeepSeek/Anthropic gesendet (KVKK-/DSGVO-konforme Übermittlung)
				</li>
				<li>
					<strong>Creem:</strong> übernimmt als Merchant of Record/Zahlungsdienstleister für Abos und
					Zahlungen digitaler Produkte Checkout, Steuer/Rechnungsstellung und Zahlungsabwicklung. Kartendaten
					werden nie auf saaskaya-Servern gespeichert.
				</li>
				<li>
					<strong>Stripe:</strong> kann in älteren/Übergangs-Abläufen zur Zahlungsabwicklung verwendet
					werden, wenn Stripe der aktive Zahlungsanbieter ist. Kartendaten werden nie auf saaskaya-Servern
					gespeichert.
				</li>
				<li><strong>Cloudflare R2:</strong> von dir hochgeladene Bilder</li>
				<li>
					<strong>Resend/SMTP:</strong> transaktionale E-Mails (Magic-Link, Benachrichtigungen)
				</li>
				<li>
					<strong>Domain-Registrare (Porkbun/NameSilo):</strong> WHOIS-Daten für die Domain-Registrierung
				</li>
			</ul>
			<p>
				Deine Daten werden ausschließlich für die hier genannten Zwecke verarbeitet; sie werden
				nicht zu Marketingzwecken an Dritte verkauft.
			</p>

			<h2>7. Deine Rechte (KVKK Art. 11)</h2>
			<ul>
				<li>Erfahren, ob deine Daten verarbeitet werden</li>
				<li>Falls ja, Auskunft darüber verlangen</li>
				<li>Den Verarbeitungszweck erfahren und ob er zweckgemäß eingehalten wird</li>
				<li>Berichtigung unvollständiger/fehlerhafter Daten verlangen</li>
				<li>Löschung oder Vernichtung verlangen</li>
				<li>Verlangen, dass Dritte, an die deine Daten weitergegeben wurden, informiert werden</li>
				<li>
					Einer für dich nachteiligen Entscheidung widersprechen, die ausschließlich auf
					automatisierter Analyse beruht
				</li>
			</ul>
			<p>
				Zur Ausübung dieser Rechte schreibe an <a href="mailto:destek@saaskaya.com"
					>destek@saaskaya.com</a
				>. Anfragen werden innerhalb von 30 Tagen beantwortet.
			</p>

			<h2>8. Cookies</h2>
			<ul>
				<li><strong>Sitzungscookie (sk_session):</strong> hält dich angemeldet, 7 Tage</li>
				<li>
					Analyse-Cookies: derzeit keine (bei Einführung wird eine separate Einwilligung eingeholt)
				</li>
				<li>Marketing-Cookies: keine</li>
			</ul>

			<h2>9. Datensicherheit</h2>
			<ul>
				<li>
					Daten werden in einer SQLite-Datenbank auf dem Root-only-Server des Betreibers gespeichert
				</li>
				<li>HTTPS/TLS ist verpflichtend (automatische Weiterleitung von HTTP)</li>
				<li>
					API-Schlüssel liegen im Klartext in der Datenbank, der Server ist jedoch physisch
					geschützt
				</li>
				<li>Es werden nächtliche Backups erstellt; eine externe Kopie ist optional</li>
			</ul>

			<h2>10. Kinder</h2>
			<p>
				saaskaya richtet sich nicht an Personen unter 18 Jahren. Wir verarbeiten wissentlich keine
				Daten von Kindern.
			</p>

			<h2>11. Änderungen</h2>
			<p>
				Diese Richtlinie kann aktualisiert werden. Wesentliche Änderungen werden per E-Mail
				mitgeteilt. Die fortgesetzte Nutzung gilt als Zustimmung zur aktualisierten Richtlinie.
			</p>

			<h2>12. Kontakt</h2>
			<p>
				Fragen und Anfragen: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			</p>

			<p class="sk-callout">
				<strong>Rechtliche Prüfung:</strong> Dieser Text ist ein operativer Entwurf. Vor dem kostenpflichtigen
				öffentlichen Start sollte eine professionelle rechtliche/steuerliche Prüfung für Deutschland,
				die Türkei und weitere Zielverkaufsländer eingeholt werden.
			</p>
		{:else}
			<p class="sk-callout">
				<strong>Beta dönemi uyarısı:</strong> saaskaya şu anda kapalı beta dönemindedir. Bu politika,
				beta katılımcıları için geçerlidir ve ücretli genel lansman öncesi güncellenebilir.
			</p>

			<h2>1. Kim Tarafından İşleniyor</h2>
			<p>
				saaskaya ("biz", "platform") bir AI destekli web sitesi platformudur. Bu gizlilik
				politikası, saaskaya.com adresinde yürütülen platformun kendisi için geçerlidir —
				müşterilerimizin yayınladığı siteler için değil. Müşteri sitelerinin gizlilik politikaları
				site sahibine aittir.
			</p>

			<h2>2. İşlenen Kişisel Veriler</h2>
			<h3>Hesap verileri</h3>
			<ul>
				<li>E-posta adresi (giriş ve iletişim için)</li>
				<li>Abonelik durumu (Pro/Premium, ödeme dönemi sonu)</li>
				<li>Ödeme sağlayıcısı müşteri kimliği (kart bilgileri bizde saklanmaz)</li>
				<li>Site anahtarları ve sahiplik ilişkisi</li>
			</ul>
			<h3>Site içeriği</h3>
			<ul>
				<li>AI'a verdiğiniz mesleki açıklama ve sohbet mesajları</li>
				<li>Üretilen site içeriği (metin, görsel referansları, tema)</li>
				<li>İletişim formundan gelen mesajlar (müşteri sitenizde toplanır)</li>
			</ul>
			<h3>Teknik veriler</h3>
			<ul>
				<li>IP adresi (kötüye kullanım ve rate-limit için)</li>
				<li>Tarayıcı türü, oturum çerezi</li>
				<li>Sistem logları (hata ayıklama, güvenlik olayları)</li>
			</ul>

			<h2>3. İşleme Amaçları</h2>
			<ul>
				<li>Hesap oluşturma ve kimlik doğrulama (magic link)</li>
				<li>AI site üretimi ve sohbet düzenleme</li>
				<li>Abonelik ve ödeme yönetimi</li>
				<li>Domain tescil ve yapılandırma</li>
				<li>Güvenlik, kötüye kullanım önleme ve yasal yükümlülükler</li>
			</ul>

			<h2>4. Hukuki Dayanak (KVKK md. 5/2)</h2>
			<ul>
				<li>Sözleşmenin ifası (abonelik, site yayını)</li>
				<li>Yasal yükümlülük (fatura, log saklama)</li>
				<li>Meşru menfaat (güvenlik, kötüye kullanım önleme)</li>
				<li>Açık rıza (beta daveti, pazarlama — ayrı onay alınır)</li>
			</ul>

			<h2>5. Veri Saklama</h2>
			<ul>
				<li>Hesap ve site verileri: hesap aktif olduğu sürece + silme talebinden sonra 30 gün</li>
				<li>İletişim formu mesajları: site sahibi silene kadar</li>
				<li>Loglar: 90 gün</li>
				<li>Yedekler: 14 günlük rolling pencere (silinen veriler yedeklerden zamanla yaşar)</li>
			</ul>

			<h2>6. Üçüncü Taraflarla Paylaşım</h2>
			<ul>
				<li>
					<strong>AI sağlayıcılar:</strong> site açıklamanız ve sohbet mesajları DeepSeek/Anthropic'e
					işlenmek üzere gönderilir (KVKK/GDPR uyumlu aktarım)
				</li>
				<li>
					<strong>Creem:</strong> abonelik ve dijital ürün ödemelerinde Merchant of Record/ödeme satıcısı
					olarak checkout, vergi/fatura ve ödeme işleme süreçlerini yürütür. Kart verileri saaskaya sunucularında
					saklanmaz.
				</li>
				<li>
					<strong>Stripe:</strong> Stripe'ın aktif ödeme sağlayıcısı olduğu geçmiş/geçiş akışlarında ödeme
					işleme için kullanılabilir. Kart verileri saaskaya sunucularında saklanmaz.
				</li>
				<li><strong>Cloudflare R2:</strong> yüklediğiniz görseller</li>
				<li><strong>Resend/SMTP:</strong> transactional e-posta (magic link, bildirimler)</li>
				<li>
					<strong>Domain kayıtçıları (Porkbun/NameSilo):</strong> domain tescil için WHOIS verisi
				</li>
			</ul>
			<p>
				Verileriniz yalnızca bu listelenen amaçlar için işlenir; pazarlama amacıyla üçüncü taraflara
				satılmaz.
			</p>

			<h2>7. Haklarınız (KVKK md. 11)</h2>
			<ul>
				<li>İşlenip işlenmediğini öğrenme</li>
				<li>İşlenmişse buna ilişkin bilgi talep etme</li>
				<li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
				<li>Eksik/yanlış işlenmişse düzeltilmesini isteme</li>
				<li>Silinmesini veya yok edilmesini isteme</li>
				<li>Aktarıldığı üçüncü kişilerin bilgilendirilmesini isteme</li>
				<li>
					İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle
					aleyhinize bir sonucun ortaya çıkmasına itiraz etme
				</li>
			</ul>
			<p>
				Bu hakları kullanmak için <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
				adresine yazın. Başvurularınız 30 gün içinde yanıtlanır.
			</p>

			<h2>8. Çerezler</h2>
			<ul>
				<li><strong>Oturum çerezi (sk_session):</strong> giriş yapmış kalmanız için, 7 gün</li>
				<li>Analitik çerezler: şu an yok (eklenirse ayrı onay alınır)</li>
				<li>Pazarlama çerezleri: yok</li>
			</ul>

			<h2>9. Veri Güvenliği</h2>
			<ul>
				<li>Veriler SQLite veritabanında, operatörün root-only sunucusunda saklanır</li>
				<li>HTTPS/TLS zorunludur (HTTP otomatik yönlendirme)</li>
				<li>API anahtarları DB'de plaintext ama sunucu fiziksel korumalı</li>
				<li>Gecelik yedekler alınır, off-site kopya opsiyonel</li>
			</ul>

			<h2>10. Çocuklar</h2>
			<p>saaskaya 18 yaş altı kişilere yönelik değildir. Bilerek çocuk verisi işlenmez.</p>

			<h2>11. Değişiklikler</h2>
			<p>
				Bu politika güncellenebilir. Önemli değişiklikler e-posta ile bildirilir. Devam eden
				kullanım, güncellenmiş politikayı kabul etmek anlamına gelir.
			</p>

			<h2>12. İletişim</h2>
			<p>
				Soru ve başvurular: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			</p>

			<p class="sk-callout">
				<strong>Hukuki gözden geçirme:</strong> Bu metin operasyonel taslaktır. Ücretli genel lansman
				öncesinde Almanya, Türkiye ve hedef satış ülkeleri için profesyonel hukuki/muhasebe onayı alınmalıdır.
			</p>
		{/if}
	{/if}
</LegalShell>
