# Hostinger Horizons Competitive Analysis & Saaskaya Roadmap

> Date: 2026-07-09
>
> Scope: Adapt the strongest product lessons from Hostinger Horizons to saaskaya without turning
> saaskaya into a general-purpose app builder or weakening its schema-safe tenant engine.

## Goal

Make saaskaya the focused, lower-complexity alternative for Turkish professionals:

> Describe your practice, receive a polished multilingual website, refine it by chatting, and
> publish it on your own domain—without learning web design or risking AI-generated code.

Horizons is a broad AI website and web-app builder. Saaskaya should not compete on breadth, code
editing, arbitrary integrations, or app backends. It should compete on niche depth, professional
trust, Turkish onboarding, safe output, guided completion, and done-with-you support.

## Source Inventory

Official Hostinger pages reviewed:

- `/horizons`: main landing page, template gallery, bundled value proposition, pricing, trust proof,
  testimonials, and conversion flow.
- `/horizons/features`: feature taxonomy and plan packaging.
- Hostinger support: current product overview, editor anatomy, plan limits, domains, publishing,
  restoration, visual editing, integrations, and troubleshooting.

Horizons' visible product system consists of:

1. An idea prompt as the primary entry point.
2. A large, categorized template gallery with live previews.
3. Chat, image, and voice input.
4. A live visual preview and direct text/image editing.
5. One-click publishing with hosting, domain, email, and SEO bundled.
6. Persistent version restore tied to chat messages.
7. Visible monthly AI credits, usage history, upgrades, and top-ups.
8. Built-in backend, accounts, storage, ecommerce, payments, analytics, and integrations.
9. Code access and project duplication at higher tiers.
10. Strong trust signals: customer scale, reviews, examples, refund terms, and 24/7 support.

## What To Keep, Rewrite, And Drop

### Keep as product patterns

- Prompt-first onboarding with useful examples.
- Templates shown before signup, grouped by customer intent.
- Chat-first editing plus free direct text/image edits.
- Live responsive preview and one-click publish.
- Visible credits and plain-language plan limits.
- Persistent version history and restore.
- Domain, hosting, email, SEO, and analytics presented as one outcome.
- Real customer examples, testimonials, and trust evidence.
- Guided error recovery and human-help escalation.

### Rewrite for saaskaya

- “Build any website or app” → “Build a professional practice website.”
- Generic templates → deep law, psychology, and dental site kits; launch marketing targets one niche.
- Arbitrary design generation → controlled block variants, page recipes, theme tokens, and media.
- Backend/integrations → professional outcomes: contact capture, booking handoff, location, reviews,
  credentials, disclaimers, multilingual SEO, domain, and mailbox guidance.
- Code ownership → content/data export and predictable portability; no tenant code editor.
- AI credit language → credits for creative changes; direct content/media editing remains free.
- 24/7 generic support → Turkish guided onboarding plus paid human review/help.

### Drop deliberately

- General-purpose web-app generation.
- AI-generated or tenant-edited HTML/CSS/JS.
- Code editor and stack selection.
- Plugin marketplace and arbitrary third-party runtime integrations.
- User-programmed databases, app authentication, and custom backend workflows.
- Ecommerce/subscription building in the initial product.
- Dozens of shallow niches or hundreds of cosmetic templates.

## Competitive Gap Analysis

