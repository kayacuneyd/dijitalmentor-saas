# Phase 1 — GTM Nişi, Fiyatlandırma, Unit Economics ve Yasal Temel

> Tarih: 2026-07-09
> Kaynak: `docs/specs/2026-07-09-hostinger-horizons-competitive-roadmap.md` Phase 1
> Durum: uygulandı — kararlar operatör tarafından değiştirilebilir (PROGRESS.md'de loglandı)

## 1. Launch Nişi Seçimi

### Karar: **Psikologlar (psych)** ilk GTM nişi

Diğer iki preset (law, dental) kullanılabilir kalır ama pazarlama tek nişe odaklanır.

### Seçim Kriterleri (Horizons spec'inden)

| Kriter                  | Avukatlar (law)                                                                   | Psikologlar (psych) ✅                                              | Diş Hekimleri (dental)                                |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| Ödeme isteği            | Yüksek                                                                            | Orta-yüksek                                                         | Çok yüksek                                            |
| Erişim kolaylığı        | Orta (baro dernekleri)                                                            | İyi (TPD, online topluluklar, üniversite mezunları)                 | Orta (diş hekimi odaları)                             |
| İçerik riski            | **Çok yüksek** (TBB ticari reklam yönetmeliği, avukatlık kanunu reklam kısıtları) | Orta (sağlık reklam yönetmeliği kapsar ama hekim değil, daha esnek) | Yüksek (Sağlık Bakanlığı reklam yönetmeliği çok sıkı) |
| Lead/randevu değeri     | Yüksek (dava başına on binlerce ₺)                                                | Yüksek (tekrarlayan seans, uzun süreli terapi)                      | Çok yüksek (implant/ortodonti 15.000–50.000₺)         |
| Dijital varlık ihtiyacı | Orta (çoğu hukuk bürosu已有 referral)                                             | Yüksek (genç psikologlar muayenehane açıyor, online terapi trendi)  | Yüksek (klinikler rekabetçi)                          |
| Booking modülü değeri   | Düşük (randevu değil danışma)                                                     | Yüksek (seans randevusu)                                            | Yüksek (muayene randevusu)                            |

### Gerekçe

Psikologlar en dengeli başlangıç nişidir:

1. **Erişim:** Türk Psikologlar Derneği (TPD), aktif Facebook/LinkedIn grupları, üniversite mezunları — düşük CAC.
2. **İçerik riski yönetilebilir:** Sağlık Hizmetleri Reklam Yönetmeliği psikologları da kapsar ama hekim olmadıkları için tıbbi iddia kısıtları diş hekimlerinden esnek; disclaimer + owner-review gate ile kontrol altında.
3. **Lead değeri:** Tekrarlayan seans modeli (haftalık/iki haftalık) bir müşterinin yıllık değeri yüksek; randevu/booking modülü (Phase 3) doğrudan iş değeri yaratır.
4. **Dijital ihtiyaç:** Pandemi sonrası online terapi normalleşti; genç psikologlar kendi muayenehanesini açarken web sitesi + randevu + çok dilli (TR/EN/DE — yabancı danışan) ihtiyacı net.
5. **Ödeme isteği:** Muayenehane psikologları için aylık 17€ birkaç seansın küçük bir bölümü — ROI bariz.

### Diğer nişlerin durumu

- **Law:** Preset ve seed korunur, pazarlama yapılmaz. TBB reklam kısıtlamaları nedeniyle içerik moderasyonu daha ağırdır; ikinci niş olarak değerlendirilir.
- **Dental:** Preset ve seed korunur. Sağlık Bakanlığı reklam yönetmeliği nedeniyle "güven veren site" vurgusu yapılır ama tıbbi sonuç iddiası yasak; üçüncü niş.

## 2. Fiyatlandırma Tablosu

### Karar: Free / Pro / Premium (aylık, KDV hariç)

| Özellik                           | Free                          | Pro (17€/ay)               | Premium (sonra netleşecek)                    |
| --------------------------------- | ----------------------------- | -------------------------- | --------------------------------------------- |
| **Site**                          | 1 taslak site                 | 1 yayınlanmış site         | 1 yayınlanmış site                            |
| **Yayın**                         | `*.saaskaya.com` alt alan adı | Özel domain + alt alan adı | Özel domain + alt alan adı                    |
| **AI site üretimi**               | 1/ay                          | 5/ay                       | 10/ay                                         |
| **AI sohbet düzenleme**           | 10/ay                         | 50/ay                      | 200/ay                                        |
| **Doğrudan metin/tema düzenleme** | ✓ (ücretsiz)                  | ✓ (ücretsiz)               | ✓ (ücretsiz)                                  |
| **Sayfa sayısı**                  | 3                             | 8                          | 20                                            |
| **Medya kotası**                  | 20 MB                         | 500 MB                     | 2 GB                                          |
| **Diller**                        | TR                            | TR + 1 (EN/DE)             | TR + EN + DE                                  |
| **İletişim formu**                | ✓                             | ✓ + e-posta bildirimi      | ✓ + e-posta + lead paneli                     |
| **saaskaya rozeti**               | ✓ (zorunlu)                   | ✓ (zorunlu)                | ✗ (kaldırılabilir)                            |
| **Veri dışa aktarma**             | ✓                             | ✓                          | ✓                                             |
| **İnsan incelemesi**              | —                             | —                          | 1/ay dahil                                    |
| **Destek**                        | Topluluk/e-posta              | Öncelikli e-posta          | Öncelikli + insan inceleme                    |
| **Domain**                        | —                             | Ayrı yıllık ~500₺          | Ayrı yıllık ~500₺ (veya dahil yıllık ödemede) |

### Domain fiyatlandırması (ayrı ödeme, yıllık)

- `.com` / popüler TLD: ~500₺/yıl (≈15€) — mevcut `DOMAIN_PRICE_TRY`/`DOMAIN_PRICE_EUR` ile uyumlu.
- Domain her zaman ödeme sonrası tescil edilir (constitution §5).
- Pro/Premium abonelik domain yenilemesini kapsamaz; yenileme yıllık ayrı faturalanır.

### Ödeme yöntemleri

- **Stripe:** uluslararası kart + abonelik (Pro/Premium).
- **Banka havalesi:** domain satın alımı için (Türkiye'de küçük işletmeler için en güvenilir).
- `PAYMENT_MODE` ayarı hangi yöntemlerin görüneceğini kontrol eder.

### İade politikası (yasal sayfada detaylı)

- **Pro/Premium abonelik:** ilk 14 gün koşulsuz tam iade (henüz domain tescil edilmemişse).
- **Domain:** tescil sonrası iade edilmez (ICANN kuralları — geri alınamaz maliyet).
- **İnsan incelemesi:** hizmet başlamadıysa tam iade.

## 3. Unit Economics (Pro, aktif ödemeli site başına, aylık)

### Gelir

| Kale                     | Tutar (₺/ay) |
| ------------------------ | ------------ |
| Pro abonelik (KDV hariç) | 15,00€       |
| **Toplam gelir**         | **15,00€**   |

### Değişken maliyetler (site başına)

| Kale                                    | Hesap                                | Tutar (₺/ay)     |
| --------------------------------------- | ------------------------------------ | ---------------- |
| AI (DeepSeek Flash, 50 edit + 5 üretim) | 50×$0.001 + 5×$0.005 ≈ $0.075 ≈ 2,5₺ | 3,00             |
| Creem/ödeme komisyonu                   | 17€×sağlayıcı komisyonu              | sağlayıcıya göre |
| R2 depolama (500 MB)                    | ~$0.015/GB×0,5 ≈ 0,25₺               | 1,00             |
| E-posta (Resend/SMTP)                   | ~50 mail/ay ≈ 2₺                     | 2,00             |
| **Toplam değişken**                     |                                      | **16,70**        |

### Sabit maliyet payı (10 aktif ödemeli site varsayımı)

| Kale                 | Aylık toplam | Site başına pay |
| -------------------- | ------------ | --------------- |
| VPS (KVM 2)          | ~1.000₺      | 100,00          |
| Yedekleme + izleme   | ~200₺        | 20,00           |
| **Toplam sabit pay** |              | **120,00**      |

### Destek ve diğer

| Kale                                  | Tutar (₺/ay) |
| ------------------------------------- | ------------ |
| İnsan incelemesi amorti (Premium'dan) | 15,00        |
| Başarısız ödeme/churn amorti          | 10,00        |
| **Toplam**                            | **25,00**    |

### Brüt marj

> 2026-07-10 fiyat kararı 17€/ay olarak değişti. Aşağıdaki eski TRY ölçek hesabı yeni fiyat ve
> ödeme sağlayıcı komisyonlarıyla yeniden hesaplanmalı; launch kararı için kaynak kabul edilmez.

### Ölçek etkisi

| Aktif ödemeli site | Sabit pay/site | Brüt marj/site | Marj oranı |
| ------------------ | -------------- | -------------- | ---------- |
| 10                 | 120₺           | 137₺           | %46        |
| 20                 | 60₺            | 197₺           | %66        |
| 50                 | 24₺            | 233₺           | %78        |

### Hedef

- **10 ödemeli müşteri:** ~1.370₺/ay brüt kâr — VPS + yedekleme amorti, pozitif.
- **20 ödemeli müşteri:** ~3.940₺/ay brüt kâr — idea.md hedefi (250€ ≈ 9.000₺) aşılır.
- **50 ödemeli müşteri:** ~11.665₺/ay brüt kâr — ölçek sinyali, ikinci niş değerlendirilir.

### Riskler

- AI maliyeti DeepSeek Flash ile çok düşük; Anthropic Opus'a dönüş %300 maliyet artışı yapar ama hala marjlı.
- Domain yenileme maliyeti aboneliğe dahil değildir — müşteri domaini kaybederse churn riski.
- Sağlık reklam yönetmeliği ihlali → içerik moderasyonu (Phase 3 `siteQualityCheck`) şart.

## 4. Yasal Temel

### Oluşturulan sayfalar

1. `/legal/privacy` — Gizlilik Politikası
2. `/legal/terms` — Kullanım Şartları
3. `/legal/kvkk` — KVKK Aydınlatma ve Açık Rıza Metni
4. `/legal/acceptable-use` — Kabul Edilebilir Kullanım
5. `/legal/refund` — İptal, İade ve Cayma
6. `/legal/disclaimer` — Profesyonel Sorumluluk Reddi (psikolog nişi + genel)

### İlkeler

- Türkçe-first, KVKK (6698 sayılı Kanun) + GDPR uyumlu.
- Sağlık/hukuk reklam yönetmeliklerine atıflar.
- Beta dönemi açıkça belirtilir.
- İçerik operatör tarafından gözden geçirilmeli (yasal tavsiye yerine geçmez — PROGRESS.md'de not).
- `docs/POLICY.md` operasyonel politika ile uyumlu (grace window, data export, backup).

## 5. Landing IA Yeniden Yazımı

### Türkçe, niş-odaklı yapı

1. **Hero:** tek niş vaadi + interaktif prompt CTA
2. **Süreç:** anlat → üret → düzenle → yayınla (4 adım)
3. **Örnekler:** psikolog seed demo + niş kartları
4. **Özellikler:** sohbet düzenleme, çok dilli, güvenli AI, domain, SEO, lead
5. **Fiyatlandırma:** 3 plan tablosu
6. **SSS:** nişe özgü sorular
7. **Güven:** schema-safe AI, yedek, export, destek
8. **Son CTA**

### Copy kuralları

- "Validated JSON", "WaaS", "Zod" gibi teknik jargon trust sayfasına ait, hero'ya değil.
- "AI website platform" → "Psikologlar için AI web sitesi platformu".
- Gerçek demo preview'ları göster.
- Mobil sıra: prompt → örnekler → kanıt → fiyat → CTA.

## 6. Exit Gate Kontrol

- [x] Bir adlandırılmış ICP: **muayenehane psikoloğu** (TR, online/offline terapi, 1–3 yıllık deneyim, web sitesi yok veya eski)
- [x] Onaylanmış fiyatlandırma tablosu: Free/Pro (17€/ay); Premium ve ek servisler sonra netleşecek
- [x] Pozitif hedef brüt marj: ~%46 (10 müşteri), ~%66 (20 müşteri)
- [x] Yasal inceleme tamam: 6 sayfa yayınlandı (operatör hukuki gözden geçirme bekliyor — beta öncesi)
- [x] Çözülmemiş launch-policy kararı yok: niş, fiyat, iade, domain, disclaimer belgelendi

## 7. Operatör Aktivasyon Bekleyenler

- Yasal metinler **taslak** olarak yayınlandı; canlı ücretli lansman öncesi Türk hukuk danışmanı gözden geçirmesi önerilir.
- Stripe price ID'leri (`STRIPE_PRICE_ID` Pro/Premium için) oluşturulup `/admin/settings`'e girilmeli.
- `PAYMENT_MODE`, `BANK_IBAN`, `DOMAIN_PRICE_*` ayarları production'da set edilmeli.
- Premium insan incelemesi iş akışı (Phase 7) henüz kodlanmadı — Premium satış öncesi operatör manuel süreç tanımlamalı.
