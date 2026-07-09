# SaaS Projesi Görüşme Özeti: Domain + Hosting + AI Web İnşası

Bu doküman, "Hızlıca domain satışı + hosting servisi = website inşası" vizyonuyla planlanan SaaS projesi için yapılan görüşmenin tüm detaylarını, kararlarını ve stratejilerini içermektedir.

## 1. Proje Fikri ve Kullanıcı Akışı

Amacımız, WHMCS gibi hantal ve karmaşık sistemler kullanmadan, kullanıcının dakikalar içinde kendi alan adını alıp, yapay zeka yardımıyla modern ve hızlı bir site kurabileceği bir platform yaratmak.

**Kullanıcı Akışı (User Journey):**

1.  **Arama ve Karar:** Kullanıcı SaaS paneline gelir, istediği domaini aratır.
2.  **AI ile Hızlı Önizleme (Geçici):** Kullanıcı, mesleğini ve birkaç detayı (anayasa) girer. Sistem sunucuya yük bindirmeden, tarayıcıda (veya çok kısa ömürlü bir oturumda) sitenin **geçici bir önizlemesini** sunar. _(Alternatif olarak, önce direkt domain kaydı da yapılabilir, bu A/B testine tabidir)._
3.  **Kayıt ve Ödeme:** Müşteri siteyi/domaini beğenince hesap oluşturur, "complete website with hosting service" paketi için (Stripe üzerinden abonelik ile) ödeme yapar.
4.  **Otomasyon (Arka Plan):** Ödeme sonrası domain API (Porkbun/NameSilo vb.) üzerinden tescil edilir, sunucuda (VPS) müşteri için izole alan açılır ve Caddy aracılığıyla DNS/SSL yönlendirmesi otomatik yapılır.
5.  **Açılış ve Yönetim:** Kullanıcı kendi domainine "secret key" (veya magic link) ile giriş yapıp, UI üzerinden sitenin içeriklerini kolayca düzenleyebilir.

## 2. Teknik Altyapı ve Sunucu Yönetimi

Mevcut **KVM 2 (2 vCPU Core, 8 GB RAM, 100 GB NVMe, 8 TB Bandwidth, Full Root Access)** sunucusu başlangıç aşaması için ana merkez olacaktır.

- **Frontend & UI (Müşteri Siteleri ve SaaS Paneli):** SvelteKit + TailwindCSS + DaisyUI. (Modern, çok hızlı ve component bazlı bir yapı).
- **Veritabanı Mimarisi (Hibrit Yaklaşım):**
  - _SaaS Ana Veritabanı:_ Müşteri kayıtları, abonelikler (Stripe) ve faturalandırma için merkezi bir **PostgreSQL**. (Sistemin kalbi).
  - _Müşteri (Tenant) Veritabanları:_ Her müşterinin kendi sitesindeki lokal veriler (iletişim formları, ufak site ayarları) için o müşterinin dizininde izole edilmiş ufak bir **SQLite** veritabanı. (Çok pragmatik bir yalıtım ve yedekleme sağlar).
- **Medya ve Depolama (Storage):** Sunucunun diskini şişirmemek adına, kullanıcıların yüklediği tüm görseller ve assetler **Cloudflare R2**'ye (AWS S3 uyumlu, çok daha ucuz/ücretsiz kotası yüksek) yüklenecek ve `cdn.dijitalmentor.com` üzerinden sunulacaktır.
- **Web Sunucusu:** Otomatik Let's Encrypt SSL yönetimi ve dinamik reverse proxy için **Caddy**.
- **İzolasyon:** Her müşteri Docker konteynerleri ile RAM ve CPU limitlerine (`--memory="512m"` gibi) tabi tutulur.

## 3. Yapay Zeka (AI) ve Token Maliyeti Yönetimi

**Hibrit Mimari ve Component-Based Generation (Bileşen Bazlı Üretim):**

