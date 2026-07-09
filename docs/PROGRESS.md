# Progress — saaskaya

Running memory of the project. **Update after every task** so any fresh AI session knows exactly what is
done and _why_. This file is the antidote to forgetting completed steps.

## How to use this file

- Add a **Task log** row when you finish a task (newest at top).
- Record every non-obvious **decision** with its reason (constitution principle §6).
- Record every bug in the **Error log** using the debug loop from `CONVENTIONS.md`.

## Current milestone

**Phase 1 done — GTM nişi, fiyatlandırma, unit economics ve yasal temel.** Hostinger Horizons
roadmap'inin Phase 1 exit gate'i tamamlandı: launch nişi **psikologlar** olarak seçildi (erişim,
içerik riski, lead değeri dengesi); Free/Pro/Premium (0₺/299₺/599₺) fiyatlandırma tablosu ve unit
economics (~%46 brüt marj @ 10 müşteri) belgelendi; 6 yasal sayfa (privacy, terms, kvkk,
acceptable-use, refund, disclaimer) Türkçe-first KVKK/GDPR uyumlu olarak yayınlandı; landing IA
Türkçe niş-odaklı yeniden yazıldı. **Operatör bekleyenler:** yasal metinler taslak (hukuki gözden
geçirme önerilir), Stripe price ID'leri, PAYMENT_MODE/IBAN/domain fiyat production ayarları,
Premium insan incelemesi iş akışı. Phase 2 (guided first-run) sıradaki.

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

