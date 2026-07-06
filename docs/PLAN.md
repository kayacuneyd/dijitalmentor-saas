# Build Plan — Dijital Mentor

Architecture + milestones for the WaaS / progressive CMS. High-level business+tech roadmap (visual):
https://claude.ai/code/artifact/4dd7c112-cf52-4c0d-8ded-2b681336d45e · Original vision: `../idea.md`.

## Product flow
Need a site → buy domain → describe self/needs in a **chat** → **live preview** → approve →
**editor** (left sidebar: chat + settings; right: site in **mobile / tablet / desktop**) → edit text
(or keep the AI copy) → **publish**. Defaults: admin panel, **multi-language (TR/EN/DE)**, add-page,
contact + email, **style derived from a short self-description text**.

## Architecture

### 1. Content model — the single contract (build first)
One Zod schema `src/lib/schema/site.ts` shared by AI + editor + renderer (TS types inferred):
```
Site    = { id, tenantId, domain, defaultLocale, locales:["tr","en","de"], theme, nav, pages[], settings }
Page    = { slug, title:{tr,en,de}, sections: Section[] }
Section = { id, type:"hero|about|services|gallery|contact|cta|faq|team|footer",
            props:{ variant, layout, background, ... },     // language-neutral
            content:{ tr:{...}, en:{...}, de:{...} } }        // per-locale text/media refs
theme   = { preset:"law|psych|dental", colors, fonts, radius } // → DaisyUI theme variables
```
Hand-authored seed `Site` per niche in `src/lib/seed/` to develop against before the AI exists.

### 2. Component registry + renderer
Fixed Svelte blocks in `src/lib/blocks/` (Hero, About, Services, Gallery, Contact, CTA, FAQ, Team,
Footer), 1–2 `variant`s each. `registry.ts` maps `type → component`. `SiteRenderer.svelte` iterates a
page's sections and renders each with `props` + `content[locale]`. Theming via DaisyUI + CSS variables
driven by `theme`; niche presets in `src/lib/presets/`. **No AI-generated HTML.**

### 3. Editor (first slice) — iframe + live postMessage
`src/routes/editor/[siteId]/`: fixed left sidebar tabs (Chat / Content / Theme / Pages / Languages /
Settings) + wide right preview. Preview is an `<iframe>` → `src/routes/preview/[siteId]/` which SSRs the
**draft** JSON; a width toggle constrains it to **375 / 768 / 100%**. A Svelte store holds the draft;
edits patch it and `postMessage` the new JSON into the iframe → in-place re-render (no reload, no flicker).
**Text/color edits bypass the AI** (direct writes); the AI is only for creative/structural asks. Debounced
autosave.

### 4. AI generation — Claude tool-use + Zod
`src/lib/ai/generate.ts`: `@anthropic-ai/sdk` **tool-use** whose input schema is the Zod schema
(via `zod-to-json-schema`); output → `siteSchema.safeParse` → one repair round-trip on failure.
**Consult the `claude-api` skill at build time for the current model id + tool-use params — never
hardcode from memory.** Default locale generated first; EN/DE filled by a translate step (cheaper than
regenerating). Chat edits → a constrained "patch" tool. Token counter + monthly limit + graceful
degradation ("AI busy, retry shortly"); leave a seam for a fallback provider.

### 5. Tenancy / publish / serving (M4+)
One multi-tenant SvelteKit app; `src/hooks.server.ts` resolves the tenant by `Host` header. Draft vs
**published** snapshot (versioned); the public site SSRs the published JSON with locale routes
(`/`, `/en`, `/de`); Caddy on-demand TLS issues a cert for any hooked domain.

### 6. Data
Hybrid: central **PostgreSQL** (tenants, users, subscriptions, domains, billing, site index) + per-tenant
**SQLite** (Site versions, pages, contact submissions, media index) via **Drizzle ORM** behind a
repository layer in `src/lib/server/db/` (the first slice runs on one local SQLite; swap later).
Per-tenant SQLite **migration runner** (versioned, idempotent, resumable) — the DB-per-tenant tax.

### 7. Email / contact (default)
Contact block → `POST /api/[tenant]/contact` → store submission in tenant SQLite + send via **Resend**
(`src/lib/server/email.ts`); same provider for transactional mail (magic link, notifications).

### 8. Auth / billing / domains (M5)
Magic-link auth + short-lived JWT + rate-limit (optional 2FA later); **Stripe** subscription;
**post-payment** domain registration via **Porkbun/NameSilo**; Cloudflare R2 media; "Powered by Dijital
Mentor" badge.

## Milestones (solo, part-time)
- **M0** Scaffold (SvelteKit + Tailwind + DaisyUI, Drizzle) + **write the Zod schema** + hand-author a seed Site per niche.
- **M1** 8 blocks (+variants) + registry + `/preview` SSR + 3 niche themes + locale-aware rendering.
- **M2** Editor shell: sidebar + iframe + 3-viewport toggle + draft store + **live postMessage** + direct text/theme edit + add page + language tab + autosave.
- **M3** AI loop → **first slice done**: self-description → tool-use → Zod-valid JSON → editor; chat → patch; token counter. Describe → preview → edit → local publish works on a seed tenant.
- **M4** Auth + dashboard + draft→published + Host routing + locale routes.
- **M5** Stripe + real domain registration + Caddy on-demand TLS + contact→Resend + R2 + badge.
- **M6** Migration runner + off-site backups + monitoring + cancellation policy.

## Verification per milestone
- **M1** seed Site renders at `/preview/[id]` in all 3 locales + 3 themes; no console errors; no horizontal overflow at 375px.
- **M2** edit a headline / brand color → iframe updates live via postMessage (no reload); viewport toggle reflows; reload → draft persisted.
- **M3** each niche self-description → Zod-valid JSON (≤1 repair); invalid output never reaches the renderer; unit-test `siteSchema.safeParse` on good/bad fixtures.
- Always drive flows with `run` / `verify` and log the outcome in `PROGRESS.md`.
