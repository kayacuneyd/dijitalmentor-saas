<script lang="ts">
	import LegalShell from '$lib/ui/LegalShell.svelte';
</script>

<LegalShell title="KVKK Aydınlatma ve Açık Rıza Metni">
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
		<li><strong>Finansal:</strong> Stripe müşteri kimliği, abonelik durumu (kart verisi yok)</li>
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
		<li><strong>Stripe:</strong> ödeme işleme (ABD merkezli, PCI-DSS uyumlu)</li>
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
</LegalShell>
