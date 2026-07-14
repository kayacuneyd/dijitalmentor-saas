# Progress — saaskaya

Running memory of the project. **Update after every task** so any fresh AI session knows exactly what is
done and _why_. This file is the antidote to forgetting completed steps.

## 2026-07-14

**Constitution amendment: V2 interpretation + controlled component system.**
Amended `docs/CONSTITUTION.md` to reflect the project's post-MVP reality. Principle §2
("AI never writes HTML/CSS") → "AI never writes executable/rendered tenant code" — the safety
property is identical (Zod gate), but wording now acknowledges provider-agnostic tool-use
(Groq + DeepSeek, not just Claude) and that AI may produce structured data/tokens/patch ops.
Principle §3 ("Fixed component set") → "Controlled component system" — block library can grow
intentionally via the registry pattern; profession kits and integrations form a controlled
vocabulary. Non-goals updated: removed outdated "3 presets at launch" and "single-niche GTM"
guardrails; clarified the WordPress-clone line (no plugins/arbitrary-code, but WordPress-like
ownership ease is acceptable); added explicit non-goals for per-tenant executable code and
unmanaged domain registration. All original safety properties (Zod gate, no raw tenant code,
no plugins, payment-before-domain) remain intact. Full amendment text and rationale in
`docs/CONSTITUTION.md` §Amendments.

**Roadmap evaluation reviewed with operator.** Confirmed that Phase 0 items flagged as open in
`docs/ROADMAP_EVALUATION.md` (AI live smoke, magic-link delivery, payment webhook) are already
resolved in production: Creem.io billing is live, Groq+DeepSeek gate-to-edit passes, and SMTP
magic links have been delivered throughout beta. Next phases agreed: (1) GTM niche + pricing +
legal finalization, (2) Feature Kit v1 integrations, (3) new blocks + siteQualityCheck gate.

**Feature Kit v1 integrations completed — AI patch protection, plan gating, editor card.**
The spec's missing pieces (`docs/specs/2026-07-12-yeni-ozellik-onerileri.md` §9, Faz 3–4)
are now implemented, closing the Feature Kit v1 loop:

- **AI patch protection** (`src/lib/server/ai/patch.ts`): `applyPatch()` now restores the
  original `settings.integrations` array after all AI mutations are applied. An attacker
  cannot craft a chat message that changes the Calendly/payment/WhatsApp link to a phishing
  domain — `url`/`phone` fields are owner-managed only. The editor Settings card explicitly
  tells users "AI bu alanlara dokunamaz."

- **Plan gating** (`src/lib/quality/siteQuality.ts`): active `payment-link` integrations now
  produce a warning (`integration_payment_requires_pro`) explaining that the payment button
  requires a Pro plan. Free-tier users are guided toward the upgrade path from within the
  quality panel, not caught by a surprise at publish time.

- **Editor integrations card** (`src/routes/editor/[siteId]/SettingsTab.svelte`): a new
  "Entegrasyonlar" section with per-type toggle + URL/phone input, domain allowlist hints,
  and an optional custom button label override. All 6 integration types are covered;
  WhatsApp uses E.164 phone (not URL) with a `wa.me` link produced by the renderer.

Earlier phases (schema + `validateIntegrationTarget`, block-side `getSiteIntegration` reads
in Booking/Cta/Contact/Pricing/Footer, `siteQualityCheck` integration-block warnings, and
kit→site default injection via `createProfessionSite()`) were already live before this
session. The Feature Kit v1 spec is now complete end-to-end.

Verification: `npm run check` 0 errors/warnings, `npm test` 81 files / 514 tests passed.

## 2026-07-13

**Per-site AI memory (site_ai_memory) — AI forgetfulness and consistency fix.**
Every AI chat call now reads a per-site Markdown memory document before the full site JSON,
so the AI remembers prior design decisions and user preferences across sessions. After every
successful AI edit, a one-line note is appended; at 10+ lines the document is auto-compacted
via the gatekeeper model. Memory is also seeded from onboarding Q&A answers at site creation
so the first chat session already knows the user's niche/service/audience/tone decisions.

The memory flows into both the Layer 1 gatekeeper (`gateMessage`) and the Layer 2 agent
(`chatEdit`), each now accepting an optional `memory` string prepended to the user prompt.

**Owner surface:** The editor's Settings tab shows an "AI Memory" panel: view, edit,
save via `PUT /api/sites/[siteId]/memory` — gated by `canManageSite`.

**Files:** migration v26, `src/lib/server/ai/memory.ts` (new), gatekeeper/patch `memory`
injection, chat endpoint `appendToMemory`, `/api/sites/[siteId]/memory` route, SettingsTab
"AI Memory" card, `siteDeletion.ts` cascade.

Verification: `npm run check` 0 errors/warnings, `npm test` 81 files / 510 passed, `npm run
build` clean. Decision: 10-line compact threshold per owner request; LLM compact call deferred
(circular-dependency safe — `memory.ts` does not import `llm.ts`).

**Beta bug fix 1/3: `otherProfession` onboarding question had zero EN/DE translation coverage.**
Three beta users reported onboarding UX problems (screenshots): one saw a question mixing German
chrome with a raw Turkish bubble, another got permanently stuck on a question with a broken
code-mixed AI reply, and a third called the editor screen cluttered. Root-caused all three via code
exploration before touching anything (see the plan file this session used,
`1-ekteki-foto-bir-beta-rippling-blanket.md`, for the full trace).

