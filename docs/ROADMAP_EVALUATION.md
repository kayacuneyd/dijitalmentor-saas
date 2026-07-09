# Roadmap Evaluation — saaskaya

> **Tarih:** 2026-07-08 · **Durum:** değerlendirme kaydedildi · **Amaç:** projenin nerede olduğunu, en
> kritik boşlukları ve önerilen öncelik sırasını tek bir karar-verilebilir dokümanda toplamak.
>
> Bu doküman `docs/PLAN.md` (M0–M6 + backlog) ve `docs/PRODUCT_VISION_V2.md` (V2.0–V2.6) ile birlikte
> okunur. Mevcut kod durumunu `docs/PROGRESS.md`'den, stratejik boşlukları `idea.md`'den sentezler.

## 1. Neredeyiz — durum özeti

**Teknik core tamam:**

- ✅ **M0–M6 tüm planlanan milestones bitti** — Zod `Site` schema, 9 block + registry, editor (iframe +
  postMessage + autosave), AI loop (generate + translate + chat patch + token counter), auth (magic link
  + DB session), dashboard + publish snapshots, Host routing + locale routes, Stripe + domains + Caddy→nginx
  on-demand TLS, migration runner (versioned/idempotent/resumable), nightly backups + health watchdog,
  cancellation policy (grace window + daily sweep + data export).
- ✅ **V2.0 SaaS UI redesign live** — canvas normalization, warm editorial sistem, paylaşımlı
  `AppCanvasShell`/`PageShell`, tüm route'lar tek görsel çerçevede.
- ✅ **V2.2 Phase 1 — two-layer AI gatekeeper done** — Haiku triage → approval card → risk-routed
  Sonnet/Opus patches, credits (`ai_usage.edit_count`/`generation_count`), `ai_gate_log` telemetry,
  prompt caching, one-click Geri Al.
- ✅ **Beta launch + hybrid onboarding — 3 faz da done** — closed-beta invite gate (`BETA_MODE` +
  `beta_invites` + `/admin/invites`), `EMAIL_PROVIDER` seam (SMTP/Resend/dev), domain reservation →
  bank transfer / Stripe one-time → decoupled idempotent fulfillment (migration v5).
- ✅ **119/119 test** geçiyor, `npm run check/build` temiz, dev preview canlı:
  `https://saaskaya.digitaltamam.com`.

**Yani:** kod olarak ürün "satılabilir" bir noktada. Ama bir **önemli uyarı** var ↓

## 2. En kritik boşluk — "kod hazır ama canlıda hiç uçtan uca koşulmadı"

`docs/PROGRESS.md` tekrar tekrar şu cümleyi taşıyor: **"Live AI smoke still deferred pending
`ANTHROPIC_API_KEY`."** Aynı durum SMTP/Resend, Porkbun ve Stripe için de geçerli:

