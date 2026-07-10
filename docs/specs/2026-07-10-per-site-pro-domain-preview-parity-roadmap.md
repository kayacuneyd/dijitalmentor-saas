# Per-Site Pro, Private Domain Cost Control, Site Identity, And Preview/Publish Parity Roadmap

> Date: 2026-07-10
>
> Status: planned — implementation starts only after explicit approval
>
> Source request: change Pro from user-level to site-level, hide domain wholesale cost checks from
> customers, move public price to 17€/month, let users edit site identity/subdomain before preview and
> publish, diagnose preview vs published mismatch, and redesign the public hero.

## Goal

Make the commercial and publishing model match the product reality:

> A user creates a site draft, previews it, names it, chooses a readable saaskaya subdomain, publishes
> it on that subdomain, and only activates **Pro for that specific site** when they want custom-domain
> service. Domain cost checks stay internal so the business never exposes margin-sensitive provider
> details to the customer.

This roadmap replaces the confusing "Pro user" mental model with **Pro site**.

## Decisions

1. **Public Pro price is 17€/month.**
   - Public copy should say `17€/month per published site`.
   - Domain registration/renewal remains a separate operational cost, but the customer must not see
     provider wholesale estimates like `9-12 USD/year`.

2. **Domain availability and cost are an internal gate.**
   - The user enters a desired custom domain.
   - The system checks availability/provider cost internally.
   - The user sees only one of:
     - `This domain is available. Continue with Pro for this site.`
     - `This domain is not available. Try another name.`
     - `This domain needs manual review. We will contact you.`
   - Provider cost, purchase margin, and registrar response details stay admin-only.

3. **Pro is site-scoped, not account-scoped.**
   - A user can own multiple sites.
   - Each site can independently be Free, Published Free/Subdomain, Pro Active, Pro Grace, or Pro
     Lapsed.
   - Paying Pro for one site must not unlock custom-domain features for another site.

4. **Free export should be removed from the default Free promise.**
   - Free can allow preview, editing, and subdomain publishing.
   - Full data export/portability is a Pro capability, or an operator-controlled grace/cancellation
     escape hatch.
   - Reason: a full export can be used to host elsewhere, so it belongs in the paid ownership story.

5. **Site identity must be editable before both preview and publish.**
   - `siteName` is the human/display name.
   - A new public handle/subdomain field should be introduced separately from immutable internal
     `site.id`.
   - Random internal ids like `site-ca7a4be4` should not be the default customer-facing URL once the
     user names the site.

6. **Preview and published output must be provably identical for the same snapshot, locale, and route.**
   - Editor iframe live-preview, shareable `/preview/...` URLs, and public subdomain routes must be
     treated as separate surfaces and verified explicitly.

## Current Findings

### Billing Model Finding

Current code keeps subscription state on the `users` table:

- `users.subscriptionStatus`
- `users.subscriptionEndsAt`
- `users.stripeCustomerId`

This means paid access is currently user-scoped. That is exactly the mismatch:

> If a user has more than one site, the system cannot clearly answer which site the Pro subscription
> belongs to.

### Domain Flow Finding

Current reservation flow stores domain reservations by `siteId`, which is good:

- `domain_reservations.site_id`
- `domain_reservations.domain`
- `domain_reservations.status`

But paid subscription access is still checked by user:

- `hasActiveSubscription(user.id)`
- `requirePaidDomainAccess(user)`

So the system is halfway between a site-scoped domain flow and a user-scoped billing flow.

### Site Identity Finding

`site.settings.siteName` is editable in the editor Settings tab, but:

- it is not prominent before first preview/publish,
- it is not part of a dedicated pre-publish confirmation step,
- it does not control the public subdomain,
- the current public subdomain is based on internal `site.id`, e.g. `site-ca7a4be4.saaskaya.com`.

This makes the product feel random even when the generated content is acceptable.

### Preview/Published Parity Finding

The rendering architecture is correct in principle:

- `/preview/[siteId]` renders the current draft.
- public tenant routes render the immutable published snapshot from `site_versions`.
- both use `SiteRenderer`.

For the reported site:

- site id: `site-ca7a4be4`
- published version: `1`
- draft and published v1 have matching core fields in production DB:
  - `settings.siteName`: `Cüneyt Ayakkabı Tamircisi`
  - `theme.preset`: `law`
  - `theme.colors.primary`: `#8B4513`
  - first page title TR: `Cüneyt Ayakkabı Tamircisi`
  - hero headline TR: `Cüneyt Usta'dan Ayakkabı Tamiri`

So this specific database check does **not** show a different draft being published. The likely causes
are:

1. **Locale mismatch in the comparison.**
   - User preview URL was TR:
     `/preview/site-ca7a4be4/home?locale=tr`
   - Published URL shown was DE:
     `https://site-ca7a4be4.saaskaya.com/de?v=1`
   - Same site can look/copy-read differently across locales.

2. **Editor iframe live-preview vs shareable preview URL mismatch.**
   - The editor iframe can receive an unsaved draft via `postMessage`.
   - The shareable `/preview/...` route loads only the persisted DB draft.
   - If autosave/flush has not completed, what the user sees in the editor can differ from the
     shareable preview URL and from the published snapshot.

3. **Dashboard publish path can still publish without the current draft body.**
   - Editor publish API flushes and sends `{ draft }` in the request body.
   - Dashboard form action still calls `publishDraft(siteId)` directly.
   - If the user publishes from dashboard while edits are not fully saved, it can snapshot stale DB
     state.

4. **Niche/preset mismatch.**
   - The site content is for a shoe repair business, but the generated theme preset is `law`.
   - Even if preview/publish are technically identical, the design can feel unrelated because the
     fixed preset library currently targets lawyers, psychologists, and dentists, not general local
     trades.

## Deliverable A — Commercial Model Correction

### A1. Pricing Copy And Public Product Language

Change all public plan language from account-level Pro to site-level Pro.

Required copy direction:

- `Pro site`
- `17€/month per published site`
- `Custom domain is available on Pro sites`
- `Domain registration is handled after payment and internal approval`

Avoid:

- `Pro user`
- `Pro account unlocks all sites`
- public wholesale domain cost ranges
- wording that implies the platform will buy every available domain regardless of cost

Acceptance:

- Pricing page says 17€/month.
- Free plan no longer advertises full data export.
- Pro feature matrix is explicitly per site.
- About/contact/dashboard copy does not imply one account-level Pro covers all websites.

### A2. Data Export Entitlement

Reclassify exports:

- Free:
  - no full production export in public feature matrix,
  - optional internal/admin export remains available for support and legal compliance.
- Pro:
  - full site data export,
  - cancellation/grace export window can remain as policy.

Implementation options:

1. Gate `GET /api/sites/[siteId]/export` behind site-level Pro.
2. Keep export available to admins regardless of site plan.
3. For lapsed Pro, allow export during the grace window.

Acceptance:

- Free users do not see `Data export` as a selling point.
- Export endpoint does not become an easy Free off-platform hosting path.
- Policy docs and dashboard UI explain export accurately.

### A3. Site-Scoped Subscription Schema

Introduce a site entitlement table instead of relying only on `users.subscriptionStatus`.

Recommended table:

```text
site_subscriptions
  id
  site_id
  user_id
  provider              stripe | creem | manual
  provider_customer_id
  provider_subscription_id
  status                active | trialing | past_due | canceled | expired | comped
  price_eur_monthly     17
  current_period_end
  grace_until
  created_at
  updated_at
```

Transitional rules:

- Keep existing user subscription columns temporarily for backward compatibility.
- New purchases must create/update a `site_subscriptions` row.
- Paid feature checks should move from `hasActiveSubscription(user.id)` to
  `hasActiveSiteSubscription(siteId, userId)`.

Acceptance:

- A user can have Site A Pro and Site B Free.
- Custom-domain attach/register checks a specific `siteId`.
- Dashboard displays plan state per site card.
- Admin customer view shows site-level paid state.

### A4. Checkout Context

Checkout must be opened with a concrete `siteId`.

Required metadata:

```text
kind=site_subscription
siteId=<site id>
userId=<user id>
plan=pro
price=17 EUR/month
```

Provider-specific notes:

- Stripe/Creem webhook must activate the matching `site_subscriptions` row.
- One-time domain payment metadata must remain separate from subscription metadata.
- Webhook routing must not confuse domain payment with site subscription activation.

Acceptance:

- Checkout cannot start without a manageable site.
- Webhook activation is idempotent per provider subscription id.
- Paying for one site does not affect another.

## Deliverable B — Domain Flow Without Customer-Facing Wholesale Cost

### B1. Internal Availability And Margin Gate

Domain lookup flow:

1. User enters domain.
2. Server validates syntax.
3. Server checks:
   - reservation conflicts,
   - provider availability,
   - internal wholesale cost threshold,
   - risky/unsupported TLD policy.
4. Server returns a customer-safe result.

Customer-visible states:

- available:
  - `This domain is available. Continue with Pro for this site.`
- unavailable:
  - `This domain is not available. Try another name.`
- manual_review:
  - `This domain needs manual review. We will contact you.`

Admin/internal states:

- provider available/unavailable,
- wholesale cost,
- registrar,
- TLD,
- margin decision,
- API error details.

