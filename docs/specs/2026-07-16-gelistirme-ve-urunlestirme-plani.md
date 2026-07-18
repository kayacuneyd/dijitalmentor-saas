# Saaskaya — Geliştirme ve Ürünleştirme Planı

**Tarih:** 2026-07-16  
**Durum:** Faz 0–4 uygulandı; provider aktivasyonu ve 2FA gibi dış bağımlılıklar kontrollü backlog'da  
**Kapsam:** Mevcut beta sonrası eksiklerin kontrollü, faz bazlı tamamlanması

## 1. Uygulama kuralı

Bu doküman bir uygulama izni değildir; yapılacak işlerin sırasını ve kabul kriterlerini tanımlar.

- Her faz bağımsız bir görev olarak ele alınır.
- Codex yalnızca kullanıcının açıkça onayladığı fazı uygular.
- Kullanıcı onay vermeden kod, migration, deploy, ödeme/domain işlemi veya production ayarı yapılmaz.
- Her faz sonunda `npm run check`, ilgili testler ve gerekli browser/live smoke doğrulaması çalıştırılır.
- Her tamamlanan faz `docs/PROGRESS.md` içine neden, kararlar, doğrulama sonucu ve varsa hatalarla kaydedilir.
- AI çıktısı Zod `Site` sözleşmesinden, kontrollü block registry’sinden ve mevcut güvenlik sınırlarından dışarı çıkmaz.

## 2. Öncelik özeti

| Faz | Konu                                               | Öncelik | Beklenen çıktı                                 | Durum                         |
| --- | -------------------------------------------------- | ------: | ---------------------------------------------- | ----------------------------- |
| 0   | AI `add_section` ve provider dayanıklılığı         |      P0 | Canlı AI patch akışı güvenilir                 | Tamamlandı — 2026-07-16       |
| 1   | CI/CD, staging ve release doğrulama                |      P0 | Hatalı build’in production’a çıkmaması         | Tamamlandı — 2026-07-16       |
| 2   | Pricing, kota ve monetizasyon                      |      P1 | Planların ve AI maliyetinin ölçülebilir olması | Tamamlandı — 2026-07-16       |
| 3   | Site kalite kapısı ve profesyonel içerik güvenliği |      P1 | Yayınlanabilir site kalite standardı           | Tamamlandı — 2026-07-16       |
| 4   | Media Manager                                      |      P1 | R2 üzerinde kullanılabilir medya kütüphanesi   | Tamamlandı — 2026-07-16       |
| 5   | Billing/domain self-service                        |      P1 | Kullanıcının operatöre bağımlılığının azalması | Kısmi tamamlandı — 2026-07-16 |
| 6   | SEO, analytics ve dönüşüm ölçümü                   |      P1 | Trafik ve lead ölçüm altyapısı                 | Tamamlandı — 2026-07-16       |
| 7   | Güvenlik, veri izolasyonu ve disaster recovery     |   P0/P1 | Beta büyümesine hazır işletim altyapısı        | Tamamlandı — 2026-07-16       |
| 8   | Dokümantasyon ve roadmap senkronizasyonu           |      P2 | Tek ve güncel proje hafızası                   | Tamamlandı — 2026-07-16       |

## 3. Faz 0 — AI `add_section` ve provider dayanıklılığı

### Amaç

Canlı smoke testte başarısız olan `add_section` operasyonunu ve provider kota/structured-output
problemlerini çözmek.

### İşler

1. `src/lib/server/ai/patch.ts`, tool schema ve DeepSeek prompt/response parsing akışını incele.
2. `reply` ve `operations` alanları eksik geldiğinde güvenli şekilde teşhis et.
3. `add_section` için geçerli tool-call fixture’ı oluştur.
4. Gerekirse provider/model fallback ve retry/backoff politikasını ortaklaştır.
5. Groq kota dolduğunda onboarding guard’ın kullanıcıyı gereksiz yere kilitlemediğini doğrula.
6. Generation structured request reddi için kullanıcıya anlaşılır fallback/error state ekle veya mevcut akışı doğrula.

### Kabul kriterleri

- `add_section` canlı smoke testi tekrarlı olarak başarılı olur.
- Eksik/bozuk tool output renderer’a ulaşmaz.
- En az bir provider rate-limit fallback senaryosu testlidir.
- Unit test, provider mock test ve canlı smoke sonuçları `PROGRESS.md`’ye yazılır.

