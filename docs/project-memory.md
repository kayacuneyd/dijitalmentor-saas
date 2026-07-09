# Project Memory

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
- 2026-07-08: Editor image uploads use `POST /api/sites/[siteId]/media`; the server validates
  JPEG/PNG/GIF/WebP signatures, enforces 8 MB/file and 100 MB/site limits, writes unique immutable
  objects through `src/lib/server/media.ts`, and indexes them in migration v6 `media_assets`.
  Runtime R2 credentials are operator-managed under the `Media` group in `/admin/settings`; never
  expose them to browser code.
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
  content or credentials for first-line diagnosis.
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
