# saaskaya.app — UX/Tasarım Revizyonu — Build Prompt

## 0. ROL VE ÇALIŞMA TARZI

Sen bir kıdemli product designer + frontend geliştiricisin. Bu görev bir **audit-first, phased** çalışma: önce mevcut kod tabanını incele, üstyapıyı (framework, component yapısı, i18n sistemi, tasarım token'ları) çıkar, sonra aşağıdaki değişiklikleri **fazlar halinde, her fazdan sonra onay bekleyerek** uygula. Hiçbir fazda backend mantığını (auth, ödeme, site üretim pipeline'ı) değiştirme — bu tamamen bir **UI/UX revizyonu**.

Her faz sonunda: (1) neyi değiştirdiğini kısa maddelerle özetle, (2) hangi dosyaları dokunduğunu listele, (3) bir sonraki faza geçmeden onay iste.

---

## 1. PROJE BAĞLAMI

**saaskaya**, küçük işletme sahipleri ve serbest meslek erbabı (avukat, psikolog, diş hekimi) için AI destekli bir web sitesi platformudur. Kullanıcı mesleğini ve birkaç detayı sohbet eder gibi anlatır; AI bu bilgiyi önceden hazırlanmış, güvenli bileşenlere (Hero, Hakkımızda, Hizmetler, İletişim) yapılandırılmış veri olarak doldurur — asla serbest HTML/CSS/JS üretmez. Kullanıcı sonradan içeriği sohbetle ("tonu daha sıcak yap") veya basit bir arayüzden düzenler, beğenince ödeme yapar, domain otomatik bağlanır/tescil edilir, site "Powered by saaskaya" etiketiyle yayına girer. Uzun vadeli vizyon: "profesyoneller için AI-native WordPress" — WordPress'in esnekliği, ama karmaşıklığı ve bakım yükü olmadan.

**Hedef kullanıcı profili (kritik):** Teknik geçmişi olmayan, muhtemelen 30-55 yaş arası serbest meslek sahibi. Bu kişi "kod", "domain DNS", "versiyon", "API" gibi kavramları bilmiyor veya bilmek istemiyor. Karar verme davranışı: (a) önce "bu benim için mi" diye somut kanıt arar (gerçek örnek görmek ister), (b) "yanlış bir şey yapıp siteyi bozar mıyım / parayı kaptırır mıyım" endişesi taşır, (c) uzun metin okumaktansa tıklamayı tercih eder.

---

## 2. TASARIM PRENSİPLERİ (Bu revizyonun tüm kararlarına rehberlik etmeli)

1. **Göster, anlatma** — "AI senin için site üretir" iddiası her zaman somut bir görsel örnekle desteklenmeli (gerçek mockup/ekran görüntüsü), soyut ikon/renk noktasıyla değil.
2. **Tıklama > Yazma** — Kullanıcıya her seçim noktasında önce hazır seçenek (chip/buton) sun, serbest metni ikincil/genişleyen bir "kendi cümlelerimle" seçeneği olarak konumlandır.
3. **Sıfır jargon kuralı** — Hash ID, versiyon numarası (v1), ham sistem/config mesajları ("Billing not configured yet"), İngilizce placeholder'lar son kullanıcı arayüzünde **asla** görünmemeli. Her teknik durum, kullanıcı diline çevrilmiş bir cümle olmalı.
4. **Güven, karar anından önce gelir** — "Bu AI güvenli mi / sitemi kaybeder miyim" cevapları hero'ya yakın konumlanmalı, sayfa sonuna gömülmemeli.
5. **Aksiyon hiyerarşisi** — Her ekranda tek bir birincil aksiyon (dolu/vurgulu buton) olmalı; ikincil aksiyonlar görsel olarak geride durmalı; nadiren kullanılan aksiyonlar (Export, Unpublish gibi) bir "..." / overflow menüsüne taşınmalı.
6. **İlerleme her zaman görünür** — Çok adımlı akışlarda (onboarding gibi) kullanıcı her an "kaçıncı adımdayım, kaç adım kaldı" bilgisine sahip olmalı.
7. **Dil tutarlılığı** — Aktif dil Türkçe ise placeholder, hata mesajı, sistem durumu dahil %100 Türkçe; İngilizce/Almanca sadece ilgili dil seçiliyken.

