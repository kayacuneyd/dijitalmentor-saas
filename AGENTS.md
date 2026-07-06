# AGENTS.md

Cross-tool entry point (Cursor, Windsurf, Aider, and any other AI coding tool).

This project's **canonical rules live in `CLAUDE.md` and `docs/`**. This file only points there so every
tool follows the same source of truth — do not duplicate rules here.

**Before editing anything:**
1. Read [`CLAUDE.md`](./CLAUDE.md) — product, stack, the 5 operating rules, non-goals.
2. Read [`docs/CONSTITUTION.md`](./docs/CONSTITUTION.md) — non-negotiable principles — and
   [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) — how to write code here.
3. Check [`docs/PLAN.md`](./docs/PLAN.md) for the current milestone.

**After each task:** append to [`docs/PROGRESS.md`](./docs/PROGRESS.md) (what changed, why, decisions,
any errors + their root cause).

Golden rule: **the AI fills the Zod `Site` schema — it never writes raw HTML/CSS**, and it stays inside
the fixed component set. When in doubt, re-read `docs/CONSTITUTION.md`.