| Date       | Milestone | Task                                                                        | Status   | Key decisions / notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | --------- | --------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-09 | Phase 0   | Production baseline, isolation, and live end-to-end evidence                | ✅ done  | Completed Phase 0 from the Horizons-informed roadmap. Production is isolated on `data/production.db`; migration integrity/counts, nightly backup, temporary restore, monitor, cron sweep, HTTPS/redirects/TLS, public tenant locales, and reusable mobile/desktop browser smoke passed. Disabled production auth echo and prevented failed magic-link tokens from entering logs; regression-covered. Controlled auth passed (login → one-time verify → session → dashboard), Resend sender/domain passed and a smoke message reached `delivered`, then smoke tokens/sessions/log artifact were removed. Fresh real Groq/DeepSeek flow passed: generation → editor/preview → chat `applied` → publish → public tenant 200 (`site-6e8106ca`). Because Stripe/Porkbun/bank credentials and an off-site target do not exist, closed beta now explicitly runs `PAYMENT_MODE=disabled`; new-domain purchase is hidden/rejected, and closed beta promises local backups rather than DR. These integrations remain activation gates, not falsely “verified.” Final tests/check/build/public smoke passed; evidence ledger: `docs/PHASE0_VERIFICATION.md`. |
| 2026-07-09 | Strategy  | Hostinger Horizons competitive analysis and focused product roadmap         | ✅ done  | Reviewed the current official Horizons landing, features, editor/product overview, plan, domain, publishing, restore, and support surfaces; compared its product system with the live saaskaya architecture and v2 vision. Saved `docs/specs/2026-07-09-hostinger-horizons-competitive-roadmap.md`: saaskaya will adopt prompt-first onboarding, curated template discovery, visible credits, persistent restore, bundled publish/SEO/domain outcomes, proof, and guided recovery, but will not copy Horizons' general app builder, code editor, arbitrary backend/integrations, or tenant code generation. The target is a Turkish, niche-deep, schema-safe professional-site product. The roadmap is dependency-gated: operational baseline → niche/pricing/legal → guided onboarding → rich controlled site engine + deterministic quality gate → persistent chat revisions → media → publish/SEO/leads → billing/top-ups → proof-led launch → scale. No application code changed. |
| 2026-07-08 | V2.0      | Account inner body width alignment                                          | ✅ live  | Follow-up to the `/account` screenshot review: the shared canvas was correct, but account still passed `max="max-w-3xl"` to `PageShell`, making its inner body visibly narrower than `/dashboard` and the recently fixed landing page. Updated `src/routes/account/+page.svelte` only to use `max="max-w-4xl"`, matching the app body standard. Verified: `npx prettier --write src/routes/account/+page.svelte`, `npm run check`, `npm test` (119/119), `npm run build`, deployed with `pm2 restart saaskaya`. Live CDP comparison at 1365px desktop with an authenticated session: `/dashboard` and `/account` both report shell width 976px, body width 894px, identical left/right offsets, and no horizontal overflow. `/api/health` returned ok with db/disk healthy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-07-08 | Beta      | Beta launch + hybrid onboarding (3 phases; revised spec)                    | ✅ done  | Implemented `docs/specs/2026-07-08-beta-launch-hybrid-onboarding.md` with the approved revisions (see its Revisions block). **Phase 1 — beta access + email:** `email.ts` refactored to an `EMAIL_PROVIDER` seam (smtp via nodemailer / resend via fetch / dev echo), fixing the spec's `Number(getSetting('SMTP_PORT')) ?? 465` NaN bug (465⇒TLS, 587⇒STARTTLS); `beta_invites` table + `isBetaAllowed()`/invite CRUD in `auth.ts`; `BETA_MODE` gate on `/login` (send) + `/login/verify` (click) with the Turkish denied message + 🔒 badge; new `/admin/invites` (list/add/revoke). **Super admins bypass the beta gate** via a shared `isAdminEmail()` (also now used by `hooks.server.ts`) — operator can't lock themselves out. **Phase 2 — reservation + bank transfer:** `domain_reservations` table (migration **v5** `beta-launch`, with a partial unique index on live statuses so cancelled/failed rows don't wedge a domain) + `reservations.ts` (create/report/confirm/reject/cancel + idempotent, retryable `fulfillReservation` status machine that re-checks availability before registering and lands failures on `failed`); dashboard reservation UI (IBAN + amount + "Havale yaptım, bildir" + cancel, `PAYMENT_MODE`-gated) + admin "Bekleyen ödemeler" panel (Onayla/Reddet/Kur-retry); fulfillment decoupled from the confirm request and swept by the daily cron (`/api/admin/tasks/daily`). **Phase 3 — Stripe one-time:** `createDomainCheckoutSession` (`mode=payment` + `metadata.reservationId`) + `handleStripeEvent` disambiguation so a domain payment marks the reservation paid and NEVER activates Pro. Free "gift" = subdomain only (no operator-funded registration; §5 clean). Settings added: EMAIL_PROVIDER, SMTP_HOST/PORT/USER/PASS, BETA_MODE, PAYMENT_MODE, DOMAIN_PRICE_EUR/TRY, BANK_IBAN, BANK_ACCOUNT_HOLDER. 119/119 tests (email switch incl. port-465 fallback, beta gate incl. revoke + join-flip, reservation lifecycle incl. idempotency/failure-retry/uniqueness, webhook domain-vs-subscription split, migration v5). Verified live on dev: migration v5 applied to shared local.db; beta gate off→open, on→denied/badge/invited/admin-bypass (3 magic links, stranger 0); Playwright drove /admin/invites add+revoke and the admin pending panel confirm→paid→fulfill (graceful skip, no Porkbun). Test residue incl. the temporarily-set BETA_MODE cleaned from local.db (dev+prod share it). Operator activation still needed: SMTP/Resend + Porkbun + Stripe keys, BETA_MODE/PAYMENT_MODE/IBAN/price at `/admin/settings`. |
| 2026-07-08 | V2.0      | Landing inner body width alignment                                          | ✅ live  | Follow-up to `docs/screenshots/sc-7.jpg` / `sc-8.jpg`: the outer app canvas matched, but the landing content body still used `max-w-2xl` and a wider custom desktop padding, making it visibly narrower than dashboard/PageShell screens. Updated `src/routes/+page.svelte` only: landing hero and demo list now use `w-full max-w-4xl`, while the paragraph keeps its own readable `max-w-xl`; the landing canvas content padding now matches the default `AppCanvasShell` horizontal rhythm. Verified: `npx prettier --write src/routes/+page.svelte`, `npm test` (100/100), `npm run build`, `npm run check` after build regeneration, deployed with `pm2 restart saaskaya`. Live CDP comparison at 1365px desktop with an authenticated session: `/` and `/dashboard` both report shell width 976px, inner body width 894px, identical left/right offsets, and no horizontal overflow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-07-08 | V2.0      | Desktop canvas width normalization                                          | ✅ live  | Follow-up to the screenshot review (`docs/screenshots/sc-6.png`): the app screens shared `AppCanvasShell`, but each route still used different desktop canvas widths (`max-w-4xl`, `max-w-5xl`, `max-w-6xl`, editor `max-w-[96rem]`), so the product felt inconsistent when viewed side by side. Normalized the SaaS app canvas standard to one outer width (`max-w-5xl` → 1024px section / 976px shell at a 1440px desktop viewport), tightened the shell page padding, made `PageShell` inherit the same width by default, removed route-level canvas overrides from `/login`, `/login/verify`, `/new`, and `/editor/[siteId]`, and reduced the editor sidebar to keep the workbench usable inside the standard frame. Inner content widths (`PageShell max`, login/new form grids) remain local readability constraints, not competing canvas sizes. Verified: `npm run check`, touched-file Prettier check, `npm test` (100/100), `npm run build`, deployed with `pm2 restart saaskaya`. Full `npm run lint` is blocked by pre-existing formatting drift in `docs/PLAN.md` and `docs/specs/2026-07-08-beta-launch-hybrid-onboarding.md` only; touched files are formatted. Live CDP desktop measurements: `/`, `/login`, `/login/verify`, `/new`, `/dashboard`, `/account`, `/dashboard/seed-law/messages`, and `/editor/seed-law` all report canvas present, no horizontal overflow, shell width 976px, section width 1024px. `/admin/settings` uses the same `PageShell` standard in code; live admin measurement was not available in that smoke because the temporary session lacked admin rights.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-07-08 | V2.0      | SaaS app canvas consistency pass                                            | ✅ live  | Unified the customer-facing app screens around the landing page's browser-canvas philosophy so `/`, `/login`, `/login/verify`, `/new`, `/dashboard`, `/account`, `/dashboard/[siteId]/messages`, `/admin/settings`, and `/editor/[siteId]` now share one visual shell instead of mixing unrelated page frames. Added `src/lib/ui/AppCanvasShell.svelte` as the common browser-canvas container, refit `PageShell` onto it, preserved the landing composition, rebuilt `/new` and `/login` as canvas-native two-column flows, wrapped the editor workbench in the same shell, and restyled `ChatTab` with the app card/input/button system. Route behavior, auth guards, draft/editor persistence, generation, admin settings, and tenant public rendering were not changed. Verified locally: `npm run check`, `npm run lint`, `npm test` (100/100), `npm run build`. Deployed with `pm2 restart saaskaya`. Live checks: `/api/health` 200 db/disk ok, `/` 200 with the new asset hash, `/login` 200, `/new` signed-out 303 → `/login`. Headless Chromium smoke with dev echo/admin sessions captured `docs/screenshots/sc-1.png`, `sc-2.png`, `sc-3.png`, `sc-4.png`, `sc-5.png`, `sc-new.png`, and `sc-editor.png`; every checked route reported the shared canvas present and no horizontal overflow. Existing JPG screenshots were left in place intentionally; no git cleanup/commit was performed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-07-08 | V2.2      | Two-layer AI gatekeeper Phase 1 (revised spec)                              | ✅ done  | Implemented `docs/specs/2026-07-08-two-layer-ai-gatekeeper.md` with the approved revisions (see the spec's Revisions block). **Layer 1:** `src/lib/server/ai/gatekeeper.ts` — forced `gate_message` tool call on `GATEKEEPER_MODEL` (default `claude-haiku-4-5`) through the existing `runToolCall` seam; input is a compact `siteOutline()` (never the full draft JSON) + last ~6 client-held chat turns; output validated by `gateSchema` (intent edit/question/off_topic/help_request + distilledPrompt + riskLevel) with one repair round-trip. **Chat endpoint** (`/api/sites/[id]/chat`) is now staged: gate → `redirect`/`reply`/`help` (0 Layer-2 tokens), low-risk edit auto-applies, medium/high returns a `proposal`; stateless confirm resends `{message, approvedPrompt, riskLevel}`; `force:true` overrides an off-topic verdict; invalid gate output degrades to the pre-gate single-layer path (gate is never a point of failure). **Risk routing:** low → `AI_MODEL_LIGHT` (default `claude-sonnet-5`), else `AI_MODEL` (Opus); `chatEdit` gained `model`/`approvedPrompt` (distilled + original message both sent). **Prompt caching:** `cache_control` on the system block in `runToolCall` (tools+system prefix, cross-tenant). **Credits:** migration v4 (`ai_usage.edit_count`/`generation_count` + `ai_gate_log`); 1 applied edit = 1 credit, 1 generation = 1 credit, gate free; limits `AI_EDITS_FREE/PRO` 10/50, `AI_GENERATIONS_FREE/PRO` 1/5; token limit stays as backstop; admins bypass credits only. **UI:** ChatTab rebuilt — onboarding greeting, approval card (📋 distilled prompt + honest draft-not-live risk copy, ✓ Uygula / ✗ İptal), off-topic "yine de gönder", one-click Geri Al (client snapshot + existing draft PUT), budget helper text. **Telemetry:** `ai_gate_log` decisions (redirected/answered/help/auto_applied/proposed/approved/forced/fallback) + `gateStats()` on the admin Ops card. Settings added: `GATEKEEPER_MODEL`, `AI_MODEL_LIGHT`, credit limits. Tests 100/100 (gate schema fixtures, repair, outline leak-check, endpoint stages incl. zero-L2 assertions + 429 + fallback, credit accounting incl. admin bypass, migration v4). Live AI smoke still deferred pending `ANTHROPIC_API_KEY`.                                                                                                                                                                                                                                                                                                                       |
| 2026-07-08 | V2.0      | Authenticated UI smoke + tenant block polish + PM2 maintenance              | ✅ live  | Completed the remaining V2.0 verification/polish items except the explicitly deferred product-flow animation and operator credentials. Authenticated live smoke used magic-link dev echo sessions: `/dashboard` 200, `/account` 200, `/editor/seed-law` 200 with iframe, `/admin/settings` 200 with admin session; CDP checks showed no horizontal overflow on dashboard desktop, account mobile, editor desktop, and admin desktop. Editor interaction smoke: no-op content input dispatched and returned to `Saved`, locale switch to EN worked, viewport toggle changed preview frame from desktop (`width: 100%`) to mobile (`width: 375px`). Tenant/public site block polish was implemented without schema changes: `SiteHeader` sticky premium nav + locale pills; Hero/About/Services/Contact/Gallery/Team/FAQ/CTA/Footer spacing, cards, borders, typography, and CTA styling upgraded while staying inside the fixed component set. Verified locally: `npm run lint`, `npm run check`, `npm test` (76/76), `npm run build`. Deployed with `pm2 restart saaskaya`. Live checks: `/api/health` 200 db/disk ok; `/preview/seed-law` 200 with new asset hash; CDP screenshots for public preview desktop/mobile show no horizontal overflow, sticky header, and 5 rendered sections. PM2 maintenance: ran `pm2 update` to clear daemon/CLI drift; its first restore shell hung/left a new empty daemon visible, then `pm2 resurrect` restored `/root/.pm2/dump.pm2`; final `pm2 --version` = 7.0.3 and `saaskaya` is online.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-07-08 | V2.0      | SaaS UI redesign from Claude Design reference                               | ✅ live  | Added `docs/specs/2026-07-08-saas-ui-redesign.md` as the implementation spec for the Claude Design reference at `docs/Saaskaya WaaS Landing Page/`. Rebuilt the SaaS product UI as Svelte/Tailwind/DaisyUI code rather than importing raw design-doc HTML: global tokens in `src/routes/layout.css`, Google font links in `src/routes/+layout.svelte`, shared UI components in `src/lib/ui/{BrandMark,AppCard,PageShell,StatusPill}.svelte`, and redesigned `/`, `/new`, `/login`, `/dashboard`, `/dashboard/[siteId]/messages`, `/account`, `/editor/[siteId]` chrome, and `/admin/settings`. Existing auth, form actions, generation, dashboard publish/domain/export actions, editor `DraftStore`/postMessage/autosave/preview/publish flow, and admin settings behavior were preserved. The paused landing product-flow animation was removed from active landing usage and deferred until after the static redesign is reviewed, so the future animation can be designed into the new warm editorial visual system instead of competing with it. Added `docs/Saaskaya WaaS Landing Page/` to `.prettierignore` to avoid formatting generated design-reference HTML/JS. Verified before deploy: `npm run lint`, `npm run check`, `npm test` (76/76), `npm run build`. Deployed with `pm2 restart saaskaya`. Live checks: `https://saaskaya.digitaltamam.com/` HTTP/2 200, `/login` HTTP/2 200, `/new` signed-out 303 → `/login`, `/dashboard` signed-out 303 → `/login`, `http://saaskaya.digitaltamam.com/` 301 → HTTPS, `/api/health` 200 `{"ok":true}` with db/disk ok. Headless Chromium screenshots verified new landing desktop/mobile and login mobile render without obvious horizontal overflow; long demo site names truncate cleanly on mobile.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-08 | V2.0      | Landing product-flow animation                                              | ⏸ paused | User approved adding a 2D/2.5D product-flow animation to explain the app visually. Implemented draft files: `src/lib/marketing/ProductFlowAnimation.svelte` and updated `src/routes/+page.svelte` to use it as a full-bleed landing hero background with CTA + demo section. Local checks completed before pause: `npm run check` 0 errors, `npm test` 76/76, `npm run build` ok after `npm run format`. Remaining before calling done: rerun `npm run lint` after final formatting if needed; perform browser verification for desktop/mobile landing (animation visible, no horizontal overflow, text readable, reduced-motion acceptable, next section visible); then decide whether to deploy. Dev server browser verification was attempted but local port binding required escalation and the user paused before approval/completion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-07-08 | Product   | Product Vision & Roadmap v2                                                 | ✅ done  | Created `docs/PRODUCT_VISION_V2.md` to reconcile the original safe-schema MVP with the expanded product ambition: an impressive SaaS UI and an "AI WordPress for professionals" market position without becoming a WordPress clone or arbitrary-code builder. The doc separates saaskaya's own SaaS UI redesign from tenant website output, reframes "fixed component set" as a controlled component/token/media system, preserves the rule that AI never writes executable tenant HTML/CSS/JS, and lays out V2.0-V2.6: SaaS UI redesign, rich tenant site engine, chat-first editing, R2 media manager, account/billing/domain self-service, SEO/analytics, and scale/data split. Added the doc to `CLAUDE.md` as a canonical post-M6 roadmap reference.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-07 | UX        | Customer account route                                                      | ✅ done  | Added `/account` as the customer-owned profile/account surface, separate from super-admin-only `/admin/settings`. The route requires sign-in and shows account email/role, plan state (Free/Pro/grace), site/published/message totals, per-site data export links, sign-out, upgrade CTA when billing is configured, and current operator-handled deletion policy. Dashboard header now links to Account. Verified locally: `npm run lint`, `npm run check`, `npm test` (76/76), `npm run build`. Deployed with `pm2 restart saaskaya`; live checks: `/account` returns 303 → `/login` when signed out, `/dashboard` still returns 303 → `/login`, `/api/health` 200 with db/disk ok.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-07-07 | Tooling   | Google Stitch UI prompt-chain document                                      | ✅ done  | Created `docs/STITCH_PROMPTS.md` — a self-contained prompt chain for Google Stitch to generate each page's UI. Read the full codebase (CLAUDE.md, CONSTITUTION, PLAN, idea.md, Zod schema, all 9 blocks, presets, every route's `.svelte`) and distilled it into 10 prompts: (0) project overview + design system + schema, (1) landing, (2) /new describe-yourself, (3) /login magic-link, (4) /dashboard, (5) messages, (6) /editor (the complex 6-tab + iframe + viewport-toggle page), (7) /admin/settings, (8) public-site block renderer (all 9 blocks with variants), (9) responsive behavior summary. Each prompt lists exact DaisyUI classes, layout, data, interactions, and responsive rules so Stitch can build the page standalone. No code changes — documentation only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-07-07 | Hardening | Canonical custom-domain model + live deploy                                 | ✅ done  | Replaced draft-JSON domain routing with a canonical `custom_domains` table (`hostname` primary key) plus migration v3 that backfills legacy `draft.domain` rows. `attachSiteDomain` / `detachSiteDomain` now enforce one hostname → one site, keep the old draft `domain` field only as compatibility/display data, and dashboard + public routing + cancellation sweep all read from the table. Tests cover legacy migration, duplicate-domain rejection, domain replacement cleanup, published routing by canonical domain, and sweep behavior. Verified locally: `npm run lint`, `npm run check`, `npm test` (76/76), `npm run build`. Deployed with `pm2 restart saaskaya`; live checks: `/api/health` 200 `{"ok":true}` with db/disk ok, HTTP→HTTPS 301, `/` HTTPS 200, `/login` HTTPS 200, TLS certificate CN/SAN matches `saaskaya.digitaltamam.com`, PM2 app online. Note: PM2 reports daemon version drift (in-memory 6.0.14 vs local 7.0.3); not blocking, schedule `pm2 update` during maintenance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-07 | M6        | Migration runner + backups + monitoring + cancellation policy + audit fixes | ✅ done  | **Migrations:** `src/lib/server/db/migrations.ts` — `schema_migrations` table, append-only versioned list, each migration in its own transaction (rollback-tested), resumable (pending-only), takes a raw better-sqlite3 client so the same runner will migrate per-tenant DBs later; v1 = baseline adopting pre-M6 DBs, v2 = `users.subscription_ends_at`; replaces the ad-hoc bootstrap in `db/index.ts`. **Policy (docs/POLICY.md):** webhook captures `current_period_end`; `subscriptionState()` = free/active/grace (`GRACE_DAYS` setting, default 30); dashboard shows "Pro · grace until X"; daily sweep (`sweepExpiredCustomDomains`) detaches domains of lapsed owners only (grace + seeds untouched) with courtesy email; `GET /api/sites/[id]/export` (owner-gated JSON download: draft + contact submissions) + dashboard button. **Ops:** `GET /api/health` (db + disk, 200/503); `scripts/monitor.sh` (5-min cron: double-probe, optional `MONITOR_AUTORESTART` pm2 restart, Resend alert to `ALERT_EMAIL`, 30-min flood guard); `scripts/backup.sh` (nightly cron: `sqlite3 .backup` online snapshot + `.env`, gzip, keep 14, `BACKUP_REMOTE` rclone/scp seam, triggers `/api/admin/tasks/daily` with `CRON_TOKEN`); admin settings page gained a System-status card + Ops settings group; cron installed on the VPS. **Audit fixes:** PUT draft can no longer create sites (404 on unknown ids) and requires sign-in; chat/publish/editor require sign-in (anonymous token-burn/vandalism closed; any signed-in user can still demo the ownerless seeds); custom domains are uniqueness-checked (409); webhook JSON.parse guarded (400). 72/72 tests (runner: fresh/idempotent/resumable/adopt/rollback; grace lifecycle incl. GRACE_DAYS; sweep selectivity; health). Verified dev+live: real backup + restore drill (valid sqlite, migrations intact); monitor silent when healthy, logs+no-restart on dead port; live `/api/health` 200 via nginx; export attachment; daily-tasks token auth (401 wrong/missing, 200 with token); crontab entries active.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-07-07 | Audit     | Whole-project check                                                         | ⚠️ done  | Read canonical docs and reviewed the current M5 codebase without code changes. Verified `npm run check`, `npm test` (63/63), `npm run lint`, and `npm run build` all pass. Findings to fix next: unauthenticated `PUT /api/sites/[siteId]/draft` can create an ownerless valid draft for arbitrary unknown ids, and ownerless drafts are publishable through the publish API because demos intentionally bypass ownership; custom domains are stored only inside draft JSON and are not uniqueness-checked, so a domain already pointed at this server can be attached to more than one site and public routing resolves an arbitrary matching row. Minor hardening: Stripe webhook parses signed JSON without a 400 guard for malformed payloads.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-07-07 | M5        | Admin credentials in DB + contact→Resend + Stripe + domains + badge         | ✅ done  | **Admin settings (operator request):** `app_settings` table + `src/lib/server/config.ts` registry (`getSetting`: DB → env fallback; secrets masked, write-only in UI) + `/admin/settings` (gate: `ADMIN_EMAILS` env → `locals.user.isAdmin` — deliberately env-based, the gate must not live in the DB it protects). AI key/model/limit + email + billing + domains all read through it; Anthropic client cache keyed by credential so rotation is live; invalid key → friendly AIUnavailable message. **Contact (PLAN §7):** Contact block posts `?/contact` on the public site (preview renders it inert via render-context); action = per-IP rate limit + zod → `contact_submissions` + best-effort Resend notify to `settings.contactEmail`; owner reads them at `/dashboard/[siteId]/messages`. **Email:** Resend via plain fetch in `email.ts`; magic links use it when configured, dev echo stays as fallback. **Stripe (fetch, no SDK):** `billing.ts` checkout session (`client_reference_id` = userId) + webhook HMAC verify (t/v1, 5-min tolerance, timing-safe) + idempotent status transitions on `users.subscription_status`; routes `/api/billing/{checkout,webhook}`; dashboard Plan card. **Domains:** attach-own-domain (validate + `dns.resolve4` vs `SERVER_IP` + save to draft + optional `scripts/provision-domain.sh` = nginx vhost + certbot, gated by `DOMAIN_PROVISION=1`); Porkbun seam (`checkDomainAvailability`/`registerDomain`/`createARecord` — re-verify endpoint paths when keys arrive); both flows 402-gated on subscription (admin bypass) per constitution §5. Badge links to `PUBLIC_APP_HOST`. 63/63 tests. Verified dev+live: settings save/mask/clear + 403 for non-admin; signed fake webhook → Pro badge, forged sig → 400; contact stored + listed + email skipped gracefully; free user 402 / Pro attach / detach; custom-domain Host reroute works in prod (nginx `x-forwarded-proto` required — direct-port curl needs the header).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-07-07 | M4        | Auth + dashboard + publish snapshots + Host routing + locale routes         | ✅ done  | **Auth:** magic-link (`/login` → single-use 15-min token, sha256-hashed at rest → `/login/verify` → 7-day DB session cookie `sk_session`); `src/lib/server/auth.ts` + `email.ts` seam (Resend M5; until then link is logged + echoed on-page when `AUTH_DEV_ECHO_LINK=1`); per-IP rate limit on login; `hooks.server.ts` → `locals.user`. **Dashboard** `/dashboard`: user's sites, publish/republish/unpublish (form actions), live URL per site. **Publish:** `site_versions` immutable snapshots + `sites.published_version` pointer; `POST/DELETE /api/sites/[id]/publish`; editor toolbar Publish button. **Host routing:** `src/hooks.ts` reroute → pure `resolveHostReroute` (`$lib/hostRouting.ts`): `<key>.<PUBLIC_APP_HOST>` → `/_site/<key>`, unknown hosts → custom-domain lookup ONLY when `PUBLIC_APP_HOST` is set (prod safety); `resolvePublishedByKey` also matches `json_extract(draft,'$.domain')`. **Public site:** `/_site/[siteKey]/[[locale=locale]]/[[page]]` serves the published snapshot only; default locale unprefixed, others `/en`,`/de`; `cache-control: max-age=60`. **Guards:** `/new` + `POST /api/sites` require sign-in (quota now per account `tenant-<userId>`, generated sites get `owner_user_id`); draft GET/PUT, chat, editor, preview enforce `canManageSite` (ownerless seeds stay open as demos). DB: `users`/`sessions`/`login_tokens`/`site_versions` + `ensureColumn` ALTERs in the bootstrap. 53/53 tests (auth lifecycle, publish immutability, host reroute). Verified end-to-end via curl + headless Chromium: login→dashboard→publish v2→v3 in editor UI; `seed-law.localhost:5183/de` renders in a real browser; snapshot immune to draft edits; 401/403/404 probes green. Deployed to the live preview.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-07-06 | M3        | AI loop: generate + translate + chat patch + token counter                  | ✅ done  | `src/lib/server/ai/` — `llm.ts` (single provider seam: `runToolCall` = forced tool-use via `@anthropic-ai/sdk` streaming + `finalMessage`; model `claude-opus-4-8` per claude-api skill, env-overridable `AI_MODEL`; typed errors AIUnavailable/AIInvalidOutput/QuotaExceeded). `schemas.ts` derives everything from the contract: single-locale `generatedSiteSchema`, per-target `translationSchemaFor`, constrained `patchOpSchema` (9 op types), `z.toJSONSchema` for tool inputs. `generate.ts`: create_site (default locale) → translate_site (other locales) → `assembleSite` merge with `syncMediaRefs` (URLs can't drift in translation) → final `siteSchema.parse`; **max one repair round-trip per call** (tool_result is_error + issues). `patch.ts`: pure `applyPatch` (clone → ops → `siteSchema.parse`), `chatEdit` with one repair. Token counter: `ai_usage` table (tenant×month) + `assertWithinQuota` (default 500k, `AI_MONTHLY_TOKEN_LIMIT`). Routes: `POST /api/sites` (describe→draft, 400/422/429/503 mapped), `POST /api/sites/[id]/chat`. UI: `/new` page, ChatTab real chat → `DraftStore.replace` → live iframe. site.ts refactored: `sectionShapes` (per-type props/content) is now the single source for both localized and gen schemas. 38/38 tests (mocked LLM: repair loop ≤1, invalid → AIInvalidOutputError, translation-structure mismatch rejected, patch ops incl. immutability + contract-breaking result). Verified: no-key → friendly 503 in API + chat UI; /new gates <30 chars; console clean. **Live smoke pending API key.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-06 | M2        | Editor shell + draft store + live postMessage + autosave                    | ✅ done  | `src/routes/editor/[siteId]/` — sidebar (Chat/Content/Theme/Pages/Languages/Settings tabs) + toolbar (viewport 375/768/100%, locale select, save status) + preview iframe. `src/lib/stores/draft.svelte.ts` `DraftStore` (runes): `update()` → notify bridge (postMessage snapshot into iframe) + 800 ms debounced autosave → `PUT /api/sites/[siteId]/draft`. Preview listens for `saaskaya:draft` messages (same-origin check + `siteSchema.safeParse` — invalid drafts never render, silently keeps last good). Drafts persist in SQLite via `src/lib/server/db/repo.ts` (lazy-seeded from `$lib/seed`; every read/write passes `siteSchema.parse`; `CREATE TABLE IF NOT EXISTS` bootstrap in `db/index.ts` until the M6 migration runner). `ContentFields.svelte` = generic schema-driven text editor (new blocks need no editor change; array add/remove deferred to M3 patch tool). Verified in headless Chromium (playwright-core + system chromium cache): headline edit → iframe h1 updates live, window marker survives (**no reload**); autosave persisted via API; color edit → `--color-primary` updates live; viewport toggle → iframe 375px; **0 horizontal overflow at 375px** (M1 leftover criterion); console clean; invalid edit (empty headline) → PUT 400, badge "Save failed", preview + DB keep last good. 22/22 tests, check 0 errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-06 | M1        | Blocks + registry + SiteRenderer + `/preview` SSR + presets                 | ✅ done  | 9 blocks in `src/lib/blocks/` (Hero/About/Services/Gallery/Contact/Cta/Faq/Team/Footer, 2 variants each) + `registry.ts` (mapped type; `blockFor()` is the single type-erasure point). `src/lib/render/`: `SiteRenderer.svelte` (theme via inline DaisyUI CSS vars from `theme.ts`, heading font via `--font-heading`), `SiteHeader.svelte` (nav + locale switcher via injected `hrefFor`/`localeHrefFor` so the renderer stays route-agnostic). Route `/preview/[siteId]/[[page]]?locale=` re-validates seeds with `siteSchema.parse` at the boundary. `src/lib/presets/` = 3 canonical themes; seeds now import them. Placeholder SVGs in `static/seed/**`. Verified end-to-end (verify skill): 9/9 site×locale SSR combos correct h1 + per-niche `--color-primary`; multi-page nav; dental defaults to `de`; 404s on unknown site/page; `?locale=fr` falls back; dev log clean; 18/18 tests; check 0 errors; build ok. Project verify skill saved at `.claude/skills/verify/SKILL.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-06 | M0        | Project renamed to **saaskaya**                                             | ✅ done  | User decision. Renamed in `CLAUDE.md`, `AGENTS.md`-linked docs, README, `package.json`. `idea.md` left untouched (historical record, still says "Dijital Mentor").                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-07-06 | M0        | Zod `Site` schema + 3 seed Sites + safeParse tests                          | ✅ done  | `src/lib/schema/site.ts` (strict objects, discriminated union over 9 section types, superRefine cross-checks). Seeds: law (2 pages, tests multi-page nav), psych, dental (defaultLocale `de`, tests non-TR default). 13 vitest tests green (`npm test`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-07-06 | M0        | Scaffold SvelteKit + Tailwind 4 + DaisyUI 5 + Drizzle                       | ✅ done  | `sv create` (minimal/ts) + add-ons: prettier, vitest (unit), tailwindcss, adapter-node, drizzle (sqlite + better-sqlite3). Zod 4.4.3, DaisyUI 5.6.13 (`@plugin 'daisyui'` in `src/routes/layout.css`). Verified: `npm run check` 0 errors, `npm test` 13/13, `npm run build` ok, dev server SSRs the 3 seeds with DaisyUI classes in built CSS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-07-06 | Pre-M0    | Governance layer created                                                    | ✅ done  | Created `CLAUDE.md`, `AGENTS.md`, `docs/{CONSTITUTION,PLAN,PROGRESS,CONVENTIONS}.md`. Lean-core process, English, Claude Code + cross-tool (`AGENTS.md`). No hooks/slash-commands yet.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

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
  `CAST(strftime('%s','now') AS INTEGER) * 1000` expression; authenticated daily sweep then returned
  200.
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
