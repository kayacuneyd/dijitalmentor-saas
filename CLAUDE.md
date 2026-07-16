@# saaskaya — CLAUDE.md

saaskaya is a **WaaS / progressive CMS**: a person describes themselves in a chat, an AI
generates a **multilingual website as validated JSON (never raw HTML)**, they preview it live in
three viewports (mobile / tablet / desktop), edit the copy, and publish it on their own domain.

This file is auto-loaded every session and is the **canonical entry point**. Read it first, then the
relevant `docs/` — do **not** re-explore the repo for things already written here.

## Stack

SvelteKit · TailwindCSS · DaisyUI · **Zod** (the schema contract) · Drizzle ORM (PostgreSQL central +
per-tenant SQLite) · `@anthropic-ai/sdk` (Claude, tool-use) · Caddy (on-demand TLS) · Resend (email) ·
Stripe · Porkbun/NameSilo (domains) · Cloudflare R2 (media).

## The 5 operating rules

1. **Read the canon, not the repo.** Start from this file + the relevant `docs/`; open only files the
   current task needs. Don't re-explore what's already documented. _(token discipline)_
2. **One milestone/task at a time.** Small, reviewable diffs; finish and verify before starting the next.
3. **Log before you move on.** After each task, append to `docs/PROGRESS.md` — what changed, why, key
   decisions. Never lose completed-step memory to a context reset.
4. **Verify every change end-to-end** with the `verify` / `run` skills — never rely on "it should work".
5. **Stay in scope.** Obey the `docs/CONSTITUTION.md` non-goals; if a request implies drift, stop and flag it.

## Non-goals (do NOT build)

- No free-form / arbitrary layout builder — **fixed component set only**.
- No plugin / extension system.
- **AI never writes HTML/CSS** — it only fills the Zod `Site` schema.
- Real domain registration is the **last** milestone (M5), not early.

## Where things live

- `docs/CONSTITUTION.md` — non-negotiable principles → **read before any task**
- `docs/PLAN.md` — architecture + milestones M0–M6
- `docs/PROGRESS.md` — what's done + decisions + error log → **update after every task**
- `docs/CONVENTIONS.md` — coding conventions + debug/verify protocol
- `docs/POLICY.md` — cancellation/grace, data export, backup & monitoring policy (M6)
- `docs/PRODUCT_VISION_V2.md` — post-M6 product/roadmap direction ("AI WordPress" positioning,
  controlled tenant engine, SaaS UI redesign)
- `docs/ROADMAP_EVALUATION.md` — current-state evaluation + prioritized next phases (Faz 0 canlı smoke
  → Faz 1 GTM/pricing/yasal → Faz 2 V2.1 rich tenant engine) + risk/boşluk table + açık kararlar
- Roadmap (visual): https://claude.ai/code/artifact/4dd7c112-cf52-4c0d-8ded-2b681336d45e
- Original vision: `idea.md` (Turkish; historical — still uses the old working name "Dijital Mentor")

## Commands

- `npm run dev` — dev server
- `npm run test` — unit tests (`siteSchema.safeParse` fixtures)
- `npm run check` — svelte-check / TypeScript
- `npm run build` — production build (adapter-node)
- Drive flows end-to-end with the `run` / `verify` skills.

## Current status

See `docs/PROGRESS.md`. **M0–M6 all done.** Credentials are operator-managed at `/admin/settings`
(`src/lib/server/config.ts`, DB → env fallback; gate = `ADMIN_EMAILS` env). M6 added: the real
migration runner (`src/lib/server/db/migrations.ts` — versioned/idempotent/resumable, per-tenant
ready), nightly backups + 5-min health watchdog (`scripts/{backup,monitor}.sh` via cron,
`/api/health`), and the cancellation policy (`docs/POLICY.md`: grace window + daily sweep + data
export). Live: https://saaskaya.com (`www` and the former preview host redirect to the apex; tenant
previews use `*.saaskaya.com`). Post-M6: V2.0 SaaS UI redesign is live, and
**V2.2 Phase 1 — the two-layer AI gatekeeper — is done** (`src/lib/server/ai/gatekeeper.ts`:
Groq triage → approval card → risk-routed DeepSeek V4 Flash/Pro patches; local Zod validation +
one repair remain provider-independent; credits, estimated micro-USD spend, a global monthly
backstop, and `ai_gate_log` telemetry; spec + revisions in
`docs/specs/2026-07-08-two-layer-ai-gatekeeper.md`). **Beta launch + hybrid onboarding is done**
(`docs/specs/2026-07-08-beta-launch-hybrid-onboarding.md`): a closed-beta invite gate
(`BETA_MODE` setting, `beta_invites` table, `/admin/invites`; admins bypass via `isAdminEmail`),
an `EMAIL_PROVIDER` seam (`src/lib/server/email.ts`: SMTP via nodemailer / Resend / dev), and
domain reservation → bank transfer / Stripe one-time → decoupled idempotent fulfillment
(`src/lib/server/reservations.ts`, migration v5). Groq + DeepSeek credentials are active and the
live gate-to-edit smoke passes. Pending operator activation: `BETA_MODE`, real Resend magic-link
delivery, and off-site backups; Porkbun/Stripe/payment settings remain intentionally deferred for
the preview-only beta.
R2-backed image uploads are live in the editor (`src/lib/server/media.ts`, media API, migration v6);
the richer media library/thumbnails remain backlog. Other backlog: gatekeeper Phase 2 (top-up, human
help, budget dot), per-tenant SQLite split. Faz 6 privacy-safe tenant conversion aggregation and
page-level SEO metadata are live; Faz 7 recovery procedure is in `docs/DISASTER_RECOVERY_RUNBOOK.md`.
The active post-beta plan is `docs/specs/2026-07-16-gelistirme-ve-urunlestirme-plani.md`.
Product v2 direction is captured in `docs/PRODUCT_VISION_V2.md`.
