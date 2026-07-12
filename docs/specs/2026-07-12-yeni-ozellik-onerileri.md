# Meslek Grubuna Özel Default Entegrasyonlar (Feature Kit Sistemi) — Plan (rev. 3)

> **Rev. 3 (2026-07-12):** Nihai kararlar:
> (1) `maps-link` kaldırıldı — v1'de Google Maps yok, v1.5'te Leaflet + OSM tiles self-hosted facade;
> (2) Kendi booking sistemimiz v1.5 sprint'ine ertelendi — v1'de yalnızca `booking-external` (Calendly linki);
> (3) v1 entegrasyon sözlüğü 6 tipe daraltıldı.

Mevcut yapıda `featureKits: string[]` alanı zaten var ama şu an sadece etiket olarak duruyor.
Anayasa prensipleri içinde kalarak (fixed component set, plugin sistemi yok) bunu **gerçek
entegrasyonlara** dönüştürme planı:

---

## Nihai Yol Haritası

```
v1 (HEMEN) — Link-Out Entegrasyonlar
├── integration schema + domain allowlist
├── booking-external (Calendly linki)
├── whatsapp-order (E.164 telefon → wa.me linki)
├── payment-link (Iyzico/PayTR/Stripe)
├── social-link (Instagram/TikTok/YouTube profil)
├── video-consult (Zoom/Google Meet linki)
├── menu-digital (dijital menü/fiyat listesi)
├── onboarding soruları + editör kartı
├── plan gating (payment-link → Pro)
└── siteQualityCheck uyarıları

v1.5 (SONRAKİ SPRINT) — Booking Lite + Harita
├── Kendi randevu sistemi (slot + form + admin listesi)
├── Leaflet harita facade (Contact adres → otomatik harita, OSM tiles self-hosted)
├── Randevu verisi DB + API
└── siteQualityCheck genişletme

v2 (ORTA VADE) — Embed Facade'ler + Booking Pro
├── social-feed (Instagram/TikTok click-to-load)
├── newsletter (Mailchimp form facade)
├── Booking Pro (Google Calendar sync + hatırlatmalar)
├── Analytics dashboard (WhatsApp tıklama, randevu sayısı)
└── Data export

v3 (PREMIUM) — AI Voice Agent
├── Voice widget JS SDK (first-party, self-hosted)
├── STT → LLM → TTS pipeline
├── Tenant başına yapılandırma (senaryo, dil, çalışma saatleri)
└── Dakika bazlı faturalandırma
```

---

## 1. Mevcut Durum ve Sınırlar

| Ne var | Ne yok |
|---|---|
| `featureKits: string[]` (örn: `['booking-request', 'whatsapp-cta']`) | Bu string'leri render'a bağlayan bir katman |
| 14 sabit blok tipi (hero, booking, contact, cta, faq...) | Harici servis entegrasyonu (Calendly linki, WhatsApp, ödeme linki) |
| Her kit `createProfessionSite()` ile Zod-valid Site üretiyor | Meslek grubuna göre otomatik entegrasyon seçimi |

---

## 2. Kapsam: v1 = Link-Out Only, Harita/Embed v1.5+

**Neden:** Instagram/TikTok/Maps embed'i tenant sitelerine üçüncü parti script/çerez sokar →
KVKK/GDPR gereği çerez bandı zorunluluğu, LCP darbesi. Link-out sıfır script, sıfır consent
sorunu demektir ve "1 dakikada bağla" vaadini aynen taşır.

### v1 entegrasyon sözlüğü (6 tip)

```typescript
type IntegrationType =
  | 'booking-external'  // Calendly/Cal.com randevu sayfası LİNKİ
  | 'whatsapp-order'    // E.164 telefon → render'da wa.me linki üretilir
  | 'payment-link'      // Iyzico/PayTR/Stripe Payment Link
  | 'social-link'       // Instagram/TikTok/YouTube PROFİL butonu (feed embed değil)
  | 'video-consult'     // Zoom/Google Meet linki
  | 'menu-digital';     // Dijital menü / fiyat listesi linki
```