- **İnşa Aşaması (AI Devrede):** AI, doğrudan HTML/CSS yazmaz. SvelteKit, DaisyUI ve Tailwind ile bizim önceden hazırladığımız şablonlara/bileşenlere (Hero, İletişim, Hakkımızda vb.) uygun bir **JSON şeması (`settings.json`)** üretir.
- **Avantajları:**
  - Hatalı kod (hallucination) riski sıfırdır.
  - Sistem, SvelteKit ile bu JSON'u okuyup anında kusursuz bir arayüz çizer.
- **Düzenleme Aşaması (AI Devre Dışı):** Kullanıcı yazı veya renk değiştirmek istediğinde, arayüz doğrudan bu JSON dosyasını günceller.
- **Token Sınırı:** Her kullanıcı için aylık bir limit belirlenir, aşılırsa üst paket teklif edilir.

## 4. İş Modeli, Karlılık ve Pazarlama

Aylık 25€ x 10 müşteri = 250€ gelir hedefi, mevcut sunucu maliyetini fazlasıyla amorti edip kâra geçirmek için yeterlidir.

**Viral Büyüme (Growth Loop):**

- Her üretilen sitenin en altına **"Powered by Dijital Mentor"** badge'i (etiketi) eklenecektir. Bu sayede her müşteri aslında platformun reklamını yapacaktır.
- Badge'i kaldırmak isteyen müşteriler için ufak bir ek ücret (upsell) sunulabilir.

**Niş/Sektörel Pazarlama Stratejisi:**
Genel bir "site kurucu" reklamı yapmak yerine, sektörel ve nokta atışı kampanyalar düzenlenecektir:

- _"Avukatlar için 3 dakikada dijital ofis inşası"_
- _"Psikologlara özel, randevu modüllü süper hızlı web sitesi"_
- _"Diş hekimleri (Praxis) için güven veren modern siteler"_
- Her sektöre özel DaisyUI temaları (renk paletleri ve font kombinasyonları) önceden hazırlanacak, AI sadece ilgili sektörü seçip metinleri üretecektir.

## 5. Ek Gelir Kapısı: Danışmanlık ve Ekstra Servisler

Otomatik SaaS sürecine ek olarak, niş sektörlerin (örneğin doktorların veya avukatların) ekstra ihtiyaçları için:

- "Danışmanım baksın" veya "Özel Düzenleme" butonu.
- SEO hizmeti, dijital pazarlama danışmanlığı (Human-in-the-loop).
- Randevu sistemi (booking) entegrasyonları gibi ekstra servisler paket halinde satılabilecektir.

---

## 6. Analiz: İyileştirmeler, Riskler ve Çözümler

Bu bölüm, yukarıdaki fikrin güçlü ve zayıf yönlerini ve önerilen çözümleri içermektedir.

### 6.1. Kullanıcı Akışı (Domain → AI Preview → Ödeme → Otomasyon)

**Artılar (Pros):**

- Sürtünmesi düşük (low-friction) akış; "önce gör sonra öde" psikolojisi dönüşümü artırır.
- Otomasyon (domain + VPS + Caddy) manuel işi sıfırlar → ölçeklenebilir.

**Eksiler (Cons):**

- AI preview ödeme öncesi ücretsiz sunuluyor → dönüşmeyen her ziyaretçi token maliyeti yaratır. Bot/kötüye kullanım ile maliyet sömürülebilir.
- Domain kaydı geri alınamaz bir maliyet: ödeme öncesi kayıt yapılırsa kullanıcı vazgeçerse domain elde kalır; yapılmazsa "domain'i biri kapar" riski var — akışta hangisi olduğu net değil.
- Abonelik iptal edilirse domain/site ne olacak? (yenileme, DNS kapatma, veri saklama) tanımlanmamış.
- "Secret key / magic link" ile girişte 2FA yok, oturum güvenliği/rate-limit belirtilmemiş.

**Çözüm Önerileri:**

- Preview öncesi email veya reCAPTCHA ile hafif bir "soft gate" koy; preview'a günlük/IP bazlı limit uygula.
- Domain kaydını **ödeme sonrasına** kesinleştir (bunu ana akış yap). "Preview önce" sadece HTML/JSON simülasyonu olsun; gerçek domain tescili asla ödeme öncesi yapılmasın.
- Net bir **cancellation/grace-period policy** yaz: iptalden sonra X gün erişim + domain yenileme uyarısı + veri export imkânı.
- Magic link + opsiyonel 2FA, kısa ömürlü JWT tabanlı oturum ve rate-limiting ekle.

