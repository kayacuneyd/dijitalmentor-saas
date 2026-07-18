# SaasKaya platform UI visual audit

## Status

- Scope: SaasKaya platform UI only
- Excluded: tenant renderer, generated websites, `Site` schema, block registry
- Method: source-structure audit, shared-shell inventory, existing mobile browser audit and brand brief comparison
- Current conclusion: the Flowbite migration is structurally healthy, but the visual redesign has not yet happened at macro-layout level

## Executive finding

The current platform does not look materially different because Flowbite is being used as a behavior and accessibility layer while the existing SaasKaya shell remains the dominant visual structure.

The repeated visual formula is:

`AppCanvasShell → PanelShell → sidebar → page header → stacked AppCard/sk-shell sections`

This formula is shared by dashboard and admin surfaces. The editor has a different split layout, but still presents the same border-first card language, compact controls and stacked inspector sections. Changing the font and replacing button/input internals therefore changes implementation details without changing the product's visual fingerprint.

## Evidence by surface

### Dashboard

Current responsibilities in one route:

- plan and credit summary
- alerts
- site list
- identity editing
- billing and publish controls
- domain reservation/attachment
- delete and more-actions flows

Current structural issue:

- each site is a large `sk-shell` item with several nested bordered sections and inline forms;
- identity, billing, publishing and domain work have similar visual weight;
- the primary next action for a site is not visually distinct from maintenance actions;
- the page reads as a collection of operational cards rather than a workspace index.

### Editor

Current responsibilities in one shell:

- preview viewport switching
- publish state and quality gate
- content, pages, theme, language and settings inspection
- AI chat and proposal flow
- autosave and draft state

Current structural issue:

- preview, inspector, chat and publish controls compete in the same shell;
- inspector sections are individually styled but not grouped into a clear editing mode;
- the user cannot immediately tell whether they are editing content, appearance, structure or publication;
- mobile controls are collapsed, but the information architecture remains desktop-first.

### Admin

Current responsibilities include:

- metrics and trends
- customers
- inbox and support
- blog and copy
- messages and localization
- sharing, invites and settings

Current structural issue:

- `AdminShell` deliberately reuses `PanelShell`, so the admin console inherits the same product chrome and content rhythm as the customer dashboard;
- overview uses generic card grids for metrics, charts, activity and visits;
- operational queues such as inbox/support do not have a sufficiently distinct queue/ledger grammar;
- the `Ops`, `Growth`, `CRM`, `Content` and `System` labels exist in navigation data but are not yet expressed as a strong visual information architecture.

## Brand brief gaps

The approved brief calls for “İşini bilen küçük bir dijital atölye.” The current UI expresses the brief in palette and typography, but less clearly in structure:

- craft/workbench feeling is not yet visible in dashboard or editor composition;
- calm technical clarity is diluted by repeated card nesting;
- user control is present in copy and actions, but not sufficiently visible in the spatial hierarchy;
- admin operational work is not separated enough from customer-facing workspace work.

## Proposed macrostructure families

These are proposals for the next `design.md`; they are not yet locked.

### App dashboard: Atelier Index

The dashboard becomes a site/workspace index first. Each site receives one primary row or focused work item with a clear state rail, next action and secondary maintenance actions. Supporting details open contextually rather than remaining permanently expanded.

### Editor: Preview Workbench

The preview becomes the dominant canvas. Editing mode, inspector and assistant become explicit workbench zones with one active task at a time. Publish readiness stays visible as a compact work state, not another card block.

### Admin: Operations Ledger

Admin becomes a queue and operations console. Inbox, support and customer records use dense list/detail relationships; metrics become supporting context rather than the primary visual grammar. Admin keeps the brand system but receives a distinct operational rhythm.

### Onboarding: Guided Brief

Onboarding becomes a deliberate sequence of brief decisions with one dominant question/action per step and a visible sense of progress toward the first draft.

## Non-negotiable redesign constraints

- preserve routes, server actions, auth, preview bridge, autosave and data contracts;
- use Flowbite MCP for API/reference lookup only;
- keep Flowbite as behavior infrastructure, not visual identity;
- do not change tenant renderer or generated-site output;
- no decorative gradients, glass surfaces, invented metrics or generic dashboard ornament;
- make the redesign visibly structural: layout, hierarchy, density and interaction zones must change, not only fonts or classes;
- validate each major surface at 320, 375, 414, 768 and desktop widths.

## Acceptance criteria for the next phase

The redesign is not accepted if a screenshot comparison can be described as “the same dashboard with a different font.” It must show:

- distinct macrostructure for dashboard, editor and admin;
- fewer permanently nested cards;
- a clear primary action per major surface;
- visibly different information hierarchy;
- mobile behavior designed around the task, not only collapsed desktop columns;
- preserved functional behavior verified by check, tests, build and route smoke.
