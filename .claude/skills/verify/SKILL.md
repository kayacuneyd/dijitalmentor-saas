---
name: verify
description: How to build, launch, and drive saaskaya end-to-end to verify a change (SSR preview surface).
---

# Verifying saaskaya

The runtime surface is the SvelteKit dev server (SSR). Drive it with curl; evidence is the
served HTML.

## Launch

```sh
(npm run dev -- --port 5183 > /tmp/dev.log 2>&1 &) && sleep 6
curl -s -o /dev/null -w "%{http_code}" http://localhost:5183/   # expect 200
```

Stop with `pkill -f "vite dev"`. Note: `pgrep -f "vite dev"` matches its own shell — confirm
shutdown with curl, not pgrep. In a sandboxed shell, `pkill -f "vite dev"` combined with an
immediate restart in the same command can report a spurious nonzero exit even though it worked —
if that happens, find the exact PID instead (`ss -ltnp | grep 5183`) and `kill <pid>`, or just
split the stop and (re)start into two separate commands.

## Flows worth driving

- **Preview render (M1+):** `GET /preview/{seed-law|seed-psych|seed-dental}?locale={tr|en|de}`
  → 200; the first `<h1 class="text-4xl…">` is the locale marker; the site-root `style=`
  attribute carries the theme (`--color-primary`, `--font-heading`) per niche.
