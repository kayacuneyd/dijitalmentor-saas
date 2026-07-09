# Beta Launch & Hybrid Onboarding Spec — saaskaya

> **Revisions (2026-07-08, approved & implemented — all three phases).** The review against the
> live code found bugs and one diagram/checklist contradiction; where this block and the original
> text below disagree, this block wins:
>
> 1. **Migration is v5, not v4.** v4 is already `ai-gatekeeper-credits`. `beta_invites` and
>    `domain_reservations` (plus a partial unique index on live reservations) ship in migration
>    **v5** `beta-launch`.
> 2. **Beta gate = `beta_invites` table + `/admin/invites`** (chosen over the checklist's
>    comma-string `BETA_ALLOWLIST`, matching the architecture diagram). `BETA_MODE` (Ops setting)
>    is the on/off switch; `isBetaAllowed()` reads the table. **Super admins bypass the gate**
>    (`isAdminEmail`, shared with `hooks.server.ts`) so the operator can never lock themselves out.
>    The gate is enforced both when sending the magic link and at verify time.
> 3. **Email seam = `EMAIL_PROVIDER` (smtp | resend | dev)** with nodemailer for SMTP and the
>    existing fetch for Resend. Fixed the spec's `Number(getSetting('SMTP_PORT')) ?? 465` bug
>    (`Number(undefined)` is `NaN`, never falls back) → `Number(getSetting('SMTP_PORT') ?? '465')`;
>    port 465 ⇒ implicit TLS, 587 ⇒ STARTTLS. Back-compat: a lone `RESEND_API_KEY` still routes
>    to Resend.
> 4. **Stripe `checkout.session.completed` disambiguation.** A one-time domain payment shares that
>    event with subscription checkout; `handleStripeEvent` now routes by `mode==='payment'` /
>    `metadata.reservationId` to mark the reservation paid, and **never** flips the user to Pro.
>    `createDomainCheckoutSession` sets `mode=payment` + metadata.
> 5. **Fulfillment is decoupled and idempotent.** `confirmPayment` / the webhook only set
>    `status='paid'` (fast). `fulfillReservation` is a retryable status machine
>    (`paid`→`registering`→`active`|`failed`) that re-checks availability before registering and
>    never runs the 120s+ pipeline inside a request; it's invoked by an admin "Kur / tekrar dene"
>    button **and** the daily cron (`/api/admin/tasks/daily` sweeps paid + failed). The Stripe path
>    is "operator-free" (cron auto-fulfills), not "instant".
> 6. **Free "beta gift" = subdomain only.** The "free" domain-registration path was dropped — a
>    real registration always requires payment (bank or Stripe), so the operator never eats an
>    ICANN cost and §5 stays clean. Payment methods are `bank_transfer | stripe`.
> 7. **Uniqueness on live states only.** A partial unique index over
>    `status IN ('pending','paid','registering','active')` — a cancelled/failed row never wedges a
>    domain retry.
> 8. **UI via form actions, not new API routes.** Reserve/report/cancel/Stripe live on the
>    dashboard; confirm/reject/fulfill on `/admin/settings` — matching the existing form-action
>    pattern (publish, attach-domain, settings save), so no fetch/CSRF client code. The Stripe
>    webhook remains the one server route touched.
>
> Settings added: `EMAIL_PROVIDER`, `SMTP_HOST/PORT/USER/PASS`, `BETA_MODE`, `PAYMENT_MODE`,
> `DOMAIN_PRICE_EUR/TRY`, `BANK_IBAN`, `BANK_ACCOUNT_HOLDER`. Live email + real domain purchase
> remain operator-activation steps (enter keys, set `BETA_MODE`/`PAYMENT_MODE`/IBAN at
> `/admin/settings`).

## Goal

Open saaskaya to a closed beta: selected professional groups (law, psych, dental) get invite-only
access, generate their site on a subdomain, reserve a custom domain, and pay for it via bank transfer
or Stripe. Email delivery starts on Hostinger's default mail system and migrates to Resend later.
This is the transition plan from "MVP works on seed tenants" to "real users on real domains."

## Motivation

- **Cost control:** unlimited public launch would burn AI tokens and register domains before the
  product is validated. A closed beta with a hand-picked cohort keeps costs and risk bounded.
- **Human-in-the-loop payments:** in Turkey, bank transfer (EFT/havale) is the most trusted payment
  method for small businesses. Stripe is great but not everyone has a card or trusts recurring
  billing. A hybrid model (free beta invites + bank transfer + Stripe) maximizes conversion during
  the transition.