## 4. Faz 1 — CI/CD, staging ve release doğrulama

### Amaç

`check`, test, build, migration ve production smoke kontrollerini deploy sürecinin zorunlu parçası yapmak.

### İşler

1. Mevcut deploy akışını ve production/staging ayrımını belgelemek.
2. CI pipeline eklemek: install → check → test → build.
3. Migration’ların temiz veritabanında ve idempotent çalıştığını doğrulamak.
4. Staging’de browser smoke senaryosu tanımlamak.
5. Atomic release sonrası health check ve başarısız smoke için rollback prosedürü oluşturmak.
6. Secret’ların CI loglarına sızmadığını kontrol etmek.

### Kabul kriterleri

- Başarısız check/test/build deploy’u engeller.
- Staging’de onboarding → editor → publish smoke çalışır.
- Production rollback adımları tek bir dokümandan uygulanabilir.

## 5. Faz 2 — Pricing, kota ve monetizasyon

### Amaç

Free/Pro/Premium planlarının gerçek limit, maliyet ve ödeme davranışını netleştirmek.

### İşler

1. Plan matrisi oluştur: AI credits, sayfa, locale, medya, entegrasyon ve domain hakları.
2. Premium planı ve plan bazlı `assertWithinQuota` kontrollerini tamamla.
3. AI top-up için idempotent purchase/fulfillment modeli oluştur.
4. Dashboard ve editor’da kalan kredi/maliyet göstergesini ekle.
5. İnsan desteği talep akışını operatör inbox’ına bağla.
6. Ödeme webhook duplicate, retry ve failed fulfillment testlerini ekle.

### Kabul kriterleri

- Plan limitleri server ve UI seviyesinde tutarlıdır.
- Aynı webhook iki kez kredi/domain hakkı vermez.
- Kullanıcı kalan bütçesini AI çağrısından önce görebilir.

## 6. Faz 3 — Site kalite kapısı ve profesyonel içerik güvenliği

### Amaç

AI üretiminin yalnızca schema-valid değil, yayınlanabilir ve mesleki açıdan güvenli olmasını sağlamak.

### İşler

1. `siteQualityCheck` kontrollerini kapsam matrisiyle tamamla.
2. Eksik locale, placeholder, kırık medya, boş/duplike section ve eksik CTA/contact tespitini güçlendir.
3. Alt metin, kontrast ve mobil taşma kontrollerini ekle veya doğrula.
4. Law/psych/dental içerikleri için riskli kesinlik, teşhis, garanti ve hukuki/sağlık iddialarını sınıflandır.
5. Blocker/warning ayrımını belgeleyip editor mesajlarını iyileştir.
6. Publish öncesi kalite panelini gerçek kullanıcı akışında doğrula.

### Kabul kriterleri

- Kritik yapısal sorunlar publish’i durdurur.
- Copy riskleri warning olarak gösterilir.
- Üç ana niche kit’i kalite fixture’larından geçer.

## 7. Faz 4 — Media Manager

### Amaç

Mevcut R2 upload özelliğini gerçek bir site medya kütüphanesine dönüştürmek.

### İşler

1. Site/account bazlı medya listesi ve thumbnail görünümü.
2. Format, boyut, MIME, dosya adı ve güvenli upload limitleri.
3. Medya silme, değiştirme ve section içinden yeniden seçme.
4. Kullanılmayan medya tespiti ve kontrollü silme uyarısı.
5. Plan bazlı depolama limitleri.
6. Görsel alt metni ve erişilebilirlik alanları.

### Kabul kriterleri

- Upload → seçme → yayınlama → değiştirme akışı browser testlidir.
- Yetkisiz kullanıcı başka siteye ait medya URL’sini okuyamaz veya silemez.
- R2 başarısızlıkları tekrar denenebilir biçimde gösterilir.

## 8. Faz 5 — Billing ve domain self-service

### Amaç

Faturalama, domain provisioning ve hesap yaşam döngüsünde operatör bağımlılığını azaltmak.

### İşler