---

## 3. MEVCUT DURUM — TESPİT EDİLEN SORUNLAR (ekran bazlı)

### 3.1 Landing Page

- Örnek site kartlarında gerçek görsel/mockup yok, sadece renkli nokta var.
- "Nasıl çalışır" adımları ikonsuz, salt metin — taranabilirlik düşük.
- "Güven" bölümü sayfanın en altında, fiyatlandırma ve SSS'den sonra geliyor.
- Fiyat kartlarında rakam + "/ay" bitişik, tarama zorluğu yaratıyor.
- Genel tipografi tonu (serif ağırlıklı, ince kenarlıklar) hedef kitleye göre fazla "editoryal/akademik", sıcaklık ve somutluk eksik.
- CTA (birincil buton) ile ikincil aksiyonlar (Örnek siteleri gör, Fiyatlandırma) görsel ağırlık olarak yeterince ayrışmıyor.

### 3.2 Onboarding (Yeni Site Akışı)

- Serbest metin kutusu üstte/birincil konumda, meslek seçim butonları (chip) altta/ikincil — sıralama hedef kullanıcı davranışına ters.
- Aktif adım / ilerleme göstergesi (örn. "Adım 1/4") ekranda net görünmüyor.

### 3.3 Dashboard

- Hash tabanlı site ID'leri (`site-26dd6870` vb.) doğrudan kullanıcıya gösteriliyor.
- "v1" gibi versiyon jargonu durum etiketinde yer alıyor.
- Her site kartında 6 eşit ağırlıklı aksiyon linki (Edit, Preview, Republish, View live, Unpublish, Messages, Export) — hiyerarşi yok.
- "Billing not configured yet." gibi ham/İngilizce sistem mesajı kullanıcı arayüzünde görünüyor.
- Domain input placeholder'ı ("yourdomain.com") İngilizce, arayüzün geri kalanıyla tutarsız.

### 3.4 Gizlilik Politikası

- İçerik ve ton uygun; yalnızca çok uzun sayfalarda opsiyonel bir "içindekiler" navigasyonu düşünülebilir (düşük öncelik, bu fazın kapsamı dışında tutulabilir).

---

## 4. YAPILACAK DEĞİŞİKLİKLER (Öncelik Etiketli)

### FAZ 1 — P0: Jargon ve dil temizliği (Dashboard)

- [ ] Site kartlarından hash ID'yi kaldır; yerine "Oluşturuldu: [tarih]" / "Son güncelleme: [tarih]" göster.
- [ ] "live · v1" → "Yayında" ; "draft only" → "Taslak" (versiyon bilgisini gizle veya sadece Export/ayrıntı görünümüne taşı).
- [ ] "Billing not configured yet." mesajını kullanıcı diline çevrilmiş, anksiyete yaratmayan bir ifadeyle değiştir (örn. "Pro'ya geçtiğinde faturalandırma burada görünecek").
- [ ] "yourdomain.com" placeholder'ını Türkçeleştir (örn. "kendisiteniz.com").
- [ ] Her site kartında aksiyonları hiyerarşiye ayır: **birincil** (Düzenle veya Önizle, dolu buton) + **ikincil** (Yayınla/Yayından kaldır, düz metin) + **"..." menü** (Export, Mesajlar, Republish gibi az kullanılanlar).

### FAZ 2 — P1: Onboarding akış sıralaması

- [ ] Meslek seçim chip'lerini (Psikolog/Terapist, Avukat/Hukuk Bürosu, Diş Hekimi/Klinik + gerekirse birkaç ek yaygın meslek) birincil/üst konuma taşı, büyük tıklanabilir kartlar olarak tasarla.
- [ ] Serbest metin alanını ("Kendi cümlelerimle anlatmak istiyorum") ikincil, genişleyen/accordion bir seçenek olarak altta konumlandır.
- [ ] Üstte veya sol panelde net bir ilerleme göstergesi ekle (örn. "Adım 1 / 4" + dolan progress bar), aktif adımı vurgula.

### FAZ 3 — P1: Landing page — görsel kanıt ve güven konumlandırması