| Capability           | Horizons                              | Saaskaya now                                    | Required response                                    |
| -------------------- | ------------------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| Clear market promise | Broad sites + apps                    | Technically accurate but jargon-heavy landing   | Rewrite around one professional outcome              |
| Prompt-first trial   | Immediate idea prompt, 5 free credits | Describe flow exists behind a generic CTA       | Put a niche-guided prompt/demo on landing            |
| Template discovery   | Large categorized preview gallery     | Three seed demos in a compact list              | Build 6–9 curated kits for the launch niche          |
| Output richness      | Flexible generated layouts/apps       | 9 blocks, limited variants/tokens               | Add trust/conversion blocks and richer tokens        |
| Chat editing         | Text/image/voice, restore             | Text chat, risk gate, one-step undo             | Add section regeneration and persistent history      |
| Visual editing       | Direct text and image editing         | Direct content/theme/media editing exists       | Improve selection context and image library UX       |
| Image prompting      | Screenshot/image input                | R2 upload only                                  | Defer screenshot generation; add media-aware prompts |
| Publishing           | One click, bundled hosting            | Publish/subdomain/custom domain exists          | Add progress/status and recovery UI                  |
| Domain/email         | Bundled and clearly packaged          | Implemented, operator-heavy                     | Make provisioning and mailbox setup self-service     |
| SEO/GEO              | Productized SEO and AI discovery      | One site description; platform-only sitemap     | Add per-page SEO, tenant sitemap/robots/canonical/OG |
| Analytics            | Included in paid plan                 | None                                            | Add privacy-conscious visits/contact conversions     |
| Version restore      | Persistent history by prompt          | Immutable publish snapshots, no user history UI | Add draft revisions and restore UI                   |
| Credit economy       | Visible balance, graph, top-up        | Limits enforced but not clearly surfaced        | Add budget indicator, ledger, top-up                 |
| Plans                | Concrete tier comparison              | Draft assumptions                               | Finalize Turkish pricing and enforcement             |
| Social proof         | Scale, testimonials, examples         | Demo seeds only                                 | Recruit beta cohort and publish verified cases       |
| Help/recovery        | Auto-fix, docs, 24/7 support          | Errors exist; human-help backlog                | Guided recovery and paid human review                |
| Collaboration        | Account sharing                       | Single owner                                    | Defer; add only after real demand                    |
| Legal/trust          | Refund terms and mature policies      | KVKK/ToS/privacy/disclaimers incomplete         | Launch-blocking legal and professional safeguards    |

## Target Public Sitemap

- `/` — one-niche promise, interactive prompt, proof, process, examples, pricing, FAQ, final CTA.
- `/templates` — curated professional kits with desktop/mobile previews.
- `/templates/[slug]` — outcome, included pages, niche features, live preview, “use this kit.”
- `/features` — chat editing, multilingual content, safe AI, media, domain, SEO, leads.
- `/pricing` — Free/Pro/Premium limits and plain-language credit behavior.
- `/examples` — real published customer sites and measurable outcomes.
- `/how-it-works` — describe → review → refine → publish → grow.
- `/trust` — schema-safe AI, hosting/security, backups, ownership/export, support.
- `/legal/privacy`, `/legal/terms`, `/legal/kvkk`, `/legal/acceptable-use`.
- `/login`, `/new`, `/dashboard`, `/editor`, `/account` — existing application surfaces.

## Page Responsibilities

- Landing page sells the outcome, not the architecture. “Validated JSON,” “WaaS,” and stack language
  belong on the trust/technical page, not in the hero.
- Templates prove visual quality before signup and reduce blank-prompt anxiety.
- Features translate implementation into customer benefits.
- Pricing makes the cost and AI-credit rules predictable.
- Examples establish that generated sites are real, professional, and publishable.
- Trust explains why controlled generation is safer than vibe-coded tenant code.
- Legal pages make beta and paid acquisition defensible.

## Reusable Product Modules

- Niche kit card: audience, visual preview, included pages, primary outcome, CTA.
- Before/after chat story: user request → proposed change → visual result.
- Four-step progress indicator: describe, generate, refine, publish.
- Credit meter: remaining edits/generations, renewal date, top-up CTA.
- Quality checklist: locales, contact path, SEO, media, claims, mobile, publish readiness.
- Domain status timeline: reserved, payment pending, registered, DNS, TLS, live.
- Trust strip: multilingual, own domain, safe structured AI, backups, export.
- Customer proof card: real domain, niche, quote, launch time, verified outcome.

## Visual Direction

- Keep the current warm editorial SaaS shell but increase visual proof.
- Use large real tenant screenshots and responsive device frames instead of architecture copy.
- Make the initial prompt the dominant hero interaction.
- Show only a few high-quality niche kits; depth is more credible than template-count theater.
- Use Turkish-first copy and real professional imagery with explicit consent.
- On mobile, preserve prompt → examples → proof → pricing → CTA order; avoid dense comparison tables.

## Product Roadmap

### Phase 0 — Baseline and evidence (launch blocker)

Purpose: stop adding scope before the existing product is operationally trustworthy.

- Create a reviewable Git baseline from the current dirty worktree.
- Separate development and production databases and document restore/rollback.
- Run and record production smoke flows for AI, SMTP, publish, Stripe test webhook, reservation,
  domain fulfillment sandbox/safe path, R2, backup, and health alerting.
