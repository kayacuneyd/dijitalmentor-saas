# Product Vision & Roadmap v2 — saaskaya

This document updates the post-M6 product direction. The original M0-M6 plan proved the technical
heart: schema-safe AI generation, editor, publish, billing/domain seams, and operations. v2 defines
the product we now want to sell: an impressive AI-first website platform that feels like "the AI
version of WordPress" to buyers, while staying safer and more controlled under the hood.

## 1. Positioning

### External promise

saaskaya is an AI website platform for professionals and small businesses:

- Tell it who you are.
- Get a polished multilingual website in minutes.
- Publish on your own domain.
- Keep improving it by chatting, not by learning a page builder.

Marketing shorthand can be bold:

> The AI version of WordPress for professionals.

This is a positioning line, not an architecture mandate. We are not building a WordPress clone,
plugin marketplace, arbitrary code host, or general page builder.

### Internal product truth

The product should feel flexible, fast, and powerful to the customer, but implementation remains
controlled:

- AI does not write executable tenant HTML/CSS/JS.
- AI produces validated structured data and constrained patch operations.
- Rendering is performed by our trusted Svelte components, theme engine, media system, and layout
  tokens.
- Customers can ask for broad design/content changes in natural language, but the system translates
  those requests into safe schema changes.

## 2. Two Separate Design Surfaces

### A. saaskaya SaaS UI

This is our own product interface:

- landing page
- login
- dashboard
- account
- editor
- admin settings
- onboarding/payment/domain flows

This UI should be premium, convincing, and conversion-oriented. Claude Design, Stitch, or any other
design tool may provide HTML references for this surface. We can use those files as design specs and
rebuild them in Svelte/Tailwind/DaisyUI.

Rule: HTML design references are not copied blindly. Existing route behavior, auth, form actions,
loading states, validation, accessibility, responsiveness, and production checks must survive.

### B. Tenant Website Output

These are the websites generated for customers.

This surface must become much richer than the first MVP, but still cannot accept arbitrary raw code
from AI or customers. The right evolution is not "free-form builder"; it is a more capable controlled
site engine:

- more block types
- more variants per block
- stronger theme tokens
- media-aware layouts
- industry presets
- page templates
- animation knobs
- AI design critique and repair
- chat-first editing

## 3. Updated Constitution Interpretation

The current constitution says "fixed component set only." v2 keeps the safety intent but changes the
product interpretation:

| Old wording                | v2 interpretation                                                                |
| -------------------------- | -------------------------------------------------------------------------------- |
| Fixed component set        | Controlled component system                                                      |
| AI never writes HTML/CSS   | AI never writes executable/rendered tenant code                                  |
| Text/color edits bypass AI | Direct edits bypass AI; creative/global changes can use AI patch tools           |
| No WordPress clone         | No plugin/arbitrary-code clone; WordPress-like ownership and ease are acceptable |

Recommended future amendment:

> Tenant sites are composed from a controlled component, token, and media system. AI and customers may
> only change validated structured data, approved block variants, theme tokens, media references, and
> constrained layout knobs. No per-tenant executable HTML/CSS/JS is rendered.

## 4. Product Principles v2

1. **Chat-first, editor-second.** Users should not need to become text-field operators. The editor is
   available for precision, but the primary promise is "tell it what you want."
2. **Premium by default.** Every generated site must look like a saleable modern website without
   manual cleanup.
3. **Controlled flexibility.** Customers get meaningful creative range through variants, tokens, and
   templates, not arbitrary CSS.
4. **Niche depth before broad generic.** Launch with a small number of niches, but make each niche
   feel purpose-built and high quality.
5. **Safe professional content.** Legal/health niches require cautious copy, disclaimers, and owner
   review before publishing.
6. **Payment-gated power.** Higher tiers unlock AI edits, pages, media, premium templates, custom
   domains, languages, badge removal, analytics, and human help.

## 5. Roadmap v2

### V2.0 — SaaS UI Redesign

Goal: visitors should see a credible, impressive SaaS app before they ever generate a site.

Scope:

- redesign landing page with stronger promise and real product screenshots/mockups
- redesign login/new/dashboard/account/editor/admin surfaces for visual consistency
- add proper empty/loading/error states
- add pricing/plan presentation
- add conversion CTAs for generate, preview, upgrade, domain attach
- mobile + desktop polish pass

Claude Design HTML workflow:

1. Add the HTML reference to the repo root or `docs/design/`.
2. Treat it as a visual specification, not source code.
3. Map sections to existing Svelte routes/components.
4. Rebuild with Svelte/Tailwind/DaisyUI.
5. Preserve all existing server actions and auth behavior.
6. Verify screenshots/responsiveness and run `lint/check/test/build`.

Deliverable:

- public SaaS app feels launch-quality, not scaffolding-quality.

### V2.1 — Rich Tenant Site Engine

Goal: generated customer sites look materially better and less template-like.

Add/upgrade blocks:

- pricing/packages
- testimonials/reviews
- process/timeline
- booking CTA
- credentials/certifications
- locations/map
- blog/article index
- case studies/results
- before-after/gallery variants
- FAQ with richer layout
- hero variants with stronger media treatment

Theme engine:

- semantic tokens beyond primary/secondary
- typography scale presets
- section spacing density
- border/shadow/image-radius controls
- light/dark/soft/high-contrast palettes
- controlled animation tokens

Schema direction:

- keep one Zod contract
- add style/layout knobs only when renderer supports them
- keep upper bounds on pages/sections/items per plan
- every new block requires fixtures and schema tests

### V2.2 — Chat-First Site Editing

Goal: most users can improve their site without using form fields.

Capabilities:

- "Make this more premium"
- "Make the tone warmer"
- "Add a services page"
- "Create a campaign page for implants"
- "Use less text"
- "Make the hero more trustworthy"
- "Translate and localize the German version"

Implementation:

- expand constrained patch ops
- add page/template insertion ops
- add section-level regeneration
- add undo/version history
- add AI design critique before applying risky changes
- show before/after preview before publishing

Safety:

- invalid patch never persists
- one repair round-trip
- monthly token and operation limits
- professional-risk copy checks for legal/health claims

### V2.3 — Media Manager + R2

Goal: customers can make sites feel real with their own imagery.

Scope:

- upload images to R2
- media library per account/site
- image validation, size limits, thumbnails
- replace section images from editor/chat
- AI suggests where media is missing
- safe stock/placeholder fallback

Plan gates:

- Free: small quota, limited uploads
- Pro: larger quota, custom domain, more pages
- Premium: badge removal, premium templates, higher AI/media limits

### V2.4 — Billing, Account, and Domain Self-Service

Goal: customers control their commercial relationship without operator intervention.

Scope:

- Stripe customer portal
- invoice history link
- cancel/resume subscription
- plan upgrade/downgrade
- domain status timeline
- provisioning retry
- DNS instruction screen
- transfer-out/help copy
- self-serve account deletion request flow

### V2.5 — SEO, Analytics, and Growth

Goal: generated sites are not just pretty; they are useful business assets.

Scope:

- sitemap.xml per tenant
- robots.txt per tenant
- canonical URLs
- Open Graph/Twitter cards
- per-page title/description editor
- simple analytics dashboard
- contact conversion events
- "Powered by saaskaya" badge refinement and badge-removal upsell

### V2.6 — Scale and Multi-Tenant Data Split

Goal: prepare for more than a small preview cohort.

Scope:

- central PostgreSQL for users/billing/domains/site index
- per-tenant SQLite split using the existing migration runner
- backup per tenant
- restore tooling per tenant
- background jobs for provisioning/email/sweeps
- admin audit log
- rate limits that survive process restarts

## 6. Pricing & Limits Draft

These are product assumptions, not final prices.

### Free / Trial

- 1 draft site
- subdomain preview/publish
- limited AI generations/edits
- limited pages
- saaskaya badge required
- no custom domain

### Pro

- custom domain
- more pages
- higher AI edit quota
- media uploads
- contact form + email notifications
- multilingual site
- data export

### Premium / Done-With-You

- badge removal
- premium templates
- higher media quota
- analytics
- human review/help request
- priority support

## 7. AI Quality Bar

Every generated site should pass a quality gate before the user sees it:

- schema-valid
- all locales complete
- no broken media URLs
- no empty/duplicated sections
- no generic placeholder copy like "Lorem ipsum"
- professional-risk claims moderated
- CTA and contact path present
- mobile layout not overflowing
- theme contrast acceptable

Future implementation: `siteQualityCheck(site)` returns warnings and repair suggestions before saving
or publishing.

## 8. What We Still Do Not Build

- arbitrary per-tenant code execution
- plugin marketplace
- unrestricted drag-and-drop canvas
- customer-provided raw CSS/JS
- generic all-niche launch strategy
- unmanaged domain registration before payment

## 9. Immediate Next Decisions

Before implementing v2 features, decide:

1. Which niche is the first GTM focus?
2. What is the first pricing table?
3. What are exact Free/Pro/Premium limits?
4. Which SaaS UI design reference becomes the source for V2.0?
5. Which 5 new tenant blocks matter most for the chosen niche?
6. What professional-content disclaimer is required for the first niche?

## 10. Recommended Next Milestone

**V2.0: SaaS UI Redesign + Positioning**

Reason: the backend and MVP engine now work. The next bottleneck is trust and conversion. Visitors
need to believe this is a serious product before they generate, pay, or attach a domain.

Acceptance:

- redesigned landing/login/new/dashboard/account/editor shell
- pricing section visible
- "AI WordPress for professionals" positioning tested in copy
- route behavior preserved
- mobile/desktop screenshots clean
- `npm run lint`, `npm run check`, `npm test`, `npm run build`
- live health and route smoke checks after deploy