1. Billing portal, fatura geçmişi, upgrade/downgrade ve cancel/resume.
2. Domain durum zaman çizelgesi, DNS talimatları, retry ve manuel yardım.
3. Başarısız domain provisioning için idempotent retry ve görünür hata sebebi.
4. Hesap/site silme talebi, export ve grace-period akışı.
5. Ödeme sonrası domain kaydı ve ücretli aksiyonlarda audit kayıtları.

### Kabul kriterleri

- Kullanıcı aktif aboneliğini ve domain durumunu tek ekrandan anlayabilir.
- Failed → retry duplicate registration oluşturmaz.
- Silme/export/cancellation politikası `docs/POLICY.md` ile uyumludur.

## 9. Faz 6 — SEO, analytics ve dönüşüm

### Amaç

Yayınlanan tenant sitelerinin bulunabilirliğini ve lead üretimini ölçmek.

### İşler

1. Per-page SEO title/description alanlarını schema ve editor’e ekle.
2. Canonical, OG/Twitter metadata, tenant sitemap ve robots davranışını doğrula.
3. Public visit counter üzerine günlük trend görünümü ekle.
4. Contact/inquiry/CTA dönüşüm event’lerini kişisel veri toplamadan aggregate tut.
5. Admin dashboard’da site ve tenant bazlı temel funnel görünümü.
6. Analytics retention ve KVKK/GDPR veri minimizasyonu kararlarını belgelemek.

### Kabul kriterleri

- Her yayınlanan sayfa doğru metadata üretir.
- Preview ve draft trafiği public analytics’e karışmaz.
- Dashboard yalnızca gerekli aggregate veriyi gösterir.

## 10. Faz 7 — Güvenlik, veri izolasyonu ve disaster recovery

### Amaç

Beta kullanıcı sayısı büyümeden tenant izolasyonunu ve geri dönüş kabiliyetini güçlendirmek.

### İşler

1. Production DB’nin dev DB’den kesin ayrımını doğrula ve otomatik kontrol ekle.
2. Off-site backup’ın gerçekten çalıştığını, restore edilebilir olduğunu ve retention’ı test et.
3. Tenant/site/resource authorization için negatif test matrisi oluştur.
4. Admin audit log ve hassas ayar değişikliği geçmişi ekle.
5. Magic-link hesabına opsiyonel 2FA ve rate-limit sürekliliği tasarla.
6. Per-tenant SQLite split veya daha güvenli merkezi izolasyon seçimini karar kaydıyla netleştir.
7. VPS kaybı, DB bozulması, R2 erişim kesintisi ve provider kesintisi için recovery runbook yaz.

### Kabul kriterleri

- Başka tenant’ın site, media, inquiry veya export verisine erişim testleri negatif sonuç verir.
- Backup restore tatbikatı başarıyla tamamlanır.
- Kritik admin ve ödeme/domain işlemleri izlenebilir.

## 11. Faz 8 — Dokümantasyon ve roadmap senkronizasyonu

### Amaç

`CLAUDE.md`, `docs/PLAN.md`, `docs/ROADMAP_EVALUATION.md` ve `docs/PROGRESS.md` arasında çelişki bırakmamak.

### İşler

1. Tamamlanmış canlı smoke, Creem, legal sayfalar, media upload ve analytics temelini güncel duruma taşı.
2. Eski Stripe/Anthropic/Porkbun varsayımlarını mevcut provider mimarisiyle karşılaştır.
3. Bu planı aktif roadmap olarak referanslayan kısa bir bağlantı ekle.
4. Tamamlanan fazları tarih ve kanıtla kapat; ertelenenleri gerekçesiyle bırak.

### Kabul kriterleri

- Tek bir doküman “şu an ne tamamlandı, sırada ne var?” sorusunu cevaplar.
- Stale backlog maddeleri ya kapatılmış ya da açıkça yeniden sınıflandırılmıştır.

## 12. Onay protokolü

Kullanıcı aşağıdaki biçimlerden biriyle onay verebilir:

- `Faz 0'ı uygula`
- `Faz 0 ve 1'i uygula`
- `Sadece Faz 3'ün analizini yap, kod yazma`
- `Planı değiştir: ...`

Onay verilmemiş fazlara geçilmeyecek. Her faz ayrı bir değişiklik ve doğrulama döngüsü olarak ele alınacak.
