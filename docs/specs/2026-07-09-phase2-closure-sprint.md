# Phase 2 Closure Sprint — Guided First-Run Experience

> Tarih: 2026-07-09
> Kaynak: `docs/specs/2026-07-09-hostinger-horizons-competitive-roadmap.md` Phase 2
> Durum: açıldı — implementasyon sıradaki reviewable milestone

## Amaç

Phase 2'nin mevcut omurgası çalışıyor: kullanıcı `/new` üzerinde anonim başlayabiliyor, cevapları
pending onboarding session ile korunuyor, login sonrası `/api/onboarding/finish` mevcut
`/api/sites` üretim hattına açıklama veriyor, guarded free-text cevaplar kontrol ediliyor ve
generation failure durumunda cevaplar kaybolmuyor.

Bu sprint'in amacı Phase 2'yi "kısmen uygulanmış" durumdan çıkarmak ve exit gate'i kanıtlanabilir
hale getirmek:

> Bir beta kullanıcısı Türkçe rehberli akışta yön seçer, kredi harcamadan önce ne üretileceğini
> anlar, giriş yaptıktan sonra ilk preview'a ulaşır, editor'da sıradaki yapılacakları görür, hata
> olursa cevaplarını kaybetmeden tekrar deneyebilir.

## Scope

### In scope

1. `/new` üzerinde 3 curated visual direction seçimi.
2. Generation öncesi kredi/çıktı açıklaması ve daha net progress/error/retry durumları.
3. Editor açılışında completion checklist ve next-best-action paneli.
4. Onboarding funnel telemetry: start, answer, completed, generation_started, generation_succeeded,
   generation_failed, editor_opened.
5. Production smoke script'ine Phase 2 read-only/public kontrollerinin kalıcı eklenmesi.

### Out of scope

- Yeni block type eklemek.
- 6–9 tam profesyonel kit üretmek.
- `siteQualityCheck(site)` publish blocker/warning engine.
- Persistent draft revision timeline.
- Media library UX, thumbnailing, image-aware prompts.
- Stripe/top-up/human-review commercial self-service.

Bu maddeler Phase 3+ kapsamıdır. Bu sprint Phase 3'e taşmayacak.

## Current Baseline

### Already implemented

- `src/lib/onboarding/questions.ts`: deterministic Turkish Q&A script.
- `src/lib/server/onboarding/session.ts`: anonymous pending onboarding session.
- `src/lib/server/onboarding/compose.ts`: answers → generation description composer.
- `src/routes/new/+page.svelte`: anonymous guided Q&A UI and finish flow.
- `src/routes/api/onboarding/answer/+server.ts`: validation, rate limit, guarded answers.
- `src/routes/api/onboarding/finish/+server.ts`: auth gate + description handoff.
- `src/routes/api/sites/+server.ts`: existing generation endpoint; no schema-contract change.
- Tests for questions/session/compose/answer/finish.

### Verified 2026-07-09

- `npm test`: 32 files / 200 tests passed.
- `npm run check`: 0 errors / 0 warnings.
- `npm run build`: passed.
- Production smoke: mobile + desktop passed after PM2 restart.
- Live `/new`, `/pricing`, legal routes, health, sitemap, and tenant public routes return expected
  statuses.

## Sprint Tasks

### Task 1 — Add curated visual directions to onboarding

Purpose: satisfy "Offer 3 visual directions based on curated kits before spending a generation
credit" without building full Phase 3 kits.

Implementation direction:

- Add a small isomorphic module, likely `src/lib/onboarding/directions.ts`.
- Define 3 controlled directions for the launch niche (`psych`) using existing schema-safe concepts:
  warm trust, modern clinic, calm minimal.
- Each direction should include:
  - `id`
  - Turkish label
  - short promise
  - tone/theme hint
  - suggested page/section emphasis
  - preview copy shown in `/new`
- Add a `visualDirection` answer to the onboarding script after `tone` or before final generation.
- Include the selected direction in `composeDescription()`.
- Do not create arbitrary layout freedom; the selected direction is prompt steering only and final
  output remains Zod-validated `Site`.

Acceptance:

- `/new` presents exactly 3 direction cards before generation.
- Selection is persisted in pending answers.
- `composeDescription()` includes the direction in a deterministic sentence.
- Unit tests cover direction schema, ordering, and composer output.