- **Multi-page:** `GET /preview/seed-law/services?locale=en` → 200, "Practice areas".
- **Default locale:** `GET /preview/seed-dental` (no param) → German (seed's defaultLocale=de).
- **Negative:** unknown siteId or page slug → 404; `?locale=fr` or empty → falls back to
  defaultLocale; `/seed/law/hero.svg` → 200 `image/svg+xml`.
- **Landing:** `GET /` lists the three seeds and links every locale.

## Editor flows (M2+)

- `GET /editor/seed-law` → 200; 6 tabs, viewport buttons, save badge.
- Draft API: `GET /api/sites/{id}/draft` (lazy-seeds into `local.db`); `PUT` with edited JSON →
  `{"ok":true}`; invalid draft → 400 + Zod issues; id mismatch / non-JSON → 400.
- Persistence: PUT a changed headline → `/preview/{id}` SSR shows it (survives reload).
- **Live postMessage needs a browser.** Recipe: `npm i playwright-core` in the scratchpad, launch
  with `executablePath: '/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome'` and
  `--no-sandbox`. Drive: open editor → expand a section `<summary>` → fill the headline input →
  iframe `<h1>` changes while a pre-planted `window.__marker` survives (proves no reload); wait
  > 800 ms → autosave hits the API; `input[type=color]` + dispatched `input` event → iframe
  > `--color-primary` updates; Mobile button → iframe width 375; check
  > `scrollWidth - clientWidth === 0` inside the frame; collect console errors.
- Reset dev state with `rm -f local.db` (it lazy-reseeds).

## AI flows (M3+)

- Live generation/chat needs `ANTHROPIC_API_KEY` in `.env`. Without it every AI endpoint degrades
  to a friendly 503 (`{"ok":false,"message":"AI is not configured…"}`) — that 503 is itself a
  verifiable behavior, not a failure.
- `POST /api/sites` `{description}` (≥30 chars) → `{ok, id, usage}`; then `/editor/{id}` +
  `/preview/{id}` serve the generated draft. Short description → 400; quota spent → 429;
  provider down → 503; unrepairable output → 422.
- `POST /api/sites/{id}/chat` `{message}` → `{ok, reply, site}`; the ChatTab applies the returned
  site via `DraftStore.replace` → live iframe update (no reload).
- Unit surface: `npm test` covers the pipeline with a mocked `RunToolCall` (repair ≤1, invalid →
  AIInvalidOutputError, translation-structure mismatch, patch-op application + contract re-parse).
- Live smoke (costs tokens — one run is enough): with the key set, POST one Turkish self-description
  and check the preview SSRs correct copy in all 3 locales.

## Auth + publish + public site (M4+)

- Login: `POST /login` (form-urlencoded `email=…`) → with `AUTH_DEV_ECHO_LINK=1` the response HTML
  contains the verify link; GET it with a cookie jar → 303 to `/dashboard` + `sk_session` cookie.
  Links are single-use; per-IP rate limit (5/min) — a blocked attempt produces NO `[auth] magic
link` log line (plain-form responses re-render with the error, don't rely on the status code).
- Guards: `/dashboard`, `/new` redirect 303 to `/login` when signed out; `POST /api/sites` → 401;
  foreign-owned site (set `owner_user_id` via sqlite3 to simulate) → 403 on draft/editor/publish.
  Ownerless seeds stay open.
- Publish: `POST /api/sites/{id}/publish` → `{ok, version}` (increments); `DELETE` unpublishes.
  Draft edits must NOT change the published output until republish.
- Public site via Host routing: `curl -H "Host: seed-law.localhost" localhost:5183/{,en,de,en/services}`
  → published snapshot, default locale unprefixed. Unpublished → 404. Real browsers resolve
  `*.localhost`, so `http://seed-law.localhost:5183/de` works in Playwright directly.
  On the live server use `curl -H "Host: <id>.saaskaya.digitaltamam.com" http://127.0.0.1:3021/`
  (no wildcard DNS/TLS until M5).

## Admin settings + billing + contact + domains (M5+)

- `/admin/settings`: signed-out → 303 login; non-admin → 403; admin (email in `ADMIN_EMAILS` env)
  → 200. Save via `POST ?/save` (`key`+`value` form fields); secrets render masked (`••••1234`)
  with a `db` source badge; `?/clear` falls back to env.
- Stripe webhook: sign a fake `checkout.session.completed` with the configured
  `STRIPE_WEBHOOK_SECRET` (`t=<unix>,v1=<hmac-sha256 of "t.body">`) → 200 + user's
  `subscription_status='active'` (dashboard shows Pro); forged signature → 400; no secret → 503.
- Contact: on a published tenant host, `POST '?/contact'` (form-urlencoded name/email/message/locale,
  browser-style `Origin`) → row in `contact_submissions` + `/dashboard/{id}/messages` lists it.
  No RESEND key → stored anyway, log shows "email not sent". Preview renders the form inert.
- Domains: attach as free user → 402; as Pro/admin → saved to draft (+ provisioning message);
  invalid domain rejected; detach clears it. Custom-domain Host reroute needs `PUBLIC_APP_HOST`
  (prod only). **Direct-port curls to :3021 must send `x-forwarded-proto`** — without it form
  POSTs 403 (CSRF origin mismatch); nginx always adds it in real traffic.

## Two-layer chat gatekeeper (V2.2 Phase 1)

- Unit surface (`npm test`, mocked `RunToolCall`): gate schema fixtures, repair, outline
  leak-check, endpoint stages (redirect/reply = zero L2 calls, low-risk auto-apply on
  `claude-sonnet-5`, proposal→confirm on the heavy model, force, gate-failure fallback),
  credits (free/pro limits, admin bypass, 429), migration v4.
- Endpoint stages by curl (auth cookie required): POST `{message}` → `kind` ∈
  `redirect|reply|help|applied|proposal`; POST `{message, approvedPrompt, riskLevel}` → applied;
  `{message, force:true}` → applied. No API key → every stage 503s gracefully.
- Credits: `sqlite3 local.db 'SELECT * FROM ai_usage'` — `edit_count` +1 per applied edit only;
  gate decisions land in `ai_gate_log`; counters render on `/admin/settings` ("AI gate (this
  month)").
- UI (playwright): empty chat shows the greeting; a proposal renders the 📋 card with
  ✓ Uygula / ✗ İptal; İptal leaves the draft byte-identical; after an applied edit "↩ Geri Al"
  restores the previous draft (check the iframe headline); helper text under the input.
- Live smoke (needs `ANTHROPIC_API_KEY`; costs tokens — one run): off-topic TR message →
  redirect + 0 agent tokens in `ai_gate_log`; small copy edit → auto-applied via Sonnet; theme
  change → card → approve → applied via Opus; then `usage.cache_read_input_tokens > 0` on the
  second heavy call and the Ops-card counters move.

## Guided onboarding Q&A (Hostinger Horizons roadmap Phase 2)

`/new` is anonymous-reachable: a fixed 14-question script (+2 conditional contact steps) collects
answers before the sign-in gate, which now sits at `POST /api/onboarding/finish` instead of the
page load. Free-text answers (~8 of the questions) pass through a Groq on-topic guard with no
force/override path.

- Unit surface (`npm test`): `questions.test.ts` (script shape, conditional visibility,
  `nextQuestion` sequencing, per-question schemas), `compose.test.ts` (description composition,
  language steering, raw escape-hatch passthrough verbatim), `onboardingGuard.test.ts` (mocked
  `RunToolCall`: on-topic pass, off-topic + reply, repair-once, `AIInvalidOutputError`), `session.test.ts`
  (pending record lifecycle, cross-device `linkPendingToUser` via URL token vs cookie, sweep),
  endpoint tests in `answer/server.test.ts` + `finish/server.test.ts` (validation, guard
  block/fail-open, rate-limit buckets, ownership).
- `POST /api/onboarding/answer` `{questionId, value}` → `{ok, nextQuestionId|null, done}`; invalid
  shape → 400; off-topic guarded answer → `{ok:false, kind:'off_topic', message}` (400, answer NOT
  saved); `questionId:'rawDescription'` (≥30 chars) is the escape hatch, unguarded, always
  `done:true`. Guard fails OPEN on `AIUnavailableError`/`AIInvalidOutputError` (no `GROQ_API_KEY`
  in dev → every guarded answer logs to `error_events` with `source:'onboarding-guard'` and is
  accepted anyway — expected, not a bug).
- `POST /api/onboarding/finish` — 401 signed-out (**the abuse gate now lives here**); 404 no
  pending cookie; 400 if required questions aren't all answered (unless `rawDescription` present);
  200 `{ok, description}` on a signed-in, complete pending record — client then POSTs that
  `description` to the UNCHANGED `/api/sites`, exactly like the plain-textarea flow.
- Cross-device magic-link handoff: answer a few questions anonymously → `sk_pending` cookie set →
  `POST /login` (same cookie present) → the returned/dev-echoed link carries `&p=<rawPendingToken>`
  → open that link in a **different** cookie jar/browser context → `/login/verify` resolves the `p`
  query param (not the cookie), links the record, redirects to `/new` (not `/dashboard`), and
  re-issues `sk_pending` on that new device — `/new` then SSRs the resumed answers.
- Real-browser (playwright-core, same recipe as elsewhere in this doc): answer all questions via
  the choice/multi-choice/text/list_text controls → toggle the "kendi cümlelerimle anlatmak
  istiyorum" escape hatch open/closed without losing progress → complete → anonymous click on
  "Ücretsiz Başla" goes to `/login` → send + open the dev-echo link in a second browser context →
  resumed answers visible on `/new` → "Siteni oluştur" → `/api/sites` (no AI key in dev → visible
  503 error, not a hang — that's the thing to prove, not a live generation). Also check 375px:
  `document.documentElement.scrollWidth - clientWidth === 0` with the escape-hatch textarea open.
  No force/override control should exist anywhere on the page (`/yine de gönder|force/i` should not
  match the body) — that absence is the point of this feature, verify it stays absent.
- Daily sweep: `sqlite3 local.db` insert a `pending_onboarding` row with `expires_at` in the past →
  `POST /api/admin/tasks/daily` with `x-cron-token` → response `sweptOnboarding >= 1` and the row
  is gone.

## Beta launch + hybrid onboarding (beta-launch spec)

- **Databases are isolated:** local Vite uses `.env` `DATABASE_URL` (currently `local.db`);
  production uses `.env` `DATABASE_URL_PRODUCTION` (currently `data/production.db`). Production
  checks and admin-setting inspection must target the latter; never assume a local dev mutation
  affects production.
- **Beta gate** (`npm test` covers it; live via curl): `BETA_MODE` off → anyone gets a link;
  on → non-invited `POST /login` returns the Turkish "kapalı beta" message and creates NO magic
  link (check the dev.log "magic link for" count, not the HTML — plain-form responses re-render);
  invited email + any `ADMIN_EMAILS` address still get a link (admin bypass). The `/login` page
  shows a 🔒 beta badge when `BETA_MODE` is on.
- **/admin/invites** (admin only): add (email + profession) → appears; revoke → Reactivate control;
  first sign-in flips an invite `invited`→`joined`.
- **Reservations** (unit-tested exhaustively; drive the admin panel via Playwright): insert a
  `domain_reservations` row (pending) → `/admin/settings` "Bekleyen ödemeler" lists it →
  Onayla → `paid` → Kur → fulfillment **skips gracefully** when Porkbun is unconfigured
  (no crash). Dashboard reservation card shows IBAN + amount + "Havale yaptım, bildir" +
  cancel; `PAYMENT_MODE` (`bank_only`/`hybrid`/`stripe_only`) controls which options render.
- **Email seam** (`npm test`, mocked): `EMAIL_PROVIDER=smtp` → nodemailer transport with port 465
  default (the fixed NaN bug); `=resend` → fetch to Resend; unset + no key → dev echo.
- **Stripe split** (`npm test`): a `checkout.session.completed` with `mode=payment` +
  `metadata.reservationId` marks the reservation paid and does NOT activate a subscription; a
  subscription event still upgrades to Pro.

## Ops + policy (M6+)

- `GET /api/health` → `{ok, checks:{db,disk}}`, 200 (503 when degraded). Works live via nginx too.
- **Auth is now required everywhere that mutates:** anonymous `/editor/*` → 303 login; anonymous
  draft GET/PUT, chat, publish → 401; authed PUT with an unknown id → 404 (**must not** create a
  site row — check the DB). Domain attach of a domain already on another site → rejected
  ("already attached", form re-render).
- Daily tasks: `POST /api/admin/tasks/daily` — no CRON_TOKEN configured → 401 hint; wrong token →
  401; `x-cron-token: <CRON_TOKEN>` → `{ok, sweptDomains}`. Sweep only touches owned sites whose
  owner is past `subscription_ends_at + GRACE_DAYS` (unit-tested; simulate via sqlite UPDATE on
  users + a draft with `$.domain`).
- Export: `GET /api/sites/{id}/export` as owner → `content-disposition: attachment`, JSON with
  `site` + `contactSubmissions`; anonymous → 401.
- Backup: run `scripts/backup.sh` → `/var/backups/saaskaya/db-*.sqlite.gz` (+env), keeps 14;
  **restore drill:** gunzip a copy and `sqlite3` query `sites` + `schema_migrations`.
- Monitor: `scripts/monitor.sh` silent when healthy; test the failure path with a sed-copy probing
  a dead port (never point the real script elsewhere). Cron: `crontab -l | grep saaskaya`.
- Migration runner: unit tests cover fresh/idempotent/resumable/adopt/rollback; on boot the app
  logs `[db] migrations applied: …` once per new version.

## Gotchas

- Placeholder images are hand-written SVGs in `static/seed/**`; seeds reference `.svg` paths.
- 375px-overflow and browser-console checks need a real browser — curl can't cover them;
  blocks mitigate with `overflow-x-hidden` on the site root and responsive classes.
- Prettier reformats generated/edited files on `npm run format`; run it before committing.