This entry fixes the first bug. `src/lib/i18n/onboarding.ts`'s `questionCopy` table — the
manually-maintained EN/DE overlay `localizeQuestion()` reads from — had **no entry at all** for
`otherProfession` (the "which profession?" fallback question shown when a user picks "Anderes
Feld"/"Another field"), so `localizeQuestion` silently fell back to the raw Turkish base prompt for
that one bubble while every other question/chrome element rendered in the user's actual locale —
exactly the reported mixed-language symptom. Added `otherProfession` EN/DE entries. Also exported
`questionCopy` and added `src/lib/i18n/onboarding.test.ts`, a structural exhaustiveness test
asserting every `ONBOARDING_QUESTIONS` id has both an `en` and `de` entry — turns "silently falls
back to Turkish" into a hard CI failure the moment a future question ships without copy (no
compile-time exhaustiveness is available given `questionCopy`'s loose `Record<string, ...>` typing).

Verification: `npm run check` (0 errors), `npm run test` (79 files / 502 tests passed, up from
77/499). Bugs 2 (AI guard locale-pin + stuck-loop escape valve) and 3 (editor toolbar consolidation)
follow as separate diffs per the same plan.

**Beta bug fix 2/3: AI onboarding guard produced a broken code-mixed reply and could loop a
question forever.** Root cause: `src/routes/api/onboarding/answer/+server.ts` passed the guard
(`classifyOnboardingAnswer`, `src/lib/server/ai/onboardingGuard.ts`) the raw **canonical Turkish**
question prompt and no locale — even for a German/English-locale visitor — so the cheap gatekeeper
model, told to "reply in the visitor's language" while seeing a Turkish question against a
non-Turkish answer, produced exactly the reported broken, code-mixed reply. Worse, when it
misclassified a legitimate answer as off-topic, the endpoint returned 400 before saving anything
and the client re-showed the same question with no retry cap — a single misclassification could
strand a visitor on that question indefinitely.

Fixed both: `classifyOnboardingAnswer` now takes an explicit `locale: Locale` field, threaded into
`GUARD_SYSTEM`'s prompt/few-shots as the authoritative source of what language to reply in
(never inferred from the question/answer text); the answer route now passes
`locals.locale` and `localizeQuestion(question, locals.locale).prompt` (reusing bug 1's
`localizeQuestion`) instead of the raw Turkish prompt. Added a bounded escape valve: a per-session,
per-question rejection counter (`onboarding-guard-reject:{cookie-or-ip}:{questionId}`, reusing the
existing in-memory `rateLimit` helper — no DB migration needed) that, after `MAX_GUARD_REJECTIONS`
(3) consecutive rejections on the same question, skips the guard and accepts the answer as-is
(logged via `recordError` for visibility), the same fail-open philosophy already used when Groq
itself is unavailable.

Verification: `npm run check` (0 errors), `npm run test` (79 files / 505 tests passed) — added
locale-threading coverage to `onboardingGuard.test.ts`, and new `answer/server.test.ts` tests for
locale/localized-prompt pass-through and the rejection-cap auto-accept path. Bug 3 (editor toolbar
consolidation) follows as a separate diff.

**Beta bug fix 3/3: editor screen (`/editor/[siteId]`) had 3 stacked toolbar rows.** A third beta
user called the editor's buttons/navbar/edit screen cluttered. Root cause was pure information
architecture, not a missing design system: the mobile Düzenle/Önizleme pane toggle (added
2026-07-12 "Mobile Roadmap Phase 4") was bolted on top of the pre-existing right-pane toolbar
(viewport switcher, status badge, 3 locale tabs, Save now, Saved-preview link, Publish) instead of
being consolidated with it — 3 separate bordered rows, ~11-14 controls, on mobile. Worse: because
the whole toolbar lived inside the pane that's hidden while `mobilePane==='edit'`, Publish/Save
were entirely unreachable while actually editing content on mobile, only visible after switching
to the preview pane.

Merged the mobile pane toggle and the right-pane toolbar into a single always-visible row
(`src/routes/editor/[siteId]/+page.svelte`), applying the dashboard's already-proven action-hierarchy
pattern (`src/routes/dashboard/+page.svelte`'s `<details>`/`<summary>` "⋯" overflow menu): Publish/
Republish is now the one primary action, locale tabs + status pill stay visible, and Save now /
Saved-preview link / published-version text move into the overflow menu. Removed the now-duplicate
`StatusPill` from the sidebar header. Also switched the right-hand control group to `ml-auto` +
`justify-end` so it (and its overflow menu) stays flush against the true right edge even when the
row wraps to a second line on narrow viewports — an earlier version of this change clipped the
overflow menu off the left edge of the screen when the row wrapped; caught and fixed during
Playwright verification, not left for a future bug report.

Verification: `npm run check` (0 errors), `npm run test` (79 files / 505 tests, unchanged —
markup-only, no test file covers this `+page.svelte`). Real-browser Playwright pass (dev server +
`AUTH_DEV_ECHO_LINK=1` session): 375px mobile — toolbar is now 1 consolidated row instead of 3,
Publish is visible while in the edit pane (not just preview), the "⋯" overflow menu opens fully
on-screen with Published-version/Save now/Saved preview, zero horizontal overflow, zero console
errors; 1440px desktop — one clean unwrapped toolbar row. Also re-verified bug 1/2 end-to-end in
the same browser session: `/de/new` → "Anderes Feld" → `otherProfession` now renders the German
prompt (previously raw Turkish); submitting a German free-text answer advances normally with the
guard failing open (no `GROQ_API_KEY` in dev, logged to `error_events` as expected, not a bug).

**Owner kararı 2026-07: "Diğer" meslekler manuel beta incelemesi yerine normal akışa dahil edildi.**
"Başka bir alan" seçen kullanıcılar için onboarding tıkanması kaldırıldı — artık serbest metin meslek
sorusu (`otherProfession`) soruluyor, süreç normal işliyor, meslek `users.profession`'a not düşülüyor.

### Değişiklikler

- **`src/lib/onboarding/support.ts`:** `manualReviewMessage`, `needsManualReview`, `unsupportedProfessionPatterns`,
  `supportedProfessionPatterns` silindi; `SUPPORTED_NICHES`, `UNSUPPORTED_NICHE`, `isUnsupportedNicheAnswer` kaldı.
- **`src/lib/onboarding/questions.ts`:** `niche` sonrası `otherProfession` sorusu eklendi (`showWhen: niche === 'unsupported'`,
  guarded, short_text 80 char). `visibleQuestions()`'daki unsupported kesmesi kaldırıldı. Soru sayısı 17→18.
- **`src/routes/api/onboarding/finish/+server.ts`:** İki 409 (manuel beta incelemesi) bloğu silindi.
  `setUserProfessionIfEmpty` ile `otherProfession` cevabı `users.profession`'a yazılıyor (yalnızca boşsa).
- **`src/routes/api/sites/+server.ts`:** `needsManualReview` kontrolü ve ilgili import silindi.
- **`src/lib/server/onboarding/compose.ts`:** Unsupport nişte `otherProfession` metni açılış cümlesine yazılıyor;
  kit cümlesi atlanıyor (fallback "Psikolog/Terapist" yanlış yönlendirmesini önlüyor).
  Contact gating: `contactEmail`/`contactPhone` yalnızca ilgili `contactMethod` seçiliyken cümleye katılıyor.
- **`src/lib/server/auth.ts`:** `setUserProfessionIfEmpty(userId, profession)` helper'ı eklendi.
- **`src/routes/new/+page.svelte`:** Çıkmaz tamamen kaldırıldı: `unsupportedNiche` özel durumu, mailto butonu,
  unsupported transcript blokları silindi. "Değiştir" butonu eklendi — kullanıcı transcript'ten herhangi bir
  cevabı düzenleyebilir, buffer önceki değerle doldurulur, submit'te sunucu upsert'lenir.
  `editingId` state + `active` derived değişkeni tüm input dallarını `current` yerine `active` üzerinden yönetiyor.
  3 dilde (TR/EN/DE) `changeAnswer`, `cancel`, `editingPrompt`, `anyChangeResets` copy anahtarları eklendi.
  `nicheDescriptions.unsupported` metni devam-dostu hale getirildi.
- **Testler:** `questions.test.ts`'tekesme testi yeni akışa uyarlandı; `finish/server.test.ts`'teki iki 409 testi
  unsupported+otherProfession tam akış ve serbest raw description 200 testlerine dönüştürüldü.
  `npm run check`: 0 errors, `npm run test`: 77 files / 499 tests passed.

### Karar gerekçesi

Üretim hattı zaten niş-bağımsız — `generateSite()` sadece `description` string'i alır, Zod `siteSchema` +
sabit blok seti kontratı her niş için aynen geçerli. `needsManualReview` bir güvenlik filtresi değil,
sadece niş bekçisiydi. Güvenlik mevcut Groq topic guard ile sağlanıyor.

### Sıkışmış mevcut kullanıcılar

Pending kayıtları `{niche:'unsupported'}` + status `completed`; hiçbir yol status'a bakmıyor.
Script değişince reload'da rehydration `otherProfession`'ı sıradaki soru yapar → kullanıcı kaldığı
yerden devam eder. Migration gerekmez.

## 2026-07-11

**Self-serve `deploy.sh` added.** User wants to trigger deploys themselves without going through an
AI session each time. Added root-level `deploy.sh`, a thin wrapper the user runs directly: stages +
commits the working tree, pushes to `origin/master`, then runs the existing
`npm run deploy:production` pipeline (check/test/build/atomic release swap/PM2 restart/smoke).
Supports `-y`/`--yes` (skip confirmation), `--no-git` (build/deploy only, no commit/push), a leading
positional arg as the commit message, and `-- <flags>` to forward options
(`--skip-check`/`--skip-tests`/`--skip-smoke`/`--no-restart`) through to
`scripts/deploy-production.sh`. Prints the staged file list before committing so the user can catch
anything sensitive before it hits GitHub.

While building it, found `data/app.sqlite` was an **untracked, non-gitignored SQLite file**
(`*.db` was covered, `*.sqlite` was not) — a real risk once a script starts doing `git add -A`.
Fixed `.gitignore` to add `*.sqlite`, `*.sqlite3`, and `/data` (matches the existing `/build`,
`/current`, `/releases` runtime-directory pattern). Scanned the full pending diff and all untracked
files for credential-shaped strings before touching git; no real secrets found (only the
`secret-scan` probe-classifier feature name and env var _names_ like `PORKBUN_API_KEY` in prose,
never values). Verified the script's git logic (stage/commit/push, `--no-git`, `--` passthrough)
against an isolated scratch repo with a stubbed `deploy:production` script — not against this real
repo — before handing it to the user.

**Request probe telemetry separated from operational errors.** User challenged the first bot-noise
fix: dropping 404 scanner traffic entirely would keep Recent errors clean, but would lose useful
security posture signal. Implemented the better split: `error_events` remains for real application
incidents, while 404 route misses are aggregated into a new privacy-safe `request_probe_stats`
table.

Migration v18 creates `request_probe_stats` with `pattern`, `sample_path`, `status`, `count`,
`first_seen_at`, `last_seen_at`, and hashed last user-agent/IP-prefix fingerprints. It deliberately
stores no raw IP, raw user-agent, request body, stack trace, credentials, or customer content. The
migration also backfills historical status-404 rows from `error_events` into aggregate buckets so
the admin panel does not start empty after deploy.

Added `src/lib/server/requestProbes.ts` with classifier buckets for WordPress probes, secret scans,
fake landing probes, random short-path probes, benign asset misses, and unknown 404s. `handleError`
now sends 404s to `recordRequestProbe()` and only records non-404 errors through `recordError()`.
`/admin/settings` now loads `requestProbes` and renders a separate Request probes card next to
Recent errors, showing pattern, sample path, count, first/last seen, and hashed fingerprints.

Verification: targeted request-probe/error-log/migration tests passed (`3 files / 11 tests`),
`npm run check` passed with 0 errors/warnings, full `npm test` passed (`66 files / 407 tests`),
`npm run build` succeeded, and touched files passed Prettier. Not deployed yet because the current
working tree contains many unrelated dirty changes and the production deploy script packages the
entire workspace state.

Deployed all current workspace changes on user request with `npm run deploy:production`. First
release `20260711T161538Z` passed deploy check/test/build/PM2 restart/smoke; post-deploy inspection
showed v18 applied and the Request probes aggregate populated. Tightened probe classification before
finalizing so secret scans take precedence over WordPress buckets (`/wp/.env` is `secret-scan`, not
`wordpress`), added append-only migration v19 to rebuild the historical aggregate with that priority,
and redeployed final release `20260711T162322Z`. Deploy check/test/build/smoke passed again, PM2
`saaskaya` is online, and production smoke passed. Live verification: `http://saaskaya.com/tr`
redirects 301 to `https://saaskaya.com/tr`, `https://saaskaya.com/tr` returns 200, TLS certificate
subject is `CN = saaskaya.com`, `https://seed-law.saaskaya.com/en` returns tenant HTML with
`Published v4` and `cache-control: no-cache, must-revalidate`. Production DB now has migrations
v18/v19 applied; a live request to `/wp-admin/install.php` returned 404, incremented
`request_probe_stats.wordpress` from 180 to 181, and left unresolved status-404 application errors
at 0.

## 2026-07-11

**Recent errors bot-noise cleanup.** User noticed `/wp-admin/install.php` in the admin Recent errors
list and asked why WordPress installation paths were appearing. Investigation found no WordPress
route, dependency, or installation in the app. Production `error_events` showed the issue was public
scanner traffic: 764 total rows, 747/748 of the unresolved rows were 404s, with repeated probes for
`/wp-admin/install.php`, `/wp-login.php`, `xmlrpc.php`, `wlwmanifest.xml`, `.env`, and random
`/lander/...` paths. Nginx access logs confirmed automated probes from external IPs and fake/old
browser user agents. Root cause in the app: SvelteKit routes ordinary route misses through
`handleError`, and `src/hooks.server.ts` recorded those 404s as application errors.

Added `shouldRecordError()` in `src/lib/server/error-log.ts` and wired `handleError` to skip 404
recording, so future scanner misses no longer pollute operational errors. Also filtered
`listRecentErrors()` and `unresolvedErrorCount()` to exclude historical 404 rows from the admin
surface, keeping Recent errors focused on real 500/422 incidents. Production DB cleanup marked the
748 unresolved 404 rows resolved; remaining unresolved production rows are now 16 status-500 and 1
status-422 records. Added regression coverage proving a `/wp-admin/install.php` 404 is not counted
or listed while a real 500 remains actionable.

Verification: targeted error-log/alerts tests passed (`2 files / 6 tests`), `npm run check` passed
with 0 errors/warnings, full `npm test` passed (`65 files / 404 tests`), and `npm run build`
succeeded. Full `npm run lint` still fails on pre-existing/generated `.agents/skills/hallmark/**`
and `skills-lock.json` formatting; touched files were verified with Prettier directly.

## 2026-07-11

**Tenant subdomain preview/publish parity root-cause fix deployed.** User reported the core unresolved
issue: the website shown in editor preview did not match the website served from the assigned
subdomain, and repeated save/publish attempts made it unclear whether publishing actually worked.
Live repro showed `https://seed-law.saaskaya.com/` redirecting to `/en` and serving the main
saaskaya acquisition site instead of the tenant site. Root cause: `src/hooks.ts` had regressed to
locale-only rerouting and no longer called `resolveHostReroute`, so tenant subdomains were treated
as app-host public routes.

Added `src/lib/reroute.ts` to compose routing in the correct order: tenant/custom-domain host
reroute first, app-host locale stripping second. Added regression coverage in
`src/lib/reroute.test.ts` for tenant subdomains with and without locale prefixes, plus app-host
localized public routes. Changed public tenant route caching from `public, max-age=60` to
`no-cache, must-revalidate` so republish no longer appears stale. Expanded
`scripts/smoke-production.mjs` to verify a real tenant subdomain after deploy: 200 response,
tenant content marker, `Published vN`, no main-app landing title, and no-cache response header.

Improved editor publish clarity: editor load now returns a canonical `liveUrl`; publish success and
failure use persistent inline notices instead of transient alerts; successful publish shows
`Published vN` plus a cache-busted live-site link; toolbar status distinguishes published version
from unsaved draft changes.

Verification before deploy: targeted reroute/host-routing/preview-parity/publish tests passed
(`4 files / 17 tests`), `npm run check` passed with 0 errors/warnings, full `npm test` passed
(`64 files / 394 tests`), `npm run lint` passed after formatting touched and pre-existing dirty UI
files, and `npm run build` succeeded. Deployed with `npm run deploy:production`: release
`20260711T001533Z`, PM2 `saaskaya` restarted and online, and production smoke passed including the
new tenant-subdomain check. Post-deploy live curl confirmed
`https://seed-law.saaskaya.com/en` returns 200 tenant HTML containing `Published v4` and Aksoy law
content with `cache-control: no-cache, must-revalidate`, not the saaskaya landing page.

## 2026-07-10

**Phase 2 closure sprint + public site + support + i18n + admin inbox deployed.** User asked to deploy
all uncommitted changes. Committed 207 files (19,198 insertions, 1,665 deletions) as `50b00da` covering:
public acquisition site (about, blog, contact, templates, pricing), support system (inquiries, admin
inbox/support, account support), i18n infrastructure + language switcher + TR/EN content, admin dashboard
with inbox/revenue tracking/activity/alerts, preview parity fixes, UX revision (public shell, header/footer,
SEO head, flow animation), new server modules (activity, alerts, chatLog, inquiries, revenue, support,
siteDeletion, previewParity), onboarding directions/support/telemetry, quality/site quality scoring,
kits (psych), editor completion checklist/page ops, save tracker store, sparkline, typing indicator,
chat/message bubbles, updated legal/login/dashboard/editor/account/profile pages, production deploy script,
and stale screenshot cleanup.

Verification before deploy: `npm run check` 0 errors/warnings, `npm run test` 62 files / 389 tests passing.
Deploy: `npm run deploy:production -- --skip-check --skip-tests` (check/test already run separately).
Build succeeded (8.92s), release `20260710T143841Z` created, `current` switched atomically, PM2 restarted
and saved. Production smoke passed: `https://saaskaya.com` (mobile + desktop, public read-only surface).
Post-deploy: PM2 online (89.5mb, stable), `/api/health` returned 200. Old release `20260710T104557Z`
cleaned up. Git pushed to origin/master.

## 2026-07-10

**Current workspace state redeployed on request.** User asked to deploy everything not yet deployed.
Ran the atomic `npm run deploy:production` flow against the current dirty workspace state. Verification:
deploy `npm run check` passed with 0 errors/warnings, full `npm test` passed (61 files / 383 tests),
production build succeeded, PM2 restarted/saved, production smoke passed on mobile + desktop public
routes, and the active release is `20260710T133539Z`.

## 2026-07-10

**Creem production billing alignment.** User corrected the Creem dashboard webhook URL to the app's
real endpoint, `https://saaskaya.com/api/billing/creem/webhook`, and changed the Pro product to
17€/month recurring. Verified via Creem's read-only product API that the configured
`CREEM_PRO_PRODUCT_ID` now returns `billing_type=recurring`, `billing_period=every-month`,
`currency=EUR`, `price=1700`, `status=active`, and `mode=prod`. Set production app settings
`PAYMENT_PROVIDER=creem` and `PRO_PRICE_EUR=17` so provider choice and admin MRR no longer depend on
fallback behavior.

Updated customer-visible Pro subscription copy from 15€ to 17€ on the landing pricing teaser,
`/pricing` EN/TR/DE copy, SEO `SoftwareApplication` offer metadata, and the admin revenue default.
Domain price copy intentionally remains about 15€/year because that is a separate pass-through domain
reservation cost.

Hardened Creem checkout/webhook mapping: checkout creation now sends `userId`, `referenceId`, and
`internal_customer_id` metadata; webhook handling reads metadata from object, nested subscription, or
nested checkout payloads; `checkout.completed`, `subscription.scheduled_cancel`, and
`subscription.update` are handled explicitly. Verification before deploy: targeted billing/revenue
tests passed (2 files / 22 tests), `npm run check` passed with 0 errors/warnings, full `npm test`
passed (61 files / 383 tests), and `npm run build` succeeded.

Deployed with `npm run deploy:production`: release `20260710T130357Z`, deploy check/test/build passed,
PM2 restarted, and production smoke passed. Post-deploy live smoke confirmed `/en/pricing` shows
17€/month, landing shows 17€, a signed Creem webhook returns 200, and authenticated
`/api/billing/checkout` returns a 303 redirect to `creem.io`; the temporary smoke user/session were
removed from production DB afterward.

## 2026-07-10

**Live-product feedback batch shipped: publish-staleness fix, site deletion, persistent editor
chat, editor/dashboard/admin polish, landing hero media.** Implemented the full plan in
`docs/PLAN.md`-adjacent scratch (11-item user feedback round; plan lived at
`/root/.claude/plans/docs-specs-2026-07-09-hostinger-horizon-effervescent-iverson.md`).

- **Publish staleness (root cause, critical fix).** `DraftStore.save()`
  (`src/lib/stores/draft.svelte.ts`) unconditionally reported `status='saved'` on a successful PUT
  even if a newer edit landed while that PUT was in flight — `publish()` then skipped the flush and
  snapshotted a stale draft. Fixed with a monotonic edit-generation tracker
  (`src/lib/stores/saveTracker.ts`, new): `save()` only reports `'saved'` when no edit raced past it,
  otherwise stays `'dirty'`; new `flush()` loops `save()` until the server is confirmed current.
  `publish()` now calls `flush()` and aborts with a visible error if it fails, and belt-and-braces
  sends the current draft snapshot in the publish request body — `POST /api/sites/[siteId]/publish`
  now accepts an optional `{draft}`, validates it with `siteSchema` (constitution §2), persists it,
  then snapshots. Owner-facing live links get a `?v={version}` cache-buster. Verified live: edited a
  headline and clicked Republish within the 800ms autosave window — the published tenant page served
  the edit immediately (previously would have published the pre-edit version).
- **Site deletion (new).** Permanent delete with typed site-name confirmation.
  `src/lib/server/siteDeletion.ts` (new): transactional cascade (site_versions, contact_submissions,
  media_assets, site_chat_messages, custom_domains, sites), blocks on a paid/registering/active domain
  reservation, auto-cancels a pending one, best-effort R2 cleanup via new `deleteMediaObjects()` in
  `media.ts`. Dashboard: "Siteyi sil" in the site's `⋯` menu with an inline type-to-confirm panel.
  Admin: matching `deleteSite` action + confirm UI on `/admin/customers/[userId]`, logged to
  `admin_actions` (`site_delete`).
- **Persistent editor chat (new, migration v16).** New `site_chat_messages` table
  (`src/lib/server/db/migrations.ts` v16, `schema.ts`) + `src/lib/server/chatLog.ts`
  (append/list/delete/seed). The /new onboarding Q&A is replayed into the editor's Chat tab
  (`seedChatFromOnboarding`, wired at `POST /api/sites` success — also fixes the `generatedSiteId`
  back-reference on `pending_onboarding`, which was never set before) so the conversation visibly
  continues once the site lands in the editor. `/api/sites/[siteId]/chat` now persists user turns
  (stage-1 sends only) and assistant replies (applied/reply/help/redirect; proposals/errors stay
  ephemeral). New shared `src/lib/ui/ChatBubble.svelte` + `TypingIndicator.svelte` replace the
  hand-duplicated bubble markup in both `/new` and the editor's `ChatTab`.
- **Editor polish.** New `src/lib/editor/icons.ts` (inline SVG, matches the landing page's stroke
  convention) — sidebar tabs are now icon+label instead of plain text, checklist ✓/○ are proper
  circle icons, the viewport switcher is icon-only, and the editor locale picker is a segmented
  flag-button control (reusing `src/lib/ui/flags.ts`). `PagesTab.svelte` rewritten off DaisyUI onto
  the `sk-*` system with a page counter, collapsed add-page form, and new remove-page support (new
  pure `src/lib/editor/pageOps.ts`: `addPage`/`removePage`, backfills `nav.items` when removal would
  empty it — nav requires ≥1 entry or the next autosave 400s).
- **Dashboard live preview thumbnails (new).** `src/lib/ui/SitePreviewThumb.svelte`: a lazy,
  non-interactive, scaled iframe of `/preview/{siteId}` (owner-authed draft, works pre-publish) on
  each dashboard site card.
- **Width harmonization + admin go-live tools.** One rule: PageShell pages get `max="max-w-5xl"`,
  AdminShell pages inherit the default `max-w-7xl` (no override) — normalized 6 previously-uneven
  files. Admin customer detail gained `publish`/preview/live-link tools (same quality gate as owner
  publish, logged to `admin_actions`), so admins can manage a beta user's site without an approval
  gate (per product decision — self-serve publish stays, admin now has visibility + a lever).
- **Landing hero right column.** Hero is now a two-column grid at `lg:` (`FlowAnimation` moved into
  the right column, was a standalone block below the hero); single column on mobile, no overflow at
  375–1536px.

Verification: `npm run check` (0 errors/warnings, 1699 files), `npm test` (61 files / 381 tests,
including new `saveTracker.test.ts`, `siteDeletion.test.ts`, `chatLog.test.ts`, `pageOps.test.ts`,
extended `publish/server.test.ts` and `admin/customers/[userId]/actions.test.ts`), `npm run build`
clean. Live-driven Playwright verification against a local dev server (system Chromium via
`playwright-core`, `AUTH_DEV_ECHO_LINK=1` for a scripted login): landing hero at 1440px/390px (no
horizontal overflow, TR-locale headline glyph-consistent, flag switcher intact from the prior
round), dashboard preview thumbnails rendering, editor sidebar icons/checklist/viewport/locale
switcher all correct, Pages tab restyle + remove buttons, Chat tab wired to the shared bubble
components, and the publish-staleness fix confirmed against a real published page (200, edited
headline present). Test data cleaned from the local dev DB afterward; `local.db` is gitignored so
none of it reached version control. Deploy is a separate explicit step, not run as part of this
task.

## 2026-07-10

**Public acquisition/support roadmap spec saved.** Added
`docs/specs/2026-07-10-public-site-acquisition-support-roadmap.md` as a two-deliverable roadmap for
the requested public-site improvements. Deliverable A covers public shell/header/footer, pricing
navigation, landing CTA order, language switcher readability, About/Contact/Blog pages, SEO/GEO,
sitemap/hreflang/JSON-LD, and scroll-to-top. Deliverable B covers public contact/chat messaging,
schema/backend, rate limits, operator email notifications, and admin inbox/reply workflow. No
implementation changes were made in this task; the spec is waiting for explicit approval before work
starts.

## 2026-07-10

**Admin console redesigned with a classic sidebar layout.** Replaced the old top-button admin
navigation with a shared `src/lib/ui/AdminShell.svelte`: fixed desktop left sidebar, horizontal
mobile admin nav, compact page headers, and consistent active states across Overview, Customers,
Customer detail, Support, Support detail, Beta Invites, and Settings. `AppCard` now accepts an `id`
prop so settings sections can be linked by anchor. The Overview page now filters dashboard activity
noise: scanner 404s, favicon/ads/sellers probes, and old transient chunk-import errors no longer
fill the main activity card; the full recent error list remains available in Settings.

**Settings UX compacted.** Rebuilt `/admin/settings` around a settings group navigator and collapsed
group panels for AI, AI Providers, Email, Billing, Domains, Media, Ops, and Errors. System status and
pending domain payments stay at the top as compact operational cards; settings no longer stretch
open down the whole page by default. Existing save/clear/payment/error-resolution actions are
unchanged, so the redesign is layout-only for behavior. Verification: `npm run check` passed with
0 errors/warnings, full unit suite passed (53 files / 340 tests), `npm run build` passed, production
was deployed with the atomic `npm run deploy:production` flow, and production smoke passed. Additional
authenticated Playwright checks on `/admin`, `/admin/settings`, `/admin/customers`, `/admin/support`,
and `/admin/invites` passed on mobile 390px and desktop 1440px: all returned 200, rendered 5 admin
nav links, and had horizontal overflow 0. The temporary admin test session was removed afterward.

**Atomic production release deploy implemented.** Root-caused `err-c249d645` and follow-up
`ERR_MODULE_NOT_FOUND` incidents to PM2 serving mutable root `build/` while `npm run build` replaced
adapter-node chunk files underneath the live process. Added `scripts/deploy-production.sh` and
`npm run deploy:production`: the script bootstraps `current` from the existing build if needed,
builds into root `build/`, copies the completed bundle into `releases/<timestamp>/build`, atomically
switches `current`, restarts/saves PM2, runs production smoke, and keeps recent releases. Updated
`ecosystem.config.cjs` so PM2 runs `/var/www/saaskaya/current/build/index.js`; the script detects
old PM2 script paths and recreates the app when necessary because `pm2 startOrRestart` does not
change an existing app's script path. Added `/current` and `/releases` to `.gitignore`.

Verification: first full deploy ran `npm run check` (0 errors/warnings), full unit suite (53 files /
340 tests), build, PM2 restart/save, and production smoke. A second deploy validated the path-migration
guard: PM2 was recreated from old `/build/index.js` to `/current/build/index.js`, then build/switch/
restart/smoke succeeded. Final PM2 describe reports script path
`/var/www/saaskaya/current/build/index.js`, `current` points to
`releases/20260710T074449Z`, `/en` returns 200, `/dashboard` returns the expected signed-out 303 to
`/login`, and the only post-switch error event is the smoke script's expected `/does-not-exist` 404.

**Self-serve beta entry flow deployed.** Added localized `/beta` entry pages for EN/TR/DE where a
tester enters only an email address; the server automatically creates/reactivates a beta invite,
creates the existing magic-link token, and sends the magic-link email without exposing a manual
"choose invite" step. Added optional `BETA_ENTRY_CODE` under Ops settings: when configured, only
`/beta?code=...` matching the setting can submit; when empty, the form is open self-serve. Added
localized `/profile/start` as the post-magic-link first-run profile step with full name, profession,
and city, no password. Login verification now sends non-admin users without a completed beta profile
to `/profile/start`; pending anonymous onboarding still continues directly to `/new`.

Migration v14 (`beta-profile`) adds `users.full_name`, `profession`, `city`, and
`beta_profile_completed_at`. Production DB shows v14 applied and all four columns present. Verification:
`npm run check` passed with 0 errors/warnings, full unit suite passed (53 files / 340 tests),
`npm run build` passed before deployment, PM2 restarted/saved, direct HTTPS checks returned 200 for
`/en/beta`, 307 for `/beta` to `/en/beta`, and 303 for signed-out `/en/profile/start` to `/en/beta`.
Updated `scripts/smoke-production.mjs` to cover beta/profile localized routes; production smoke passed
on mobile and desktop.

**Beta locale/security follow-up.** Investigated a Chrome "Dangerous site" report for
`https://saaskaya.com/beta` and a report that beta locale pages always showed English. Live HTML and
hydrated Playwright checks showed `/tr/beta` renders Turkish and `/de/beta` renders German, but the
base app shell still emitted `<html lang="en">` and defaulted to Svelte's inline favicon. Fixed
`src/app.html` to use dynamic `%lang%`, added a saaskaya `/favicon.svg`, and added baseline response
security headers from `src/hooks.server.ts`: HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, and `X-Frame-Options: SAMEORIGIN`. Locale detection now also understands
Cloudflare/Vercel country headers for TR and German-speaking countries when no explicit path locale is
present. Verification: `npm run check`, `npm run build`, PM2 restart/save, live headers show the new
security headers, `/tr/beta` returns `html lang="tr"` with Turkish copy, `/de/beta` returns
`html lang="de"` with German copy, `/favicon.svg` returns 200, and production smoke passed after
updating the smoke image check to wait for lazy-loaded landing images.

## 2026-07-09

**Launch i18n foundation deployed.** Added locale-aware public/customer launch routing with
`/en`, `/tr`, and `/de` prefixes, browser/cookie locale resolution, `sk_locale`, and a language
switcher. Localized the launch funnel surfaces: landing, pricing, login, guided `/new` onboarding
chrome/questions/options, and `/templates` chrome/CTA/meta. English is the default; `/` now 307
redirects to `/en` unless a supported browser/cookie locale is present. Legacy public URLs such as
`/pricing`, `/new`, and legal routes redirect to the selected locale prefix. Moved SvelteKit
`reroute` into `src/hooks.ts` after production smoke caught `/en/...` 404s from the first server-hook
implementation. Verification: targeted onboarding/templates tests passed (4 files / 26 tests), full
unit suite passed (53 files / 340 tests), `npm run check` passed with 0 errors/warnings,
`npm run build` passed, PM2 restarted/saved, direct HTTPS checks returned 200 for `/en|/tr|/de`
landing/pricing/new/templates/login, root returned 307 to `/en`, and
`node scripts/smoke-production.mjs` passed after updating it for locale redirects. Caveat: legal
documents remain Turkish legal drafts with locale-prefixed access; full legal translation still needs
legal/accounting review before a multilingual paid public launch claim.

**Pro pricing decision updated to 15€/month.** Changed the customer-facing Pro price on the landing
pricing teaser and `/pricing`, updated the pricing spec decision from 299₺ to 15€, and switched the
admin MRR estimate setting/display from `PRO_PRICE_TRY` to `PRO_PRICE_EUR` with a default of 15. Domain
pricing remains separate at 15€/year; Premium/top-up/extra services were intentionally left unchanged
until the product decision is finalized.

## How to use this file

- Add a **Task log** row when you finish a task (newest at top).
- Record every non-obvious **decision** with its reason (constitution principle §6).
- Record every bug in the **Error log** using the debug loop from `CONVENTIONS.md`.

## Current milestone

**Per-tenant $ AI budget cap + admin customer panel — done, not yet deployed.** Prompted by
evaluating (and rejecting, see decisions log) a paid AI gateway as a cost-saving option: found the
existing cost control was entirely count-based/assumption-based, never an enforced $ ceiling per
customer. Added a real per-tenant monthly dollar cap ($4 Pro / $1 Free, `AI_BUDGET_FREE_USD`/
`AI_BUDGET_PRO_USD`) as an additional safety net alongside the existing credit-count limits
(unchanged, still the `/pricing` promise) — see `assertWithinQuota` in
`src/lib/server/ai/usage.ts`. Also built `/admin/customers` — the first general customer-list/
detail/action admin surface (previously only `/admin/invites` and `/admin/settings` existed):
plan/site-count/AI-usage summary per customer, and four admin actions (manual subscription
override, AI credit top-up, domain detach, unpublish), each logged to a new `admin_actions` audit
table (migration v11). 247/247 tests, 0 type errors, clean build; full live verification incl. a
real-browser pass of the admin panel forms — see `.claude/skills/verify/SKILL.md` §"Per-tenant $ AI
budget cap + admin customer panel" and the 2026-07-09 task row. **Not yet committed or deployed.**

**Phase 2 done and live — guided onboarding Q&A.** `/new` is now anonymous-reachable: a
fixed 14-question script (+2 conditional contact steps) collects business/niche/audience/services/
contact/etc. before the sign-in gate, which moved from page-load to `POST /api/onboarding/finish`
(the moment AI generation is actually spent). ~8 free-text answers pass through a new Groq on-topic
guard (`src/lib/server/ai/onboardingGuard.ts`, same forced-tool-call + one-repair pattern as the
chat gatekeeper) with **no force/override path** — unlike the editor chat gatekeeper, onboarding
never lets a user push an off-topic message through. Answers persist server-side
(`pending_onboarding`, migration v9) behind a `sk_pending` cookie; the magic-link email carries the
pending token as a `&p=` URL param so the flow survives being opened on a different device, not
just the same browser. The composed description feeds the **unchanged** `POST /api/sites` — no
edits to `generate.ts`, `schemas.ts`'s existing exports, or the Zod `Site` contract. 200/200 tests,
0 type errors, clean build; full real-browser smoke passed (all 15 steps, escape-hatch toggle,
cross-device magic-link resume, off-topic guard UI, 375px no-overflow) — see the 2026-07-09 task
row and `.claude/skills/verify/SKILL.md` §"Guided onboarding Q&A". **Committed (`193c8d8`) and
deployed live** on saaskaya.com. The user's own live test then surfaced and got a same-session fix
for a pre-existing nginx `proxy_read_timeout` gap (60s default was shorter than some AI generation
calls) — see the follow-up 2026-07-09 task row.

**Phase 1 done — GTM nişi, fiyatlandırma, unit economics ve yasal temel.** Hostinger Horizons
roadmap'inin Phase 1 exit gate'i tamamlandı: launch nişi **psikologlar** olarak seçildi (erişim,
içerik riski, lead değeri dengesi); Free/Pro/Premium (0₺/299₺/599₺) fiyatlandırma tablosu ve unit
economics (~%46 brüt marj @ 10 müşteri) belgelendi; 6 yasal sayfa (privacy, terms, kvkk,
acceptable-use, refund, disclaimer) Türkçe-first KVKK/GDPR uyumlu olarak yayınlandı; landing IA
Türkçe niş-odaklı yeniden yazıldı. **Operatör bekleyenler:** yasal metinler taslak (hukuki gözden
geçirme önerilir), Stripe price ID'leri, PAYMENT_MODE/IBAN/domain fiyat production ayarları,
Premium insan incelemesi iş akışı.

**M6 done — all planned milestones (M0–M6) complete.** Migration runner (versioned/idempotent/
resumable, per-tenant-ready), nightly backups + restore drill, health endpoint + cron watchdog,
cancellation policy (grace window, daily sweep, export, `docs/POLICY.md`), plus all four audit
findings fixed. **Operator to-dos:** activate closed beta, verify real Resend delivery, and configure
`BACKUP_REMOTE`. Groq/DeepSeek and R2 credentials are active; Stripe/Porkbun/payment setup is
intentionally deferred for the preview-only beta. Backlog beyond
the plan: R2 media + media manager, wildcard-subdomain TLS, per-tenant SQLite split (runner is
ready), Porkbun registration-endpoint verification on first live use.

**Post-M6 (v2 roadmap):** V2.0 SaaS UI redesign is live; **V2.2 chat-first editing Phase 1 (two-layer
AI gatekeeper: Haiku triage → approval card → risk-routed Sonnet/Opus patches, credits, telemetry,
prompt caching) is done** — see the 2026-07-08 task row and `docs/specs/2026-07-08-two-layer-ai-gatekeeper.md`
(Revisions block). Phase 2 (top-up, human help, budget dot, Premium tier) is next in that spec.
**Beta launch + hybrid onboarding (all 3 phases) is done** — closed-beta invite gate
(`BETA_MODE` + `beta_invites` + `/admin/invites`, admins bypass), an `EMAIL_PROVIDER` seam
(SMTP/Resend/dev), and domain reservation → bank-transfer/Stripe payment → decoupled fulfillment
(migration v5); see `docs/specs/2026-07-08-beta-launch-hybrid-onboarding.md` (Revisions block).
Operator activation: set `BETA_MODE`, verify Resend magic-link delivery, and configure off-site
backups. Porkbun/Stripe/payment settings are not required for preview-only beta sites.

**Dev preview is live:** https://saaskaya.digitaltamam.com.

## Task log

| Date       | Milestone | Task                                                                            | Status   | Key decisions / notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | --------- | ------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-09 | Admin     | Admin customer-management panel (`/admin/customers`)                            | ✅ done  | Second of two features planned together after evaluating (and passing on) a paid AI gateway for cost control. Previously only `/admin/invites` and `/admin/settings` existed — no way to see/manage individual customers. Extracted the `requireAdmin(locals)` guard (duplicated identically in both existing admin routes) into `src/lib/server/auth.ts` as a rule-of-three refactor before adding the third route. New `src/lib/server/customers.ts`: `listCustomers()` (3 queries total — users, grouped site-count, this-month `ai_usage` matched by computed tenant id, **not** joined through `sites` since one user's multiple sites share one `ai_usage` row and a join would fan it out) and `getCustomerDetail(userId)` (sites via existing `listSitesByOwner`, aggregated contact submissions via new `listSubmissionsForOwner` in `db/contact.ts`, admin action history) — deliberately separate from anything `canManageSite`-gated, so admin status never grants blanket site-edit access; admin reads go through this module's own queries, not the customer-facing editor/dashboard routes. Migration **v11** (`admin_actions` — flat audit table: adminEmail/targetUserId/action/detail/createdAt, shared by all four actions, not a quota ledger). Four `requireAdmin`-gated form actions on `/admin/customers/[userId]`: `overrideSubscription` (manual Stripe bypass; UI warns if the customer has a live `stripeCustomerId` since the next webhook can silently overwrite the override — no Stripe API call attempted, out of scope for this pass); `topUp` (new `grantAiTopUp()` in `usage.ts` — signed-delta `UPDATE` on `ai_usage`, counters may go negative and read as banked headroom by every existing `used >= limit` check; **requires** a reason, rejects all-zero amounts); `detachDomain`/`unpublish` (reuse existing `detachSiteDomain`/`unpublishSite`, previously owner-only, now also admin-callable) — both send a best-effort courtesy email matching the existing `sweepExpiredCustomDomains` precedent, reworded for a support action instead of policy expiry. 28 new tests across `usage.test.ts` (`grantAiTopUp`), `billing.test.ts` (`overrideSubscription`), `contact.test.ts` (`listSubmissionsForOwner` cross-site aggregation), `customers.test.ts`, and two new `page.server.test.ts`/`actions.test.ts` files under `admin/customers/` (a first for this codebase — no prior precedent for testing `+page.server.ts` `load`/`actions` directly; used `isRedirect`/`isHttpError` from `@sveltejs/kit` to assert guard behavior). 247/247 tests, 0 type errors, clean build. Live-verified end-to-end: signed-out 303 / non-admin 403 / admin 200 on all three admin routes; all four actions exercised live via curl (discovered/documented that SvelteKit form actions return HTTP 200 at the transport layer even on `fail()`, with the real status inside the JSON envelope — same nuance already known for `/login`); a full Playwright pass (list → detail → top-up form → success banner, required-field guard, 375px zero overflow). Nav link added from `/admin/settings`. Explicitly excluded from this work (confirmed with the user before starting): site analytics/performance metrics and a customer support/ticket system — both are separate, larger features for a future session. **Not yet committed or deployed** — see Current milestone note above.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-07-09 | Cost      | Per-tenant monthly $ AI budget cap (real-dollar safety net)                     | ✅ done  | While evaluating whether a paid AI gateway (nexos.ai) could cut costs, found the existing cost control was entirely count-based (N edits/generations/month) and assumption-based (~3₺/customer in the Phase 1 unit-economics doc) — never an enforced $ ceiling, even though the real per-call cost (`estimatedCostMicrousd`) was already tracked per tenant per month in `ai_usage`, just never compared against a per-tenant limit (only a beta-wide $5/month sum across _all_ tenants). Added `AI_BUDGET_FREE_USD`(default 1)/`AI_BUDGET_PRO_USD`(default 4) to `config.ts`'s `SETTING_DEFS`; new `tenantMonthlyBudgetMicrousd(ownerUserId)` + a third backstop check in `assertWithinQuota` (`src/lib/server/ai/usage.ts`), inserted after the token backstop and, like it, **not bypassed by `isAdmin`** (admin smoke tests still spend real provider $, unlike the credit-count bypass). Deliberately additive, not a replacement — the credit-count limits customers see on `/pricing` are unchanged; this is a silent net under them for when real cost drifts from the assumption (provider price change, unusually large site/edit). Zero new call-site code: both `QuotaExceededError` catch sites (`/api/sites`, chat) already map it to 429 generically. Added `tenantIdForUser()` as the single place the `tenant-<userId>` format is built, refactored the one existing inline literal in `/api/sites/+server.ts` to use it. New customer-facing surface: an "AI usage this month" card on `/account` (edits X/Y, generations X/Y, `$spent/$cap` with a `StatusPill` tone by ratio) — previously no per-tenant usage was shown anywhere, not even reactively beyond a 429 toast. 8 new tests in `usage.test.ts` (defaults, settings-override, trips independent of token/global backstops, Free vs Pro tier, admin NOT exempt). 219/219 tests, 0 type errors, clean build. Live-verified: fresh Free user's `/account` correctly shows `$0.00 / $1.00`, `0 / 10`edits,`0 / 1` generations. Premium tier explicitly out of scope (doesn't exist in code today, only Free/Pro — flagged elsewhere as separate, larger work). First of two features from the same planning session; the admin customer-management panel (`/admin/customers`) is next.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-07-09 | Phase 2   | Guided onboarding Q&A (anonymous-reachable `/new`, Groq topic-guard)            | ✅ done  | Implemented per the approved plan (chat-driven, non-plan-mode session): `/new`'s page-load auth redirect (`idea.md §6.1`) moved to `POST /api/onboarding/finish`, the moment generation is actually spent. `src/lib/onboarding/questions.ts` — pure, isomorphic 14-question script (+2 conditional `contactEmail`/`contactPhone` steps) with per-question Zod validation, zero AI cost to render/sequence. `src/lib/server/onboarding/session.ts` — `sk_pending` cookie (structurally separate from `sk_session`, grants no site/AI capability), `pending_onboarding` table (migration **v9**), sha256 hash-at-rest tokens matching `auth.ts`'s convention, 48h sliding expiry, opportunistic + daily-cron sweep (`sweepExpiredOnboarding`, wired into `/api/admin/tasks/daily`). **Cross-device handoff:** `login/+page.server.ts`'s action now appends the pending token as `&p=` on the magic-link URL when a `sk_pending` cookie is present at send time; `login/verify/+page.server.ts` resolves that URL param (preferred) or the cookie, links the record to the new user, and redirects to `/new` instead of `/dashboard` when one exists — proven live by opening the dev-echo link in a **second** browser context with no prior cookie. **Groq on-topic guard** (`src/lib/server/ai/onboardingGuard.ts` + additive `onboardingGuardSchema` in `schemas.ts`): same forced-tool-call + cheap-model + one-repair mechanism as `gatekeeper.ts`, but binary-only (no question/help_request branches) and **no force/override field anywhere in the schema or endpoint** — the deliberate difference from the editor chat gatekeeper's "yine de gönder" escape, per the user's explicit requirement that onboarding never becomes a general chatbot. Runs on the ~8 free-text questions (confirmed scope with the user); fails OPEN on `AIUnavailableError`/`AIInvalidOutputError` (logged via `recordError`, `source:'onboarding-guard'`) so the fixed backbone never depends on Groq uptime; three dedicated `rateLimit()` buckets (`onboarding-start/answer/guard`) reuse `auth.ts`'s existing in-memory limiter. `src/lib/server/onboarding/compose.ts` — pure `composeDescription()` turns collected answers into a `description` string fed to the **unchanged** `POST /api/sites`/`generate.ts` (verified via `git diff` — byte-identical). Free-text escape hatch ("kendi cümlelerimle anlatmak istiyorum") kept, now routed through the same pending/cookie/handoff plumbing, deliberately left unguarded (no regression vs. today's shipped behavior). Full `/new/+page.svelte` rewrite: chat-bubble transcript of answered questions, per-kind input controls (choice/multi_choice/short_text/open_text/list_text), off-topic rejections shown inline with zero override affordance, review screen with an explicit "Siteni oluştur"/"Ücretsiz Başla" action (never auto-fires generation on redirect). 200/200 tests (`npm test`), 0 `svelte-check` errors, clean `npm run build`. Live verification: curl smoke of the full anonymous → answer → magic-link → cross-device-verify → resume chain; two full Playwright runs (main flow incl. escape-hatch toggle + cross-device resume + generation handoff, and a route-intercepted off-topic-guard UI check confirming rejection message shows, answer isn't saved, and no force control exists anywhere in the DOM); 375px viewport zero horizontal overflow; daily-sweep endpoint confirmed live (`sweptOnboarding` in the JSON response). Deferred like other AI live smokes in this project: a real (non-mocked) Groq call, since no `GROQ_API_KEY` is configured in this dev environment — the guard's fail-open path was exercised live instead (logged to `error_events`, answers still saved). Committed `193c8d8`; deployed and its own post-deploy fix logged in the row above. |
| 2026-07-09 | Phase 2   | Deploy + nginx `proxy_read_timeout` fix (AI generation was timing out silently) | ✅ done  | Committed `193c8d8`, `npm run build`, `pm2 restart saaskaya` — migration v9 applied cleanly to the real `data/production.db` (`[db] migrations applied: 9-pending-onboarding`), full route sweep 200s, `/api/health` ok. User's own live test surfaced two things: (1) `err-0b10286e` — a one-off (first-ever, count=1 historically) `AIInvalidOutputError` 422 from the **pre-existing, unchanged** `/api/sites`/`generate.ts` one-repair-attempt policy; not a regression, no site row was created, user advised to retry. (2) A retry then showed the user "Ağ hatası" (network error), but `sites` table showed a real row (`site-2d837a73`, "Donbass LLM", owned by the user's own account) had actually been created — root cause: `saaskaya.com`'s nginx vhost had no `proxy_read_timeout` override, so it used nginx's compiled-in 60s default; the AI generation call took longer than that, nginx logged `upstream timed out ... POST /api/sites` and dropped the connection to the browser ~33s before the backend actually finished and saved successfully. **Fix:** added `proxy_read_timeout 120s;` to the `location /` block in `/etc/nginx/sites-available/saaskaya.com`, validated with `nginx -t`, reloaded with `systemctl reload nginx` (confirmed live via `nginx -T`, other vhosts on the shared box unaffected — spot-checked flikoston.com and tombala.digitaltamam.com still 200). Also cleaned up two `pending_onboarding` rows created during live testing (one the assistant's own smoke-test answer, one the user's own manual test — initially assumed both were disposable test data and deleted without pausing to check; flagged to the user afterward, no real impact since neither had reached a completed/converted state).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-09 | Ops       | Host-wide PM2 outage recovery + Phase 1 deploy + commit                         | ✅ done  | A user health check surfaced that `saaskaya.com` was returning 502 on every route. Root cause: at 09:40 today the shared VPS's PM2 daemon force-killed and restarted, and the new daemon never resurrected any app — `pm2 list` showed 0 processes host-wide (not saaskaya-specific; `flikoston`, `digitaltamam`, `tombala`, and 15 other unrelated projects were down too), confirmed via nginx `connect() failed... 127.0.0.1:3021/:3030` errors. DNS/TLS/nginx redirects were unaffected. User chose full-fleet `pm2 resurrect`; only `saaskaya` actually came back online (the other 18 apps failed silently — no error lines logged — and PM2 auto-saved the reduced process list to `dump.pm2`, but the original 19-app list is preserved at `dump.pm2.bak`). **The other 18 unrelated apps are still down** and were intentionally left alone pending explicit user direction (out of saaskaya's scope). Side effect discovered during recovery: this VPS serves production directly from `/var/www/saaskaya/build/` (no separate deploy checkout), so the `npm run build` run for local verification during this same session rebuilt `build/` from the then-uncommitted Phase 1 working tree, and `pm2 resurrect` launched that build — putting the uncommitted GTM/pricing/legal work live as an unintended side effect of the outage fix. User confirmed (Phase 1 was already logged as functionally done, tests/check/build green) to keep it live and commit as-is; committed `9f20e30`. Final live sweep: `/`, `/login`, `/pricing`, all 6 `/legal/*`, `/sitemap.xml`, `/robots.txt`, `/api/health` all 200; `/dashboard` 303 (expected, signed-out); `/api/health` db/disk ok; git tree clean.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-07-09 | Phase 0   | Production baseline, isolation, and live end-to-end evidence                    | ✅ done  | Completed Phase 0 from the Horizons-informed roadmap. Production is isolated on `data/production.db`; migration integrity/counts, nightly backup, temporary restore, monitor, cron sweep, HTTPS/redirects/TLS, public tenant locales, and reusable mobile/desktop browser smoke passed. Disabled production auth echo and prevented failed magic-link tokens from entering logs; regression-covered. Controlled auth passed (login → one-time verify → session → dashboard), Resend sender/domain passed and a smoke message reached `delivered`, then smoke tokens/sessions/log artifact were removed. Fresh real Groq/DeepSeek flow passed: generation → editor/preview → chat `applied` → publish → public tenant 200 (`site-6e8106ca`). Because Stripe/Porkbun/bank credentials and an off-site target do not exist, closed beta now explicitly runs `PAYMENT_MODE=disabled`; new-domain purchase is hidden/rejected, and closed beta promises local backups rather than DR. These integrations remain activation gates, not falsely “verified.” Final tests/check/build/public smoke passed; evidence ledger: `docs/PHASE0_VERIFICATION.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-07-09 | Strategy  | Hostinger Horizons competitive analysis and focused product roadmap             | ✅ done  | Reviewed the current official Horizons landing, features, editor/product overview, plan, domain, publishing, restore, and support surfaces; compared its product system with the live saaskaya architecture and v2 vision. Saved `docs/specs/2026-07-09-hostinger-horizons-competitive-roadmap.md`: saaskaya will adopt prompt-first onboarding, curated template discovery, visible credits, persistent restore, bundled publish/SEO/domain outcomes, proof, and guided recovery, but will not copy Horizons' general app builder, code editor, arbitrary backend/integrations, or tenant code generation. The target is a Turkish, niche-deep, schema-safe professional-site product. The roadmap is dependency-gated: operational baseline → niche/pricing/legal → guided onboarding → rich controlled site engine + deterministic quality gate → persistent chat revisions → media → publish/SEO/leads → billing/top-ups → proof-led launch → scale. No application code changed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-07-08 | V2.0      | Account inner body width alignment                                              | ✅ live  | Follow-up to the `/account` screenshot review: the shared canvas was correct, but account still passed `max="max-w-3xl"` to `PageShell`, making its inner body visibly narrower than `/dashboard` and the recently fixed landing page. Updated `src/routes/account/+page.svelte` only to use `max="max-w-4xl"`, matching the app body standard. Verified: `npx prettier --write src/routes/account/+page.svelte`, `npm run check`, `npm test` (119/119), `npm run build`, deployed with `pm2 restart saaskaya`. Live CDP comparison at 1365px desktop with an authenticated session: `/dashboard` and `/account` both report shell width 976px, body width 894px, identical left/right offsets, and no horizontal overflow. `/api/health` returned ok with db/disk healthy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-07-08 | Beta      | Beta launch + hybrid onboarding (3 phases; revised spec)                        | ✅ done  | Implemented `docs/specs/2026-07-08-beta-launch-hybrid-onboarding.md` with the approved revisions (see its Revisions block). **Phase 1 — beta access + email:** `email.ts` refactored to an `EMAIL_PROVIDER` seam (smtp via nodemailer / resend via fetch / dev echo), fixing the spec's `Number(getSetting('SMTP_PORT')) ?? 465` NaN bug (465⇒TLS, 587⇒STARTTLS); `beta_invites` table + `isBetaAllowed()`/invite CRUD in `auth.ts`; `BETA_MODE` gate on `/login` (send) + `/login/verify` (click) with the Turkish denied message + 🔒 badge; new `/admin/invites` (list/add/revoke). **Super admins bypass the beta gate** via a shared `isAdminEmail()` (also now used by `hooks.server.ts`) — operator can't lock themselves out. **Phase 2 — reservation + bank transfer:** `domain_reservations` table (migration **v5** `beta-launch`, with a partial unique index on live statuses so cancelled/failed rows don't wedge a domain) + `reservations.ts` (create/report/confirm/reject/cancel + idempotent, retryable `fulfillReservation` status machine that re-checks availability before registering and lands failures on `failed`); dashboard reservation UI (IBAN + amount + "Havale yaptım, bildir" + cancel, `PAYMENT_MODE`-gated) + admin "Bekleyen ödemeler" panel (Onayla/Reddet/Kur-retry); fulfillment decoupled from the confirm request and swept by the daily cron (`/api/admin/tasks/daily`). **Phase 3 — Stripe one-time:** `createDomainCheckoutSession` (`mode=payment` + `metadata.reservationId`) + `handleStripeEvent` disambiguation so a domain payment marks the reservation paid and NEVER activates Pro. Free "gift" = subdomain only (no operator-funded registration; §5 clean). Settings added: EMAIL_PROVIDER, SMTP_HOST/PORT/USER/PASS, BETA_MODE, PAYMENT_MODE, DOMAIN_PRICE_EUR/TRY, BANK_IBAN, BANK_ACCOUNT_HOLDER. 119/119 tests (email switch incl. port-465 fallback, beta gate incl. revoke + join-flip, reservation lifecycle incl. idempotency/failure-retry/uniqueness, webhook domain-vs-subscription split, migration v5). Verified live on dev: migration v5 applied to shared local.db; beta gate off→open, on→denied/badge/invited/admin-bypass (3 magic links, stranger 0); Playwright drove /admin/invites add+revoke and the admin pending panel confirm→paid→fulfill (graceful skip, no Porkbun). Test residue incl. the temporarily-set BETA_MODE cleaned from local.db (dev+prod share it). Operator activation still needed: SMTP/Resend + Porkbun + Stripe keys, BETA_MODE/PAYMENT_MODE/IBAN/price at `/admin/settings`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-07-08 | V2.0      | Landing inner body width alignment                                              | ✅ live  | Follow-up to `docs/screenshots/sc-7.jpg` / `sc-8.jpg`: the outer app canvas matched, but the landing content body still used `max-w-2xl` and a wider custom desktop padding, making it visibly narrower than dashboard/PageShell screens. Updated `src/routes/+page.svelte` only: landing hero and demo list now use `w-full max-w-4xl`, while the paragraph keeps its own readable `max-w-xl`; the landing canvas content padding now matches the default `AppCanvasShell` horizontal rhythm. Verified: `npx prettier --write src/routes/+page.svelte`, `npm test` (100/100), `npm run build`, `npm run check` after build regeneration, deployed with `pm2 restart saaskaya`. Live CDP comparison at 1365px desktop with an authenticated session: `/` and `/dashboard` both report shell width 976px, inner body width 894px, identical left/right offsets, and no horizontal overflow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-07-08 | V2.0      | Desktop canvas width normalization                                              | ✅ live  | Follow-up to the screenshot review (`docs/screenshots/sc-6.png`): the app screens shared `AppCanvasShell`, but each route still used different desktop canvas widths (`max-w-4xl`, `max-w-5xl`, `max-w-6xl`, editor `max-w-[96rem]`), so the product felt inconsistent when viewed side by side. Normalized the SaaS app canvas standard to one outer width (`max-w-5xl` → 1024px section / 976px shell at a 1440px desktop viewport), tightened the shell page padding, made `PageShell` inherit the same width by default, removed route-level canvas overrides from `/login`, `/login/verify`, `/new`, and `/editor/[siteId]`, and reduced the editor sidebar to keep the workbench usable inside the standard frame. Inner content widths (`PageShell max`, login/new form grids) remain local readability constraints, not competing canvas sizes. Verified: `npm run check`, touched-file Prettier check, `npm test` (100/100), `npm run build`, deployed with `pm2 restart saaskaya`. Full `npm run lint` is blocked by pre-existing formatting drift in `docs/PLAN.md` and `docs/specs/2026-07-08-beta-launch-hybrid-onboarding.md` only; touched files are formatted. Live CDP desktop measurements: `/`, `/login`, `/login/verify`, `/new`, `/dashboard`, `/account`, `/dashboard/seed-law/messages`, and `/editor/seed-law` all report canvas present, no horizontal overflow, shell width 976px, section width 1024px. `/admin/settings` uses the same `PageShell` standard in code; live admin measurement was not available in that smoke because the temporary session lacked admin rights.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-07-08 | V2.0      | SaaS app canvas consistency pass                                                | ✅ live  | Unified the customer-facing app screens around the landing page's browser-canvas philosophy so `/`, `/login`, `/login/verify`, `/new`, `/dashboard`, `/account`, `/dashboard/[siteId]/messages`, `/admin/settings`, and `/editor/[siteId]` now share one visual shell instead of mixing unrelated page frames. Added `src/lib/ui/AppCanvasShell.svelte` as the common browser-canvas container, refit `PageShell` onto it, preserved the landing composition, rebuilt `/new` and `/login` as canvas-native two-column flows, wrapped the editor workbench in the same shell, and restyled `ChatTab` with the app card/input/button system. Route behavior, auth guards, draft/editor persistence, generation, admin settings, and tenant public rendering were not changed. Verified locally: `npm run check`, `npm run lint`, `npm test` (100/100), `npm run build`. Deployed with `pm2 restart saaskaya`. Live checks: `/api/health` 200 db/disk ok, `/` 200 with the new asset hash, `/login` 200, `/new` signed-out 303 → `/login`. Headless Chromium smoke with dev echo/admin sessions captured `docs/screenshots/sc-1.png`, `sc-2.png`, `sc-3.png`, `sc-4.png`, `sc-5.png`, `sc-new.png`, and `sc-editor.png`; every checked route reported the shared canvas present and no horizontal overflow. Existing JPG screenshots were left in place intentionally; no git cleanup/commit was performed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-07-08 | V2.2      | Two-layer AI gatekeeper Phase 1 (revised spec)                                  | ✅ done  | Implemented `docs/specs/2026-07-08-two-layer-ai-gatekeeper.md` with the approved revisions (see the spec's Revisions block). **Layer 1:** `src/lib/server/ai/gatekeeper.ts` — forced `gate_message` tool call on `GATEKEEPER_MODEL` (default `claude-haiku-4-5`) through the existing `runToolCall` seam; input is a compact `siteOutline()` (never the full draft JSON) + last ~6 client-held chat turns; output validated by `gateSchema` (intent edit/question/off_topic/help_request + distilledPrompt + riskLevel) with one repair round-trip. **Chat endpoint** (`/api/sites/[id]/chat`) is now staged: gate → `redirect`/`reply`/`help` (0 Layer-2 tokens), low-risk edit auto-applies, medium/high returns a `proposal`; stateless confirm resends `{message, approvedPrompt, riskLevel}`; `force:true` overrides an off-topic verdict; invalid gate output degrades to the pre-gate single-layer path (gate is never a point of failure). **Risk routing:** low → `AI_MODEL_LIGHT` (default `claude-sonnet-5`), else `AI_MODEL` (Opus); `chatEdit` gained `model`/`approvedPrompt` (distilled + original message both sent). **Prompt caching:** `cache_control` on the system block in `runToolCall` (tools+system prefix, cross-tenant). **Credits:** migration v4 (`ai_usage.edit_count`/`generation_count` + `ai_gate_log`); 1 applied edit = 1 credit, 1 generation = 1 credit, gate free; limits `AI_EDITS_FREE/PRO` 10/50, `AI_GENERATIONS_FREE/PRO` 1/5; token limit stays as backstop; admins bypass credits only. **UI:** ChatTab rebuilt — onboarding greeting, approval card (📋 distilled prompt + honest draft-not-live risk copy, ✓ Uygula / ✗ İptal), off-topic "yine de gönder", one-click Geri Al (client snapshot + existing draft PUT), budget helper text. **Telemetry:** `ai_gate_log` decisions (redirected/answered/help/auto_applied/proposed/approved/forced/fallback) + `gateStats()` on the admin Ops card. Settings added: `GATEKEEPER_MODEL`, `AI_MODEL_LIGHT`, credit limits. Tests 100/100 (gate schema fixtures, repair, outline leak-check, endpoint stages incl. zero-L2 assertions + 429 + fallback, credit accounting incl. admin bypass, migration v4). Live AI smoke still deferred pending `ANTHROPIC_API_KEY`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-07-08 | V2.0      | Authenticated UI smoke + tenant block polish + PM2 maintenance                  | ✅ live  | Completed the remaining V2.0 verification/polish items except the explicitly deferred product-flow animation and operator credentials. Authenticated live smoke used magic-link dev echo sessions: `/dashboard` 200, `/account` 200, `/editor/seed-law` 200 with iframe, `/admin/settings` 200 with admin session; CDP checks showed no horizontal overflow on dashboard desktop, account mobile, editor desktop, and admin desktop. Editor interaction smoke: no-op content input dispatched and returned to `Saved`, locale switch to EN worked, viewport toggle changed preview frame from desktop (`width: 100%`) to mobile (`width: 375px`). Tenant/public site block polish was implemented without schema changes: `SiteHeader` sticky premium nav + locale pills; Hero/About/Services/Contact/Gallery/Team/FAQ/CTA/Footer spacing, cards, borders, typography, and CTA styling upgraded while staying inside the fixed component set. Verified locally: `npm run lint`, `npm run check`, `npm test` (76/76), `npm run build`. Deployed with `pm2 restart saaskaya`. Live checks: `/api/health` 200 db/disk ok; `/preview/seed-law` 200 with new asset hash; CDP screenshots for public preview desktop/mobile show no horizontal overflow, sticky header, and 5 rendered sections. PM2 maintenance: ran `pm2 update` to clear daemon/CLI drift; its first restore shell hung/left a new empty daemon visible, then `pm2 resurrect` restored `/root/.pm2/dump.pm2`; final `pm2 --version` = 7.0.3 and `saaskaya` is online.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-07-08 | V2.0      | SaaS UI redesign from Claude Design reference                                   | ✅ live  | Added `docs/specs/2026-07-08-saas-ui-redesign.md` as the implementation spec for the Claude Design reference at `docs/Saaskaya WaaS Landing Page/`. Rebuilt the SaaS product UI as Svelte/Tailwind/DaisyUI code rather than importing raw design-doc HTML: global tokens in `src/routes/layout.css`, Google font links in `src/routes/+layout.svelte`, shared UI components in `src/lib/ui/{BrandMark,AppCard,PageShell,StatusPill}.svelte`, and redesigned `/`, `/new`, `/login`, `/dashboard`, `/dashboard/[siteId]/messages`, `/account`, `/editor/[siteId]` chrome, and `/admin/settings`. Existing auth, form actions, generation, dashboard publish/domain/export actions, editor `DraftStore`/postMessage/autosave/preview/publish flow, and admin settings behavior were preserved. The paused landing product-flow animation was removed from active landing usage and deferred until after the static redesign is reviewed, so the future animation can be designed into the new warm editorial visual system instead of competing with it. Added `docs/Saaskaya WaaS Landing Page/` to `.prettierignore` to avoid formatting generated design-reference HTML/JS. Verified before deploy: `npm run lint`, `npm run check`, `npm test` (76/76), `npm run build`. Deployed with `pm2 restart saaskaya`. Live checks: `https://saaskaya.digitaltamam.com/` HTTP/2 200, `/login` HTTP/2 200, `/new` signed-out 303 → `/login`, `/dashboard` signed-out 303 → `/login`, `http://saaskaya.digitaltamam.com/` 301 → HTTPS, `/api/health` 200 `{"ok":true}` with db/disk ok. Headless Chromium screenshots verified new landing desktop/mobile and login mobile render without obvious horizontal overflow; long demo site names truncate cleanly on mobile.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-07-08 | V2.0      | Landing product-flow animation                                                  | ⏸ paused | User approved adding a 2D/2.5D product-flow animation to explain the app visually. Implemented draft files: `src/lib/marketing/ProductFlowAnimation.svelte` and updated `src/routes/+page.svelte` to use it as a full-bleed landing hero background with CTA + demo section. Local checks completed before pause: `npm run check` 0 errors, `npm test` 76/76, `npm run build` ok after `npm run format`. Remaining before calling done: rerun `npm run lint` after final formatting if needed; perform browser verification for desktop/mobile landing (animation visible, no horizontal overflow, text readable, reduced-motion acceptable, next section visible); then decide whether to deploy. Dev server browser verification was attempted but local port binding required escalation and the user paused before approval/completion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-07-08 | Product   | Product Vision & Roadmap v2                                                     | ✅ done  | Created `docs/PRODUCT_VISION_V2.md` to reconcile the original safe-schema MVP with the expanded product ambition: an impressive SaaS UI and an "AI WordPress for professionals" market position without becoming a WordPress clone or arbitrary-code builder. The doc separates saaskaya's own SaaS UI redesign from tenant website output, reframes "fixed component set" as a controlled component/token/media system, preserves the rule that AI never writes executable tenant HTML/CSS/JS, and lays out V2.0-V2.6: SaaS UI redesign, rich tenant site engine, chat-first editing, R2 media manager, account/billing/domain self-service, SEO/analytics, and scale/data split. Added the doc to `CLAUDE.md` as a canonical post-M6 roadmap reference.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-07-07 | UX        | Customer account route                                                          | ✅ done  | Added `/account` as the customer-owned profile/account surface, separate from super-admin-only `/admin/settings`. The route requires sign-in and shows account email/role, plan state (Free/Pro/grace), site/published/message totals, per-site data export links, sign-out, upgrade CTA when billing is configured, and current operator-handled deletion policy. Dashboard header now links to Account. Verified locally: `npm run lint`, `npm run check`, `npm test` (76/76), `npm run build`. Deployed with `pm2 restart saaskaya`; live checks: `/account` returns 303 → `/login` when signed out, `/dashboard` still returns 303 → `/login`, `/api/health` 200 with db/disk ok.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-07-07 | Tooling   | Google Stitch UI prompt-chain document                                          | ✅ done  | Created `docs/STITCH_PROMPTS.md` — a self-contained prompt chain for Google Stitch to generate each page's UI. Read the full codebase (CLAUDE.md, CONSTITUTION, PLAN, idea.md, Zod schema, all 9 blocks, presets, every route's `.svelte`) and distilled it into 10 prompts: (0) project overview + design system + schema, (1) landing, (2) /new describe-yourself, (3) /login magic-link, (4) /dashboard, (5) messages, (6) /editor (the complex 6-tab + iframe + viewport-toggle page), (7) /admin/settings, (8) public-site block renderer (all 9 blocks with variants), (9) responsive behavior summary. Each prompt lists exact DaisyUI classes, layout, data, interactions, and responsive rules so Stitch can build the page standalone. No code changes — documentation only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-07-07 | Hardening | Canonical custom-domain model + live deploy                                     | ✅ done  | Replaced draft-JSON domain routing with a canonical `custom_domains` table (`hostname` primary key) plus migration v3 that backfills legacy `draft.domain` rows. `attachSiteDomain` / `detachSiteDomain` now enforce one hostname → one site, keep the old draft `domain` field only as compatibility/display data, and dashboard + public routing + cancellation sweep all read from the table. Tests cover legacy migration, duplicate-domain rejection, domain replacement cleanup, published routing by canonical domain, and sweep behavior. Verified locally: `npm run lint`, `npm run check`, `npm test` (76/76), `npm run build`. Deployed with `pm2 restart saaskaya`; live checks: `/api/health` 200 `{"ok":true}` with db/disk ok, HTTP→HTTPS 301, `/` HTTPS 200, `/login` HTTPS 200, TLS certificate CN/SAN matches `saaskaya.digitaltamam.com`, PM2 app online. Note: PM2 reports daemon version drift (in-memory 6.0.14 vs local 7.0.3); not blocking, schedule `pm2 update` during maintenance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-07-07 | M6        | Migration runner + backups + monitoring + cancellation policy + audit fixes     | ✅ done  | **Migrations:** `src/lib/server/db/migrations.ts` — `schema_migrations` table, append-only versioned list, each migration in its own transaction (rollback-tested), resumable (pending-only), takes a raw better-sqlite3 client so the same runner will migrate per-tenant DBs later; v1 = baseline adopting pre-M6 DBs, v2 = `users.subscription_ends_at`; replaces the ad-hoc bootstrap in `db/index.ts`. **Policy (docs/POLICY.md):** webhook captures `current_period_end`; `subscriptionState()` = free/active/grace (`GRACE_DAYS` setting, default 30); dashboard shows "Pro · grace until X"; daily sweep (`sweepExpiredCustomDomains`) detaches domains of lapsed owners only (grace + seeds untouched) with courtesy email; `GET /api/sites/[id]/export` (owner-gated JSON download: draft + contact submissions) + dashboard button. **Ops:** `GET /api/health` (db + disk, 200/503); `scripts/monitor.sh` (5-min cron: double-probe, optional `MONITOR_AUTORESTART` pm2 restart, Resend alert to `ALERT_EMAIL`, 30-min flood guard); `scripts/backup.sh` (nightly cron: `sqlite3 .backup` online snapshot + `.env`, gzip, keep 14, `BACKUP_REMOTE` rclone/scp seam, triggers `/api/admin/tasks/daily` with `CRON_TOKEN`); admin settings page gained a System-status card + Ops settings group; cron installed on the VPS. **Audit fixes:** PUT draft can no longer create sites (404 on unknown ids) and requires sign-in; chat/publish/editor require sign-in (anonymous token-burn/vandalism closed; any signed-in user can still demo the ownerless seeds); custom domains are uniqueness-checked (409); webhook JSON.parse guarded (400). 72/72 tests (runner: fresh/idempotent/resumable/adopt/rollback; grace lifecycle incl. GRACE_DAYS; sweep selectivity; health). Verified dev+live: real backup + restore drill (valid sqlite, migrations intact); monitor silent when healthy, logs+no-restart on dead port; live `/api/health` 200 via nginx; export attachment; daily-tasks token auth (401 wrong/missing, 200 with token); crontab entries active.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-07-07 | Audit     | Whole-project check                                                             | ⚠️ done  | Read canonical docs and reviewed the current M5 codebase without code changes. Verified `npm run check`, `npm test` (63/63), `npm run lint`, and `npm run build` all pass. Findings to fix next: unauthenticated `PUT /api/sites/[siteId]/draft` can create an ownerless valid draft for arbitrary unknown ids, and ownerless drafts are publishable through the publish API because demos intentionally bypass ownership; custom domains are stored only inside draft JSON and are not uniqueness-checked, so a domain already pointed at this server can be attached to more than one site and public routing resolves an arbitrary matching row. Minor hardening: Stripe webhook parses signed JSON without a 400 guard for malformed payloads.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-07-07 | M5        | Admin credentials in DB + contact→Resend + Stripe + domains + badge             | ✅ done  | **Admin settings (operator request):** `app_settings` table + `src/lib/server/config.ts` registry (`getSetting`: DB → env fallback; secrets masked, write-only in UI) + `/admin/settings` (gate: `ADMIN_EMAILS` env → `locals.user.isAdmin` — deliberately env-based, the gate must not live in the DB it protects). AI key/model/limit + email + billing + domains all read through it; Anthropic client cache keyed by credential so rotation is live; invalid key → friendly AIUnavailable message. **Contact (PLAN §7):** Contact block posts `?/contact` on the public site (preview renders it inert via render-context); action = per-IP rate limit + zod → `contact_submissions` + best-effort Resend notify to `settings.contactEmail`; owner reads them at `/dashboard/[siteId]/messages`. **Email:** Resend via plain fetch in `email.ts`; magic links use it when configured, dev echo stays as fallback. **Stripe (fetch, no SDK):** `billing.ts` checkout session (`client_reference_id` = userId) + webhook HMAC verify (t/v1, 5-min tolerance, timing-safe) + idempotent status transitions on `users.subscription_status`; routes `/api/billing/{checkout,webhook}`; dashboard Plan card. **Domains:** attach-own-domain (validate + `dns.resolve4` vs `SERVER_IP` + save to draft + optional `scripts/provision-domain.sh` = nginx vhost + certbot, gated by `DOMAIN_PROVISION=1`); Porkbun seam (`checkDomainAvailability`/`registerDomain`/`createARecord` — re-verify endpoint paths when keys arrive); both flows 402-gated on subscription (admin bypass) per constitution §5. Badge links to `PUBLIC_APP_HOST`. 63/63 tests. Verified dev+live: settings save/mask/clear + 403 for non-admin; signed fake webhook → Pro badge, forged sig → 400; contact stored + listed + email skipped gracefully; free user 402 / Pro attach / detach; custom-domain Host reroute works in prod (nginx `x-forwarded-proto` required — direct-port curl needs the header).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-07 | M4        | Auth + dashboard + publish snapshots + Host routing + locale routes             | ✅ done  | **Auth:** magic-link (`/login` → single-use 15-min token, sha256-hashed at rest → `/login/verify` → 7-day DB session cookie `sk_session`); `src/lib/server/auth.ts` + `email.ts` seam (Resend M5; until then link is logged + echoed on-page when `AUTH_DEV_ECHO_LINK=1`); per-IP rate limit on login; `hooks.server.ts` → `locals.user`. **Dashboard** `/dashboard`: user's sites, publish/republish/unpublish (form actions), live URL per site. **Publish:** `site_versions` immutable snapshots + `sites.published_version` pointer; `POST/DELETE /api/sites/[id]/publish`; editor toolbar Publish button. **Host routing:** `src/hooks.ts` reroute → pure `resolveHostReroute` (`$lib/hostRouting.ts`): `<key>.<PUBLIC_APP_HOST>` → `/_site/<key>`, unknown hosts → custom-domain lookup ONLY when `PUBLIC_APP_HOST` is set (prod safety); `resolvePublishedByKey` also matches `json_extract(draft,'$.domain')`. **Public site:** `/_site/[siteKey]/[[locale=locale]]/[[page]]` serves the published snapshot only; default locale unprefixed, others `/en`,`/de`; `cache-control: max-age=60`. **Guards:** `/new` + `POST /api/sites` require sign-in (quota now per account `tenant-<userId>`, generated sites get `owner_user_id`); draft GET/PUT, chat, editor, preview enforce `canManageSite` (ownerless seeds stay open as demos). DB: `users`/`sessions`/`login_tokens`/`site_versions` + `ensureColumn` ALTERs in the bootstrap. 53/53 tests (auth lifecycle, publish immutability, host reroute). Verified end-to-end via curl + headless Chromium: login→dashboard→publish v2→v3 in editor UI; `seed-law.localhost:5183/de` renders in a real browser; snapshot immune to draft edits; 401/403/404 probes green. Deployed to the live preview.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-06 | M3        | AI loop: generate + translate + chat patch + token counter                      | ✅ done  | `src/lib/server/ai/` — `llm.ts` (single provider seam: `runToolCall` = forced tool-use via `@anthropic-ai/sdk` streaming + `finalMessage`; model `claude-opus-4-8` per claude-api skill, env-overridable `AI_MODEL`; typed errors AIUnavailable/AIInvalidOutput/QuotaExceeded). `schemas.ts` derives everything from the contract: single-locale `generatedSiteSchema`, per-target `translationSchemaFor`, constrained `patchOpSchema` (9 op types), `z.toJSONSchema` for tool inputs. `generate.ts`: create_site (default locale) → translate_site (other locales) → `assembleSite` merge with `syncMediaRefs` (URLs can't drift in translation) → final `siteSchema.parse`; **max one repair round-trip per call** (tool_result is_error + issues). `patch.ts`: pure `applyPatch` (clone → ops → `siteSchema.parse`), `chatEdit` with one repair. Token counter: `ai_usage` table (tenant×month) + `assertWithinQuota` (default 500k, `AI_MONTHLY_TOKEN_LIMIT`). Routes: `POST /api/sites` (describe→draft, 400/422/429/503 mapped), `POST /api/sites/[id]/chat`. UI: `/new` page, ChatTab real chat → `DraftStore.replace` → live iframe. site.ts refactored: `sectionShapes` (per-type props/content) is now the single source for both localized and gen schemas. 38/38 tests (mocked LLM: repair loop ≤1, invalid → AIInvalidOutputError, translation-structure mismatch rejected, patch ops incl. immutability + contract-breaking result). Verified: no-key → friendly 503 in API + chat UI; /new gates <30 chars; console clean. **Live smoke pending API key.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-07-06 | M2        | Editor shell + draft store + live postMessage + autosave                        | ✅ done  | `src/routes/editor/[siteId]/` — sidebar (Chat/Content/Theme/Pages/Languages/Settings tabs) + toolbar (viewport 375/768/100%, locale select, save status) + preview iframe. `src/lib/stores/draft.svelte.ts` `DraftStore` (runes): `update()` → notify bridge (postMessage snapshot into iframe) + 800 ms debounced autosave → `PUT /api/sites/[siteId]/draft`. Preview listens for `saaskaya:draft` messages (same-origin check + `siteSchema.safeParse` — invalid drafts never render, silently keeps last good). Drafts persist in SQLite via `src/lib/server/db/repo.ts` (lazy-seeded from `$lib/seed`; every read/write passes `siteSchema.parse`; `CREATE TABLE IF NOT EXISTS` bootstrap in `db/index.ts` until the M6 migration runner). `ContentFields.svelte` = generic schema-driven text editor (new blocks need no editor change; array add/remove deferred to M3 patch tool). Verified in headless Chromium (playwright-core + system chromium cache): headline edit → iframe h1 updates live, window marker survives (**no reload**); autosave persisted via API; color edit → `--color-primary` updates live; viewport toggle → iframe 375px; **0 horizontal overflow at 375px** (M1 leftover criterion); console clean; invalid edit (empty headline) → PUT 400, badge "Save failed", preview + DB keep last good. 22/22 tests, check 0 errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-07-06 | M1        | Blocks + registry + SiteRenderer + `/preview` SSR + presets                     | ✅ done  | 9 blocks in `src/lib/blocks/` (Hero/About/Services/Gallery/Contact/Cta/Faq/Team/Footer, 2 variants each) + `registry.ts` (mapped type; `blockFor()` is the single type-erasure point). `src/lib/render/`: `SiteRenderer.svelte` (theme via inline DaisyUI CSS vars from `theme.ts`, heading font via `--font-heading`), `SiteHeader.svelte` (nav + locale switcher via injected `hrefFor`/`localeHrefFor` so the renderer stays route-agnostic). Route `/preview/[siteId]/[[page]]?locale=` re-validates seeds with `siteSchema.parse` at the boundary. `src/lib/presets/` = 3 canonical themes; seeds now import them. Placeholder SVGs in `static/seed/**`. Verified end-to-end (verify skill): 9/9 site×locale SSR combos correct h1 + per-niche `--color-primary`; multi-page nav; dental defaults to `de`; 404s on unknown site/page; `?locale=fr` falls back; dev log clean; 18/18 tests; check 0 errors; build ok. Project verify skill saved at `.claude/skills/verify/SKILL.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-07-06 | M0        | Project renamed to **saaskaya**                                                 | ✅ done  | User decision. Renamed in `CLAUDE.md`, `AGENTS.md`-linked docs, README, `package.json`. `idea.md` left untouched (historical record, still says "Dijital Mentor").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-07-06 | M0        | Zod `Site` schema + 3 seed Sites + safeParse tests                              | ✅ done  | `src/lib/schema/site.ts` (strict objects, discriminated union over 9 section types, superRefine cross-checks). Seeds: law (2 pages, tests multi-page nav), psych, dental (defaultLocale `de`, tests non-TR default). 13 vitest tests green (`npm test`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-07-06 | M0        | Scaffold SvelteKit + Tailwind 4 + DaisyUI 5 + Drizzle                           | ✅ done  | `sv create` (minimal/ts) + add-ons: prettier, vitest (unit), tailwindcss, adapter-node, drizzle (sqlite + better-sqlite3). Zod 4.4.3, DaisyUI 5.6.13 (`@plugin 'daisyui'` in `src/routes/layout.css`). Verified: `npm run check` 0 errors, `npm test` 13/13, `npm run build` ok, dev server SSRs the 3 seeds with DaisyUI classes in built CSS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-06 | Pre-M0    | Governance layer created                                                        | ✅ done  | Created `CLAUDE.md`, `AGENTS.md`, `docs/{CONSTITUTION,PLAN,PROGRESS,CONVENTIONS}.md`. Lean-core process, English, Claude Code + cross-tool (`AGENTS.md`). No hooks/slash-commands yet.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

## Decisions log

- **2026-07-08 — Beta launch & hybrid onboarding planned (spec saved, not yet implemented).** Added
  `docs/specs/2026-07-08-beta-launch-hybrid-onboarding.md` and a backlog entry in `docs/PLAN.md`. The
  plan opens saaskaya to a closed beta (invite-only, selected professional groups) with three hybrid
  features: (1) email delivery via Hostinger SMTP (`nodemailer`) with Resend as a one-setting switch
  later — `EMAIL_PROVIDER` setting routes all mail through one provider-agnostic seam; (2) domain
  reservation with bank transfer (EFT/havale) payment — a new `domain_reservations` table tracks
  pending/paid/active status, the operator manually confirms payment at `/admin/settings`, then the
  existing `registerDomain` + `createARecord` + `provisionDomain` + `attachSiteDomain` pipeline runs;
  (3) `BETA_ALLOWLIST` setting gates `getOrCreateUser()` so only invited emails can sign in during
  closed beta. Constitution §5 (domain registration only after payment) is preserved: bank transfer
  confirmed by the operator **is** payment confirmation — the mechanism differs from Stripe webhooks
  but the principle is identical. No code changed in this task; documentation only. Status: planned —
  Phase 1 (email + access control) is the launch blocker.
- **2026-07-08 — Beta launch implemented (all 3 phases): migration v5, form actions, decoupled fulfillment.**
  The spec said "migration v4" but v4 is `ai-gatekeeper-credits`; the two new tables ship in **v5**.
  The five proposed `/api/billing/reserve/*` routes became **form actions** (reserve/report/cancel/
  Stripe on the dashboard, confirm/reject/fulfill on `/admin/settings`) to match every existing
  billing/domain operation and avoid fetch/CSRF client code; only the Stripe webhook stays a route.
  Domain fulfillment (register→DNS→certbot→attach — 120s+, partially irreversible) is **not** run in
  the confirm request or webhook: those only set `paid`; an idempotent `fulfillReservation` (status-
  guarded, availability re-checked, failures land on `failed` for retry) runs from the admin panel +
  the daily cron. The Stripe path is "operator-free" (cron auto-fulfills), not instant.
- **2026-07-08 — Beta gate is a table, admins bypass it, §5 stays clean.** Chose the `beta_invites`
  table + `/admin/invites` over the checklist's comma-string `BETA_ALLOWLIST`, so invites carry
  profession/status. `BETA_MODE` is the switch, enforced at both send and click. **Super admins
  bypass the gate** (shared env-based `isAdminEmail`, now also used by `hooks.server.ts`) so the
  operator can't lock themselves out. The "free beta gift" is a **subdomain only** — a real
  registration always requires payment, so the operator never funds an irreversible ICANN cost and
  constitution §5 holds without reinterpretation.
- **2026-07-08 — Email is a provider seam; fixed a real SMTP-port bug.** `EMAIL_PROVIDER`
  (smtp | resend | dev) switches transports live; nodemailer (the project's first heavy runtime dep,
  server-only) is justified by the beta reusing Hostinger's mailbox while Resend stays one setting
  away. Fixed the spec's `Number(getSetting('SMTP_PORT')) ?? 465` (`Number(undefined)` is `NaN`, so
  the fallback never fired) → `Number(getSetting('SMTP_PORT') ?? '465')`. A lone `RESEND_API_KEY`
  still routes to Resend for back-compat.
- **2026-07-08 — Gatekeeper stays all-Claude; constitution §2 unamended.** Phase 1 shipped with
  Haiku 4.5 as Layer 1 instead of the spec's Groq free tier: the gate reuses the tested
  `runToolCall` seam (no new provider code), user chat content never leaves the one vendor
  (KVKK/GDPR), and reliability doesn't rest on a free tier's ToS/limits — for a saving of only
  ~$2–3 per 1000 messages. Every layer is Claude tool-use, so §2 needs no amendment. The
  `GATEKEEPER_MODEL` setting is the escape hatch; enabling a non-Claude provider later WILL
  require the §2 amendment described in the spec, logged here first.
- **2026-07-08 — Layer 2 is risk-routed; the safety property is the Zod gate, not the model.**
  Low-risk edits run on `AI_MODEL_LIGHT` (Sonnet 5, ~2.5× cheaper than Opus per token);
  medium/high risk, force-sends and site generation stay on `AI_MODEL` (Opus 4.8). Every model's
  output passes the same `siteSchema.safeParse` + one-repair pipeline, so routing changes cost,
  not guarantees. Both models are operator-overridable at `/admin/settings`. Prompt caching
  (`cache_control` on the system block) was added at the same seam — the tools+system prefix is
  identical across tenants, so cache reads (~0.1×) apply fleet-wide.
- **2026-07-08 — AI budgets are credits, not weighted tokens.** The spec's "count Layer-1 tokens
  at ×0.1" contradicted its own plan table (10/50/200 _edits_). Shipped: 1 applied edit = 1 edit
  credit, 1 generation = 1 generation credit, gate/questions/redirects free, cancels free;
  `AI_MONTHLY_TOKEN_LIMIT` demoted to an abuse backstop. Simpler to enforce, matches the pricing
  table users will see, and makes the dashboard budget indicator (Phase 2) trivially explainable.
  Admins bypass credit limits (operator smoke tests must not burn plan quota) but never the
  token backstop.
- **2026-07-08 — Honest risk framing: chat edits touch the draft, publish stays separate.** The
  spec's "chat edits change your live site" copy was factually wrong and would have taught users
  distrust. Approval cards therefore exist for budget consciousness + intent confirmation, not
  safety: low-risk edits auto-apply with a one-click Geri Al (client-side snapshot + the existing
  draft PUT — no new server surface), and the card appears only for medium/high risk. All card
  and helper copy says "taslak" (draft) explicitly.
- **2026-07-08 — Two-layer AI gatekeeper planned (spec saved, not yet implemented).** Added
  `docs/specs/2026-07-08-two-layer-ai-gatekeeper.md` and a backlog entry in `docs/PLAN.md`. The plan
  introduces a Layer 1 gatekeeper (Groq Llama 3.3 70B free tier, Claude Haiku fallback) that
  classifies intent, distills the user's chat into a structured prompt, and assesses risk before the
  expensive Layer 2 (Claude Opus, existing `patch_site`/`create_site`) runs. Users approve the
  distilled prompt via an in-chat approval card before any site mutation. Motivation: cost control
  (~50% token saving by rejecting off-topic + cancelled requests), better UX (conversational
  onboarding per `PRODUCT_VISION_V2.md` §4.1), risk awareness (edits are not a toy), and
  monetization (top-up +€10, human help €25/session per §4.6/§6). Constitution §2 is **not** changed
  for Layer 2 (Claude tool-use remains the schema constraint); Layer 1 is provider-agnostic because
  it never produces site mutations — its output is validated against a `gatekeeperSchema` before use.
  This is a clarification of §2, not a principle change, and is logged here per the amendment
  process. Status: planned — implement after V2.0 SaaS UI Redesign lands. No code changed in this
  task; documentation only.
- **2026-07-08 — Product-flow animation follows the static SaaS redesign, not before it.** The prior
  landing animation draft remains in the repo but is no longer used by `/`. The redesigned static
  landing is now the baseline; a future animation should be rebuilt to support that visual system and
  verified on mobile/desktop after the core UI is approved.
- **2026-07-08 — Claude Design HTML is a visual spec, not app source.** The SaaS redesign maps the
  generated design doc into Svelte components, Tailwind/DaisyUI-compatible classes, and shared tokens.
  The generated HTML/JS reference is ignored by Prettier to avoid noisy churn. Tenant site output still
  follows the Zod `Site` schema and fixed renderer blocks.
- **2026-07-07 — Custom domains are canonical DB rows, not draft JSON.** Routing and uniqueness now
  use `custom_domains.hostname` as the primary key. The old `Site.domain` field is kept in sync only
  for editor/export compatibility while the schema still carries it; public resolution, dashboard
  listing, attach/detach, and cancellation sweep use the table. This makes one hostname → one site a
  database invariant instead of a best-effort JSON lookup.
- **2026-07-07 — Editing now always requires sign-in (behavior change).** Anonymous visitors could
  previously open the editor on the ownerless seeds; the audit showed that also allowed anonymous
  publish flips and AI-token burn via chat. Now `/editor`, draft GET/PUT, chat and publish all
  require a session; any signed-in user can still demo the seeds. The homepage "Edit" links land on
  the login page first — accepted cost.
- **2026-07-07 — Cancellation policy = grace window + daily sweep, not instant cut-off.**
  Paid features survive `status != active` until `subscription_ends_at + GRACE_DAYS` (default 30,
  setting). Enforcement is a daily sweep (cron → `/api/admin/tasks/daily` with `CRON_TOKEN`), not a
  per-request check — public-site serving stays DB-cheap and the policy has one auditable place.
  Only the custom domain is detached; the site keeps its subdomain and nothing is deleted.
- **2026-07-07 — Backups are `sqlite3 .backup` snapshots, not file copies.** Copying a live SQLite
  file risks a torn snapshot; `.backup` is consistent while the app runs. Nightly, gzip, keep 14,
  `.env` included (0600), off-site via `BACKUP_REMOTE` (rclone or scp) once the operator configures
  it. Restore drill is part of verification, not an afterthought.
- **2026-07-07 — Monitoring is a cron watchdog + `/api/health`, not Uptime Kuma.** idea.md suggests
  Kuma, but this shared VPS doesn't need another always-on service for one app: double-probe,
  optional pm2 auto-restart (`MONITOR_AUTORESTART`), Resend alert with a 30-minute flood guard.
  `/api/health` is also ready for any external uptime service.
- **2026-07-07 — Credentials live in the DB (plaintext) behind an env-defined admin gate.**
  `/admin/settings` writes to `app_settings`; DB value wins over env, so keys are added/rotated
  live with zero redeploys (operator request). Plaintext is accepted: the SQLite file sits on the
  operator's own root-only server and an encryption key stored next to the DB adds no real
  protection. The admin allowlist (`ADMIN_EMAILS`) stays in the environment on purpose — the gate
  must not be editable through the surface it protects. Revisit encryption-at-rest if the DB ever
  moves off this box.
- **2026-07-07 — nginx + certbot instead of Caddy on-demand TLS** for tenant custom domains: this
  VPS already serves ~27 production nginx sites on 80/443, so Caddy can't own the ports. Same
  intent (automatic per-domain TLS), infra-compatible mechanism: `scripts/provision-domain.sh`
  (vhost template → nginx reload → certbot), triggered on attach when `DOMAIN_PROVISION=1`.
- **2026-07-07 — Stripe + Resend + Porkbun over plain fetch, no SDKs.** Three small REST surfaces
  (one form-POST, one JSON POST, one HMAC check) don't justify three dependencies; the webhook
  signature is verified manually (timing-safe, 5-min tolerance) and unit-tested. Porkbun endpoint
  paths must be re-verified against their docs on first live use (no keys yet to test against).
- **2026-07-07 — R2 media deferred out of M5.** No block consumes uploaded media yet (seeds use
  placeholder SVGs; the AI is instructed to the same set) — building upload/storage now would be
  scope without a consumer. It lands together with the media manager; the settings registry is
  ready to hold the R2 keys.
- **2026-07-07 — DB-backed sessions instead of the PLAN's "short-lived JWT".** Single server + a DB
  hit on every request anyway → sessions are revocable, dependency-free, and simpler. Raw tokens
  (login + session) are never stored — sha256 hashes only. Revisit JWTs only if the app ever runs
  on more than one node. (Amends PLAN §8's mechanism, not its intent: magic-link + rate limit kept.)
- **2026-07-07 — Ownerless seed sites stay publicly editable as demos** (`canManageSite`: owner
  NULL → open). Generated sites always get an owner and are owner-only across editor/preview/draft/
  chat/publish. Kill the open-demo path when real customers arrive (M5).
- **2026-07-07 — Magic-link email seam with dev echo.** `sendMagicLink` logs the link and returns it
  for on-page display only when `AUTH_DEV_ECHO_LINK=1` (single-operator preview; no Resend until
  M5). MUST be disabled when real email lands.
- **2026-07-07 — AI quota is per account (`tenant-<userId>`), not per generated site** — otherwise
  every regeneration would reset the monthly budget (abuse hole).
- **2026-07-07 — Host reroute is fail-safe.** Unknown hosts are treated as tenant custom domains
  ONLY when `PUBLIC_APP_HOST` is explicitly configured; with no config, only `*.localhost`
  subdomains reroute — a missing env var can never blackhole the main app in prod.
- **2026-07-06 — AI code lives in `src/lib/server/ai/`, not `src/lib/ai/`.** SvelteKit's
  `$lib/server` guard guarantees the API key and prompts can never be bundled client-side.
  CONVENTIONS layout updated accordingly.
- **2026-07-06 — Generation is single-locale + translate step (PLAN §4), merged by `assembleSite`.**
  Media/link refs (`url`, `imageUrl`, `photoUrl`, `href`) are force-copied from the default locale
  into translations (`syncMediaRefs`) so URLs cannot drift; structure mismatches (lost section,
  missing text) are rejected as invalid output, never rendered.
- **2026-07-06 — Chat edits are constrained patch ops** (set_text/set_props/set_page_title/
  set_nav_label/set_theme/set_settings/add_section/remove_section/move_section), applied to a clone
  and re-validated as a whole `Site`. No free-form JSON writes; one repair round-trip like generation.
- **2026-07-06 — Model `claude-opus-4-8`** (claude-api skill, 2026-07), overridable via `AI_MODEL`.
  Tool inputs use plain (non-strict) tool-use: the contract's regex/min/max constraints aren't
  supported by API-side strict mode, and our own `safeParse` + repair is the real gate anyway.
  `runToolCall` in `llm.ts` is the seam for a fallback provider.
- **2026-07-06 — Draft flows one way: editor store → postMessage → preview; autosave → API → SQLite.**
  The iframe never fetches the draft itself; on `load` the editor re-pushes the current draft, so
  navigation inside the preview (page/locale change) keeps unsaved edits visible.
- **2026-07-06 — Validation at three gates, same schema.** Editor PUT (`safeParse` → 400 + issues),
  repo read/write (`parse` → throws), preview postMessage receiver (`safeParse` → silently keeps last
  good draft). An invalid draft can neither render nor persist — verified end-to-end in Chromium.
- **2026-07-06 — Editor UI chrome is English, tenant content is TR/EN/DE.** The editor is the
  operator's tool; site copy locales are the product feature.
- **2026-07-06 — `CREATE TABLE IF NOT EXISTS` bootstrap in `db/index.ts`** so a fresh clone runs
  without `db:push`; must mirror `schema.ts` until the real per-tenant migration runner lands (M6).
- **2026-07-06 — Browser verification via playwright-core + cached system Chromium**
  (`/root/.cache/ms-playwright/chromium-1228`, `executablePath` pinned) — no heavy browser download;
  recipe recorded in `.claude/skills/verify/SKILL.md`.
- **2026-07-06 — Dev preview deployed to `saaskaya.digitaltamam.com`** (no dedicated domain bought
  yet — constitution: real domain registration is M5-only, so this is a placeholder subdomain on an
  already-owned domain, not a customer-facing tenant domain). Setup, all on the shared VPS this repo
  already lives on (`/var/www/saaskaya` **is** the deploy path, confirmed same filesystem/host):
  `npm run build` (adapter-node) → **PM2** app `saaskaya` (`ecosystem.config.cjs`, port 3021,
  loopback-only) → **nginx** vhost `saaskaya.digitaltamam.com` (new file, existing sites untouched)
  → **certbot --nginx** (reused the existing Let's Encrypt account, no email on file). DNS A record
  for the subdomain already existed pointing at the VPS IP — no registrar step needed.
  `ecosystem.config.cjs` reads secrets from `.env` at load time (own tiny parser, no new dependency)
  so the committed file carries no secret values; `.env` stays gitignored as before.
  **Caveat:** this preview shares `local.db` with whatever `npm run dev` is run in this same
  checkout — fine for a solo-dev preview, revisit before any real second user touches it.
  Redeploy recipe: `npm run build && pm2 restart saaskaya`.
- **2026-07-06 — Blocks receive `locale` + `sectionId`, and UI chrome lives in the block.**
  Field labels of the contact form (platform chrome, not tenant copy) come from a per-locale
  dictionary inside the block; tenant copy stays in `content`. Keeps the schema lean.
- **2026-07-06 — Renderer is route-agnostic.** `SiteRenderer` never builds URLs; the hosting route
  injects `hrefFor(pageSlug)` / `localeHrefFor(locale)` (preview URLs now, published-domain URLs in
  M4) — same renderer everywhere.
- **2026-07-06 — Theme applied as inline DaisyUI CSS vars** (`themeStyle()` in
  `src/lib/render/theme.ts`): `--color-*` (+ computed `-content` contrast colors via luminance),
  `--radius-*`, `--font-heading/body`. No per-tenant CSS, no `<style>` generation — constitution-safe.
  Fonts use system fallbacks; webfont loading deliberately deferred (external dependency, revisit ~M4).
- **2026-07-06 — Svelte `class:` directives can't contain `/`** (e.g. `from-primary/15`) — Tailwind
  opacity-suffixed classes go in a `$derived` class string instead (see Hero). Convention for all blocks.

- **2026-07-06 — Schema: `props` = language-neutral knobs, `content[locale]` = all text _and_ media.**
  Media URLs repeat across locales (translate step keeps them in sync) — simpler uniform rule beats
  parallel-array alignment; revisit in M2 if editing makes it painful. All schema objects are
  `strictObject` so unknown AI keys are rejected, and `superRefine` enforces defaultLocale ∈ locales,
  unique page slugs, and nav→page integrity.
- **2026-07-06 — All three locales (tr/en/de) required in every `content` block.** `site.locales` is
  the _enabled_ set; content is always complete so switching a locale on never finds holes. The AI
  translate step fills non-default locales before validation.
- **2026-07-06 — Drizzle first slice: single `sites` table (id, tenant_id, draft JSON, updated_at)**
  in one local SQLite behind `src/lib/server/db/` — the per-tenant SQLite + repository layer comes
  with M4+, per PLAN §6.
- **2026-07-06 — Preview via iframe + live `postMessage`.** Rendering the tenant site in an isolated
  iframe avoids CSS/JS collisions with the editor; postMessage gives instant updates without reloads.
- **2026-07-06 — Single Zod schema as the contract.** One schema drives AI output, editor, and renderer;
  Claude tool-use + `safeParse` guarantee valid JSON → hallucination is structurally impossible.
- **2026-07-06 — Real domain registration deferred to M5.** Heaviest external dependency + irreversible
  cost; the first slice proves the value loop on a seed tenant with no domains/auth/billing.
- **2026-07-06 — 3 niche presets (law/psych/dental) + TR/EN/DE.** Presets are cheap data; GTM still
  focuses one niche (constitution non-goal).

## Error log

### 2026-07-09 — PM2 restart referenced a disappeared process ID

- **Incident:** during the temporary auth-echo smoke, `pm2 restart ecosystem.config.cjs --only
saaskaya --update-env` attempted to restart stale process ID 18, threw `Process 18 not found`, and
  nginx returned 502 until recovery.
- **Root cause:** the PM2 process list and daemon state diverged after repeated same-process
  restarts; the restart action retained an ID that no longer existed.
- **Fix:** removed the stale app entry, started `saaskaya` from `ecosystem.config.cjs`, saved the PM2
  list, and verified loopback + public health. Subsequent deployments use `pm2 startOrRestart
ecosystem.config.cjs --only saaskaya --update-env`, which handles an absent process.
- **Prevention:** deployment documentation must use `startOrRestart`, followed by loopback and public
  health checks; never assume a successful build means PM2 still serves it.

### 2026-07-09 — Login smoke POST rejected by CSRF protection

- **Incident:** the first curl login POST returned 403 and created no usable magic link.
- **Root cause:** the synthetic form request omitted the browser `Origin: https://saaskaya.com`
  header required by SvelteKit CSRF validation.
- **Fix:** repeated the request with the correct Origin; login returned 200 and the one-time/session
  chain passed.
- **Prevention:** production form smokes must send browser-equivalent Origin and content type; a 403
  must be diagnosed before changing auth code.

### 2026-07-09 — Production CRON_TOKEN insert failed on sqlite3 CLI

- **Incident:** the first direct production `app_settings` insert failed with `no such function:
unixepoch`; the subsequent daily-task probe returned 401 because no token had been stored.
- **Root cause:** the installed sqlite3 CLI does not expose the newer `unixepoch()` convenience
  function used in the one-off statement.
- **Fix:** generated a fresh token and stored the timestamp with the portable
  `CAST(strftime('%s','now') AS INTEGER) * 1000` expression; authenticated daily sweep then returned 200.
- **Prevention:** use the application repository for routine writes; when an operational SQLite CLI
  statement is necessary, prefer functions supported by the deployed CLI version and verify the
  write before probing its consumer.

### 2026-07-08 — Groq gatekeeper + DeepSeek Layer-2 provider seam

- Added the live `/admin/settings` `AI Providers` group with `GROQ_API_KEY`, Groq model/provider,
  `DEEPSEEK_API_KEY`, Flash/Pro models, Layer-2 provider, and global monthly budget fields.
- Reworked the single `runToolCall` seam: Groq uses its OpenAI-compatible forced function call for
  short Layer-1 triage; DeepSeek uses its Anthropic-compatible endpoint so existing tool-use repair
  conversations remain intact. Provider output still passes the same Zod schemas and one-repair
  boundary; no raw model HTML/CSS can reach the renderer.
- Beta defaults are Groq `llama-3.3-70b-versatile`, DeepSeek `deepseek-v4-flash` for generation and
  low-risk edits, and `deepseek-v4-pro` for approved medium/high-risk edits. Anthropic remains an
  operator-selectable provider; no silent paid fallback is enabled.
- Migration v7 records estimated cost as integer micro-USD in `ai_usage`; a global monthly
  `AI_GLOBAL_MONTHLY_BUDGET_USD` backstop defaults to `$5` and is shown in admin system status.
- Verification: 25 files / 129 tests, Svelte/TypeScript 0 errors/warnings, production build passed,
  production dependency audit found 0 vulnerabilities. Live Chromium admin verification found the
  provider/key fields and no console errors. Real Groq/DeepSeek calls remain intentionally unverified
  until the operator enters keys.

### 2026-07-08 — Provider test cost rounded one micro-USD high

- **Incident:** The Flash pricing test calculated 1681 instead of the mathematically exact 1680
  micro-USD.
- **Root cause:** binary floating-point represented the decimal sum just above the integer boundary,
  and conservative `Math.ceil` rounded it up.
- **Fix:** subtract a `1e-9` floating-point epsilon before `ceil`; non-integer costs still round up.
- **Prevention:** exact price examples for Groq, DeepSeek Flash, and DeepSeek Pro are unit tested.

### 2026-07-08 — R2-backed editor image uploads

- Added operator-managed R2 settings, the official AWS S3 client, migration v6 `media_assets`, and
  a server-only storage adapter. Uploads require a signed-in site manager, are rate limited, accept
  only signature-validated JPEG/PNG/GIF/WebP files, and enforce 8 MB/file plus 100 MB/site limits.
- Added `GET/POST /api/sites/[siteId]/media`. Objects use immutable unique keys below
  `sites/<siteId>/`; metadata is indexed by site/owner for quota and future media-library work.
- Added inline upload/replace controls for hero/about props plus gallery/team content media fields.
  Content media references are synchronized across enabled locales and still flow through the
  existing validated Site draft/autosave path; no raw tenant HTML/CSS was introduced.
- Added migration, validation, API authorization, spoofed-file, and nested media-path tests.
  Verification: 24 files / 125 tests, `svelte-check` 0 errors/warnings, production build passed,
  production dependency audit found 0 vulnerabilities.
- Live verification on `https://saaskaya.com`: authenticated editor upload returned 201, R2 CDN
  returned the same 47,757-byte PNG with 200, `media_assets` indexed it, and all temporary objects,
  sites, users, and sessions were removed. Playwright desktop 1365x900 and mobile 390x844 showed
  the upload control and CDN image with no overflow or console errors.

### 2026-07-08 — Live media smoke request failed SvelteKit CSRF validation

- **Incident:** The first CLI multipart upload returned 403 with `Cross-site POST form submissions
are forbidden`.
- **Root cause:** the manual curl request omitted the browser-provided
  `Origin: https://saaskaya.com` header; SvelteKit correctly rejected it.
- **Fix:** reran the smoke test with the matching Origin header; upload returned 201 and CDN fetch
  returned 200. The temporary session/data from both attempts was cleaned.
- **Prevention:** production POST smoke tests must include the public Origin header, as already
  documented for other SvelteKit form actions.

### 2026-07-08 — Production dependency audit initially could not resolve npm

- **Incident:** `npm audit --omit=dev` failed with `EAI_AGAIN registry.npmjs.org` inside the
  restricted network sandbox.
- **Root cause:** the audit endpoint requires external registry access.
- **Fix:** reran with approved network access; result was 0 production vulnerabilities.
- **Prevention:** run registry-backed audit commands with explicit network permission.

### 2026-07-08 — R2 media bucket and CDN custom domain activated

- Verified account-level R2 administration through the S3-compatible endpoint and confirmed the
  existing `saaskaya-media` bucket.
- Confirmed `cdn.saaskaya.com` is attached to that bucket through Cloudflare's R2 custom-domain API.
  Cloudflare manages the proxied CNAME to `public.r2.dev`; ownership and SSL are both active.
- Raised the custom-domain minimum from TLS 1.0 to TLS 1.2.
- End-to-end verification uploaded a temporary text object, read the same bytes through S3, fetched
  it publicly through `https://cdn.saaskaya.com/<key>` with HTTP 200, and deleted it. The bucket
  root intentionally returns 404 because R2 public buckets do not expose directory listings.

### 2026-07-08 — R2 provisioning credentials lacked bucket administration access

- **Incident:** Creating/listing `saaskaya-media` through Cloudflare REST returned HTTP 403
  `Authentication error`; the supplied R2 S3 credentials returned `AccessDenied` for both
  `ListBuckets` and direct `CreateBucket`.
- **Root cause:** the bearer token is not accepted as a Cloudflare account API token, and the S3
  credentials do not have R2 `Admin Read & Write` / account-level bucket administration permission.
- **Impact:** no bucket was created, no custom domain was attached, and existing DNS was unchanged.
- **Prevention:** provision R2 infrastructure with a dedicated account token carrying
  `Workers R2 Storage Write`; after bucket creation, issue a separate bucket-scoped object
  read/write key for the application.
- **Resolution:** replacement account credentials were validated later the same day; provisioning
  and CDN verification are recorded in the entry above.

### 2026-07-08 — Production domain migration to `saaskaya.com`

- Cloudflare DNS now points apex, `www`, and wildcard tenant hosts to `72.62.52.55`; the existing
  Serverkaya Cloudflare token was reused without exposing it.
- Installed Certbot's Cloudflare DNS plugin and issued a renewable Let's Encrypt certificate for
  `saaskaya.com` + `*.saaskaya.com`. Added tracked Nginx templates under `deploy/nginx/`, installed
  them under `/etc/nginx/sites-available/`, and redirected both `www` and the former
  `saaskaya.digitaltamam.com` preview URL to the new apex.
- `PUBLIC_APP_HOST` is now `.env`-driven with `saaskaya.com` as the production fallback. Updated
  host-routing fixtures, public support/config examples, canonical metadata, robots sitemap
  reference, and added `/sitemap.xml`.
- Verification: `npm run check` = 0 errors/warnings; `npm test` = 21 files / 119 tests;
  `npm run build` passed. Public DNS resolves all three host patterns; apex HTTPS and health return
  200; HTTP, `www`, and legacy host redirects are correct; certificate SAN covers apex + wildcard;
  Certbot renewal dry-run succeeded; desktop 1365x900 and mobile 390x844 Chromium screenshots
  render without visible overflow.
- Cloudflare records remain DNS-only. The token can edit DNS but returns 403 for zone SSL settings,
  so proxy activation is intentionally deferred until `Full (strict)` is confirmed in the dashboard.

### 2026-07-08 — PM2 restart retained the former application host

- **Incident:** After the first domain deploy, `pm2 restart saaskaya` printed `Use --update-env`;
  `pm2 env 18` still showed `PUBLIC_APP_HOST: saaskaya.digitaltamam.com`, causing the new apex to
  be treated as a custom tenant domain and return 404.
- **Root cause:** restarting by process name preserves the process's existing environment instead
  of reloading `ecosystem.config.cjs`.
- **Fix:** restarted with
  `pm2 restart ecosystem.config.cjs --only saaskaya --update-env`, then ran `pm2 save`.
- **Prevention:** the exact deploy command is recorded in `docs/project-memory.md`; live host and
  apex status are checked after every environment-bearing deploy.

### 2026-07-08 — `pm2 update` left the daemon empty until resurrect

- **Incident:** During V2.0 maintenance, `pm2 update` stopped all PM2 apps and began restoring from
  `/root/.pm2/dump.pm2`, but the shell stayed open without completing. A separate `pm2 ls` spawned a
  new daemon showing an empty process list.
- **Root cause:** PM2 daemon replacement did not finish cleanly in the original shell; the saved dump
  still existed, but the new daemon had not loaded it.
- **Fix:** Ran `pm2 resurrect`, which restored all dumped processes, then explicitly restarted
  `saaskaya`. Final checks: `pm2 --version` = 7.0.3, `saaskaya` online, `/api/health` 200.
- **Prevention:** Treat `pm2 update` as a full maintenance action on this shared VPS: keep a second
  shell ready, verify `pm2 ls`, and run `pm2 resurrect` immediately if the daemon comes back empty.

### 2026-07-07 — Host routing dead on the live server (`GET /de` → 404)

- **Incident:** After deploying M4, `curl -H "Host: seed-law.saaskaya.digitaltamam.com"
http://127.0.0.1:3021/de` returned the app's 404 — the reroute hook never fired, although the
  same flow worked in dev and `PUBLIC_APP_HOST` was confirmed present in the process env.
- **Root cause:** adapter-node's `ORIGIN` env var (set in `ecosystem.config.cjs` at first deploy)
  pins `event.url` to one fixed origin for **every** request — the incoming `Host` header is
  ignored, so `resolveHostReroute` always saw the main host and passed through.
- **Fix:** replaced `ORIGIN` with per-request header derivation: `PROTOCOL_HEADER=x-forwarded-proto`
  - `HOST_HEADER=host` (safe: port 3021 is loopback-only behind nginx). CSRF still passes since the
    derived origin matches the browser's `Origin` header.
- **Prevention:** comment in `ecosystem.config.cjs` explains why ORIGIN must not come back; the
  verify skill now includes a live Host-routing smoke step. Note: SvelteKit's CSRF check means
  plain curl POSTs to form actions need an `Origin:` header on the live server — that 403 is
  correct behavior, not a bug.

### 2026-07-06 — repo tests leaked into `local.db` (flaky on second run)

- **Incident:** `npm test` failed on the 2nd consecutive run:
  `AssertionError: expected { id: 'seed-law', … } to be null` in
  `repo.test.ts > lazily seeds a draft` — the "virgin DB" assertion found pre-existing data.
- **Root cause:** the test set `process.env.DATABASE_URL = ':memory:'` in `beforeAll`, but
  `$env/dynamic/private` snapshots `.env` when Vite starts — the override was too late, so tests
  silently used the file DB `local.db`; the first run seeded it, the second run read the leftovers.
- **Fix:** pin the env where it is early enough: `"test:unit": "DATABASE_URL=:memory: vitest"` in
  `package.json`; removed the ineffective in-test override.
- **Prevention:** verified `npm test` twice back-to-back stays green and creates no `local.db`.
  Rule: never override `$env/*` values from inside test code — set them in the npm script.

<!-- Template for an error entry:
### YYYY-MM-DD — <short title>
- **Incident:** what failed (with the exact error line).
- **Root cause:** the underlying reason (traced from the real log, not guessed).
- **Fix:** the minimal change made.
- **Prevention:** rule/test added so it can't recur.
-->

### 2026-07-09 — Live Groq + DeepSeek provider activation

- Verified the operator-entered credentials without exposing them. Groq provides
  `llama-3.3-70b-versatile`; DeepSeek provides `deepseek-v4-flash` and `deepseek-v4-pro`.
- Added an explicit `saaskaya/1.0` user agent for Groq because Cloudflare rejected the runtime's
  default request fingerprint.
- Disabled DeepSeek V4 thinking mode for forced tool calls; its API rejects `tool_choice` while
  thinking is enabled. Provider 400/422 responses now map to controlled 503 responses.
- Verified with `npm run check`, 25 test files / 129 tests, and `npm run build`; deployed through
  PM2 and confirmed `/api/health`.
- Production smoke: Groq classified a low-risk edit and DeepSeek V4 Flash applied the validated
  patch (`200`, `kind=applied`). Usage was 10,037 input + 282 output tokens, estimated at
  `$0.001325`. All temporary user/session/site/usage/log records were deleted.

### 2026-07-09 — PM2 loaded a stale build manifest

- **Incident:** Post-deploy verification found `GET /login` returning 500 with
  `ERR_MODULE_NOT_FOUND` for a hashed `build/server/chunks/nodes/*` module.
- **Root cause:** The running process held an older hashed manifest while the completed build
  directory contained a newer, internally consistent manifest/chunk set.
- **Fix:** Restarted `saaskaya` after confirming the build manifest and referenced chunks matched,
  then saved the PM2 process list.
- **Prevention:** Every deployment must probe at least one page route in addition to `/api/health`;
  the health endpoint does not dynamically import page nodes and therefore cannot detect this class
  of stale-manifest failure.

### 2026-07-09 — Admin-managed closed-beta invitations

- `/admin/invites` now owns the complete operator workflow: enable/disable closed beta, enter a
  customer's email and optional profession, send the invitation, and revoke/reactivate access.
- Sending first upserts the normalized email into `beta_invites`, then delivers a durable
  `/login?email=...` invitation through the configured email provider. The login form pre-fills the
  validated email and generates its short-lived, single-use magic link only when requested.
- Delivery failure is explicit and does not discard the allowlist entry, so the operator can retry.
  Resend is selected and its key is configured; `EMAIL_FROM` still needs a Resend-verified sender
  address before invitations to arbitrary customers can be relied upon.
- Verified: Prettier, `svelte-check` (0 errors/warnings), 25 test files / 130 tests, production
  build, and live deployment. Live probes: invitation login URL 200 with the email pre-filled,
  signed-out `/admin/invites` 303 to login, and `/api/health` 200.

### 2026-07-09 — Beta generation incident fix and operational error log

- **Customer incident:** The first invited beta user's `POST /api/sites` returned an internal error.
  PM2 showed the Anthropic SDK refusing DeepSeek generation because `max_tokens: 16000` triggered
  its default “may take longer than 10 minutes; streaming required” heuristic.
- **Provider fix:** DeepSeek's Anthropic-compatible streaming response then proved incompatible with
  the SDK parser (`Unexpected non-whitespace character after JSON`). The final fix keeps
  non-streaming tool calls and configures an explicit five-minute client timeout, bypassing the
  SDK heuristic without using the incompatible SSE parser. A production generation smoke passed in
  25 seconds: 4,371 input + 3,140 output tokens, estimated `$0.001492`; its validated site and all
  temporary auth/usage records were deleted.
- **Observability:** Migration v8 adds privacy-safe `error_events`. Global SvelteKit failures and
  controlled site-generation AI failures now receive `err-xxxxxxxx` references, persist route,
  method, status, user/site IDs, sanitized message/stack, and emit matching structured PM2 JSON.
  `/admin/settings` lists the 30 most recent errors, unresolved count, stack details, and a Resolve
  action. Credentials and user-provided site descriptions are not stored.
- **Security:** Production can no longer expose failed magic-link tokens through dev echo even if
  `AUTH_DEV_ECHO_LINK=1` remains in environment; echo now also requires non-production mode.
- **Environment finding:** PM2 production uses `data/production.db`, while workspace `.env` points
  to `local.db`; production diagnostics must read the PM2 environment first.
- **Verification:** `svelte-check` clean, 26 test files / 132 tests, production build, migration v8
  present in production, live `/`, `/login`, and `/api/health` all 200, no smoke residue.

### 2026-07-09 — Phase 1/2 health audit and production smoke refresh

- Audited `docs/specs/2026-07-09-hostinger-horizons-competitive-roadmap.md` against the current
  repo and live site. Phase 1 is materially complete: ICP/pricing/unit economics are documented in
  `docs/specs/2026-07-09-phase1-gtm-pricing-legal.md`, and the live pricing + six legal routes all
  return 200. Remaining Phase 1 caveat: legal copy is still operator/legal-counsel review material,
  not a paid-public-launch legal approval.
- Phase 2 is partially implemented, not exit-gate complete. Implemented: anonymous guided Q&A on
  `/new`, pending onboarding session/cookie, login handoff, `/api/onboarding/finish`, answer
  validation, guarded free-text answers, rate limits, answer preservation before generation, and
  tests. Missing against the roadmap: 3 curated visual directions before spending a generation
  credit, editor completion checklist / next-best action, and beta funnel metrics for median
  time-to-preview + 70% preview reach.
- Updated `scripts/smoke-production.mjs` because its old `/new` expectation was obsolete. `/new`
  now intentionally returns 200 while the auth/abuse gate lives at `/api/onboarding/finish`. The
  smoke also covers `/pricing` and all current legal pages.
- Verification: `npm test` passed (32 files / 200 tests), `npm run check` passed with 0
  errors/warnings, `npm run build` passed, and refreshed production smoke passed on mobile + desktop.
  Live checks: HTTP→HTTPS 301, apex 200, `www`→apex 301, `/api/health` 200, `/sitemap.xml` 200,
  `/new` 200, `/pricing` 200, all legal pages 200, and tenant routes
  `site-6e8106ca.saaskaya.com/` + `seed-law.saaskaya.com/de` 200. TLS certificate covers
  `saaskaya.com` and `*.saaskaya.com`, expiring 2026-10-06.

### 2026-07-09 — Build during live audit triggered stale PM2 manifest

- **Incident:** During the health audit, running `npm run build` on the live checkout rewrote the
  adapter-node build assets while the running PM2 process still held the previous manifest. The
  first refreshed production smoke then saw 502 asset loads and tenant public routes returned 500
  with missing hashed chunk imports.
- **Root cause:** The production process serves the same checkout/build directory used by local
  verification. A build without an immediate PM2 restart creates a manifest/assets mismatch for the
  running Node process.
- **Fix:** Restarted with `pm2 restart ecosystem.config.cjs --only saaskaya --update-env`, saved the
  PM2 process list, and re-ran production smoke. PM2 env confirmed `NODE_ENV=production`,
  `DATABASE_URL=data/production.db`, and `PUBLIC_APP_HOST=saaskaya.com`.
- **Prevention:** Treat `npm run build` on this live checkout as a deploy step: either build in an
  isolated release directory, or immediately restart PM2 before browser smoke. The smoke script now
  probes page routes and legal routes, not just `/api/health`, so this class of failure is caught.

### 2026-07-09 — Phase 2 closure sprint opened

- Added `docs/specs/2026-07-09-phase2-closure-sprint.md` as the active implementation spec for
  closing the Hostinger Horizons roadmap Phase 2 exit gate. The sprint is deliberately narrow:
  curated onboarding directions, clearer generation credit/progress/retry states, editor completion
  checklist, onboarding funnel telemetry, and end-to-end verification.
- Explicitly kept Phase 3+ work out of scope: new blocks, 6–9 full kits, `siteQualityCheck`,
  persistent revisions, media-library UX, and commercial self-service.
- Updated `docs/PLAN.md` so the current roadmap points to the 2026-07-09 Hostinger Horizons roadmap
  and the new Phase 2 closure sprint, while correcting stale backlog statuses for the already
  implemented gatekeeper and closed-beta/hybrid onboarding work.
- Verification: documentation-only change; no runtime checks required. The previous health audit's
  latest code/build/live-smoke evidence remains current for the sprint baseline.

### 2026-07-09 — Phase 2 closure Task 1: curated onboarding directions

- Added `src/lib/onboarding/directions.ts` with exactly three controlled launch-niche visual
  directions: `warm_trust`, `modern_clinic`, and `calm_minimal`. Each direction carries a Turkish
  label, promise, tone hint, section-emphasis hint, and preview copy. These are deterministic prompt
  steering hints only; no free-form layout, tenant HTML/CSS, or new block types were introduced.
- Added the required `visualDirection` onboarding question after `tone` in
  `src/lib/onboarding/questions.ts`. It uses the direction module's Zod enum schema, persists through
  the existing pending onboarding session, and remains unguarded because it is a fixed choice.
- Updated `/new` to render the visual-direction question as three cards while keeping all other
  choice questions on the existing button UI. The selected card is saved through the existing
  `/api/onboarding/answer` path, so no separate server action or schema bypass was added.
- Updated `composeDescription()` to include the selected direction as a deterministic Turkish
  steering sentence for the existing `/api/sites` generation contract. The raw-description escape
  hatch still bypasses the composer exactly as before.
- Updated onboarding API fixtures for the new required question and added tests for direction
  ordering/schema/options plus composer output.
- Verification: targeted onboarding tests passed (5 files / 56 tests), `npm run check` passed with
  0 errors/warnings, and full `npm test` passed (33 files / 206 tests). `npm run build` was not run
  because this checkout is the live build directory and build would require an immediate PM2 restart;
  deploy/build verification is deferred until the sprint's deploy step.

### 2026-07-09 — Phase 2 closure Task 2: generation credit/progress/retry clarity

- Updated `/new` final review state to explain before generation that one site-generation credit is
  spent, direct text/theme/media edits are free, creative AI rewrites use credits, and failed
  generation does not discard answers.
- Added staged generation copy in `src/routes/new/+page.svelte`: answers prepared → validated site
  draft being generated → editor opening. The button and inline busy bubble now show the current
  stage instead of a generic spinner-only state.
- Improved retryable failure copy for `/api/sites` errors and network failures. Existing `errorId`
  references from the generation endpoint are preserved without duplicate reference text, and the
  user is told that answers remain available for retry.
- Verification: `npm run check` passed before and after formatting, full `npm test` passed (33 files
  / 206 tests), and targeted Prettier checks passed. `npm run build` remains deferred until deploy
  because this checkout serves production build assets.

### 2026-07-09 — Phase 2 closure Task 3: editor first-run completion checklist

- Added `src/lib/editor/completionChecklist.ts`, a deterministic guidance helper that derives six
  first-run checklist items from the current draft: homepage headline, contact path, services,
  languages, media, and publish. It takes `publishedVersion` as an option so publish state is
  guidance-only and never blocks the schema or publish API.
- Added tests covering fixed item order, tab targets, published-version behavior, and first
  incomplete next-action selection.
- Updated `src/routes/editor/[siteId]/+page.svelte` to show a compact "İlk yayın checklist" panel
  above the existing editor tabs. The panel surfaces the next best action and lets the user jump to
  the relevant existing tab (`Content`, `Settings`, or `Languages`). No new schema fields, block
  types, publish blockers, or arbitrary tenant HTML/CSS were added.
- Verification: targeted checklist test passed (1 file / 4 tests), `npm run check` passed, full
  `npm test` passed (34 files / 210 tests), and targeted Prettier checks passed. Build/deploy smoke
  remains deferred until the sprint deploy step for the live-build-directory reason already logged.

### 2026-07-09 — Phase 2 closure Task 4: onboarding funnel telemetry

- Added migration v10 (`onboarding-events`) and the `onboarding_events` Drizzle table for
  privacy-safe funnel telemetry. The table stores only ids, event names, route/source, optional
  duration, and optional error id — no raw answers, generated descriptions, credentials, or user
  copy.
- Added `src/lib/server/onboarding/telemetry.ts` with append-only event recording, recent-event
  listing, funnel summary (`started` → `generation_succeeded` preview reach), and duplicate-reducing
  editor-open detection by site id.
- Wired events into the Phase 2 flow:
  - `started` when a new pending onboarding session is created;
  - `answer_saved` after each accepted answer;
  - `completed` when `/api/onboarding/finish` composes the generation description;
  - `generation_started` / `generation_succeeded` / `generation_failed` in `/api/sites` when an
    optional `onboardingPendingId` is present;
  - `editor_opened` when the editor is opened from the onboarding handoff query.
- Updated `/new` to pass the pending id from finish → generation and then to editor as a query
  marker. Existing non-onboarding `/api/sites` callers remain compatible because the new field is
  optional.
- Added tests for telemetry event writes, privacy expectations, summary calculation, editor-open
  detection, and migration v10. Verification: targeted backend tests passed (5 files / 41 tests),
  full `npm test` passed (35 files / 213 tests), `npm run check` passed after formatting, and
  telemetry/migration targeted tests passed again after formatting. Build/deploy smoke remains
  deferred until the sprint deploy step.

### 2026-07-09 — Phase 2 closure deploy and smoke verification

- Built and deployed the Phase 2 closure work with `npm run build` followed immediately by
  `pm2 restart ecosystem.config.cjs --only saaskaya --update-env` and `pm2 save`, avoiding the
  stale-manifest gap documented earlier. Migration v10 (`onboarding-events`) applied during the
  build/start cycle and is present in `schema_migrations`.
- Production smoke passed with `node scripts/smoke-production.mjs`: mobile + desktop public surface,
  landing/login, protected route expectations, `/new`, `/pricing`, all legal pages, sitemap, health,
  404 behavior, no horizontal overflow, no broken images, and no browser console/page errors.
- Additional live probes passed: `/api/health` returned db/disk ok, `/new` returned 200,
  `/editor/site-6e8106ca` redirected signed-out users to login, and
  `https://site-6e8106ca.saaskaya.com/` returned 200.
- Ran a public `/new` browser smoke through the first questions until the new visual-direction step:
  exactly 3 direction cards rendered, 390px mobile overflow was 0, and no console errors appeared.
  That smoke created one pending onboarding/event residue (`pending-7aead4f9`); it was deleted from
  `pending_onboarding` and `onboarding_events`, verified back to zero rows for that id.
- Full authenticated AI-generation E2E was not run in this pass because it spends live model
  credits and requires controlled test-account/site cleanup. The implementation now has deployed
  instrumentation to measure that path with the next real or explicitly approved controlled beta
  smoke.

### 2026-07-09 — Phase 2 closure controlled authenticated E2E smoke

- After operator approval, ran a controlled live authenticated E2E smoke with a temporary DB-backed
  session rather than enabling magic-link dev echo. The successful run covered:
  `/new` → guided answers → visual direction selection → generation credit review → live
  Groq/DeepSeek generation → editor → "İlk yayın checklist" visible → publish → public tenant
  subdomain returned 200.
- Successful smoke evidence: generated `site-43d38e9f` from `pending-c5ed8e10`, published public
  route returned 200, desktop overflow was 0, browser console errors were empty, and onboarding
  telemetry contained `started`, 17× `answer_saved`, `completed`, `generation_started`,
  `generation_succeeded`, and `editor_opened`.
- Cleanup completed and was verified: temporary users, sessions, generated sites, site versions,
  tenant AI usage, pending onboarding records, and onboarding events all returned 0 rows for the
  smoke ids. `/api/health` remained db/disk ok after cleanup.
- One earlier mobile attempt had already reached the editor after generation but failed the test
  harness because the mobile iframe was attached but considered hidden by Playwright; that generated
  `site-cb40847d` was also fully cleaned up. The rerun used desktop viewport and an attached-iframe
  assertion, then completed publish successfully.
- Follow-up asset check: current HTML references `start.Dvy7Qfvq.js`; both normal and Brotli asset
  requests return 200, and a fresh `/new` browser load produced no console errors or failed
  requests. Older PM2 log ENOENT lines referred to previous hashed assets during earlier build
  transitions and are not current.

### 2026-07-09 — Phase 3: quality gate wired into publish

- Wired `siteQualityCheck()` into `POST /api/sites/[siteId]/publish`. The repository snapshot function remains pure; the route now blocks publish with HTTP 422 when quality blockers exist and returns the quality report on both blocked and successful publish responses.
- Updated the editor to compute quality from the current draft and show a compact "Kalite kontrol" panel with blocker/warning counts and the first issues. Publish is disabled client-side when blockers exist, while the server-side route remains the real enforcement point.
- Added publish API tests covering a quality-passing draft and a blocked draft with an unsafe professional outcome claim.
- Verification: targeted quality/publish tests passed (2 files / 11 tests), full `npm test` passed (41 files / 258 tests), `npm run check` passed with 0 errors/warnings, and Prettier checks passed for touched quality/publish/editor files.

### 2026-07-09 — Phase 3: psych-specific quality rules

- Extended `siteQualityCheck()` with launch-niche (`psych`) rules without adding blocks or changing the tenant schema.
- Added psych warnings for missing FAQ, too-thin services, missing confidentiality/professional-ethics copy, and missing appointment/session path copy. These are warnings, not blockers, so they guide cleanup without stopping a structurally safe publish.
- Added a psych blocker for prescription/diagnosis authority claims such as "ilaç yazar", "reçete yazar", or "tanı koyar", because that crosses the psychologist-site scope and needs operator review.
- Added tests for the psych warnings and prescription/diagnosis blocker. Verification: targeted quality tests passed (1 file / 11 tests), full `npm test` passed (41 files / 260 tests), `npm run check` passed with 0 errors/warnings, and Prettier checks passed for the quality files.
- Deployment intentionally skipped per operator choice; these changes remain local until a later controlled deploy.

### 2026-07-09 — Phase 3: first psych professional kit recipe

- Added the first controlled psych professional kit recipe without adding schema fields or block types: `src/lib/kits/psych.ts` exports `calm-intake` / "Sakin İlk Görüşme".
- The kit produces a validated `Site` using the existing fixed blocks in this order: hero, about, services, FAQ, CTA, contact, footer. Copy is Turkish-first with EN/DE localized content, emphasizes confidentiality/ethics, clear service areas, appointment path, and safe informational footer language.
- The recipe deliberately avoids `/seed/` media references so it does not carry placeholder-media warnings; authentic media remains a later Phase 5 concern.
- Added `src/lib/kits/index.ts` and tests proving the kit is registered, schema-valid, uses only fixed blocks, passes the Phase 3 quality gate without blockers or psych-specific warnings, and contains no seed media references.
- Verification: targeted kit/quality tests passed (2 files / 15 tests), full `npm test` passed (42 files / 264 tests), `npm run check` passed with 0 errors/warnings, and Prettier checks passed after formatting. Deployment intentionally skipped per operator choice.

### 2026-07-09 — Phase 3: psych kit connected to onboarding direction

- Connected the `calm-intake` / "Sakin İlk Görüşme" psych kit to the `warm_trust` visual direction. The `/new` visual-direction card now surfaces the kit label and outcome before generation, while the other curated directions remain non-kit directions.
- Updated the onboarding composer to include a deterministic kit reference when `warm_trust` is selected. The steering text stays inside the existing schema-constrained generation contract and explicitly keeps generation within the fixed block set.
- Exported the kit slug type through `src/lib/kits/index.ts` and added tests proving the kit binding and composer steering text.
- Verification: targeted onboarding/kit tests passed (3 files / 21 tests), `npm run check` passed with 0 errors/warnings, full unit suite passed (42 files / 266 tests), and Prettier checks passed for the touched files after formatting. Deployment intentionally skipped per operator choice.

### 2026-07-09 — Phase 3: local onboarding kit smoke

- Ran a local real-browser smoke on `http://127.0.0.1:5173/new` with a temporary DB-backed user/session and the launch psych path: psych niche → warm tone → `warm_trust` visual direction → multi-language/contact/booking/services answers → final generation click.
- Verified the `/new` visual-direction card renders the kit label `Kit · Sakin İlk Görüşme` and kit outcome before generation.
- Verified the actual `POST /api/sites` browser request payload contains the deterministic kit steering text: `Kit referansı: Sakin İlk Görüşme`, `calm-intake`, and `Sabit blok setinin dışına çıkma`.
- Full AI generation/editor handoff could not be verified locally because this environment has no Groq/DeepSeek API keys configured. The generation endpoint returned the expected 503 provider-configuration failure (`DeepSeek is not configured`), so no local site was created.
- Cleanup completed: the temporary smoke user, session, generated-site rows (none), pending/onboarding telemetry rows, AI usage row, and 7 expected local missing-API-key error-log rows were removed. Deployment remains intentionally skipped.

### 2026-07-09 — Phase 3 deploy and controlled live smoke

- Deployed the Phase 3 kit/quality/onboarding changes to production with `npm run build`,
  `pm2 restart ecosystem.config.cjs --only saaskaya --update-env`, and `pm2 save`.
- Pre-deploy verification passed: full unit suite (42 files / 266 tests), `npm run check` with
  0 errors/warnings, and production build.
- Post-deploy read-only production smoke passed: `/api/health` db/disk ok, `/new` returned 200 with
  the new asset manifest, and `node scripts/smoke-production.mjs` passed for the mobile + desktop
  public surface.
- Ran a controlled live authenticated E2E smoke with a temporary DB-backed user/session:
  `/new` psych onboarding → `warm_trust` visual direction → real `POST /api/sites` with the
  `calm-intake` kit reference → Groq/DeepSeek generation → editor → quality panel → publish → public
  tenant host.
- Successful smoke evidence: generated `site-2a4436d5` from `pending-e8d444ae`; `POST /api/sites`
  returned 200 with 4,112 input tokens, 5,581 output tokens, and 2,140 micro-USD estimated cost;
  editor opened; quality panel showed 1 warning and 0 blockers; publish returned 200 version 1; the
  public tenant host returned 200.
- Generated draft evidence: psych theme, `tr/en/de` locales, sections
  `hero → about → services → faq → contact → footer`, and confidentiality/gizlilik copy present.
- Cleanup completed and was verified: temporary user, session, generated site, site version, tenant
  AI usage, pending onboarding row, onboarding telemetry, and smoke-linked error rows all returned
  0 rows in `data/production.db`.
- Recent production error check after the smoke showed only the expected `/does-not-exist` 404 from
  the read-only smoke script; no smoke user/site error rows remained.

### 2026-07-09 — Super-admin command center, Stage 1: revenue/MRR overview

- New `/admin` command-center landing page (`src/routes/admin/+page.server.ts`/`.svelte`), the first
  of a 4-stage plan (revenue → activity/alerts → support tickets → site analytics) scoped explicitly
  separate from Phase 3 per operator decision. Full plan:
  `/root/.claude/plans/docs-specs-2026-07-09-hostinger-horizon-effervescent-iverson.md`.
- New `PRO_PRICE_TRY` setting (`config.ts`, group `Billing`, default 299) — the only price data the
  server has today; MRR intentionally has no per-tier breakdown since Premium isn't an enforced tier.
- New `src/lib/server/revenue.ts`: `proPriceTry()`, `subscriberCounts()`, `mrrTry()`,
  `signupTrend(months)`, `aiSpendTrend(months)`, `recentSignups(limit)`. Trend queries group
  `users.createdAt` (epoch seconds, `strftime(..., 'unixepoch')`) and `aiUsage.month`, zero-filling
  missing months in JS.
- New `src/lib/ui/Sparkline.svelte` — dependency-free inline bar chart using existing `--sk-*` vars
  (no chart library added, matches the minimal `AppCard` kit).
- Re-pointed the admin IA: `/admin` is now the front door. `admin/settings`, `admin/customers`,
  `admin/invites` cross-link back to `/admin` instead of each other; `/dashboard`'s admin link now
  points at `/admin` instead of `/admin/settings`.
- Verification: `revenue.test.ts` (6 tests, direct-assert against seeded users/usage rows) +
  `admin/page.server.test.ts` (3 tests: signed-out redirect, non-admin 403, admin data shape) — full
  suite 44 files / 275 tests passing, `npm run check` 0 errors/warnings, Prettier clean. Live
  verification via an isolated `vite dev` on a separate port against the gitignored dev DB
  (production untouched): real magic-link sign-in as the admin account, screenshot-confirmed the
  MRR/subscriber/AI-spend tiles, signup and AI-spend sparklines, and recent-signups list all render
  correctly against real seeded data with zero console/page errors. Skipped one manual "seed an
  active subscription and hand-verify MRR" mutation step after the safety classifier flagged direct
  writes to a user row even in the dev DB — the MRR arithmetic itself is already covered by
  `revenue.test.ts`'s seeded-user assertions, so this was a redundant extra check, not a gap.
- Deployment intentionally deferred — Stages 2-4 of the plan are still pending.

### 2026-07-09 — Super-admin command center, Stage 2: activity feed + proactive alerts

- New `billing_events` table (migration v12, `src/lib/server/db/schema.ts`/`migrations.ts`) — one
  row per real Stripe subscription activation, written from `billing.ts`'s
  `checkout.session.completed` handler (domain one-time payments are explicitly excluded, routed
  before the write). This is the seed of a real MRR-over-time series from this point forward only;
  `subscriptionStatus`/`subscriptionEndsAt` stay point-in-time and aren't backfillable.
- New `src/lib/server/activity.ts`: `listActivityFeed(limit)` merges six sources in JS (admin
  actions, error events, onboarding `generation_succeeded` events, signups, paid domain
  reservations, billing events), newest-first. Reused the parallel session's already-landed
  `listRecentOnboardingEvents()` (`onboarding/telemetry.ts`) rather than querying that table
  directly — the feed needed zero extra code to pick up real onboarding events once telemetry
  writes landed.
- New `src/lib/server/alerts.ts`: `computeAlerts()` — global AI budget ≥80%/100% of the monthly
  backstop, unresolved application errors, per-customer edit/generation/budget ratio ≥80% (top 10),
  system health check failing, and grace-window customers exiting within 3 days. Reuses the same
  80%/100% threshold split already established in `account/+page.svelte`'s `spendTone`.
- Wired both into `/admin`: an alerts banner (only rendered when non-empty) above the stat tiles,
  and an activity feed card at the bottom of the page.
- Verification: `migrations.test.ts` extended for v12 (table + index) + `billing.test.ts` extended
  (activation writes a row, domain payment does not) + new `activity.test.ts` (6-source merge,
  ordering, limit, onboarding-event filtering) + new `alerts.test.ts` (budget threshold crossing,
  unresolved-error surfacing, per-customer near-cap, grace-window-soon vs not-soon) — full suite 46
  files / 282 tests passing, `npm run check` 0 errors/warnings, Prettier clean. Live verification on
  the same isolated dev-DB `vite dev` setup as Stage 1: confirmed the migration auto-applies on
  boot, confirmed the activity feed shows the real seeded signup, then triggered one real 404
  through the app's own error-logging path (not a raw DB write) and confirmed both the alert banner
  ("1 unresolved application error(s)") and the new activity-feed entry appeared correctly on
  reload, screenshot-verified.
- Deployment intentionally deferred — Stages 3-4 of the plan are still pending.

### 2026-07-09 — Phase 3: psych kit set expanded to 3 launch kits

- Expanded `src/lib/kits/psych.ts` from 1 to 3 controlled launch psych kits:
  `calm-intake`, `modern-clinic`, and `online-therapy`. The two new kits use only existing fixed
  blocks, no schema changes, no raw HTML/CSS, and no `/seed/` media references.
- Added `psychKitBySlug()` and exported the new kit creators through `src/lib/kits/index.ts`.
- Rebound the 3 onboarding visual directions to concrete kit references:
  `warm_trust → calm-intake`, `modern_clinic → modern-clinic`,
  `calm_minimal → online-therapy`.
- Updated kit and direction tests. Every registered kit is schema-valid, uses the fixed block set,
  has no quality blockers/warnings, and contains no seed media references.
- Verification: targeted kit/onboarding/composer tests passed (3 files / 27 tests), full unit suite
  passed (46 files / 288 tests), `npm run check` passed with 0 errors/warnings, and Prettier passed
  for touched files.
- Browser verification: inserted the two new kit sites as temporary ownerless local preview rows,
  then checked `/preview/kit-psych-modern-clinic` and `/preview/kit-psych-online-therapy` at
  375/768/1280 widths. All 6 browser checks returned 200, rendered the expected headline, had
  horizontal overflow 0, and had no console errors or failed requests. Temporary preview rows were
  deleted from `local.db` afterward.
- `npm run build` was intentionally not run in this step because the checkout is the production
  build directory; build without immediate PM2 restart can create a stale-asset window. Deployment
  is left as a separate controlled step.

### 2026-07-09 — Phase 3: psych kit set expanded to 6 launch kits

- Added the remaining three controlled psych launch kits:
  `child-family`, `couples-therapy`, and `trauma-informed`. The full launch kit set is now
  `calm-intake`, `modern-clinic`, `online-therapy`, `child-family`, `couples-therapy`, and
  `trauma-informed`.
- Added exports for `createChildFamilyPsychSite()`, `createCouplesTherapyPsychSite()`, and
  `createTraumaInformedPsychSite()`. The new kit recipes use only existing fixed blocks and the
  existing `Site` schema; no raw HTML/CSS, schema fields, block types, or seed media references were
  added.
- Added a shared internal builder for the three new structured psych kits to keep section order,
  localization, contact path, FAQ, CTA, and footer safety language consistent.
- Updated kit tests to cover all 6 recipes. Verification: targeted kit tests passed (1 file /
  19 tests), full unit suite passed (47 files / 303 tests), and Prettier passed for the touched kit
  files.
- Browser verification: inserted the three new kit sites as temporary ownerless local preview rows,
  then checked `/preview/kit-psych-child-family`, `/preview/kit-psych-couples-therapy`, and
  `/preview/kit-psych-trauma-informed` at 375/768/1280 widths. All 9 browser checks returned 200,
  rendered the expected headline, had horizontal overflow 0, and had no console errors or failed
  requests. Temporary preview rows were deleted from `local.db` afterward.
- `npm run check` is currently blocked by an unrelated dirty admin/support change outside this kit
  sprint: `src/routes/admin/+page.svelte` is missing an `activityLabel` entry for
  `ticket_created`. The kit files themselves passed unit/schema/quality/browser verification.
- `npm run build` was intentionally not run in this step because the checkout is the production
  build directory; build/deploy should be a separate controlled step after the unrelated admin
  type-check blocker is resolved.

### 2026-07-09 — Phase 3: templates catalog page

- Confirmed the previous `npm run check` blocker is resolved: `src/routes/admin/+page.svelte` now
  covers the support activity kinds (`ticket_created`, `ticket_reply`) in `activityLabel`, and
  `npm run check` passes with 0 errors/warnings.
- Added the public `/templates` catalog route for the six psych launch kits. The page renders
  Turkish-first kit cards with slug, label, audience, outcome, hero headline, section chips,
  locale list, and quality summary.
- Added `src/routes/templates/+page.server.ts` to derive catalog data directly from
  `psychProfessionalKits`, each kit's `createSite()` recipe, and `siteQualityCheck()`. This keeps
  the catalog tied to real kit fixtures rather than duplicated marketing copy.
- Added `src/routes/templates/page.server.test.ts` proving the page returns all six kit slugs,
  TR/EN/DE locale metadata, section data, and quality summaries with 0 blockers / 0 warnings.
- Verification: targeted templates+kit tests passed (2 files / 20 tests), `npm run check` passed
  with 0 errors/warnings, and full unit suite passed (52 files / 329 tests).
- Browser verification: local `/templates` passed in mobile 375px and desktop 1280px. Both loads
  returned 200, rendered the expected headline and all 6 kit cards, had horizontal overflow 0, and
  had no console errors or failed requests.
- The CTA currently links to `/new` without a kit parameter. Direct `/new?kit=...` binding and
  `/templates/[slug]` detail/preview pages remain the next Phase 3 steps.

### 2026-07-09 — Phase 3: catalog kit selection wired into onboarding

- Wired `/templates` kit CTAs to `/new?kit=<slug>` for all six psych launch kits.
- Updated `/new` load to validate the optional `kit` query parameter via `psychKitBySlug()` and
  expose only safe kit metadata (`slug`, `label`, `audience`, `outcome`) to the page.
- Updated `/new` UI to show a "Seçili kit" card when a valid kit query is present, explaining that
  the kit steers the first draft while AI remains inside the fixed block set.
- Updated `/api/onboarding/finish` to accept an optional JSON body `{ kitSlug }`, validate the slug
  server-side, and pass it into `composeDescription()`.
- Updated `composeDescription()` so an explicit catalog kit overrides the visual-direction kit
  reference. This prevents `/new?kit=trauma-informed` from falling back to the default visual
  direction kit while still preserving the selected visual-direction tone/section steering text.
- Added tests for composer override behavior, finish endpoint valid/invalid kit body handling,
  `/new` load selected-kit metadata, and the existing templates catalog load.
- Verification: targeted tests passed (4 files / 24 tests), `npm run check` passed with
  0 errors/warnings, and full unit suite passed (53 files / 334 tests).
- Browser verification: local `/templates` → `/new?kit=trauma-informed` passed in mobile 375px and
  desktop 1280px. Both runs saw 6 catalog CTAs, landed on the expected `/new?kit=trauma-informed`
  URL, rendered the selected kit card, had horizontal overflow 0, and had no console errors or
  failed requests.
- Build/deploy remains deferred as a separate controlled step.

### 2026-07-09 — General production deploy after Phase 3/user updates

- Deployed the current working tree as the requested general production deploy. The checkout was
  already dirty with Phase 3 catalog/kit changes plus admin, billing, support, and documentation
  updates, so the deployment scope was treated as all current local changes.
- Verification before restart: `npm run test:unit -- --run` passed (53 files / 334 tests),
  `npm run check` passed with 0 errors/warnings, and `npm run build` completed successfully.
- Production restart: `pm2 restart ecosystem.config.cjs --only saaskaya --update-env` completed,
  `pm2 save` completed, and `saaskaya` reported `online`.
- Production smoke: `https://saaskaya.com/api/health` returned `ok: true` with DB and disk checks
  OK; `node scripts/smoke-production.mjs` passed for the public read-only surface on mobile and
  desktop.
- Route checks: `https://saaskaya.com/templates` and
  `https://saaskaya.com/new?kit=trauma-informed` both returned HTTP 200.
- Browser verification on production with `playwright-core`: `/templates` and
  `/new?kit=trauma-informed` passed at mobile 375px and desktop 1280px. `/templates` rendered all
  6 kit cards and the trauma-informed CTA; `/new?kit=trauma-informed` rendered the selected-kit
  card. All four browser checks had horizontal overflow 0, 0 console errors, and 0 failed requests.
- Production DB residue check: `schema_migrations` includes versions 12 and 13; the only
  `error_events` row in the last 15 minutes was the expected `/does-not-exist` 404 generated by the
  smoke script. PM2 historical logs still include older scanner 404s and stale-asset entries, but
  the post-deploy smoke did not reproduce them.

### 2026-07-09 — Creem payment provider seam

- Added Creem as a first-class billing provider while keeping Stripe intact as the backwards-compatible
  default. `PAYMENT_PROVIDER=creem|stripe` now selects the active subscription checkout provider;
  if unset, Stripe stays active unless only Creem is configured.
- Added admin settings for `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`, `CREEM_PRO_PRODUCT_ID`, and
  `CREEM_TEST_MODE`. These follow the existing DB-over-env settings model and remain server-only.
- Added Creem subscription checkout creation through the REST API (`POST /v1/checkouts` with
  `x-api-key`, `product_id`, `success_url`, `customer.email`, `request_id`, and `metadata.userId`).
  Test mode uses `https://test-api.creem.io/v1`; production uses `https://api.creem.io/v1`.
- Added `/api/billing/creem/webhook` with raw-body HMAC verification via the `creem-signature`
  header. Creem `subscription.paid` / `subscription.active` grant Pro access; cancellation-like
  events (`subscription.canceled`, `past_due`, `expired`, `paused`) update the existing
  `subscriptionState()`/grace-window model.
- Deliberately avoided a production DB migration in this slice: the existing
  `users.stripeCustomerId` / `billing_events.stripeCustomerId` columns are treated as legacy
  provider-customer-id slots for Creem too. A later cleanup migration can rename/split these fields
  once the payment provider choice is stable.
- Verification: targeted billing tests passed (1 file / 14 tests), full unit suite passed
  (53 files / 340 tests), `npm run check` passed with 0 errors/warnings, and `npm run build`
  completed successfully.
- Production was restarted immediately after the build because this checkout serves the live build
  directory: `pm2 restart ecosystem.config.cjs --only saaskaya --update-env && pm2 save`.
  Live smoke passed: `/api/health` returned OK, `/account` redirected unauthenticated users to
  `/login`, `/api/billing/creem/webhook` returned POST-only 405 to HEAD, and
  `node scripts/smoke-production.mjs` passed on the public read-only surface.

### 2026-07-09 — Legal pages updated for Creem Merchant of Record

- Updated the customer-facing legal copy now that Creem is the intended primary payment provider and
  Merchant of Record candidate for paid subscriptions.
- `/legal/privacy`: replaced Stripe-only financial-data language with provider-neutral payment
  customer IDs; added Creem as MoR/checkout/tax/invoice/payment processor while keeping Stripe as a
  fallback/legacy payment processor; clarified that card data is not stored on saaskaya servers.
- `/legal/terms`: updated the payment section to name Creem as primary provider/MoR and Stripe as
  fallback/legacy; clarified that Creem checkout terms may govern payment, chargeback, tax/invoice,
  and consumer-payment topics; removed the premature Turkey-only venue claim pending legal review.
- `/legal/refund`: updated cancellation/refund/dunning language from Stripe-specific to active
  provider/Creem MoR wording, while keeping bank-transfer and non-refundable domain registration
  rules.
- `/legal/kvkk`: updated financial-data and third-party transfer text to include Creem and
  provider-neutral payment identifiers.
- Verification: legal grep confirmed old Stripe-only phrases were removed from legal routes,
  `npm run check` passed with 0 errors/warnings, and `npm run build` completed successfully.
- Production deploy: restarted and saved PM2 after the build. Live checks returned 200 for
  `/legal/privacy`, `/legal/terms`, `/legal/refund`, `/legal/kvkk`, and `/sitemap.xml`;
  `/api/health` returned OK; live `/legal/terms` and `/legal/privacy` include the Creem/MoR copy.
- Caveat remains explicit in-page: these are operational launch drafts, not substitute legal advice;
  paid public launch still needs Germany/Turkey legal/accounting review.

### 2026-07-10 — UX revizyonu Faz 1–4 (docs/specs/SAASKAYA_UX_REVIZYON_PROMPT.md)

- All four phases of the UX revision spec implemented as a pure UI/UX layer — no backend logic,
  payment flow, or generation pipeline changes (the only server-file edits were user-facing display
  strings in `dashboard/+page.server.ts`, with failed-provisioning raw output moved to
  `console.error` instead of the customer UI).
- **Faz 1 (dashboard jargon/dil temizliği)**: `dashboard/+page.svelte` rewritten fully in Turkish.
  Hash site IDs removed (replaced by "Son güncelleme: [tarih]"); "live · v1"/"draft only" →
  "Yayında"/"Taslak" (version numbers no longer shown anywhere); "Billing not configured yet." →
  "Pro'ya geçiş çok yakında…"; "yourdomain.com" → "kendisiteniz.com". Action hierarchy per card:
  primary **Düzenle**, secondary Önizle + Yayınla/Yayından kaldır (+ Canlı siteyi aç when live),
  and a dependency-free `<details>` "⋯" overflow menu holding Gelen mesajlar, Son değişiklikleri
  yayına al (republish), and Yedeğini indir (export). English `domainMessage` fail strings and the
  raw provision strings in `dashboard/+page.server.ts` translated to friendly Turkish.
- **Faz 2 (onboarding)**: `/new` gained a persistent progress header — "Adım X / Y" + yüzde +
  dolan bar (`visibleQuestions()`-driven, adapts as conditional questions appear) — and the first
  (niche) question now renders as three large tappable cards with stroke-SVG icons
  (leaf/scales/tooth) and per-locale supporting copy; the free-text "Kendi cümlelerimle…" toggle
  stays as the secondary path below. New copy keys added to all three locales.
- **Faz 3 (landing görsel kanıt + güven)**: real screenshots of the three seed demo sites captured
  via Playwright into `static/examples/{law,psych,dental}.jpg` (~38 KB each) and the examples
  section rebuilt as a 3-up thumbnail card grid (image links to the full `/preview/...`). The two
  decisive trust answers ("AI kod yazmaz", "Site senin") now sit directly under the hero CTA as
  shield-icon cards in all three locales (full Güven section unchanged below). The four
  "Nasıl çalışır" steps each got an inline stroke icon.
- **Faz 4 (görsel ton)**: landing price cards now separate the number (display 3xl) from "/ay"
  (small, faint, baseline-aligned — `/pricing` already did this); FAQ converted to
  `<details>`-based accordions with a rotating "+" affordance; `.sk-card` border strengthened one
  step (`--sk-line` → `--sk-line-strong`) plus a 1px soft shadow for a slightly more concrete,
  less thin-line feel (palette untouched).
- Verification: `npm run check` 0 errors/warnings (1649 files), full suite 53 files / 340 tests
  passing, Prettier clean. Live dev-server browser verification with screenshots: landing (tr) with
  thumbnails/trust strip/step icons/accordion/price cards; `/new` in both TR and EN showing
  "Adım 1 / 15" + bar + niche cards (emoji icons were replaced with inline SVGs after the headless
  screenshot exposed the emoji-font dependency); dashboard signed in as the admin account with a
  temporary dev-DB site row proving the Turkish card, date line, hierarchy, and open "⋯" menu
  (row deleted afterward; dev `local.db` only). Zero console/page errors on all screens.
- Deploy intentionally not run — build/deploy remains a separate controlled step.
- Backlog note: super-admin command center Stage 4 (privacy-safe site visit analytics per the
  approved plan) remains pending; Stages 1–3 (revenue overview, activity feed + alerts, support
  tickets) are implemented and fully verified.

### 2026-07-10 — UI polish: self-hosted fonts, real imagery, flow animation

- **Self-hosted typography (KVKK + performance)**: replaced the single Google Fonts CDN `<link>` in
  `+layout.svelte` (which loaded 8 families for every SaaS page, including 5 tenant-only ones, and
  sent visitor IPs to Google — a real concern for the DE market) with `@fontsource/*` packages.
  SaaS chrome fonts (Instrument Serif, IBM Plex Sans, IBM Plex Mono; latin + latin-ext, so Turkish
  ğ/ş/İ/ı render) now load from `+layout.svelte`; tenant preset fonts (Playfair Display, Lora,
  Poppins, Open Sans, Roboto) load from `SiteRenderer.svelte` instead, so the SaaS shell stops
  paying for weights only tenant sites use, and published tenant sites no longer call Google at
  all. Found and fixed a real bug in the process: the `law` preset's body font is `Inter`
  (`src/lib/presets/index.ts`), but `Inter` was never in the old Google Fonts URL — every
  law-preset tenant site had been silently falling back to a system font for body text. Added
  `@fontsource/inter` alongside the other tenant fonts to fix it.
- **`/templates` kit thumbnails**: captured real screenshots of all 6 psych kits into
  `static/templates/<slug>.jpg` (~45 KB each) using the same temporary-ownerless-preview-row +
  Playwright pattern proven earlier for `static/examples/` — this time via a short-lived internal
  `/api/_dev-seed-kits` route (tsx alone can't resolve SvelteKit's `$env` virtual module outside
  the Vite pipeline, so the seeding had to run inside the actual dev server process). Route deleted
  and all 6 temporary rows removed from dev `local.db` after the screenshots were captured
  (verified 0 remaining). `/templates` cards now show the real thumbnail instead of a flat color
  gradient block.
- **Social sharing (`og:image`)**: generated `static/og.jpg` (1200×630, self-hosted brand fonts via
  a throwaway local HTML file screenshotted with Playwright) and added
  `og:title/og:description/og:image/og:url` + `twitter:card=summary_large_image` meta to the three
  public entry pages (landing, `/pricing`, `/templates`), localized from each page's existing
  `copy` object.
- **Flow animation**: ported `docs/animation/Saaskaya Flow Animation.dc.html` (a design comp built
  on a proprietary `x-dc`/`support.js` runtime) into a real, dependency-free
  `src/lib/ui/FlowAnimation.svelte` using Svelte 5 runes — same palette, keyframes, and demo
  content (a Turkish lawyer's onboarding: describe → AI generates → live 3-viewport preview → edit
  → publish), no runtime dependency. Added an `IntersectionObserver` + `document.visibilitychange`
  guard so the three `setInterval` timers only run while the stage is actually on-screen and the
  tab is active (the original comp ran unconditionally). `prefers-reduced-motion: reduce` shows a
  static Scene 1 with the full text and no timers, verified via Playwright's `reducedMotion`
  emulation. Embedded on the landing page directly below the hero trust strip, localized scene
  labels passed as a prop (`copy.flowScenes`) so the chrome text matches the page's locale while
  the demo content itself stays fixed (same rationale as the existing example-sites section).
- **Positioning broadened** (user-requested, since the target market includes avukat, akademisyen,
  psikolog, fizyoterapist, ergoterapist, danışman — not psychologists only): landing pill
  "Psikologlar için" → "Uzman meslekler için" (EN "For professionals", DE "Für Expertenberufe");
  title/meta broadened while keeping "psikolog" for SEO continuity; FAQ "Sadece psikologlar mı?"
  now names the full target set with psych as the launch focus, in all three locales.
  `/templates` was left untouched — it genuinely is the psych-only kit catalog, not a
  misleading claim.
- Verification: `npm run check` 0 errors/warnings (1650 files), full suite 53 files / 340 tests
  passing, `npm run build` succeeded, Prettier clean. Confirmed via `curl` + grep on the built
  output: zero `fonts.googleapis`/`fonts.gstatic` references anywhere, 116 woff2 files bundled
  locally. Live dev-server verification: screenshotted the landing page at two moments 4.2s apart
  to prove the animation's scene actually cycles ("01/05 · Kendini anlat" → "02/05 · AI üretiyor"),
  screenshotted the `prefers-reduced-motion: reduce` fallback (static, fully-typed text, no cursor
  blink), screenshotted `/templates` with all 6 real thumbnails, and curled the og-meta tags on all
  three public pages. Zero console/page errors on every screen checked.
- Deploy intentionally not run — stays a separate controlled step, same as every prior stage.

### 2026-07-10 — Homepage hero desktop text width fix

- Widened the landing hero desktop layout after the Turkish H1 was still constrained to a narrow
  `10ch` column and breaking into too many stacked lines. The hero now uses a wider `max-w-7xl`
  canvas, a more balanced desktop grid, `max-w-3xl` on the left column, `max-w-[24ch]` on the H1,
  and `max-w-2xl` on the lead paragraph while keeping the requested `lg:text-[2.5rem]`.
- Verification: `npm run check` passed locally. `npm run deploy:production` passed check, tests
  (63 files / 391 tests), build, PM2 restart/save, and production smoke for mobile + desktop public
  surfaces. Deployed release `20260710T235302Z`; `current` points to that release. Live
  `https://saaskaya.com/tr` returns HTTP 200 and contains the new `max-w-[24ch]` hero class.

### 2026-07-10 — Login/editor/dashboard polish, Free site slots, generation error hardening

- **UI polish applied in the approved order**: `/login` is now a tighter magic-link task screen with
  shorter copy, beta status as a pill, and icon-led home/back/mail actions. Shared `PageShell`
  back links and remaining public flow links now use inline SVG icons from `src/lib/ui/icons.ts`
  instead of literal arrow glyphs; landing/pricing/templates CTAs use text + icon. The only
  remaining arrow glyphs are in comments, tests, or explanatory legal copy.
- **Landing page density reduced**: hero lead copy was shortened, the left column headline/lead
  scale was nudged down, and the two trust cards became slimmer inline trust rows. This keeps the
  first viewport focused on the single promise while deeper trust detail remains in the lower
  sections.
- **Editor/dashboard width**: dashboard now uses a `max-w-7xl` inner shell and wider canvas. Editor
  canvas is `max-w-[96rem]`, the left sidebar is narrower, and checklist/quality panels are
  collapsible so desktop preview receives more real horizontal space without removing guidance.
- **Free tier semantics changed from historical generation credits to active site slots**:
  `src/lib/server/siteQuota.ts` enforces 3 active Free preview sites and 1 first-time Free published
  website. `/api/sites` uses this slot check plus token/$ backstops, but no longer spends/enforces
  historical `generation_count` for site creation; deleting a draft now naturally frees preview
  capacity. Publish quota is enforced both in the editor API and the dashboard republish action.
  Pricing/onboarding copy was updated to describe 3 preview sites + 1 published website.
- **Beta "network error" hardening**: recent `error_events` only showed unrelated 404s, so the
  reported beta network error was not being captured as a structured app error. `/api/sites` now
  catches unexpected generation failures, records a `site-generation` error with `errorId`, records
  onboarding failure telemetry when applicable, and returns JSON instead of falling through to a
  generic HTML/500 response. `/new` now safely reads non-JSON API responses and shows the server
  status/reference instead of collapsing everything into a client-side network message.
- Verification: `npm run check` passed, `npm test` passed (63 files / 391 tests), `npm run build`
  passed. Because this checkout serves the live PM2 process, ran
  `pm2 restart ecosystem.config.cjs --only saaskaya --update-env` and `pm2 save`. Production smoke
  passed (`node scripts/smoke-production.mjs`), and `/tr/login`, `/tr/new`, `/tr/pricing` all
  returned HTTP 200 over `https://saaskaya.com`.

### 2026-07-10 — Correct production release deploy for latest UI/quota changes

- The previous PM2 restart was still serving `/var/www/saaskaya/current/build/index.js` from the
  older release, so the live homepage kept showing the old hero copy/CTA despite the root checkout
  build being updated. Ran the canonical release deploy path: `npm run deploy:production`.
- Deploy created release `20260710T232334Z`, switched `current` to
  `/var/www/saaskaya/releases/20260710T232334Z`, restarted PM2, saved the process list, and removed
  one old release.
- Verification: deploy script passed `npm run check`, `npm test` (63 files / 391 tests),
  `npm run build`, and production smoke on mobile + desktop. Confirmed PM2 script path is
  `/var/www/saaskaya/current/build/index.js`; `readlink -f current` points to the new release.
  Live HTML at `https://saaskaya.com/tr` now contains the new hero lead (`Pratiğini anlat, çok
dilli site taslağını gör...`) and no longer contains the old `AI destekli web sitesi platformu`
  hero text. `http://saaskaya.com/tr` redirects 301 to HTTPS; `/tr/login`, `/tr/new`, `/tr/pricing`
  return HTTP 200; TLS certificate subject is `CN = saaskaya.com`.

### 2026-07-10 — Homepage hero H1 size trial deployed

- Updated the landing hero H1 class to the requested sizing experiment:
  `sk-display max-w-[10ch] text-3xl leading-[1.08] sm:text-[2rem] lg:text-[2.5rem]`.
- Deployed with the canonical release pipeline (`npm run deploy:production`), creating release
  `20260710T234505Z`, switching `current` to that release, restarting PM2, and saving the process
  list.
- Verification: deploy script passed `npm run check`, `npm test` (63 files / 391 tests),
  `npm run build`, and production smoke. Confirmed live HTML at `https://saaskaya.com/tr` contains
  the exact requested H1 class and no longer contains the previous `max-w-[12ch]` /
  `lg:text-[43px]` hero sizing. PM2 remains online via `/var/www/saaskaya/current/build/index.js`.

### 2026-07-11 — Tenant subdomain preview/publish parity root-cause fix

- Root cause confirmed from live evidence: `https://seed-law.saaskaya.com/` redirected to `/en` and
  rendered the main saaskaya landing page, not the tenant public site. `src/lib/hostRouting.ts`
  still had the correct pure host-routing helper, but `src/hooks.ts` had been replaced with a
  locale-only reroute hook, so tenant hosts never reached `/_site/[siteKey]`.
- Added `src/lib/reroute.ts` as the single pure reroute decision point: host/custom-domain routing
  runs first, app-host locale stripping second. `src/hooks.ts` now delegates to that combined helper
  with `PUBLIC_APP_HOST`.
- Added `src/lib/reroute.test.ts` covering the exact escaped regression:
  `seed-law.saaskaya.com/` -> `/_site/seed-law`, `seed-law.saaskaya.com/en` ->
  `/_site/seed-law/en`, while `saaskaya.com/tr/new` still strips to `/new`.
- Changed public tenant cache from `public, max-age=60` to `no-cache, must-revalidate`, removing the
  60-second stale-snapshot window that made republish look unreliable.
- Expanded `scripts/smoke-production.mjs` with a real tenant subdomain check
  (`SMOKE_TENANT_URL`, default `https://seed-law.saaskaya.com/en`) that fails if the tenant host
  renders the app landing title, lacks a `Published vN` marker, lacks tenant content markers, or
  misses the no-cache header.
- Editor publish UX now uses a persistent publish notice instead of transient `alert()` messages:
  save failure, quality blocker, network failure, and successful `Published vN` states are visible;
  success includes the cache-busted live URL.
- Verification before deploy: targeted tests passed (4 files / 17 tests), `npm run check` clean,
  full `npm test` passed (64 files / 394 tests), `npm run lint` clean after Prettier formatting,
  and `npm run build` succeeded.

### 2026-07-10 — Per-site Pro domain roadmap Deliverables D/E/F

- **D — preview/publish parity controls**: added shared URL helpers for public/preview locale paths,
  labeled editor iframe as `Live draft`, open-preview link as `Saved preview`, preview route as
  `Saved preview`/`Live draft` depending on postMessage state, and public tenant pages as
  `Published vN`. Preview-to-live links preserve the selected locale/page. Dashboard preview links
  now open the persisted saved draft with the site's default locale.
- **D — stale publish guard**: dashboard first-publish is no longer a direct form POST. Unpublished
  sites send the operator back to the editor, where publish already flushes and submits the exact
  draft body. Dashboard republish remains available only for already-published sites and now runs
  the same quality gate before snapshotting.
- **D — parity helper**: added `src/lib/server/previewParity.ts`, normalizing title, site name,
  theme preset, primary color, section ids/types/order, hero headline, and nav labels so saved
  preview and published snapshots can be compared deterministically in smoke tests.
- **E — unsupported niche gate**: onboarding now includes a manual-review `Başka bir alan` option.
  Selecting it stops the automated flow and shows support escalation instead of letting generation
  fall into the lawyer preset. Raw descriptions that clearly ask for unsupported sectors such as
  shoe repair are rejected at both `/api/onboarding/finish` and `/api/sites`.
- **F — landing hero redesign**: removed the duplicate hero BrandMark, shortened EN/TR/DE H1 copy,
  tightened the left column, and aligned the flow animation as product evidence in a controlled
  two-column desktop grid with a single-column mobile fallback.
- **Related build blockers fixed**: Creem webhook typing was extended for per-site metadata under
  subscription objects, pricing highlight typing was narrowed, and publish API tests were updated
  to create publishable public-handle fixtures under the current identity gate.
- Verification: `npm run check` 0 errors/warnings, `npm test` 62 files / 389 tests passing,
  `npm run lint` clean, `npm run build` succeeded. Local dev-server Playwright smoke:
  `/tr` at 1440/1280/375 had no horizontal overflow, CTA above fold, and the shortened Turkish H1;
  `/tr/new` unsupported niche flow showed the manual beta-review message and zero generate buttons.
  Screenshots saved under `/tmp/saaskaya-hero-{desktop,laptop,mobile}.png` and
  `/tmp/saaskaya-new-unsupported-mobile.png`.
- Deployed on user request with `npm run deploy:production`: release `20260710T221712Z`, PM2
  `saaskaya` restarted and online, deploy script production smoke passed on
  `https://saaskaya.com` mobile + desktop public read-only surfaces. `current` now points at
  `/var/www/saaskaya/releases/20260710T221712Z`.

### 2026-07-10 — Per-site Pro, private domain gate, and public handle identity (Deliverables A-C)

- Implemented `docs/specs/2026-07-10-per-site-pro-domain-preview-parity-roadmap.md` Deliverables
  A-C. Added append-only migration **v17** (`per-site-pro-public-handles`) with
  `sites.public_handle` and `site_subscriptions`; existing sites backfill their handle from the
  internal id, while new customer-facing edits happen through a separate identity form.
- Changed paid entitlement from account-level checks to site-level checks where it matters for this
  roadmap: checkout requires a manageable `siteId`; Stripe/Creem metadata uses
  `kind=site_subscription`, `siteId`, `userId`, `plan=pro`, `price=17 EUR/month`; webhooks create or
  update `site_subscriptions`; export, custom-domain attach/register, daily domain sweep, dashboard
  site cards, account export list, admin customer summaries, and MRR now evaluate the specific site.
  Legacy `users.subscription_*` columns remain for backward compatibility/admin override flow.
- Updated customer-facing pricing/product copy to **17€/month per published site** and removed Free
  full-export promises from public pricing, landing trust copy, account export UI, dashboard menus,
  and legal terms. Full export is now Pro-site gated, with admin/operator exception preserved.
- Added public subdomain identity controls on dashboard site cards (`siteName`, `publicHandle`,
  `contactEmail`), handle normalization/validation/reserved-word/uniqueness checks, and routing
  resolution by public handle as well as internal site id/custom domain. First publish is blocked in
  the editor API if the site still uses the internal random id as its public handle; dashboard first
  publish remains routed through editor review.
- Reworked customer-visible domain reservation copy so provider/wholesale cost and registrar errors
  are not shown. Domain gate returns customer-safe states (`available`, `unavailable`,
  `manual_review`); unsupported TLDs/provider errors go to manual review with operator notes. Free
  sites that pass domain gate are prompted to activate Pro for that specific site before domain setup.
- Verification: `npm run check` passed with 0 errors/warnings; `npm test` passed (62 files / 389
  tests); `npm run build` succeeded. Deploy intentionally not run.

### 2026-07-10 — Public Site Acquisition + Support Roadmap Deliverable B: Messaging System

- **Public inquiry data model**: added separate `inquiries` and `inquiry_messages` tables instead
  of forcing anonymous visitors into authenticated `support_tickets`. Migration v15
  (`public-inquiries`) creates source/status/email indexes for admin inbox filtering and keeps
  support tickets untouched. `src/lib/server/inquiries.ts` owns validation, creation, thread reads,
  admin replies, status updates, and best-effort email notification/reply delivery.
- **Contact form backend + chat bubble**: `/contact` now stores real public inquiries through the
  shared helper, with email validation, body length limits, category allowlist, IP/email rate
  limits, and a honeypot field. `/api/inquiries` provides the same backend for
  `MessageBubble.svelte`, which is visible on public marketing pages and sets the expectation that
  this is async email reply, not live chat. Existing A-deliverable `PublicShell`/`SeoHead` contact
  page was preserved; stale "next delivery" copy was updated to describe the now-live inbox flow.
- **Admin inbox**: added `/admin/inbox` and `/admin/inbox/[inquiryId]` plus an AdminShell nav item.
  Admins can filter public inquiries by status/source, see contact-form and chat-bubble submissions,
  read the full message history, reply, and set `open | pending | resolved | closed`. Admin reply
  content is rendered as text (`whitespace-pre-wrap`), never HTML. Existing `/admin/support` and
  customer support ticket routes remain unchanged.
- **Email behavior**: new inquiry alerts use existing `ALERT_EMAIL`; admin replies use the existing
  `sendEmail()` provider seam. Delivery failures are logged without throwing, so stored inquiries
  and replies are never lost when email is unconfigured. Local browser verification intentionally
  observed `no email provider configured` on reply delivery while confirming the reply persisted.
- Verification: targeted inquiry/API/admin/migration tests passed (5 files / 16 tests), full suite
  passed (57 files / 350 tests), `npm run check` passed with 0 errors/warnings, `npm run build`
  passed, and targeted Prettier checks passed after formatting touched files. Local Playwright
  verification submitted `/tr/contact`, submitted the `/en` message bubble, verified both appeared
  in `/admin/inbox`, opened one inquiry, stored an admin reply, set it to `resolved`, and confirmed
  mobile public page overflow stayed `0` with the bubble panel fitting inside a 390px viewport.
  Test inquiry rows and the temporary admin session were removed from `local.db` afterward.
- Deployed on user request with `npm run deploy:production`: release `20260710T114429Z`, full deploy
  checks/tests/build passed, PM2 restarted against `current/build/index.js`, and the deploy script's
  production smoke passed on mobile + desktop public routes. Post-deploy Deliverable B smoke on
  `https://saaskaya.com` submitted `/tr/contact`, submitted the `/en` message bubble, confirmed
  production DB rows for `contact` and `chat`, verified both appeared in `/admin/inbox`, stored an
  admin reply, set the contact inquiry to `resolved`, and confirmed the mobile bubble has horizontal
  overflow `0`; live smoke inquiry rows and the temporary admin session were removed afterward.

### 2026-07-10 — Deliverable A public site foundation shipped

- Implemented the public-site foundation from `docs/specs/2026-07-10-public-site-acquisition-support-roadmap.md`:
  shared `PublicShell`, `PublicHeader`, `PublicFooter`, `ScrollToTop`, and `SeoHead` components now give the marketing pages a consistent SaaS navigation/footer surface without touching the tenant Zod `Site` contract or AI output rules.
- Public navigation is now present across landing, pricing, templates, about, contact, and blog pages.
  Links are locale-aware through `withLocale(...)`; `/pricing` is no longer a dead end.
- Improved the language switcher active state: it keeps the flag + `EN/TR/DE` label, preserves
  `aria-current`, and uses a lighter selected state instead of the previous black pill.
- Added new localized public pages:
  `/about`, `/contact`, `/blog`, and `/blog/[slug]` under `/en`, `/tr`, and `/de`.
  Blog content is static/file-driven via `src/lib/public/blog.ts` with three concise starter posts.
- Contact page is connected to the existing public inquiries action, so valid messages enter the
  admin inbox flow; invalid form submissions render inline validation. The existing message bubble is now present on the new public pages too.
- SEO/GEO basics added for public pages: localized titles/descriptions, canonical links,
  `hreflang` alternates including `x-default`, OG/Twitter tags, valid JSON-LD
  (`Organization`, `WebSite`, `SoftwareApplication`, `ContactPage`, and `BlogPosting`), and
  Kornwestheim/Germany trust signals. `/sitemap.xml` now includes localized marketing, legal, and blog routes; `robots.txt` already points to the sitemap.
- Landing conversion flow now has an earlier mid-page CTA after the process proof, while the final
  CTA remains distinct. Landing/pricing/templates content widths were widened in a controlled way;
  article/blog detail pages stay narrower for readability.
- Error log: initial production browser verification found JSON-LD scripts rendering the literal
  `{@html stringifyJsonLd(item)}` because Svelte does not process `{@html}` inside an
  `application/ld+json` script body. Fixed by serializing complete JSON-LD script tags into the
  head with escaped `</script>` splitting.
- Verification: `npm run check` passed, `npm test` passed (57 files / 350 tests), `npm run build`
  passed, and `npm run deploy:production` completed via the atomic release flow. Latest production
  release: `20260710T104907Z`; PM2 `saaskaya` online and deploy smoke passed. Additional live
  Playwright verification on `https://saaskaya.com` covered `/en`, `/en/pricing`, `/en/templates`,
  `/en/about`, `/en/contact`, `/en/blog`, and `/en/blog/ai-assisted-website-building` at mobile and
  desktop widths: status 200, no horizontal overflow, footer present, language labels readable,
  canonical/hreflang present, and JSON-LD parses. Live checks also confirmed sitemap/robots entries
  and contact-form validation rendering.

### 2026-07-10 — Per-site Pro, domain margin, identity, preview parity roadmap

- Captured the user's product-model corrections in
  `docs/specs/2026-07-10-per-site-pro-domain-preview-parity-roadmap.md`: public Pro price moves to
  17€/month, Pro must be scoped to a specific published site rather than the whole user account, Free
  should not advertise full data export, and customer-facing domain flows must not reveal wholesale
  provider cost estimates.
- Investigated the reported preview/live mismatch for `site-ca7a4be4` with read-only production DB
  queries. The stored draft and published v1 snapshot match on core fields (`siteName`, preset,
  primary color, first page title, first hero headline), so the immediate evidence does not show the
  wrong draft being snapshotted. The roadmap records the likely risk areas: TR preview vs DE public
  comparison, editor iframe's unsaved postMessage live draft vs persisted preview URL, dashboard's
  bodyless publish path, and unsupported profession content being mapped onto the `law` preset.
- No application code changed in this step; this was a planning/spec task.

### 2026-07-10 — Nunito Turkish glyph fix, instant locale switching, flag language pills

- **Fredoka replaced with Nunito across the SaaS UI**: the previous polish pass assumed Fredoka
  covered Turkish; a direct `fontTools` cmap check proved the actual shipped Fredoka files were
  missing `ğ`, `Ğ`, `ş`, `Ş`, and `İ`. Replaced the SaaS layout imports with self-hosted
  `@fontsource/nunito` (`latin`, `latin-ext`, plus explicit 800 subsets), set both
  `--font-display` and `--font-sans` to Nunito, and bumped `.sk-display` to weight 800 so headings
  remain distinct now that display/body share one family. `--font-mono` stays IBM Plex Mono for
  small technical labels. Removed unused Fredoka and IBM Plex Sans dependencies from
  `package.json` / `package-lock.json`; tenant renderer fonts remain a separate system.
- **Verified glyph coverage from the actual files now shipped**: `fontTools` confirmed the combined
  Nunito latin+latin-ext subsets for both 400 and 800 contain the full checked set
  `ğĞşŞıİçöü` with no missing characters. Individual subsets split coverage as expected
  (`latin` carries `ı/ç/ö/ü`, `latin-ext` carries `ğ/Ğ/ş/Ş/İ`), and the browser loads both via
  unicode-range. Playwright close-up of the Turkish landing headline
  `"Pratiğini anlat..."` showed one consistent Nunito rendering with no fallback glyph seam;
  `document.fonts.check('800 44px Nunito', ...)` returned true.
- **Locale switcher now refreshes layout data without a document reload**:
  `LanguageSwitcher.svelte` keeps normal `<a href>` links for no-JS/right-click behavior but
  intercepts plain left-clicks and calls `goto(withLocale(...), { invalidateAll: true })`. This
  forces SvelteKit to rerun the root layout data load even though `/tr/new` and `/en/new` map to
  the same internal rerouted route id. Modified clicks are left native; DOM event verification
  showed plain click is canceled, while ctrl-click and middle-click are not canceled.
- **Flagged language pills**: added `src/lib/ui/flags.ts` with inline SVGs for GB/EN, TR, and DE,
  rendered alongside the existing `EN/TR/DE` text labels. Also defined the missing `--sk-paper`
  token used by the active pill state so the selected language remains readable.
- Verification: `npm run check` 0 errors/warnings, full suite 53 files / 340 tests passing,
  `npm run build` succeeded. `npm run lint` still fails on 24 pre-existing unrelated dirty files
  outside this task; the touched files were formatted with Prettier directly. Live dev-server
  Playwright verification: TR → EN → DE on landing updated copy with only SvelteKit
  `__data.json` fetches and zero document requests; `/tr/new` → `/en/new` preserved the in-progress
  onboarding step (`Step 2 / 15`) while also using only a data fetch; desktop and mobile switcher
  screenshots showed flags + text with no overflow (mobile switcher width 163px inside 390px).
- Deployed on user request with `npm run deploy:production`: release `20260710T102815Z`, PM2
  `saaskaya` restarted and online, deploy script production smoke passed on mobile + desktop public
  surfaces. Post-deploy Playwright smoke on `https://saaskaya.com/tr` confirmed the Turkish headline
  loads as Nunito (`document.fonts.check(...) === true`), the language switcher renders `EN TR DE`
  with flags, and TR → EN uses only SvelteKit `__data.json` fetches with zero document requests.

### 2026-07-10 — UI polish round 2: wider canvas, Fredoka headings, stacked layouts, chat pacing

- **Wider app canvas**: the browser-chrome canvas (`src/lib/ui/AppCanvasShell.svelte`) felt cramped
  on every page. Found two independent width layers — `AppCanvasShell`'s own default (`max-w-5xl`,
  never overridden by any route) and each page's separately-nested inner content div. Bumped
  `AppCanvasShell`'s default to `max-w-6xl` and `PageShell.svelte`'s `canvasMax` default to match
  (it was silently overriding `AppCanvasShell`'s own default for every admin/dashboard/account
  page). Then bumped each page's inner content width one Tailwind step to actually use the
  reclaimed space (`max-w-3xl`→`max-w-4xl`, `max-w-4xl`→`max-w-5xl` across ~19 routes;
  `/templates`→`max-w-6xl`), with deliberate exceptions: `/login`, `/login/verify`, and
  `/profile/start` stay narrow (single-purpose forms read worse wider, not better).
- **Heading font → self-hosted Fredoka**: user linked Secular One as a style reference but it ships
  a single weight (400) — the design system needs 500/600 for buttons/badges, so applying it
  everywhere would flatten the hierarchy. Landed on **Fredoka** (rounded/geometric, same spirit,
  weights 300–700, full Latin + Latin-Extended for Turkish ğ/ş/ı/İ and German umlauts) applied only
  to `--font-display` (headings, `.sk-display`) — body/button text stays on IBM Plex Sans,
  untouched. Swapped the `@fontsource/instrument-serif` import in `+layout.svelte` for
  `@fontsource/fredoka`; tenant-site fonts (`SiteRenderer.svelte`) are a separate system,
  unaffected.
- **Two-column → stacked sections**: `/beta` (`md:grid-cols-[0.9fr_1fr]`) and `/new`
  (`lg:grid-cols-[0.9fr_1.1fr]`) both read awkwardly as side-by-side splits. Both now stack:
  intro/context section first, the card/chat section directly below, top-to-bottom reading order.
  `/beta` moved to a centered `max-w-2xl` column (no longer splitting space between two columns);
  `/new` moved to the same `max-w-2xl` so both the prose intro and the chat bubble column share a
  single readable width — matching how real chat UIs never let a message column run edge-to-edge
  even in a wide window.
- **WhatsApp/ChatGPT-style paced Q&A in `/new`**: previously the next question appeared the instant
  an answer validated — no sense of "the AI is thinking." `submitAnswer()` now commits the answer
  (and its bubble) immediately once the real `/api/onboarding/answer` validation resolves, then
  holds the next question behind the existing typing-dots indicator for a randomized minimum delay
  (`600–1200ms`, `Date.now()`-anchored so a slow real response is never rushed and a fast one is
  never instant/robotic) before revealing it. Off-topic rejections get the same pacing (feels like
  a genuine "the AI evaluated it" response); real network errors in the `catch` block skip pacing
  entirely — a broken connection isn't "the AI thinking," delaying that message only frustrates.
  Added Svelte's built-in `svelte/transition` (`fly`, ~200ms, small y-offset) as a mount-in
  animation on every newly-appended bubble — first use of `svelte/transition` in the codebase, no
  new dependency. `prefers-reduced-motion: reduce` skips both the artificial delay and the
  transition (same pattern as `FlowAnimation.svelte` from the previous polish pass).
- **Explicitly deferred**: expanding beyond the 3 launch professions (avukat/psikolog/diş hekimi).
  User initially believed 6 professions already existed; investigation confirmed the 6 "kits" are
  actually 6 style variants within the single psychologist niche (calm-intake, modern-clinic,
  online-therapy, child-family, couples-therapy, trauma-informed) —
  `docs/CONSTITUTION.md` explicitly caps niche presets at 3 and mandates single-niche GTM. User
  confirmed they want real new professions, not wider psych-style exposure, and agreed (when asked)
  to sequence this as its own dedicated future plan rather than bundling a constitution-level scope
  change into a UI-polish pass.
- Verification: `npm run check` 0 errors/warnings (1650 files), full suite 53 files / 340 tests
  passing, `npm run build` succeeded, Prettier clean. Live dev-server Playwright verification:
  landing/templates/mobile screenshots confirming the wider canvas and Fredoka headline (close-up
  crop confirmed correct Turkish glyph rendering — ğ/ı/ş/ü all correct); `/beta` and `/new`
  screenshotted showing the stacked single-column layout; `/new` driven through a real click
  (selecting the "Psikolog / Terapist" niche card) with screenshots at 150ms (answer bubble +
  typing dots visible, next question still hidden) and ~1.65s later (next question fully revealed
  with "Adım 2/15") — confirmed the pacing behaves exactly as designed; `prefers-reduced-motion`
  emulation confirmed the instant fallback. Zero console/page errors on every screen checked.
- Deploy intentionally not run — stays a separate controlled step, same as every prior stage.

### 2026-07-11 — Super admin customer draft access

- Fixed the customer-support permission gap: `canManageSite` now treats `locals.user.isAdmin` as a
  platform-level manage permission for owned sites, while preserving ownerless seed-demo access and
  blocking signed-out/non-owner users. Because editor, draft preview, autosave, chat edit, media,
  export, publish, and dashboard guards already call this shared helper, the super-admin bypass is
  centralized instead of duplicated per route.
- Added a direct `Edit` button beside `Preview` on `/admin/customers/[userId]`, so operators can
  open a customer's editor from the customer detail page without manually constructing `/editor/:id`.
- Verification: targeted Vitest coverage passed for auth + site publish/chat guards (`3 files / 22
tests`), and `npm run check` completed with 0 Svelte/TypeScript errors or warnings.
- Deployed on user request with `npm run deploy:production`: release `20260711T001636Z`, `current`
  points to `/var/www/saaskaya/releases/20260711T001636Z`, PM2 `saaskaya` restarted and is online,
  deploy smoke passed on `https://saaskaya.com` mobile + desktop. Post-deploy checks confirmed
  `http://saaskaya.com/tr` redirects 301 to HTTPS, `https://saaskaya.com/tr` returns 200,
  `https://seed-law.saaskaya.com/en` returns 200 with `cache-control: no-cache, must-revalidate`,
  and the TLS certificate subject is `CN = saaskaya.com`.

### 2026-07-11 — Controlled profession kit expansion + prompt recipes

- Amended the constitution language from "3 niche presets" to "3 raw theme presets": law, psych, and
  dental remain the only raw theme/schema presets, but profession kits may now expand as controlled
  recipes that map back to those presets and the fixed block set. This preserves the no-freeform
  builder/no-plugin-marketplace rule while unlocking the product loop the user wants: more
  profession-specific starts with lower AI token spend.
- Installed the Hallmark skill with `npx skills add nutlope/hallmark` for future design audit/study
  work. It landed under `.agents/skills/hallmark`; current-session usage still depends on Codex
  skill discovery/restart, so this implementation did not rely on Hallmark output.
- Added a generic controlled-kit registry on top of the existing psych kits and introduced three new
  profession kits: `dietitian-modern`, `real-estate-agent`, and `beauty-salon`. Each kit has
  profession/category metadata, feature-kit tags, prompt recipes, a schema-valid `Site` factory, and
  maps back to the existing raw theme presets instead of adding raw layout/code freedom.
- Expanded `/templates` from a psych-only catalog into a profession-kit catalog showing profession,
  feature kits, prompt recipe, quality metadata, and a safe non-image card treatment for kits that do
  not yet have bespoke visual assets. Existing psych kit images are preserved.
- Expanded `/new` onboarding and `/api/onboarding/finish` to accept the new controlled kit registry.
  The first niche question now includes Dietitian, Real Estate Agent, and Beauty Salon; selected kits
  flow into the composed generation brief with profession and feature-kit steering while keeping the
  AI inside the fixed block set.
- Verification: `npm run check` passed with 0 errors/warnings, targeted kit/onboarding tests passed
  (`5 files / 59 tests`), full `npm test` passed (`65 files / 403 tests`), and `npm run build`
  succeeded. Local dev-server SSR checks returned 200 for `/tr/templates`,
  `/tr/new?kit=dietitian-modern`, and `/tr/new?kit=beauty-salon`, and the rendered HTML contained
  the new profession kit, feature-kit, and prompt recipe content.
- Deployed on user request with `npm run deploy:production`: the first sandboxed attempt passed
  check/test/build and switched `current` but failed at PM2 restart due `/root/.pm2` sandbox access,
  then the escalated rerun completed fully. Release `20260711T164313Z` is live, `current` points to
  `/var/www/saaskaya/releases/20260711T164313Z`, PM2 `saaskaya` restarted and is online, and
  production smoke passed. Post-deploy checks confirmed `https://saaskaya.com/tr/templates`,
  `https://saaskaya.com/tr/new?kit=dietitian-modern`, and
  `https://saaskaya.com/tr/new?kit=beauty-salon` return 200; `http://saaskaya.com/tr/templates`
  redirects 301 to HTTPS; live HTML contains Modern Diyetisyen, Emlak Danışmanı, Güzellik Salonu,
  Feature kitler, and Prompt tarifi; TLS certificate subject is `CN = saaskaya.com`.

### 2026-07-11 — Public UI cleanup: hero, login, legal, and container rhythm

- Cleaned up the public marketing surface based on the user's CrewAI reference and screenshot
  notes. The home hero no longer shows the redundant profession/language/beta pills, and the
  animation's visible technical captions (`Canlı akışta gör`, loop/autoplay, reduced-motion copy)
  are suppressed while keeping the reduced-motion behavior itself.
- Added a real prompt-composer CTA on the home hero. It stores the user's one-sentence brief locally
  and opens `/new`; the onboarding screen then opens the raw-description path with that text
  prefilled. This adapts the CrewAI-style middle prompt button into the actual saaskaya generation
  loop instead of adding a decorative chatbot.
- Reworked the hero trust notes into two equal columns and removed the existing floating
  `MessageBubble` from the home page so mobile does not show two competing chat affordances or cover
  the trust content.
- Introduced shared public layout primitives (`MarketingSection`, `PublicBreadcrumb`,
  `PromptComposer`) and made `AppCanvasShell` support a no-chrome mode. `PublicShell` now uses the
  no-chrome mode, so public pages no longer render the fake browser bar; application/admin/editor
  screens keep the old chrome by default.
- Moved pricing, templates, contact, blog, blog detail, and about pages onto the same `max-w-7xl`
  outer rhythm as the hero/header/footer. Readable inner text columns stay narrower where useful,
  but the page edges now align consistently.
- Redesigned `/login` as a centered, single-column auth panel with a minimal top bar and small legal
  links instead of the previous disconnected two-column empty layout.
- Rebuilt `LegalShell` inside the public header/footer system. The old "Ana sayfa" back button is
  now a breadcrumb (`Ana sayfa / Yasal / current document`), and every legal page gets a compact
  legal-document navigation block.
- Verification: `npm run check` passed with 0 errors/warnings, full `npm test` passed (`66 files /
407 tests`), and `npm run build` succeeded after the final changes. Local smoke checks returned
  200 for `/tr`, `/tr/login`, `/tr/legal/acceptable-use`, `/tr/pricing`, and `/tr/templates`.
  Chromium screenshot smoke covered desktop home/login/legal/templates and mobile home: no console
  errors, no horizontal overflow at 375px or 1440px, the home prompt composer is present, the
  redundant hero technical captions are absent, and the fake public shell labels are absent.

### 2026-07-11 — Porkbun credential readiness check

- Checked `data/production.db` `app_settings` without exposing secret values. `PORKBUN_API_KEY` and
  `PORKBUN_SECRET_KEY` are both set, so `porkbunConfigured()` resolves true from the application
  settings path.
- Domain purchase is still not customer-live because `PAYMENT_MODE` remains `disabled`. `SERVER_IP`
  and `DOMAIN_PROVISION` are not set in `app_settings`; `SERVER_IP` is required for Porkbun A-record
  creation, while `DOMAIN_PROVISION=1` is required for automatic nginx+TLS provisioning.
- Current production state has no `domain_reservations` rows and `custom_domains` count is 0.

### 2026-07-11 — Production deploy after user-requested updates

- Deployed the current clean workspace with the canonical atomic release pipeline
  (`npm run deploy:production`). Source `HEAD=1650ff6`; previous live release was
  `20260711T182255Z`.
- Verification inside the deploy: `npm run check` passed with 0 errors/warnings, full test suite
  passed (`67 files / 410 tests`), production build succeeded, PM2 `saaskaya` restarted/saved, and
  `scripts/smoke-production.mjs` passed on the public read-only mobile + desktop surface.
- New live release is `20260711T221044Z`; `current` points to
  `/var/www/saaskaya/releases/20260711T221044Z`. Post-deploy live checks: `https://saaskaya.com/tr`
  returned 200, `http://saaskaya.com/tr` redirects 301 to HTTPS, `/api/health` returned
  `{ ok: true }`, and the TLS certificate subject is `CN = saaskaya.com` valid through
  2026-10-06.
- Auth note from the same session: there is intentionally no separate super-admin login screen.
  Super admins use the normal `/login` magic-link flow; after login, emails listed in
  `ADMIN_EMAILS` become `locals.user.isAdmin=true` and can access `/admin/*`.

### 2026-07-11 — Public floating assistant dock

- Replaced the scattered public `MessageBubble` usages with a shared `SiteAssistantDock` mounted
  from `PublicShell`, plus the beta page. The dock is fixed at desktop center-bottom, uses existing
  saaskaya tokens, has minimize/close controls, and degrades to a full-width mobile bottom bar with
  safe-area spacing.
- Added `/api/assistant/route`, a rate-limited rule-based assistant router. It classifies short
  visitor messages into onboarding, pricing/domain, support, legal, login, or dashboard actions. The
  onboarding action stores the user's brief for `/new`; support opens the existing inquiry workflow
  instead of creating a second inbox path.
- Removed the embedded home hero `PromptComposer` so the CrewAI-style interaction lives in one
  persistent bottom surface rather than inside the hero content.
- Verification: `npm run check` passed with 0 errors/warnings, full `npm test` passed (`67 files /
410 tests`), and `npm run build` succeeded. Local preview on `127.0.0.1:4175` returned 200 for
  `/tr`. Assistant API smoke returned `start_onboarding` for a dietitian website brief and
  `show_pricing` for a domain/hosting price question. Chromium checks confirmed desktop dock
  position at `left:360`, `width:720`, `centerDelta:0`, `bottom:24` on a 1440px viewport; mobile
  had `scrollWidth:390` on a 390px viewport with no horizontal overflow. Submitting a profession
  brief from `/tr` navigated to `/tr/new` and prefilled the textarea.

### 2026-07-11 — Private owner login path

- Added a separate owner-only login path at `/owner/[secret]`, where `[secret]` must match the
  env-only `OWNER_LOGIN_PATH`. Missing config or a wrong slug returns 404, and the route is not linked
  from public navigation or sitemap surfaces.
- Implemented env-only owner credentials: `OWNER_EMAIL` (fallback: first `ADMIN_EMAILS`) and
  `OWNER_PASSWORD_HASH`, generated by `scripts/generate-owner-password-hash.mjs`. The password hash
  uses scrypt; no plaintext password is stored or logged. Added the owner env keys to
  `.env.example` and the PM2 `ecosystem.config.cjs` whitelist so production can receive them from
  the real `.env`.
- Added migration v20 (`owner-login`) with hashed owner sessions, trusted-device records,
  short-lived hashed email confirmation codes, and privacy-safe owner login events. First login from
  a new device/IP/user-agent sends a 6-digit email code; after verification the device is trusted for
  that IP prefix + user-agent. Matching trusted devices can log in with password only. Owner sessions
  use a separate strict cookie (`sk_owner_session`) and make `locals.user.isAdmin=true`.
- Logout now clears both normal magic-link sessions and owner sessions. Existing `/login` magic-link
  auth remains available as a fallback path.
- Verification: `npm run check` passed, targeted owner/migration tests passed (`2 files / 10 tests`),
  full test suite passed (`68 files / 413 tests`), and `npm run build` succeeded.

### 2026-07-11 — Assistant widget UX: KB answers, typing indicator, footer clearance, inquiry-source fix

- **Fixed a silent support-form bug:** the assistant dock posts `source: 'assistant'` to
  `/api/inquiries`, but `INQUIRY_SOURCES` only allowed `contact|chat`, so every assistant support
  submission failed with a 400 and never reached `/admin/inbox`. Added `'assistant'` to the enum
  (`src/lib/server/inquiries.ts` — plain text column, no migration needed) and to the admin inbox
  source filter chips; covered by regression tests in `inquiries.test.ts`,
  `api/inquiries/server.test.ts`, and `admin/inbox/page.server.test.ts`.
- **Extracted + expanded the rule-based knowledge base** into `src/lib/server/assistant/kb.ts`
  (typed `KbEntry[]`, ordered first-match-wins, TR/EN/DE keywords + replies). New informational
  intents (`action: 'answer'`): `what_is_saaskaya`, `how_it_works`, `supported_languages`,
  `beta_status` (→ `/beta`), `editing_media`, `publishing`, `account_login` (→ `/login`), so
  anonymous visitors get real answers to general product questions. The endpoint
  (`api/assistant/route/+server.ts`) is now a thin shell (rate limit + zod + `classify()`); the
  response contract is unchanged. Removed the over-broad `mail`/`email` keywords from the domain
  intent. Decision: **no AI in this iteration** — keyword rules only; the typed KB is deliberately
  shaped so a future Groq fallback phase can reuse it as system-prompt content. Matching lowercases
  with both `tr-TR` and default locales so uppercase Turkish and English both hit. New
  `kb.test.ts` (14 tests) encodes the ordering traps (info questions of 28+ chars must not fall
  into `start_onboarding`).
- **Widget UX (`SiteAssistantDock.svelte` + `layout.css`):** greeting shortened per locale,
  rendered only while the conversation is empty, and restyled as a subtle hint
  (`.sk-assistant-greeting`); added a WhatsApp-style three-dot typing bubble
  (`.sk-assistant-typing`, first `@keyframes` in `layout.css`, static under
  `prefers-reduced-motion`) with a length-scaled reveal delay (450 + 4×reply-length ms, clamped
  ≤900ms; real network latency counts toward it, `typing` cleared in `finally`); panel got
  `aria-live="polite"`.
- **Footer clearance + transparency:** the centered minimized pill used to cover the centered
  copyright line in `PublicFooter`. Fixed by reserving document-flow space — the copyright bar's
  bottom padding is now `calc(4.5rem + env(safe-area-inset-bottom))` — rather than nudging the
  fixed dock. Pill/shell background alpha lowered 0.94 → 0.78 with `blur(16px)` (+`-webkit-`
  prefix) and a `@supports` solid fallback for browsers without backdrop-filter.
- Verification: `npm run check` 0 errors; `npm run test` 69 files / 430 tests green;
  `npm run build` succeeded. Live smoke on the dev server: 8 intents route correctly via curl
  (incl. `answer` + `fallback` + onboarding-prefill regression); `POST /api/inquiries` with
  `source:'assistant'` → 200 + DB row; admin magic-link login → `/admin/inbox?source=assistant`
  lists exactly the smoke inquiries. Playwright (1440px + 390px): pill no longer intersects the
  copyright text (28–32px clearance; note `scroll-behavior: smooth` races naive scroll
  measurements — use `behavior: 'instant'`), shell computed background `rgba(251,250,247,0.78)` +
  `blur(16px)`, typing dots appear <100ms and reply reveals ~0.9s, greeting disappears after the
  first message, support form submits end-to-end, `reducedMotion: 'reduce'` → `animation: none`,
  zero horizontal overflow, zero console errors.

### 2026-07-11 — Aşama 1: Operatör aktivasyonu + beta gate canlı

- **Production ayarları aktif edildi:**
  - `SERVER_IP=72.62.52.55` — Porkbun A-record oluşturma için gerekli
  - `DOMAIN_PROVISION=1` — domain attach'te otomatik nginx+TLS provisioning
  - `BETA_MODE=1` — kapalı beta, sadece davetli/admin email'ler login olabilir
  - `ALERT_EMAIL=kayacuneyd@gmail.com` — monitoring ve destek bildirimleri
  - `AI_GLOBAL_MONTHLY_BUDGET_USD=5` — global AI bütçe üst sınırı
  - `PAYMENT_MODE=disabled` — banka/domain ödemesi kapalı (kullanıcı isteği)
  - `MONITOR_AUTORESTART=1` — health check başarısız olursa PM2 auto-restart
- **Beta gate verified:**
  - Davetsiz email → 403, Türkçe "kapalı betadır" mesajı
  - Admin email (kayacuneyd@gmail.com) → 200 bypass çalışıyor
  - `/tr/beta` sayfası 200
- **EMAIL_PROVIDER=resend**, `EMAIL_FROM=Saaskaya <noreply@saaskaya.com>` zaten ayarlıydı
- **Deploy:** release `20260711T232723Z`, production smoke temiz, health ok
- **Kalan:** controlled authenticated E2E smoke (gerçek AI kredisi harcar), bank transfer/domain fulfillment (PAYMENT_MODE kapalıyken zaten çalışmaz), BACKUP_REMOTE off-site yedek hedefi (kullanıcı sonra belirleyecek)

### 2026-07-11 — Aşama 2A: 5 yeni blok (Testimonials, Pricing, Process, Booking, Credentials)

- **Schema genişletildi** (`src/lib/schema/site.ts`): `SECTION_TYPES` dizisine `testimonials`, `pricing`, `process`, `booking`, `credentials` eklendi; her biri için `sectionShapes` (props + content) ve `sectionSchema` discriminator tanımlandı. Mevcut 9 bloktan 14 bloğa çıkıldı.
- **5 yeni Svelte bileşeni** (`src/lib/blocks/`):
  - **Testimonials.svelte** — grid (3 kolon) + carousel varyant; yıldız puanı, avatar/baş harf, quote + isim/rol
  - **Pricing.svelte** — cards (highlighted/regular, ₺/€/$ para birimi) + table varyant; feature listesi
  - **Process.svelte** — vertical (numaralı timeline + bağlantı çizgisi) + horizontal (kart scroll) varyant
  - **Booking.svelte** — inline (kart içi CTA) + banner (tam genişlik ikincil arka plan) varyant
  - **Credentials.svelte** — grid (3 kolon kart) + list (bölünmüş satır) varyant; ikon URL + issuer/yıl
- **Registry güncellendi** (`src/lib/blocks/registry.ts`): 5 yeni import + registry objesine eklendi
- **Templates sayfası güncellendi** (`src/routes/templates/+page.server.ts`): `sectionLabels` 14 tipe genişletildi
- **Doğrulama:** `npm run check` 0 errors/warnings, `npm test` 69 files / 430 tests passing, `npm run build` succeeded
- **Deploy:** release `20260711T234238Z`, PM2 online, production smoke temiz
- **Henüz yapılmayan:** AI generation prompt'larına yeni blok tiplerinin tanıtılması (mevcut generation hâlâ eski 9 blokla çalışır), profesyonel kitlere yeni blokların eklenmesi

### 2026-07-12 — Owner email code fallback

- Incident: owner login sent the email verification code, but entering the correct code could still
  return the generic failure.
- Root cause: production `owner_login_events` showed `code_sent` with the pending
  `owner_email_codes.attempts=0`, meaning the verify request failed before code comparison. The
  `/owner/[secret]` verify action required `sk_owner_device`; if that cookie was not present on the
  second POST (browser/fetch/protocol/cookie edge case), a valid code was rejected as
  `not-configured` without logging `code_failed`.
- Fix: after password success, the owner page now carries the same short-lived device token in a
  hidden field as a fallback. Verification uses the cookie first, then the form token, and rewrites
  the device cookie on success so trusted-device login continues to work.
- Prevention: added a route regression test proving a valid email code is accepted when the device
  cookie is missing but the hidden device token is present.
- Verification: targeted owner tests passed (`src/routes/owner/[secret]/page.server.test.ts` +
  `src/lib/server/ownerAuth.test.ts`, 4 tests), owner/migration tests passed (10 tests),
  `npm run check` passed, and `npm run build` succeeded. Full `npm test` is currently blocked by an
  unrelated pre-existing parse error in `src/lib/kits/professions.ts:408` (`process:` inside the
  `configs` array); owner-specific coverage is green.

### 2026-07-12 — Public nav + templates/pricing page polish

- **Navigation adjusted:** public header now keeps Templates/Kits out of the primary navbar and adds
  About/Über uns/Hakkımızda. Templates/Kits remains available from the footer product column.
- **Pricing hero cleaned up:** removed the repeated brand/logo block from `/pricing`; the page now
  follows the same simpler public-page hero rhythm as About/Contact with kicker, pills, H1, lead and
  direct CTA/FAQ actions.
- **Templates hero/showcase cleaned up:** removed the redundant back-link/logo stack from `/templates`
  and converted the kit list into a horizontal scroll-snap showcase with card hover/focus motion and
  reduced-motion fallback.
- **Incidental blocker fixed:** `src/lib/kits/professions.ts` had partially inserted extra kit
  sections outside their config objects, and the helper injected non-localized content into the Zod
  `Section` schema. Moved those blocks into their kit configs and made the helper emit localized
  schema-valid `process`, `pricing`, `testimonials`, `credentials`, and `booking` sections.
- **Verification:** `npm run check` passed, targeted templates/professions tests passed, full
  `npm test` passed (70 files / 441 tests), and `npm run build` succeeded. First production deploy
  (`20260712T020411Z`) reached PM2 online but exposed a smoke-script hang in the image-load wait and
  a mobile templates false-positive on lazy, offscreen showcase images. Added a bounded image wait to
  `scripts/smoke-production.mjs` and made the six template showcase JPGs eager-loaded. Targeted
  templates/professions/owner route tests passed (16 tests), `npm run check` and `npm run build`
  passed again, and the second production deploy `20260712T021313Z` completed with production smoke
  passing.

### 2026-07-12 — Owner code input accepts spaced autofill

- Incident: owner login email code entry could show the browser-native "match the requested format"
  error before the form reached the server when the code was entered as spaced digits
  (`7 7 6 9 5 1`).
- Root cause: the owner code input required exactly six contiguous digits via client-side pattern and
  `maxlength=6`, while browsers/password managers can autofill one-time codes with spaces.
- Fix: removed the fragile client-side pattern, allowed longer input for spaced digits, and normalized
  owner email codes server-side by stripping non-digits before hashing/comparison.
- Prevention: added an owner route regression test for spaced one-time-code input.
- Verification: targeted owner tests passed (2 files / 5 tests), `npm run check` passed, and
  `npm run build` succeeded.

### 2026-07-12 — Owner-managed multilingual blog CMS + WYSIWYG

- **Blog moved from static content to DB-backed CMS:** added `blog_posts` and
  `blog_post_translations` (migration v21) with status, slug, author, reading time, cover/SEO image,
  and per-locale TR/EN/DE title/summary/category/SEO/body fields. Existing static blog posts seed
  into the DB on first blog access so the public blog does not go empty after migration.
- **WYSIWYG decision:** added TipTap/ProseMirror for owner/admin editing, but store/render the body as
  validated ProseMirror JSON rather than raw HTML. This keeps the platform aligned with the
  constitution's “no arbitrary HTML/CSS render” principle while still giving comfortable article
  writing controls.
- **Admin UI:** added `/admin/blog` and `/admin/blog/[postId]` with create/edit flows, draft/published
  states, cover image URL + alt text, SEO title/description, and three separate language bodies.
- **Public UI/SEO:** `/blog` and `/blog/[slug]` now read published DB posts; single articles use a
  breadcrumb instead of the old back-link, support cover images, render body content via Svelte
  components (no `{@html}`), and include article image + breadcrumb JSON-LD. `sitemap.xml` now uses
  published DB blog slugs.
- **Verification:** installed TipTap packages, formatted changed files, `npm run check` passed with 0
  warnings, full `npm test` passed (70 files / 441 tests), and `npm run build` succeeded. Dev smoke:
  `/blog` 200, `/blog/ai-assisted-website-building` 200, `/admin/blog` 303 to `/login` when
  unauthenticated.

### 2026-07-12 — Mobile roadmap Phase 0: reusable mobile audit script + baseline

- Kicked off the mobile optimization roadmap (nav → hero animation → onboarding wizard → editor →
  PWA → sweep; plan reviewed with the operator). Added `scripts/mobile-audit.mjs` (playwright-core,
  read-only): for each route × viewport it reports HTTP status, horizontal overflow, console errors,
  the widest overflowing elements, inputs under 16px (iOS focus-zoom triggers), and interactive
  elements with sub-44×40px hit areas; screenshots + `report.json` per run.
- **Baseline (375/390px, dev):** zero document-level horizontal overflow and zero console errors on
  all 13 audited routes — the `overflow-x: clip` guards hold. The real issues are _clipping inside_
  containers (FlowAnimation `grid-plane` measures 1388px inside a 375px stage; templates carousel is
  intentional scroll-snap), plus ~10 sub-44×40px tap targets per page (`sk-btn-sm` ≈30px tall) and
  sub-16px inputs on `/en`, `/en/contact`, `/en/beta`.
- Note: `/editor/seed-law` redirects to `/en/login` on this dev DB (editor auth), so editor-phase
  verification will need a signed-in session.
- Verification: baseline audit run captured to scratchpad; script formatted with prettier.

### 2026-07-12 — Mobile roadmap Phase 1: hamburger menu + language dropdown

- **PublicHeader restructured for mobile.** Below `lg` the header is now a single row: brand mark,
  a compact language dropdown, and a hamburger button. The full nav/pills/CTA row is unchanged at
  `lg+` (desktop pixel-identical). Previously there was no mobile menu at all — nav links just
  `flex-wrap`ped, and the flag-pill switcher rendered twice.
- **Menu = native `<dialog>` (`showModal()`), not a DaisyUI drawer.** The top layer gives focus
  trap, Escape close, `aria-modal`, and renders above the `z-index:70` assistant dock with no
  stacking-context edits. Full-screen sheet: nav links (`min-h-12`, active route highlighted),
  full-width Login/Panel + Betaya başla CTAs. Closes on Escape, backdrop click, and `afterNavigate`;
  focus returns to the trigger natively; body scroll locked via
  `body:has(dialog[data-nav][open])`. Entrance fade is gated on `prefers-reduced-motion`.
- **LanguageSwitcher gained a `variant="dropdown"`** (`<details>`-based, native semantics): current
  flag + code as the trigger, full locale names in the panel, closes on outside pointerdown and
  after navigation. Pills variant untouched for desktop. Added `uiIcons.menu`.
- **Global touch-target rule:** `@media (pointer: coarse) { .sk-btn-sm { min-height: 2.5rem } }` —
  raises the ≈30px small buttons to 40px on touch devices without changing desktop density.
- Verification: 33-check playwright run at 375px + 1280px passed (open/close semantics, `:modal`
  top-layer assert, scroll lock/unlock, focus return, locale switch `/en/pricing → /tr/pricing`
  preserving path, outside-click close, zero overflow and zero console errors on en/tr/de);
  screenshots reviewed; `npm run check` 0 errors, 441/441 tests, production build OK.

### 2026-07-12 — Mobile roadmap Phase 2: FlowAnimation scale-to-fit stage

- **The hero animation now renders its scenes at a fixed 720px design width and uniformly
  `transform: scale()`s to the container.** Structure: outer `.flow-viewport` (real layout size,
  16:9, `overflow:hidden`, keeps radius/border/shadow/background so the frame never scales) +
  inner absolute `.flow-stage` (720px, `transform-origin: top left`, `scale(clientWidth/720)` via
  `bind:clientWidth`). The IntersectionObserver target moved to the outer frame; reduced-motion
  static scene scales identically; `data-testid="flow-animation-stage"` stays on the outer element.
- **Key finding: desktop was broken too, not just mobile.** The hero column is only ~574px wide at
  1280 (max-w-7xl grid), so scene 3's fixed-px devices (460px desktop mock + phone + tablet,
  > 700px intrinsic) overlapped each other and the publish card clipped — screenshots confirmed
  > garbled text overlap before the fix. After: all 5 scenes render as composed at 574px (scale 0.80)
  > and at 301px/375-viewport (scale 0.42); text is small on phones but legible for a decorative loop
  > (documented escape hatch: bump label fonts inside the stage via one media query if review wants).
- The `.grid-plane` background (intentional 3D bleed, clipped by the frame) still measures wider
  than the viewport in getBoundingClientRect terms but contributes no document overflow.
- Verification: scenes 1/3/5 screenshot-reviewed at 1280 + 375; `svelte-check` 0 errors, 441/441
  tests, production build OK; mobile audit on `/en` reports 0px document overflow, 0 console errors.

### 2026-07-12 — Mobile roadmap Phase 3: onboarding wizard mobile polish (/new)

- **Transcript behaves like a chat on phones:** height cap `max-h-[min(28rem,55dvh)]` (was a fixed
  `28rem` that pushed the input off short screens) + a new autoscroll `$effect` (there was none —
  new bubbles appeared below the fold) that follows answered questions / typing indicator / error
  bubbles, instant under `prefers-reduced-motion`.
- **iOS keyboard/zoom fixes:** all wizard inputs (`short_text`, `open_text`, `list_text`, raw
  textarea) are `text-base sm:text-sm` (16px on phones — Safari no longer zooms on focus) with an
  `onfocus` `scrollIntoView({ block: 'center' })`; no fixed positioning anywhere, so the flex-bottom
  input stays reachable above the keyboard thanks to the dvh cap.
- **Tap targets:** the `list_text` pill remove button is now a 28px square with a localized
  `aria-label` (added `remove` copy in TR/EN/DE); `sk-btn-sm` buttons get 40px min-height from the
  Phase 1 `pointer: coarse` rule.
- **AppCanvasShell (all consumers):** outer padding `px-2 py-2` below `sm` (was `px-4 py-4`) and
  decorative browser-chrome dots hidden below `sm`; the chrome bar itself stays (it carries the
  Home link + language switcher). The `/new` chrome switcher now uses `variant="dropdown"` (pills
  overflowed the bar at 375). Card padding `p-4 sm:p-8`, page gap `gap-5 sm:gap-8`.
- Verification: playwright drove 4 wizard steps at 375 (touch emulation): autoscroll pinned to the
  newest bubble, transcript ≤55% of viewport, inputs report 16px computed, coarse-pointer media
  matches, zero overflow/console errors on `/tr/new`, `/tr/login`, `/tr/beta`; desktop chrome dots
  and question cards unchanged; `svelte-check` 0 errors, 441/441 tests, production build OK.

### 2026-07-12 — Mobile roadmap Phase 4: editor mobile layout (pane toggle)

- **Below `lg` the editor is now a full-screen two-pane toggle** (`Düzenle | Önizleme` segmented
  control + status pill above the split). Both panes stay mounted — hiding is CSS-only
  (`hidden lg:flex`), never `{#if}`, because unmounting the preview iframe reloads it and drops the
  `saaskaya:draft` postMessage bridge. Sidebar is full-width on phones (`w-full lg:w-[19.5rem]`,
  the old `max-w-[88vw]` cap that crushed the preview is gone).
- **Pinned chat input:** the sidebar tab area is a non-scrolling flex column; checklist/quality
  `<details>` are `shrink-0` and default-collapsed below `lg` (`MediaQuery('(min-width:1024px)')`
  from `svelte/reactivity` — they used to shove the chat below the fold); the Chat tab wrapper is
  `overflow-hidden` so ChatTab's internal transcript scrolls and the form pins to the pane bottom.
  ChatTab gained transcript autoscroll, `text-base sm:text-sm` + `enterkeyhint="send"` on the
  input, and a mobile-only hint bubble after an applied AI edit pointing at the Önizleme toggle.
- **Toolbar diet below `lg`:** viewport-preset buttons hidden (desktop feature; the phone pane is
  naturally narrow), "Saved preview" label icon-only below `sm`, and the right cluster wraps
  (`flex-wrap`) — the Republish button used to clip past the viewport. Editor shell height is
  `h-[calc(100dvh-1rem)] sm:h-[calc(100svh-2.5rem)]` so the pinned input rides the phone URL
  bar/keyboard.
- Verification (playwright, 375 touch + 1280): signed-in via `AUTH_DEV_ECHO_LINK=1` magic-link
  echo; pane toggle switches; `window.__marker` planted in the iframe **survives** an edit +
  toggle while the headline change renders (bridge intact, no reload); checklist collapsed on
  mobile / open on desktop; chat input 16px and pinned on-screen; publish button fully inside the
  viewport; zero overflow/console errors; desktop two-column layout unchanged (sidebar 312px,
  presets visible). `svelte-check` 0 errors, 445/445 tests, production build OK.

### 2026-07-12 — Mobile roadmap Phase 5: PWA (SaaS host only)

- **Host gate:** `locals.isTenantHost` set in `hooks.server.ts` from the unit-tested
  `resolveHostReroute(event.url, PUBLIC_APP_HOST)` and exposed through the root layout. Three
  independent gates keep the PWA off tenant origins: SvelteKit auto-registration disabled
  (`serviceWorker.register: false` in vite.config.ts), manual registration in `+layout.svelte`
  behind `!dev && !isTenantHost`, and manifest/theme-color/apple-touch-icon head tags plus the
  `/manifest.webmanifest` endpoint (404 on tenant hosts) behind the same flag.
- **`viewport-fit=cover` added to app.html** — this activates the previously-inert
  `env(safe-area-inset-*)` usages (assistant dock bottom offset, footer clearance) on notched
  iPhones. Applies to tenant pages too (plain flow content; spot-check landscape after deploy).
- **Icons:** `scripts/generate-pwa-icons.mjs` rasterizes `static/favicon.svg` via the
  playwright-core chromium (no sharp dependency) → `static/icons/{icon-192,icon-512,
maskable-512,apple-touch-icon}.png`; maskable/apple variants are full-bleed `#171614` with the
  glyph in the safe zone. PNGs committed; script kept for regeneration.
- **Service worker (`src/service-worker.ts`):** precaches hashed build assets + small static
  files + `/offline` into a `sk-${version}` cache; navigations are ALWAYS network-first with the
  offline page as the only fallback — SSR HTML and `/api/` are never cached (stale-deploy
  firewall); activate purges old `sk-*` caches; deliberately **no `skipWaiting()`** (a mid-session
  swap would delete the cache a running old page still resolves against). `/service-worker.js`
  ships without long-lived Cache-Control and modern browsers bypass HTTP cache for SW update
  checks, so no nginx change is needed.
- **`/offline` page is fully self-contained** (inline styles, plain `<a href="/">` retry, no
  hydration): the SW serves it at arbitrary URL depths where the app's relative asset paths break
  — the first cut relied on the CSS/JS bundle and rendered unstyled with a dead JS retry button;
  also dropped `prerender = true` (the inline kit config ignored `prerender.entries`, failing the
  build; the SW simply caches the SSR response at install instead).
- **Backlog spec** for tenant-branded PWAs written to `docs/specs/2026-07-12-tenant-pwa-backlog.md`
  (would touch the Zod `Site` schema for a tenant icon slot — separately scoped by design).
- Verification (production build on :3998 against local.db): app host → manifest 200
  `application/manifest+json`, head tags present, icons 200, SW active (scope `/`), 318-entry
  versioned precache, `context.setOffline` navigation renders the styled offline fallback with a
  no-JS retry link, back-online renders normally, rebuild rotates the `sk-` cache; tenant Host
  (`seed-law.saaskaya.com`) → page renders tenant content with ZERO PWA tags and manifest 404.
  `svelte-check` 0 errors, 445/445 tests, build OK.
- **Incident (resolved, logged for prevention):** while stopping the :3998 test server, a broad
  `pkill -f "[b]uild/index.js"` also SIGTERMed the PM2 production process (adapter-node closes its
  listener on SIGTERM), taking saaskaya.com offline for ~60s until PM2 respawned it; health 200
  confirmed on loopback and the public site, other PM2 apps unaffected (3-day uptimes intact).
  Rule going forward: kill test servers by exact PID (`$!`), never by pattern on this shared box.

### 2026-07-12 — Mobile roadmap Phase 6: responsive sweep + final audit (roadmap complete)

- **Global coarse-pointer touch rules extended** (`layout.css`): base `.sk-btn` 44px min-height on
  touch (primary CTAs like "Send message" were 36px), `.sk-btn-sm` 40px, and a 16px font floor on
  `.sk-input`/`.sk-textarea`/`.sk-select`/assistant-dock input — clears every iOS focus-zoom
  trigger on contact/beta/landing without changing desktop density.
- **Hit-area fixes:** PublicFooter nav links 19px → 32px tall (`inline-flex min-h-8 py-1`);
  landing example-card TR/EN/DE preview chips 19px → 28px. Remaining audit flags are compact-by-
  design and WCAG 2.2 AA compliant (≥24px), inline text links (WCAG inline exception), or the
  decorative FlowAnimation button.
- **Audit script hardening** (`scripts/mobile-audit.mjs`): contexts now emulate touch
  (`hasTouch`/`isMobile`) so `(pointer: coarse)` rules measure as on real phones, and each route
  gets a fresh page — a fullPage screenshot on an emulated-mobile page can drop the coarse-pointer
  emulation for the next navigation in the same page, which was silently skewing font/hit-area
  readings for every route after the first.
- **Final audit state (13 routes × 375/390, touch-emulated):** zero horizontal overflow, zero
  console errors, zero sub-16px inputs everywhere. Signed-in `/dashboard` and `/account` also
  0px overflow at 375. Remaining "wide element" reports are the FlowAnimation background plane
  (intentional bleed, clipped) and the templates scroll-snap carousel (intentional). Pricing/
  templates/blog/about needed no structural changes.
- Backlog noted: tenant-site block tap targets (nav pills 32px, locale pills 23px, "Powered by"
  15px in `SiteRenderer`/blocks) — shared-block work, scoped separately per the constitution.
- Verification: `svelte-check` 0 errors, 445/445 tests, production build OK.

### 2026-07-12 — Creem monthly/yearly/domain product integration

- Split the Creem product integration into three operator-managed IDs: monthly Pro, yearly Pro,
  and yearly `.com` domain service. `CREEM_PRO_PRODUCT_ID` remains as a legacy monthly fallback,
  while `CREEM_PRO_MONTHLY_PRODUCT_ID`, `CREEM_PRO_YEARLY_PRODUCT_ID`, and
  `CREEM_DOMAIN_PRODUCT_ID` are now exposed in `/admin/settings`.
- Added `planInterval` support to Pro checkout metadata. Monthly Pro uses the monthly product; yearly
  Pro uses the yearly product and, after a paid/active Creem webhook, grants one included standard
  `.com` domain credit for that site.
- Added `domain_credits` plus migration v22. The yearly Pro domain is modeled as an internal
  entitlement, not as customer-facing product complexity. When the customer selects an available
  `.com`, the credit is consumed and the reservation is marked paid; actual Porkbun registration
  still only runs from the existing paid-reservation fulfillment path.
- Added Creem domain checkout support for monthly Pro customers who add a `.com` yearly service.
  Creem `kind=domain` webhooks route only to `confirmPayment(reservationId)` and never activate Pro.
- Updated dashboard and pricing copy to expose the simple product surface: Free, Aylık/Monthly Pro,
  and Yıllık/Yearly Pro with one standard `.com` included. The separate `.com` domain service remains
  an add-on/payment path, not a public third pricing plan.
- Tightened the default self-service TLD gate to `.com` only; other TLDs fall into manual review unless
  explicitly configured.
- Verification: targeted billing/migration/reservation tests passed (3 files / 37 tests),
  `npm run check` passed with 0 warnings, and the full unit suite passed (70 files / 445 tests).
  `npm run build` was intentionally not run because this checkout is tied to the live build directory
  and should be paired with an explicit deploy/restart.

### 2026-07-12 — Pro packaging refined for non-technical customers

- Applied the operator product decision that the old `CREEM_PRO_PRODUCT_ID` is the monthly Pro product.
  Production `app_settings` now has `CREEM_PRO_MONTHLY_PRODUCT_ID` copied from that legacy value,
  `CREEM_PRO_YEARLY_PRODUCT_ID=prod_6Yq9NS6ySuTOOggMRLruCh`, `CREEM_DOMAIN_PRODUCT_ID` set from the
  new Creem domain product, `PAYMENT_PROVIDER=creem`, and `PAYMENT_MODE=card_only`.
- Added `card_only` as the clearer payment-mode alias while keeping legacy `stripe_only` working as
  "card checkout through the active provider". Dashboard and config help now use that meaning.
- Added site subscription detail reads (`planInterval`, `priceEur`) so dashboard copy can distinguish
  monthly vs yearly Pro from actual DB state instead of guessing.
- Reworked dashboard domain CTA copy: monthly Pro users are explicitly guided to choose a `.com`
  domain as the next step (`15€/year`, managed SSL/DNS/hosting connection); yearly Pro users see their
  included standard `.com` entitlement as ready to use.
- Reworked pricing and assistant answers around the simple customer-facing comparison:
  monthly Pro `17€/month + 15€/year domain = 219€/year` versus yearly Pro `200€/year` with one
  standard `.com` included, approximately a 9% advantage. Copy now explains the managed bundle in
  non-technical terms: website, hosting, SSL, DNS setup, renewal tracking, maintenance, contact forms,
  and email forwarding setup.
- Updated `docs/POLICY.md` and `/legal/terms` so policy matches the new model: yearly Pro includes one
  standard `.com`, monthly Pro can add the managed `.com` service, premium/non-.com/extra domains stay
  separate, and email is forwarding/routing rather than a mailbox product.
- Verification: targeted billing/reservation/assistant KB tests passed (3 files / 44 tests),
  `npm run check` passed with 0 warnings, and the full unit suite passed (70 files / 445 tests).
  `npm run build` was not run because it should be paired with an explicit production deploy/restart.

### 2026-07-12 — Cloudflare domain/email settings exposed

- Added `/admin/settings` inputs for the upcoming Cloudflare DNS + Email Routing automation:
  `CLOUDFLARE_API_TOKEN` (secret), `CLOUDFLARE_ACCOUNT_ID`, and
  `CLOUDFLARE_EMAIL_DEFAULT_LOCAL_PART`.
- Kept them in the `Domains` group beside Porkbun because the intended flow is Porkbun as registrar
  and Cloudflare as DNS/Email Routing provider. The token help text explicitly calls out narrow
  DNS/Zone/Email Routing scope.
- Verification: `npm run check` passed with 0 warnings.

### 2026-07-12 — Cloudflare DNS + Email Routing Phase 1

- Added `src/lib/server/cloudflare.ts`, a server-only Cloudflare provider seam for the upcoming
  domain fulfillment path. It can check configuration/readiness, create or reuse a zone, read
  nameservers, upsert DNS records, enable Email Routing DNS, create destination addresses, create
  forwarding rules, and read Email Routing status.
- Added a Porkbun nameserver delegation seam (`updateNameservers`) so the next phase can register
  domains at Porkbun but delegate authoritative DNS to Cloudflare.
- Added migration v23 and schema fields on `domain_reservations` to track Cloudflare zone id,
  nameservers, zone status, email routing status, local part, destination address, routing rule id,
  and destination verification timestamp.
- Applied v23 to production SQLite and verified `schema_migrations.max(version)=23` plus all new
  `domain_reservations` columns exist.
- This phase intentionally does **not** change live fulfillment yet: existing paid-domain fulfillment
  still follows the current path until Phase 2 wires Cloudflare into registration/attach.
- Verification: targeted Cloudflare/domains/migrations/reservations tests passed (4 files / 32 tests),
  `npm run check` passed with 0 warnings, and the full unit suite passed (71 files / 456 tests).

### 2026-07-12 — Cloudflare domain fulfillment Aşama 2

- Connected paid domain fulfillment to the Cloudflare DNS + Email Routing path. `fulfillReservation`
  now registers via Porkbun only after `paid`, creates/gets the Cloudflare zone, updates Porkbun
  authoritative nameservers to Cloudflare, creates the Cloudflare apex A record, enables Email
  Routing DNS, creates the destination address, and routes the configured local part (default
  `info`) to the user's account email before nginx/TLS provisioning and `attachSiteDomain`.
- Added retry safety for partial external failures: `registeredAt` is written immediately after
  successful Porkbun registration, so a later Cloudflare/TLS failure can be retried without trying
  to buy the same domain again. Cloudflare failures still move the reservation to `failed`, keeping
  the existing operator retry path.
- Added migration v23 fields on `domain_reservations` for Cloudflare zone/nameserver status and
  email-routing state, plus schema/test coverage. Active domains can remain active while email
  forwarding is `pending_verification`.
- Dashboard domain copy now stays non-technical: users see "Alan adı hazırlanıyor", "SSL
  hazırlanıyor", "E-posta yönlendirme doğrulaması bekleniyor", the forwarding summary
  `info@domain → account email`, or "Aktif"; nameservers/provider details stay out of the customer
  UI.
- Verification: targeted Cloudflare/domain/reservation/migration tests passed (4 files / 32 tests),
  `npm run check` passed with 0 warnings, and full `npm test` passed (71 files / 456 tests).
  `npm run build` was not run because this checkout is tied to the live build directory and should
  be paired with an explicit PM2 restart/deploy.

### 2026-07-12 — Cloudflare fulfillment deployed

- Reviewed the Phase 2 Cloudflare fulfillment wiring before production deploy. One live-safety fix was
  added: Cloudflare Email Routing destination addresses and forwarding rules are now reused when they
  already exist, so a webhook/cron retry does not fail just because `owner@email` or `info@domain`
  was created during a previous partial run.
- Deployed production release `20260712T154428Z` with `scripts/deploy-production.sh`. The release was
  built into `releases/`, `current` was switched atomically, and PM2 app `saaskaya` was restarted.
- Verification: targeted Cloudflare/domain/reservation/migration tests passed (4 files / 33 tests),
  `npm run check` passed with 0 warnings, full `npm test` passed (71 files / 457 tests), production
  build passed, deploy smoke passed for `https://saaskaya.com` on mobile + desktop, and live HTTPS
  checks returned 200 for `/`, `/pricing`, and `/templates`.
- Note: release metadata still has `git_dirty=1`; the currently deployed state includes uncommitted
  working-tree changes and should be committed when this batch is accepted.

### 2026-07-12 — Feature Kit / entegrasyon spec'i rev. 2

- `docs/specs/2026-07-12-yeni-ozellik-onerileri.md` analiz edilip revize edildi (yalnızca doküman;
  kod yok). Ana kararlar: **v1 = link-out only** (Instagram/Maps embed + Mailchimp form v2'ye,
  click-to-load facade şartıyla — KVKK/çerez bandı, LCP ve tenant'a-üçüncü-parti-script-yok
  disiplini nedeniyle); **tür başına domain allowlist** + WhatsApp için URL yerine E.164 telefon
  (`wa.me` linkini render üretir) + `rel="noopener nofollow"`; **AI patch'e `url`/`phone` kapalı**
  (prompt-injection ile link değiştirme yüzeyi kapandı); ilk taslaktaki jenerik
  `blockTarget/propKey/generateProps` motoru kaldırıldı — bloklar `settings.integrations`'ı
  doğrudan okur; entegrasyon girişi admin paneli değil **editör Settings kartı + onboarding'e niş
  bazlı opsiyonel sorular**; `siteQualityCheck`'e "kitin ana entegrasyonu boş" uyarısı ve plan
  gating (payment-link → Pro) eklendi.
- Implementasyon ayrı milestone olarak bekliyor (spec §9 fazları); şema değişikliği fixture +
  test şartına bağlandı.

### 2026-07-12 — 30 günlük GTM planı uygulama altyapısı

- Ana büyüme kancasını ürün akışına bağladık: landing sayfasına psikolog/avukat/ikinci dalga
  meslek kartları eklendi ve CTA'lar UTM + `profession` parametresiyle doğrudan `/new` akışına
  gidiyor. `/new` artık desteklenen meslek kampanyasını tanıyor, kullanıcıya mesleğe özel başlangıç
  kartı gösteriyor ve seçimi üyelik istemeden ilk Q&A cevabı olarak kaydediyor.
- Onboarding event kaynakları kampanya bilgisi taşıyacak şekilde genişletildi. `answer` endpoint'i
  source bilgisini kabul ediyor, pending-session başlangıcı kaynakla kaydediliyor ve haftalık GTM
  funnel özeti `bySource`, completion, preview ve editor-open yüzdelerini raporlayabiliyor.
- Güven/inbound içerik ayağı için iki çok dilli blog seed'i eklendi: domain/SSL/hosting'i sade
  anlatan rehber ve psikolog/avukat sitelerinde güven veren yapı rehberi. Blog seed işlemi artık
  var olan DB'lerde yalnızca eksik slug'ları ekliyor; mevcut post var diye yeni seed'leri atlamıyor.
- Operasyonel otomasyon için deterministik `leadTriage` modülü eklendi. Gelen inquiry mesajları
  `hot_lead`, `beta_candidate`, `support_existing`, `compliance_sensitive`, `low_fit` olarak
  sınıflandırılıyor; skor, SLA, manuel inceleme ihtiyacı, gerekçeler ve taslak cevap üretiliyor.
  Operator e-posta bildirimi bu triage özetini içeriyor; yüksek riskli sağlık/hukuk iddiaları
  otomatik gönderim yerine manuel review'a düşüyor.
- Mevcut entegrasyon branch'indeki render-context değişikliğinin check'i bloklamaması için
  `SiteRenderer` aktif `settings.integrations` listesini context'e ve blok prop'larına geçiriyor.
  Eski feature-kit test beklentisi de yeni integration tipleriyle uyumlu hale getirildi.
- Verification: targeted GTM/onboarding/render/schema tests passed (7 files / 66 tests),
  `npm run check` passed with 0 warnings, full `npm test` passed (73 files / 484 tests), touched
  files passed Prettier, and `npm run build` succeeded.

### 2026-07-12 — Owner GTM gözlem, GA settings ve blog JSON import

- Admin menüsüne `/admin/gtm` eklendi. Sayfa son 7 gün için Q&A start, Q&A complete, preview
  generated ve editor opened metriklerini; kampanya source bazlı dönüşüm tablosunu; ayrıca inquiry
  mesajlarından yeniden hesaplanan `hot_lead`, `beta_candidate`, `compliance_sensitive` lead triage
  özetlerini gösteriyor. Bu, GTM kampanya linklerinin owner tarafından doğrudan gözlemlenebilir
  hale gelmesini sağladı.
- `/admin/settings` registry'sine `Marketing` grubu eklendi: `GA_MEASUREMENT_ID` ve
  `GOOGLE_SITE_VERIFICATION`. Root layout bu değerleri DB/env fallback ile okuyor; GA4 sadece
  doğrulanmış `G-...` measurement id ile ve yalnızca saaskaya app host'unda render ediliyor, tenant
  sitelerine otomatik enjekte edilmiyor.
- Blog CMS tarafında yayın güvenliği server seviyesine taşındı: `published` statüsündeki yazılar
  EN/TR/DE title, description, category ve body içeriği tamam değilse kaydedilmiyor. Admin blog
  listesinde her yazı için TR/EN/DE completeness pill'leri gösteriliyor.
- Admin blog listesine çok dilli JSON import formu eklendi. Import tek dosyada slug/status/date/
  readingMinutes/cover ve EN/TR/DE translations alıyor; sections veya rich `body` kabul ediyor;
  slug çakışmasında açık `update existing` onayı istiyor; published importlar aynı 3 dil kilidinden
  geçiyor.
- Verification: targeted blog/import/GTM/layout/config/inquiry/telemetry tests passed
  (6 files / 18 tests), `npm run check` passed with 0 warnings, full `npm test` passed
  (76 files / 491 tests), touched files passed Prettier, and `npm run build` succeeded.

### 2026-07-12 — Story paylaşım sistemi M1: share_assets şeması + server modülü

- Story-paylaşım yol haritasının (owner-yönetimli 1080×1920 görsel/video kütüphanesi → public /share
  → publish-sonrası kişisel kart) ilk milestone'u. **Migration v24 `share-assets`**: owner-global
  `share_assets` tablosu (kind image|video, object_key/url, sort_order, active, localized JSON
  caption) + unique(object_key) + (active, sort_order) index; `schema.ts` karşılığı ve migration
  test assert'leri eklendi.
- **`src/lib/server/shareAssets.ts`**: `validateShareAsset` — görseller mevcut `validateImage`'a
  delege, video için `video/mp4` + ftyp magic-byte (isom/mp42/avc1… major brand) doğrulaması;
  limitler görsel 8MB / video 60MB. `uploadShareAsset` `share/<uuid>.<ext>` anahtarıyla R2'ye yazar
  (immutable CacheControl, DB-insert başarısızsa objeyi geri siler — media.ts ile aynı politika);
  list/active-list (sort_order), toggle, komşu-swap ile up/down sıralama, caption kaydet (boşları
  ayıklar), delete (best-effort R2 temizliği).
- `media.ts`'te `r2Config`/`r2Client`/`imageExtension` export edildi (davranış değişikliği yok);
  `SETTING_DEFS`'e `SHARE_PAGE_ENABLED` (Ops) eklendi — '1' değilken /share 404 verecek.
- Verification: 499/499 test (yeni shareAssets + migration assert'leri dahil), `svelte-check` 0
  hata, production build OK.

### 2026-07-12 — Story paylaşım sistemi M2: /admin/share yöneticisi

- **`/admin/share`**: operatörün story asset kütüphanesi — multipart form-action ile görsel/MP4
  upload (server-side magic-byte doğrulama, temiz hata mesajları), TR/EN/DE caption alanları
  (upload sırasında ve sonradan düzenlenebilir), aktif/gizli toggle, ↑/↓ sıralama, onaylı silme
  (R2 temizliğiyle), ve `/share` sayfasını açıp kapatan `SHARE_PAGE_ENABLED` toggle'ı. Tüm load +
  action'lar `requireAdmin`; `AdminShell` nav'ına "Share" (Growth) eklendi.
- **`ecosystem.config.cjs`**: `BODY_SIZE_LIMIT` (default 80M) — adapter-node'un 512KB gövde
  varsayılanı MP4 upload'unu engelliyordu. ⚠️ **Operatör deploy adımı:** nginx
  `client_max_body_size` da yükseltilmeli (örn. `client_max_body_size 80m;` — en azından
  `location /admin/` için), yoksa nginx 1MB'ta 413 döndürür.
- Verification: playwright ile admin akışı (14 kontrol) — non-admin 403; satır listesi/sıralama/
  toggle/caption/silme round-trip'leri; sahte PNG upload'u action hattından temiz 400 mesajıyla
  döner ("Upload a valid JPEG…"); 375px'te sıfır taşma; sıfır konsol hatası. R2 dev'de
  yapılandırılmadığı için gerçek R2 yazımı prod'da ilk upload'la doğrulanacak (validasyon +
  kütüphane operasyonları unit-testli). 499/499 test, `svelte-check` 0 hata, build OK.

### 2026-07-12 — Story paylaşım sistemi M3: public /share sayfası

- **`/share`** (localized: `/en|tr|de/share`, iki LOCALIZED_PUBLIC_PATHS listesine eklendi):
  `SHARE_PAGE_ENABLED !== '1'` veya sıfır aktif asset'te 404. PublicShell + SeoHead (og:image =
  ilk aktif görsel — WhatsApp/Telegram link önizlemesi için). UI: 9:16 öne çıkan önizleme
  (video `muted playsinline loop autoplay` / görsel), >1 asset'te thumbnail şeridi, locale
  caption; **"Story'de paylaş"** → sayfa URL'si panoya + "Link etiketi" ipucu toast'ı →
  prefetch'li blob → `File` → `navigator.canShare/share`. Fallback A (in-app webview / dosya
  paylaşımı yok): indir + 3 adımlı yönerge; Fallback B (masaüstü): QR ("Telefonundan aç") +
  link kopyala. Blob'lar tap'ten ÖNCE prefetch edilir (iOS user-gesture penceresi).
