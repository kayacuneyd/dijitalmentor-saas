# SaasKaya platform design system

This is the locked visual and structural system for the SaasKaya platform UI.
Every platform redesign reads this file before changing a route or composite
surface. It does not apply to the tenant renderer, generated websites, the
`Site` schema or the block registry.

## Product idea

**İşini bilen küçük bir dijital atölye.**

SaasKaya is calm technical craft: it listens to a professional's work, prepares
a first draft and leaves control with the owner. The interface should feel like
a small, competent workshop rather than an AI spectacle, growth machine or
generic SaaS dashboard.

## Genre

- Genre: modern-minimal with editorial craft details
- Tone: technical, calm, direct, quietly confident
- Motion: short transform/opacity transitions only; reduced-motion fallback is
  opacity-only or no motion
- Decoration: none unless it improves orientation or hierarchy

## Macrostructure families

The platform is intentionally not one repeated dashboard template.

### App pages — task workspaces

- Dashboard: **Atelier Index** — a focused site/workspace index with one clear
  next action per site and contextual maintenance actions
- Editor: **Preview Workbench** — preview-first canvas with explicit editing,
  assistant and publication zones
- Onboarding: **Guided Brief** — one dominant question/decision per step with
  visible progress toward the first draft
- Account/support: **Service Desk** — calm task and ticket surfaces with clear
  ownership and next steps

### Admin pages — operations console

- Admin overview: **Operations Ledger** — operational signals and queues first;
  metrics support action rather than becoming decorative card walls
- Inbox/support/customers: **Queue → detail** — dense list/detail relationships
  with clear status, ownership and action hierarchy
- Blog/copy/messages/settings: **Tool stations** — each station has a focused
  task surface rather than inheriting the dashboard card rhythm

### Public pages — editorial product narrative

- Keep the public brand system and copy intent.
- Vary section rhythm by responsibility, but preserve the shared wordmark,
  typography, accent and CTA voice.
- Avoid carrying app density into marketing pages.

## Visual tokens and source of truth

The current token roles live in `src/routes/layout.css`. Redesigns must use
those roles and may amend them only when a new role is explicitly documented
here first.

### Palette roles

- Paper/card surfaces: `--sk-card`, `--sk-paper`, `--sk-shell`, `--sk-stone`
- Primary text: `--sk-ink`
- Supporting text: `--sk-muted`, `--sk-faint`
- Dividers: `--sk-line`, `--sk-line-strong`
- Controlled operational accent: `--sk-accent`
- Keyboard focus: `--sk-focus`
- Error: `--sk-error`, `--sk-error-bg`, `--sk-error-line`, `--sk-error-ink`

Teal is a controlled operational accent, not a full-page brand wash. Ink and
paper carry the identity. Border comes before shadow; shadow is reserved for
overlays and meaningful layer separation.

### Typography

- Display/brand headings: `var(--font-display)` / Aleo, roman only
- UI/body: `var(--font-sans)` / Inter
- Technical values and metadata: `var(--font-mono)` / IBM Plex Mono
- No italic display headings
- Display headings carry hierarchy; Inter carries readability and controls

### Geometry

- Compact fields and controls: `--sk-radius-sm`
- Main cards and panels: `--sk-radius`
- Large layered surfaces: `--sk-radius-lg`
- Overlay elevation: `--sk-shadow-lg`, only where a layer must separate
- No arbitrary component-local radius or shadow values without a documented
  role

## Component and interaction language

Flowbite-Svelte is the behavior/accessibility layer. It is not the SaasKaya
visual identity. Shared primitives and composite shells must preserve this
relationship.

- Buttons: one clear primary action; secondary actions remain quiet
- Inputs: paper/card surface, visible line, teal focus ring
- Badges: compact status only; never used as decoration
- Modals/drawers: contextual work surfaces with focus management
- Tabs: represent editing modes, not a replacement for information architecture
- Dropdowns: secondary actions only; primary actions stay visible
- Icons: consistent line icons that support labels; icon-only controls require
  clear aria-labels and tooltips where needed
- Loading: on the action doing the work
- Error: explain cause and next step
- Success: quiet confirmation, no celebration theatre
- Disabled: reduced contrast but still legible and understandable

## Structural rules

- A screen must have one obvious primary job and one obvious next action.
- Do not permanently nest multiple bordered cards when a list, divider or open
  workspace is clearer.
- Dashboard, editor and admin must not share the same macro layout merely for
  implementation convenience.
- Data density follows task: dashboard is focused, editor is workbench-dense,
  admin is operationally dense, marketing is breathable.
- Preserve server actions, auth, autosave, preview bridge, data contracts and
  route ownership while changing visual/interaction composition.
- Generated websites are never redesigned through this system.

## Responsive contract

Every redesigned platform surface is checked at 320, 375, 414, 768 and desktop
widths.

- No horizontal document overflow
- No two-line primary CTA or navigation link
- Long headings can wrap without breaking their container
- Workbench zones become deliberate task modes on mobile; they are not merely
  squeezed desktop columns
- Touch targets remain usable on coarse pointers
- Drawer, inspector and sidebar transitions preserve focus and escape/close
  behavior

## Acceptance gate

A redesign is not accepted if a screenshot can be described as “the old screen
with a different font.” Each major surface must visibly change in at least
three of these dimensions:

1. macro layout
2. information hierarchy
3. density and spacing rhythm
4. primary/secondary action placement
5. panel and surface relationships
6. mobile task behavior

Each vertical slice is verified with `npm run check`, the relevant test suite,
production build, route smoke and responsive screenshot review before the next
slice begins.

## Hallmark stamp

`/* Hallmark · genre: modern-minimal/editorial · design-system: design.md · designed-as-app */`