- **Email pragmatism:** Resend gives better deliverability and analytics, but Hostinger's default
  mail is already provisioned on `saaskaya.digitaltamam.com` and costs nothing. Starting with
  Hostinger SMTP means the beta can launch today; switching to Resend is a one-setting change later.
- **Constitution alignment:** §5 requires domain registration only after payment. Bank transfer
  confirmed by the operator **is** payment confirmation — the mechanism differs from Stripe webhooks
  but the principle (no registration before money is received) is preserved.

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│ BETA ACCESS                                                  │
│                                                              │
│  Operator → /admin/invites → invite list (email + profession)│
│       │                                                      │
│       ▼                                                      │
│  User visits /login → email checked against allowlist        │
│       │                                                      │
│       ├─ allowed → magic link (Hostinger SMTP or Resend)     │
│       │            → /dashboard                              │
│       │                                                      │
│       └─ denied → "Closed beta — request an invite"          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EMAIL DELIVERY (hybrid)                                      │
│                                                              │
│  EMAIL_PROVIDER=smtp  → Hostinger SMTP (nodemailer)          │
│  EMAIL_PROVIDER=resend → Resend API (existing)               │
│  EMAIL_PROVIDER unset  → dev echo (existing fallback)        │
│                                                              │
│  All auth (magic link), contact notifications, and operator  │
│  alerts route through sendEmail() — one seam, switchable.    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DOMAIN RESERVATION + HYBRID PAYMENT                          │
│                                                              │
│  User in dashboard:                                          │
│    "İstediğim domain: avukatzeynep.com"                     │
│    [Rezerve et →]                                            │
│         │                                                    │
│         ▼                                                    │
│    domain_reservations (status=pending)                      │
│         │                                                    │
│         ▼                                                    │
│    Payment options:                                          │
│    ┌──────────────┬──────────────┬──────────────┐           │
│    │ 🏦 Banka     │ 💳 Stripe    │ 🎁 Free      │           │
│    │ Havalesi     │ (one-time)   │ (beta gift)  │           │
│    │              │              │              │           │
│    │ TRxx xxxx    │ [Öde →]      │ [Talep et →] │           │
│    │ [Bildir →]   │              │              │           │
│    └──────┬───────┴──────┬───────┴──────┬───────┘           │
│           │              │              │                    │
│           ▼              ▼              ▼                    │
│    status=paid      webhook →      operator approves         │
│    (manual)         status=paid    status=paid               │
│           │              │              │                    │
│           └──────────────┴──────────────┘                    │
│                          │                                   │
│                          ▼                                   │
│    Operator confirms payment at /admin/settings              │
│                          │                                   │
│                          ▼                                   │
│    registerDomain() → createARecord() → provisionDomain()   │
│    → attachSiteDomain() → "✅ domain live"                   │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1 — Beta access + Hostinger email (launch blocker)

### Email provider abstraction

`src/lib/server/email.ts` becomes provider-agnostic:

```typescript
type EmailProvider = 'smtp' | 'resend' | 'dev';

async function sendEmail(input: { to; subject; text }): Promise<EmailResult> {
	const provider = getSetting('EMAIL_PROVIDER') ?? 'dev';
	switch (provider) {
		case 'smtp':
			return sendViaSMTP(input);
		case 'resend':
			return sendViaResend(input); // existing logic
		default:
			return { sent: false, error: 'no provider' };
	}
}
```

**SMTP provider** (new, via `nodemailer`):

```typescript
import nodemailer from 'nodemailer';

async function sendViaSMTP(input): Promise<EmailResult> {
	const transporter = nodemailer.createTransport({
		host: getSetting('SMTP_HOST'), // smtp.hostinger.com
		port: Number(getSetting('SMTP_PORT')) ?? 465,
		secure: true, // 465 = SSL
		auth: {
			user: getSetting('SMTP_USER'), // noreply@saaskaya.digitaltamam.com
			pass: getSetting('SMTP_PASS')
		}
	});
	await transporter.sendMail({
		from: getSetting('EMAIL_FROM') ?? getSetting('SMTP_USER'),
		to: input.to,
		subject: input.subject,
		text: input.text
	});
	return { sent: true };
}
```

**New settings** (added to `SETTING_DEFS` in `config.ts`):

