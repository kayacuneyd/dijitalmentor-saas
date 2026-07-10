# Public Site Acquisition + Support Roadmap

> Date: 2026-07-10
>
> Status: planned — implementation starts only after explicit approval
>
> Source request: improve saaskaya public UX, navigation, footer, SEO/GEO, language switcher,
> contact/blog surfaces, and visitor messaging/admin response flow.

## Goal

Make `saaskaya.com` feel like a complete SaaS/product website, not only an application shell:

> A visitor can understand the product, compare pricing, navigate clearly, read trust/content pages,
> contact the operator, and leave a message from any public page. The operator can track and answer
> those messages from the admin console.

This roadmap is split into two deliverables:

1. **Deliverable A — Public Site Foundation**
2. **Deliverable B — Messaging System**

The split is intentional. Deliverable A improves acquisition, trust, navigation, and SEO without
changing data workflows. Deliverable B introduces a real message/inbox workflow and therefore needs
schema, rate-limit, email, and admin-console changes.

## Constraints

- Preserve the Zod `Site` contract rule: AI-generated tenant sites still use structured schema data,
  never raw HTML/CSS.
- Preserve current i18n routing: English default, locale-prefixed public routes `/en`, `/tr`, `/de`.
- Keep legal pages linked but do not claim legal finality; they remain operational drafts pending
  legal/accounting review.
- Do not build a CMS for the marketing site in this milestone. Blog content can be file/static-data
  driven first.
- Avoid a one-note landing palette or oversized marketing-card layout. Public pages should feel more
  complete, but still restrained and product-focused.
- Any new visitor form must be rate-limited and must not leak admin/support emails or secrets.

## Current Problems To Address

1. `/pricing` lacks obvious navigation to other public pages.
2. Landing CTA placement may be suboptimal; the “Bereit?” / ready section likely appears too late.
3. There is no proper public contact page.
4. There is no blog/content surface.
5. SEO and GEO/local trust setup are incomplete.
6. Language switcher active state is too opaque: active button becomes black and does not clearly
   communicate the selected language.
7. Public footer is missing; legal, product, company, and account links need a standard location.
8. There is no scroll-to-top affordance.
9. There is no public chat/contact bubble, and public inquiries are not manageable from admin.
10. Public page width may need a controlled expansion similar to the admin console width adjustment.

## Deliverable A — Public Site Foundation

### Purpose

Raise the public website quality and conversion baseline before adding a richer messaging system.

### Scope

#### 1. Public Shell And Width

Create or refine shared public layout components, likely:

- `src/lib/ui/PublicShell.svelte` or existing public shell equivalents.
- `src/lib/ui/PublicHeader.svelte`
- `src/lib/ui/PublicFooter.svelte`
- `src/lib/ui/ScrollToTop.svelte`

Implementation principles:

- Public pages should use controlled wider containers where useful, similar in spirit to the admin
  console width increase, but not blindly apply one width to every content type.
- Landing and templates can be wider.
- Legal/article copy should stay narrower for readability.
- Mobile must keep zero horizontal overflow.

Acceptance:

- `/en`, `/tr`, `/de`, pricing, templates, contact/about/blog pages share consistent navigation.
- Desktop public shell is visibly less cramped than before where content benefits from width.
- Browser checks show horizontal overflow `0` on mobile and desktop.

#### 2. Public Navigation

Standardize header navigation across public pages:

- Home
- Pricing
- Templates
- Blog
- Contact
- Login
- Start / Beta CTA

Rules:

- All links must be locale-aware through `withLocale(locale, path)`.
- `/pricing` must no longer be a dead end; it should show a full header/footer and clear CTA.
- On mobile, navigation can collapse or wrap, but it must remain usable without overlapping text.

Acceptance:

- `/en/pricing`, `/tr/pricing`, and `/de/pricing` expose links back to Home, Templates, Blog,
  Contact, Login/Start.
- Header active/current page state is understandable and accessible.

#### 3. Language Switcher

Improve `src/lib/ui/LanguageSwitcher.svelte`.

Current issue:

- Active language uses black background and may look like an unlabeled/ambiguous flag control.

Target:

- Always show readable labels: `EN`, `TR`, `DE`.
- Optional language names in tooltip/title remain.
- Active state should be visible but less dominant than a black pill, e.g. light selected background,
  border, or subtle filled state.
