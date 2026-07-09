# Phase 0 — Baseline and Production Evidence

> Started: 2026-07-09 · Status: complete
>
> This is the evidence ledger for Phase 0 of
> `docs/specs/2026-07-09-hostinger-horizons-competitive-roadmap.md`.

## Baseline

- Git branch/HEAD: `master` at `03437b3`.
- Worktree at phase start: 7 modified paths and 27 untracked paths. Most application code has never
  been committed; do not describe this as a clean or reproducible baseline yet.
- Commit/push is intentionally deferred until the operator explicitly requests it, per
  `docs/CONVENTIONS.md`.
- Framework verification after the first Phase 0 changes:
  - `npm test`: 25 files, 131 tests passed.
  - `npm run check`: 0 errors and 0 warnings.
  - `npm run build`: adapter-node production build passed.

## Completed Evidence

### Development/production database isolation

- Previous state: PM2 and local Vite both used `/var/www/saaskaya/local.db`.
- Production now uses `/var/www/saaskaya/data/production.db` through
  `DATABASE_URL_PRODUCTION=data/production.db`.
- Existing data was copied with SQLite `.backup`; source and target matched on sites (3), users (9),
  published versions (4), and settings (16); target `PRAGMA integrity_check` returned `ok`.
- PM2 was restarted with `ecosystem.config.cjs --update-env` and its live environment reports
  `DATABASE_URL=data/production.db`.
- The legacy `local.db` remains intact for development/rollback; it was not deleted.
- Backup and monitor scripts resolve the same production DB setting instead of hard-coding
  `local.db`.

### Backup/restore and process health

- `scripts/backup.sh` completed against the production DB.
- The newest gzip snapshot was restored to a temporary SQLite file; integrity was `ok`, it contained
  3 sites, and schema migration version was 7.
- `scripts/monitor.sh` returned cleanly against the healthy service.
- Cron entries exist for nightly backup and five-minute monitoring.
- `https://saaskaya.com/api/health` returned `ok` with DB and disk checks healthy.

### Public production surface

- `http://saaskaya.com/` returns 301 to `https://saaskaya.com/`.
- TLS certificate covers `saaskaya.com` and `*.saaskaya.com`; current expiry is 2026-10-06.
- Apex returns 200; `www` and the former preview host redirect to the apex.
- Signed-out `/new`, `/dashboard`, and `/account` redirect to login.
- `/sitemap.xml` and `/api/health` return 200; an unknown route returns 404.
- Published `seed-law.saaskaya.com` returns 200 in TR/EN/DE.
- `scripts/smoke-production.mjs` passed on 375×812 and 1365×900:
  - landing and login returned 200;
  - no browser console/page errors;
  - no horizontal overflow;
  - no broken images;
  - protected-route and error statuses matched expectations.

### Authentication security

- Production `AUTH_DEV_ECHO_LINK` was active and is now disabled.
- Failed production magic-link delivery previously logged the complete one-time token. The email seam
  now logs the token only when development echo is explicitly enabled; production logs a token-free
  failure. A regression test covers this behavior.
- Controlled production authentication smoke passed: login form 200, one-time verify 303, session
  cookie accepted, and authenticated dashboard 200. Development echo was enabled only for the
  controlled session step, then disabled and verified empty in the live PM2 environment.
- All smoke-user login tokens and sessions were invalidated after the test. The saaskaya PM2 stdout
  log containing the temporary development token was cleared.

### Authenticated AI and publish flow

- A real production flow passed with the controlled account:
  - Groq/DeepSeek generation returned 200 and produced `site-6e8106ca`;
  - authenticated editor and preview returned 200;
  - a low-risk Turkish headline request returned 200 with `kind=applied`;
  - publish returned 200;
  - `https://site-6e8106ca.saaskaya.com/` returned 200.
- This is fresh end-to-end evidence after the production DB split, not a mocked provider test.

### Config readiness

- Groq and DeepSeek credentials are configured; the previously recorded production gate-to-edit
  smoke remains the current live evidence.
- R2 credentials are configured.
- Resend provider, key, and `Saaskaya <noreply@saaskaya.com>` sender are configured.
- Resend reports `saaskaya.com` as `verified` in `eu-west-1`.
- A controlled message sent through Resend from `noreply@saaskaya.com` reached provider state
  `delivered`.
- A random `CRON_TOKEN` is configured. An authenticated production daily sweep returned 200 with
  `{ ok: true }`; no domains required sweeping.

### Closed-beta scope decisions

- Stripe and Porkbun credentials are unavailable, so those external integrations were not
  misrepresented as verified.
- `PAYMENT_MODE=disabled` is explicit in production. The dashboard hides new-domain
  reservation/purchase and the server action rejects direct attempts. Connecting an already-owned
  domain remains available to eligible accounts.
- Stripe checkout, automated domain purchase, and bank-transfer fulfillment are outside the closed
  beta launch promise. They must pass a separate activation checklist before being enabled.
- No rclone remote or SSH off-site target exists. Closed beta therefore promises nightly local
  consistent snapshots and restore drills, not disaster recovery. Off-site backup remains a paid
  public-launch blocker and must not be claimed on marketing/trust pages.

## Deferred Beyond Closed Beta

- Stripe checkout/webhook activation.
- Porkbun registration and automated fulfillment.
- Bank-transfer fulfillment configuration.
- Off-site disaster-recovery copy.
- Contact-form inbox receipt remains covered by the same verified email seam but should be exercised
  with the first real beta tenant’s contact address.

## Phase Exit Gate

Phase 0 exit criteria:

1. Current worktree captured in a reviewed Git baseline.
2. Controlled email/login and authenticated AI/edit/publish smoke passed.
3. Unconfigured Stripe/domain/off-site integrations explicitly removed from the closed-beta promise.
4. Fresh test/check/build and production smoke green after the final Phase 0 change.