- **AI generation** hiç gerçek modelle test edilmedi (model id'ler `claude-opus-4-8`, `claude-sonnet-5`,
  `claude-haiku-4-5` skill/memory'den, canlıda verify değil).
- **Magic-link email** hiç gerçek SMTP/Resend ile gönderilmedi.
- **Domain registration** hiç gerçek Porkbun API ile çalışmadı (spec'te "endpoint paths re-verify on
  first live use" deniyor).
- **Stripe webhook** hiç gerçek event ile koşmadı.
- **Bank transfer → operator confirm → fulfillment** akışı hiç gerçek para + gerçek domain ile
  denenmedi.

**Sonuç:** şu an karanlıkta geliştiriyoruz. Gerçek maliyet, gerçek UX sürtüşmesi, gerçek hata
sinyalleri yok. Bu yüzden **ilk ve en kritik adım kod değil, operatör aktivasyonu + uçtan uca canlı
smoke test'tir.** Bundan önce yeni feature eklemek, var olmayan bir ürünü daha da büyütmektir.

## 3. Önerilen öncelik sırası

### Faz 0 — Operatör aktivasyonu + canlı smoke (KOD YOK, sadece config + test) ⚠️ launch blocker

- `/admin/settings`'e gir: `ANTHROPIC_API_KEY`, `GATEKEEPER_MODEL`, `AI_MODEL_LIGHT`, `AI_MODEL`,
  credit limitleri.
- `EMAIL_PROVIDER` + SMTP (Hostinger) veya Resend key → magic link gönder, tıkla, session oluşsun.
- `BETA_MODE` + `/admin/invites` ile 1–3 davetli beta kullanıcısı.
- `PAYMENT_MODE` + `BANK_IBAN` + `DOMAIN_PRICE_*` → bir domain reserve et, havale bildir, operator
  confirm, `fulfillReservation` koşsun (Porkbun key gerekir).
- Stripe: webhook endpoint + `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` → one-time domain checkout.
- **Smoke senaryosu:** davetli kullanıcı → giriş → `/new` describe → AI generate (gerçek Opus) →
  editor → chat patch (gerçek gatekeeper + Sonnet) → publish → subdomain'de canlı → domain reserve →
  öde → fulfill → custom domain canlı.
- Bu koşulmadan V2.1'e geçmemeliyiz.

### Faz 1 — GTM + pricing + yasal (STRATEJİK, doküman ağırlıklı)

`docs/PRODUCT_VISION_V2.md §9`'daki "Immediate Next Decisions" hâlâ cevapsız:

1. **İlk niş** seçimi (law / psych / dental — GTM 1 niş, `idea.md` 6.4).
2. **Pricing table** (Free/Pro/Premium — §6 draft'ı kesinleştir).
3. **Exact Free/Pro/Premium limitleri** (AI credits, pages, media, languages).
4. **Profesyonel içerik disclaimer'ı** (legal/health nişinde zorunlu — `idea.md` 6.3 riski).
5. **Rakip analizi** (Durable.co, 10Web, Hostinger AI Builder — `idea.md` 6.4'te eksik deniyor).
6. **Unit economics tablosu** (domain amortisman + VPS payı + R2 + AI token + Stripe fee vs. gelir —
   `idea.md` 6.4).
7. **Yasal metinler:** KVKK/GDPR uyumu, ToS, Privacy Policy, domain reseller sözleşme şartları
   (`idea.md` 6.6 — beta launch için lazım, şu an yok).

### Faz 2 — V2.1 Rich Tenant Site Engine (ÜRÜN DEĞER ARTIŞI)

"AI WordPress for professionals" positioning'ini haklı çıkaran kısım. Seçilen nişe göre:

- **5 yeni block:** testimonials/reviews, pricing/packages, process/timeline, booking CTA,
  credentials/certifications (nişe göre sırala).
- **Theme engine genişletme:** semantic tokens (primary/secondary ötesi), typography scale presets,
  section spacing density, border/shadow/image-radius, light/dark/soft palettes, controlled animation
  tokens.
- **`siteQualityCheck(site)`** (V2 §7 AI Quality Bar): schema-valid + tüm locale'ler tam + kırık media
  yok + boş/duplike section yok + "Lorem ipsum" yok + profesyonel-risk claim moderasyonu + CTA/contact
  yolu var + mobile overflow yok + kontrast acceptable. Bu, AI çıktısının "satılabilir" olması için
  gate.
- Her yeni block fixture + schema test + AI prompt güncellemesi (`docs/CONVENTIONS.md` "one pattern
  that repeats").

### Faz 3 — V2.2 Phase 2 (gatekeeper monetization)

- `topups` idempotency table + Stripe one-time +€10 top-up.
- Human-help flow (€25/session, email to operator).
- 🟢🟡🔴 budget dot (dashboard + editor toolbar).
- Premium tier (ikinci Stripe price) + plan-tier enforcement `assertWithinQuota()`.
- Auto-approve toggle (low-risk) + response streaming.

### Faz 4 — V2.3 Media Manager + R2

- R2 upload + per-account/site library + validation/thumbnail/size limit.
- Editor/chat'ten section image replace.
- AI "media missing" önerisi + safe stock fallback.
- Plan gate'leri (Free küçük, Pro büyük, Premium en yüksek).

### Faz 5 — V2.4 Billing/Account/Domain Self-Service

- Stripe customer portal + invoice history + cancel/resume + upgrade/downgrade.
- Domain status timeline + provisioning retry + DNS instruction screen + transfer-out/help copy.
- Self-serve account deletion request flow.

### Faz 6 — V2.5 SEO/Analytics

- Per-tenant `sitemap.xml` + `robots.txt` + canonical + OG/Twitter cards.
- Per-page title/description editor (schema'ya `seo` eklenebilir — zaten `siteSettings.seo` var,
  page-level gerekir).
- Basit analytics dashboard + contact conversion events.
- Badge refinement + badge-removal upsell.

### Faz 7 — V2.6 Scale / Multi-Tenant Data Split

- Central PostgreSQL (users/billing/domains/site index) + per-tenant SQLite split (migration runner
  hazır).
- Per-tenant backup/restore.
- Background jobs (provisioning/email/sweeps).
- Admin audit log + restart-survivor rate limits.
- **ÖNEMLİ:** `docs/PROGRESS.md` uyarıyor — dev+prod shared `local.db`. **Beta'ya gerçek kullanıcı
  gelmeden önce** bu split (veya en azından ayrı prod DB) düşünülmeli. Bu yüzden V2.6'yı sona
  bıraktım ama **gerçek beta cohort büyüyünce** öne çekilebilir.

## 4. Riskler & teknik boşluklar

| Risk | Durum | Öneri |
| --- | --- | --- |
| Live AI smoke hiç yapılmadı | ⚠️ Açık | Faz 0 |
| Tek VPS = SPOF | Backup var, DR tam değil | `idea.md` 6.2 — off-site backup (`BACKUP_REMOTE` config'i hazır ama set edilmemiş) |
| Dev+prod shared `local.db` | ⚠️ Beta büyüyünce problem | V2.6 öne çekilebilir |
| 2FA yok | Magic link tek faktör | `idea.md` 6.1 — opsiyonel 2FA sonradan |
| Content moderation/disclaimer yok | Legal/health nişinde ciddi | Faz 1 (yasal) + Faz 2 (`siteQualityCheck`) |
| KVKK/GDPR + ToS + Privacy yok | Beta launch için lazım | Faz 1 |
| CI/CD + staging + rollback yok | `idea.md` 6.2 | Ölçeklendikçe |
| Analytics yok | `idea.md` 6.8 | Faz 6 (GA4/Plausible) |
| Porkbun endpoint paths verify edilmemiş | Spec'te not edilmiş | Faz 0'da ilk canlı kullanımda |
| Wildcard-subdomain TLS backlog | Caddy→nginx geçişinden kaldı | Beta cohort büyüyünce |

## 5. İlk 3 somut adım

1. **Faz 0 — Operatör aktivasyonu + canlı smoke** (kod yok, ~1–2 gün config + test). Bundan sonra ürün
   **gerçekten** çalışıyor olacak ve sonraki her karar gerçek veriye dayanacak.
2. **Faz 1 — GTM nişi + pricing + yasal metinler** (doküman + karar, ~1 hafta). Bu olmadan V2.1'de
   "hangi 5 block" sorusunu cevaplayamayız.
3. **Faz 2 — V2.1 Rich Tenant Site Engine** (kod, ~2–3 hafta part-time). Ürünü "AI WordPress"
   seviyesine taşır.

## 6. Açık kararlar (operatör cevabı bekliyor)

1. **İlk GTM nişi** ne olacak? (law / psych / dental — `idea.md`'de 3 niş preset'i var ama GTM 1 niş).
2. **Operatör aktivasyonu** şu an sizin tarafınızda mı yapılıyor, yoksa bir checklist + smoke test
   script'i hazırlamamı istersiniz?
3. **Pricing** konusunda bir fikir var mı? (Free/Pro/Premium limitleri, aylık fiyat, domain fiyatı).
4. Bu değerlendirme sonrasında **hangi faza** odaklanılsın — Faz 0 (smoke), Faz 1 (strateji/doküman)
   yoksa doğrudan Faz 2 (V2.1 kod) mı?

## 7. İlgili dokümanlar

- `docs/PLAN.md` — M0–M6 milestones + backlog (two-layer gatekeeper, beta launch).
- `docs/PRODUCT_VISION_V2.md` — V2.0–V2.6 roadmap + positioning + pricing draft.
- `docs/PROGRESS.md` — task log + decisions log + error log (canlı smoke deferral burada).
- `docs/CONSTITUTION.md` — non-negotiable principles (§5 domain-after-payment, §2 AI-never-writes-HTML).
- `docs/POLICY.md` — beta access, domain reservation, subscription/cancellation, AI budget, data,
  backup policies.
- `idea.md` — orijinal Türkçe vizyon + 6. bölüm risk analizi (hâlâ geçerli boşluklar).