# Editor Value Upgrade Plan

> Date: 2026-07-14
> Status: approved planning note
> Source: operator feedback after testing chat-driven page creation and editor first-run density

## Purpose

Make the editor feel like a guided site architect instead of a generic content form:

- chat requests must only say "done" when the `Site` draft actually changed;
- new pages created by chat must appear immediately in preview and navigation;
- warnings/checklists should be compact, visible, and actionable without stealing the canvas;
- chat should remain the primary interface for both Q&A and site-building decisions;
- users should understand their site's structure through a sitemap view, not only visual preview.

The constitutional boundary remains unchanged: AI fills the Zod `Site` schema and constrained patch
operations. It never writes tenant raw HTML/CSS.

## Workstream 1 — Honest Chat Page Operations

Problem: the chat patch operation surface can add sections, edit text/theme/settings, and update
titles/nav labels, but it cannot create pages. A model can therefore reply as if pages were created
while the actual `site.pages` array is unchanged.

Tasks:

- Add an `add_page` patch operation to the AI-facing chat schema.
- Reuse or share the existing deterministic page rules from `src/lib/editor/pageOps.ts`:
  unique kebab-case slug, max 10 pages, complete locale titles, at least one valid section.
- Add a matching `applyOp` branch in `src/lib/server/ai/patch.ts`.
- Ensure new pages can be added to `site.nav.items` when there is nav capacity.
- Include a changed/focus page hint in the chat response, or let the client infer newly added
  slugs, so preview automatically switches to the page that was just created.
- Update the chat system prompt: if an operation is unsupported or no operation is emitted, the
  assistant must explain what cannot be done instead of claiming success.

Acceptance:

- A mocked "add two pages" patch increases `site.pages.length` by 2, keeps `siteSchema` valid, and
  updates nav where allowed.
- After an applied chat edit adds a page, the editor preview opens that page without a manual tab
  search.
- The assistant cannot claim a structural edit succeeded when the returned operations array is empty.

## Workstream 2 — Compact Editor Guidance

Problem: first-run guidance, quality warnings, and publish blockers can consume too much editor space,
especially after the FAB/dock redesign.

Tasks:

- Convert non-critical guidance into small daisyUI-style badges such as
  `badge badge-sm badge-secondary`, `badge-warning`, or `badge-error`.
- Keep detailed explanations behind hover/focus/tap affordances using tooltip/popover-style UI.
- Avoid always-open tooltips except for one short, time-limited critical first-run hint.
- Keep true blockers visible as one-line summaries with an action target.
- Preserve keyboard/focus accessibility for tooltip or popover content.

Acceptance:

- Checklist and quality state can be scanned in one compact row/cluster.
- The full explanation remains available without occupying permanent vertical space.
- Mobile editor can reach chat input, page controls, and publish actions without hidden overflow.

## Workstream 3 — daisyUI Chat Presentation

Problem: chat should look and behave like a real conversation while preserving approval cards,
redirects, undo, and risk-gated edits.

Tasks:

- Refactor the internal `ChatBubble` rendering to daisyUI chat classes:
  user messages use `chat chat-end`, assistant messages use `chat chat-start`.
- Use `chat-bubble` variants for assistant/user/error states.
- Keep proposal cards, undo, approve, cancel, and force-send actions as compact controls below the
  relevant assistant message.
- Preserve chat history, gatekeeper behavior, approval flow, and `DraftStore.replace` semantics.

Acceptance:

- Chat display changes do not alter API payloads or mutation behavior.
- Error, proposal, applied, redirect, and help/question responses remain distinguishable.
- The input remains pinned/reachable on mobile and desktop.

## Workstream 4 — Guided Structure Before Generation

Problem: onboarding can move too quickly from answers to generated editor, before the user has made
basic structure decisions such as page count.

Tasks:

- Add a pre-generation "site structure" decision step:
  one-page, 3-page starter, 5-page trust site, or custom.
- Ask explicitly how many pages the customer wants when the answer is not obvious.
- Offer a proposed page set before spending the generation credit.
- Include selected page count/page set in the generation description and AI prompt steering.
- Keep the final output schema-validated; no custom layout or raw HTML surface is introduced.

Acceptance:

- Users see and approve the intended sitemap before generation starts.
- Generation failure still preserves answers and the selected structure.
- Generated `site.pages` matches the approved structure unless the schema/quality gate rejects it and
  explains the fallback.

## Workstream 5 — Sitemap Panel

Problem: visual preview alone does not explain the site's information architecture.

Tasks:

- Expand the Pages tab into a sitemap-oriented view:
  pages, nav visibility, page readiness, and each page's section list.
- Show section names/types under each page in order.
- Add compact status badges for missing contact path, incomplete locale copy, hidden-from-nav, and
  publish blockers/warnings.
- Add one-click focus: selecting a page switches `store.currentSlug`; selecting a section should
  route the user to the relevant content editor area where practical.
- Add AI suggestions as constrained recommendations, e.g. "Add FAQ page", "Add trust/credentials
  section", "Your contact path is weak."

Acceptance:

- A non-technical user can understand the site structure without opening every page in preview.
- Sitemap actions mutate the same Zod-valid draft store and autosave path as existing editor edits.
- Suggestions never create unsupported free-form blocks.

## Workstream 6 — Value-Adding Editor Features

Prioritized additions:

- Change summary after every applied AI edit: affected pages, sections, and nav changes.
- Preview focus after mutation: changed page/section becomes visible immediately.
- Multi-step undo or revision checkpoints for accepted AI edits and manual saves.
- Page templates for launch-niche common structures.
- Before-publish compact checklist: contact, SEO, languages, mobile, domain/public handle.
- AI next-best-actions based on deterministic quality checks, not vague generic advice.

These should be implemented after the `add_page` operation and sitemap foundation, because both
features depend on knowing the changed page/section targets.

## daisyUI Skill Usage

Use the official daisyUI skill as a development aid for editor/SaaS UI work when available. It is
useful for consistent component class usage, especially badges, tooltips, chat bubbles, docks, tabs,
steps, menus, and status indicators.

Boundary:

- It may guide how we implement saaskaya application UI and fixed block UI.
- It does not change the tenant content contract.
- It does not authorize AI-generated tenant raw HTML/CSS.
- Any tenant-facing addition still goes through `src/lib/schema/site.ts`, fixed blocks, renderer,
  tests, and end-to-end preview verification.

Later phase idea: use daisyUI/component-system knowledge as part of a consistency audit for the SaaS
editor and fixed public-site blocks, checking visual density, component misuse, contrast, mobile
overflow, and inconsistent state styling.

## Suggested Implementation Order

1. `add_page` patch operation + tests.
2. Chat applied-change summary + preview focus.
3. daisyUI chat-bubble presentation refactor.
4. Compact badge/tooltip guidance for checklist and quality warnings.
5. Sitemap-oriented Pages tab.
6. Pre-generation page-count/site-structure approval.
7. Multi-step revision/undo and richer next-best-actions.

## Verification

Each implementation slice must include:

- schema/unit tests for changed patch operations or helpers;
- `npm run check`;
- targeted browser smoke for editor chat, preview focus, mobile overflow, and autosave;
- `docs/PROGRESS.md` entry with root cause, decision, verification, and any remaining risks.