- **`/share/asset/[id]`** same-origin proxy: R2 `GetObjectCommand` stream (yalnız aktif asset,
  content-type/disposition/1h cache) — `fetch()→blob` akışı için R2 bucket CORS konfigürasyonu
  tamamen gereksiz; `<img>/<video>` önizlemeleri CDN URL'den. `src/lib/share/webShare.ts`:
  `shareStory()` (`shared|fallback|cancelled`) + `canShareFiles()` — M5 de kullanacak.
- Yeni bağımlılık: **`uqr`** (~3KB saf JS QR-SVG, server-side render — client bundle'a girmez).
- Verification: ayar kapalı 404 → açık 200 (3 locale) + `/share` 307; gizli asset proxy'de 404;
  R2'siz dev'de proxy 503 (beklenen — prod'da ilk gerçek asset'le 200 doğrulanacak); playwright
  16 kontrol — route-interception ile beslenen blob + `navigator.share` stub'ı gerçek `File`
  (isim/tür/boyut) ve caption'ı aldı, pano `https://saaskaya.com/tr/share`, toast görünür,
  thumbnail geçişi, stub'sız oturumda fallback yönergesi + proxy'ye işaret eden download linki,
  masaüstünde QR paneli; 375'te sıfır taşma/konsol hatası. 499/499 test, check 0 hata, build OK.

### 2026-07-12 — Story paylaşım sistemi M4: FlowAnimation'dan ilk video + başlangıç görselleri

- **`/dev/story-stage`** (dev-only, prod build'de 404 doğrulandı): 1080×1920 markalı sahne — üst:
  marka + "Pratiğini anlat…" claim + AI·TR·EN·DE eyebrow; orta: mevcut `FlowAnimation` (720px
  self-scale); alt: altın çizgi + `saaskaya.com` mono + `/share`'e işaret eden QR.
- **`scripts/generate-share-video.mjs`**: chromium `recordVideo` ile sahneyi tam bir 5×4s döngü
  boyunca kaydeder → sistem ffmpeg'iyle H.264/yuv420p/faststart 20s sessiz MP4'e transcode
  (`-ss 1` ilk boyama kırpması; sessiz MP4 Instagram'da geçerli, gerekirse anullsrc notu script
  başlığında) → ek olarak sahne 1/3/5'ten üç 1080×1920 PNG başlangıç görseli. Çıktılar gitignore'lu
  `data/share-video/`; **operatör bunları `/admin/share`'den yükler** (boru hattı tek tip).
- Üretilen ilk çıktılar doğrulandı: ffprobe `h264 / 1080x1920 / yuv420p / 20.0s`; sahne-3 karesi
  gözle kontrol edildi (kompozisyon net, taşma yok). `svelte-check` 0 hata, build OK, prod'da
  `/dev/story-stage` 404 / `/en` 200.

### 2026-07-13 — Landing problem-hikaye anlatısı

- Ana sayfa "uzman meslekler" konumlandırmasını koruyarak problem-sonuç anlatısına çekildi:
  hero metni brief/metin/çeviri/domain/teknik kurulum yükünü açıkça adlandırıyor; TR/EN/DE
  kopyalarda "practice/praxis/pratik" dili daha doğal mesleki profil/iş/angebot ifadelerine taşındı.
- Hero altına dört maddelik problem bandı eklendi ve ana akış `hero → problem bandı → süreç →
CTA → örnek siteler → meslek segmentleri → hangi parça ne için kullanılır → fiyat → FAQ/güven →
final CTA` sırasına alındı. Özellik kartları artık soyut feature listesi değil, her parçanın hangi
  ziyaretçi/operatör problemini çözdüğünü anlatıyor.
- Verification: `npm run check` 0 hata/uyarı, `npm run test` 499/499 geçti, `npm run build`
  başarılı. Playwright ile local dev server üzerinde `/tr`, `/en`, `/de` 375px + 1280px kontrol edildi:
  HTTP 200, problem bandı ve yeni feature başlığı görünüyor, yatay taşma 0, konsol hatası 0.

### 2026-07-13 — Public metin düzenleme ve daha doğrudan ana sayfa

- Ana sayfa hero vaadi "site taslağına çevir" dilinden çıkarıldı: TR `Mesleğini anlat, web siten
hazırlansın.`, EN `Describe your work. Get your website ready.`, DE `Beschreibe dein Angebot.
Deine Website entsteht.` Problem bandı eşit kart gridiyle yeniden düzenlendi; çizgili/dağınık
  görünüm yerine her problem için başlık + kısa açıklama kullanılıyor.
- Ana sayfadaki fiyat özeti gerçek link kartlarına çevrildi: Free `/new`, Pro ve Premium
  `/pricing` hedefli; hover/focus hali ve kart içi kısa aksiyon metni eklendi.
- Hakkımızda, blog, templates, pricing, contact ve beta sayfalarında fazla yapay/teknik duran
  "AI wrapper", "AI destekli lansman", "pratik" vb. ifadeler daha doğal problem/sonuç diliyle
  değiştirildi.
- Public copy override sistemi eklendi: migration v25 `marketing_page_copy` tablosu, `src/lib/publicCopy.ts`
  field registry/merge helper, `src/lib/server/publicCopy.ts` DB helper'ları ve `/admin/copy`
  ekranı. Public pazarlama sayfaları artık code default + page/locale override modeliyle çalışıyor;
  boş bırakılan alanlar varsayılan metne düşüyor. Admin nav'ına "Copy" eklendi.
- Verification: `npm run check` 0 hata/uyarı, `npm run test` 501/501 geçti, `npm run build`
  başarılı. Local dev server üzerinde `/tr`, `/en`, `/de`, `/tr/pricing`, `/tr/about`,
  `/tr/templates`, `/tr/blog`, `/tr/contact`, `/tr/beta` HTTP/title kontrolünden geçti;
  `/tr`, `/en`, `/de` 375px + 1280px Playwright kontrolünde yatay taşma 0 ve problem bandı görünür.
  Fiyat kart href'leri `/tr/new`, `/tr/pricing`, `/tr/pricing`; `/admin/copy` auth yokken beklenen
  şekilde `/login` 303 döndürüyor.

### 2026-07-13 — Editor publish identity blocker düzeltmesi

- Incident: `site-32b1bc76` editörde `Publish OK` görünmesine rağmen publish `Complete the site name
and public subdomain before publishing.` hatasıyla duruyordu. Root cause: `siteQualityCheck()` public
  subdomain şartını bilmiyordu; publish API ise ilk yayında `publicHandle === siteId` durumunu eksik
  kurulum kabul ediyordu. Ayrıca editörde public subdomain alanı yoktu, sadece Dashboard'da düzenlenebiliyordu.
- Public handle doğrulaması `src/lib/publicHandle.ts` içine taşındı ve server repo bu helper'ı re-export
  ediyor. Completion checklist'e `identity` adımı eklendi; kalite kutusu artık public handle eksikliğini de
  yayın engeli olarak gösteriyor. Publish butonu ve `Publish OK/Blocked` aynı `canPublish` kaynağını kullanıyor.
- `/api/sites/[siteId]/identity` eklendi: owner-only, mevcut `setSiteIdentity` politikasını kullanır,
  site adı + public subdomain + contact email kaydeder. Editor Settings tab'a `Public subdomain` alanı ve
  "Yayın bilgilerini kaydet" aksiyonu eklendi; kayıttan önce draft `flush()` edilir, böylece stale DB draft'ı
  ekrandaki son değişiklikleri ezmez.
- Save UX iyileştirildi: `DraftStore` artık başarısız PUT cevabındaki mesajı `lastSaveError` olarak saklıyor;
  `Save now` başarılı/başarısız banner gösteriyor, autosave error durumunda hata ekranda kalıyor.
- Verification: `npm run check` 0 hata/uyarı, `npm run test` 508/508 geçti, `npm run build` başarılı.
  Playwright smoke: `/tr` 200, unauth `/editor/site-32b1bc76` login'e yönleniyor, unauth
  `PUT /api/sites/site-32b1bc76/identity` 401 döndürüyor.

### 2026-07-13 — Antigravity CLI profil izolasyonu

- Antigravity CLI'nin bu sunucuda resmi installer ile zaten `/root/.local/bin/agy` olarak kurulu olduğu
  doğrulandı; CLI self-update sonrası sürüm `1.1.1`.
- İki ayrı hesap için izole profil dizinleri oluşturuldu: `/root/.antigravity-profiles/profile-kayacuneyd`
  ve `/root/.antigravity-profiles/profile-thomas`. Token/config ayrımı `HOME` override ile yapılıyor;
  repo `.env` dosyasına credential eklenmedi.
- Kullanım komutları eklendi: `agy-kayacuneyd` / `profil-kayacuneyd` ve `agy-thomas` /
  `profil-thomas`. Her iki profil de `--version` ile doğrulandı; `models` komutu iki profilde de
  beklenen şekilde "Please sign in..." döndürüyor, yani OAuth girişleri kullanıcı tarafından ayrı ayrı
  tamamlanmalı.

### 2026-07-13 — Beta geri bildirimleri: üretim güvenliği, onboarding ve mobil editor

- AI üretimi `AIInvalidOutputError` ile durduğunda kullanıcı artık boşta kalmaz: `/api/sites` hatayı
  loglayıp onboarding cevaplarından kontrollü kit tabanlı, Zod-valid fallback site üretir ve editor'a
  açar. Generator'ın tek repair kuralı korunur; fallback API katmanında devreye girer.
- Hero render ve kalite kontrol güçlendirildi: mobil `clamp()` başlık ölçüleri, image hero için sabit
  okunabilir overlay, uzun hero başlığı/açıklaması ve görsel hero review uyarıları eklendi.
- Onboarding iyileştirmeleri: meslek seçimi mobilde horizontal snap carousel; skip metni locale'e göre
  (`Skipped` / `Boş geçildi` / `Übersprungen`); Zod `too_big/required/format` mesajları kullanıcı dostu
  hale getirildi; text/list sınırları client-side `maxlength` ve sayaçla gösteriliyor.
- Media upload artık JPEG/PNG/WebP raster görselleri server-side `sharp` ile uzun kenar 1920px WebP
  kalite 82 olarak saklar; GIF animasyon riski nedeniyle olduğu gibi bırakılır. Yeni bağımlılık: `sharp`.
- Mobil editor kalabalığı azaltıldı: edit/preview tek toggle CTA, locale tek bayrak dropdown, mobile tab
  grid yerine dropdown sheet, kalite kontrol hafif kırmızı açılır uyarı paneli, publish CTA daha açıklayıcı,
  mobil overflow zinciri gevşetildi. Büyük sidebar marka bloğu kaldırıldı; kompakt logo üst chrome'da.
- Error log: ilk `npm run check` `activeTextLimit` deklarasyon sırası nedeniyle fail etti; root cause
  `$derived(active...)` ifadesinin `active` tanımından önce eklenmesiydi, deklarasyon taşındı. İlk media
  unit test fixture'ı sharp/libpng tarafından okunmayan minimal PNG idi; root cause test fixture'ının
  geçersizliği, fix test PNG'sini sharp ile üretmek.
- Verification: `npm run check` 0 hata/uyarı; hedefli unit testler 43/43 geçti; tam `npm run test`
  510/510 geçti; `npm run build` başarılı. Local dev smoke: `GET /tr` 200, `GET /de/new` 200,
  authsuz `/editor/site-test` 303 `/login`; Playwright 375/1280 `/de/new` ve 375 `/tr` render
  kontrolünde yatay taşma 0 ve console warning/error 0.

### 2026-07-13 — npm audit güvenlik düzeltmesi

- `npm audit` 7 vulnerability raporluyordu: `@sveltejs/kit` altında `cookie <0.7.0` low seviye
  advisory ve `drizzle-kit -> @esbuild-kit/*` zincirinde eski `esbuild@0.18.x` moderate advisory.
  `npm audit fix --force` önerisi SvelteKit/Drizzle paketlerini eski major sürümlere çektiği için
  uygulanmadı.
- `package.json` içine güvenli dependency override eklendi: `cookie@0.7.2` ve `esbuild@0.28.1`.
  `npm install` sonrası lockfile bu çözümlemeyi sabitledi; `@sveltejs/kit` artık patched cookie ile,
  `drizzle-kit` ve ilgili tooling patched esbuild ile çözülüyor.
- Verification: `npm audit` artık `found 0 vulnerabilities`; `npm ls cookie esbuild @esbuild-kit/core-utils
@esbuild-kit/esm-loader drizzle-kit @sveltejs/kit` override çözümlemesini doğruladı. `npm run check`
  0 hata/uyarı, `npm run test` 510/510 geçti, `npm run build` başarılı.

### 2026-07-13 — Editor: Grok-tarzı FAB + açılır kontrol paneli

- Editör ekranındaki her zaman görünür sol sidebar (toolbar + sekme şeridi + checklist + kalite
  kontrol) kaldırıldı; yerine X/Grok'un asistan butonuna benzer, sol altta sabit bir FAB
  (`.sk-editor-fab`, eski "S" logo görünümü) ve tıklanınca açılan bir kontrol paneli geldi
  (`src/lib/ui/EditorDock.svelte`, native `<dialog class="sk-editor-dock">` — dar ekranda tam
  ekran sheet, `sm:` ve üstünde FAB'ın üstünde duran sınırlı boyutlu kart). Varsayılan (panel
  kapalı) durumda ekranda sadece viewport switcher (mobile/tablet/desktop) ve canlı önizleme
  kalıyor; Content/Theme/Pages/Languages/Settings/Chat sekmeleri, checklist kartı, kalite kontrol
  kartı, dil switcher, Saved/Publish rozeti ve "..." menüsü hepsi panelin içine taşındı. Bu
  davranış hem mobil hem masaüstünde aynı (mobil/masaüstü ayrımı yapan eski `mobilePane` state'i
  ve `lg:` breakpoint sidebar-vs-preview mantığı tamamen kaldırıldı).
  Panel içeriği, dialog'un native `open` özniteliğiyle görünürlüğü kontrol edilecek şekilde DOM'da
  her zaman mounted kalıyor (koşullu render değil) — böylece panel kapatılıp açıldığında Chat
  sekmesindeki yazılmakta olan mesaj/onay kartı gibi geçici state kaybolmuyor; önizleme iframe'i de
  panel açık/kapalıyken hiç yeniden yüklenmiyor (postMessage canlı taslak oturumu korunuyor).
- Layout hatası ve düzeltmesi: ilk halde masaüstü panelinde `height: auto` + checklist/kalite
  kontrol kartlarının `shrink-0` olması, bu iki kart açıkken Content sekmesinin (Hero/About/Services
  akordiyonu) tamamen görünmez/tıklanamaz hale gelmesine yol açıyordu (flex `min-h-0` zinciri,
  `auto` yükseklikli bir ata altında düzgün küçülüp scroll oluşturamıyor). Kök neden: checklist +
  kalite kontrol + sekme içeriğini saran dış kapsayıcının kendisi scroll etmiyordu, sadece en
  içteki sekme-içerik div'i `overflow-y-auto` idi — kartlar taştığında hiçbir ata bunu scroll
  edilebilir kılmıyordu. Düzeltme: masaüstü panel yüksekliği `calc(100dvh - 7rem)` (definite,
  `auto` değil) yapıldı; Chat sekmesi hariç tüm sekmelerde checklist+kalite-kontrol+sekme-içeriği
  artık TEK bir `overflow-y-auto` bölgesi içinde birlikte akıyor (Chat kendi iç
  transcript-scroll + pinned-input düzenini korumak için ayrık, `flex-1 min-h-0 overflow-hidden`
  kalıyor).
- Dokunulmayanlar: `ChatTab/ContentTab/ThemeTab/PagesTab/LanguagesTab/SettingsTab.svelte`,
  `StatusPill`, `flags.ts`, `completionChecklist.ts`, `siteQuality.ts`, `icons.ts` — hepsi aynı
  prop'larla, aynı mantıkla, sadece yeni bir kap (`EditorDock`) içinde render ediliyor.
  `AppCanvasShell.svelte` da değiştirilmedi (8+ başka route paylaşıyor); editör artık sadece onun
  `right` snippet'ini doldurmuyor.
- Verification: `npm run check` 0 hata/uyarı. Playwright (playwright-core, headless chromium)
  ile gerçek tarayıcı smoke: panel kapalıyken sadece viewport switcher + iframe + FAB görünür;
  FAB tıklanınca panel açılıyor; Content sekmesinde bir alan düzenlenince canlı önizleme iframe'i
  yeniden yüklenmeden güncelleniyor (`window.__marker` sentinel testiyle doğrulandı); checklist
  "Aç" butonu doğru sekmeye atlıyor; panel ✕ butonu / Esc / backdrop tıklama ile kapanıyor ve her
  seferinde önceki alan state'i korunuyor; 375px genişlikte tam ekran sheet, yatay taşma 0;
  console'da hata/uyarı yok. `/login` (AppCanvasShell'i paylaşan başka bir route) ayrıca
  regresyon olmadığını doğrulamak için ayrıca kontrol edildi.

### 2026-07-13 — Editor dock: 3 UI polishing düzeltmesi

Kullanıcı yeni FAB+panel'i (yukarıdaki madde) gerçek kullanımda test edip 3 sorun bildirdi:
checklist kartı her seferinde açık geliyor ve kapatılamıyor hissi veriyor, kapatma (✕) butonu
çok silik, Chat sekmesinde input'a erişilemiyor. Hepsi `src/routes/editor/[siteId]/+page.svelte`
içinde çözüldü:

- **Checklist**: statik `open` yerine `let checklistOpen = $state(false)` + `bind:open` —
  varsayılan artık kapalı (kalite-kontrol kartıyla tutarlı) ve toggle durumu artık belirsiz bir
  static attribute'a değil gerçek state'e bağlı. "Aç" butonunun `<summary>` içine gömülü olması
  native click-bubbling ile detay'ı da istemeden toggle'lıyordu; `event.stopPropagation()`
  eklendi.
- **Kapatma butonu**: header'ın kalabalık buton sırasından çıkarılıp dialog'a göre
  `absolute right-3 top-3` konumlandırılan, dolgun arkaplan + border + shadow'lu (ghost değil)
  belirgin dairesel bir butona dönüştürüldü — `ScrollToTop.svelte`'deki FAB stiliyle tutarlı.
- **Chat erişilebilirliği**: kök neden, checklist+kalite-kontrol kartları `shrink-0` olduğu için
  Chat'in sarmalayıcısının (kendi iç pinned-input scroll'unu koruması için dış scroll'dan hariç
  tutulmuştu) sıkışıp neredeyse 0 yüksekliğe inebilmesiydi. İki parçalı düzeltme: dış sarmalayıcı
  artık Chat dahil her sekmede koşulsuz `overflow-y-auto`; Chat'in kendi sarmalayıcısına
  `min-h-[22rem]` eklendi (flex item'da explicit min-height flex-shrink'i durdurur) — checklist
  ne kadar açık/büyük olursa olsun Chat artık ya doğrudan görünüyor ya da dış scroll ile
  erişilebiliyor, `ChatTab.svelte`'in kendi transcript-scroll + pinned-input mimarisi
  dokunulmadan.
