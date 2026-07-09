# Cancellation, Data & Backup Policy — saaskaya

The operational policy the code enforces (M6). Change the numbers here **and** the matching
settings/constants together.

## Beta access

- When `BETA_MODE` is on, sign-in is invite-only: only emails in the `beta_invites` list
  (managed at `/admin/invites`, status ≠ `revoked`) receive a magic link. Super admins
  (`ADMIN_EMAILS`) always bypass the gate. With `BETA_MODE` off, sign-in is open to everyone.
- A denied email gets a clear "closed beta — request an invite" message (no link is created).
- The gate is checked both when the link is sent and when it is clicked, so revoking an invite
  closes the door even for a link already in someone's inbox.

## Domain reservation & payment

- A **reservation** records a requested custom domain and its payment method; a real registration
  runs **only after payment is confirmed** (constitution §5). Beta invitees publish free on their
  `<siteId>` subdomain — the "free gift" is the subdomain, never a free paid domain.
- **Bank transfer:** the user reserves, sees the IBAN + amount, and clicks "Havale yaptım, bildir".
  That is a note only — it never confirms payment. The operator confirms receipt at
  `/admin/settings` (Bekleyen ödemeler), which flips the reservation to `paid`.
- **Stripe (one-time):** the user pays via Stripe checkout (`mode=payment`); the webhook marks the
  reservation `paid`. This one-time domain payment never activates a Pro subscription.
- **Fulfillment** (register → DNS → TLS → attach) runs after `paid`, decoupled and retryable: the
  daily cron auto-fulfills paid/failed reservations, and the operator can fulfill/retry manually.
  Availability is re-checked before registering; a failure lands the reservation on `failed` (kept
  with operator notes) for retry — money is never spent on an unavailable domain.
- `PAYMENT_MODE` (`bank_only` / `hybrid` / `stripe_only`) controls which options the user sees;
  price and IBAN come from settings (`DOMAIN_PRICE_EUR/TRY`, `BANK_IBAN`, `BANK_ACCOUNT_HOLDER`).

## Subscription & cancellation

- The **Pro plan** unlocks custom domains (attach or register). Sites themselves — including
  publishing on the `<siteId>.<app-host>` subdomain — stay available on the free tier.
- On cancellation (or failed payment), paid features remain active until the **end of the paid
  period**, then for a **grace period of 30 days** (`GRACE_DAYS` setting). The dashboard shows the
  exact date.
- After the grace period, the **daily sweep detaches custom domains** (site keeps serving on its
  subdomain — nothing is deleted) and emails the owner. Re-subscribing lets the domain be
  reattached at any time.

## Domains registered through the platform

- Registration happens **only after payment** (constitution §5), for 1-year terms via the
  registrar API.
- The domain belongs to the customer. Renewal is not automatic once the subscription lapses;
  the sweep notice reminds the owner, and transfer-out is always possible per ICANN rules
  (handled at the registrar).

## AI budget

- Plans are enforced in **credits**, reset monthly: Free = 10 chat edits + 1 site generation,
  Pro = 50 chat edits + 5 site generations (`AI_EDITS_*` / `AI_GENERATIONS_*` settings).
- **What is free:** the gatekeeper triage, questions it answers, off-topic redirects, and all
  direct text/color edits in the editor tabs (they never touch the AI).
- **What costs a credit:** every applied AI edit — auto-applied low-risk edits, approved
  proposals, and "yine de gönder" (force-send) alike. Cancelling a proposal costs nothing.
- Chat edits change the **draft** only; publishing stays a separate explicit action.
- A raw monthly token ceiling (`AI_MONTHLY_TOKEN_LIMIT`, default 500k) remains as an abuse
  backstop on top of credits.
- Top-up purchases and the human-help session flow are planned for Phase 2 of the gatekeeper
  spec and are not live yet.

## Your data

- **Export anytime:** dashboard → "Export" downloads the full site JSON + all contact-form
  submissions. No subscription required.
- **Deletion on request:** contact the operator; sites, versions, messages and the account row
  are removed from the database and age out of backups per the retention below.

## Backups & retention

- `scripts/backup.sh` (nightly cron): consistent online SQLite backup + config snapshot,
  compressed to `/var/backups/saaskaya/`, **14 most recent kept**; optional off-site copy when
  `BACKUP_REMOTE` (rclone/scp target) is configured in `/admin/settings`.
- `scripts/monitor.sh` (5-minute cron): probes `/api/health`; on repeated failure it alerts
  `ALERT_EMAIL` (via Resend) and, when `MONITOR_AUTORESTART=1`, restarts the app process.
