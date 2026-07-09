<script lang="ts">
	import LegalShell from '$lib/ui/LegalShell.svelte';
</script>

<LegalShell title="Kullanım Şartları">
	<p class="sk-callout">
		<strong>Beta dönemi uyarısı:</strong> saaskaya kapalı beta dönemindedir. Bu şartlar beta katılımcıları
		içindir; ücretli genel lansman öncesi güncellenebilir.
	</p>

	<h2>1. Taraflar</h2>
	<p>
		Bu şartlar ("Şartlar"), saaskaya platformunu işleten ile platforma hesap açan kullanıcı ("Siz",
		"Kullanıcı") arasındaki sözleşmedir. Hesap oluşturduğunuzda bu Şartları kabul etmiş
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
		<li>Veri dışa aktarma</li>
	</ul>
	<p>
		saaskaya <strong>genel amaçlı web sitesi kurucu veya uygulama geliştiricisi değildir.</strong>
		Hizmet, profesyonel pratikler için (özellikle psikologlar) niş odaklıdır.
	</p>

	<h2>3. Hesap</h2>
	<ul>
		<li>Hesap, magic link ile e-posta doğrulaması sonrası açılır</li>
		<li>Gerçek ve güncel e-posta adresi vermek zorunludur</li>
		<li>Hesap güvenliğinden siz sorumlusunuz; yetkisiz erişimi derhal bildirin</li>
		<li>Kapalı beta döneminde yalnızca davet edilen e-postalar hesap açabilir</li>
		<li>Hesap başına 1 site (Free/Pro) veya plan limitleri içinde</li>
	</ul>

	<h2>4. Planlar ve Limitler</h2>
	<p>
		Plan limitleri (AI kredileri, sayfa, medya, dil, domain) <a href="/pricing"
			>fiyatlandırma sayfasında</a
		> listelenir ve operatör tarafından güncellenebilir. Limitler sunucu tarafında uygulanır. Limit aşımı
		durumunda plan yükseltme veya ek kredi satın alma gerekebilir.
	</p>

	<h2>5. Ödeme</h2>
	<ul>
		<li>Pro/Premium abonelikler Stripe üzerinden aylık faturalandırılır</li>
		<li>Domain satın alımı Stripe veya banka havalesi ile yapılır</li>
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
		<li>Domain yenileme aboneliğe dahil değildir; yıllık ayrı faturalanır</li>
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
		Hizmet "olduğu gibi" sunulur. AI üretiminin doğruluğu, tıbbi/hukuki geçerliliği veya iş sonucu
		garantisi verilmez. Kesintiler, hatalar veya veri kaybı için mümkün olan azami sorumluluk son 12
		ayda ödenen tutardır.
	</p>

	<h2>13. Sorumluluğun Sınırlandırılması</h2>
	<p>
		Operatör, dolaylı, arızi, sonuçsal veya cezai zararlardan sorumlu değildir. Toplam sorumluluk,
		son 12 ayda kullanıcıdan alınan tutarı aşamaz.
	</p>

	<h2>14. Fesih</h2>
	<ul>
		<li>Hesabınızı istediğiniz zaman silebilirsiniz</li>
		<li>
			Operatör, Şart ihlali, kötüye kullanım veya yasal yükümlülük durumunda hesabı askıya alabilir
		</li>
		<li>Fesihde site içeriğiniz 30 gün sonra silinir (domain grace hariç)</li>
	</ul>

	<h2>15. Uyuşmazlık Çözümü</h2>
	<p>
		Önce müzakere, ardından Türkiye Cumhuriyeti kanunları uygulanır. Yetkili mahkeme İstanbul
		(Çağlayan) Mahkemeleri'dir.
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
</LegalShell>