### 6.2. Teknik Altyapı (Tek VPS, PostgreSQL + SQLite Hibrit, Caddy, Docker)

**Artılar (Pros):**

- Maliyet açısından mantıklı bir MVP mimarisi (KVM 2 başlangıç için yeterli).
- SQLite per-tenant izolasyonu basit, yedeklemesi kolay, "blast radius" küçük.
- Cloudflare R2 medya için doğru tercih (S3 uyumlu + ucuz egress).
- Caddy otomatik SSL yönetimini sıfırlıyor — harika seçim.

**Eksiler (Cons):**

- **Tek VPS = tek hata noktası (SPOF).** Sunucu çökerse tüm müşteriler (SaaS paneli dahil) offline kalır.
- Docker ile RAM/CPU limiti var ama **network izolasyonu, disk quota ve "noisy neighbor" (I/O contention)** senaryosu belirtilmemiş.
- Yedekleme/disaster recovery stratejisi yok (VPS kaybolursa ne olur?).
- Monitoring/alerting (uptime, kaynak kullanımı, log toplama) bahsedilmemiş.
- Ölçekleme planı yok: 10 müşteriden 100'e çıkınca tek VPS yetmeyecek.
- CI/CD, staging ortamı, rollback süreci belirtilmemiş.

**Çözüm Önerileri:**