- Verification: `npm run check` 0 hata. Playwright (playwright-core, 414×869 ve 1400×900
  viewport) ile gerçek tarayıcı smoke: checklist varsayılan kapalı; "Aç" tıklaması checklist'i
  istemeden açmıyor; manuel toggle iki yönde de çalışıyor; kapatma butonu artık sağ üstte katı
  arkaplanla (rgb(251,250,247)) render oluyor; en kötü senaryoda (checklist manuel açık
  bırakılmış) bile chat input'a scroll ile ulaşılıp metin girilebildi, "Gönder" butonu aktif;
  console'da hata yok.

### 2026-07-14 — Planning: editor value upgrade bundle approved

- Captured the operator-approved follow-up plan in
  `docs/specs/2026-07-14-editor-value-upgrade-plan.md`. The bundle covers the root cause behind
  chat saying new pages were created while no pages appeared in preview: chat patch operations did
  not yet include `add_page`, so the model could not make that structural mutation through the
  constrained edit surface.
- Added the agreed next workstreams: schema-safe `add_page` chat operations, preview focus/change
  summary after AI edits, compact badge/tooltip guidance for warnings, daisyUI `chat` presentation,
  sitemap-oriented Pages tab, pre-generation page-count/site-structure approval, multi-step
  undo/revision checkpoints, page templates, compact publish checklist, and deterministic AI
  next-best-actions.
