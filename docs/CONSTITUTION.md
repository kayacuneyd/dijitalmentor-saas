# Constitution — saaskaya

Non-negotiable principles for building this project. **When in doubt, re-read this file.**
If a request conflicts with a principle here, **stop and flag it** before proceeding.

## Principles

1. **One contract.** The Zod `Site` schema (`src/lib/schema/site.ts`) is the single source of truth,
   shared by the AI generator, the editor, and the renderer. All TypeScript types are inferred from it.
   Change the schema in one place; everything else follows.

2. **AI fills the schema — never writes executable/rendered tenant code.** Generation uses
   provider-agnostic **tool-use** constrained to the schema (currently Groq gatekeeper + DeepSeek
   Layer 2; the `runToolCall` seam supports provider rotation). Every AI output is validated with
   `siteSchema.safeParse`; invalid output is repaired (one round-trip) or rejected — **it is never
   rendered**. This is what makes hallucination structurally impossible. AI may produce structured
   data, theme tokens, media references, and constrained patch operations — but never raw HTML/CSS/JS
   that reaches the renderer.

3. **Controlled component system.** Sites are composed from the block library (`src/lib/blocks/`).
   The block set can grow (new block types + variants added intentionally with schema tests and AI
   prompt updates), but every addition follows the registry pattern. No free-form layout builder, no
   drag-and-drop page designer beyond the blocks, no plugin system, no per-tenant custom code.
   Profession kits and integrations form a controlled vocabulary that maps back to the fixed block set.

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

- A general-purpose website builder or a plugin/arbitrary-code WordPress clone. (WordPress-like
  ownership ease and "AI WordPress for professionals" positioning are acceptable — the line is
  drawn at arbitrary per-tenant code execution, plugin marketplace, and free-form layout.)
- Arbitrary layouts or a drag-and-drop designer beyond the controlled block set.
- A plugin / extension marketplace.
- Per-tenant executable custom HTML/CSS/JS.
- Unmanaged domain registration before payment.

## The first slice (MVP heart) — what "done" means for the first deliverable

`describe self → AI generates Zod-valid Site JSON → live 3-viewport preview → edit text/color →
local publish`, on a **seed tenant**, with **no auth, no billing, no domains**. Everything else waits
until this loop is real and impressive.

✅ **Delivered.** M0–M6 complete, V2.0 SaaS UI live, V2.2 two-layer AI gatekeeper live, beta launch

- hybrid onboarding live. See `docs/PROGRESS.md`.

## Amendments

### 2026-07-14 — V2 interpretation: controlled component system + AI scope clarification

**Principle §2 amended.** The original "AI never writes HTML/CSS" was written when the only provider
was Claude Opus. The system now uses a provider-agnostic gatekeeper (Groq) + Layer 2 (DeepSeek) with
a `runToolCall` seam. The safety property remains identical — AI output is always validated through
`siteSchema.safeParse` and never rendered raw — but the wording now reflects reality: AI may produce
structured data, theme tokens, media references, and constrained patch operations, just never
executable/rendered tenant code. Provider diversity does not weaken the contract; the Zod gate is the
single invariant.

**Principle §3 amended.** "Fixed component set" → "Controlled component system." The block library
can grow intentionally (new types + variants, each with schema tests and AI prompt updates), but
every addition follows the registry pattern. Profession kits and integrations form a controlled
vocabulary that maps back to the fixed block set. This makes the product richer without opening the
door to arbitrary layout or per-tenant code.

**Non-goals updated.** Removed the "3 presets at launch" and "single-niche GTM" constraints (they
were launch-phase guardrails, now outdated). Clarified the "WordPress clone" line: we reject
plugin/arbitrary-code clones, but WordPress-like ownership ease and "AI WordPress for professionals"
positioning are acceptable. Added explicit non-goals for per-tenant executable code and unmanaged
domain registration.

**Reason:** The project has moved beyond MVP. M0–M6, V2.0, V2.2, and beta launch are all done.
The constitution must describe the product we have now and the product we're building next, not the
product we promised not to over-build in July 2026. Every safety property (Zod gate, no raw tenant
code, no plugins, payment-before-domain) remains intact.

Logged in `PROGRESS.md` same date.

## Amending this constitution

Principles change only by an explicit, logged decision in `docs/PROGRESS.md` that names the principle and
the reason. Don't silently drift.