- [ ] Örnek siteler bölümündeki renkli nokta yerine her site için gerçek mini ekran görüntüsü/mockup thumbnail'i göster (tıklanınca büyük önizleme).
- [ ] "Güven" bölümünün en kritik 2 maddesini (örn. "AI kod yazmaz, hallüsinasyon riski yok" ve "Sitenin sahibi sensin, istediğin an dışa aktar") hero'nun hemen altına veya "Nasıl çalışır" bölümüyle aynı ekran yüksekliğine taşı; tam Güven bölümü aşağıda genişletilmiş haliyle kalabilir.
- [ ] "Nasıl çalışır" adımlarına (Anlat/Üret/Düzenle/Yayınla) her biri için basit birer ikon veya mini illüstrasyon ekle.

### FAZ 4 — P2: Görsel ton kalibrasyonu

- [ ] Fiyat kartlarındaki rakam + "/ay" arasına görsel ayrım ekle (örn. rakam büyük/koyu, "/ay" küçük/gri ve belirgin boşluklu).
- [ ] Genel tipografi ve kart stilini değerlendir: mevcut navy/cream/amber palet korunabilir, ama kart kenarlıkları, ikon kullanımı ve buton kontrastı "sıcak, somut, güven veren SaaS" hissini güçlendirecek şekilde hafif güçlendirilsin (aşırı editoryal/ince-çizgi hissi azaltılsın).
- [ ] SSS bölümünü accordion (aç/kapa) yapısına çevir (opsiyonel, tarama kolaylığı için).

---

## 5. KISITLAR / YAPILMAYACAKLAR

- Backend mantığı, ödeme akışı (Creem entegrasyonu), domain tescil süreci, AI içerik üretim pipeline'ı **değiştirilmeyecek** — bu saf UI/UX katmanı revizyonu.
- Mevcut i18n (TR/EN/DE) anahtar yapısı korunacak; yeni metinler mevcut çeviri dosyası formatına eklenecek.
- Mevcut renk paleti (navy/cream/amber) temel olarak korunacak; Faz 4'teki "kalibrasyon" bir yeniden marka değil, ince ayar.
- Demo/test verisi ("Donbass LLM" gibi) prod/staging ekran görüntüsü alınacaksa gerçekçi meslek örnekleriyle değiştirilmeli, ama bu bir veri temizliği notu — kod değişikliği gerektirmiyorsa kapsam dışı bırakılabilir.

---

## 6. UYGULAMA SIRASI VE ONAY NOKTALARI

1. **Audit:** Mevcut kod tabanını incele (framework, component ağacı, tasarım token dosyası, i18n yapısı). Bulgularını kısaca özetle. → onay bekle.
2. **Faz 1** (Dashboard jargon temizliği) → değişiklikleri uygula, özetle, → onay bekle.
3. **Faz 2** (Onboarding sıralaması) → uygula, özetle, → onay bekle.
4. **Faz 3** (Landing — görsel kanıt + güven konumlandırma) → uygula, özetle, → onay bekle.
5. **Faz 4** (Görsel ton kalibrasyonu) → uygula, özetle, → onay bekle.

Her fazda değişiklik küçük, gözden geçirilebilir commit/diff boyutunda tutulmalı; bir fazda birden fazla konuyu birleştirme.

---

## 7. KABUL KRİTERLERİ (Definition of Done)

- [ ] Kullanıcıya gösterilen hiçbir ekranda hash ID, versiyon numarası veya ham sistem/config mesajı kalmamış.
- [ ] Onboarding'de meslek seçimi tıklama ile 1 adımda tamamlanabiliyor; serbest metin isteğe bağlı kalıyor.
- [ ] Onboarding'in her ekranında kullanıcı kaçıncı adımda olduğunu görebiliyor.
- [ ] Landing page'de en az 3 örnek site için gerçek görsel mockup/thumbnail görünüyor.
- [ ] "Güven" mesajlarından en az ikisi ilk ekran yüksekliğinde (hero civarı) okunabiliyor.
- [ ] Dashboard'daki her site kartında net bir birincil aksiyon butonu var, geri kalan aksiyonlar ikincil/overflow menüde.
- [ ] Aktif dil Türkçe iken arayızda İngilizce placeholder/mesaj kalmamış.