Acceptance:

- Customer never sees `9-12 USD/year` or provider cost.
- Expensive domains are blocked or routed to manual review.
- Admin can see why a domain was blocked.

### B2. Domain + Pro Activation Sequence

Target user flow:

1. Site draft exists.
2. User edits site name and subdomain handle.
3. User publishes on saaskaya subdomain.
4. User enters custom domain.
5. Domain passes internal gate.
6. User starts Pro checkout for that specific site.
7. Payment succeeds.
8. System creates/updates site-level Pro subscription.
9. Domain registration/attachment runs after payment.
10. Site remains live on subdomain even if domain setup is pending.

Acceptance:

- Domain registration never runs before payment.
- Pro activation is site-specific.
- Domain setup failure does not lose the published subdomain.
- Customer gets clear status: pending, registering, connected, manual review, failed.

## Deliverable C — Site Name And Subdomain Handle

### C1. Separate Internal Id From Public Handle

Current internal id examples:

- `site-ca7a4be4`

This should remain internal and immutable. Add a customer-facing public handle:

```text
sites.public_handle
```

Rules:

- lower-case,
- `a-z`, `0-9`, `-`,
- length limits,
- reserved words blocked (`admin`, `api`, `www`, `mail`, `support`, etc.),
- globally unique,
- editable before first publish,
- after publish: changing handle should create a redirect or require explicit confirmation.

Acceptance:

- User can change `site-ca7a4be4.saaskaya.com` to e.g. `cuneyt-ayakkabi.saaskaya.com`.
- Internal `site.id` remains stable for DB relationships.
- Host routing resolves by `public_handle` as well as custom domain.

### C2. Pre-Publish Identity Step

Before first publish, show a confirmation step:

- Site name
- Public subdomain handle
- Default language
- Enabled languages
- Contact email
- Preview link

Required behavior:

- Site name and handle can be edited inline.
- Handle availability is checked before publish.
- Publish is blocked until handle is valid.
- Copy clarifies that custom domain is a Pro step later.

Acceptance:

- User does not publish with a random generated public URL unless they explicitly accept it.
- Preview and dashboard show the same site name.
- Public subdomain is understandable and editable.

## Deliverable D — Preview/Publish Parity Fix

### D1. Canonical Preview Endpoint

Define one canonical comparison surface:

```text
/preview/[siteId]/[page]?locale=<locale>&source=persisted
```

The editor iframe can still use postMessage live draft, but the UI must label it as live draft.

Required labels:

- Editor iframe: `Live draft`
- Open preview URL: `Saved preview`
- Public site: `Published vN`

Acceptance:

- Users understand which snapshot they are looking at.
- Support/debugging can ask for the exact snapshot surface.

### D2. Force Flush Before Every Publish Path

Unify publish behavior:

- Editor publish already flushes and sends `{ draft }`.
- Dashboard publish must either:
  - redirect user to editor/pre-publish confirmation, or
  - call a server-side stale-snapshot guard and refuse publish when draft was recently edited.

Recommended:

- Remove direct dashboard first-publish.
- Replace with `Review & publish` link to editor/pre-publish confirmation.
- Keep dashboard `Republish latest saved draft` only for already-published sites, with a clear warning.

Acceptance:

- No publish path can snapshot stale state silently.
- Unit test covers dashboard publish cannot bypass parity rules.

### D3. Snapshot Parity Test

Add a server/browser verification helper:

For a given `siteId`, `locale`, and `pageSlug`:

1. Load persisted preview HTML.
2. Publish.
3. Load public subdomain HTML for the same locale/page/version.
4. Compare normalized structural markers:
   - title,
   - site name,
   - theme preset/class markers,
   - section ids/types/order,
   - hero headline,
   - primary colors,
   - nav labels.

Acceptance:

- A regression test fails if preview and published diverge for the same saved snapshot.
- Production smoke includes at least one real generated-site parity check.

### D4. Locale Comparison Guard

The UI should avoid accidental TR-preview vs DE-live comparisons.

Required:

- From preview, `Open live site` should preserve the current locale.
- From published site, `Open preview`/debug links should preserve locale.
- Dashboard live links should use the site's default locale unless user selects another.

Acceptance:

- If preview is `?locale=tr`, live link opens `/` or `/tr` equivalent, not `/de`.
- QA instructions always compare the same locale.

## Deliverable E — Preset Fit And Out-Of-Niche Businesses

The reported test site is a shoe repair business, but the generated site uses `law` preset. This is
not a preview/publish bug; it is a product-fit/preset selection issue.

Options:

1. Keep launch scope strict:
   - If the profession is outside lawyer/psychologist/dentist, show a friendly "not supported yet"
     path or route to manual review.
2. Add a `local_services` controlled preset later:
   - shoe repair, trades, small local services.
   - Requires constitution discussion because current non-goal says launch presets are limited.

Recommended for now:

- Do not silently map unsupported professions to `law`.
- Add an onboarding gate:
  - supported niche → continue automated generation,
  - unsupported niche → manual beta review/waitlist.

Acceptance:

- A shoe repair request is not rendered with a lawyer-looking preset unless the operator knowingly
  enabled a broader local-services preset.
- User expectations stay aligned with launch scope.

## Deliverable F — Landing Hero Redesign

The current desktop hero has layout issues:

- oversized H1 creates awkward line breaks,
- brand mark repeats too prominently under the nav,
- animation is vertically detached from the text,
- left text column and right animation do not share a clear baseline,
- overall composition feels unpolished.

Target redesign:

- Remove duplicate large brand mark from hero.
- Shorten H1.
- Use a controlled two-column desktop grid:
  - left: compact headline, lead, CTA, trust line,
  - right: product preview/flow animation aligned near the top.
- Keep mobile single-column.
- Make the animation read as product evidence, not a decorative floating block.

Candidate H1 copy:

- EN: `Launch a multilingual website for your practice without code.`
- TR: `Pratiğin için çok dilli web siteni kod yazmadan yayına al.`
- DE: `Starte eine mehrsprachige Website für deine Praxis ohne Code.`

Acceptance:

- Desktop 1440, laptop 1280, and mobile 375 screenshots look balanced.
- No horizontal overflow.
- CTA visible above the fold.
- Animation and text are aligned and visually related.

## Implementation Order

### Phase 1 — Copy And Pricing Safety

1. Change public price to 17€/month.
2. Rewrite Free/Pro matrix as site-scoped.
3. Remove Free data export promise from public UI.
4. Remove customer-visible domain cost estimates.
5. Update docs/policy copy where needed.

Why first:

- Fastest way to stop promising the wrong business model.
- No risky schema migration yet.

### Phase 2 — Site Identity And Publish Parity

1. Add pre-publish identity confirmation UI.
2. Add/edit public subdomain handle field.
3. Route public subdomains by handle.
4. Remove or restrict direct dashboard publish.
5. Add preview/published parity checks.

Why second:

- Fixes the concrete user experience pain: random URLs and preview/live confusion.

### Phase 3 — Site-Scoped Pro Entitlements

1. Add `site_subscriptions`.
2. Move paid feature checks to `siteId`.
3. Update checkout metadata and webhooks.
4. Update dashboard/admin views.
5. Migrate existing user-level Pro state manually or with a one-time operator mapping.

Why third:

- It is the biggest data model change and should land after the UI/product language is already clear.

### Phase 4 — Domain Gate

1. Add internal provider-cost threshold setting.
2. Add customer-safe availability response.
3. Add admin-visible domain decision logs.
4. Connect domain registration only after site-level Pro payment succeeds.

Why fourth:

- It depends on site-scoped Pro entitlement.

### Phase 5 — Hero Redesign

1. Redesign landing hero.
2. Shorten localized copy.
3. Reposition flow animation.
4. Verify desktop/laptop/mobile screenshots.

Why fifth:

- Can be implemented independently, but should use the corrected product message from Phase 1.

## Verification Plan

Required commands:

- `npm run check`
- `npm test`
- `npm run build`

Required browser checks:

- Pricing page:
  - shows 17€/month,
  - says per published site,
  - does not advertise Free data export,
  - does not reveal provider domain cost.
- Dashboard:
  - each site card shows site-specific status,
  - random internal id is not the primary public identity,
  - publish path requires identity confirmation.
- Preview/publish parity:
  - same site, same page, same locale,
  - saved preview and public vN match structural markers.
- Hero:
  - desktop 1440,
  - laptop 1280,
  - mobile 375,
  - no overflow and no awkward text/animation disconnection.

Production checks after deployment:

- `npm run deploy:production`
- `node scripts/smoke-production.mjs`
- one real generated site parity smoke.

## Open Questions

1. Should Free users be allowed to publish on a saaskaya subdomain indefinitely, or should Free
   published sites have tighter limits?
2. Should public subdomain handle changes after first publish create redirects, or should they be
   blocked unless unpublished?
3. Should unsupported professions be blocked at onboarding, or routed to manual beta review?
4. Should domain annual renewal be bundled into the 17€/month price for selected low-cost TLDs, or
   billed separately as a transparent annual line item without exposing wholesale cost?
5. What is the exact Pro credit limit per site at 17€/month?