### v1.5'e ertelenenler

- **Leaflet harita:** Contact bloğundaki adres → otomatik harita (OSM tiles, kendi proxy'mizden). 
  Google Maps kullanılmayacak — açık kaynak, çerez yok, trafik bize.
- **Kendi booking sistemi:** Slot tanımlama + form verisi DB'ye + admin listesi. v1'de sadece Calendly link-out.
- **social-feed, newsletter:** click-to-load facade deseniyle — ayrı spec.

---

## 3. Mimari: `Site.settings.integrations` + Doğrudan Blok Okuması

```
Meslek Grubu → kit default'ları → Site.settings.integrations[] → ilgili blok kendisi okur
```

Jenerik enjeksiyon motoru yok. Her blok kendi ilgilendiği türü `settings.integrations`'tan okur:

- `Booking` → `booking-external` (varsa href'i bu linke bağlar)
- `Cta` / `Footer` → `whatsapp-order` (floating/inline WhatsApp butonu)
- `Pricing` → `payment-link`
- `Contact` → `social-link`, `video-consult`
- `Hero`/`Cta` → `video-consult`, `menu-digital` (nişe göre)

### Schema (`src/lib/schema/site.ts` → `siteSettingsSchema`)

```typescript
integrations: z.array(z.strictObject({
  type: z.enum(['booking-external', 'whatsapp-order', 'payment-link',
                'social-link', 'video-consult', 'menu-digital']),
  enabled: z.boolean(),
  // whatsapp-order İÇİN: url yerine phone (E.164). Diğerleri için url.
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
  url: z.string().url().optional(),
  label: localized(nonEmpty).optional()
})
  .superRefine(integrationTargetCheck) // tür↔alan tutarlılığı + domain allowlist
).max(8).optional()
```

`src/lib/kits/integrations.ts` içerir: tür tanımları, tür başına domain allowlist,
tür→varsayılan label sözlüğü ve `wa.me` link üretici yardımcı.

---

## 4. Güvenlik

1. **Tür başına domain allowlist:** `booking-external` → `calendly.com`, `cal.com`; 
   `payment-link` → `iyzico`/`paytr`/`stripe` link alanları; `social-link` → 
   `instagram.com`, `tiktok.com`, `youtube.com`; `video-consult` → `zoom.us`, `meet.google.com`.
2. **WhatsApp = telefon, URL değil:** kullanıcıdan E.164 numara alınır; `wa.me/{num}?text=`
   linkini render üretir.
3. **Render hijyeni:** tüm entegrasyon linkleri `target="_blank"` + `rel="noopener nofollow"`.
4. **AI patch kuralı:** gatekeeper/patch operasyonları entegrasyonların yalnızca `enabled` ve
   `label` alanlarına dokunabilir; `url`/`phone` **AI'ya kapalıdır**.

---

## 5. Meslek Grubu → Default Entegrasyon Matrisi (v1)

| Meslek Grubu | Varsayılan Entegrasyonlar | Hangi Bloğa Yansır |
|---|---|---|
| **Praxis (fizyoterapi, psikolog, diş hekimi, diyetisyen)** | `booking-external` | `Booking` → href |
| | `whatsapp-order` (danışma/randevu) | `Cta`/`Footer` butonu |
| **Evden satış (el işi, butik pasta, takı)** | `whatsapp-order` (sipariş al) | `Cta` → floating WhatsApp |
| | `payment-link` (Iyzico/PayTR) | `Pricing` altında ödeme butonu |
| | `social-link` (Instagram profil) | `Gallery` yanında profil butonu |
| **Influencer / içerik üreticisi** | `payment-link` | `Cta` → öne çıkan link |
| | `social-link` (Instagram/TikTok/YouTube) | `Hero`/`Contact` buton grubu |
| **Emlak danışmanı** | `whatsapp-order` (portföy sor) | `Cta` |
| | `social-link` | `Contact` |
| **Avukat / mali müşavir** | `booking-external` | `Booking` |
| **Güzellik salonu / kuaför** | `booking-external` | `Booking` |
| | `whatsapp-order` | `Cta` |
| | `social-link` (Instagram portföy) | `Gallery` yanı |

> **Not:** Adres bilgisi `Contact` bloğunun `props.address` alanında zaten var. v1'de düz metin
> olarak gösterilir. v1.5'te bu adres Leaflet harita facade'ine beslenir.

---

## 6. Render Katmanında Nasıl Çalışır?

Mevcut bloklar değişmez; ilgili blok `settings.integrations`'tan kendi türünü okur:

```svelte
<!-- Booking.svelte içinde -->
{#if bookingIntegration?.enabled && bookingIntegration.url}
  <a href={bookingIntegration.url} target="_blank" rel="noopener nofollow"
     class="btn-primary">
    {bookingIntegration.label?.[locale] ?? content[locale].buttonLabel}
  </a>
{/if}
```

WhatsApp floating butonu gibi global öğeler `Footer.svelte`'e (veya `SiteRenderer`'daki tek
bir slot'a) eklenir.

---

## 7. Onboarding + Editör Yüzeyleri

1. **Onboarding sihirbazı:** niş bazlı 1–2 opsiyonel soru (mevcut `showWhen` mekanizmasıyla).
   Boş geçilebilir; boşsa entegrasyon `enabled: false` üretilir.
2. **Editör → Settings sekmesi → "Entegrasyonlar" kartı:** kitin önerdiği entegrasyonlar liste
   halinde, tür başına tek input (link ya da telefon) + aç/kapat.

---

## 8. Kalite Kapısı + Plan Gating

- **`siteQualityCheck` uyarısı:** kitin ana entegrasyonu eksikse `warning` üret. Yayını engellemez
  ama Site Sağlık Skoru'na yansır.
- **Plan gating:** `booking-external`, `whatsapp-order`, `social-link`, `video-consult`,
  `menu-digital` → tüm planlar; `payment-link` → **Pro** (upsell: "Sitenden komisyonsuz satışa başla").

---

## 9. Uygulama Adımları (v1)

### Faz 1: Sözlük + schema
1. `src/lib/kits/integrations.ts` — 6 entegrasyon tipi, domain allowlist, default label'lar,
   `wa.me` üretici.
2. `src/lib/schema/site.ts` — `siteSettingsSchema.integrations` + `superRefine`
   (tür↔alan tutarlılığı, allowlist). Fixture'lar + schema testleri aynı diff'te.
3. `ProfessionKitConfig.featureKits: string[]` → `IntegrationType[]`

### Faz 2: Kit → site üretimi
4. `createProfessionSite()` kit default'larını `settings.integrations`'a yazar.

### Faz 3: Blok tarafı
5. `Booking/Cta/Contact/Pricing/Footer` bloklarında entegrasyon okuma.
6. WhatsApp floating butonu (global slot).

### Faz 4: Yüzeyler
7. Onboarding'e niş bazlı opsiyonel entegrasyon soruları.
8. Editör Settings → "Entegrasyonlar" kartı.
9. `siteQualityCheck` uyarıları + plan gating.
10. AI patch kuralları (`url`/`phone` AI'ya kapalı).

---

## 10. Anayasa Uyumluluğu

- ✅ **Yeni blok eklenmiyor** — mevcut 14 blok tipi aynen kalıyor
- ✅ **Plugin sistemi değil** — sabit bir entegrasyon seti, controlled vocabulary
- ✅ **Schema tek kaynak** — `integrations` alanı `siteSchema` içinde
- ✅ **AI aynı kontratı kullanıyor** — `url`/`phone` AI'ya kapalı (güvenlik §4)
- ✅ **Üçüncü parti script yok (v1)** — tenant sitelere embed sokulmuyor
- ✅ **Token discipline** — değişiklikler küçük ve hedefli