- Decision: use the official daisyUI skill as a development aid for SaaS/editor UI consistency when
  available, especially badges, tooltips, chat, docks, tabs, steps, menus, and status indicators.
  This is explicitly not a tenant raw-HTML escape hatch; tenant-facing changes still go through the
  Zod `Site` schema, fixed blocks, renderer, tests, and preview verification.
- Verification: documentation-only change; no runtime code changed.

### 2026-07-14 — Editor value upgrade implementation: page ops, compact guidance, sitemap, onboarding structure

- Implemented the first approved bundle from
  `docs/specs/2026-07-14-editor-value-upgrade-plan.md`. The chat patch contract now supports
  schema-safe `add_page` operations (`src/lib/server/ai/schemas.ts`) and the patch applier persists
  them into `site.pages`, adding nav entries when requested and capacity allows
  (`src/lib/server/ai/patch.ts`). The chat system prompt now explicitly forbids claiming success
  when operations do not implement the requested change.
- Updated editor chat behavior: applied AI edits now compute a lightweight change summary, and when
  a new page is added the editor switches `store.currentSlug` to that page so the live preview shows
  the result immediately (`src/routes/editor/[siteId]/ChatTab.svelte`). `ChatBubble.svelte` now uses
  daisyUI `chat chat-start` / `chat chat-end` and `chat-bubble` classes while keeping the existing
  gatekeeper, approval, undo, and `DraftStore.replace` semantics.