- Add automated browser smoke for login → generate → edit → publish → public route.
- Resolve every discovered production defect before Phase 1.

Exit gate:

- Clean/reproducible checkout, isolated production data, green test/check/build, and a recorded
  end-to-end production run.

### Phase 1 — Positioning, pricing, and legal foundation

Purpose: define what is sold before expanding what is built.

- Select one launch niche using willingness-to-pay, acquisition access, content risk, and booking/
  lead value. Keep the other two presets available but do not market all three equally.
- Finalize Free, Pro, and Premium pricing, credits, pages, media, languages, domain, badge, support,
  and refund rules.
- Produce unit economics per active paid site, including AI, VPS, storage, email, domain, payment,
  support, tax, and failed-payment costs.
- Publish Privacy, Terms, KVKK disclosure/consent, acceptable use, cancellation/refund, data export,
  and niche-specific professional disclaimer.
- Rewrite landing information architecture and copy in Turkish.

Exit gate:

- One named ICP, one approved pricing table, positive target gross margin, legal review completed,
  and no unresolved launch-policy decision.

### Phase 2 — Guided first-run experience

Purpose: deliver the Horizons-style “idea to visible result” moment with less user effort.

- Put a Turkish niche-guided prompt on the landing/new flow.
- Ask 5–7 adaptive questions: specialty, location, audience, differentiators, tone, contact/booking,
  languages, and available media.
- Offer 3 visual directions based on curated kits before spending a generation credit.
- Show generation progress and explain what the credit buys.
- Land in the editor with a completion checklist and an obvious next best action.
- Add meaningful empty, loading, timeout, provider-error, and retry states.

Exit gate:

- Median first preview under 3 minutes; at least 70% of beta users who start onboarding reach a
  generated preview; generation failures never lose answers.

### Phase 3 — Professional kit and quality engine

Purpose: make the output sellable without manual cleanup.

- Add controlled blocks: testimonials/reviews, credentials/certifications, process/timeline,
  booking CTA, locations/map, pricing/packages where niche-appropriate.
- Expand hero, FAQ, gallery, services, and contact variants.
- Add semantic theme tokens, typography scale, spacing density, image treatment, shadow/border,
  palette, and restrained motion tokens.
- Create 6–9 complete kits for the launch niche, not isolated cosmetic themes.
- Implement `siteQualityCheck(site)` for locale completeness, placeholders, duplicate/empty
  sections, broken media, contact/CTA path, professional claims, contrast, SEO, and mobile overflow.
- Block publish only for structural/safety failures; show actionable warnings for quality issues.

Exit gate:

- Every kit passes schema fixtures, quality checks, 375/768/desktop browser verification, and a
  human visual review; 80% of beta users rate the first result “usable with minor edits.”

### Phase 4 — Confident chat editing and recovery

Purpose: make chat the primary editor without making changes feel irreversible.

- Add section-scoped requests and regeneration.
- Add controlled page/template insertion operations.
- Add a persistent draft revision for each accepted AI edit and manual save checkpoint.
- Add revision timeline, compare summary, restore, and republish controls.
- Surface risk, credit cost, affected pages/sections, and approval before medium/high-risk changes.
- Add “make more premium/warmer/shorter/trustworthy” recipes backed by constrained patch operations.
- Keep direct text, theme, and media edits free of AI credits.

Exit gate:

- Every AI mutation is attributable and restorable; no invalid revision can persist; users complete
  the top five editing intents without opening raw content forms.

### Phase 5 — Media and visual editing

Purpose: replace placeholder-looking output with authentic customer media.

- Build a site media library on the existing R2/index foundation.
- Add thumbnailing, dimensions, alt text, duplicate detection, quotas, delete/reference safety.
- Add click-to-select image replacement in preview/editor.
- Allow chat to use existing media references and identify missing visual slots.
- Provide curated safe fallback media per niche; do not add arbitrary web scraping.
- Defer screenshot-to-site and voice prompts until usage data proves value.

Exit gate:

- A nontechnical user can upload, reuse, replace, and remove images without broken references;
  published sites have no placeholder media unless explicitly accepted.

### Phase 6 — Publish, domain, SEO, and lead value

Purpose: sell a business outcome, not just a generated page.