- Günlük otomatik off-site backup (PostgreSQL dump + SQLite dosyaları; R2 zaten ayrı) → örn. Hetzner Storage Box veya başka bir sağlayıcıya.
- Basit monitoring: Uptime Kuma (self-hosted, ücretsiz) + Docker resource alerts.
- Net bir "scale-out" eşiği belirle (örn. %70 RAM/CPU kullanımına ulaşınca 2. VPS'e yatay genişleme planı).
- Docker network'lerini müşteri başına izole et + disk quota (`--storage-opt` veya ayrı volume).

### 6.3. AI Mimarisi (JSON Schema / Component-Based Generation)

**Artılar (Pros):**

- Çok akıllıca — hallucination riskini pratikte sıfırlıyor, token maliyetini kontrol edilebilir kılıyor.
- Şablon bazlı yaklaşım tutarlı UI/UX garantiliyor.

**Eksiler (Cons):**

- Aylık token limiti "belirlenecek" deniyor ama **kötüye kullanım/abuse önleme** (sürekli regenerate) net değil.
- AI'nin ürettiği metinlerin (özellikle avukat/doktor nişinde) **içerik doğruluğu/moderasyon** kontrolü yok. Yanlış tıbbi/hukuki iddialar ciddi risk taşır.
- Fallback senaryosu yok: AI sağlayıcısı kesintiye girerse ne olacak?

**Çözüm Önerileri:**

- Basit bir **content moderation/disclaimer** katmanı: AI üretimi metinlerde otomatik "bu içerik AI tarafından oluşturulmuştur, gözden geçiriniz" uyarısı + insan onayı adımı (sağlık/hukuk nişinde zorunlu).
- Rate-limit + kullanım sayacı (Redis ile basit token-bucket) ekle.
- İkincil bir AI sağlayıcı (fallback provider) veya en azından nazik hata yönetimi ("AI şu an meşgul, X dakika sonra tekrar deneyin").

### 6.4. İş Modeli & Pazarlama

**Artılar (Pros):**

- "Powered by" badge viral growth loop için klasik ama etkili bir taktik.
- Niş/sektörel pazarlama stratejisi çok isabetli — genel "website builder" kalabalığında dikey (vertical) pazarlama doğru hamle.

**Eksiler (Cons):**

- 25€ x 10 = 250€ hedefi **net kâr değil, brüt gelir** gibi duruyor — domain maliyeti, Stripe komisyonu, R2/VPS/AI token maliyetleri düşülünce gerçek net kâr belirsiz. Unit economics net değil.
- Rakip analizi yapılmamış (Durable.co, 10Web, Hostinger AI Website Builder gibi benzer oyuncular var).
- Churn/retention stratejisi yok — SaaS'ta asıl para "aylık kayıp müşteri oranını düşük tutmakta".
- Domain reseller tarafı için ICANN uyumluluğu, WHOIS privacy, domain transfer-out zorunluluğu gibi yasal noktalar değinilmemiş.

**Çözüm Önerileri:**

- Basit bir **unit economics tablosu** çıkar: müşteri başına aylık maliyet (domain amortismanı + VPS payı + R2 + AI token + Stripe fee) vs. 25€ gelir → gerçek marjı gör.
- Rakip analizi yaparak farklılaşma noktanı (örn. "gerçek insan danışmanlık" upsell'i) netleştir — bu zaten en güçlü kartın (Bölüm 5).
- Domain reseller tarafı için Porkbun/NameSilo'nun reseller API şartlarını, ICANN transfer-out zorunluluğunu ve WHOIS privacy default'unu netleştir.
- Churn azaltmak için "yıllık ödemede indirim" seçeneği ekle (nakit akışı + retention için klasik SaaS taktiği).

### 6.5. Ek Gelir (Danışmanlık/Upsell)

**Artılar (Pros):**

- Otomasyonla insan dokunuşunu birleştiren akıllı bir hibrit model — marjı yüksek, farklılaştırıcı.

**Eksiler (Cons):**

- Bu servisin **operasyonel kapasitesi** (kim bakacak, ne kadar sürede dönecek, fiyatlandırma) tanımlanmamış — büyüdükçe darboğaz olabilir.

**Çözüm Önerileri:**

- Başlangıçta bunu manuel/randevu bazlı (Calendly + form) tut, talep arttıkça süreç otomasyonu ekle.

### 6.6. Genel Eksik Kalan Konular (Özet)

1. **Yasal:** KVKK/GDPR uyumu, Kullanım Şartları, Gizlilik Politikası, domain reseller sözleşmesi.
2. **Güvenlik:** 2FA, rate-limiting, tenant network izolasyonu.
3. **Yedekleme & Felaket Kurtarma:** Off-site backup planı yok.
4. **Ölçeklenme planı:** Tek VPS sonrası büyüme yol haritası yok.
5. **Rakip analizi & farklılaşma:** Durable.co, 10Web gibi benzer oyuncularla kıyas yapılmamış.
6. **Unit economics:** Gerçek net kâr hesaplanmamış.
7. **Churn/iptal politikası:** Abonelik iptalinde domain/site süreci net değil.

### 6.7. Email Altyapısı Önerisi

Hostinger VPS'in kendi email sistemi kullanılabilir ancak **daha kolay ve bakımsız bir alternatif önerilir**:

| Çözüm                 | Avantaj                                                                                                            | Dezavantaj                                                                                      | Ücretsiz Kota                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------- |
| **Resend (Önerilen)** | Geliştirici dostu API, SvelteKit SDK var, SPF/DKIM/DMARC otomatik, yüksek deliverability, dakikalar içinde kurulum | Ek servis bağımlılığı                                                                           | 3.000 email/ay, 100 email/gün |
| Hostinger VPS Email   | Ek maliyet yok, aynı sunucuda                                                                                      | Manuel DNS kayıtları (SPF, DKIM, DMARC), IP reputation yönetimi, deliverability sorunları riski | Sınırsız (kendi sunucun)      |
| Brevo (Sendinblue)    | Kullanıcı dostu panel, marketing tool'ları dahil                                                                   | API Resend kadar temiz değil                                                                    | 300 email/gün                 |
| AWS SES               | Çok ucuz (scale'de)                                                                                                | Kurulum karmaşık, AWS hesabı gerekir                                                            | 62.000 email/ay (SES)         |

**Sonuç:** MVP için **Resend** önerilir. Magic link login için gerekli transactional email'lar (giriş linki, ödeme makbuzu, iptal onayı) için ideal. Kurulumu dakikalar, Hostinger email'e göre çok daha az bakım gerektirir. Scale'de maliyet artarsa Hostinger VPS email'e geçiş yapılabilir.

### 6.8. Geri Bildirim Sonrası Ek Çözüm Önerileri

**Email:** Resend ile magic link authentication kurulumu (Phase 1'e eklenmeli). Hostinger VPS email yedek opsiyon olarak kalsın.

**Analytics:** Google Analytics (GA4) ile event tracking — signup, preview, payment, churn metrikleri. Phase 1'den itibaren kurulumu yapılmalı. Alternatif: Plausible (privacy-friendly, self-hosted, GA'dan daha hafif).

**Domain Yenleme:** Stripe veya Creem.io üzerinden otomatik yenileme akışı:

- Abonelik aktif → domain yıllık yenileme ücreti aboneliğe dahil
- Abonelik iptal → domain yenileme uyarısı + grace period + transfer-out imkânı
- Stripe/Creem.io webhook ile ödeme başarısız → otomatik DNS kapatma + veri saklama (30 gün)

**Diğer Çözüm Önerileri:**

1. **Zaman tahminleri:** Her faza rough estimate ekle (solo part-time ~10-15 saat/hafta varsayımıyla):
   - Phase 0: 1-2 hafta · Phase 1: 2-3 hafta · Phase 2: 3-4 hafta · Phase 3: 2-3 hafta · Phase 4: 2 hafta · Phase 5: 1-2 hafta · Phase 6: sürekli
2. **Faz içi önceliklendirme:** Her task'ı `[M]` (must) / `[N]` (nice) olarak etiketle. Zaman kısıtlı olduğunda `[N]` task'lar kesilebilir.
3. **Phase 0'ı böl:** Phase 0a (hızlı karar: niş + rakip analizi, 1 hafta) + Phase 0b (paralel: unit economics + yasal taslaklar, kod yazarken yürüsün).
4. **AI kalite testi:** Phase 2'ye "5-10 örnek meslek için AI çıktılarını manuel test et, prompt'u iteratif iyileştir" adımı ekle.
5. **Domain kayıt başarısızlık akışı:** Phase 3'e "domain kayıt başarısız olursa: otomatik para iadesi + alternatif domain önerisi" fallback akışı ekle.
6. **SEO basics:** Phase 2 veya 3'e "üretilen her site için otomatik meta tags, sitemap.xml, robots.txt, Open Graph tags" ekleyin — niş pazarda farklılaştırma noktası.
7. **Destek kanalı:** Phase 1'e en basitinden bir destek emaili veya Crisp.chat widget'ı ekle.
8. **Test stratejisi (minimal):** En azından ödeme akışı + domain provisioning + AI JSON şema validasyonu için integration test. Phase 5'e E2E test (Playwright) eklenebilir.
9. **Çoklu dil desteği:** Üretilen sitelerin dil ayarı (TR/EN/DE) — `settings.json`'a `locale` field ekle, block metinleri dil bazlı render.

---

## 7. WAAS + CMS Çekirdeği Stratejisi (WordPress Benzeri Genişletilebilirlik)

### 7.1. Vizyon

Bu platform sadece bir "website builder" değil, aynı zamanda bir **CMS çekirdeği** olarak tasarlanabilir. WordPress'in çekirdek felsefesini (kolay admin panel + genişletilebilir yapı) modern teknolojilerle (SvelteKit, JSON schema, component-based) yeniden yorumlamak mümkündür.

**Hedef:** Kullanıcıya WordPress kadar esnek ama çok daha hızlı, güvenli ve bakımı kolay bir çekirdek sunmak. WordPress'in 20 yıllık ekosistemini taklit etmek değil, **çekirdek kolaylıkları** (hızlı admin panel, plugin/theme mantığı, content type esnekliği) modern bir mimariyle sunmak.

### 7.2. Teknik Uygulanabilirlik: Ne Ölçüde Mümkün?

**Uygulanabilirlik: YÜKSEK** — Mevcut JSON schema yaklaşımı zaten CMS mantığıyla çalışıyor (içerik = JSON, sunum = Svelte component). SvelteKit'in component-based yapısı, WordPress block/theme/plugin konseptlerine doğal olarak uyuyor.

**Önemli not:** Bu, MVP'yi geciktirecek bir hedef değil. "Progressive CMS" yaklaşımıyla — her adımda ürün satılabilir durumda kalarak — aşamalı olarak inşa edilir (bkz. 7.7).

### 7.3. WordPress Çekirdek Konseptlerinin Karşılığı

| WordPress                 | Dijital Mentor Karşılığı                                  | Durum           |
| ------------------------- | --------------------------------------------------------- | --------------- |
| Plugin sistemi            | Block/Extension registry + hook API                       | Planlanacak     |
| Theme sistemi             | DaisyUI theme + `theme.json` (renk, font, spacing)        | Kısmen var      |
| Post/Page                 | `settings.json` + content types                           | Var (tek sayfa) |
| Custom Post Types         | Content type registry (Services, Testimonials, Portfolio) | Eklenecek       |
| Gutenberg Blocks          | Svelte component blocks (Hero, About, Contact, vb.)       | Var             |
| Media Library             | Cloudflare R2 + media manager                             | Planlı          |
| User Roles & Capabilities | Tenant user management + role-based access                | Eklenecek       |
| REST API                  | SvelteKit API routes + tenant API                         | Kısmen var      |
| Shortcodes                | Block placeholders in JSON                                | Doğal uyum      |
| Admin Panel               | SaaS dashboard + tenant editor                            | Planlı          |

### 7.4. Teknoloji Stratejisi

**1. Block/Component Sistemi (Gutenberg Benzeri):**

- Her block (Hero, About, Services, Contact, Gallery, Testimonials) kendi Svelte component'i + JSON şeması.
- Block'lar `BlockRegistry` üzerinden kaydedilir: `registry.register("hero", HeroComponent, heroSchema)`.
- Yeni block eklemek çekirdek kodu değiştirmeden yapılabilir.
- Block şeması örneği: `{ type: "hero", props: { title, subtitle, ctaText, bgImage } }`
- Sayfa = block'ların sıralı listesi: `[{ type: "hero", ... }, { type: "about", ... }, { type: "contact", ... }]`

**2. Plugin/Extension Mimarisi:**

- Plugin API: `registerBlock()`, `registerContentType()`, `registerSetting()`, `registerHook()`
- Hook sistemi: `beforeRender`, `afterSave`, `onPublish` (WordPress action/filter benzeri)
- Plugin'ler npm package olarak dağıtılır (güvenli, izole — arbitrary code execution yok)
- Örnek plugin'ler: `@dijitalmentor/booking`, `@dijitalmentor/seo`, `@dijitalmentor/analytics`

**3. Theme Sistemi:**

- `theme.json` şeması: `{ colors: { primary, secondary, accent }, fonts: { heading, body }, spacing, radius }`
- DaisyUI theme'ları bunun preset'leri olur
- Custom theme oluşturma UI'dan mümkün
- Theme = görünüm, Block = yapı, Content = veri (temiz separation of concerns)

**4. Content Types (Çok Sayfalı Siteler):**

- Mevcut: tek sayfa (one-page site)
- Genişletme: Page modeli (çoklu sayfa), navigation menu
- Custom content types: Services, Testimonials, Portfolio, Blog Posts
- Her content type'ın kendi şeması ve list/detail view'ı
- Örnek: `{ contentType: "service", fields: { title, description, price, icon } }`

**5. API Katmanı:**

- SvelteKit API routes üzerinden tenant-specific API
- `/api/[tenant]/content/[type]` pattern
- Headless kullanım imkânı (sadece API, kendi frontend'ini getir)
- Webhook desteği (third-party entegrasyonlar için)

**6. Media Library:**

- R2 üzerinde merkezi medya yönetimi
- Upload, crop, resize, optimize (otomatik WebP)
- Medya kütüphanesi tüm sayfalarda/paylaşımlı

**7. User Roles (Tenant içi):**

- Owner (full access) · Editor (content only) · Viewer (read only)
- Role-based access control (RBAC) — çok kullanıcılı tenant siteler için

### 7.5. Uygulama Adımları (Faz Sıralaması)

**Adım 1 — Block Registry Temeli (Phase 2 ile paralel):**

- `BlockRegistry` sınıfı: `register(type, component, schema)`
- 5-6 core block: Hero, About, Services, Gallery, Contact, Footer
- Her block: Svelte component + JSON schema + default props
- _Maliyet: ~1 hafta ek_

**Adım 2 — Page Builder UI (Phase 4 sonrası):**

- Drag-and-drop block ekleme/sıralama
- Block props edit panel (sağ sidebar)
- Canlı preview
- _Maliyet: ~2-3 hafta_

**Adım 3 — Theme Sistemi (Phase 4 sonrası):**

- `theme.json` şeması tanımla
- 5-10 hazır tema (sektörel preset'ler)
- UI'dan renk/font/spacing düzenleme
- _Maliyet: ~1 hafta_

**Adım 4 — Content Types (Phase 5-6):**

- Page modeli (çoklu sayfa + navigation)
- Custom content type registry
- List/detail view component'leri
- _Maliyet: ~2-3 hafta_

**Adım 5 — Plugin API (Phase 6 sonrası):**

- `registerBlock`, `registerContentType`, `registerHook` API
- Hook sistemi (beforeRender, afterSave, onPublish)
- İlk plugin: Booking (randevu) — psikolog/diş hekimi nişi için
- _Maliyet: ~2-3 hafta_

**Adım 6 — Media Library (Phase 5 ile paralel):**

- R2 upload + optimize (WebP, resize)
- Merkezi medya yönetimi UI
- Block'larda medya seçici
- _Maliyet: ~1-2 hafta_

**Adım 7 — API & Headless (Phase 6 sonrası):**

- Tenant-specific REST API
- Webhook sistemi
- Headless mode (API only, custom frontend)
- _Maliyet: ~2 hafta_

**Adım 8 — Extension Marketplace (Uzun vadeli):**

- Plugin/theme mağazası
- Ücretsiz + ücretli extension'lar
- Topluluk katkısı
- _Maliyet: uzun vadeli, sürekli_

### 7.6. Riskler ve Mitigasyon

| Risk                               | Etki   | Mitigasyon                                                                                                           |
| ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| Scope creep (CMS = devasa proje)   | Yüksek | MVP'de sadece core block'lar + tek sayfa. Çoklu sayfa ve plugin API'yi Phase 6 sonrasına bırak.                      |
| Plugin güvenliği (3. parti kod)    | Yüksek | Plugin'ler npm package olarak sandboxed çalışır. Arbitrary code execution yok. Sadece tanımlı API üzerinden çalışır. |
| Karmaşıklık (kullanıcı için)       | Orta   | Varsayılan olarak AI üretir, kullanıcı sadece düzenler. Gelişmiş özellikler "Advanced" modda gizli.                  |
| Bakım yükü                         | Orta   | Çekirdek küçük tut, fazla işlevi plugin'lere taşı. Core = block registry + renderer + theme + auth.                  |
| Performans (çok block'lu sayfalar) | Düşük  | SvelteKit SSR + lazy load block'lar. JSON küçük kalır.                                                               |
| WordPress ile rekabet algısı       | Düşük  | Doğrudan rakip değil — niş, AI-driven, hosting dahil. Farklı pazar segmenti.                                         |

### 7.7. Önerilen Yaklaşım: "Progressive CMS"

WordPress'in 20 yıllık olgunluğunu taklit etmeye çalışma. Bunun yerine aşamalı genişleme:

1. **Başla:** AI-driven tek sayfa website builder (mevcut plan — Phase 1-3)
2. **Genişlet:** Page builder + çoklu sayfa + theme sistemi (Phase 4-5)
3. **Aç:** Plugin API + content types + headless API (Phase 6 sonrası)
4. **Ekosistem:** Extension marketplace (uzun vadeli)

**Her adımda ürün satılabilir durumda kalmalı.** "CMS çekirdeği" uzun vadeli vizyon, MVP hâlâ AI website builder. Block registry temeli (Adım 1) Phase 2'ye gömülü olarak yapılır — ek maliyet minimal, ama uzun vadeli genişletilebilirlik için kritik temel atılmış olur.
