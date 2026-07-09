# Constitution — saaskaya

Non-negotiable principles for building this project. **When in doubt, re-read this file.**
If a request conflicts with a principle here, **stop and flag it** before proceeding.

## Principles

1. **One contract.** The Zod `Site` schema (`src/lib/schema/site.ts`) is the single source of truth,
   shared by the AI generator, the editor, and the renderer. All TypeScript types are inferred from it.
   Change the schema in one place; everything else follows.

2. **AI fills the schema — never writes HTML/CSS.** Generation uses Claude **tool-use** constrained to
   the schema. Every AI output is validated with `siteSchema.safeParse`; invalid output is repaired
   (one round-trip) or rejected — **it is never rendered**. This is what makes hallucination structurally
   impossible.

3. **Fixed component set.** Sites are composed only from the pre-built block library
   (`src/lib/blocks/`). No free-form layout builder, no drag-and-drop page designer beyond the blocks,
   no plugin system, no per-tenant custom code.

4. **Token discipline.** Read the canon (`CLAUDE.md` + `docs/`), open only files the task needs, work
   milestone-by-milestone, keep diffs small. **Text and color edits bypass the AI entirely** (direct
   writes to the model) — the AI is only for creative/structural requests.

5. **Real domain registration is last.** It is the heaviest external dependency (Porkbun/NameSilo
   reseller API, ICANN rules, irreversible cost) and is intentionally sequenced to **M5**. Development
   and preview use subdomains / localhost. Registration only ever happens **after payment**.

6. **Record decisions.** Any non-obvious decision or trade-off is written to `docs/PROGRESS.md` before
   moving on. Future sessions must be able to reconstruct _why_, not just _what_.

7. **Verify, don't assume.** Every change is driven end-to-end (the `verify` / `run` skills) before it is
   called done. Errors are diagnosed from the **actual log/output**, never guessed — see the debug loop
   in `docs/CONVENTIONS.md`.

## Non-goals — we deliberately will NOT build

- A general-purpose website builder / WordPress clone.
- Arbitrary layouts or a drag-and-drop designer beyond the fixed blocks.
- A plugin / extension marketplace.
- More than **3 niche presets** at launch: lawyers · psychologists · dentists.
- Multi-niche go-to-market — GTM focuses **one** niche even though three presets exist.

## The first slice (MVP heart) — what "done" means for the first deliverable

`describe self → AI generates Zod-valid Site JSON → live 3-viewport preview → edit text/color →
local publish`, on a **seed tenant**, with **no auth, no billing, no domains**. Everything else waits
until this loop is real and impressive.

## Amending this constitution

Principles change only by an explicit, logged decision in `docs/PROGRESS.md` that names the principle and
the reason. Don't silently drift.
