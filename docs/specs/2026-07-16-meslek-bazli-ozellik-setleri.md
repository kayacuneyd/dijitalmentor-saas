# Meslek Bazlı Özellik Setleri (Profession Feature-Skill Matrix)

**Tarih:** 2026-07-16
**Amaç:** Her meslek grubunun ihtiyaç duyduğu blok, entegrasyon ve Pro tetikleyicilerini listeleyen tek bir referans dokümanı.
**Anayasa uyumu:** Yeni bloklar registry pattern ile eklenir; integration'lar controlled vocabulary olarak genişler; AI yalnızca Zod schema üzerinden veri üretir. Hiçbir meslek grubu için per-tenant HTML/CSS/JS veya plugin sistemi önerilmez.

---

## 1. Mevcut Durum

### 1.1 Mevcut Blok Tipleri (17 adet)

| # | Blok | Tip | Varyantlar |
|---|------|-----|------------|
| 1 | Hero | `hero` | centered, split, minimal |
| 2 | About | `about` | text-only, text+image |
| 3 | Services | `services` | grid, list |
| 4 | Gallery | `gallery` | carousel, grid |
| 5 | Contact | `contact` | form, inline |
| 6 | Cta | `cta` | centered, split |
| 7 | Faq | `faq` | accordion, inline |
| 8 | Testimonials | `testimonials` | grid, carousel |
| 9 | Pricing | `pricing` | cards, table |
| 10 | Process | `process` | vertical, horizontal |
| 11 | Booking | `booking` | inline, floating |
| 12 | Credentials | `credentials` | grid, list |
| 13 | Team | `team` | grid, list |
| 14 | Footer | `footer` | simple, extended |
| 15 | Stats | `stats` | grid, inline |
| 16 | Clients | `clients` | logo-grid, carousel |
| 17 | Video | `video` | embed, thumbnail |

### 1.2 Mevcut Integration Tipleri (6 adet)

| Integration | Açıklama | Plan Gate |
|-------------|----------|-----------|
| `booking-external` | Calendly/Cal.com randevu linki | Free |
| `whatsapp-order` | E.164 telefon → wa.me linki | Free |
| `payment-link` | Iyzico/PayTR/Stripe ödeme linki | **Pro** |
| `social-link` | Instagram/TikTok/YouTube/LinkedIn profil | Free |
| `video-consult` | Zoom/Google Meet/Teams linki | Free |
| `menu-digital` | Dijital menü/fiyat listesi | Free |

### 1.3 Mevcut Profesyonel Kit'leri (6 adet)

| Kit | Slug | Kategori | Bloklar | Integration'lar |
|-----|------|----------|---------|-----------------|
| Modern Diyetisyen | `dietitian-modern` | health | hero, about, services, gallery, faq, contact, cta, footer | booking-external, whatsapp-order |
| Emlak Danışmanı | `real-estate-agent` | property | hero, about, services, faq, contact, cta, footer | whatsapp-order, social-link |
| Güzellik Salonu | `beauty-salon` | local-service | hero, about, services, gallery, faq, contact, cta, footer | booking-external, whatsapp-order, social-link |
| Fizyoterapist | `physiotherapist-modern` | health | hero, about, services, faq, contact, cta, footer, testimonials, pricing, booking, process | booking-external, whatsapp-order |
| Diş Kliniği | `dentist-clinic` | health | hero, about, services, faq, contact, cta, footer, testimonials, pricing, booking, credentials | booking-external, social-link |
| Avukat (Güven Odaklı) | `lawyer-trust` | local-service | hero, about, services, faq, contact, cta, footer, process, credentials, testimonials | whatsapp-order, social-link |

---

## 2. Yeni Blok Önerileri (Kontrollü)

Anayasa §3 uyarınca registry pattern ile eklenecek yeni blok tipleri:

### 2.1 `publications` — Yayınlar

**Kullanan meslekler:** Akademisyen, avukat (makale/kitap), psikolog (araştırma)

```typescript
// Schema taslağı
{
  type: 'publications',
  props: { variant: 'grouped' | 'list', groupBy: 'year' | 'type' },
  content: {
    tr: {
      title: string,
      items: {
        type: 'article' | 'book' | 'chapter' | 'conference' | 'thesis' | 'report',
        title: string,
        authors: string,
        journal?: string,
        publisher?: string,
        year: number,
        doi?: string,
        url?: string,
        abstract?: string
      }[]
    },
    en: { ... },
    de: { ... }
  }
}
```

**Render:** Yıla/türe göre gruplanmış, DOI linkli, filtrelenebilir liste.

### 2.2 `courses` — Dersler

**Kullanan meslekler:** Akademisyen, özel eğitimci, dil okulu

```typescript
{
  type: 'courses',
  props: { variant: 'grid' | 'list', showSemester: boolean },
  content: {
    tr: {
      title: string,
      items: {
        code: string,
        title: string,
        level: 'undergrad' | 'grad' | 'phd' | 'professional',
        description: string,
        syllabusUrl?: string
      }[]
    }
  }
}
```

### 2.3 `projects` — Araştırma Projeleri / Portföy

**Kullanan meslekler:** Akademisyen, mimar, yazılımcı, emlak danışmanı

```typescript
{
  type: 'projects',
  props: { variant: 'timeline' | 'grid' | 'carousel' },
  content: {
    tr: {
      title: string,
      items: {
        title: string,
        role?: string,       // akademik: 'PI'|'Co-PI'; mimar: 'proje lideri'
        funder?: string,     // TÜBİTAK, BAP, AB
        budget?: string,
        startYear: number,
        endYear?: number,
        description: string,
        imageUrl?: string,
        url?: string
      }[]
    }
  }
}
```

### 2.4 `academic-service` — Akademik Hizmet

**Kullanan meslekler:** Akademisyen

```typescript
{
  type: 'academic-service',
  props: { variant: 'list' },
  content: {
    tr: {
      title: string,
      editorial: { journal: string, role: string, yearRange: string }[],
      reviewing: { journal: string, yearRange: string }[],
      committees: { institution: string, role: string, yearRange: string }[],
      memberships: { organization: string, role: string }[]
    }
  }
}
```

### 2.5 `downloads` — Materyal Paylaşımı

**Kullanan meslekler:** Akademisyen, avukat, mali müşavir, diyetisyen

```typescript
{
  type: 'downloads',
  props: { variant: 'grid' | 'list' },
  content: {
    tr: {
      title: string,
      items: {
        title: string,
        description: string,
        type: 'pdf' | 'slides' | 'poster' | 'dataset' | 'notes' | 'form' | 'other',
        fileUrl?: string,
        externalUrl?: string,
        sizeKb?: number
      }[]
    }
  }
}
```

### 2.6 `media-appearances` — Medya / Basın Görünümleri

**Kullanan meslekler:** Akademisyen, avukat, psikolog, influencer

```typescript
{
  type: 'media-appearances',
  props: { variant: 'grid' | 'list' },
  content: {
    tr: {
      title: string,
      items: {
        outlet: string,       // CNN Türk, Hürriyet, podcast adı
        type: 'tv' | 'radio' | 'podcast' | 'print' | 'online',
        title: string,
        date: string,
        url?: string,
        logoUrl?: string
      }[]
    }
  }
}
```

### 2.7 `case-studies` — Vaka Çalışmaları / Başarı Hikayeleri

**Kullanan meslekler:** Avukat, diyetisyen, fizyoterapist, psikolog, mimar

```typescript
{
  type: 'case-studies',
  props: { variant: 'grid' | 'carousel' },
  content: {
    tr: {
      title: string,
      items: {
        title: string,
        category: string,
        summary: string,
        result: string,
        imageUrl?: string,
        detailUrl?: string
      }[]
    }
  }
}
```

### 2.8 `positions` — Açık Pozisyonlar / İlanlar

