<script lang="ts">
	import { page } from '$app/state';
	import type { Locale } from '$lib/i18n';
	import LegalShell from '$lib/ui/LegalShell.svelte';

	const locale: Locale = $derived((page.data.locale as Locale | undefined) ?? 'tr');
	const titles: Record<Locale, string> = {
		en: 'Cancellation, Refunds and Withdrawal',
		tr: 'İptal, İade ve Cayma',
		de: 'Kündigung, Erstattung und Widerruf'
	};
</script>

<LegalShell title={titles[locale]}>
	{#if locale === 'en'}
		<p class="sk-callout">
			<strong>Relationship:</strong> This document supplements the <a href="/legal/terms">Terms</a> and
			the applicable operational policy.
		</p>
		<h2>1. Cancellation</h2>
		<p>
			You may cancel a Pro or Premium subscription at any time. Paid features remain available until
			the end of the current billing period; cancellation does not cause immediate loss of access.
		</p>
		<ul>
			<li>
				Cancel through the active payment provider's customer flow or by contacting <a
					href="mailto:destek@saaskaya.com">destek@saaskaya.com</a
				>.
			</li>
			<li>
				After cancellation, a 30-day grace period begins; a custom domain is then detached while
				subdomain publishing continues.
			</li>
			<li>Site content is retained and a domain can be reconnected after resubscription.</li>
		</ul>
		<h2>2. Withdrawal and refunds</h2>
		<p>
			Where consumer withdrawal rights apply, a Pro/Premium subscription may be withdrawn from
			within 14 days of the first payment by written request to support. Domains are generally
			non-refundable once registered because registration cannot be reversed. Premium human review
			is refundable in full before work begins and otherwise may be reduced proportionally.
		</p>
		<h2>3. Refund process</h2>
		<p>
			Send a request to support. Card and subscription refunds are processed by Creem as Merchant of
			Record or the active payment provider to the original payment method; bank-transfer refunds
			are sent to the provided account. Timing depends on the provider and bank.
		</p>
		<h2>4. No-refund cases</h2>
		<p>
			Refunds are not available for irreversible domain registration costs, subscriptions outside
			the applicable withdrawal period, work already started where a proportional charge applies,
			termination for acceptable-use violations, or accounts created with misleading information.
		</p>
		<h2>5. Failed payments and account deletion</h2>
		<p>
			The active provider's retry rules apply to failed payments. After the grace period, the domain
			may be detached while the site remains on its subdomain. Account deletion may be requested
			from support; data is removed within 30 days subject to backup retention, and domains remain
			transferable through the registrar.
		</p>
		<h2>6. Data export and contact</h2>
		<p>
			Export site data and messages before cancellation where needed. For cancellation or refund
			requests contact <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>.
		</p>
	{:else if locale === 'de'}
		<p class="sk-callout">
			<strong>Bezug:</strong> Dieses Dokument ergänzt die <a href="/legal/terms">Bedingungen</a> und die
			geltende Betriebsrichtlinie.
		</p>
		<h2>1. Kündigung</h2>
		<p>
			Du kannst ein Pro- oder Premium-Abo jederzeit kündigen. Kostenpflichtige Funktionen bleiben
			bis zum Ende des aktuellen Abrechnungszeitraums verfügbar; die Kündigung führt nicht zum
			sofortigen Zugriffsverlust.
		</p>
		<ul>
			<li>
				Kündige über den Kundenbereich des aktiven Zahlungsanbieters oder über <a
					href="mailto:destek@saaskaya.com">destek@saaskaya.com</a
				>.
			</li>
			<li>
				Danach beginnt eine Kulanzfrist von 30 Tagen; anschließend wird eine eigene Domain getrennt,
				während die Subdomain-Veröffentlichung fortgesetzt wird.
			</li>
			<li>
				Website-Inhalte bleiben erhalten und eine Domain kann nach erneuter Buchung wieder verbunden
				werden.
			</li>
		</ul>
		<h2>2. Widerruf und Erstattung</h2>
		<p>
			Soweit Verbraucherschutzrechte gelten, kann ein Pro-/Premium-Abo innerhalb von 14 Tagen nach
			der ersten Zahlung schriftlich über den Support widerrufen werden. Domains sind nach der
			Registrierung grundsätzlich nicht erstattungsfähig, da die Registrierung nicht rückgängig
			gemacht werden kann. Eine Premium-Menschenprüfung ist vor Arbeitsbeginn vollständig
			erstattbar, danach gegebenenfalls anteilig.
		</p>
		<h2>3. Ablauf der Erstattung</h2>
		<p>
			Sende die Anfrage an den Support. Karten- und Abo-Erstattungen erfolgen über Creem als
			Merchant of Record oder den aktiven Zahlungsanbieter auf die ursprüngliche Zahlungsart;
			Überweisungen an das angegebene Konto. Die Dauer hängt von Anbieter und Bank ab.
		</p>
		<h2>4. Fälle ohne Erstattung</h2>
		<p>
			Keine Erstattung erfolgt für irreversible Domainregistrierungen, Abos außerhalb einer
			anwendbaren Widerrufsfrist, bereits begonnene Leistungen mit anteiliger Berechnung,
			Kündigungen wegen Verstößen gegen die zulässige Nutzung oder Konten mit irreführenden Angaben.
		</p>
		<h2>5. Fehlgeschlagene Zahlungen und Kontolöschung</h2>
		<p>
			Bei fehlgeschlagenen Zahlungen gelten die Wiederholungsregeln des aktiven Anbieters. Nach der
			Kulanzfrist kann die Domain getrennt werden, während die Website auf der Subdomain bleibt.
			Eine Kontolöschung kann beim Support beantragt werden; Daten werden vorbehaltlich von Backups
			innerhalb von 30 Tagen entfernt, Domains bleiben über den Registrar übertragbar.
		</p>
		<h2>6. Datenexport und Kontakt</h2>
		<p>
			Exportiere bei Bedarf Website-Daten und Nachrichten vor der Kündigung. Für Kündigungen oder
			Erstattungen: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>.
		</p>
	{:else}
		<p class="sk-callout">
			<strong>Bağlantı:</strong> Bu metin, <a href="/legal/terms">Kullanım Şartları</a> ve
			<a href="/docs/POLICY.md">operasyonel politika</a> ile uyumludur. Mevcut kod
			<code>docs/POLICY.md</code>'de açıklanan grace window + daily sweep modelini uygular.
		</p>

		<h2>1. Abonelik İptali</h2>
		<p>
			Pro/Premium aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal, mevcut ödeme döneminin
			sonuna kadar ücretli özelliklerin aktif kalmasıyla sonuçlanır — anında erişim kaybı yoktur.
		</p>
		<ul>
			<li>
				İptal, aktif ödeme sağlayıcısının müşteri/checkout akışı üzerinden veya
				<a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a> adresine yazarak yapılır
			</li>
			<li>İptal sonrası 30 günlük grace dönemi başlar (özellikler aktif kalır)</li>
			<li>Grace dönemi sonunda özel domain ayrılır; alt alan adı yayını devam eder</li>
			<li>Site içeriği silinmez; yeniden abonelikle domain tekrar bağlanabilir</li>
		</ul>

		<h2>2. Cayma Hakkı (6502 sayılı TKHK)</h2>
		<p>
			Tüketicinin Korunması Hakkında Kanun md. 51 uyarınca, mesafeli sözleşmelerde 14 gün içinde
			koşulsuz cayma hakkı vardır. saaskaya'da:
		</p>
		<ul>
			<li>
				<strong>Pro/Premium abonelik:</strong> ilk ödeme tarihinden itibaren 14 gün içinde koşulsuz
				tam iade. Cayma, <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
				adresine yazılı bildirimle yapılır.
			</li>
			<li>
				<strong>Domain:</strong> Cayma hakkı <strong>uygulanmaz</strong> — domain tescili "özel nitelikli"
				hizmet olup ICANN kuralları gereği geri alınamaz (TKHK md. 51/3 istisnası). Tescil sonrası domain
				iade edilmez.
			</li>
			<li>
				<strong>İnsan incelemesi (Premium):</strong> hizmet başlamadıysa tam iade; başladıysa başlayan
				kısmın oranı kesilir.
			</li>
		</ul>

		<h2>3. İade Prosedürü</h2>
		<ul>
			<li>İade talebi <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>'a yazılır</li>
			<li>
				Kart/abonelik ödemeleri Creem Merchant of Record veya aktif ödeme sağlayıcısı üzerinden
				orijinal ödeme yöntemine iade edilir; banka havalesi iadeleri IBAN'a yapılır
			</li>
			<li>
				İade süresi ödeme sağlayıcısına ve bankaya göre değişir; kart iadelerinde tipik süre birkaç
				iş gününden 10 iş gününe kadar uzayabilir, banka havalesinde hedef süre 1–3 iş günüdür
			</li>
			<li>
				İade tutarı, ödeme yapılan tutardır (kısmi kullanım kesintisi 14 gün cayma içinde yok)
			</li>
		</ul>

		<h2>4. İade Verilmeyen Durumlar</h2>
		<ul>
			<li>Domain tescil ücreti (geri alınamaz ICANN maliyeti)</li>
			<li>
				14 gün cayma süresi geçmiş abonelik (ödeme dönemi sonuna kadar kullanım hakkı devam eder,
				ama geri iade yok)
			</li>
			<li>İnsan incelemesi hizmeti başlamışsa (orantılı kesinti)</li>
			<li>Kabul edilebilir kullanım ihlali nedeniyle fesih</li>
			<li>Yanıltıcı bilgiyle hesap açma</li>
		</ul>

		<h2>5. Başarısız Ödeme</h2>
		<p>Ödeme başarısız olursa (kart reddi, yetersiz bakiye):</p>
		<ul>
			<li>Aktif ödeme sağlayıcısının retry/dunning kuralları uygulanır</li>
			<li>Tüm denemeler başarısız olursa abonelik "past_due" durumuna geçer</li>
			<li>30 gün grace dönemi boyunca özellikler aktif kalır</li>
			<li>Grace sonunda domain ayrılır; site alt alan adında yayında kalır</li>
			<li>Yeniden ödemeyle abonelik ve domain geri bağlanır</li>
		</ul>

		<h2>6. Hesap Silme</h2>
		<ul>
			<li>
				Hesabınızı <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>'a yazarak
				sildirebilirsiniz
			</li>
			<li>Silme talebinden sonra veriler 30 gün içinde kaldırılır</li>
			<li>Yedeklerden tam silinme 14 günlük rolling pencere sonrası</li>
			<li>Domain, hesap silinse bile size aittir (kayıtçı üzerinden transfer-out mümkün)</li>
		</ul>

		<h2>7. Veri Dışa Aktarma</h2>
		<p>
			İptal etmeden önce verilerinizi dışa aktarmanız önerilir. Dashboard → "Export" ile site JSON +
			iletişim mesajları indirilir. Abonelik gerekmez.
		</p>

		<h2>8. İletişim</h2>
		<p>
			İptal ve iade talepleri: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
		</p>

		<p class="sk-callout">
			<strong>Creem notu:</strong> Creem checkout'unda satıcı/Merchant of Record olarak Creem göründüğünde,
			kart iadeleri, chargeback'ler, vergi/fatura düzeltmeleri ve ödeme sağlayıcısı kayıtları Creem süreçlerine
			tabi olabilir. saaskaya destek ekibi, uygulama erişimi ve hizmet kaydını buna göre günceller.
		</p>
	{/if}
</LegalShell>
