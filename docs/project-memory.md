# Project Memory

- 2026-07-10: Admin routes use shared `src/lib/ui/AdminShell.svelte` instead of `PageShell`.
  Admin navigation is sidebar-first on desktop and horizontal on mobile. `/admin/settings` is
  intentionally compact: system/payment summaries at the top, grouped collapsed settings panels
  below. Keep admin changes inside this shell unless a route has a strong reason to opt out.
- 2026-07-10: Production deploys now use an atomic release layout to avoid adapter-node chunk
  races. `ecosystem.config.cjs` runs PM2 from `/var/www/saaskaya/current/build/index.js`;
  `current` points to `/var/www/saaskaya/releases/<timestamp>`. Use
  `npm run deploy:production` for normal deploys; it bootstraps/switches releases, keeps recent
  releases, restarts/saves PM2, and runs `scripts/smoke-production.mjs`. Do not deploy by running
  `npm run build && pm2 restart ...` directly, because mutating root `build/` while PM2 serves it
  caused transient `ERR_MODULE_NOT_FOUND` chunk failures.
- 2026-07-10: Self-serve beta entry is live at localized `/en|/tr|/de/beta`. The form accepts an
  email, creates/reactivates a beta invite, creates the existing magic-link token, and sends the
  magic-link email automatically. Optional `BETA_ENTRY_CODE` in `/admin/settings` Ops gates
  `/beta?code=...`; leave it empty for an open form. First-run beta users complete `/profile/start`
  (full name, profession, city; no password) before reaching localized `/new`. Migration v14 adds
  `users.full_name`, `profession`, `city`, and `beta_profile_completed_at`.
- 2026-07-09: Launch i18n routing is live for the public/customer funnel. English is default;
  `/` redirects to `/en` unless `sk_locale` or `Accept-Language` selects `tr`/`de`. Locale-prefixed
  routes `/en|/tr|/de` are implemented by universal `src/hooks.ts` `reroute`; server locale/cookie
  handling lives in `src/hooks.server.ts`. Localized launch surfaces currently cover landing,
  pricing, login, `/new` onboarding, and `/templates`; legal pages are still Turkish legal drafts
  behind locale-prefixed URLs and need legal review before claiming full multilingual legal coverage.
- 2026-07-08: Production canonical URL is `https://saaskaya.com`; `www.saaskaya.com` and
  `saaskaya.digitaltamam.com` redirect to the apex.
- 2026-07-08: Cloudflare DNS has `@`, `www`, and `*` A records pointing to `72.62.52.55`.
  Records are DNS-only because the current API token cannot inspect or set zone SSL mode; verify
  `Full (strict)` in Cloudflare before enabling the proxy.
- 2026-07-08: Nginx templates live in `deploy/nginx/`; installed vhosts are
  `/etc/nginx/sites-available/{saaskaya.com,saaskaya.digitaltamam.com}`.
- 2026-07-08: Let's Encrypt certificate `saaskaya.com` covers `saaskaya.com` and
  `*.saaskaya.com`. Certbot uses the Cloudflare DNS plugin and a root-only credentials file at
  `/etc/letsencrypt/cloudflare/saaskaya.ini`; renewal is automatic.
- 2026-07-08: Production runs through PM2 app `saaskaya` on loopback port `3021`.
  Deploy with `npm run build && pm2 startOrRestart ecosystem.config.cjs --only saaskaya --update-env &&
pm2 save`; restarting by process name alone can preserve stale environment values.
- 2026-07-08: Cloudflare R2 bucket `saaskaya-media` serves public objects through
  `https://cdn.saaskaya.com`. Cloudflare manages the proxied CNAME to `public.r2.dev`; custom-domain
  ownership and SSL are active, with minimum TLS 1.2. Do not manually replace this DNS record.
- 2026-07-18: Owner/editor media uploads use `POST /api/sites/[siteId]/media`; the server validates
  JPEG/PNG/GIF/WebP signatures and sanitized SVG markup, rejects SVG active/remote/nested content,
  enforces 8 MB per raster file and 1 MB per SVG, writes unique immutable objects through
  `src/lib/server/media.ts`, and indexes them in migration v6 `media_assets`. Runtime R2 credentials
  are operator-managed under the `Media` group in `/admin/settings`; never expose them to browser
  code.
- 2026-07-18: The platform brand mark and mascot are the transparent ink bee in `static/logo.svg`
  and `static/mascot-bee.svg`, derived from the owner-supplied source SVG. Mascot usage rules live in
  `design.md`: use it sparingly for orientation/help/completion and let transparent areas inherit
  the warm paper/shell token instead of hard-coding white.
