# Dijital Mentor — CLAUDE.md

Dijital Mentor is a **WaaS / progressive CMS**: a person describes themselves in a chat, an AI
generates a **multilingual website as validated JSON (never raw HTML)**, they preview it live in
three viewports (mobile / tablet / desktop), edit the copy, and publish it on their own domain.

This file is auto-loaded every session and is the **canonical entry point**. Read it first, then the
relevant `docs/` — do **not** re-explore the repo for things already written here.

## Stack
SvelteKit · TailwindCSS · DaisyUI · **Zod** (the schema contract) · Drizzle ORM (PostgreSQL central +
per-tenant SQLite) · `@anthropic-ai/sdk` (Claude, tool-use) · Caddy (on-demand TLS) · Resend (email) ·
Stripe · Porkbun/NameSilo (domains) · Cloudflare R2 (media).

## The 5 operating rules
1. **Read the canon, not the repo.** Start from this file + the relevant `docs/`; open only files the
   current task needs. Don't re-explore what's already documented. *(token discipline)*
2. **One milestone/task at a time.** Small, reviewable diffs; finish and verify before starting the next.
3. **Log before you move on.** After each task, append to `docs/PROGRESS.md` — what changed, why, key
   decisions. Never lose completed-step memory to a context reset.
4. **Verify every change end-to-end** with the `verify` / `run` skills — never rely on "it should work".
5. **Stay in scope.** Obey the `docs/CONSTITUTION.md` non-goals; if a request implies drift, stop and flag it.

## Non-goals (do NOT build)
- No free-form / arbitrary layout builder — **fixed component set only**.
- No plugin / extension system.
- **AI never writes HTML/CSS** — it only fills the Zod `Site` schema.
- Real domain registration is the **last** milestone (M5), not early.

## Where things live
- `docs/CONSTITUTION.md` — non-negotiable principles → **read before any task**
- `docs/PLAN.md` — architecture + milestones M0–M6
- `docs/PROGRESS.md` — what's done + decisions + error log → **update after every task**
- `docs/CONVENTIONS.md` — coding conventions + debug/verify protocol
- Roadmap (visual): https://claude.ai/code/artifact/4dd7c112-cf52-4c0d-8ded-2b681336d45e
- Original vision: `idea.md` (Turkish)

## Commands
_The app is not scaffolded yet (pre-M0). Once it is:_
- `npm run dev` — dev server
- `npm run test` — unit tests (start with `siteSchema.safeParse` fixtures)
- Drive flows end-to-end with the `run` / `verify` skills.

## Current status
See `docs/PROGRESS.md`. Governance layer laid down; next up is **M0** (scaffold + Zod schema).
