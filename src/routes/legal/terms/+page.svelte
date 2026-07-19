<script lang="ts">
	import { page } from '$app/state';
	import LegalShell from '$lib/ui/LegalShell.svelte';
	import ManagedDocument from '$lib/ui/ManagedDocument.svelte';
	import type { Locale } from '$lib/i18n';

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? 'tr');

	const titles: Record<Locale, string> = {
		tr: 'Kullanım Şartları',
		en: 'Terms of Service',
		de: 'Nutzungsbedingungen'
	};
	const title = $derived(String(page.data.publicCopy?.terms?.title ?? titles[locale]));
	const managedBody = $derived(String(page.data.publicCopy?.terms?.body ?? '').trim());
</script>

<LegalShell {title}>
	{#if managedBody}<ManagedDocument text={managedBody} />{:else}
		{#if locale === 'en'}
			<p class="sk-callout">
				<strong>Beta notice:</strong> saaskaya is currently in closed beta. These terms are for beta participants
				and may be updated before the paid public launch.
			</p>

			<h2>1. Parties</h2>
			<p>
				These terms ("Terms") are the agreement between the operator of the saaskaya platform and
				the user who creates an account on the platform ("You", "User"). Creating an account means
				you accept these Terms.
			</p>

			<h2>2. Nature of the Service</h2>
			<p>
				saaskaya is an AI-assisted website creation and publishing platform. The service includes:
			</p>
			<ul>
				<li>AI-generated site content from your text description</li>
				<li>Site editing through chat</li>
				<li>Direct text/theme/media editing</li>
				<li>Publishing on a subdomain or a custom domain</li>
				<li>Contact-form and message management</li>
				<li>Full data export on Pro sites</li>
			</ul>
			<p>
				saaskaya is <strong>not a general-purpose website builder or app development tool.</strong>
				The service is niche-focused for professional practices (psychologists in particular).
			</p>

			<h2>3. Account</h2>
			<ul>
				<li>An account is created after email verification via a magic link</li>
				<li>You must provide a real, current email address</li>
				<li>You are responsible for account security; report unauthorized access immediately</li>
				<li>During the closed beta, only invited email addresses may create an account</li>
				<li>An account can hold multiple sites; the Pro subscription applies per site</li>
			</ul>

			<h2>4. Plans and Limits</h2>
			<p>
				Plan limits (AI credits, pages, media, languages, domains) are listed on the
				<a href="/pricing">pricing page</a> and may be updated by the operator. Limits are enforced server-side.
				Exceeding a limit may require a plan upgrade or purchasing additional credits.
			</p>

			<h2>5. Payment</h2>
			<ul>
				<li>
					The primary payment provider for Pro/Premium subscriptions is Creem. Where applicable,
					Creem acts as Merchant of Record/payment facilitator for checkout, tax/invoicing, and
					payment processing.
				</li>
				<li>
					Stripe may be used as a transition/fallback provider or for legacy payment records. The
					active checkout screen shows which payment provider is in use.
				</li>
				<li>Domain purchases can be made via the payment provider or bank transfer</li>
				<li>Domain registration only happens after payment is confirmed (non-refundable)</li>
				<li>Paid features remain active until the end of the current billing period</li>
				<li>
					Refund and withdrawal terms are on the <a href="/legal/refund"
						>Cancellation and Refunds page</a
					>
				</li>
			</ul>

			<h2>6. Your Responsibilities</h2>
			<ul>
				<li>You are responsible for the accuracy and legal compliance of your site content</li>
				<li>
					The <a href="/legal/disclaimer">professional disclaimer</a> applies to professional content
				</li>
				<li>Do not publish unlawful, defamatory, infringing, or misleading content</li>
				<li>Compliance with health/legal advertising regulations is your responsibility</li>
				<li>You are advised to review AI output before publishing</li>
				<li>Do not sell or transfer your account to someone else</li>
			</ul>

			<h2>7. Acceptable Use</h2>
			<p>
				Details are on the <a href="/legal/acceptable-use">Acceptable Use page</a>. In short: abuse,
				spam, scraping, reverse engineering, and exploiting AI credits are prohibited.
			</p>

			<h2>8. AI Generation and Safety</h2>
			<ul>
				<li>The AI never writes HTML/CSS/JS; it only produces validated structured data</li>
				<li>Every AI output is validated against a Zod schema; invalid output is never rendered</li>
				<li>AI output is a draft, not advice; you approve it before publishing</li>
				<li>The service may become temporarily unavailable during an AI provider outage</li>
			</ul>

			<h2>9. Domains</h2>
			<ul>
				<li>A domain belongs to you after registration (per ICANN rules)</li>
				<li>
					On monthly Pro, a managed .com domain service may be offered for an additional yearly fee
				</li>
				<li>
					On yearly Pro, one standard .com domain is included as long as the yearly plan stays
					active
				</li>
				<li>Premium domains, non-.com extensions, and additional domains are handled separately</li>
				<li>
					Email service is forwarding, not a mailbox — e.g. messages to info@domain.com can be
					forwarded to your verified existing email address
				</li>
				<li>
					On subscription cancellation, the domain stays active for a 30-day grace period, then is
					detached
				</li>
				<li>Domain transfer-out is always possible (through the registrar)</li>
			</ul>

			<h2>10. Data and Ownership</h2>
			<ul>
				<li>You own your site content</li>
				<li>You can export your data at any time (dashboard → Export)</li>
				<li>
					On an account deletion request, your data is removed within 30 days (survives in backups
					for a while)
				</li>
				<li>saaskaya may collect anonymous usage data to improve the platform</li>
			</ul>

			<h2>11. Intellectual Property</h2>
			<ul>
				<li>The saaskaya brand, code, and design belong to the operator</li>
				<li>You own the generated site content</li>
				<li>The "Powered by saaskaya" badge is required on Free/Pro plans</li>
				<li>The badge can be removed on the Premium plan</li>
			</ul>

			<h2>12. Disclaimer of Warranty</h2>
			<p>
				The service is provided "as is". No warranty is given for the accuracy, medical/legal
				validity, or business outcome of AI-generated content. The maximum possible liability for
				outages, errors, or data loss is the amount paid in the last 12 months.
			</p>

			<h2>13. Limitation of Liability</h2>
			<p>
				The operator is not liable for indirect, incidental, consequential, or punitive damages.
				Total liability does not exceed the amount charged to the user in the last 12 months.
			</p>

			<h2>14. Termination</h2>
			<ul>
				<li>You may delete your account at any time</li>
				<li>
					The operator may suspend an account for breach of these Terms, abuse, or legal obligation
				</li>
				<li>
					On termination, your site content is deleted after 30 days (except the domain grace
					period)
				</li>
			</ul>

			<h2>15. Dispute Resolution</h2>
			<p>
				Good-faith negotiation and support channels are used first. Where Creem appears as the
				Merchant of Record on a paid checkout, Creem's own additional terms on payment, chargebacks,
				tax/invoicing, and consumer regulations may also apply during that checkout. Use of the
				saaskaya platform and responsibility for published content is governed by these Terms. The
				final governing law and competent forum will be finalized with legal counsel before the paid
				public launch.
			</p>

			<h2>16. Changes</h2>
			<p>
				These Terms may be updated. Significant changes are announced by email. Continued use means
				acceptance of the updated Terms.
			</p>

			<h2>17. Contact</h2>
			<p>
				<a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			</p>

			<p class="sk-callout">
				<strong>Legal review:</strong> these terms are an operational draft updated for the Creem Merchant
				of Record decision. They should not be treated as "paid public launch approved" without professional
				sign-off on German business/income tax, sales into Turkey, consumer rights, and distance-selling
				rules.
			</p>
		{:else if locale === 'de'}
			<p class="sk-callout">
				<strong>Beta-Hinweis:</strong> saaskaya befindet sich derzeit in der geschlossenen Beta. Diese
				Bedingungen gelten für Beta-Teilnehmer und können vor dem kostenpflichtigen öffentlichen Start
				aktualisiert werden.
			</p>

			<h2>1. Vertragsparteien</h2>
			<p>
				Diese Bedingungen ("Bedingungen") sind die Vereinbarung zwischen dem Betreiber der
				saaskaya-Plattform und der Person, die ein Konto auf der Plattform anlegt ("Du", "Nutzer").
				Mit der Kontoerstellung akzeptierst du diese Bedingungen.
			</p>

			<h2>2. Art der Dienstleistung</h2>
			<p>
				saaskaya ist eine KI-gestützte Plattform zur Website-Erstellung und -Veröffentlichung. Der
				Leistungsumfang umfasst:
			</p>
			<ul>
				<li>KI-generierte Website-Inhalte aus deiner Textbeschreibung</li>
				<li>Website-Bearbeitung per Chat</li>
				<li>Direkte Bearbeitung von Text/Theme/Medien</li>
				<li>Veröffentlichung auf einer Subdomain oder eigenen Domain</li>
				<li>Kontaktformular- und Nachrichtenverwaltung</li>
				<li>Vollständiger Datenexport bei Pro-Websites</li>
			</ul>
			<p>
				saaskaya ist <strong>kein allgemeiner Website-Baukasten oder App-Entwicklungstool.</strong>
				Der Dienst ist auf professionelle Praxen spezialisiert (insbesondere Psycholog:innen).
			</p>

			<h2>3. Konto</h2>
			<ul>
				<li>Ein Konto wird nach E-Mail-Verifizierung per Magic-Link erstellt</li>
				<li>Du musst eine echte, aktuelle E-Mail-Adresse angeben</li>
				<li>Du bist für die Kontosicherheit verantwortlich; melde unbefugten Zugriff sofort</li>
				<li>
					Während der geschlossenen Beta können nur eingeladene E-Mail-Adressen ein Konto anlegen
				</li>
				<li>Ein Konto kann mehrere Websites enthalten; das Pro-Abo gilt pro Website</li>
			</ul>

			<h2>4. Tarife und Limits</h2>
			<p>
				Tariflimits (KI-Credits, Seiten, Medien, Sprachen, Domains) sind auf der
				<a href="/pricing">Preisseite</a> aufgeführt und können vom Betreiber aktualisiert werden. Limits
				werden serverseitig durchgesetzt. Bei Überschreitung eines Limits kann ein Tarif-Upgrade oder
				der Kauf zusätzlicher Credits erforderlich sein.
			</p>

			<h2>5. Zahlung</h2>
			<ul>
				<li>
					Der primäre Zahlungsanbieter für Pro-/Premium-Abos ist Creem. Soweit anwendbar, fungiert
					Creem als Merchant of Record/Zahlungsdienstleister für Checkout, Steuer/Rechnungsstellung
					und Zahlungsabwicklung.
				</li>
				<li>
					Stripe kann als Übergangs-/Fallback-Anbieter oder für ältere Zahlungsdatensätze verwendet
					werden. Der aktive Checkout-Bildschirm zeigt an, welcher Zahlungsanbieter verwendet wird.
				</li>
				<li>Domain-Käufe können über den Zahlungsanbieter oder per Banküberweisung erfolgen</li>
				<li>
					Die Domain-Registrierung erfolgt erst nach Zahlungsbestätigung (nicht erstattungsfähig)
				</li>
				<li>
					Kostenpflichtige Funktionen bleiben bis zum Ende der aktuellen Abrechnungsperiode aktiv
				</li>
				<li>
					Erstattungs- und Widerrufsbedingungen findest du auf der <a href="/legal/refund"
						>Seite zu Kündigung und Erstattung</a
					>
				</li>
			</ul>

			<h2>6. Deine Pflichten</h2>
			<ul>
				<li>
					Du bist für die Richtigkeit und Rechtskonformität deiner Website-Inhalte verantwortlich
				</li>
				<li>
					Für professionelle Inhalte gilt der <a href="/legal/disclaimer">Haftungsausschluss</a>
				</li>
				<li>
					Veröffentliche keine rechtswidrigen, verleumderischen, urheberrechtsverletzenden oder
					irreführenden Inhalte
				</li>
				<li>
					Die Einhaltung von Werberegelungen im Gesundheits-/Rechtsbereich liegt in deiner
					Verantwortung
				</li>
				<li>Es wird empfohlen, KI-Ausgaben vor der Veröffentlichung zu prüfen</li>
				<li>Verkaufe oder übertrage dein Konto nicht an Dritte</li>
			</ul>

			<h2>7. Zulässige Nutzung</h2>
			<p>
				Details findest du auf der Seite <a href="/legal/acceptable-use">Zulässige Nutzung</a>. Kurz
				gefasst: Missbrauch, Spam, Scraping, Reverse Engineering und das Ausnutzen von KI-Credits
				sind untersagt.
			</p>

			<h2>8. KI-Generierung und Sicherheit</h2>
			<ul>
				<li>
					Die KI schreibt niemals HTML/CSS/JS; sie erzeugt ausschließlich validierte Strukturdaten
				</li>
				<li>
					Jede KI-Ausgabe wird gegen ein Zod-Schema validiert; ungültige Ausgaben werden nie
					gerendert
				</li>
				<li>
					KI-Ausgaben sind ein Entwurf, keine Beratung; du bestätigst sie vor der Veröffentlichung
				</li>
				<li>Bei Ausfall eines KI-Anbieters kann der Dienst vorübergehend nicht verfügbar sein</li>
			</ul>

			<h2>9. Domains</h2>
			<ul>
				<li>Eine Domain gehört dir nach der Registrierung (gemäß ICANN-Regeln)</li>
				<li>
					Beim monatlichen Pro-Tarif kann ein verwalteter .com-Domain-Service gegen jährlichen
					Aufpreis angeboten werden
				</li>
				<li>
					Beim jährlichen Pro-Tarif ist eine Standard-.com-Domain enthalten, solange der Jahrestarif
					aktiv bleibt
				</li>
				<li>Premium-Domains, Nicht-.com-Endungen und Zweitdomains werden gesondert behandelt</li>
				<li>
					Der E-Mail-Dienst ist eine Weiterleitung, kein Postfach — z. B. können Nachrichten an
					info@domain.com an deine verifizierte bestehende E-Mail-Adresse weitergeleitet werden
				</li>
				<li>
					Bei Abo-Kündigung bleibt die Domain 30 Tage lang in einer Kulanzfrist aktiv und wird
					danach getrennt
				</li>
				<li>Ein Domain-Transfer-out ist jederzeit möglich (über den Registrar)</li>
			</ul>

			<h2>10. Daten und Eigentum</h2>
			<ul>
				<li>Du bist Eigentümer deiner Website-Inhalte</li>
				<li>Du kannst deine Daten jederzeit exportieren (Dashboard → Export)</li>
				<li>
					Bei einer Löschanfrage werden deine Daten innerhalb von 30 Tagen entfernt (bleiben eine
					Zeit lang in Backups erhalten)
				</li>
				<li>saaskaya kann anonyme Nutzungsdaten zur Plattformverbesserung erheben</li>
			</ul>

			<h2>11. Geistiges Eigentum</h2>
			<ul>
				<li>Die Marke, der Code und das Design von saaskaya gehören dem Betreiber</li>
				<li>Die generierten Website-Inhalte gehören dir</li>
				<li>Das „Powered by saaskaya"-Abzeichen ist in den Free-/Pro-Tarifen erforderlich</li>
				<li>Im Premium-Tarif kann das Abzeichen entfernt werden</li>
			</ul>

			<h2>12. Gewährleistungsausschluss</h2>
			<p>
				Der Dienst wird „wie besehen" bereitgestellt. Es wird keine Garantie für die Richtigkeit,
				medizinische/rechtliche Gültigkeit oder das geschäftliche Ergebnis KI-generierter Inhalte
				übernommen. Die maximal mögliche Haftung für Ausfälle, Fehler oder Datenverlust entspricht
				dem in den letzten 12 Monaten gezahlten Betrag.
			</p>

			<h2>13. Haftungsbeschränkung</h2>
			<p>
				Der Betreiber haftet nicht für indirekte, beiläufige, Folge- oder Strafschäden. Die
				Gesamthaftung übersteigt nicht den vom Nutzer in den letzten 12 Monaten gezahlten Betrag.
			</p>

			<h2>14. Kündigung</h2>
			<ul>
				<li>Du kannst dein Konto jederzeit löschen</li>
				<li>
					Der Betreiber kann ein Konto bei Verstoß gegen diese Bedingungen, Missbrauch oder
					rechtlicher Verpflichtung sperren
				</li>
				<li>
					Bei Kündigung werden deine Website-Inhalte nach 30 Tagen gelöscht (außer der
					Domain-Kulanzfrist)
				</li>
			</ul>

			<h2>15. Streitbeilegung</h2>
			<p>
				Zunächst werden eine Verhandlung nach Treu und Glauben und die Support-Kanäle genutzt.
				Erscheint Creem beim kostenpflichtigen Checkout als Merchant of Record, können während
				dieses Checkouts zusätzlich Creems eigene Bedingungen zu Zahlung, Rückbuchungen,
				Steuer/Rechnungsstellung und Verbraucherrecht gelten. Die Nutzung der saaskaya-Plattform und
				die Verantwortung für veröffentlichte Inhalte unterliegen diesen Bedingungen. Das letztlich
				anwendbare Recht und der zuständige Gerichtsstand werden vor dem kostenpflichtigen
				öffentlichen Start mit anwaltlicher Beratung festgelegt.
			</p>

			<h2>16. Änderungen</h2>
			<p>
				Diese Bedingungen können aktualisiert werden. Wesentliche Änderungen werden per E-Mail
				mitgeteilt. Die fortgesetzte Nutzung gilt als Zustimmung zu den aktualisierten Bedingungen.
			</p>

			<h2>17. Kontakt</h2>
			<p>
				<a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			</p>

			<p class="sk-callout">
				<strong>Rechtliche Prüfung:</strong> Diese Bedingungen sind ein operativer Entwurf, der an die
				Creem-Merchant-of-Record-Entscheidung angepasst wurde. Sie sollten nicht als „für den kostenpflichtigen
				öffentlichen Start freigegeben" gelten, solange keine professionelle Prüfung zu deutscher Gewerbe-/Einkommensteuer,
				Verkäufen in die Türkei, Verbraucherrechten und Fernabsatzregeln erfolgt ist.
			</p>
		{:else}
			<p class="sk-callout">
				<strong>Beta dönemi uyarısı:</strong> saaskaya kapalı beta dönemindedir. Bu şartlar beta katılımcıları
				içindir; ücretli genel lansman öncesi güncellenebilir.
			</p>

			<h2>1. Taraflar</h2>
			<p>
				Bu şartlar ("Şartlar"), saaskaya platformunu işleten ile platforma hesap açan kullanıcı
				("Siz", "Kullanıcı") arasındaki sözleşmedir. Hesap oluşturduğunuzda bu Şartları kabul etmiş
				sayılırsınız.
			</p>

			<h2>2. Hizmetin Niteliği</h2>
			<p>saaskaya, AI destekli web sitesi oluşturma ve yayınlama platformudur. Hizmet kapsamı:</p>
			<ul>
				<li>Metin açıklamanızdan AI ile site içeriği üretimi</li>
				<li>Sohbet yoluyla site düzenleme</li>
				<li>Doğrudan metin/tema/medya düzenleme</li>
				<li>Alt alan adında veya özel domainde yayınlama</li>
				<li>İletişim formu ve mesaj yönetimi</li>
				<li>Pro sitelerde tam veri dışa aktarma</li>
			</ul>
			<p>
				saaskaya <strong
					>genel amaçlı web sitesi kurucu veya uygulama geliştiricisi değildir.</strong
				>
				Hizmet, profesyonel pratikler için (özellikle psikologlar) niş odaklıdır.
			</p>

			<h2>3. Hesap</h2>
			<ul>
				<li>Hesap, magic link ile e-posta doğrulaması sonrası açılır</li>
				<li>Gerçek ve güncel e-posta adresi vermek zorunludur</li>
				<li>Hesap güvenliğinden siz sorumlusunuz; yetkisiz erişimi derhal bildirin</li>
				<li>Kapalı beta döneminde yalnızca davet edilen e-postalar hesap açabilir</li>
				<li>Hesap birden fazla site barındırabilir; Pro abonelik site başına uygulanır</li>
			</ul>

			<h2>4. Planlar ve Limitler</h2>
			<p>
				Plan limitleri (AI kredileri, sayfa, medya, dil, domain) <a href="/pricing"
					>fiyatlandırma sayfasında</a
				> listelenir ve operatör tarafından güncellenebilir. Limitler sunucu tarafında uygulanır. Limit
				aşımı durumunda plan yükseltme veya ek kredi satın alma gerekebilir.
			</p>

			<h2>5. Ödeme</h2>
			<ul>
				<li>
					Pro/Premium aboneliklerde birincil ödeme sağlayıcısı Creem'dir. Creem, uygun olduğu ölçüde
					Merchant of Record/ödeme satıcısı olarak checkout, vergi/fatura ve ödeme işleme
					süreçlerini yürütür.
				</li>
				<li>
					Stripe, geçiş/fallback sağlayıcısı olarak veya eski ödeme kayıtları için kullanılabilir.
					Aktif checkout ekranında hangi ödeme sağlayıcısının kullanıldığı görünür.
				</li>
				<li>Domain satın alımı ödeme sağlayıcısı veya banka havalesi ile yapılabilir</li>
				<li>Domain tescili yalnızca ödeme onayından sonra yapılır (geri alınamaz)</li>
				<li>Ödeme dönemi sonuna kadar ücretli özellikler aktif kalır</li>
				<li>İade ve cayma koşulları <a href="/legal/refund">İptal ve İade sayfasında</a></li>
			</ul>

			<h2>6. Sorumluluklarınız</h2>
			<ul>
				<li>Site içeriğinizin doğruluğundan ve yasal uyumluluğundan siz sorumlusunuz</li>
				<li>Profesyonel içerik için <a href="/legal/disclaimer">sorumluluk reddi</a> geçerlidir</li>
				<li>Yasalara aykırı, hakaret, telif ihlali, yanıltıcı içerik yayınlamayın</li>
				<li>Sağlık/hukuk reklam yönetmeliklerine uyum sizin sorumluluğunuzda</li>
				<li>AI çıktısını yayınlamadan önce gözden geçirmeniz önerilir</li>
				<li>Hesabınızı başkasına satmayın/devretmeyin</li>
			</ul>

			<h2>7. Kabul Edilebilir Kullanım</h2>
			<p>
				Detaylar <a href="/legal/acceptable-use">Kabul Edilebilir Kullanım sayfasında</a>. Özetle:
				kötüye kullanım, spam, scraping, tersine mühendislik, AI kredilerini sömürme yasaktır.
			</p>

			<h2>8. AI Üretimi ve Güvenlik</h2>
			<ul>
				<li>AI, HTML/CSS/JS yazmaz; yalnızca doğrulanmış yapısal veri üretir</li>
				<li>Her AI çıktısı Zod şeması ile doğrulanır; geçersiz çıktı asla render edilmez</li>
				<li>AI çıktısı bir tavsiye değil, taslaktır; yayınlamadan önce siz onaylarsınız</li>
				<li>AI sağlayıcı kesintisinde hizmet geçici olarak kullanılamayabilir</li>
			</ul>

			<h2>9. Domain</h2>
			<ul>
				<li>Domain, tescil sonrası size aittir (ICANN kuralları)</li>
				<li>Aylık Pro’da yönetilen .com alan adı hizmeti yıllık ek ücretle sunulabilir</li>
				<li>Yıllık Pro’da bir standart .com alan adı, yıllık plan aktif kaldığı sürece dahildir</li>
				<li>Premium domainler, .com dışı uzantılar ve ikinci domainler ayrı değerlendirilir</li>
				<li>
					E-posta hizmeti posta kutusu değil yönlendirme hizmetidir; örn. info@domain.com adresine
					gelen mesajlar doğrulanmış mevcut e-posta adresinize yönlendirilebilir
				</li>
				<li>Abonelik iptalinde domain 30 gün grace dönemi boyunca aktif kalır, sonra ayrılır</li>
				<li>Domain transfer-out her zaman mümkündür (kayıtçı üzerinden)</li>
			</ul>

			<h2>10. Veri ve Sahiplik</h2>
			<ul>
				<li>Site içeriğinin sahibi sizsiniz</li>
				<li>Verinizi istediğiniz zaman dışa aktarabilirsiniz (dashboard → Export)</li>
				<li>Hesap silme talebinde verileriniz 30 gün içinde kaldırılır (yedeklerden yaşar)</li>
				<li>saaskaya, platformu geliştirmek için anonim kullanım verileri toplayabilir</li>
			</ul>

			<h2>11. Fikri Mülkiyet</h2>
			<ul>
				<li>saaskaya markası, kodu, tasarımı operatöre aittir</li>
				<li>Üretilen site içeriği size aittir</li>
				<li>Free/Pro planlarında "Powered by saaskaya" rozeti zorunludur</li>
				<li>Premium planında rozet kaldırılabilir</li>
			</ul>

			<h2>12. Garanti Reddi</h2>
			<p>
				Hizmet "olduğu gibi" sunulur. AI üretiminin doğruluğu, tıbbi/hukuki geçerliliği veya iş
				sonucu garantisi verilmez. Kesintiler, hatalar veya veri kaybı için mümkün olan azami
				sorumluluk son 12 ayda ödenen tutardır.
			</p>

			<h2>13. Sorumluluğun Sınırlandırılması</h2>
			<p>
				Operatör, dolaylı, arızi, sonuçsal veya cezai zararlardan sorumlu değildir. Toplam
				sorumluluk, son 12 ayda kullanıcıdan alınan tutarı aşamaz.
			</p>

			<h2>14. Fesih</h2>
			<ul>
				<li>Hesabınızı istediğiniz zaman silebilirsiniz</li>
				<li>
					Operatör, Şart ihlali, kötüye kullanım veya yasal yükümlülük durumunda hesabı askıya
					alabilir
				</li>
				<li>Fesihde site içeriğiniz 30 gün sonra silinir (domain grace hariç)</li>
			</ul>

			<h2>15. Uyuşmazlık Çözümü</h2>
			<p>
				Önce iyi niyetli müzakere ve destek kanalları kullanılır. Ücretli checkout'ta Creem Merchant
				of Record olarak görünüyorsa, ödeme, chargeback, vergi/fatura ve tüketici mevzuatı
				konularında Creem'in checkout sırasında sunduğu ek şartlar da uygulanabilir. saaskaya
				platform kullanımı ve yayınlanan içerik sorumlulukları bu Şartlara tabidir. Nihai
				uygulanacak hukuk ve yetkili merci, ücretli genel lansman öncesi hukuki danışmanla
				kesinleştirilecektir.
			</p>

			<h2>16. Değişiklikler</h2>
			<p>
				Şartlar güncellenebilir. Önemli değişiklikler e-posta ile bildirilir. Devam eden kullanım,
				güncellenmiş şartları kabul etmek anlamına gelir.
			</p>

			<h2>17. İletişim</h2>
			<p>
				<a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			</p>

			<p class="sk-callout">
				<strong>Hukuki gözden geçirme:</strong> Bu şartlar Creem Merchant of Record kararına göre güncellenmiş
				operasyonel taslaktır. Almanya'da işletme/gelir vergisi, Türkiye'ye satış, tüketici hakları ve
				mesafeli satış kuralları için profesyonel onay alınmadan "paid public launch approved" kabul edilmemelidir.
			</p>
		{/if}
	{/if}
</LegalShell>