- 2026-07-08: Beta AI routing defaults to Groq `llama-3.3-70b-versatile` for Layer 1 and DeepSeek
  `deepseek-v4-flash` / `deepseek-v4-pro` for Layer 2. Keys and overrides are in the
  `/admin/settings` `AI Providers` group. `src/lib/server/ai/llm.ts` is the provider seam; every
  result still goes through local Zod validation and at most one repair.
- 2026-07-08: Migration v7 adds estimated AI spend in integer micro-USD. The application enforces
  `AI_GLOBAL_MONTHLY_BUDGET_USD` (default/configured `$5`) before AI calls; Groq gate calls are
  treated as zero-cost under the selected free beta tier.
- 2026-07-09: Groq and DeepSeek credentials are active and passed a production gate-to-edit smoke.
  Groq requests require the explicit `saaskaya/1.0` user agent in this environment. DeepSeek V4
  forced tool calls require `thinking: { type: 'disabled' }`; otherwise the API returns 400 because
  thinking mode does not support `tool_choice`.
- 2026-07-09: Production runtime uses `data/production.db` from the PM2 process environment even
  though the workspace `.env` currently points to `local.db`. Always inspect `pm2 env <saaskaya-id>`
  before running production DB diagnostics or smoke scripts.
- 2026-07-09: Operational errors persist in migration v8 `error_events` and appear under
  `/admin/settings` → Recent errors. Customers receive an `err-xxxxxxxx` reference; use that code to
  find route, status, user/site identifiers, sanitized message, and stack. Never request customer
  content or credentials for first-line diagnosis. As of 2026-07-11, `src/hooks.server.ts` keeps 404
  route misses out of `error_events`; public scanner traffic is aggregated in
  `request_probe_stats` and shown separately as Request probes so Recent errors stays focused on
  real 500/422 application incidents.
- 2026-07-09: Production data is isolated at `/var/www/saaskaya/data/production.db`; local
  development remains on `.env` `DATABASE_URL=local.db`. PM2 reads
  `DATABASE_URL_PRODUCTION=data/production.db` from `.env`. `scripts/backup.sh` and
  `scripts/monitor.sh` resolve the same production setting. The one-time safe copier is
  `scripts/split-production-db.sh`; it refuses to overwrite an existing target.
- 2026-07-09: Read-only public production verification is
  `node scripts/smoke-production.mjs`; it checks mobile/desktop landing and login rendering, browser
  errors, overflow, broken images, health/sitemap, auth redirects, and 404 behavior. Full Phase 0
  evidence and blockers are tracked in `docs/PHASE0_VERIFICATION.md`.
- 2026-07-09: Production must keep `AUTH_DEV_ECHO_LINK` empty. Failed magic-link delivery must never
  log the token; `src/lib/server/email.ts` only exposes/logs full links when development echo is
  explicitly enabled.
- 2026-07-09: `CRON_TOKEN` is configured in production `app_settings`; the authenticated
  `/api/admin/tasks/daily` sweep returned 200. The token is intentionally not recorded in docs.
- 2026-07-09: Closed beta runs with `PAYMENT_MODE=disabled`; new-domain reservation/payment is hidden
  and rejected server-side because Stripe/Porkbun/bank settings are unavailable. Existing-domain
  attachment remains. Do not enable a payment mode until its external activation smoke passes.
- 2026-07-09: Fresh production auth → Groq/DeepSeek generation → editor/preview → applied chat edit →
  publish → tenant-host smoke passed with `site-6e8106ca`. Resend `saaskaya.com` is verified and a
  controlled `noreply@saaskaya.com` message reached provider state `delivered`. Smoke login tokens
  and sessions were invalidated afterward.
- 2026-07-09: No rclone/SSH off-site target exists. Closed beta has consistent nightly local backups
  plus a passed restore drill, but no disaster-recovery copy; off-site backup remains mandatory
  before a paid public-launch resilience claim.
- 2026-07-09: Phase 0 reproducible baseline is local commit `9fbf36d` on `master`; secrets,
  databases, dependencies, and build output were excluded. It has not been pushed.
- 2026-07-09: Phase 3 kit/quality/onboarding changes were deployed with
  `npm run build && pm2 restart ecosystem.config.cjs --only saaskaya --update-env && pm2 save`.
  Controlled live smoke passed: `/new` `warm_trust` carried `calm-intake` into the real
  `POST /api/sites` payload, Groq/DeepSeek generation returned 200, editor and quality panel opened,
  publish returned 200 with only `seed_media_in_use` warning, tenant host returned 200, and all
  temporary smoke rows were cleaned from `data/production.db`.
- 2026-07-09: Creem is now implemented as an alternate subscription billing provider. Select it with
  `PAYMENT_PROVIDER=creem` and configure `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`,
  `CREEM_PRO_PRODUCT_ID`, and optional `CREEM_TEST_MODE=1` in `/admin/settings`. Creem webhooks post
  to `/api/billing/creem/webhook`; Stripe remains available through the existing provider path.