| Key              | Group | Secret | Help                                              |
| ---------------- | ----- | ------ | ------------------------------------------------- |
| `EMAIL_PROVIDER` | Email | no     | `smtp` / `resend` / unset=dev echo                |
| `SMTP_HOST`      | Email | no     | e.g. `smtp.hostinger.com`                         |
| `SMTP_PORT`      | Email | no     | `465` (SSL) or `587` (STARTTLS)                   |
| `SMTP_USER`      | Email | yes    | e.g. `noreply@saaskaya.digitaltamam.com`          |
| `SMTP_PASS`      | Email | yes    | mailbox password                                  |
| `BETA_ALLOWLIST` | Ops   | no     | comma-separated emails allowed during closed beta |

**Dependency:** `nodemailer` added to `package.json`.

### Beta access control

`src/lib/server/auth.ts` — `getOrCreateUser()` gains a beta gate:

```typescript
export function isBetaAllowed(email: string): boolean {
	const allowlist = getSetting('BETA_ALLOWLIST');
	if (!allowlist) return true; // no allowlist = open (post-beta)
	const list = allowlist
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	return list.includes(normalizeEmail(email));
}
```

`src/routes/login/+page.server.ts` — on submit, check `isBetaAllowed(email)` before sending the
magic link. If denied, return a friendly message:

> "saaskaya şu anda kapalı beta'dadır. Davetiye için operatörle iletişime geçin."

**Login UI** (`src/routes/login/+page.svelte`) — show a beta badge when `BETA_ALLOWLIST` is active:

> 🔒 Kapalı Beta — davetiyeyle giriş

### Phase 1 checklist

- [ ] `package.json` — add `nodemailer` dependency
- [ ] `src/lib/server/email.ts` — refactor to provider-agnostic `sendEmail()` + `sendViaSMTP()`
- [ ] `src/lib/server/config.ts` — add `EMAIL_PROVIDER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BETA_ALLOWLIST` to `SETTING_DEFS`
- [ ] `src/lib/server/auth.ts` — add `isBetaAllowed()` helper
- [ ] `src/routes/login/+page.server.ts` — gate magic-link creation on `isBetaAllowed()`
- [ ] `src/routes/login/+page.svelte` — beta badge + denied message
- [ ] `src/lib/server/email.test.ts` — unit test SMTP path (mock nodemailer) + provider switching
- [ ] `src/lib/server/auth.test.ts` — unit test `isBetaAllowed()` (allowlist set/unset, match/no-match)
- [ ] `docs/POLICY.md` — add "Beta Access Policy" section
- [ ] Verify: `npm run check`, `npm run test`, `npm run build`
- [ ] Log in `docs/PROGRESS.md`

## Phase 2 — Domain reservation + bank transfer

### New table: `domain_reservations`

```sql
CREATE TABLE domain_reservations (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  site_id       TEXT NOT NULL,
  domain        TEXT NOT NULL,           -- requested domain
  status        TEXT NOT NULL DEFAULT 'pending',
    -- pending | paid | registering | active | failed | cancelled
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
    -- bank_transfer | stripe | free
  price         TEXT,                    -- e.g. "15€" or "500₺"
  currency      TEXT DEFAULT 'EUR',
  operator_notes TEXT,
  created_at    TEXT NOT NULL,
  paid_at       TEXT,
  registered_at TEXT,
  updated_at    TEXT NOT NULL,
  UNIQUE(domain)                          -- one reservation per domain
);
```

Migration v4 in `src/lib/server/db/migrations.ts`.

### Reservation flow

`src/lib/server/billing.ts` — new functions:

```typescript
export function createReservation(input: {
	userId: string;
	siteId: string;
	domain: string;
	paymentMethod: PaymentMethod;
}): ReservationResult;

export function reportBankTransfer(reservationId: string, userId: string): void;
// user clicks "I made the transfer" → status stays pending, operator_notes += "user reported transfer"

export function confirmPayment(reservationId: string): void;
// operator-only: sets status=paid, triggers registration

export function rejectPayment(reservationId: string, reason: string): void;
// operator-only: sets status=cancelled
```

### Registration on confirmation

When the operator confirms payment (`confirmPayment`), the system runs the existing domain pipeline:

```typescript
async function fulfillReservation(reservationId: string): Promise<void> {
	const res = getReservation(reservationId);
	// 1. Register via Porkbun (existing)
	await registerDomain(res.domain);
	// 2. Point DNS at us (existing)
	await createARecord(res.domain);
	// 3. Provision nginx + TLS (existing)
	await provisionDomain(res.domain);
	// 4. Attach to the user's site (existing)
	attachSiteDomain(res.siteId, res.domain, res.userId);
	// 5. Mark active
	markReservationActive(reservationId);
}
```

All four steps use **existing functions** in `domains.ts` — no new domain logic needed.

### New API routes

| Route                               | Method | Purpose                                |
| ----------------------------------- | ------ | -------------------------------------- |
| `/api/billing/reserve`              | POST   | Create a domain reservation            |
| `/api/billing/reserve/[id]/report`  | POST   | User reports bank transfer made        |
| `/api/billing/reserve/[id]/confirm` | POST   | Operator confirms payment (admin gate) |
| `/api/billing/reserve/[id]/reject`  | POST   | Operator rejects (admin gate)          |

### Dashboard UI

`src/routes/dashboard/+page.svelte` — domain section gains a "Reserve a domain" flow:

```
┌────────────────────────────────────────────┐
│ 🌐 Domain rezervasyonu                     │
│                                            │
│ İstediğiniz domain:                        │
│ [avukatzeynep.com                    ]     │
│                                            │
│ Ödeme yöntemi:                             │
│ ( ) 🏦 Banka Havalesi — 15€ / 500₺         │
│ ( ) 💳 Kredi Kartı — 15€                   │
│ ( ) 🎁 Ücretsiz (beta davetiyesi)          │
│                                            │
│ [Rezerve et →]                             │
└────────────────────────────────────────────┘
```

After reservation (bank transfer path):

```
┌────────────────────────────────────────────┐
│ ⏳ avukatzeynep.com — ödeme bekleniyor      │
│                                            │
│ Banka Havalesi:                            │
│ TR12 3456 7890 1234 5678 90 12             │
│ Açıklama: avukatzeynep.com                 │
│ Tutar: 15€ (veya karşılığı 500₺)           │
│                                            │
│ [✓ Havale yaptım, bildir →]                │
│ [İptal et]                                 │
└────────────────────────────────────────────┘
```

### Admin UI

`src/routes/admin/settings/+page.svelte` — new "Pending payments" section:

```
┌────────────────────────────────────────────┐
│ ⏳ Bekleyen Ödemeler (3)                   │
│                                            │
│ avukatzeynep.com    | Banka Havalesi | 15€ │
│   User: zeynep@example.com                 │
│   Created: 2026-07-08                       │
│   [Onayla →]  [Reddet]  [Notlar]           │
│                                            │
│ dishekimdemir.com   | Banka Havalesi | 15€ │
│   User: demir@example.com                  │
│   [Onayla →]  [Reddet]                     │
└────────────────────────────────────────────┘
```

### Phase 2 checklist

- [ ] `src/lib/server/db/schema.ts` — `domain_reservations` table
- [ ] `src/lib/server/db/migrations.ts` — migration v4
- [ ] `src/lib/server/billing.ts` — `createReservation()`, `reportBankTransfer()`, `confirmPayment()`, `rejectPayment()`, `fulfillReservation()`
- [ ] `src/routes/api/billing/reserve/+server.ts` — **new** — create reservation
- [ ] `src/routes/api/billing/reserve/[id]/report/+server.ts` — **new** — user reports transfer
- [ ] `src/routes/api/billing/reserve/[id]/confirm/+server.ts` — **new** — operator confirms (admin gate)
- [ ] `src/routes/api/billing/reserve/[id]/reject/+server.ts` — **new** — operator rejects (admin gate)
- [ ] `src/routes/dashboard/+page.svelte` — domain reservation UI + payment method selector
- [ ] `src/routes/admin/settings/+page.svelte` — pending payments panel
- [ ] `src/lib/server/billing.test.ts` — unit tests: reservation lifecycle, bank transfer report, operator confirm/reject, fulfillment triggers registration
- [ ] `docs/POLICY.md` — "Domain Reservation & Bank Transfer Policy"
- [ ] Verify: `npm run check`, `npm run test`, `npm run build`
- [ ] Log in `docs/PROGRESS.md`

## Phase 3 — Stripe one-time domain payment (production transition)

### Stripe checkout for domains

`src/lib/server/billing.ts` — extend `createCheckoutSession()` to support one-time domain payments:

```typescript
export async function createDomainCheckoutSession(input: {
	userId: string;
	email: string;
	origin: string;
	domain: string;
	reservationId: string;
}): Promise<string> {
	// Stripe checkout with mode=payment (one-time, not subscription)
	// metadata.reservationId → webhook links back
}
```

### Webhook → auto-fulfill

`src/routes/api/billing/webhook/+server.ts` — handle `checkout.session.completed` for domain payments:

```typescript
if (event.type === 'checkout.session.completed') {
	const reservationId = object.metadata?.reservationId;
	if (reservationId) {
		await fulfillReservation(reservationId); // auto-register + attach
	}
}
```

### Phase 3 checklist

- [ ] `src/lib/server/billing.ts` — `createDomainCheckoutSession()` (one-time payment)
- [ ] `src/routes/api/billing/webhook/+server.ts` — domain payment → `fulfillReservation()`
- [ ] `src/routes/dashboard/+page.svelte` — Stripe payment button for domain reservation
- [ ] `src/lib/server/billing.test.ts` — webhook → fulfillment test
- [ ] `docs/POLICY.md` — "Stripe Domain Payment Policy"
- [ ] Verify: `npm run check`, `npm run test`, `npm run build`
- [ ] Log in `docs/PROGRESS.md`

## Payment method routing

`PAYMENT_MODE` setting controls which options are shown:

| `PAYMENT_MODE`             | Bank transfer | Stripe | Free (beta) |
| -------------------------- | :-----------: | :----: | :---------: |
| `bank_only` (beta default) |       ✓       |   —    |      ✓      |
| `hybrid`                   |       ✓       |   ✓    |      —      |
| `stripe_only` (production) |       —       |   ✓    |      —      |

## Constitution compliance

| Principle               | Status        | Notes                                                                                                        |
| ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| §1 One contract (Zod)   | ✅ unaffected | No schema changes to `Site`                                                                                  |
| §2 AI never writes HTML | ✅ unaffected | No AI changes                                                                                                |
| §3 Fixed component set  | ✅ unaffected | No block changes                                                                                             |
| §4 Token discipline     | ✅ unaffected | Gatekeeper spec is separate                                                                                  |
| §5 Domain after payment | ✅ compliant  | Bank transfer confirmed by operator **is** payment confirmation. Registration runs only after `status=paid`. |
| §6 Record decisions     | ✅            | This spec + `PROGRESS.md` entry                                                                              |
| §7 Verify               | ✅            | Unit tests + E2E checks per phase                                                                            |

**Non-goals check:** no WordPress clone, no plugin system, no arbitrary code, no free-form builder.
This spec only adds access control, email provider switching, and payment/registration orchestration.

## Risks and mitigations

| Risk                                                      | Mitigation                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Hostinger SMTP rate limits                                | Resend fallback is one setting away; SMTP is for low-volume beta only                          |
| Bank transfer disputes / no-proof                         | `operator_notes` field + manual confirmation gate; user can't self-confirm                     |
| Domain already taken between reservation and registration | Porkbun `checkDomainAvailability()` re-checked at fulfillment; if taken, refund/reschedule     |
| Operator forgets to confirm payment                       | Dashboard shows pending count; daily cron could email `ALERT_EMAIL` with pending list (future) |
| Beta allowlist blocks a legitimate user                   | Operator can add email to `BETA_ALLOWLIST` in `/admin/settings` live                           |
| nodemailer adds bundle size                               | Server-only import (`$lib/server`); never shipped client-side                                  |

## Verification

- **Phase 1:** magic link sent via Hostinger SMTP → user clicks → session created. Beta-denied email
  gets friendly rejection. `EMAIL_PROVIDER=resend` switch works without code change.
- **Phase 2:** user reserves domain → reports bank transfer → operator confirms → domain registered +
  site live on custom domain. Cancel at any stage leaves no side effects.
- **Phase 3:** Stripe checkout for domain → webhook → auto-fulfillment. No operator action needed.
- All phases: `npm run check`, `npm run test`, `npm run build` pass.
- Log each phase in `docs/PROGRESS.md`.

## Open questions

- Exact domain pricing (€15? €20? includes 1-year registration?).
- Bank account details (IBAN, account holder) — operator-provided, shown in UI.
- Should beta invitees get 1 free domain or just free AI usage?
- Should `BETA_ALLOWLIST` support wildcards (`*@lawfirm.com`) or profession tags?
- When to switch `PAYMENT_MODE` from `bank_only` to `hybrid` to `stripe_only`?