- Converted the Pages tab into a sitemap-oriented view: each page shows section count, nav status,
  contact/booking presence, and an ordered section list with compact badges. The manual add/remove
  flow still uses the existing `pageOps` helpers and draft autosave path.
- Reduced editor guidance density by turning the first-run checklist and quality state into compact
  badge rows with expandable details. Blockers still remain visible and publish enforcement is
  unchanged.
- Added the pre-generation structure decision to onboarding: `siteStructure` asks for one-page,
  3-page, 5-page, or AI-recommended structure before language/contact questions. The composer now
  feeds that controlled sitemap/page-count preference into the generation description without
  changing the Zod `Site` contract.
- Verification: targeted tests passed (`patch`, onboarding questions/compose, onboarding answer +
  finish: 64 tests); `npm run check` passed with 0 errors/warnings; touched files pass Prettier
  check; full `npm run test` passed (81 files / 514 tests); `npm run build` passed. Local dev smoke:
  `/tr/new` and `/tr` returned 200; onboarding API sequence confirmed `visualDirection ->
siteStructure -> languages`. Local smoke logged expected onboarding-guard fail-open errors because
  Groq is not configured in this environment; requests still returned 200 and preserved flow.
- Known unrelated issue: repo-wide `npm run lint` still fails because 148 pre-existing files outside
  this change set are not Prettier-formatted (notably `.agents/skills/hallmark/**` and older source
  files). Touched files were checked independently and are formatted.

