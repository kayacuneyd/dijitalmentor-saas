# saaskaya SaaS UI Redesign Spec

## Goal

Rebuild the saaskaya product UI from scaffold-quality DaisyUI screens into the premium, editorial SaaS
surface described by `docs/Saaskaya WaaS Landing Page/Saaskaya Design Doc.dc.html`, while preserving
all existing auth, generation, editor, publish, billing, domain, contact-message, and admin behaviors.

## Source Inventory

- `/` landing with demo seed sites and sign-in/dashboard navigation.
- `/new` self-description generation form.
- `/login` magic-link form and sent/dev-link state.
- `/dashboard` owned sites, plan state, publish/unpublish, domain attach/register/detach, export.
- `/dashboard/[siteId]/messages` contact submissions.
- `/account` account summary and export/sign-out/upgrade actions.
- `/editor/[siteId]` fixed sidebar tabs, autosave, iframe preview, viewport/locale controls, publish.
- `/admin/settings` operator settings and system health.
- Public tenant output is rendered through the Zod `Site` schema and fixed Svelte blocks.

## Target Sitemap

No route changes. Existing URLs remain canonical for this redesign.

## Page Responsibilities

- `/`: make the product credible immediately, show the brand, positioning, CTA, and demo sites.
- `/new`: focus on the textarea as the core product action and expose generation state clearly.
- `/login`: keep magic-link sign-in simple, with a polished success/dev echo state.
- `/dashboard`: show account, plan, site state, domains, messages, publish controls, and exports in a dense but calm console.
- `/dashboard/[siteId]/messages`: make submissions scannable and easy to reply to.
- `/account`: keep customer-owned account/billing/export controls distinct from super-admin settings.
- `/editor/[siteId]`: improve the app chrome without touching DraftStore, autosave, postMessage, preview, or publish semantics.
- `/admin/settings`: keep an operator-first dense settings surface, visually aligned with the SaaS UI.

## Reusable Content

- Brand mark: black square with serif `s`.
- Editorial headings: Instrument Serif.
- Body/UI text: IBM Plex Sans.
- Technical labels and IDs: IBM Plex Mono.
- Reusable shell/card/pill/button/input patterns.
- Niche swatches: law `#1e3a5f`, psych `#2f6f6a`, dental `#0e7490`.

## Content To Drop Or Rewrite

- Drop the paused landing product-flow animation from the first redesign pass. Re-plan it after the new static design lands so it supports the new visual system instead of competing with it.
- Rewrite generic scaffold copy only where the design doc already provides a stronger product framing.
- Keep all legal/plan/cancellation/admin explanatory copy that reflects current product behavior.

## SEO And Redirects

No redirects. Route titles should stay meaningful. Add descriptions for top-level product pages where practical. Tenant SEO remains outside this pass.

## Visual Direction

Warm editorial SaaS: soft stone background, off-white cards, small mono labels, compact action buttons,
visible product state, and restrained shadows. Avoid marketing gradients and decorative blobs. Mobile
layouts should stack cleanly; console pages should remain dense enough for repeated operational use.

## Implementation Notes

- Treat the Claude Design HTML as visual specification only. Do not import it as raw app HTML.
- SaaS UI may use Svelte/Tailwind/DaisyUI directly; tenant site output must continue through the Zod `Site` schema and fixed blocks.
- Add global design tokens in `layout.css`, then small shared UI components under `src/lib/ui/`.
- Preserve all existing server actions, forms, `enhance` usage, auth redirects, and editor data flow.
- Verify with lint/check/test/build plus desktop/mobile screenshots and critical route interaction checks.

## Open Questions

- Product-flow animation should be designed after the static landing is approved.
- Richer tenant-site block redesign belongs to V2.1 because it may require schema/fixture/AI prompt changes.