- Keep `aria-current="true"` for active locale.

Acceptance:

- The active language is readable on light/dark states.
- Active language remains obvious without relying only on color.
- Mobile screenshots show labels fit inside controls.

#### 4. Footer

Add a proper public footer on all public marketing pages.

Suggested columns:

- **Product**
  - Home
  - Pricing
  - Templates
  - Start / Beta
- **Company**
  - About
  - Blog
  - Contact
- **Legal**
  - Privacy
  - Terms
  - KVKK
  - Refund
  - Disclaimer
  - Acceptable Use
- **Account**
  - Login
  - Dashboard

Bottom attribution:

```text
Built & developed in Kornwestheim by Cüneyt Kaya with love
```

`Cüneyt Kaya` links to `https://kayacuneyt.com`.

Localization:

- Footer headings/link labels should be localized EN/TR/DE.
- The attribution can remain English or be lightly localized, but the name/link must remain exact.

Acceptance:

- Footer appears on Home, Pricing, Templates, About, Blog, Contact.
- Footer legal links route through the active locale when the app supports that route.
- Attribution is present and link opens `https://kayacuneyt.com`.

#### 5. Landing CTA And Section Order

Review the landing page structure, especially the “Bereit?” / ready section.

Working hypothesis:

- A ready/CTA section only at the bottom is too late.
- The landing page should include an earlier conversion moment after core value proof.

Implementation options:

- Move the existing ready section upward after the product/process proof.
- Or keep final ready section and add a shorter mid-page CTA with different copy.

Avoid:

- Repeating the exact same CTA twice.
- Making the page feel like a generic hero/CTA stack without product proof.

Acceptance:

- Landing page has a clear early path to `/beta` or `/new`.
- Final CTA remains useful but does not carry all conversion responsibility.
- EN/TR/DE copy stays coherent.

#### 6. New Public Pages

Add public pages:

- `/about`
- `/contact`
- `/blog`
- `/blog/[slug]`

Locale behavior:

- Public localized routes should support `/en/about`, `/tr/about`, `/de/about`, etc.
- If blog content is initially English-only, show localized chrome and either localized summaries or a
  clear content-language strategy. Prefer at least short EN/TR/DE starter content for launch polish.

About page responsibilities:

- Explain saaskaya in non-technical language.
- Clarify target customer: professionals/small businesses needing multilingual websites.
- Explain why it is not just an “AI wrapper”: controlled output, fixed components, validation,
  publishing and support workflow.
- Include Kornwestheim/Germany and founder/operator trust signal.

Contact page responsibilities:

- Provide a structured public contact form.
- Clarify response expectation.
- Offer categories:
  - Beta access
  - Support
  - Partnership
  - Billing
  - Other
- The contact form backend can be delivered in Deliverable B. In Deliverable A, the page can ship with
  a placeholder only if B is scheduled immediately; otherwise implement minimum viable submission in B
  before public CTA is emphasized.

Blog responsibilities:

- Static blog index and article route.
- Initial article candidates:
  - “What is AI-assisted website building?”
  - “Why small businesses need multilingual websites”
  - “How saaskaya helps professionals launch faster”
- Keep posts concise and acquisition-oriented, not engineering-heavy.

Acceptance:

- New pages return 200 in all supported locale paths.
- Public header/footer links include these pages.
- Blog article pages have valid title/description/canonical metadata.

#### 7. SEO, GEO, And Social Metadata

Add platform-level SEO for public pages.

Required:

- Localized `title` and `description` per public route.
- Canonical URLs.
- `hreflang` alternates:
  - `en`
  - `tr`
  - `de`
  - `x-default`
- Open Graph tags.
- Twitter card tags.
- Updated sitemap including localized public pages and blog posts.
- Robots check.

Structured data:

- `Organization`
- `WebSite`
- `SoftwareApplication`
- `ContactPage`
- `BlogPosting` for articles

GEO/local trust:

- Kornwestheim, Germany in footer/about/contact where appropriate.
- Founder/operator attribution.
- Avoid overstating local business details that are not legally finalized.

Acceptance:

- `curl`/HTML checks confirm canonical/hreflang/OG on Home, Pricing, Contact, Blog article.
- `/sitemap.xml` contains localized public pages and blog posts.
- JSON-LD parses as valid JSON in page source.

#### 8. Scroll-To-Top Button

Add a left-bottom scroll-to-top control.

Rules:

- Appears after the user scrolls down.
- Left-bottom so it does not conflict with future chat bubble.
- Keyboard accessible.
- Uses an icon or compact symbol with accessible label.

Acceptance:

- Visible after scroll on long public pages.
- Does not overlap footer links or chat bubble.
- Works on mobile and desktop.

### Deliverable A Verification

Required checks:

- `npm run check`
- `npm test`
- `npm run build`
- `npm run deploy:production`
- `node scripts/smoke-production.mjs`
- Browser checks mobile + desktop for:
  - Home
  - Pricing
  - Templates
  - About
  - Contact
  - Blog index
  - One blog article
- Assert:
  - status 200
  - no horizontal overflow
  - footer present
  - language switcher visible/readable
  - canonical/hreflang present on selected pages

### Deliverable A Exit Gate

Deliverable A is done when:

1. Public navigation is consistent and pricing is no longer a dead end.
2. Footer exists with product/company/legal/account links and Kornwestheim/Cüneyt Kaya attribution.
3. Language switcher is readable and active state is clear.
4. About, Contact, Blog, and Blog article routes exist.
5. SEO/hreflang/sitemap/JSON-LD basics are implemented.
6. Scroll-to-top works without conflicting with layout.
7. Mobile and desktop browser checks pass.

## Deliverable B — Messaging System

### Purpose

Let visitors contact saaskaya from public pages and let the operator track/respond from the admin
console.

### Scope

#### 1. Message Model

Reuse or extend existing support concepts where possible, but avoid forcing anonymous visitors into
the same shape as authenticated customer tickets if it creates confusion.

Recommended model:

- Add public inquiry records, or extend support tickets with a source/type.
- Keep a unified admin Inbox view.

Likely schema:

```text
inquiries
  id
  source              contact | chat
  email
  name
  category
  status              open | pending | resolved | closed
  user_id             nullable
  created_at
  updated_at
  last_message_at
  last_message_by     visitor | admin

inquiry_messages
  id
  inquiry_id
  author_kind         visitor | admin
  author_email
  body
  created_at
```

Alternative:

- Reuse `support_tickets` and `support_ticket_messages` with nullable user/customer fields and a
  `source` column. Choose this only if it stays clean in admin and tests.

Acceptance:

- Public visitor can submit without an account.
- Authenticated user submissions can be associated with user id.
- No raw secrets or excessive metadata stored.

#### 2. Contact Form Backend

Implement `/contact` form submission.

Fields:

- name
- email
- category
- message

Validation:

- email format
- body min/max length
- category allowlist
- rate limit by IP/email

Behavior:

- Store inquiry/thread.
- Send notification to operator using existing email provider path.
- Show success state without exposing whether email notification succeeded.

Acceptance:

- Valid contact form creates an inquiry.
- Invalid form returns inline error.
- Rate limit returns user-friendly error.
- Operator notification is best-effort and logs failures safely.

#### 3. Chat Bubble

Add a right-bottom chat/contact bubble on public pages.

Requirements:

- Visible on public marketing pages.
- Does not appear on admin/editor surfaces.
- Does not overlap scroll-to-top.
- Opens a compact panel with name/email/message/category.
- If logged in, email can prefill when available.
- Same backend/thread model as contact page.

UX:

- Keep it lightweight; this is not real-time chat initially.
- Copy should set expectation: “Send a message; we will reply by email.”
- Show success state after submission.

Acceptance:

- Bubble opens/closes on mobile and desktop.
- Form submits and creates inquiry.
- No horizontal overflow.
- Does not cover important CTA/footer content.

#### 4. Admin Inbox

Add or adapt admin console navigation.

Option A:

- Rename/expand current Support to Inbox.
- Filter tabs:
  - All
  - Customer support
  - Contact form
  - Chat
  - Open
  - Pending
  - Resolved

Option B:

- Keep Support for authenticated customer tickets.
- Add Inbox for public inquiries.

Recommended:

- If data model stays clean, use **Inbox** as unified admin messaging.
- Existing support routes can redirect or be nested under Inbox later, but avoid breaking links in the
  first pass if not necessary.

Inbox list:

- subject/category/source
- email/name
- status
- last message date
- unread/new indicator if cheap

Thread detail:

- full message history
- status controls
- admin reply textarea
- reply sends email to visitor/customer
- thread stores admin reply

Acceptance:

- Admin can view contact/chat inquiries.
- Admin can reply.
- Reply persists and sends email.
- Status can be updated.
- Existing customer support tickets still work.

#### 5. Email Notifications

Use existing `src/lib/server/email.ts` provider seam.

Notifications:

- New inquiry → operator alert email.
- Admin reply → visitor email.

Settings:

- Use existing `ALERT_EMAIL` for operator notifications unless a clearer dedicated setting is needed.
- Do not store or display secrets.

Acceptance:

- Notification send is best-effort.
- Failure does not lose stored inquiry.
- Logs do not include sensitive tokens.

#### 6. Spam And Abuse Controls

Required:

- IP-based rate limit.
- Email/body max lengths.
- Basic honeypot hidden field if cheap.
- Do not allow HTML rendering in admin replies/messages without escaping.

Nice-to-have:

- Mark scanner/noise submissions separately later.
- Add captcha only if abuse appears; avoid adding third-party friction prematurely.

Acceptance:

- Repeated submissions trip rate limit.
- Admin UI renders message content as text, not HTML.

### Deliverable B Verification

Required checks:

- `npm run check`
- `npm test`
- targeted tests for validation, DB writes, rate limits, admin reply
- `npm run build`
- `npm run deploy:production`
- production smoke
- controlled live flow:
  1. submit contact form with test address
  2. submit chat bubble message with test address
  3. admin sees both
  4. admin replies to one
  5. stored thread includes reply
  6. notification path logs/sends as expected
  7. cleanup test rows if needed

### Deliverable B Exit Gate

Deliverable B is done when:

1. Contact page form creates a stored inquiry and notifies the operator.
2. Chat bubble creates a stored inquiry and notifies the operator.
3. Admin can list, filter, read, reply, and resolve messages.
4. Admin replies are stored and emailed.
5. Abuse controls are in place.
6. Mobile/desktop UI checks pass.

## Recommended Implementation Order

### Step 1 — Deliverable A foundation

1. Public shell/header/footer.
2. Language switcher polish.
3. Pricing navigation fix.
4. Landing CTA order adjustment.
5. About/contact/blog static routes.
6. SEO/hreflang/sitemap/JSON-LD.
7. Scroll-to-top.
8. Browser + production verification.

### Step 2 — Deliverable B messaging

1. Schema/migration + server helper.
2. Contact form backend.
3. Chat bubble UI/backend.
4. Admin inbox/list/detail/reply.
5. Email notifications.
6. Spam/rate limit tests.
7. Controlled live messaging smoke.

## Risks And Decisions

### Decision: blog source

Initial recommendation: static TypeScript/Markdown-like content module. Avoid CMS until real content
workflow exists.

### Decision: contact backend timing

If Deliverable A ships before Deliverable B, contact page must not promise full messaging workflow.
Prefer implementing Deliverable B soon after A so Contact can be real.

### Risk: legal/footer trust copy

Footer and about copy can mention Kornwestheim and founder/developer attribution, but business/legal
claims should remain conservative until legal/accounting review.

### Risk: chat bubble expectation

Call it “message us” or “send a message,” not “live chat,” unless real-time response expectations can
be met.

### Risk: admin support confusion

Existing customer support and public inquiries may overlap. The admin UX must make source and identity
clear so public leads are not confused with logged-in customer support requests.

## Definition Of Done For The Full Roadmap

The full roadmap is complete when:

- Public pages have a consistent header/footer/layout.
- Visitors can navigate between all major public surfaces from any public page.
- Language switcher is readable and accessible.
- About, Contact, Blog, and Blog article routes exist.
- SEO/GEO basics are verifiably present.
- Scroll-to-top and chat bubble coexist without overlap.
- Contact/chat messages are persisted, visible in admin, replyable, and email-backed.
- All changes pass check, tests, build, atomic deploy, production smoke, and targeted browser checks.