### 2026-07-14 — Create website routing, beta auth target, and structured-request fallback

- Fixed the root cause behind "create website" from the public assistant opening the free-text brief
  path instead of the classic Q&A: `SiteAssistantDock` no longer writes `saaskaya.promptSeed`, and
  `/new` clears any legacy seed without switching to raw mode. Assistant onboarding intents now route
  to the guided flow by default; the raw textarea remains available only through the explicit UI toggle.
- Added beta-aware auth routing for this flow. `/new` now exposes `authHref` (`/beta` when
  `BETA_MODE=1` and the visitor is anonymous, otherwise `/login`), and the assistant route uses the
  same target for signed-out login/edit intents. `/beta` magic links now carry the pending onboarding
  token (`p=`) just like `/login`, so a visitor who answered the Q&A before beta sign-in resumes the
  same pending record after verification.
- Removed the generation mismatch introduced by the new page-count question: `generatedSiteSchema`
  now allows 5 pages, and the create-site system prompt explicitly honors one-page, 3-page, and
  5-page structure preferences instead of steering mostly toward one/two pages.
- Split provider 400/422 structured request failures into `AIProviderRejectedRequestError`. `/api/sites`
  now logs that case as a structured-request failure and opens the safe fallback draft instead of
  returning a blocking 503; real outages, auth failures, balance, rate-limit, and 5xx provider errors
  still return the controlled 503 path.
- Verification: targeted tests passed for assistant routing, `/new` auth target, AI schemas, LLM error
  typing, and `/api/sites` fallback (33 tests); `npm run check` passed with 0 errors/warnings; touched
  files pass Prettier check; full `npm run test` passed (82 files / 520 tests); `npm run build` passed.
