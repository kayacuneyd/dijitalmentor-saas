# Progress — Dijital Mentor

Running memory of the project. **Update after every task** so any fresh AI session knows exactly what is
done and *why*. This file is the antidote to forgetting completed steps.

## How to use this file
- Add a **Task log** row when you finish a task (newest at top).
- Record every non-obvious **decision** with its reason (constitution principle §6).
- Record every bug in the **Error log** using the debug loop from `CONVENTIONS.md`.

## Current milestone
**Pre-M0** — governance layer laid down. Next: **M0** (scaffold SvelteKit + Tailwind + DaisyUI + Drizzle,
write the Zod `Site` schema, hand-author a seed Site per niche).

## Task log
| Date | Milestone | Task | Status | Key decisions / notes |
|------|-----------|------|--------|-----------------------|
| 2026-07-06 | Pre-M0 | Governance layer created | ✅ done | Created `CLAUDE.md`, `AGENTS.md`, `docs/{CONSTITUTION,PLAN,PROGRESS,CONVENTIONS}.md`. Lean-core process, English, Claude Code + cross-tool (`AGENTS.md`). No hooks/slash-commands yet. |

## Decisions log
- **2026-07-06 — Preview via iframe + live `postMessage`.** Rendering the tenant site in an isolated
  iframe avoids CSS/JS collisions with the editor; postMessage gives instant updates without reloads.
- **2026-07-06 — Single Zod schema as the contract.** One schema drives AI output, editor, and renderer;
  Claude tool-use + `safeParse` guarantee valid JSON → hallucination is structurally impossible.
- **2026-07-06 — Real domain registration deferred to M5.** Heaviest external dependency + irreversible
  cost; the first slice proves the value loop on a seed tenant with no domains/auth/billing.
- **2026-07-06 — 3 niche presets (law/psych/dental) + TR/EN/DE.** Presets are cheap data; GTM still
  focuses one niche (constitution non-goal).

## Error log
_None yet._

<!-- Template for an error entry:
### YYYY-MM-DD — <short title>
- **Incident:** what failed (with the exact error line).
- **Root cause:** the underlying reason (traced from the real log, not guessed).
- **Fix:** the minimal change made.
- **Prevention:** rule/test added so it can't recur.
-->
