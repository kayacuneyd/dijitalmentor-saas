<script lang="ts">
	import LegalShell from '$lib/ui/LegalShell.svelte';
</script>

<LegalShell title="Gizlilik Politikası">
	<p class="sk-callout">
		<strong>Beta dönemi uyarısı:</strong> saaskaya şu anda kapalı beta dönemindedir. Bu politika, beta
		katılımcıları için geçerlidir ve ücretli genel lansman öncesi güncellenebilir.
	</p>

	<h2>1. Kim Tarafından İşleniyor</h2>
	<p>
		saaskaya ("biz", "platform") bir AI destekli web sitesi platformudur. Bu gizlilik politikası,
		saaskaya.com adresinde yürütülen platformun kendisi için geçerlidir — müşterilerimizin
		yayınladığı siteler için değil. Müşteri sitelerinin gizlilik politikaları site sahibine aittir.
	</p>

	<h2>2. İşlenen Kişisel Veriler</h2>
	<h3>Hesap verileri</h3>
	<ul>
		<li>E-posta adresi (giriş ve iletişim için)</li>
		<li>Abonelik durumu (Pro/Premium, ödeme dönemi sonu)</li>
		<li>Stripe müşteri kimliği (kart bilgileri bizde saklanmaz, Stripe'da kalır)</li>
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
			<strong>AI sağlayıcılar:</strong> site açıklamanız ve sohbet mesajları DeepSeek/Anthropic'e işlenmek
			üzere gönderilir (KVKK/GDPR uyumlu aktarım)
		</li>
		<li><strong>Stripe:</strong> ödeme işleme (kart verisi bizde değil)</li>
		<li><strong>Cloudflare R2:</strong> yüklediğiniz görseller</li>
		<li><strong>Resend/SMTP:</strong> transactional e-posta (magic link, bildirimler)</li>
		<li><strong>Domain kayıtçıları (Porkbun/NameSilo):</strong> domain tescil için WHOIS verisi</li>
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
		Bu politika güncellenebilir. Önemli değişiklikler e-posta ile bildirilir. Devam eden kullanım,
		güncellenmiş politikayı kabul etmek anlamına gelir.
	</p>

	<h2>12. İletişim</h2>
	<p>
		Soru ve başvurular: <a href="mailto:destek@saaskaya.com">destek@saaskaya.com</a>
	</p>
</LegalShell>
