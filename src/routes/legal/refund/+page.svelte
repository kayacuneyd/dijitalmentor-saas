<script lang="ts">
	import LegalShell from '$lib/ui/LegalShell.svelte';
</script>

<LegalShell title="İptal, İade ve Cayma">
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
			İptal, Stripe üzerinden veya <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
			adresine yazarak yapılır
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
			<strong>İnsan incelemesi (Premium):</strong> hizmet başlamadıysa tam iade; başladıysa başlayan kısmın
			oranı kesilir.
		</li>
	</ul>

	<h2>3. İade Prosedürü</h2>
	<ul>
		<li>İade talebi <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>'a yazılır</li>
		<li>İade, orijinal ödeme yöntemine (Stripe → kart, banka havalesi → IBAN) yapılır</li>
		<li>İade süresi: Stripe 5–10 iş günü, banka havalesi 1–3 iş günü</li>
		<li>İade tutarı, ödeme yapılan tutardır (kısmi kullanım kesintisi 14 gün cayma içinde yok)</li>
	</ul>

	<h2>4. İade Verilmeyen Durumlar</h2>
	<ul>
		<li>Domain tescil ücreti (geri alınamaz ICANN maliyeti)</li>
		<li>
			14 gün cayma süresi geçmiş abonelik (ödeme dönemi sonuna kadar kullanım hakkı devam eder, ama
			geri iade yok)
		</li>
		<li>İnsan incelemesi hizmeti başlamışsa (orantılı kesinti)</li>
		<li>Kabul edilebilir kullanım ihlali nedeniyle fesih</li>
		<li>Yanıltıcı bilgiyle hesap açma</li>
	</ul>

	<h2>5. Başarısız Ödeme</h2>
	<p>Ödeme başarısız olursa (kart reddi, yetersiz bakiye):</p>
	<ul>
		<li>Stripe 3 gün boyunca 4 kez yeniden dener</li>
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
</LegalShell>