### Task 2 — Make generation cost/progress/retry explicit

Purpose: users should know what happens when they press generate and what a credit buys.

Implementation direction:

- Update `/new` final state copy:
  - "Bu işlem 1 site üretim kredisi kullanır."
  - "Metin/tema düzenlemeleri ücretsizdir; AI ile yaratıcı yeniden yazımlar kredi kullanır."
  - "Cevapların generation başarısız olsa bile saklanır."
- Replace generic busy state during finish/generate with staged messages:
  1. answers being prepared
  2. AI site draft being generated
  3. editor being opened
- Keep existing retry path: if `/api/sites` fails, user remains on `/new` with answers intact and
  can try again.
- Use existing `errorId` from `/api/sites` when present.

Acceptance:

- Provider 503/422 messages show a retryable, non-technical explanation and reference id if present.
- Network failure shows a retryable message.
- User does not lose answers after finish/generation failure.
- Tests or targeted manual browser verification cover failure states where practical.

### Task 3 — Add editor first-run completion checklist

Purpose: after first preview, the user should have an obvious next best action.

Implementation direction:

- Add a lightweight checklist panel to `src/routes/editor/[siteId]/+page.svelte`.
- Checklist items should be deterministic and derived from current draft data:
  - review homepage headline
  - check contact email/phone
  - check services
  - check languages
  - upload/replace own photos if needed
  - publish when ready
- Add a small helper module if needed, e.g. `src/lib/editor/completionChecklist.ts`.
- No publish blocking yet; this is a guidance UI, not Phase 3 quality engine.

Acceptance:

- Editor shows checklist for generated/new drafts.
- Items can be marked visually complete based on draft data where deterministic.
- The primary next action links/selects the relevant existing editor tab where possible.
- No schema changes and no arbitrary tenant HTML/CSS.

### Task 4 — Add onboarding funnel telemetry

Purpose: Phase 2 exit gate depends on measurable first-preview conversion.

Implementation direction:

- Add migration for an append-only `onboarding_events` table or reuse the existing error/ops pattern
  if a better local fit exists.
- Record privacy-safe events:
  - `started`
  - `answer_saved`
  - `completed`
  - `generation_started`
  - `generation_succeeded`
  - `generation_failed`
  - `editor_opened`
- Store:
  - pending id
  - user id when available
  - site id when available
  - event name
  - route/source
  - created at
  - optional duration ms / error id
- Add small admin visibility only if cheap; otherwise expose a server helper and tests first.

Acceptance:

- A complete onboarding → generation path records enough data to compute:
  - start → first preview rate
  - time to generated preview
  - generation failure rate
- No raw onboarding answers, credentials, or user descriptions are stored in telemetry.
- Unit tests cover event writing and failure path.

### Task 5 — Verify Phase 2 end-to-end

Purpose: close the sprint with evidence, not assumptions.

Required checks:

- `npm test`
- `npm run check`
- `npm run build`
- `node scripts/smoke-production.mjs` after deploy/restart
- Local or production controlled E2E:
  - open `/new`
  - answer required questions
  - choose visual direction
  - log in / finish
  - generate site
  - land in editor
  - see checklist
  - publish
  - public route returns 200

Production caution:

- This checkout is currently the live build directory. Running `npm run build` rewrites assets used
  by PM2. If build runs on the live checkout, immediately restart with:

```bash
pm2 restart ecosystem.config.cjs --only saaskaya --update-env
pm2 save
```

Then run browser smoke. A future deploy/release-dir split is recommended but outside this sprint.

## Exit Gate

The sprint is done only when:

1. `/new` includes Turkish guided questions plus exactly 3 curated visual directions.
2. The user sees what a generation credit buys before spending it.
3. Generation failure preserves answers and exposes a clear retry path.
4. Generated/editor landing shows a completion checklist and next-best-action.
5. Telemetry can measure onboarding started → generated preview and time-to-preview.
6. Framework checks and production smoke pass after the latest deploy.
7. `docs/PROGRESS.md` records the implementation, verification, and any incidents/root causes.

## Recommended Implementation Order

1. Direction data + composer tests.
2. `/new` UI integration.
3. Generation progress/error copy.
4. Editor checklist helper + UI.
5. Telemetry migration/helper + API hooks.
6. Full verification + deploy smoke.