**Kullanan meslekler:** Akademisyen (lab), hukuk bürosu, klinik, güzellik salonu

```typescript
{
  type: 'positions',
  props: { variant: 'list' },
  content: {
    tr: {
      title: string,
      items: {
        title: string,
        type: 'full-time' | 'part-time' | 'intern' | 'phd' | 'postdoc' | 'volunteer',
        description: string,
        requirements: string[],
        applicationUrl?: string,
        deadline?: string
      }[]
    }
  }
}
```

---

## 3. Yeni Integration Önerileri

### 3.1 `academic-profile` — Akademik Profil Linkleri

```typescript
'academic-profile': {
  domains: ['scholar.google.com', 'orcid.org', 'researchgate.net', 'scopus.com', 'webofscience.com', 'publons.com'],
  defaultLabel: { tr: 'Akademik Profil', en: 'Academic Profile', de: 'Akademisches Profil' }
}
```

### 3.2 `open-science` — Açık Bilim / Reprodüksiyon

```typescript
'open-science': {
  domains: ['github.com', 'gitlab.com', 'osf.io', 'arxiv.org', 'biorxiv.org', 'ssrn.com', 'zenodo.org', 'figshare.com'],
  defaultLabel: { tr: 'Açık Bilim', en: 'Open Science', de: 'Open Science' }
}
```

### 3.3 `portfolio-gallery` — Portföy Galerisi (Görsel Ağırlıklı)

```typescript
'portfolio-gallery': {
  domains: ['behance.net', 'dribbble.com', 'artstation.com'],
  defaultLabel: { tr: 'Portföy', en: 'Portfolio', de: 'Portfolio' }
}
```

### 3.4 `review-platform` — Değerlendirme Platformları

```typescript
'review-platform': {
  domains: ['google.com/maps', 'doktortakvimi.com', 'yell.com', 'trustpilot.com'],
  defaultLabel: { tr: 'Değerlendir', en: 'Review Us', de: 'Bewerten' }
}
```

### 3.5 `appointment-system` — Randevu/Rezervasyon

```typescript
// booking-external'ı genişlet — zaten var, sadece domain'leri büyüt
'appointment-system': { // → aslında booking-external'a ek domain
  additionalDomains: ['healcode.com', 'cliniko.com', 'accenture.com', 'doktordansor.com']
}
```

### 3.6 `donation` — Bağış / Destek

```typescript
'donation': {
  domains: ['patreon.com', 'buymeacoffee.com', 'kreosus.com', 'github.com/sponsors'],
  defaultLabel: { tr: 'Destek Ol', en: 'Support', de: 'Unterstützen' }
}
```

---

## 4. Meslek Grubu → Özellik Matrisi

### 4.1 AKADEMİSYEN 🎓

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut bloklar** | Hero (ünvan + araştırma alanı) | mevcut | P0 | Free |
| | Credentials (eğitim, ödüller) | mevcut | P0 | Free |
| | About (biyografi, ilgi alanları) | mevcut | P0 | Free |
| | Services (uzmanlık alanları) | mevcut | P0 | Free |
| | Booking + booking-external (ofis saati) | mevcut | P0 | Free |
| | Blog (akademik blog) | mevcut | P1 | Free |
| | Testimonials (öğrenci referansları) | mevcut | P1 | Free |
| | Team (araştırma grubu/lab) | mevcut | P1 | Free |
| | Contact + social-link (Google Scholar) | mevcut+integration | P0 | Free |
| | Video (konferans konuşmaları) | mevcut | P2 | Free |
| **Yeni integration** | `academic-profile` (Scholar, ORCID, ResearchGate) | yeni | P0 | Free |
| | `open-science` (GitHub, OSF, arXiv, Zenodo) | yeni | P1 | Free |
| | `donation` (Patreon, bağış) | yeni | P2 | Free |
| **Yeni bloklar** | Publications | yeni | **P0** | Free'de manuel, **Pro'da Scholar import** |
| | Courses | yeni | P0 | Free |
| | Projects (araştırma projeleri) | yeni | P0 | Free |
| | Academic Service (editörlük, hakemlik) | yeni | P1 | Free |
| | Downloads (ders notları, sunumlar) | yeni | P1 | Free |
| | Media Appearances (basın, podcast) | yeni | P2 | Free |
| | Positions (açık pozisyonlar: doktora, post-doc) | yeni | P2 | Free |
| | Case Studies (danışmanlık başarıları) | yeni | P2 | Free |
| **Pro killer feature** | PDF CV Üretici (TR/EN, kısa/uzun, TÜBİTAK formatı) | yeni sistem | **P0** | **Pro exclusive** |
| | Google Scholar otomatik import | yeni sistem | P1 | **Pro exclusive** |
| | Atıf widget'ı (canlı h-index) | yeni sistem | P2 | **Pro exclusive** |
| | BibTeX/APA/MLA export | yeni sistem | P2 | **Pro exclusive** |
| | Multilingual site | mevcut sistem | P0 | **Pro** (zaten) |
| | Custom domain (.edu.tr) | mevcut sistem | P1 | **Pro** |
| **SiteQualityCheck** | Yayın listesi boşsa warning | kalite | P1 | - |
| | "Lorem ipsum" placeholder tespiti | kalite | P1 | - |

**Pro'ya geçiş tetikleyicileri:**
1. "Yayınlarını Google Scholar'dan 1 tıkla içe aktar" → Pro
2. "Sitenden otomatik PDF CV indir" → Pro exclusive
3. "İngilizce + Türkçe yayınla" → Pro (multilingual)
4. "Kendi .edu.tr alan adında yayınla" → Pro
5. "Atıf metriklerin canlı görünsün" → Pro