- Add publish readiness checklist and deployment status/retry UI.
- Add self-service domain status timeline and DNS/TLS recovery instructions.
- Add mailbox setup guidance and verified contact delivery status.
- Add page-level title/description, canonical, OG/Twitter data, per-tenant sitemap and robots.
- Add local-business fields appropriate to the launch niche.
- Add privacy-conscious analytics: visits, contact submissions, CTA clicks, and source attribution.
- Add lead inbox states and notification controls.

Exit gate:

- New Pro user can publish to a subdomain without operator help; custom-domain path exposes every
  state; SEO audit passes; contact conversion is visible end to end.

### Phase 7 — Commercial self-service

Purpose: turn enforced limits into an understandable product system.

- Add dashboard/editor credit meter, renewal date, usage ledger, and budget warnings.
- Add idempotent AI-credit top-ups.
- Add Stripe customer portal, invoices, upgrade/downgrade, cancel/resume, and payment recovery.
- Add Premium human-review request with scope, price, scheduling, and operator workflow.
- Enforce all page/media/language/domain/template/badge limits server-side.

Exit gate:

- Plan changes and top-ups require no database edits; webhook retries are idempotent; every limit has
  a clear user-facing explanation and upgrade path.

### Phase 8 — Proof-led launch

Purpose: replace demo claims with market evidence.

- Onboard 10–20 professionals from the chosen niche.
- Perform structured first-result and publish interviews.
- Publish 3–5 consented customer examples and verified testimonials.
- Measure activation, time-to-preview, time-to-publish, AI cost/site, edit acceptance, leads, paid
  conversion, refund, and support minutes/account.
- Fix the largest observed funnel bottleneck before adding another niche.

Exit gate:

- At least five real published sites, three credible case studies, measurable weekly lead value, and
  a repeatable acquisition/onboarding playbook.

### Phase 9 — Scale only after signal

- Separate central PostgreSQL and per-tenant SQLite using the existing migration runner.
- Add tenant-scoped backup/restore, background jobs, durable rate limits, and audit logs.
- Add collaboration, voice input, screenshot guidance, broader integrations, or a second marketed
  niche only when customer evidence justifies each item.

## Prioritization Rules

Use this order when roadmap pressure appears:

1. Safety/legal correctness.
2. Existing production flow reliability.
3. First-result quality.
4. Publish and lead conversion.
5. Commercial self-service.
6. Acquisition proof.
7. Breadth and scale.

Do not start a later phase while its prerequisite exit gate is materially incomplete.

## Success Metrics

- Activation: onboarding started → first preview.
- Time to value: median minutes from signup to first preview.
- Quality: first preview accepted with minor edits.
- Editing: proposed AI edits accepted, undone, or failed.
- Publish: generated → published subdomain → custom domain.
- Business outcome: contact/booking CTA conversion.
- Reliability: generation, email, publish, media, and provisioning success rates.
- Economics: AI and support cost per activated/published/paid account; gross margin.
- Trust: refund rate, support incidents, professional-claim warnings, and restore usage.

## SEO And Redirects

- Preserve the canonical `https://saaskaya.com`.
- Keep `/`, `/login`, `/new`, `/dashboard`, `/editor`, `/account`, and current public tenant routes.
- Add public marketing routes without changing tenant host routing.
- Create platform sitemap entries for new public pages and tenant-specific sitemap/robots handlers.
- Add redirects only after final route names are approved; no current URL needs removal for this plan.

## Implementation Notes

- The Zod `Site` schema remains the only tenant content contract.
- Every new block follows schema → component → registry → preset/kit → AI schema → fixture → browser
  verification.
- AI output remains provider-independent, locally validated, and repaired at most once.
- Quality checks should be deterministic where possible; AI critique may suggest but must not bypass
  structural validation.
- Direct editing remains AI-free.
- “Template” means a validated Site/page recipe using approved components and tokens.
- This roadmap supersedes feature ordering in `ROADMAP_EVALUATION.md` where the phases conflict; it
  does not silently amend the constitution.

## Open Decisions

1. Launch niche: law, psychology, or dental.
2. Turkish monthly prices and whether domain/email are bundled or passed through.
3. Trial model: five creative credits, one complete site generation, or time-limited beta.
4. Whether professional legal review is required before closed beta or before paid public launch.
5. Human-review scope and service-level promise.
6. Analytics provider/build choice and consent requirements.