**Onboarding soruları:**
- Akademik ünvanınız nedir? (Prof. Dr. / Doç. Dr. / Dr. Öğr. Üyesi / Araştırma Görevlisi / Doktora Öğrencisi)
- Araştırma alanlarınız nelerdir?
- Hangi dersleri veriyorsunuz? (opsiyonel)
- Google Scholar profiliniz var mı? (ID girişi — Pro'da import için)
- Lab/Araştırma grubu yönetiyor musunuz?
- Danışmanlık/mentorluk hizmeti veriyor musunuz?

---

### 4.2 DİŞ HEKİMİ / SAĞLIK KLİNİĞİ 🦷

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Gallery, Faq, Contact, Cta, Footer | mevcut | ✅ var | Free |
| | Testimonials | mevcut | ✅ var | Free |
| | Pricing | mevcut | ✅ var | Free |
| | Booking + booking-external | mevcut | ✅ var | Free |
| | Credentials (diploma, sertifikalar) | mevcut | ✅ var | Free |
| | `social-link` (Instagram, YouTube) | mevcut | ✅ var | Free |
| **Yeni bloklar** | Case Studies (before/after gülüş tasarımı) | `case-studies` | P0 | Free |
| | Downloads (hasta bilgilendirme formları) | `downloads` | P2 | Free |
| | Media Appearances (sağlık programları) | `media-appearances` | P2 | Free |
| **Yeni integration** | `review-platform` (Google Maps, DoktorTakvimi) | yeni | P0 | Free |
| **Pro killer** | Online hasta formları (PDF) | sistem | P1 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |
| | Custom domain | mevcut | P1 | **Pro** |

---

### 4.3 AVUKAT / HUKUK BÜROSU ⚖️

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Faq, Contact, Cta, Footer | mevcut | ✅ var | Free |
| | Process (çalışma süreci) | mevcut | ✅ var | Free |
| | Credentials (baro, arabuluculuk) | mevcut | ✅ var | Free |
| | Testimonials | mevcut | ✅ var | Free |
| | `whatsapp-order`, `social-link` | mevcut | ✅ var | Free |
| **Yeni bloklar** | Publications (makale, kitap, karar incelemesi) | `publications` | P1 | Free |
| | Downloads (bilgilendirme broşürleri, dilekçe örnekleri) | `downloads` | P0 | Free |
| | Case Studies (kamuya açık başarılı davalar) | `case-studies` | P1 | Free |
| | Media Appearances (hukuk programları, köşe yazıları) | `media-appearances` | P1 | Free |
| | Positions (stajyer avukat ilanı) | `positions` | P2 | Free |
| | Pricing (danışmanlık paketleri) | mevcut | P1 | Free |
| **Yeni integration** | `payment-link` (danışmanlık ödemesi) | mevcut | P0 | **Pro** |
| | `review-platform` (Google Maps) | yeni | P1 | Free |
| | `video-consult` (online danışma) | mevcut | P1 | Free |
| **Pro killer** | Otomatik vekaletname/dilekçe taslak indirme | sistem | P2 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |
| | Custom domain | mevcut | P1 | **Pro** |

---

### 4.4 PSİKOLOG / PSİKİYATRİST 🧠

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Faq, Contact, Cta, Footer | mevcut | ✅ var (seed) | Free |
| | Booking + booking-external | mevcut | ✅ var (seed) | Free |
| | Credentials (diploma, süpervizyon) | mevcut | P0 | Free |
| | `video-consult` (online terapi) | mevcut | P0 | Free |
| **Yeni bloklar** | Publications (araştırma makaleleri) | `publications` | P1 | Free |
| | Downloads (psikoeğitim materyalleri) | `downloads` | P1 | Free |
| | Media Appearances (podcast, TV) | `media-appearances` | P2 | Free |
| | Case Studies (anonimleştirilmiş vaka örnekleri) | `case-studies` | P2 | Free |
| | Pricing | mevcut | P0 | Free |
| | Process (terapi süreci adımları) | mevcut | P0 | Free |
| **Yeni integration** | `review-platform` (Google Maps) | yeni | P1 | Free |
| | `academic-profile` (Scholar, ResearchGate) | yeni | P1 | Free |
| **Pro killer** | Online terapi formları ve ölçekler | sistem | P2 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |
| | Custom domain | mevcut | P1 | **Pro** |

---

### 4.5 DİYETİSYEN 🥗

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Gallery, Faq, Contact, Cta, Footer | mevcut | ✅ var | Free |
| | `booking-external`, `whatsapp-order` | mevcut | ✅ var | Free |
| **Yeni bloklar** | Downloads (beslenme planı şablonları, tarifler) | `downloads` | P0 | Free |
| | Pricing (paket fiyatları) | mevcut | P0 | Free |
| | Testimonials (danışan yorumları) | mevcut | P0 | Free |
| | Process (danışmanlık süreci) | mevcut | P1 | Free |
| | Case Studies (başarı hikayeleri) | `case-studies` | P1 | Free |
| | Media Appearances | `media-appearances` | P2 | Free |
| **Yeni integration** | `review-platform` | yeni | P1 | Free |
| | `payment-link` (online diyet paketi satışı) | mevcut | P1 | **Pro** |
| | `video-consult` (online danışma) | mevcut | P0 | Free |
| **Pro killer** | Online diyet takip paneli | sistem | P2 | **Pro exclusive** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.6 FİZYOTERAPİST 🦴

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Faq, Contact, Cta, Footer | mevcut | ✅ var | Free |
| | Testimonials, Pricing, Booking, Process | mevcut | ✅ var | Free |
| | `booking-external`, `whatsapp-order` | mevcut | ✅ var | Free |
| **Yeni bloklar** | Downloads (egzersiz programı PDF'leri) | `downloads` | P0 | Free |
| | Case Studies (başarılı rehabilitasyon) | `case-studies` | P1 | Free |
| | Video (egzersiz demo videoları) | mevcut | P0 | Free |
| | Credentials | mevcut | P1 | Free |
| **Yeni integration** | `review-platform` | yeni | P1 | Free |
| | `payment-link` | mevcut | P1 | **Pro** |
| | `video-consult` (online değerlendirme) | mevcut | P0 | Free |
| **Pro killer** | Online egzersiz takip programı | sistem | P2 | **Pro exclusive** |

---

### 4.7 GÜZELLİK SALONU / KUAFÖR 💇

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Gallery, Faq, Contact, Cta, Footer | mevcut | ✅ var | Free |
| | `booking-external`, `whatsapp-order`, `social-link` | mevcut | ✅ var | Free |
| **Yeni bloklar** | Pricing (hizmet fiyat listesi) | mevcut | P0 | Free |
| | Testimonials (müşteri yorumları) | mevcut | P0 | Free |
| | Process (hizmet öncesi/sonrası adımlar) | mevcut | P1 | Free |
| | Case Studies (before/after galerisi) | `case-studies` + gallery | P0 | Free |
| | Positions (iş ilanı) | `positions` | P2 | Free |
| **Yeni integration** | `review-platform` (Google Maps) | yeni | P0 | Free |
| | `payment-link` (online paket satışı) | mevcut | P1 | **Pro** |
| | `menu-digital` (hizmet menüsü) | mevcut | P1 | Free |
| **Pro killer** | Sadakat kartı / online hediye çeki | sistem | P2 | **Pro exclusive** |
| | Çok dilli site | mevcut | P2 | **Pro** |

---

### 4.8 EMLAK DANIŞMANI 🏠

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Faq, Contact, Cta, Footer | mevcut | ✅ var | Free |
| | `whatsapp-order`, `social-link` | mevcut | ✅ var | Free |
| **Yeni bloklar** | Projects (portföy — satılık/kiralık gayrimenkuller) | `projects` | **P0** | Free |
| | Gallery (gayrimenkul fotoğrafları) | mevcut | P0 | Free |
| | Testimonials (müşteri yorumları) | mevcut | P0 | Free |
| | Stats (satılan/kiralanan sayısı, mutlu müşteri) | mevcut | P1 | Free |
| | Pricing (komisyon/hizmet bedeli) | mevcut | P2 | Free |
| | Video (gayrimenkul tanıtım videoları) | mevcut | P1 | Free |
| | Downloads (ilan şartnameleri, tapu rehberi) | `downloads` | P1 | Free |
| **Yeni integration** | `review-platform` | yeni | P0 | Free |
| | `video-consult` (online portföy görüşmesi) | mevcut | P1 | Free |
| **Pro killer** | Portföy sayfası başına SEO optimizasyonu | sistem | P1 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |
| | Custom domain | mevcut | P1 | **Pro** |
| | Leaflet harita (v1.5) | sistem | P1 | **Pro** |

---

### 4.9 INFLUENCER / İÇERİK ÜRETİCİSİ 📱

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Gallery, Contact, Cta, Footer | mevcut | P0 | Free |
| | `social-link` (Instagram, TikTok, YouTube) | mevcut | P0 | Free |
| | `payment-link` (marka iş birliği/ürün satışı) | mevcut | P0 | **Pro** |
| | Blog (içerik üretimi yazıları) | mevcut | P1 | Free |
| | Video (son videolar) | mevcut | P0 | Free |
| **Yeni bloklar** | Stats (takipçi, erişim, etkileşim) | mevcut | P0 | Free |
| | Testimonials (marka referansları) | mevcut | P0 | Free |
| | Pricing (iş birliği paketleri) | mevcut | P0 | Free |
| | Services (hizmetler: reklam, tanıtım, danışmanlık) | mevcut | P0 | Free |
| | Clients (iş birliği yapılan markalar) | mevcut | P0 | Free |
| | Downloads (media kit PDF) | `downloads` | P0 | Free |
| | Media Appearances (basın, röportaj) | `media-appearances` | P1 | Free |
| **Yeni integration** | `booking-external` (iş birliği toplantısı) | mevcut | P1 | Free |
| | `donation` (Patreon, bağış) | yeni | P1 | Free |
| | `portfolio-gallery` (Behance, Dribbble) | yeni | P1 | Free |
| **Pro killer** | Özel link-in-bio sayfası (Linktree benzeri) | sistem | P0 | **Pro** |
| | Analytics dashboard (tıklama, dönüşüm) | sistem | P2 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.10 EL İŞİ / BUTİK SATICI 🧵

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Gallery (ürün fotoğrafları), Contact, Cta, Footer | mevcut | P0 | Free |
| | `whatsapp-order` (sipariş al) | mevcut | P0 | Free |
| | `payment-link` (Iyzico/PayTR ödeme) | mevcut | P0 | **Pro** |
| | `social-link` (Instagram portföy) | mevcut | P0 | Free |
| **Yeni bloklar** | Pricing (ürün fiyat listesi) | mevcut | P0 | Free |
| | Testimonials (müşteri yorumları) | mevcut | P0 | Free |
| | Services (özel tasarım, toplu sipariş) | mevcut | P1 | Free |
| | Process (sipariş-ten-teslimata süreç) | mevcut | P0 | Free |
| | Downloads (ürün kataloğu PDF) | `downloads` | P1 | Free |
| **Yeni integration** | `review-platform` | yeni | P1 | Free |
| | `menu-digital` (fiyat listesi/ürün kataloğu) | mevcut | P1 | Free |
| **Pro killer** | Komisyonsuz satış sayfası (ödeme linki) | mevcut | P0 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.11 MALİ MÜŞAVİR / MUHASEBECİ 📊

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Contact, Cta, Footer | mevcut | P0 | Free |
| | Credentials (ruhsat, oda kaydı) | mevcut | P0 | Free |
| | `whatsapp-order`, `social-link` (LinkedIn) | mevcut | P0 | Free |
| | `video-consult` (online danışma) | mevcut | P1 | Free |
| **Yeni bloklar** | Pricing (aylık muhasebe paket fiyatları) | mevcut | P0 | Free |
| | Process (mükellef onboarding süreci) | mevcut | P0 | Free |
| | Faq (vergi, muhasebe SSS) | mevcut | P0 | Free |
| | Testimonials (mükellef referansları) | mevcut | P1 | Free |
| | Downloads (vergi takvimi, form örnekleri) | `downloads` | P0 | Free |
| | Stats (kaç mükellef, kaç yıllık tecrübe) | mevcut | P1 | Free |
| **Yeni integration** | `booking-external` (randevu) | mevcut | P0 | Free |
| | `review-platform` | yeni | P1 | Free |
| **Pro killer** | Mükellef portalı / belge yükleme sayfası | sistem | P2 | **Pro exclusive** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.12 MİMAR / İÇ MİMAR 🏛️

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Contact, Cta, Footer | mevcut | P0 | Free |
| | Gallery (proje fotoğrafları) | mevcut | P0 | Free |
| | `social-link` (Instagram, LinkedIn, Pinterest) | mevcut | P0 | Free |
| **Yeni bloklar** | Projects (portföy — tamamlanan projeler) | `projects` | **P0** | Free |
| | Process (tasarım süreci adımları) | mevcut | P0 | Free |
| | Testimonials (müşteri referansları) | mevcut | P0 | Free |
| | Pricing (proje tipi başına metrekare fiyatı) | mevcut | P1 | Free |
| | Credentials (oda kaydı, ödüller, yarışmalar) | mevcut | P1 | Free |
| | Clients (çalışılan markalar) | mevcut | P1 | Free |
| | Team (ekip) | mevcut | P1 | Free |
| | Case Studies (detaylı proje anlatımı) | `case-studies` | P0 | Free |
| | Downloads (proje kataloğu PDF) | `downloads` | P1 | Free |
| | Stats (tamamlanan proje, m², mutlu müşteri) | mevcut | P1 | Free |
| **Yeni integration** | `portfolio-gallery` (Behance, ArchDaily) | yeni | P1 | Free |
| | `booking-external` (keşif randevusu) | mevcut | P0 | Free |
| | `review-platform` | yeni | P1 | Free |
| | `video-consult` (online proje görüşmesi) | mevcut | P1 | Free |
| **Pro killer** | 360° sanal tur embed (Matterport linki) | sistem | P1 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.13 YAZILIMCI / TEKNOLOJİ DANIŞMANI 💻

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Contact, Cta, Footer | mevcut | P0 | Free |
| | `social-link` (GitHub, LinkedIn, Twitter) | mevcut | P0 | Free |
| | Blog (teknik yazılar) | mevcut | P0 | Free |
| | Video (eğitim içerikleri) | mevcut | P1 | Free |
| **Yeni bloklar** | Projects (portföy — GitHub repoları, projeler) | `projects` | **P0** | Free |
| | Pricing (freelance paket / saatlik ücret) | mevcut | P0 | Free |
| | Testimonials (müşteri/ekip arkadaşı referansları) | mevcut | P1 | Free |
| | Services (uzmanlık: backend, frontend, DevOps) | mevcut | P0 | Free |
| | Clients (çalışılan şirketler) | mevcut | P1 | Free |
| | Credentials (sertifikalar, eğitimler) | mevcut | P1 | Free |
| | Downloads (CV, technical spec PDF) | `downloads` | P1 | Free |
| | Stats (commit sayısı, yıldız, katkı) | mevcut | P2 | Free |
| | Case Studies (başarılı proje detayları) | `case-studies` | P1 | Free |
| | Process (işe alım/onboarding süreci) | mevcut | P1 | Free |
| **Yeni integration** | `open-science` (GitHub, GitLab, OSF) | yeni | P0 | Free |
| | `booking-external` (keşif görüşmesi) | mevcut | P0 | Free |
| | `video-consult` (online toplantı) | mevcut | P1 | Free |
| | `payment-link` (proje ödemesi) | mevcut | P0 | **Pro** |
| | `donation` (GitHub Sponsors) | yeni | P1 | Free |
| **Pro killer** | Canlı GitHub contribution graph embed | sistem | P2 | **Pro** |
| | Proje timeline/sürüm geçmişi sayfası | sistem | P2 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.14 ÖZEL EĞİTİMCİ / DİL OKULU 📚

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Contact, Cta, Footer | mevcut | P0 | Free |
| | `booking-external` (ders randevusu) | mevcut | P0 | Free |
| | `video-consult` (online ders) | mevcut | P0 | Free |
| | `social-link` (Instagram, YouTube) | mevcut | P1 | Free |
| **Yeni bloklar** | Courses (ders programı, seviyeler) | `courses` | **P0** | Free |
| | Pricing (kurs paket fiyatları) | mevcut | P0 | Free |
| | Testimonials (öğrenci/veli yorumları) | mevcut | P0 | Free |
| | Credentials (sertifikalar, akreditasyonlar) | mevcut | P0 | Free |
| | Team (eğitmen kadrosu) | mevcut | P1 | Free |
| | Downloads (ders materyalleri, kaynak listesi) | `downloads` | P0 | Free |
| | Process (öğrenme metodolojisi) | mevcut | P1 | Free |
| | Faq (sık sorulan sorular) | mevcut | P0 | Free |
| | Stats (mezun sayısı, başarı oranı) | mevcut | P1 | Free |
| | Gallery (sınıf/etkinlik fotoğrafları) | mevcut | P1 | Free |
| **Yeni integration** | `review-platform` | yeni | P0 | Free |
| | `payment-link` (kurs ücreti) | mevcut | P1 | **Pro** |
| **Pro killer** | Öğrenci girişi / ders takip portalı | sistem | P2 | **Pro exclusive** |
| | Online sınav/test modülü | sistem | P2 | **Pro exclusive** |
| | Sertifika PDF üretici | sistem | P2 | **Pro exclusive** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.15 RESTORAN / KAFE 🍽️

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Gallery (yemek fotoğrafları), Contact, Cta, Footer | mevcut | P0 | Free |
| | `menu-digital` (dijital menü linki) | mevcut | P0 | Free |
| | `social-link` (Instagram, TikTok) | mevcut | P0 | Free |
| | `whatsapp-order` (paket servis siparişi) | mevcut | P0 | Free |
| **Yeni bloklar** | Services (özel etkinlik, catering, reservation) | mevcut | P0 | Free |
| | Testimonials (müşteri yorumları) | mevcut | P0 | Free |
| | Stats (kaç yıllık, kaç kişilik kapasite) | mevcut | P1 | Free |
| | Team (şef/mutfak ekibi) | mevcut | P1 | Free |
| | Faq (sık sorular) | mevcut | P0 | Free |
| | Process (catering/rezerasyon süreci) | mevcut | P1 | Free |
| **Yeni integration** | `review-platform` (Google Maps, Tripadvisor, Yelp) | yeni | **P0** | Free |
| | `booking-external` (masa rezervasyonu) | mevcut | P0 | Free |
| **Pro killer** | Google Maps entegrasyonu | sistem | P1 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.16 E-TİCARET / DÜKKAN 🛍️

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, Gallery (ürün fotoğrafları), Contact, Cta, Footer | mevcut | P0 | Free |
| | `payment-link` (ödeme) | mevcut | P0 | **Pro** |
| | `whatsapp-order` (sipariş) | mevcut | P0 | Free |
| | `social-link` | mevcut | P0 | Free |
| **Yeni bloklar** | Pricing (ürün fiyat listesi) | mevcut | P0 | Free |
| | Services (kargo, iade, garanti) | mevcut | P0 | Free |
| | Testimonials (müşteri yorumları) | mevcut | P0 | Free |
| | Faq | mevcut | P0 | Free |
| | Stats (sipariş sayısı, mutlu müşteri) | mevcut | P1 | Free |
| | Process (sipariş akışı) | mevcut | P1 | Free |
| **Yeni integration** | `review-platform` | yeni | P0 | Free |
| | `menu-digital` (katalog) | mevcut | P1 | Free |
| **Pro killer** | Ürün sayfası SEO optimizasyonu | sistem | P1 | **Pro** |
| | Çok dilli site | mevcut | P1 | **Pro** |
| | Custom domain | mevcut | P1 | **Pro** |

---

### 4.17 FOTOĞRAFÇI / VİDEOGRAF 📸

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, Gallery (portföy), Contact, Cta, Footer | mevcut | P0 | Free |
| | `social-link` (Instagram, Vimeo, YouTube) | mevcut | P0 | Free |
| | Video (showreel) | mevcut | P0 | Free |
| **Yeni bloklar** | Services (düğün, kurumsal, portre, ürün) | mevcut | P0 | Free |
| | Pricing (paket fiyatları) | mevcut | P0 | Free |
| | Testimonials (müşteri yorumları) | mevcut | P0 | Free |
| | Process (çekim-teslim süreci) | mevcut | P0 | Free |
| | About (ekipman, yaklaşım) | mevcut | P0 | Free |
| | Projects (proje bazlı portföy) | `projects` | P1 | Free |
| | Clients (çalışılan markalar) | mevcut | P1 | Free |
| | Case Studies (düğün hikayesi, kampanya) | `case-studies` | P1 | Free |
| **Yeni integration** | `portfolio-gallery` (Behance, 500px, Flickr) | yeni | P1 | Free |
| | `booking-external` (keşif görüşmesi) | mevcut | P0 | Free |
| | `payment-link` (ön ödeme) | mevcut | P1 | **Pro** |
| | `review-platform` | yeni | P1 | Free |
| **Pro killer** | Watermark'lı / şifreli galeri | sistem | P2 | **Pro exclusive** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

### 4.18 KOÇ / DANIŞMAN 🎯

| Katman | Özellik | Tip | Öncelik | Pro Gate |
|--------|---------|-----|---------|----------|
| **Mevcut** | Hero, About, Services, Contact, Cta, Footer | mevcut | P0 | Free |
| | `booking-external` (keşif görüşmesi) | mevcut | P0 | Free |
| | `video-consult` (online koçluk) | mevcut | P0 | Free |
| | `social-link` (LinkedIn, Instagram) | mevcut | P1 | Free |
| **Yeni bloklar** | Pricing (koçluk paketleri) | mevcut | P0 | Free |
| | Testimonials (danışan başarı hikayeleri) | mevcut | P0 | Free |
| | Process (koçluk metodolojisi) | mevcut | P0 | Free |
| | Credentials (akreditasyon, ICF) | mevcut | P0 | Free |
| | Faq | mevcut | P0 | Free |
| | Case Studies (başarı hikayeleri, anonim) | `case-studies` | P1 | Free |
| | Downloads (çalışma kağıtları, değerlendirme formları) | `downloads` | P1 | Free |
| | Blog (düşünce yazıları) | mevcut | P1 | Free |
| | Media Appearances (podcast, TV) | `media-appearances` | P2 | Free |
| **Yeni integration** | `payment-link` | mevcut | P0 | **Pro** |
| | `review-platform` | yeni | P1 | Free |
| **Pro killer** | Danışan portalı / ilerleme takip paneli | sistem | P2 | **Pro exclusive** |
| | Çok dilli site | mevcut | P1 | **Pro** |

---

## 5. Ortak Altyapı İhtiyaçları

Tüm meslek gruplarında kullanılacak, meslek bağımsız sistem özellikleri:

| Altyapı Özelliği | Açıklama | Öncelik | Durum |
|------------------|----------|---------|-------|
| `siteQualityCheck` genişletme | Yayın listesi boş, placeholder copy, kırık medya, eksik CTA | P0 | Kısmi (Faz 3) |
| PDF CV üretici | Yapısal veriden PDF (TR/EN, format seçenekli) | P0 | ⚠️ Yeni |
| Çok dilli AI translate | Bir dilde gir, diğer dillere AI çevirisi | P1 | ⚠️ Kısmi |
| Varyant galerisi | Her blok için 2+ varyant (grid/carousel/list/timeline) | P1 | Devam ediyor |
| Tema/preset çeşitliliği | Meslek başına özel renk paleti + tipografi preset'i | P1 | Devam ediyor |
| Medya kütüphanesi | R2 üzerinde tam medya manager (thumbnail, sil, değiştir) | P1 | Faz 4 |
| Analytics dashboard | Trafik, tıklama, dönüşüm (aggregate, GDPR uyumlu) | P2 | Faz 6 |
| Onboarding sihirbazı | Meslek bazlı sorular → otomatik kit seçimi | P1 | Mevcut (geliştirilebilir) |
| Chat-first editing | "Yayınlarımı güncelle", "Ders ekle" gibi komutlar | P2 | V2.2'de |

---

## 6. Önceliklendirme Matrisi

Meslek gruplarının etki (kullanıcı büyüklüğü × Pro potansiyeli), efor ve stratejik uyuma göre sıralaması:

| # | Meslek Grubu | Etki | Efor | Stratejik Uyum | Pro Potansiyeli | Öncelik |
|---|-------------|------|------|----------------|-----------------|---------|
| 1 | **Akademisyen** | 🔴 Yüksek | 🟡 Orta | 🔴 Yüksek (.edu.tr, güven) | 🔴 Yüksek (CV, Scholar) | **P0** |
| 2 | **Avukat** | 🟡 Orta | 🟢 Düşük (kit var) | 🔴 Yüksek (güven, domain) | 🟡 Orta | **P0** |
| 3 | **Psikolog** | 🟡 Orta | 🟢 Düşük (seed var) | 🔴 Yüksek (sağlık) | 🟡 Orta | **P0** |
| 4 | **İnfluencer** | 🔴 Yüksek | 🟢 Düşük | 🟡 Orta | 🟡 Orta | **P1** |
| 5 | **Mimar** | 🟡 Orta | 🟡 Orta | 🟡 Orta | 🔴 Yüksek (portföy) | **P1** |
| 6 | **Yazılımcı** | 🟢 Düşük | 🟢 Düşük | 🟡 Orta | 🟢 Düşük | **P1** |
| 7 | **Emlak Danışmanı** | 🟡 Orta | 🟢 Düşük (kit var) | 🟡 Orta | 🟡 Orta | **P1** |
| 8 | **Özel Eğitimci** | 🟡 Orta | 🟡 Orta | 🟡 Orta | 🔴 Yüksek | **P1** |
| 9 | **Diyetisyen** | 🟡 Orta | 🟢 Düşük (kit var) | 🟡 Orta | 🟡 Orta | **P2** |
| 10 | **Fizyoterapist** | 🟡 Orta | 🟢 Düşük (kit var) | 🟡 Orta | 🟡 Orta | **P2** |
| 11 | **Diş Hekimi** | 🟡 Orta | 🟢 Düşük (kit var) | 🟡 Orta | 🟡 Orta | **P2** |
| 12 | **Koç / Danışman** | 🟡 Orta | 🟡 Orta | 🟡 Orta | 🟡 Orta | **P2** |
| 13 | **El İşi / Butik** | 🟢 Düşük | 🟢 Düşük | 🟢 Düşük | 🟢 Düşük | **P2** |
| 14 | **Mali Müşavir** | 🟢 Düşük | 🟡 Orta | 🟢 Düşük | 🟡 Orta | **P2** |
| 15 | **Güzellik Salonu** | 🟡 Orta | 🟢 Düşük (kit var) | 🟢 Düşük | 🟢 Düşük | **P3** |
| 16 | **Restoran / Kafe** | 🟢 Düşük | 🟡 Orta | 🟢 Düşük | 🟢 Düşük | **P3** |
| 17 | **E-ticaret** | 🟢 Düşük | 🟡 Orta | 🟢 Düşük | 🟡 Orta | **P3** |
| 18 | **Fotoğrafçı** | 🟢 Düşük | 🟡 Orta | 🟢 Düşük | 🟢 Düşük | **P3** |

---

## 7. Uygulama Yol Haritası

### Sprint 1: Akademisyen MVP (P0)
```
HEDEF: Akademisyen kiti + yayın bloğu → ilk akademisyen kullanıcıya demo

1. Yeni integration tipleri: academic-profile, open-science
2. Yeni blok: Publications (schema + component + registry + AI prompt)
3. Yeni blok: Courses
4. Yeni blok: Projects
5. Kit: academic-professor (mevcut ProfKitConfig yapısında)
6. Seed site: örnek akademisyen sitesi
7. siteQualityCheck: yayın listesi boş warning
8. Onboarding: akademisyen soruları
```

### Sprint 2: Akademisyen Pro Features (P0-P1)
```
1. PDF CV üretici (site JSON → PDF, TR/EN, kısa/uzun)
2. Google Scholar import flow
3. Yeni blok: AcademicService, Downloads, MediaAppearances
4. Pro gating: PDF CV, Scholar import → Pro
```

### Sprint 3: Avukat + Psikolog Derinleştirme (P0-P1)
```
1. Yeni bloklar: CaseStudies (avukat + psikolog)
2. Downloads mevcut law/psych kit'lerine ekle
3. Publications avukat kit'ine ekle
4. integration: review-platform, akademik profil bağlantıları
```

### Sprint 4: Görsel Meslekler (P1)
```
1. Mimar kiti + projects/case-studies varyantı (görsel ağırlıklı)
2. İnfluencer kiti + link-in-bio layout
3. Yazılımcı kiti + GitHub entegrasyonu
4. Emlak kit'ine projects (portföy) blogu ekle
```

### Sprint 5+: Uzun Kuyruk Meslekler (P2-P3)
```
1. Özel eğitimci, koç, mali müşavir kitleri
2. Restoran, e-ticaret, fotoğrafçı kitleri
3. Tüm mesleklere siteQualityCheck + onboarding tamamlama
```

---

## 8. Anayasa Uyumluluk Kontrolü

Tüm öneriler aşağıdaki anayasa prensiplerine uygun olarak tasarlanmıştır:

- ✅ **Tek kontrat (§1):** Tüm yeni bloklar Zod `siteSchema` içinde tanımlanır
- ✅ **AI schema doldurur (§2):** AI yalnızca Zod-valid veri üretir; render edilemez çıktı yok
- ✅ **Kontrollü bileşen sistemi (§3):** Yeni bloklar registry pattern ile eklenir; plugin sistemi değil
- ✅ **Integration'lar controlled vocabulary:** Yeni integration tipleri sabit bir sözlükten gelir
- ✅ **Pro gating ödeme sonrası (§5):** Domain/ödeme hep controlled akışta
- ✅ **Per-tenant kod yok:** Hiçbir meslek grubu için özel HTML/CSS/JS önerilmez

---

## 9. Açık Kararlar

- [ ] Akademisyen kiti ilk hangi üniversite/ünvan grubuyla test edilecek?
- [ ] PDF CV üretici için hangi kütüphane kullanılacak? (puppeteer, jsPDF, react-pdf?)
- [ ] Google Scholar scraping legal/rate-limit açısından değerlendirilecek mi?
- [ ] `review-platform` integration'ı her meslek için ayrı domain seti mi, tek mi?
- [ ] İnfluencer link-in-bio sayfası mevcut page yapısına uygun mu, yoksa ayrı layout mu?
- [ ] Meslek başına AI prompt tuning ayrı mı yapılacak, yoksa generic prompt + meslek context'i yeterli mi?

---

## 10. Analiz: Dokümanın güçlendirilmesi gereken yönleri

### 10.1 Blok kataloğu hizmet sonucunun önüne geçmiş

Mevcut matris “hangi meslek hangi bloğu kullanır?” sorusunu iyi cevaplıyor; ancak ürünün asıl
değeri blok sayısı değil, meslek sahibinin aldığı sonucu üretmek:

| Meslek ailesi | Birincil iş sonucu | Birincil CTA | Güven kanıtı | İkinci adım |
|---|---|---|---|---|
| Sağlık / bakım | Uygun randevu talebi | Randevu al | uzmanlık, süreç, açıklayıcı içerik | form veya video görüşme |
| Hukuk / finans | Nitelikli ön görüşme | Ön görüşme talep et | alanlar, ruhsat/oda, çalışma süreci | güvenli iletişim / belge talebi |
| Akademik / uzmanlık | Profil, yayın veya konuşma talebi | CV’yi incele / iletişime geç | yayınlar, projeler, kurumlar | PDF CV veya e-posta |
| Görsel portföy | Portföy inceleme ve teklif | Projeleri incele | proje hikâyeleri, görseller, müşteriler | keşif görüşmesi |
| Yerel hizmet / salon | Rezervasyon veya sipariş | Randevu al / WhatsApp’tan yaz | fiyat, çalışma saatleri, yorumlar | ödeme veya konum |
| Eğitim / koçluk | Tanışma görüşmesi veya kayıt | Görüşme planla | metodoloji, sonuç çerçevesi, program | ödeme / materyal |
| Ürün / butik | Ürün keşfi ve satın alma | Sipariş ver | ürün, teslimat, iade, müşteri kanıtı | ödeme bağlantısı |

Her kit için blok listesine ek olarak şu dört alan tanımlanmalı:

1. `primaryOutcome`: sitenin üretmeye çalıştığı tek ana sonuç.
2. `primaryCta`: ana aksiyon ve fallback aksiyonu.
3. `trustEvidence`: bu meslekte güveni oluşturan kanıt türleri.
4. `conversionEvent`: analytics’te ölçülecek aggregate olay.

Bu alanlar AI prompt’unu, kalite kapısını, onboarding sorularını ve dashboard metriklerini aynı
ürün kararına bağlar.

### 10.2 On sekiz meslek aynı anda ürünleştirilmemeli

18 kit, henüz doğrulanmamış çok sayıda içerik, hukuki risk ve bakım maliyeti yaratıyor. İlk
uygulama sırası blok sayısına göre değil, tekrar kullanılabilir yetenek ve doğrulanabilir satış
sonucuna göre seçilmeli:

**Dalga A — doğrulama çekirdeği:**

- Avukat: güven + ön görüşme + süreç anlatımı.
- Psikolog veya diş kliniği: randevu + güvenli, temkinli sağlık içeriği.
- Mimar veya yazılımcı: portföy + proje hikâyesi + keşif görüşmesi.

Bu üç grup; `credentials`, `process`, `booking`, `case-studies/projects`, `contact`, `gallery`,
`video` ve quality gate’in büyük kısmını birlikte doğrular.

**Dalga B — aynı çekirdeği kullananlar:** akademisyen, diyetisyen, fizyoterapist, koç, özel
eğitimci, emlak danışmanı.

**Dalga C — operasyon/işlem riski yüksek gruplar:** restoran, e-ticaret, belge/öğrenci portalı,
danışan takip sistemi ve gerçek ödeme/rezervasyon gerektiren ürünler.

Akademisyen dokümanda stratejik olarak güçlü görünse de Scholar import, CV formatları ve akademik
veri kaynakları ayrı risk taşır. Bu nedenle akademisyen kiti “manuel yayın/proje girişi” ile
başlamalı; otomatik import ilk MVP kabul kriteri olmamalı.

### 10.3 Yeni blokların bir kısmı ayrı tip değil, ortak içerik modeli olmalı

`publications`, `courses`, `projects`, `downloads`, `media-appearances`, `positions` ve
`case-studies` için yedi ayrı renderer üretmek ilk aşamada gereksiz tekrar yaratabilir. Önce ortak
alanları belirlemek daha sürdürülebilir:

- `title`, `summary`, `url`, `image/mediaRef`, `date/year`, `tags/category`
- isteğe bağlı `organization`, `role`, `status`, `location`
- locale başına içerik ve boş durum mesajı
- güvenli dış link doğrulaması

İlk uygulamada üç kontrollü sunum biçimi yeterli olabilir:

1. **Portfolio collection:** projects, case studies, gallery-heavy işler.
2. **Resource collection:** publications, downloads, media appearances.
3. **Structured list:** courses, positions, academic service.

Ürün dili meslek bazlı kalabilir; schema ve renderer ortak kalır. Böylece yeni meslek eklemek yeni
bir block type değil, kit konfigürasyonu ve içerik şablonu olur. Ayrı block type ancak farklı
erişilebilirlik, layout veya etkileşim davranışı gerçekten gerekiyorsa açılmalı.

### 10.4 Pro özelliği “özellik var/yok” değil, “manuel → otomatik → ölçümlü” ekseninde kurulmalı

Dokümandaki bazı Pro killer’lar henüz ürün kapsamını aşan portal veya SaaS modülleri. Daha güvenli
katmanlama:

| Seviye | Değer | Örnek |
|---|---|---|
| Free | Yapısal sunum | manuel yayın, proje, hizmet, fiyat ve iletişim blokları |
| Pro | İş akışı hızlandırma | PDF export, gelişmiş medya, çoklu dil, özel domain, daha yüksek AI kotası |
| Premium / sonraki ürün | Harici veri veya kullanıcı hesabı | import, portal, canlı metrik, ödeme/rezervasyon otomasyonu |

İlk Pro ürünleri mevcut altyapıya yakın tutulmalı: PDF CV/portfolio export, gelişmiş medya
kütüphanesi, özel domain, daha iyi AI kredisi, form/CTA analytics ve hazır meslek şablonları.
“Danışan portalı”, “öğrenci girişi”, “online test” ve “mükellef belge portalı” ayrı bir güvenlik ve
veri ürünü olarak roadmap’e taşınmalı; basit bir Pro toggle olarak sunulmamalı.

### 10.5 Sağlık, hukuk ve finans için içerik değil, güvenlik sınırı tanımlanmalı

`case-studies`, testimonials, before/after, sonuç oranı, tedavi paketi, hukuki başarı ve finansal
tasarruf iddiaları kalite kapısında yalnızca placeholder kontrolüyle bırakılamaz. Her kit için:

- garanti, kesin sonuç, teşhis ve kişiye özel tedavi/uygulama iddiası blocker veya warning olarak
  sınıflandırılmalı;
- sağlık alanında hassas form/ölçek/semptom verisi toplanmamalı; iletişim formu yalnızca ilk temas
  düzeyinde kalmalı;
- hukukta vaka anlatımı anonim, izinsiz müvekkil verisi içermeyen ve sonuç garantisi vermeyen
  şablonla başlamalı;
- yorum, referans ve logo için owner confirmation / kaynak alanı bulunmalı;
- before/after görselleri için açık rıza, alt metin ve kaldırma akışı gerekmeli;
- her riskli kit, yayın öncesi owner review uyarısı ve uygun disclaimer üretmeli.

Bu sınırlar `siteQualityCheck` içinde ortak kurallar ve kit başına risk profili olarak modellenmeli;
AI prompt’una bırakılmamalı.

### 10.6 Entegrasyon listesi veri sözlüğü ve yetki modeli istiyor

Yeni integration önerileri yararlı ancak bazıları “link” ile “harici veri/otomasyon”u aynı sepete
koyuyor. Her entegrasyon için aşağıdaki sözleşme eklenmeli:

- `type`, `allowedHosts`, `requiredFields`, `planGate`, `riskClass`, `renderTarget`;
- link-out mu, embed mi, veri importu mu olduğu;
- provider kesintisinde fallback davranışı;
- owner’ın değiştirebildiği alanlar ve AI’ın dokunamayacağı alanlar;
- analytics event’i ve consent gereksinimi.

Özellikle Google Scholar scraping yerine owner’ın verdiği ORCID bağlantısı, ORCID public API,
OpenAlex/Crossref veya manuel BibTeX yükleme sıralanmalı. Scholar otomasyonu rate-limit, kullanım
şartları ve veri doğruluğu nedeniyle ilk Pro kabul kriteri olmamalı.

`review-platform` için doğrudan yorumları çekmek yerine güvenli ilk sürüm, doğrulanmış platforma
link verme ve owner-entered quote alanıdır. `donation` de gerçek ödeme entegrasyonu değil, allowlist
edilmiş dış link olarak tanımlanmalı.

### 10.7 Onboarding meslek adından hizmet modeline geçmeli

Meslek seçimi tek başına yeterli kişiselleştirme sağlamaz. Adaptive onboarding şu sırayla daha iyi
sonuç verir:

1. Meslek / meslek ailesi.
2. Ana hizmet veya teklif türü.
3. Ana hedef kitle.
4. Ana dönüşüm: randevu, ön görüşme, teklif, sipariş, başvuru veya portföy.
5. Güven kanıtı: sertifika, yayın, proje, yorum, kurum, süreç.
6. İletişim ve uygun entegrasyon.
7. İsteğe bağlı içerik: yayın, proje, fiyat, materyal.

Sorular kit konfigürasyonundan üretilmeli; her kullanıcıya tüm meslek soruları gösterilmemeli.
Onboarding sonunda yalnızca kit değil, `primaryOutcome` ve `primaryCta` da taslağa yazılmalı.

### 10.8 Eksik ortak yetenekler

Meslek setlerini gerçekten kullanılabilir kılmak için aşağıdaki yatay yetenekler yeni bloklardan önce
önceliklenmeli:

| Yetenek | Neden ortak? | Önerilen ilk sürüm |
|---|---|---|
| İçerik koleksiyonu | yayın/proje/indirilebilir içerik tekrar ediyor | manuel CRUD + locale + boş durum |
| Görsel medya referansı | portföy, klinik, salon, emlak ortak ihtiyacı | medya seçici + alt metin + kullanım uyarısı |
| CTA hedefi | her kitin dönüşümü farklı | primary CTA + fallback contact/booking |
| Güven kanıtı | credentials, clients, reviews tekrar ediyor | kaynaklı, owner-confirmed proof item |
| PDF/export | CV, portfolio, brochure, media kit ortak | Site JSON’dan deterministic export |
| Form/lead yönlendirme | contact, booking, inquiry ortak | kayıt + email + aggregate event + rate limit |
| Kit kalite profili | sağlık/hukuk/finans riskleri farklı | blocker/warning/disclaimer policy |
| Plan entitlement | Pro listeleri tutarsızlaşabilir | server tek kaynak; UI yalnızca yansıtır |

### 10.9 Her kit için kabul kriteri eklenmeli

Yeni bir meslek “kit eklendi” sayılmadan önce:

- schema-valid fixture ve üç locale;
- yalnızca registry’deki block ve integration’lar;
- bir net primary CTA ve fallback contact path;
- mobile/desktop overflow ve erişilebilirlik kontrolü;
- placeholder, eksik alt metin, kırık medya ve duplicate section kontrolü;
- mesleğe uygun risk profili ve disclaimer;
- boş koleksiyon için render edilebilir empty state;
- en az bir gerçekçi onboarding → preview → publish fixture’i;
- analytics’te en az bir aggregate conversion event’i;
- Free/Pro/Premium entitlement’larının server testleri.

Böylece meslek setleri yalnızca pazarlama tablosu değil, tekrar edilebilir ürün teslim sözleşmesi
haline gelir.

## 11. Önerilen revize yol haritası

Mevcut Sprint 1–5 planı şu sırayla daha düşük riskli ve daha hızlı doğrulanabilir hale getirilmeli:

### Sprint A — Service conversion foundation (P0)

1. `primaryOutcome`, `primaryCta`, `trustEvidence`, `conversionEvent` kit sözleşmesini ekle.
2. Adaptive onboarding sorularını kit konfigürasyonundan üret.
3. CTA, contact, booking, form kayıtları ve aggregate analytics akışını ortaklaştır.
4. Sağlık/hukuk/finans risk profillerini `siteQualityCheck`e bağla.
5. Üç çekirdek kitte browser acceptance test çalıştır: avukat, psikolog/klinik, mimar/yazılımcı.

### Sprint B — Reusable content collections (P0/P1)

1. Portfolio, Resource ve Structured List içerik modellerinden ilk ikisini uygula.
2. İlk kullanım alanları: emlak/mimar projeleri, akademisyen yayınları, uzman PDF kaynakları.
3. Medya referansı, alt metin, kaynak/owner confirmation ve empty state ekle.
4. AI için `add_item`, `update_item`, `remove_item` işlemlerini dar ve schema-valid tut.

### Sprint C — Pro value proof (P1)

1. Deterministic PDF CV/portfolio/media-kit export.
2. Gelişmiş medya manager ve plan bazlı quota görünürlüğü.
3. Çok dilli içerik gözden geçirme ve translation diff akışı.
4. Özel domain ve mevcut AI quota değerini tek plan matrisiyle göster.

### Sprint D — Trust and acquisition integrations (P1)

1. `review-platform`ı link-out + owner-entered proof olarak başlat.
2. `academic-profile`ı ORCID/owner URL ile başlat; scraping yapma.
3. `open-science` ve `portfolio-gallery`yi allowlist edilmiş link entegrasyonu olarak ekle.
4. Her integration için risk, consent, fallback ve analytics sözleşmesini tamamla.

### Sprint E — Harici veri ve portal ürünleri (P2)

Scholar import, canlı metrikler, online formlar, öğrenci/danışan/mükellef portalları, ödeme ve
rezervasyon otomasyonu ancak kullanıcı görüşmeleri, veri politikası, izolasyon, retention, audit ve
incident planı hazır olduğunda ele alınmalı.

## 12. Brainstorming için karar soruları

1. İlk 90 günde hangi üç meslek grubunda gerçekten kullanıcı görüşmesi ve ödeme sinyali var?
2. Ürünün ana vaadi “mesleğe özel site” mi, yoksa “meslek sahibinin daha fazla nitelikli talep alması” mı?
3. Her kit için primary conversion event hangisi ve başarı eşiği nedir?
4. Free planda hangi manuel içerik miktarı kullanıcıyı değere ulaştırır; hangi otomasyon Pro’ya bırakılır?
5. Sağlık/hukuk içerikleri için hangi iddialar otomatik blocker, hangileri owner review warning olacak?
6. İlk ortak koleksiyon modeli portfolio mu, resource list mi, yoksa her ikisi mi?
7. Harici veri importu için hangi kaynakların API/izin/retention koşulları kabul edilebilir?
8. Hangi özellik gerçek SaaS modülü, hangisi yalnızca dış link veya statik içerik olmalı?
9. Kit ekleme hızını ölçmek için “yeni meslek → schema fixture → quality fixture → browser smoke” süresi kaç gün olmalı?
10. Her meslek için ayrı ürün mü tasarlıyoruz, yoksa ortak dönüşüm motorunun farklı içerik paketlerini mi sunuyoruz?

**Analiz sonucu:** İlk yatırım yeni blok sayısını artırmaya değil, ortak dönüşüm motoru + içerik
koleksiyonları + risk profilleri + deterministic export üzerine yapılmalı. Bu temel kurulduktan sonra
meslek eklemek daha ucuz, kaliteyi korumak daha kolay ve Pro değerini açıklamak daha mümkün olur.

## 13. Uygulama durumu

İlk uygulanabilir dilim workspace'e alındı:

- Kit stratejisi ve meslek bazlı risk profili metadata'sı.
- Sağlık/hukuk quality warning kontrolleri.
- Onboarding yanıtlarından primary outcome/CTA/trust evidence türetimi.
- Projeler, yayınlar, kurslar, kaynaklar ve medya görünümleri için kontrollü `collection` bloğu.

İleri sprintler (owner-entered proof ekranları, PDF/export değer katmanı, allowlist entegrasyonları ve
P2 portal/import özellikleri) bu temel üzerine ayrı uygulama dilimleri olarak devam etmelidir.

## 14. Dış servis ve token politikası

İlk ürün sürümünde yeni provider hesabı, API key, OAuth uygulaması veya müşteri tarafında teknik
kayıt gerektiren entegrasyon eklenmeyecektir. Mevcut kapsam bilinçli olarak şu sınırda tutulur:

- Manuel içerik ve public link-out entegrasyonları kullanılabilir.
- R2, mevcut medya akışı için kullanılabilir; yeni dosya sağlayıcısı açılmaz.
- Pro JSON export ve anonim analytics export mevcut altyapıyla yeterlidir.
- Scholar/GitHub canlı importu, h-index/contribution metrikleri, portal, online test, sağlık verisi,
  belge akışı ve sertifika PDF'i müşteri talebi oluşmadıkça backlog'da tutulur.
- Bir müşteri bu özelliklerden birini talep ederse önce talep, sağlayıcı maliyeti, veri politikası ve
  beklenen kullanım doğrulanır; ancak sonra ayrı bir feature spec ve gerekiyorsa token/hesap açılır.

Bu politika ürün planını gereksiz entegrasyonlarla şişirmemeyi, bakım maliyetini ve kullanılmayan
secret yüzeyini düşük tutmayı amaçlar.
